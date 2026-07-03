<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'psychologue', 'etudiant'])->default('etudiant')->after('email');
            $table->enum('statut', ['actif', 'en_attente', 'suspendu', 'inactif'])->default('en_attente')->after('role');
            $table->string('telephone')->nullable()->after('email');
            $table->string('photo')->nullable()->after('telephone');
            $table->timestamp('email_verified_at')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'statut', 'telephone', 'photo']);
        });
    }
};
