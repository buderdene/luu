<?php

namespace App\Services;

use App\Models\Lottery;
use App\Models\LotteryBank;
use App\Models\LotteryTicket;
use App\Models\Transaction;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StatementImportService
{
    /**
     * @return array{imported: int, tickets_created: int, skipped: int}
     */
    public function import(Lottery $lottery, UploadedFile $file): array
    {
        $spreadsheet = IOFactory::load($file->getRealPath());
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        if (count($rows) < 2) {
            return ['imported' => 0, 'tickets_created' => 0, 'skipped' => 0];
        }

        $headerRowIndex = $this->findHeaderRow($rows);
        $headers = array_map(fn ($h) => mb_strtolower(trim((string) $h)), $rows[$headerRowIndex]);
        $columnMap = $this->detectColumns($headers);

        $imported = 0;
        $ticketsCreated = 0;
        $skipped = 0;

        DB::transaction(function () use ($rows, $headerRowIndex, $columnMap, $lottery, &$imported, &$ticketsCreated, &$skipped) {
            $nextTicketNumber = ($lottery->tickets()->max('ticket_number') ?? 0) + 1;

            for ($i = $headerRowIndex + 1; $i < count($rows); $i++) {
                $row = $rows[$i];

                // Skip summary/empty rows
                $firstCell = mb_strtolower(trim((string) ($row[0] ?? '')));
                if ($firstCell === '' || str_contains($firstCell, 'нийт дүн') || str_contains($firstCell, 'total')) {
                    continue;
                }

                $amount = $this->parseAmount($row[$columnMap['credit']] ?? null);

                if ($amount <= 0) {
                    $skipped++;

                    continue;
                }

                $description = trim((string) ($row[$columnMap['description']] ?? ''));
                $reference = trim((string) ($row[$columnMap['reference']] ?? 'ROW-'.$i.'-'.md5(implode('|', array_map('strval', $row)))));
                $date = $this->parseDate($row[$columnMap['date']] ?? null);

                // Search for phone in all columns, not just description
                $phone = $this->extractPhoneFromRow($row);

                if (! $phone) {
                    $skipped++;

                    continue;
                }

                if (Transaction::where('bank_reference', $reference)->exists()) {
                    $skipped++;

                    continue;
                }

                $transaction = Transaction::create([
                    'lottery_id' => $lottery->id,
                    'bank_reference' => $reference,
                    'phone' => $phone,
                    'amount' => $amount,
                    'description' => $description,
                    'transacted_at' => $date ?? now(),
                ]);

                $ticketCount = intdiv((int) $amount, $lottery->price_per_ticket);
                $remainder = (int) $amount % $lottery->price_per_ticket;

                for ($t = 0; $t < $ticketCount; $t++) {
                    $bankEntry = LotteryBank::create([
                        'lottery_id' => $lottery->id,
                        'transaction_id' => $transaction->id,
                        'phone' => $phone,
                        'amount' => $lottery->price_per_ticket,
                        'ticket_number' => $nextTicketNumber,
                    ]);

                    LotteryTicket::create([
                        'lottery_id' => $lottery->id,
                        'transaction_id' => $transaction->id,
                        'ticket_number' => $nextTicketNumber++,
                        'phone' => $phone,
                    ]);
                    $ticketsCreated++;
                }

                // Record remainder as a bank entry without ticket
                if ($remainder > 0) {
                    LotteryBank::create([
                        'lottery_id' => $lottery->id,
                        'transaction_id' => $transaction->id,
                        'phone' => $phone,
                        'amount' => $remainder,
                        'ticket_number' => null,
                    ]);
                }

                $imported++;
            }

            // Combine remainder bank entries across transactions for the same phone
            $ticketsFromRemainders = $this->combineRemainders($lottery, $nextTicketNumber);
            $ticketsCreated += $ticketsFromRemainders;

            $lottery->increment('sold_tickets', $ticketsCreated);
        });

        return ['imported' => $imported, 'tickets_created' => $ticketsCreated, 'skipped' => $skipped];
    }

    /**
     * Combine unassigned remainder bank entries for the same phone to create additional tickets.
     */
    private function combineRemainders(Lottery $lottery, int &$nextTicketNumber): int
    {
        $ticketsCreated = 0;

        // Group unassigned bank entries by phone
        $phoneGroups = LotteryBank::where('lottery_id', $lottery->id)
            ->whereNull('ticket_number')
            ->orderBy('id')
            ->get()
            ->groupBy('phone');

        foreach ($phoneGroups as $phone => $entries) {
            $total = $entries->sum('amount');

            while ($total >= $lottery->price_per_ticket) {
                // Assign ticket to enough entries to cover price
                $accumulated = 0;
                $firstTransaction = null;

                foreach ($entries as $entry) {
                    if ($entry->ticket_number !== null) {
                        continue; // already assigned in this loop
                    }

                    $entry->update(['ticket_number' => $nextTicketNumber]);
                    $accumulated += $entry->amount;
                    $firstTransaction ??= $entry->transaction_id;

                    if ($accumulated >= $lottery->price_per_ticket) {
                        break;
                    }
                }

                LotteryTicket::create([
                    'lottery_id' => $lottery->id,
                    'transaction_id' => $firstTransaction,
                    'ticket_number' => $nextTicketNumber++,
                    'phone' => $phone,
                ]);

                $ticketsCreated++;
                $total -= $lottery->price_per_ticket;
            }
        }

        return $ticketsCreated;
    }

    /**
     * @param  array<int, string>  $headers
     * @return array{date: int, description: int, credit: int, reference: int}
     */
    private function detectColumns(array $headers): array
    {
        $map = ['date' => 0, 'description' => 1, 'credit' => 3, 'reference' => 0];

        foreach ($headers as $index => $header) {
            if (str_contains($header, 'огноо') || str_contains($header, 'date')) {
                $map['date'] = $index;
            }
            if (str_contains($header, 'гүйлгээний утга') || str_contains($header, 'description') || str_contains($header, 'утга')) {
                $map['description'] = $index;
            }
            if (str_contains($header, 'орлого') || str_contains($header, 'credit') || str_contains($header, 'кредит')) {
                $map['credit'] = $index;
            }
            if (str_contains($header, 'лавлах') || str_contains($header, 'reference') || str_contains($header, 'ref')) {
                $map['reference'] = $index;
            }
        }

        return $map;
    }

    /**
     * Find the header row by scanning for a row containing 'огноо'.
     *
     * @param  array<int, array<int, mixed>>  $rows
     */
    private function findHeaderRow(array $rows): int
    {
        foreach ($rows as $index => $row) {
            $joined = mb_strtolower(implode(' ', array_map(fn ($c) => trim((string) $c), $row)));
            if (str_contains($joined, 'гүйлгээний огноо') || (str_contains($joined, 'огноо') && str_contains($joined, 'кредит'))) {
                return $index;
            }
        }

        return 0;
    }

    private function parseAmount(mixed $value): int
    {
        if ($value === null || $value === '') {
            return 0;
        }

        $cleaned = preg_replace('/[^0-9.]/', '', (string) $value);

        return (int) round((float) $cleaned);
    }

    private function parseDate(mixed $value): ?\DateTimeInterface
    {
        if ($value === null || $value === '') {
            return null;
        }

        try {
            return new \DateTimeImmutable((string) $value);
        } catch (\Exception) {
            return null;
        }
    }

    private function extractPhone(string $description): ?string
    {
        if (preg_match('/\b(8[0-9]{7}|9[0-9]{7}|7[0-9]{7}|6[0-9]{7})\b/', $description, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Search all columns in a row for a Mongolian phone number (8 digits starting with 6-9).
     *
     * @param  array<int, mixed>  $row
     */
    private function extractPhoneFromRow(array $row): ?string
    {
        foreach ($row as $cell) {
            $value = trim((string) $cell);
            if ($value === '') {
                continue;
            }
            $phone = $this->extractPhone($value);
            if ($phone) {
                return $phone;
            }
        }

        return null;
    }
}
