<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bibliotheque', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->string('auteur')->nullable();
            $table->enum('type', ['livre', 'video'])->default('livre');
            $table->string('categorie')->default('autre');
            $table->text('description')->nullable();
            $table->string('url')->nullable();            // lien vidéo (YouTube/URL) ou lien externe
            $table->string('fichier_path')->nullable();   // PDF du livre (upload)
            $table->string('couverture_path')->nullable();// image de couverture (upload)
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bibliotheque');
    }
};
