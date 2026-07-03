<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Disponibilite;
use App\Models\Consultation;
use App\Models\Psychologue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DisponibiliteController extends Controller
{
    // ─── Liste des disponibilités d'un psy ───
    public function index($psychologue_id)
    {
        $disponibilites = Disponibilite::where('psychologue_id', $psychologue_id)
            ->orderBy('date')
            ->orderBy('heure_debut')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $disponibilites
        ]);
    }

    // ─── Mes disponibilités (psy connecté) ───
    public function mesDisponibilites(Request $request)
    {
        $psy = $request->user()->psychologue;

        $disponibilites = Disponibilite::where('psychologue_id', $psy->id)
            ->orderBy('date')
            ->orderBy('heure_debut')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $disponibilites
        ]);
    }

    // ─── Créer un créneau / événement ───
    public function store(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'date' => 'required|date',
            'heure_debut' => 'required|date_format:H:i',
            'duree' => 'required|integer|min:15|max:180',
            'type' => 'required|in:consultation,personnel',
            'titre' => 'nullable|string|max:255',
            'note' => 'nullable|string',
            'rappels' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $psy = $request->user()->psychologue;

        // Calculer heure_fin
        $heureDebut = Carbon::parse($request->date . ' ' . $request->heure_debut);
        $heureFin = $heureDebut->copy()->addMinutes($request->duree);

        $disponibilite = Disponibilite::create([
            'psychologue_id' => $psy->id,
            'date' => $request->date,
            'titre' => $request->titre ?? ($request->type === 'consultation' ? 'Consultation SunuThérapie' : 'Événement personnel'),
            'type' => $request->type,
            'heure_debut' => $request->heure_debut,
            'heure_fin' => $heureFin->format('H:i'),
            'duree' => $request->duree,
            'note' => $request->note,
            'rappels' => $request->rappels ?? [30],
            'actif' => true,
            'notifier_admin' => $request->type === 'consultation',
            'jour_semaine' => strtolower(Carbon::parse($request->date)->locale('fr')->dayName),
        ]);

        // Notifier l'admin si consultation
        if ($request->type === 'consultation') {
            try {
                $admins = \App\Models\User::where('role', 'admin')->get();
                foreach ($admins as $admin) {
                    Log::info("Notification admin: Nouveau créneau consultation de {$psy->user->name} le {$request->date} à {$request->heure_debut}");
                    // TODO: Envoyer notification FCM à l'admin
                }
            } catch (\Exception $e) {
                Log::error('Erreur notification admin: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Créneau créé avec succès',
            'data' => $disponibilite
        ], 201);
    }

    // ─── Toggle actif/inactif ───
    public function toggle($id)
    {
        $dispo = Disponibilite::findOrFail($id);
        $dispo->update(['actif' => !$dispo->actif]);

        return response()->json([
            'success' => true,
            'data' => $dispo
        ]);
    }

    // ─── Supprimer ───
    public function destroy($id)
    {
        Disponibilite::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Créneau supprimé'
        ]);
    }

    // ─── Créneaux disponibles pour une date (pour les étudiants) ───
    public function creneauxDisponibles($psychologue_id, $date)
    {
        $creneaux = Disponibilite::where('psychologue_id', $psychologue_id)
            ->where('date', $date)
            ->where('type', 'consultation')
            ->where('actif', true)
            ->with('psychologue.user')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $creneaux
        ]);
    }

    // ─── Jours disponibles (pour les étudiants) ───
    public function getJoursDisponibles()
    {
        $jours = Disponibilite::where('type', 'consultation')
            ->where('actif', true)
            ->where('date', '>=', now()->format('Y-m-d'))
            ->select('date')
            ->distinct()
            ->pluck('date');

        return response()->json([
            'success' => true,
            'data' => $jours
        ]);
    }

    // ─── Tous les créneaux disponibles ───
    public function getCreneauxDisponibles(Request $request)
    {
        $date = $request->input('date', now()->format('Y-m-d'));

        $creneaux = Disponibilite::where('date', $date)
            ->where('type', 'consultation')
            ->where('actif', true)
            ->with('psychologue.user')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $creneaux
        ]);
    }
}
