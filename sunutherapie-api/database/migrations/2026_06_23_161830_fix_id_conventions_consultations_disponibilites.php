<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Normalisation des identifiants vers les ids de PROFILS (etudiants / psychologues).
 *
 * Avant :
 *   - consultations.etudiant_id     contenait un id de `users`        (FK -> users)
 *   - consultations.psychologue_id  contenait un id de `psychologues` (FK -> users  ❌)
 *   - disponibilites.psychologue_id contenait un id de `psychologues` (FK -> users  ❌)
 *
 * Après :
 *   - consultations.etudiant_id     -> id de `etudiants`     (données converties + FK)
 *   - consultations.psychologue_id  -> id de `psychologues`  (FK corrigée, données déjà OK)
 *   - disponibilites.psychologue_id -> id de `psychologues`  (FK corrigée, données déjà OK)
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Conversion des données : consultations.etudiant_id (users.id -> etudiants.id)
        // Boucle PHP volontaire pour rester compatible MySQL ET SQLite.
        Schema::disableForeignKeyConstraints();

        foreach (DB::table('consultations')->select('id', 'etudiant_id')->get() as $c) {
            $etudiantId = DB::table('etudiants')->where('user_id', $c->etudiant_id)->value('id');
            if ($etudiantId && (int) $etudiantId !== (int) $c->etudiant_id) {
                DB::table('consultations')->where('id', $c->id)->update(['etudiant_id' => $etudiantId]);
            }
        }

        Schema::enableForeignKeyConstraints();

        // ── 2. Re-pointage des clés étrangères
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropForeign(['etudiant_id']);
            $table->dropForeign(['psychologue_id']);
            $table->foreign('etudiant_id')->references('id')->on('etudiants')->cascadeOnDelete();
            $table->foreign('psychologue_id')->references('id')->on('psychologues')->cascadeOnDelete();
        });

        Schema::table('disponibilites', function (Blueprint $table) {
            $table->dropForeign(['psychologue_id']);
            $table->foreign('psychologue_id')->references('id')->on('psychologues')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('disponibilites', function (Blueprint $table) {
            $table->dropForeign(['psychologue_id']);
            $table->foreign('psychologue_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('consultations', function (Blueprint $table) {
            $table->dropForeign(['etudiant_id']);
            $table->dropForeign(['psychologue_id']);
            $table->foreign('psychologue_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::disableForeignKeyConstraints();

        foreach (DB::table('consultations')->select('id', 'etudiant_id')->get() as $c) {
            $userId = DB::table('etudiants')->where('id', $c->etudiant_id)->value('user_id');
            if ($userId && (int) $userId !== (int) $c->etudiant_id) {
                DB::table('consultations')->where('id', $c->id)->update(['etudiant_id' => $userId]);
            }
        }

        Schema::enableForeignKeyConstraints();

        Schema::table('consultations', function (Blueprint $table) {
            $table->foreign('etudiant_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
