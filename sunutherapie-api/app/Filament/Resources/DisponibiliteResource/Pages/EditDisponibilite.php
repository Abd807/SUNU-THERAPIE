<?php

namespace App\Filament\Resources\DisponibiliteResource\Pages;

use App\Filament\Resources\DisponibiliteResource;
use App\Models\Disponibilite;
use App\Models\Psychologue;
use App\Models\User;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Mail;
use Filament\Notifications\Notification;

class EditDisponibilite extends EditRecord
{
    protected static string $resource = DisponibiliteResource::class;

    protected function afterSave(): void
    {
        $record = $this->record;

        try {
            $psychologue = Psychologue::find($record->psychologue_id);
            $psyUser = $psychologue ? User::find($psychologue->user_id) : null;

            if ($psyUser) {
                $horaires = Disponibilite::where('psychologue_id', $record->psychologue_id)
                    ->where('actif', true)
                    ->orderByRaw("FIELD(jour_semaine, 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche')")
                    ->get();

                $lignesHoraires = $horaires->map(function ($h) {
                    return ucfirst($h->jour_semaine) . ' : ' . substr($h->heure_debut, 0, 5) . ' - ' . substr($h->heure_fin, 0, 5);
                })->join("\n");

                Mail::raw(
                    "Bonjour Dr. {$psyUser->name},\n\n" .
                    "Vos horaires de consultation ont été modifiés. Voici votre nouveau récapitulatif :\n\n" .
                    "{$lignesHoraires}\n\n" .
                    "Connectez-vous sur l'application pour voir vos rendez-vous.\n\n" .
                    "Cordialement,\n" .
                    "L'équipe SunuThérapie",
                    function ($message) use ($psyUser) {
                        $message->to($psyUser->email)
                            ->subject('🔄 Vos horaires ont été modifiés - SunuThérapie');
                    }
                );

                Notification::make()
                    ->title('Horaire modifié')
                    ->body("Email envoyé à {$psyUser->email}")
                    ->success()
                    ->send();
            }
        } catch (\Exception $e) {
            Notification::make()
                ->title('Horaire modifié mais email non envoyé')
                ->body("Erreur : " . $e->getMessage())
                ->warning()
                ->send();
        }
    }
}
