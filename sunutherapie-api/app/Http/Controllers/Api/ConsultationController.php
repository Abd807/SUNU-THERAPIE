<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Psychologue;
use App\Models\Etudiant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ConsultationController extends Controller
{
    private function getPsyId($userId)
    {
        $psychologue = Psychologue::where('user_id', $userId)->first();
        return $psychologue ? $psychologue->id : null;
    }

    private function getEtudiantId($userId)
    {
        return Etudiant::where('user_id', $userId)->value('id');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'psychologue_id' => 'required|exists:psychologues,id',
            'type' => 'required|in:planifiee,directe,urgence,anonyme',
            'mode' => 'required|in:video,audio',
            'date_consultation' => 'required|date',
            'motif_consultation' => 'nullable|string',
        ]);

        $etudiantId = $this->getEtudiantId(auth()->id());
        if (! $etudiantId) {
            return response()->json([
                'success' => false,
                'message' => 'Profil étudiant introuvable.',
            ], 403);
        }

        $dateDemandee = Carbon::parse($validated['date_consultation']);

        $conflit = Consultation::where('psychologue_id', $validated['psychologue_id'])
            ->whereIn('statut', ['en_attente', 'acceptee', 'en_cours'])
            ->where(function ($query) use ($dateDemandee) {
                $query->whereBetween('date_consultation', [
                    $dateDemandee->copy()->subMinutes(59),
                    $dateDemandee->copy()->addMinutes(59),
                ]);
            })
            ->exists();

        if ($conflit) {
            return response()->json([
                'success' => false,
                'message' => 'Ce psychothérapeute est déjà pris à cet horaire.',
                'code' => 'PSY_INDISPONIBLE'
            ], 409);
        }

        $consultation = Consultation::create([
            'etudiant_id' => $etudiantId,
            'psychologue_id' => $validated['psychologue_id'],
            'type' => $validated['type'],
            'mode' => $validated['mode'],
            'date_consultation' => $validated['date_consultation'],
            'motif_consultation' => $validated['motif_consultation'],
            'statut' => 'acceptee',
        ]);

        try {
            $psychologue = Psychologue::find($consultation->psychologue_id);
            $psyUser = $psychologue ? User::find($psychologue->user_id) : null;
            $etudiant = $request->user();
            $date = Carbon::parse($consultation->date_consultation);

            if ($psyUser) {
                Mail::raw(
                    "Bonjour Dr. {$psyUser->name},\n\n" .
                    "L'étudiant {$etudiant->name} a pris un rendez-vous.\n\n" .
                    "Date : " . $date->format('d/m/Y') . "\n" .
                    "Heure : " . $date->format('H:i') . "\n" .
                    "Mode : " . ($consultation->mode === 'video' ? 'Vidéo' : 'Audio') . "\n\n" .
                    "Cordialement,\nL'équipe SunuThérapie",
                    function ($message) use ($psyUser) {
                        $message->to($psyUser->email)
                            ->subject('📅 Nouveau rendez-vous - SunuThérapie');
                    }
                );
            }
        } catch (\Exception $e) {
            Log::error('Email RDV psy: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Consultation réservée avec succès',
            'consultation' => $consultation->load('psychologue.user', 'etudiant.user')
        ]);
    }

    public function accepter(Request $request, $id)
    {
        try {
            $consultation = Consultation::findOrFail($id);
            $psyId = $this->getPsyId($request->user()->id);

            if ((int) $consultation->psychologue_id !== (int) $psyId) {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
            }

            $channelName = 'sunu_' . $consultation->id . '_' . time() . '_' . Str::random(6);

            $consultation->update([
                'statut' => 'acceptee',
                'agora_channel_name' => $channelName,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Consultation acceptée',
                'consultation' => $consultation->load(['etudiant.user', 'psychologue.user']),
                'channel_name' => $channelName
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    public function refuser(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'motif_refus' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $consultation = Consultation::findOrFail($id);
            $psyId = $this->getPsyId($request->user()->id);

            if ((int) $consultation->psychologue_id !== (int) $psyId) {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
            }

            $consultation->update([
                'statut' => 'refusee',
                'motif_refus' => $request->motif_refus,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Consultation refusée',
                'consultation' => $consultation->load(['etudiant.user', 'psychologue.user'])
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    public function demarrer(Request $request, $id)
    {
        try {
            $consultation = Consultation::findOrFail($id);
            $userId = $request->user()->id;
            $psyId = $this->getPsyId($userId);

            $isEtudiant = (int) $consultation->etudiant_id === (int) $this->getEtudiantId($userId);
            $isPsy = $psyId && (int) $consultation->psychologue_id === (int) $psyId;

            if (!$isEtudiant && !$isPsy) {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
            }

            if ($consultation->statut === 'acceptee') {
                $consultation->update([
                    'statut' => 'en_cours',
                    'date_debut' => now(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Consultation démarrée',
                'consultation' => $consultation->load(['etudiant.user', 'psychologue.user'])
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    public function terminer(Request $request, $id)
    {
        try {
            $consultation = Consultation::findOrFail($id);
            $userId = $request->user()->id;
            $psyId = $this->getPsyId($userId);

            $isEtudiant = (int) $consultation->etudiant_id === (int) $this->getEtudiantId($userId);
            $isPsy = $psyId && (int) $consultation->psychologue_id === (int) $psyId;

            if (!$isEtudiant && !$isPsy) {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
            }

            $dateFin = now();
            $dureeMinutes = null;

            if ($consultation->date_debut) {
                $dureeMinutes = $consultation->date_debut->diffInMinutes($dateFin);
            }

            $consultation->update([
                'statut' => 'terminee',
                'date_fin' => $dateFin,
                'duree_minutes' => $dureeMinutes,
            ]);

            $psychologue = Psychologue::find($consultation->psychologue_id);
            if ($psychologue) {
                $psychologue->increment('total_consultations');
            }

            return response()->json([
                'success' => true,
                'message' => 'Consultation terminée',
                'consultation' => $consultation->load(['etudiant.user', 'psychologue.user'])
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    public function noter(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'note' => 'required|numeric|min:1|max:5',
            'commentaire' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $consultation = Consultation::findOrFail($id);

            if ((int) $consultation->etudiant_id !== (int) $this->getEtudiantId($request->user()->id)) {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
            }

            if ($consultation->statut !== 'terminee') {
                return response()->json(['success' => false, 'message' => 'La consultation doit être terminée'], 400);
            }

            if ($consultation->note_etudiant) {
                return response()->json(['success' => false, 'message' => 'Vous avez déjà noté cette consultation'], 400);
            }

            $consultation->update([
                'note_etudiant' => $request->note,
                'commentaire_etudiant' => $request->commentaire,
            ]);

            // Mettre à jour la note moyenne du psychothérapeute
            $psychologue = Psychologue::find($consultation->psychologue_id);
            if ($psychologue) {
                $noteMoyenne = Consultation::where('psychologue_id', $psychologue->id)
                    ->whereNotNull('note_etudiant')
                    ->avg('note_etudiant');
                $psychologue->update(['note_moyenne' => round($noteMoyenne, 2)]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Note et commentaire enregistrés',
                'consultation' => $consultation
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    public function historiqueEtudiant(Request $request)
    {
        try {
            $consultations = Consultation::where('etudiant_id', $this->getEtudiantId($request->user()->id))
                ->with('psychologue.user')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json(['success' => true, 'consultations' => $consultations]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    public function historiquePsychologue(Request $request)
    {
        try {
            $psyId = $this->getPsyId($request->user()->id);

            $consultations = Consultation::where('psychologue_id', $psyId)
                ->with('etudiant.user')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json(['success' => true, 'consultations' => $consultations]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    public function demandesEnAttente(Request $request)
    {
        try {
            $psyId = $this->getPsyId($request->user()->id);

            $demandes = Consultation::where('psychologue_id', $psyId)
                ->where('statut', 'en_attente')
                ->with('etudiant.user')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json(['success' => true, 'demandes' => $demandes]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    public function consultationsAcceptees(Request $request)
    {
        try {
            $psyId = $this->getPsyId($request->user()->id);

            $consultations = Consultation::where('psychologue_id', $psyId)
                ->where('statut', 'acceptee')
                ->with('etudiant.user')
                ->orderBy('date_consultation', 'asc')
                ->get();

            return response()->json(['success' => true, 'consultations' => $consultations]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }
}
