<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lottery;
use App\Services\StatementImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ImportController extends Controller
{
    public function show(Lottery $lottery): Response
    {
        $lottery->loadCount('tickets');

        $recentTickets = $lottery->tickets()
            ->latest()
            ->limit(50)
            ->get(['id', 'ticket_number', 'phone', 'created_at']);

        $recentTransactions = $lottery->transactions()
            ->latest()
            ->limit(20)
            ->get(['id', 'bank_reference', 'phone', 'amount', 'description', 'transacted_at']);

        $bankEntries = $lottery->bankEntries()
            ->with('transaction:id,bank_reference,description,transacted_at')
            ->latest()
            ->limit(50)
            ->get(['id', 'lottery_id', 'transaction_id', 'phone', 'amount', 'ticket_number', 'created_at']);

        return Inertia::render('admin/lotteries/import', [
            'lottery' => [
                'id' => $lottery->id,
                'name' => $lottery->name,
                'total_tickets' => $lottery->total_tickets,
                'sold_tickets' => $lottery->sold_tickets,
                'tickets_count' => $lottery->tickets_count,
                'price_per_ticket' => $lottery->price_per_ticket,
            ],
            'recentTickets' => $recentTickets,
            'recentTransactions' => $recentTransactions,
            'bankEntries' => $bankEntries,
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
}
