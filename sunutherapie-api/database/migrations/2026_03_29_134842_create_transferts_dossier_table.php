<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transferts_dossier', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained('etudiants')->onDelete('cascade');
            $table->foreignId('ancien_psy_id')->constrained('psychologues')->onDelete('cascade');
            $table->foreignId('nouveau_psy_id')->constrained('psychologues')->onDelete('cascade');
            $table->foreignId('demande_par')->constrained('users')->onDelete('cascade');
            $table->enum('statut', [
                'en_attente',
                'approuve',
                'refuse'
            ])->default('en_attente');
            $table->enum('raison', [
                'psy_indisponible',
                'demande_etudiant',
                'decision_admin',
                'transfert_psy'
            ]);
            $table->text('motif')->nullable();
            $table->timestamp('approuve_le')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transferts_dossier');
    }
};
