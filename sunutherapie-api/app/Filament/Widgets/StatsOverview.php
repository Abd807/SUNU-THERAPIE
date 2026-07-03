<?php

namespace App\Filament\Widgets;

use App\Models\Consultation;
use App\Models\Etudiant;
use App\Models\Psychologue;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        $totalEtudiants = Etudiant::count();
        $totalPsychologues = Psychologue::count();
        $totalConsultations = Consultation::count();
        $consultationsEnAttente = Consultation::where('statut', 'en_attente')->count();
        $consultationsTerminees = Consultation::where('statut', 'terminee')->count();
        $psychologuesDisponibles = Psychologue::where('disponible', true)->count();

        return [
            Stat::make('Étudiants inscrits', $totalEtudiants)
                ->description('Total des étudiants')
                ->descriptionIcon('heroicon-o-academic-cap')
                ->color('success')
                ->chart([7, 12, 18, 24, 30, 35, $totalEtudiants]),
            
            Stat::make('Psychologues', $totalPsychologues)
                ->description("{$psychologuesDisponibles} disponibles")
                ->descriptionIcon('heroicon-o-user-group')
                ->color('primary'),
            
            Stat::make('Consultations', $totalConsultations)
                ->description("{$consultationsTerminees} terminées")
                ->descriptionIcon('heroicon-o-calendar')
                ->color('warning'),
            
            Stat::make('En attente', $consultationsEnAttente)
                ->description('Demandes à traiter')
                ->descriptionIcon('heroicon-o-clock')
                ->color('danger'),
        ];
    }
}
