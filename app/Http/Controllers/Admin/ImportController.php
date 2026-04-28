<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lottery;
use App\Models\LotteryBank;
use App\Models\LotteryTicket;
use App\Models\Transaction;
use App\Services\StatementImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ImportController extends Controller
{
    public function show(Request $request, Lottery $lottery): Response
    {
        $lottery->loadCount('tickets');

        $search = $request->string('search')->trim()->value();
        $status = $request->string('status')->trim()->value();

        $totalAmount = $lottery->transactions()->sum('amount');
        $excludedCount = $lottery->bankEntries()->where('is_excluded', true)->count();
        $activeCount = $lottery->bankEntries()->where('is_excluded', false)->count();
        $transactionsCount = $lottery->transactions()->count();

        $recentTransactions = $lottery->transactions()
            ->when($search, fn ($q) => $q->where('phone', 'like', "%{$search}%")
                ->orWhere('bank_reference', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%"))
            ->when($status === 'excluded', fn ($q) => $q->where('is_excluded', true))
            ->when($status === 'active', fn ($q) => $q->where('is_excluded', false))
            ->latest()
            ->paginate(20, ['id', 'bank_reference', 'phone', 'amount', 'description', 'transacted_at', 'is_excluded'], 'transactions_page')
            ->withQueryString();

        return Inertia::render('admin/lotteries/import', [
            'lottery' => [
                'id' => $lottery->id,
                'name' => $lottery->name,
                'total_tickets' => $lottery->total_tickets,
                'sold_tickets' => $lottery->sold_tickets,
                'tickets_count' => $lottery->tickets_count,
                'price_per_ticket' => $lottery->price_per_ticket,
                'total_amount' => $totalAmount,
                'excluded_count' => $excludedCount,
                'active_count' => $activeCount,
                'transactions_count' => $transactionsCount,
            ],
            'recentTransactions' => $recentTransactions,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function bankIndex(Request $request, Lottery $lottery): Response
    {
        $search = $request->string('search')->trim()->value();
        $status = $request->string('status')->trim()->value();

        $bankEntries = $lottery->bankEntries()
            ->with('transaction:id,bank_reference,description,transacted_at')
            ->when($search, fn ($q) => $q->where('phone', 'like', "%{$search}%")
                ->orWhere('ticket_number', $search)
                ->orWhereHas('transaction', fn ($q) => $q->where('bank_reference', 'like', "%{$search}%")))
            ->when($status === 'excluded', fn ($q) => $q->where('is_excluded', true))
            ->when($status === 'active', fn ($q) => $q->where('is_excluded', false))
            ->orderBy('ticket_number')
            ->paginate(100, ['id', 'lottery_id', 'transaction_id', 'phone', 'amount', 'ticket_number', 'is_excluded', 'created_at'], 'page')
            ->withQueryString();

        return Inertia::render('admin/lotteries/bank', [
            'lottery' => [
                'id' => $lottery->id,
                'name' => $lottery->name,
                'price_per_ticket' => $lottery->price_per_ticket,
            ],
            'bankEntries' => $bankEntries,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function ticketsIndex(Request $request, Lottery $lottery): Response
    {
        $lottery->loadCount('tickets');

        $search = $request->string('search')->trim()->value();

        $tickets = $lottery->tickets()
            ->when($search, fn ($q) => $q->where('phone', 'like', "%{$search}%")
                ->orWhere('ticket_number', $search))
            ->orderBy('ticket_number')
            ->paginate(100, ['id', 'ticket_number', 'phone', 'created_at'], 'page')
            ->withQueryString();

        return Inertia::render('admin/lotteries/tickets', [
            'lottery' => [
                'id' => $lottery->id,
                'name' => $lottery->name,
                'tickets_count' => $lottery->tickets_count,
            ],
            'tickets' => $tickets,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request, Lottery $lottery, StatementImportService $service): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        $result = $service->import($lottery, $request->file('file'));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$result['imported']} гүйлгээ импорт хийгдлээ. {$result['tickets_created']} сугалаа үүслээ. {$result['skipped']} алгаслаа.",
        ]);

        return back();
    }

    public function destroy(Lottery $lottery): RedirectResponse
    {
        $lottery->tickets()->delete();
        $lottery->bankEntries()->delete();
        $lottery->transactions()->delete();
        $lottery->update(['sold_tickets' => 0]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Бүх гүйлгээ, сугалаа, банкны бүртгэл арилгагдлаа.',
        ]);

        return back();
    }

    public function toggleExclude(Lottery $lottery, LotteryBank $lotteryBank): RedirectResponse
    {
        $excluding = ! $lotteryBank->is_excluded;

        if ($excluding) {
            // Remove associated tickets for this bank entry's transaction + phone
            $ticketNumbers = LotteryBank::where('lottery_id', $lottery->id)
                ->where('transaction_id', $lotteryBank->transaction_id)
                ->where('phone', $lotteryBank->phone)
                ->whereNotNull('ticket_number')
                ->pluck('ticket_number');

            if ($ticketNumbers->isNotEmpty()) {
                LotteryTicket::where('lottery_id', $lottery->id)
                    ->whereIn('ticket_number', $ticketNumbers)
                    ->delete();

                $lottery->decrement('sold_tickets', $ticketNumbers->count());
            }

            // Mark all bank entries for same transaction+phone as excluded
            LotteryBank::where('lottery_id', $lottery->id)
                ->where('transaction_id', $lotteryBank->transaction_id)
                ->where('phone', $lotteryBank->phone)
                ->update(['is_excluded' => true, 'ticket_number' => null]);
        } else {
            // Restore: un-exclude all bank entries for same transaction+phone
            LotteryBank::where('lottery_id', $lottery->id)
                ->where('transaction_id', $lotteryBank->transaction_id)
                ->where('phone', $lotteryBank->phone)
                ->update(['is_excluded' => false]);

            // Re-create tickets
            $entries = LotteryBank::where('lottery_id', $lottery->id)
                ->where('transaction_id', $lotteryBank->transaction_id)
                ->where('phone', $lotteryBank->phone)
                ->orderBy('id')
                ->get();

            $nextTicketNumber = ($lottery->tickets()->max('ticket_number') ?? 0) + 1;
            $totalAmount = $entries->sum('amount');
            $ticketCount = intdiv($totalAmount, $lottery->price_per_ticket);

            $ticketsCreated = 0;
            foreach ($entries as $entry) {
                if ($ticketsCreated >= $ticketCount) {
                    break;
                }
                $entry->update(['ticket_number' => $nextTicketNumber]);
                LotteryTicket::create([
                    'lottery_id' => $lottery->id,
                    'transaction_id' => $lotteryBank->transaction_id,
                    'ticket_number' => $nextTicketNumber++,
                    'phone' => $lotteryBank->phone,
                ]);
                $ticketsCreated++;
            }

            if ($ticketsCreated > 0) {
                $lottery->increment('sold_tickets', $ticketsCreated);
            }
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $excluding ? 'Сугалаа биш гэж тэмдэглэлээ.' : 'Сугалаа сэргээлээ.',
        ]);

        return back();
    }

    public function toggleTransactionExclude(Lottery $lottery, Transaction $transaction): RedirectResponse
    {
        $excluding = ! $transaction->is_excluded;

        if ($excluding) {
            // Remove associated tickets for all bank entries of this transaction
            $ticketNumbers = LotteryBank::where('lottery_id', $lottery->id)
                ->where('transaction_id', $transaction->id)
                ->whereNotNull('ticket_number')
                ->pluck('ticket_number');

            if ($ticketNumbers->isNotEmpty()) {
                LotteryTicket::where('lottery_id', $lottery->id)
                    ->whereIn('ticket_number', $ticketNumbers)
                    ->delete();

                $lottery->decrement('sold_tickets', $ticketNumbers->count());
            }

            // Mark all bank entries for this transaction as excluded
            LotteryBank::where('lottery_id', $lottery->id)
                ->where('transaction_id', $transaction->id)
                ->update(['is_excluded' => true, 'ticket_number' => null]);

            $transaction->update(['is_excluded' => true]);
        } else {
            // Restore: un-exclude all bank entries for this transaction
            LotteryBank::where('lottery_id', $lottery->id)
                ->where('transaction_id', $transaction->id)
                ->update(['is_excluded' => false]);

            $transaction->update(['is_excluded' => false]);

            // Re-create tickets
            $entries = LotteryBank::where('lottery_id', $lottery->id)
                ->where('transaction_id', $transaction->id)
                ->orderBy('id')
                ->get();

            $nextTicketNumber = ($lottery->tickets()->max('ticket_number') ?? 0) + 1;
            $totalAmount = $entries->sum('amount');
            $ticketCount = intdiv($totalAmount, $lottery->price_per_ticket);

            $ticketsCreated = 0;
            foreach ($entries as $entry) {
                if ($ticketsCreated >= $ticketCount) {
                    break;
                }
                $entry->update(['ticket_number' => $nextTicketNumber]);
                LotteryTicket::create([
                    'lottery_id' => $lottery->id,
                    'transaction_id' => $transaction->id,
                    'ticket_number' => $nextTicketNumber++,
                    'phone' => $transaction->phone,
                ]);
                $ticketsCreated++;
            }

            if ($ticketsCreated > 0) {
                $lottery->increment('sold_tickets', $ticketsCreated);
            }
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $excluding ? 'Гүйлгээ цуцлагдлаа.' : 'Гүйлгээ сэргээгдлээ.',
        ]);

        return back();
    }
}
