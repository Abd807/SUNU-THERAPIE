<?php

namespace App\Filament\Resources\PsychologueResource\Pages;

use App\Filament\Resources\PsychologueResource;
use App\Models\User;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Filament\Notifications\Notification;

class CreatePsychologue extends CreateRecord
{
    protected static string $resource = PsychologueResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $user = User::create([
            'name' => $data['user']['name'],
            'email' => $data['user']['email'],
            'telephone' => $data['user']['telephone'] ?? null,
            'password' => Hash::make($data['password']),
            'role' => 'psychologue',
            'statut' => 'actif',
        ]);

        $plainPassword = $data['password'];

        $psychologueData = [
            'user_id' => $user->id,
            'numero_ordre' => $data['numero_ordre'] ?? null,
            'diplome' => $data['diplome'] ?? null,
            'etablissement' => $data['etablissement'] ?? null,
            'annees_experience' => $data['annees_experience'] ?? 0,
            'specialites' => $data['specialites'] ?? [],
            'bio' => $data['bio'] ?? null,
            'disponible' => $data['disponible'] ?? true,
            'urgence' => $data['urgence'] ?? false,
        ];

        try {
            Mail::raw(
                "Bonjour {$user->name},\n\n" .
                "Votre compte psychologue a été créé sur la plateforme SunuThérapie.\n\n" .
                "Vos identifiants de connexion :\n" .
                "Email : {$user->email}\n" .
                "Mot de passe : {$plainPassword}\n\n" .
                "Veuillez télécharger la dernière version de l'application sur sunutherapi.com\n\n" .
                "Accédez à votre espace : https://sunutherapie.sn\n\n" .
                "Cordialement,\n" .
                "L'équipe SunuThérapie",
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('Votre compte SunuThérapie a été créé');
                }
            );

            Notification::make()
                ->title('Psychologue créé avec succès')
                ->body("Un email a été envoyé à {$user->email}")
                ->success()
                ->send();

        } catch (\Exception $e) {
            Notification::make()
                ->title('Compte créé mais email non envoyé')
                ->body("Erreur : " . $e->getMessage())
                ->warning()
                ->send();
        }

        return $psychologueData;
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
