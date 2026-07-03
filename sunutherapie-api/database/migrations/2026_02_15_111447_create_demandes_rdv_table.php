<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes_rdv', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained()->onDelete('cascade');
            $table->datetime('date_proposee_1')->nullable();
            $table->datetime('date_proposee_2')->nullable();
            $table->datetime('date_proposee_3')->nullable();
            $table->text('message_etudiant')->nullable();
            $table->text('message_psychologue')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes_rdv');
    }
};
