<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes_psy', function (Blueprint $table) {
            $table->id();
            $table->foreignId('psychologue_id')->constrained('psychologues')->onDelete('cascade');
            $table->foreignId('etudiant_id')->nullable()->constrained('etudiants')->onDelete('cascade');
            $table->foreignId('consultation_id')->nullable()->constrained('consultations')->onDelete('set null');
            $table->string('titre');
            $table->text('contenu');
            $table->enum('type', ['consultation', 'privee', 'partagee', 'urgence'])->default('privee');
            $table->boolean('partagee_avec_etudiant')->default(false);
            $table->timestamp('partagee_le')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes_psy');
    }
};
