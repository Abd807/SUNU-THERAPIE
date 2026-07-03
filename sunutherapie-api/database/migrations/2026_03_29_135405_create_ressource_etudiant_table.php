<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ressource_etudiant', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ressource_id')
                ->constrained('ressources')
                ->onDelete('cascade');
            $table->foreignId('etudiant_id')
                ->constrained('etudiants')
                ->onDelete('cascade');
            $table->boolean('lu')->default(false);
            $table->timestamp('lu_le')->nullable();
            $table->timestamps();

            // Un étudiant ne peut recevoir la même ressource qu'une fois
            $table->unique(['ressource_id', 'etudiant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ressource_etudiant');
    }
};
