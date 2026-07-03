<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('disponibilites', function (Blueprint $table) {
            $table->date('date')->nullable()->after('psychologue_id');
            $table->string('titre')->nullable()->after('date');
            $table->enum('type', ['consultation', 'personnel'])->default('consultation')->after('titre');
            $table->integer('duree')->default(30)->after('heure_fin'); // durée en minutes
            $table->text('note')->nullable()->after('duree');
            $table->json('rappels')->nullable()->after('note'); // [5, 15, 30, 60, 1440]
            $table->boolean('notifier_admin')->default(false)->after('rappels');
        });
    }

    public function down(): void
    {
        Schema::table('disponibilites', function (Blueprint $table) {
            $table->dropColumn(['date', 'titre', 'type', 'duree', 'note', 'rappels', 'notifier_admin']);
        });
    }
};
