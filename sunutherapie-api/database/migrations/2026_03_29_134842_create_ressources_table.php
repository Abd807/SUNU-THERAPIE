<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ressources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('psychologue_id')->constrained('psychologues')->onDelete('cascade');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->enum('type', [
                'lien_youtube',
                'lien_web',
                'video_upload',
                'pdf',
                'audio',
                'note'
            ]);
            $table->enum('categorie', [
                'anxiete',
                'depression',
                'stress',
                'sommeil',
                'confiance',
                'deuil',
                'autre'
            ])->default('autre');
            $table->string('url')->nullable();
            $table->string('fichier_path')->nullable();
            $table->enum('destinataires', [
                'un_patient',
                'plusieurs_patients',
                'tous_mes_patients'
            ])->default('tous_mes_patients');
            $table->integer('likes')->default(0);
            $table->boolean('actif')->default(false); // modération admin
            $table->boolean('public')->default(false); // visible par tous les étudiants
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ressources');
    }
};
