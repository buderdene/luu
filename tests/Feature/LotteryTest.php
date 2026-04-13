<?php

use App\Models\Lottery;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('lottery index page displays lotteries', function () {
    Lottery::factory()->active()->create(['name' => 'Test Lottery']);

    $response = $this->get('/');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('lotteries/index')
        ->has('lotteries', 1)
        ->where('lotteries.0.name', 'Test Lottery')
    );
});

test('lottery show page displays lottery details', function () {
    $lottery = Lottery::factory()->active()->create(['name' => 'Detail Lottery']);

    $response = $this->get("/lotteries/{$lottery->id}");

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('lotteries/show')
        ->where('lottery.name', 'Detail Lottery')
    );
});

test('admin lottery index requires authentication', function () {
    $response = $this->get('/admin/lotteries');

    $response->assertRedirect('/login');
});

test('admin can view lottery list', function () {
    $user = User::factory()->create();
    Lottery::factory()->count(3)->create();

    $response = $this->actingAs($user)->get('/admin/lotteries');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/lotteries/index')
        ->has('lotteries', 3)
    );
});

test('admin can create a lottery', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/admin/lotteries', [
        'name' => 'Шинэ Сугалаа',
        'price_per_ticket' => 15000,
        'total_tickets' => 10000,
        'starts_at' => now()->addDay()->format('Y-m-d H:i:s'),
        'draws_at' => now()->addMonth()->format('Y-m-d H:i:s'),
    ]);

    $response->assertRedirect('/admin/lotteries');
    expect(Lottery::where('name', 'Шинэ Сугалаа')->exists())->toBeTrue();
});

test('lottery completion percentage is calculated correctly', function () {
    $lottery = Lottery::factory()->create([
        'total_tickets' => 100,
        'sold_tickets' => 50,
    ]);

    expect($lottery->completionPercentage())->toBe(50);
});
