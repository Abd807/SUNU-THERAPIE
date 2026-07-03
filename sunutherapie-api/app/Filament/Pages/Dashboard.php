<?php

namespace App\Filament\Pages;

use App\Models\Consultation;
use App\Models\Etudiant;
use App\Models\Psychologue;
use App\Models\Ressource;
use App\Models\Sponsor;
use App\Models\TransfertDossier;
use Filament\Pages\Page;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Filament\Widgets\StatsOverviewWidget;

class Dashboard extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-home';
    protected static ?string $navigationLabel = 'Tableau de bord';
    protected static ?string $title = 'Tableau de bord SunuThérapie';
    protected static ?int $navigationSort = -1;
    protected static string $view = 'filament.pages.dashboard';

    public function getStats(): array
    {
        return [
            // Étudiants
            'total_etudiants' => Etudiant::count(),
            'etudiants_avec_psy' => Etudiant::whereNotNull('psy_referent_id')->count(),
            'etudiants_sans_psy' => Etudiant::whereNull('psy_referent_id')->count(),

            // Psychothérapeutes
            'total_psy' => Psychologue::count(),
            'psy_disponibles' => Psychologue::where('disponible', true)->count(),
            'psy_urgence' => Psychologue::where('urgence', true)->count(),

            // Consultations
            'total_consultations' => Consultation::count(),
            'en_attente' => Consultation::where('statut', 'en_attente')->count(),
            'en_cours' => Consultation::where('statut', 'en_cours')->count(),
            'terminees' => Consultation::where('statut', 'terminee')->count(),
            'refusees' => Consultation::where('statut', 'refusee')->count(),

            // Ressources
            'total_ressources' => Ressource::count(),
            'ressources_en_attente' => Ressource::where('actif', false)->count(),
            'ressources_actives' => Ressource::where('actif', true)->count(),

            // Transferts
            'transferts_en_attente' => TransfertDossier::where('statut', 'en_attente')->count(),

            // Sponsors
            'total_sponsors' => Sponsor::where('actif', true)->count(),
        ];
    }
    protected function getHeaderWidgets(): array
    {
        return [
            \App\Filament\Widgets\AiSyntheseWidget::class,
        ];
    }
}
