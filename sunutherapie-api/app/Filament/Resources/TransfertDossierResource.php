<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TransfertDossierResource\Pages;
use App\Models\TransfertDossier;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TransfertDossierResource extends Resource
{
    protected static ?string $model = TransfertDossier::class;
    protected static ?string $navigationIcon = 'heroicon-o-arrows-right-left';
    protected static ?string $navigationLabel = 'Transferts Dossiers';
    protected static ?string $navigationGroup = 'Gestion';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Détails du transfert')
                ->schema([
                    Forms\Components\TextInput::make('etudiant.user.name')
                        ->label('Étudiant')
                        ->disabled(),
                    Forms\Components\TextInput::make('ancienPsy.user.name')
                        ->label('Ancien psychothérapeute')
                        ->disabled(),
                    Forms\Components\TextInput::make('nouveauPsy.user.name')
                        ->label('Nouveau psychothérapeute')
                        ->disabled(),
                    Forms\Components\Select::make('statut')
                        ->label('Statut')
                        ->options([
                            'en_attente' => 'En attente',
                            'approuve' => 'Approuvé',
                            'refuse' => 'Refusé',
                        ]),
                    Forms\Components\Select::make('raison')
                        ->label('Raison')
                        ->options([
                            'psy_indisponible' => 'Psy indisponible',
                            'demande_etudiant' => 'Demande étudiant',
                            'decision_admin' => 'Décision admin',
                            'transfert_psy' => 'Transfert psy',
                        ])
                        ->disabled(),
                    Forms\Components\Textarea::make('motif')
                        ->label('Motif')
                        ->rows(3)
                        ->columnSpanFull(),
                ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('etudiant.user.name')
                    ->label('Étudiant')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('ancienPsy.user.name')
                    ->label('Ancien psy')
                    ->searchable(),
                Tables\Columns\TextColumn::make('nouveauPsy.user.name')
                    ->label('Nouveau psy')
                    ->searchable(),
                Tables\Columns\TextColumn::make('raison')
                    ->label('Raison')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match($state) {
                        'psy_indisponible' => 'Psy indisponible',
                        'demande_etudiant' => 'Demande étudiant',
                        'decision_admin' => 'Décision admin',
                        'transfert_psy' => 'Transfert psy',
                        default => $state
                    })
                    ->color('info'),
                Tables\Columns\TextColumn::make('statut')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match($state) {
                        'en_attente' => 'En attente',
                        'approuve' => 'Approuvé',
                        'refuse' => 'Refusé',
                        default => $state
                    })
                    ->colors([
                        'warning' => 'en_attente',
                        'success' => 'approuve',
                        'danger' => 'refuse',
                    ]),
                Tables\Columns\TextColumn::make('approuve_le')
                    ->label('Approuvé le')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Demandé le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('statut')
                    ->options([
                        'en_attente' => 'En attente',
                        'approuve' => 'Approuvé',
                        'refuse' => 'Refusé',
                    ]),
                Tables\Filters\SelectFilter::make('raison')
                    ->options([
                        'psy_indisponible' => 'Psy indisponible',
                        'demande_etudiant' => 'Demande étudiant',
                        'decision_admin' => 'Décision admin',
                        'transfert_psy' => 'Transfert psy',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('approuver')
                    ->label('Approuver')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->visible(fn ($record) => $record->statut === 'en_attente')
                    ->requiresConfirmation()
                    ->action(function ($record) {
                        $etudiant = $record->etudiant;
                        $etudiant->update([
                            'psy_referent_id' => $record->nouveau_psy_id,
                            'psy_referent_depuis' => now(),
                        ]);
                        $record->update([
                            'statut' => 'approuve',
                            'approuve_le' => now(),
                        ]);
                    }),
                Tables\Actions\Action::make('refuser')
                    ->label('Refuser')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->visible(fn ($record) => $record->statut === 'en_attente')
                    ->requiresConfirmation()
                    ->action(fn ($record) => $record->update(['statut' => 'refuse'])),
                Tables\Actions\EditAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTransfertDossiers::route('/'),
            'edit' => Pages\EditTransfertDossier::route('/{record}/edit'),
        ];
    }
}
