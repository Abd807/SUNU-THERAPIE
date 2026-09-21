<?php

namespace App\Filament\Resources\DisponibiliteResource\Pages;

use App\Filament\Resources\DisponibiliteResource;
use Carbon\Carbon;
use Filament\Resources\Pages\CreateRecord;

class CreateDisponibilite extends CreateRecord
{
    protected static string $resource = DisponibiliteResource::class;

    /**
     * heure_fin et jour_semaine sont NOT NULL en base mais deduits de la date,
     * de l'heure de debut et de la duree. On les calcule comme le fait l'API.
     */
    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $debut = Carbon::parse($data['date'] . ' ' . $data['heure_debut']);

        $data['heure_fin'] = $debut->copy()->addMinutes((int) $data['duree'])->format('H:i');
        $data['jour_semaine'] = strtolower(Carbon::parse($data['date'])->locale('fr')->dayName);
        $data['titre'] = $data['titre'] ?: ($data['type'] === 'consultation'
            ? 'Consultation SunuThérapie'
            : 'Événement personnel');
        $data['notifier_admin'] = $data['type'] === 'consultation';
        $data['rappels'] = $data['rappels'] ?? [30];

        return $data;
    }
}
