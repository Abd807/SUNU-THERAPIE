<?php

namespace App\Filament\Resources\PsychologueResource\Pages;

use App\Filament\Resources\PsychologueResource;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class EditPsychologue extends EditRecord
{
    protected static string $resource = PsychologueResource::class;

    // Pré-remplir le formulaire avec les données existantes
    protected function mutateFormDataBeforeFill(array $data): array
    {
        $user = $this->record->user;

        $data['user']['name']      = $user->name;
        $data['user']['email']     = $user->email;
        $data['user']['telephone'] = $user->telephone;
        $data['password']          = ''; // vide — on laisse l'admin saisir un nouveau si besoin

        return $data;
    }

    protected function handleRecordUpdate($record, array $data): \App\Models\Psychologue
    {
        $plainPassword = null;

        $record->user->update([
            'name'      => $data['user']['name'],
            'email'     => $data['user']['email'],
            'telephone' => $data['user']['telephone'] ?? null,
        ]);

        if (!empty($data['password'])) {
            $plainPassword = $data['password'];
            $record->user->update([
                'password' => Hash::make($plainPassword),
            ]);
        }

        $record->update([
            'numero_ordre'      => $data['numero_ordre'] ?? null,
            'specialites'       => $data['specialites'] ?? [],
            'bio'               => $data['bio'] ?? null,
            'annees_experience' => $data['annees_experience'] ?? 0,
            'diplome'           => $data['diplome'] ?? null,
            'etablissement'     => $data['etablissement'] ?? null,
            'disponible'        => $data['disponible'] ?? true,
            'urgence'           => $data['urgence'] ?? false,
        ]);

        if ($plainPassword) {
            $this->envoyerMailConnexion($record, $plainPassword);
        }

        return $record;
    }

    protected function envoyerMailConnexion($record, string $plainPassword): void
    {
        $user = $record->user;

        $message = "
=======================================================
         SUNUTHERAPIE - VOS INFORMATIONS DE CONNEXION
=======================================================

Bonjour Dr. {$user->name},

Voici vos identifiants de connexion mis a jour :

-------------------------------------------------------

   EMAIL        :   {$user->email}

   MOT DE PASSE :   {$plainPassword}

-------------------------------------------------------

   LIEN :   https://app.sunutherapi.com

=======================================================
Ne partagez pas ces informations.

Cordialement,
L'equipe SunuTherapie
";

        try {
            Mail::raw($message, function ($mail) use ($user) {
                $mail->to($user->email, "Dr. {$user->name}")
                     ->subject('SunuTherapie - Vos identifiants de connexion');
            });
        } catch (\Exception $e) {
            \Log::error('Erreur envoi email psy: ' . $e->getMessage());
        }
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
