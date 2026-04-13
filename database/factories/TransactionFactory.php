<?php

namespace Database\Factories;

use App\Models\Lottery;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lottery_id' => Lottery::factory(),
            'bank_reference' => fake()->unique()->uuid(),
            'phone' => '9'.fake()->numerify('#######'),
            'amount' => 15000,
            'description' => fake()->sentence(),
            'transacted_at' => now(),
        ];
    }
}
