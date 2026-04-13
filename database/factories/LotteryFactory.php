<?php

namespace Database\Factories;

use App\Models\Lottery;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Lottery>
 */
class LotteryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->sentence(3);

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->randomNumber(4),
            'image' => null,
            'price_per_ticket' => 15000,
            'total_tickets' => fake()->numberBetween(1000, 10000),
            'sold_tickets' => 0,
            'starts_at' => now()->addDays(fake()->numberBetween(1, 30)),
            'draws_at' => now()->addDays(fake()->numberBetween(31, 60)),
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'starts_at' => now()->subDays(5),
            'draws_at' => now()->addDays(30),
        ]);
    }

    public function finished(): static
    {
        return $this->state(fn () => [
            'starts_at' => now()->subDays(60),
            'draws_at' => now()->subDays(1),
        ]);
    }
}
