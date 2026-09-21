<?php

namespace App\Filament\Resources\EtudiantResource\Pages;

use App\Filament\Resources\EtudiantResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListEtudiants extends ListRecords
{
    protected static string $resource = EtudiantResource::class;

    // Pas de creation ici : un etudiant nait d'une inscription (compte utilisateur
    // + profil etudiant). La ressource n'a pas de formulaire, le bouton plantait.
    protected function getHeaderActions(): array
    {
        return [];
    }
}
