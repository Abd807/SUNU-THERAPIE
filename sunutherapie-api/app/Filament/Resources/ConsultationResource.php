<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ConsultationResource\Pages;
use App\Models\Consultation;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ConsultationResource extends Resource
{
    protected static ?string $model = Consultation::class;
    protected static ?string $navigationIcon = 'heroicon-o-calendar';
    protected static ?string $navigationLabel = 'Consultations';
    protected static ?string $pluralLabel = 'Consultations';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Détails')
                ->schema([
                    Forms\Components\TextInput::make('etudiant.user.name')
                        ->label('Étudiant')
                        ->disabled(),
                    Forms\Components\TextInput::make('psychologue.user.name')
                        ->label('Psychologue')
                        ->disabled(),
                    Forms\Components\DateTimePicker::make('date_consultation')
                        ->label('Date')
                        ->disabled(),
                    Forms\Components\Select::make('statut')
                        ->label('Statut')
                        ->options([
                            'en_attente' => 'En attente',
                            'acceptee' => 'Acceptée',
                            'refusee' => 'Refusée',
                            'en_cours' => 'En cours',
                            'terminee' => 'Terminée',
                            'annulee' => 'Annulée',
                        ])
                        ->required(),
                    Forms\Components\Toggle::make('video_active')
                        ->label('Vidéo')
                        ->disabled(),
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
                Tables\Columns\TextColumn::make('psychologue.user.name')
                    ->label('Psychologue')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('date_consultation')
                    ->label('Date RDV')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Demande reçue')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('statut')
                    ->label('Statut')
                    ->badge()
                    ->colors([
                        'warning' => 'en_attente',
                        'success' => 'acceptee',
                        'primary' => 'en_cours',
                        'gray' => 'terminee',
                        'danger' => 'refusee',
                    ])
                    ->formatStateUsing(fn (string $state): string => match($state) {
                        'en_attente' => 'En attente',
                        'acceptee' => 'Acceptée',
                        'refusee' => 'Refusée',
                        'en_cours' => 'En cours',
                        'terminee' => 'Terminée',
                        'annulee' => 'Annulée',
                        default => $state
                    }),
                Tables\Columns\IconColumn::make('video_active')
                    ->label('Mode')
                    ->boolean()
                    ->trueIcon('heroicon-o-video-camera')
                    ->falseIcon('heroicon-o-microphone')
                    ->trueColor('success')
                    ->falseColor('warning'),
                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->colors([
                        'primary' => 'planifiee',
                        'warning' => 'directe',
                        'danger' => 'urgence',
                    ]),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('statut')
                    ->options([
                        'en_attente' => 'En attente',
                        'acceptee' => 'Acceptée',
                        'refusee' => 'Refusée',
                        'en_cours' => 'En cours',
                        'terminee' => 'Terminée',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListConsultations::route('/'),
            'edit' => Pages\EditConsultation::route('/{record}/edit'),
        ];
    }
}
