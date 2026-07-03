<?php

namespace App\Filament\Widgets;

use App\Models\Consultation;
use App\Models\Etudiant;
use App\Models\Psychologue;
use App\Models\Ressource;
use App\Models\TransfertDossier;
use App\Services\ClaudeService;
use Filament\Widgets\Widget;
use Illuminate\Support\Str;

class AiSyntheseWidget extends Widget
{
    protected static string $view = 'filament.widgets.ai-synthese-widget';

    // Le widget occupe toute la largeur
    protected int|string|array $columnSpan = 'full';

    // Stockage de la synthèse générée
    public ?string $synthese = null;
    public bool $chargement = false;

    public function genererSynthese(): void
    {
        $this->chargement = true;

        $stats = [
            'total_etudiants' => Etudiant::count(),
            'etudiants_sans_psy' => Etudiant::whereNull('psy_referent_id')->count(),
            'total_psy' => Psychologue::count(),
            'psy_disponibles' => Psychologue::where('disponible', true)->count(),
            'total_consultations' => Consultation::count(),
            'en_attente' => Consultation::where('statut', 'en_attente')->count(),
            'terminees' => Consultation::where('statut', 'terminee')->count(),
            'ressources_actives' => Ressource::where('actif', true)->count(),
            'transferts_en_attente' => TransfertDossier::where('statut', 'en_attente')->count(),
        ];

        $donnees = collect($stats)
            ->map(fn ($valeur, $cle) => "- {$cle} : {$valeur}")
            ->implode("\n");

        $system = <<<PROMPT
Tu es un analyste qui rédige des synthèses pour le tableau de bord d'administration de SunuThérapie,
une plateforme de soutien psychologique pour étudiants au Sénégal.

TA TÂCHE :
- À partir des statistiques fournies (toutes anonymes et agrégées), rédiger une synthèse claire et concise.
- Mettre en avant les points positifs et l'engagement.
- Signaler factuellement les points d'attention opérationnels.
- Proposer 2 ou 3 recommandations concrètes et bienveillantes.

RÈGLES STRICTES :
- Données 100% anonymes : ne JAMAIS inventer de noms ou de cas individuels.
- Ton professionnel, positif et non stigmatisant.
- Pas de jargon médical, pas de diagnostic.
- Français clair et concis. Maximum 250 mots.
PROMPT;

        $claude = app(ClaudeService::class);
        $result = $claude->ask($system, $donnees, 800);

        $this->synthese = $result['success']
            ? Str::markdown($result['text'])
            : "<p>La synthèse n'a pas pu être générée pour le moment.</p>";

        $this->chargement = false;
    }
}
