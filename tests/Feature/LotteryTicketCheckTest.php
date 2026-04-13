<?php

use App\Models\Lottery;
use App\Models\LotteryTicket;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('can check tickets by phone number', function () {
    $lottery = Lottery::factory()->active()->create();
    $transaction = Transaction::factory()->recycle($lottery)->create(['phone' => '91888828']);

    LotteryTicket::factory()->recycle($lottery)->recycle($transaction)->create([
        'phone' => '91888828',
        'ticket_number' => 1,
    ]);
    LotteryTicket::factory()->recycle($lottery)->recycle($transaction)->create([
        'phone' => '91888828',
        'ticket_number' => 2,
    ]);

    $response = $this->postJson("/lotteries/{$lottery->id}/check", [
        'phone' => '91888828',
    ]);

    $response->assertSuccessful();
    $response->assertJson([
        'count' => 2,
    ]);
});

test('check tickets returns empty when no tickets found', function () {
    $lottery = Lottery::factory()->active()->create();

    $response = $this->postJson("/lotteries/{$lottery->id}/check", [
        'phone' => '91888828',
    ]);

    $response->assertSuccessful();
    $response->assertJson([
        'tickets' => [],
        'count' => 0,
    ]);
});

test('check tickets validates phone format', function () {
    $lottery = Lottery::factory()->active()->create();

    $response = $this->postJson("/lotteries/{$lottery->id}/check", [
        'phone' => '1234',
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('phone');
});
