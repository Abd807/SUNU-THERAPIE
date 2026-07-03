<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('disponibilites', function (Blueprint $table) {
            // Supprimer l'ancienne foreign key
            $table->dropForeign(['psychologue_id']);
            
            // Recréer avec la bonne référence
            $table->foreign('psychologue_id')
                  ->references('id')
                  ->on('psychologues')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('disponibilites', function (Blueprint $table) {
            $table->dropForeign(['psychologue_id']);
            $table->foreign('psychologue_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }
};
