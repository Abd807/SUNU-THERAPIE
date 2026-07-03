<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransfertDossier;
use App\Models\Etudiant;
use App\Models\Psychologue;
use Illuminate\Http\Request;

class TransfertDossierController extends Controller
{
    // Demander un transfert
    public function store(Request $request)
    {
        $request->validate([
            'etudiant_id' => 'required|exists:etudiants,id',
            'nouveau_psy_id' => 'required|exists:psychologues,id',
            'raison' => 'required|in:psy_indisponible,demande_etudiant,decision_admin,transfert_psy',
            'motif' => 'nullable|string|max:500',
        ]);

        try {
            $etudiant = Etudiant::findOrFail($request->etudiant_id);

            if (!$etudiant->psy_referent_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cet étudiant n\'a pas de psy référent'
                ], 400);
            }

            // Vérifier qu'il n'y a pas déjà un transfert en attente
            $transfertExistant = TransfertDossier::where('etudiant_id', $request->etudiant_id)
                ->where('statut', 'en_attente')
                ->exists();

            if ($transfertExistant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Un transfert est déjà en attente pour cet étudiant'
                ], 400);
            }

            $transfert = TransfertDossier::create([
                'etudiant_id' => $request->etudiant_id,
                'ancien_psy_id' => $etudiant->psy_referent_id,
                'nouveau_psy_id' => $request->nouveau_psy_id,
                'demande_par' => $request->user()->id,
                'raison' => $request->raison,
                'motif' => $request->motif,
                'statut' => 'en_attente',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Demande de transfert créée',
                'transfert' => $transfert->load(['etudiant', 'ancienPsy.user', 'nouveauPsy.user'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Approuver un transfert (psy ou admin)
    public function approuver(Request $request, $id)
    {
        try {
            $transfert = TransfertDossier::findOrFail($id);

            if ($transfert->statut !== 'en_attente') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce transfert a déjà été traité'
                ], 400);
            }

            // Mettre à jour le psy référent de l'étudiant
            $etudiant = Etudiant::findOrFail($transfert->etudiant_id);
            $etudiant->update([
                'psy_referent_id' => $transfert->nouveau_psy_id,
                'psy_referent_depuis' => now(),
            ]);

            $transfert->update([
                'statut' => 'approuve',
                'approuve_le' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transfert approuvé — dossier transféré au nouveau psychothérapeute',
                'transfert' => $transfert->load(['etudiant', 'ancienPsy.user', 'nouveauPsy.user'])
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Refuser un transfert
    public function refuser(Request $request, $id)
    {
        $request->validate([
            'motif' => 'required|string|max:500',
        ]);

        try {
            $transfert = TransfertDossier::findOrFail($id);

            $transfert->update([
                'statut' => 'refuse',
                'motif' => $request->motif,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transfert refusé',
                'transfert' => $transfert
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Liste des transferts (admin)
    public function index(Request $request)
    {
        try {
            $transferts = TransfertDossier::with([
                'etudiant.user',
                'ancienPsy.user',
                'nouveauPsy.user',
                'demandePar'
            ])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'transferts' => $transferts
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
