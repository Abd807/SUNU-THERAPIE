<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Psychologue;
use App\Models\Etudiant;
use App\Models\Disponibilite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PsychologueController extends Controller
{
    // Liste des psychologues
    public function index(Request $request)
    {
        try {
            $psychologues = Psychologue::with('user')
                ->whereHas('user', fn($q) => $q->where('statut', 'actif'))
                ->get();

            return response()->json(['success' => true, 'data' => $psychologues]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Psychologues disponibles selon logique psy référent
    public function disponibles(Request $request)
    {
        try {
            $user = $request->user();
            $etudiant = Etudiant::where('user_id', $user->id)->first();

            // Si l'étudiant a un psy référent → retourner seulement lui
            if ($etudiant && $etudiant->psy_referent_id) {
                $psy = Psychologue::with('user')
                    ->where('id', $etudiant->psy_referent_id)
                    ->where('disponible', true)
                    ->first();

                return response()->json([
                    'success' => true,
                    'data' => $psy ? [$psy] : [],
                    'has_referent' => true,
                ]);
            }

            // Sinon → retourner tous les psy qui ont des créneaux disponibles
            $psyAvecCreneaux = Disponibilite::where('type', 'consultation')
                ->where('actif', true)
                ->where('date', '>=', now()->format('Y-m-d'))
                ->pluck('psychologue_id')
                ->unique();

            $psychologues = Psychologue::with('user')
                ->whereIn('id', $psyAvecCreneaux)
                ->where('disponible', true)
                ->whereHas('user', fn($q) => $q->where('statut', 'actif'))
                ->get();

            return response()->json([
                'success' => true,
                'data' => $psychologues,
                'has_referent' => false,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Psychologues pour urgences
    public function urgence()
    {
        try {
            $psychologues = Psychologue::with('user')
                ->where('disponible', true)
                ->where('urgence', true)
                ->whereHas('user', fn($q) => $q->where('statut', 'actif'))
                ->get();

            return response()->json(['success' => true, 'data' => $psychologues]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Détail d'un psychologue
    public function show($id)
    {
        try {
            $psychologue = Psychologue::with(['user', 'disponibilites'])
                ->findOrFail($id);

            return response()->json(['success' => true, 'data' => $psychologue]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 404);
        }
    }

    // Créer un psychologue (Admin uniquement)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'telephone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'psychologue',
                'statut' => 'actif',
                'telephone' => $request->telephone,
                'email_verified' => true,
            ]);

            $psychologue = Psychologue::create([
                'user_id' => $user->id,
                'bio' => $request->bio,
                'disponible' => false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Psychologue créé avec succès',
                'data' => $psychologue->load('user')
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Mettre à jour la disponibilité
    public function updateDisponibilite(Request $request, $id)
    {
        try {
            $psychologue = Psychologue::findOrFail($id);
            $psychologue->update([
                'disponible' => $request->disponible,
                'urgence' => $request->urgence ?? $psychologue->urgence,
            ]);

            return response()->json(['success' => true, 'data' => $psychologue]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
