<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('psychologues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('numero_ordre')->unique()->nullable(); // Numéro d'ordre professionnel
            $table->json('specialites')->nullable(); // ["anxiété", "dépression", "stress académique"]
            $table->text('bio')->nullable();
            $table->integer('annees_experience')->default(0);
            $table->string('diplome')->nullable();
            $table->string('etablissement')->nullable();
            $table->boolean('disponible')->default(true); // Disponible en ce moment
            $table->boolean('urgence')->default(false); // Accepte les urgences
            $table->decimal('note_moyenne', 3, 2)->default(0); // Note sur 5
            $table->integer('total_consultations')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('psychologues');
    }
};
