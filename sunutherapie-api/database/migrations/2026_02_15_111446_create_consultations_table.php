<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('psychologue_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['anonyme', 'directe', 'urgence', 'planifiee'])->default('planifiee');
            $table->enum('mode', ['audio', 'video', 'chat'])->default('video');
            $table->enum('statut', [
                'en_attente',      // Demande créée
                'acceptee',        // Psy a accepté
                'refusee',         // Psy a refusé
                'en_cours',        // Consultation en cours
                'terminee',        // Consultation terminée
                'annulee'          // Annulée par étudiant ou psy
            ])->default('en_attente');
            $table->datetime('date_consultation')->nullable();
            $table->datetime('date_debut')->nullable(); // Début réel
            $table->datetime('date_fin')->nullable();   // Fin réelle
            $table->integer('duree_minutes')->nullable(); // Durée réelle
            $table->text('motif_consultation')->nullable(); // Raison de la consultation
            $table->text('motif_refus')->nullable(); // Si refusée
            $table->boolean('anonyme_pour_psy')->default(false); // Psy ne voit pas l'identité
            $table->string('agora_channel_name')->nullable(); // Pour la vidéo
            $table->decimal('note_etudiant', 3, 2)->nullable(); // Note donnée par étudiant
            $table->text('commentaire_etudiant')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
