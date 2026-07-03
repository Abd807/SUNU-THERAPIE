<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->foreignId('psy_referent_id')
                ->nullable()
                ->after('user_id')
                ->constrained('psychologues')
                ->nullOnDelete();
            $table->timestamp('psy_referent_depuis')->nullable()->after('psy_referent_id');
        });
    }

    public function down(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->dropForeign(['psy_referent_id']);
            $table->dropColumn(['psy_referent_id', 'psy_referent_depuis']);
        });
    }
};
