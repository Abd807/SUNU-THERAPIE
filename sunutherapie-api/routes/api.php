<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PsychologueController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\DisponibiliteController;
use App\Http\Controllers\Api\VideoCallController;
use App\Http\Controllers\Api\RessourceController;
use App\Http\Controllers\Api\SponsorController;
use App\Http\Controllers\Api\TransfertDossierController;
use App\Http\Controllers\Api\NotePsyController;
use App\Http\Controllers\Api\ForumController;


// ─── Routes publiques ────────────────────────────────────────
Route::post('/register', [AuthController::class, 'registerEtudiant']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
Route::get('/sponsors', [SponsorController::class, 'index']);
Route::get('/sponsors/{id}', [SponsorController::class, 'show']);

// ─── Routes protégées ────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    // ─── Assistant IA (orientation étudiant) ───
    Route::post('/assistant/chat', [\App\Http\Controllers\Api\AssistantController::class, 'chat']);
    // ─── Psychothérapeutes ───
    Route::get('/psychotherapeutes', [PsychologueController::class, 'index']);
    Route::get('/psychotherapeutes/disponibles', [PsychologueController::class, 'disponibles']);
    Route::get('/psychotherapeutes/urgence', [PsychologueController::class, 'urgence']);
    Route::get('/psychotherapeutes/{id}', [PsychologueController::class, 'show']);

    // ─── Disponibilités (accessible à tous) ───
    Route::get('/disponibilites/jours', [DisponibiliteController::class, 'getJoursDisponibles']);
    Route::get('/disponibilites/creneaux', [DisponibiliteController::class, 'getCreneauxDisponibles']);
    Route::get('/psychotherapeutes/{psychologue_id}/disponibilites', [DisponibiliteController::class, 'index']);
    Route::get('/psychotherapeutes/{psychologue_id}/creneaux/{date}', [DisponibiliteController::class, 'creneauxDisponibles']);

    // ─── Disponibilités (Psychothérapeute uniquement) ───
    Route::middleware('check.role:psychologue')->group(function () {
        Route::get('/disponibilites/mes-disponibilites', [DisponibiliteController::class, 'mesDisponibilites']);
        Route::post('/disponibilites', [DisponibiliteController::class, 'store']);
        Route::put('/disponibilites/{id}/toggle', [DisponibiliteController::class, 'toggle']);
        Route::delete('/disponibilites/{id}', [DisponibiliteController::class, 'destroy']);
    });

    // ─── Consultations ───
    Route::post('/consultations', [ConsultationController::class, 'store']);
    Route::get('/consultations/historique/etudiant', [ConsultationController::class, 'historiqueEtudiant']);
    Route::get('/consultations/historique/psychotherapeute', [ConsultationController::class, 'historiquePsychologue']);
    Route::get('/consultations/demandes-en-attente', [ConsultationController::class, 'demandesEnAttente']);
    Route::get('/consultations/acceptees', [ConsultationController::class, 'consultationsAcceptees']);
    Route::put('/consultations/{id}/accepter', [ConsultationController::class, 'accepter']);
    Route::put('/consultations/{id}/refuser', [ConsultationController::class, 'refuser']);
    Route::put('/consultations/{id}/demarrer', [ConsultationController::class, 'demarrer']);
    Route::put('/consultations/{id}/terminer', [ConsultationController::class, 'terminer']);
    Route::post('/consultations/{id}/noter', [ConsultationController::class, 'noter']);

    // ─── Vidéo (Agora) ───
    Route::get('/consultations/{id}/video-token', [VideoCallController::class, 'generateToken']);

    // ─── Ressources ───
    Route::get('/ressources', [RessourceController::class, 'index']);
    Route::post('/ressources/{id}/lue', [RessourceController::class, 'marquerLue']);
    Route::middleware('check.role:psychologue')->group(function () {
        Route::get('/ressources/mes-ressources', [RessourceController::class, 'mesRessources']);
        Route::post('/ressources', [RessourceController::class, 'store']);
        Route::delete('/ressources/{id}', [RessourceController::class, 'destroy']);
    });

    // ─── Notes Psy ───
    Route::get('/notes/mes-notes', [NotePsyController::class, 'notesEtudiant']);
    Route::middleware('check.role:psychologue')->group(function () {
        Route::get('/notes', [NotePsyController::class, 'index']);
        Route::post('/notes', [NotePsyController::class, 'store']);
        Route::put('/notes/{id}', [NotePsyController::class, 'update']);
        Route::delete('/notes/{id}', [NotePsyController::class, 'destroy']);
        Route::post('/notes/structurer', [NotePsyController::class, 'structurer']);
        Route::get('/notes/dossier/{etudiant_id}/resume', [NotePsyController::class, 'resumerDossier']);
    });

    // ─── Forum ───
    Route::get('/forum', [ForumController::class, 'index']);
    Route::post('/forum', [ForumController::class, 'store']);
    Route::post('/forum/{id}/liker', [ForumController::class, 'liker']);
    Route::post('/forum/{id}/commenter', [ForumController::class, 'commenter']);
    Route::delete('/forum/{id}', [ForumController::class, 'destroy']);

    // ─── Transferts dossier ───
    Route::post('/transferts', [TransfertDossierController::class, 'store']);
    Route::put('/transferts/{id}/approuver', [TransfertDossierController::class, 'approuver']);
    Route::put('/transferts/{id}/refuser', [TransfertDossierController::class, 'refuser']);

    // ─── Admin uniquement ───
    Route::middleware('check.role:admin')->group(function () {
        Route::post('/psychotherapeutes', [PsychologueController::class, 'store']);
        Route::put('/psychotherapeutes/{id}/disponibilite', [PsychologueController::class, 'updateDisponibilite']);
        Route::get('/transferts', [TransfertDossierController::class, 'index']);
        Route::get('/dashboard/synthese', [\App\Http\Controllers\DashboardExportController::class, 'synthese']);
    });
});
