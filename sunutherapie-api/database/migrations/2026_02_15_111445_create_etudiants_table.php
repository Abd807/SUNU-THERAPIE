<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etudiants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('numero_etudiant')->unique()->nullable();
            $table->string('universite')->nullable();
            $table->string('faculte')->nullable();
            $table->string('niveau')->nullable(); // L1, L2, L3, M1, M2, Doctorat
            $table->date('date_naissance')->nullable();
            $table->enum('genre', ['masculin', 'feminin', 'autre', 'non_specifie'])->nullable();
            $table->string('ville')->nullable();
            $table->integer('total_consultations')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etudiants');
    }
};
