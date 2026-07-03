<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ressource;
use App\Models\Psychologue;
use App\Models\Etudiant;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RessourceController extends Controller
{
    // Liste des ressources (pour étudiants)
    public function index(Request $request)
    {
        try {
            $etudiant = Etudiant::where('user_id', $request->user()->id)->first();

            if (!$etudiant) {
                return response()->json(['success' => true, 'data' => []]);
            }

            // Récupérer les psy avec qui l'étudiant a consulté
            $psyIds = Consultation::where('etudiant_id', $etudiant->id)
                ->whereIn('statut', ['acceptee', 'terminee'])
                ->pluck('psychologue_id')
                ->unique();

            // Ressources visibles :
            // 1. Ressources publiques des psy qui ont consulté cet étudiant
            // 2. Ressources privées spécifiquement assignées à cet étudiant
            $ressources = Ressource::where('actif', true)
                ->where(function ($query) use ($etudiant, $psyIds) {
                    $query->where(function ($q) use ($psyIds) {
                        // Ressources publiques des psy de l'étudiant
                        $q->where('public', true)
                          ->whereIn('psychologue_id', $psyIds);
                    })->orWhereHas('etudiants', function ($q) use ($etudiant) {
                        // Ressources privées assignées à cet étudiant
                        $q->where('etudiant_id', $etudiant->id);
                    });
                })
                ->with('psychologue.user')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json(['success' => true, 'data' => $ressources]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Ressources du psy connecté
    public function mesRessources(Request $request)
    {
        try {
            $psychologue = Psychologue::where('user_id', $request->user()->id)->first();

            $ressources = Ressource::where('psychologue_id', $psychologue->id)
                ->with('etudiants.user')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json(['success' => true, 'data' => $ressources]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Créer une ressource (psy uniquement)
    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:lien_youtube,lien_web,video_upload,pdf,audio,note',
            'categorie' => 'required|in:anxiete,depression,stress,sommeil,confiance,deuil,autre',
            'url' => 'nullable|string',
            'public' => 'boolean',
            'destinataires' => 'required|in:un_patient,plusieurs_patients,tous_mes_patients',
            'etudiant_ids' => 'nullable|array',
        ]);

        try {
            $psychologue = Psychologue::where('user_id', $request->user()->id)->first();

            $ressource = Ressource::create([
                'psychologue_id' => $psychologue->id,
                'titre' => $request->titre,
                'description' => $request->description,
                'type' => $request->type,
                'categorie' => $request->categorie,
                'url' => $request->url,
                'destinataires' => $request->destinataires,
                'public' => $request->public ?? true,
                'actif' => true,
            ]);

            // Associer aux étudiants selon destinataires
            if ($request->destinataires === 'tous_mes_patients') {
                // Tous les patients du psy (qui ont consulté)
                $patients = Etudiant::whereIn('id', 
                    Consultation::where('psychologue_id', $psychologue->id)
                        ->whereIn('statut', ['acceptee', 'terminee'])
                        ->pluck('etudiant_id')
                        ->unique()
                )->pluck('id');
                if ($patients->count() > 0) {
                    $ressource->etudiants()->attach($patients);
                }
            } elseif ($request->destinataires === 'un_patient' && $request->etudiant_ids) {
                $ressource->etudiants()->attach($request->etudiant_ids);
            }

            return response()->json([
                'success' => true,
                'message' => 'Ressource créée avec succès',
                'data' => $ressource
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Marquer comme lue
    public function marquerLue(Request $request, $id)
    {
        try {
            $etudiant = Etudiant::where('user_id', $request->user()->id)->first();
            $etudiant->ressources()->updateExistingPivot($id, [
                'lu' => true,
                'lu_le' => now(),
            ]);
            return response()->json(['success' => true, 'message' => 'Ressource marquée comme lue']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Supprimer une ressource
    public function destroy(Request $request, $id)
    {
        try {
            $psychologue = Psychologue::where('user_id', $request->user()->id)->first();
            $ressource = Ressource::where('id', $id)
                ->where('psychologue_id', $psychologue->id)
                ->firstOrFail();

            if ($ressource->fichier_path) {
                Storage::disk('public')->delete($ressource->fichier_path);
            }

            $ressource->delete();
            return response()->json(['success' => true, 'message' => 'Ressource supprimée']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
