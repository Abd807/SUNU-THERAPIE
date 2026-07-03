<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotePsy;
use App\Models\Psychologue;
use App\Models\Etudiant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\ClaudeService;

class NotePsyController extends Controller
{
    // ─── Liste des notes du psy ───
    public function index(Request $request)
    {
        try {
            $psy = Psychologue::where('user_id', $request->user()->id)->first();

            $notes = NotePsy::where('psychologue_id', $psy->id)
                ->with('etudiant.user', 'consultation')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json(['success' => true, 'data' => $notes]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ─── Créer une note ───
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titre' => 'required|string|max:255',
            'contenu' => 'required|string',
            'type' => 'required|in:consultation,privee,partagee,urgence',
            'etudiant_id' => 'nullable|exists:etudiants,id',
            'consultation_id' => 'nullable|exists:consultations,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $psy = Psychologue::where('user_id', $request->user()->id)->first();

            $note = NotePsy::create([
                'psychologue_id' => $psy->id,
                'etudiant_id' => $request->etudiant_id,
                'consultation_id' => $request->consultation_id,
                'titre' => $request->titre,
                'contenu' => $request->contenu,
                'type' => $request->type,
                'partagee_avec_etudiant' => $request->type === 'partagee',
                'partagee_le' => $request->type === 'partagee' ? now() : null,
            ]);

            // Notifier admin si urgence
            if ($request->type === 'urgence') {
                \Illuminate\Support\Facades\Log::warning("NOTE URGENCE - Psy: {$psy->user->name} - Étudiant ID: {$request->etudiant_id} - {$request->titre}");
            }

            return response()->json([
                'success' => true,
                'message' => 'Note créée avec succès',
                'data' => $note->load('etudiant.user')
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ─── Modifier une note ───
    public function update(Request $request, $id)
    {
        try {
            $psy = Psychologue::where('user_id', $request->user()->id)->first();
            $note = NotePsy::where('id', $id)->where('psychologue_id', $psy->id)->firstOrFail();

            $note->update([
                'titre' => $request->titre ?? $note->titre,
                'contenu' => $request->contenu ?? $note->contenu,
                'type' => $request->type ?? $note->type,
                'partagee_avec_etudiant' => ($request->type ?? $note->type) === 'partagee',
                'partagee_le' => ($request->type ?? $note->type) === 'partagee' ? now() : null,
            ]);

            return response()->json(['success' => true, 'data' => $note->fresh()->load('etudiant.user')]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ─── Supprimer une note ───
    public function destroy(Request $request, $id)
    {
        try {
            $psy = Psychologue::where('user_id', $request->user()->id)->first();
            NotePsy::where('id', $id)->where('psychologue_id', $psy->id)->firstOrFail()->delete();
            return response()->json(['success' => true, 'message' => 'Note supprimée']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ─── Notes d'un étudiant (visible par l'étudiant) ───
    public function notesEtudiant(Request $request)
    {
        try {
            $etudiant = Etudiant::where('user_id', $request->user()->id)->first();

            $notes = NotePsy::where('etudiant_id', $etudiant->id)
                ->where('partagee_avec_etudiant', true)
                ->with('psychologue.user')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json(['success' => true, 'data' => $notes]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
    // ─── IA : structurer une note brute ───
    public function structurer(Request $request, ClaudeService $claude)
    {
        $validator = Validator::make($request->all(), [
            'contenu' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $system = <<<PROMPT
Tu es un assistant de rédaction pour des psychologues professionnels.
On te donne des notes brutes prises pendant ou après une consultation.

TA TÂCHE :
- Reformuler ces notes en une synthèse claire, structurée et professionnelle.
- Organiser en sections : Observations, Points clés, Pistes de suivi.
- Garder un ton clinique neutre et factuel.

RÈGLES STRICTES :
- Tu ne poses AUCUN diagnostic. Tu reformules uniquement ce qui est écrit.
- Tu n'inventes rien : tu n'ajoutes pas d'information absente des notes.
- Si une information manque, tu ne la combles pas.
- Tu écris en français professionnel.
PROMPT;

        $result = $claude->ask($system, $request->contenu, 1000);

        if (! $result['success']) {
            return response()->json(['success' => false, 'error' => $result['error']], 503);
        }

        return response()->json([
            'success' => true,
            'data' => ['note_structuree' => $result['text']],
        ]);
    }

    // ─── IA : résumer l'historique d'un dossier étudiant ───
    public function resumerDossier(Request $request, ClaudeService $claude, $etudiant_id)
    {
        try {
            $psy = Psychologue::where('user_id', $request->user()->id)->first();

            // On ne prend que les notes de CE psy sur CET étudiant
            $notes = NotePsy::where('psychologue_id', $psy->id)
                ->where('etudiant_id', $etudiant_id)
                ->orderBy('created_at', 'asc')
                ->get(['titre', 'contenu', 'type', 'created_at']);

            if ($notes->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Aucune note disponible pour ce dossier.',
                ], 404);
            }

            // On assemble les notes en texte daté
            $historique = $notes->map(function ($n) {
                return $n->created_at->format('d/m/Y') . " — {$n->titre}\n{$n->contenu}";
            })->implode("\n\n---\n\n");

            $system = <<<PROMPT
Tu es un assistant de synthèse pour des psychologues professionnels.
On te donne l'historique chronologique des notes d'un suivi.

TA TÂCHE :
- Produire une synthèse de l'évolution du suivi dans le temps.
- Dégager : le contexte initial, l'évolution observée, les points d'attention actuels.

RÈGLES STRICTES :
- Tu ne poses AUCUN diagnostic.
- Tu te bases UNIQUEMENT sur les notes fournies, sans rien inventer.
- Ton clinique, neutre, factuel, en français professionnel.
PROMPT;

            $result = $claude->ask($system, $historique, 1200);

            if (! $result['success']) {
                return response()->json(['success' => false, 'error' => $result['error']], 503);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'nombre_notes' => $notes->count(),
                    'synthese' => $result['text'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
