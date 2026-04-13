<?php

namespace Database\Factories;

use App\Models\Lottery;
use App\Models\LotteryTicket;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LotteryTicket>
 */
class LotteryTicketFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lottery_id' => Lottery::factory(),
            'transaction_id' => Transaction::factory(),
            'ticket_number' => fake()->unique()->numberBetween(1, 99999),
            'phone' => '9'.fake()->numerify('#######'),
        ];
    }
}
