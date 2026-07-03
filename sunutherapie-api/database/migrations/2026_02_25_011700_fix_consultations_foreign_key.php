<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropForeign(['psychologue_id']);
            $table->foreign('psychologue_id')
                  ->references('id')
                  ->on('psychologues')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropForeign(['psychologue_id']);
            $table->foreign('psychologue_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }
};
