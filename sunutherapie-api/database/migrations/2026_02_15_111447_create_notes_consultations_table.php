<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes_consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained()->onDelete('cascade');
            $table->foreignId('psychologue_id')->constrained('users')->onDelete('cascade');
            $table->text('notes_privees')->nullable(); // Visible uniquement par le psy
            $table->text('recommandations')->nullable(); // Peut être partagé avec l'étudiant
            $table->json('tags')->nullable(); // ["anxiété", "stress", "sommeil"]
            $table->boolean('suivi_recommande')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes_consultations');
    }
};
