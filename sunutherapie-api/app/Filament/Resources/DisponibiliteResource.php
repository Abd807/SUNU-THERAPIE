<?php

namespace App\Filament\Resources;

use App\Models\Disponibilite;
use App\Models\Psychologue;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Actions\Action;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Mail;
use App\Filament\Resources\DisponibiliteResource\Pages;

class DisponibiliteResource extends Resource
{
    protected static ?string $model = Disponibilite::class;
    protected static ?string $navigationIcon = 'heroicon-o-clock';
    protected static ?string $navigationLabel = 'Calendrier Psy';
    protected static ?string $navigationGroup = 'Planning';

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('psychologue.user.name')
                    ->label('Psychothérapeute')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('date')
                    ->label('Date')
                    ->date('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('titre')
                    ->label('Titre')
                    ->searchable()
                    ->default('—'),
                Tables\Columns\BadgeColumn::make('type')
                    ->label('Type')
                    ->colors([
                        'success' => 'consultation',
                        'warning' => 'personnel',
                    ])
                    ->formatStateUsing(fn ($state) => $state === 'consultation' ? '🩺 Consultation' : '📌 Personnel'),
                Tables\Columns\TextColumn::make('heure_debut')
                    ->label('Heure')
                    ->formatStateUsing(fn ($record) => substr($record->heure_debut, 0, 5) . ' — ' . substr($record->heure_fin, 0, 5)),
                Tables\Columns\TextColumn::make('duree')
                    ->label('Durée')
                    ->formatStateUsing(fn ($state) => $state . ' min'),
                Tables\Columns\IconColumn::make('actif')
                    ->label('Actif')
                    ->boolean(),
                Tables\Columns\IconColumn::make('notifier_admin')
                    ->label('Notifié')
                    ->boolean()
                    ->trueColor('success')
                    ->falseColor('gray'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créé le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('date', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Type')
                    ->options([
                        'consultation' => '🩺 Consultation',
                        'personnel' => '📌 Personnel',
                    ]),
                Tables\Filters\SelectFilter::make('psychologue_id')
                    ->label('Psychothérapeute')
                    ->options(
                        Psychologue::with('user')->get()->mapWithKeys(fn($psy) => [$psy->id => $psy->user->name])
                    ),
                Tables\Filters\Filter::make('aujourd_hui')
                    ->label("Aujourd'hui")
                    ->query(fn ($query) => $query->whereDate('date', today())),
                Tables\Filters\Filter::make('cette_semaine')
                    ->label('Cette semaine')
                    ->query(fn ($query) => $query->whereBetween('date', [now()->startOfWeek(), now()->endOfWeek()])),
            ])
            ->actions([
                Tables\Actions\DeleteAction::make(),
                Action::make('envoyer_notif')
                    ->label('📧 Notifier psy')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn ($record) => $record->type === 'consultation')
                    ->action(function ($record) {
                        $psyUser = $record->psychologue->user;
                        try {
                            Mail::raw(
                                "Bonjour Dr. {$psyUser->name},\n\n" .
                                "Rappel : Vous avez un créneau de consultation prévu :\n\n" .
                                "📅 Date : " . \Carbon\Carbon::parse($record->date)->format('d/m/Y') . "\n" .
                                "🕐 Heure : " . substr($record->heure_debut, 0, 5) . " — " . substr($record->heure_fin, 0, 5) . "\n" .
                                "⏱ Durée : {$record->duree} minutes\n\n" .
                                "Connectez-vous sur SunuThérapie pour gérer vos consultations.\n\n" .
                                "Cordialement,\nL'équipe SunuThérapie 🌿",
                                function ($message) use ($psyUser, $record) {
                                    $message->to($psyUser->email)
                                        ->subject('📅 Créneau consultation - SunuThérapie');
                                }
                            );
                            Notification::make()->title('✅ Email envoyé')->body("Notification envoyée à {$psyUser->email}")->success()->send();
                        } catch (\Exception $e) {
                            Notification::make()->title('❌ Erreur')->body($e->getMessage())->danger()->send();
                        }
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDisponibilites::route('/'),
        ];
    }
}
