<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('lotteries', function (Blueprint $table) {
            $table->text('description')->nullable()->after('image');
            $table->string('bank_account')->nullable()->after('description');
            $table->string('bank_name')->nullable()->after('bank_account');
            $table->string('location')->nullable()->after('draws_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lotteries', function (Blueprint $table) {
            $table->dropColumn(['description', 'bank_account', 'bank_name', 'location']);
        });
    }
};
