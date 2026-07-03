<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Etudiant;
use App\Models\Psychologue;
use App\Models\Ressource;
use App\Models\Sponsor;
use App\Models\TransfertDossier;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Services\ClaudeService;
use Illuminate\Http\JsonResponse;

class DashboardExportController extends Controller
{
    public function exportPdf()
    {
        $stats = [
            'total_etudiants' => Etudiant::count(),
            'etudiants_avec_psy' => Etudiant::whereNotNull('psy_referent_id')->count(),
            'etudiants_sans_psy' => Etudiant::whereNull('psy_referent_id')->count(),
            'total_psy' => Psychologue::count(),
            'psy_disponibles' => Psychologue::where('disponible', true)->count(),
            'psy_urgence' => Psychologue::where('urgence', true)->count(),
            'total_consultations' => Consultation::count(),
            'en_attente' => Consultation::where('statut', 'en_attente')->count(),
            'en_cours' => Consultation::where('statut', 'en_cours')->count(),
            'terminees' => Consultation::where('statut', 'terminee')->count(),
            'refusees' => Consultation::where('statut', 'refusee')->count(),
            'total_ressources' => Ressource::count(),
            'ressources_en_attente' => Ressource::where('actif', false)->count(),
            'ressources_actives' => Ressource::where('actif', true)->count(),
            'transferts_en_attente' => TransfertDossier::where('statut', 'en_attente')->count(),
            'total_sponsors' => Sponsor::where('actif', true)->count(),
            'date_export' => now()->format('d/m/Y H:i'),
        ];

        $pdf = Pdf::loadView('pdf.dashboard', $stats)
            ->setPaper('a4', 'portrait');

        return $pdf->download('rapport-sunutherapie-' . now()->format('Y-m-d') . '.pdf');
    }
    public function synthese(ClaudeService $claude): JsonResponse
    {
        $stats = [
            'total_etudiants' => Etudiant::count(),
            'etudiants_avec_psy' => Etudiant::whereNotNull('psy_referent_id')->count(),
            'etudiants_sans_psy' => Etudiant::whereNull('psy_referent_id')->count(),
            'total_psy' => Psychologue::count(),
            'psy_disponibles' => Psychologue::where('disponible', true)->count(),
            'total_consultations' => Consultation::count(),
            'en_attente' => Consultation::where('statut', 'en_attente')->count(),
            'en_cours' => Consultation::where('statut', 'en_cours')->count(),
            'terminees' => Consultation::where('statut', 'terminee')->count(),
            'refusees' => Consultation::where('statut', 'refusee')->count(),
            'total_ressources' => Ressource::where('actif', true)->count(),
            'transferts_en_attente' => TransfertDossier::where('statut', 'en_attente')->count(),
        ];

        // On transforme les chiffres en texte lisible pour Claude
        $donnees = collect($stats)
            ->map(fn ($valeur, $cle) => "- {$cle} : {$valeur}")
            ->implode("\n");

        $system = <<<PROMPT
Tu es un analyste qui rédige des synthèses pour le tableau de bord d'administration de SunuThérapie,
une plateforme de soutien psychologique pour étudiants au Sénégal.

TA TÂCHE :
- À partir des statistiques fournies (toutes anonymes et agrégées), rédiger une synthèse claire de l'activité.
- Mettre en avant les points positifs et l'engagement.
- Signaler factuellement les points d'attention opérationnels (ex : demandes en attente, étudiants sans psy référent).
- Proposer 2 ou 3 recommandations concrètes et bienveillantes.

RÈGLES STRICTES :
- Données 100% anonymes : ne JAMAIS inventer de noms ou de cas individuels.
- Ton professionnel, positif et non stigmatisant.
- Pas de jargon médical, pas de diagnostic.
- Français clair. Structure en 3 parties : Vue d'ensemble, Points d'attention, Recommandations.
PROMPT;

        $result = $claude->ask($system, $donnees, 1200);

        if (! $result['success']) {
            return response()->json(['success' => false, 'error' => $result['error']], 503);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'statistiques' => $stats,
                'synthese' => $result['text'],
                'genere_le' => now()->format('d/m/Y H:i'),
            ],
        ]);
    }
}
