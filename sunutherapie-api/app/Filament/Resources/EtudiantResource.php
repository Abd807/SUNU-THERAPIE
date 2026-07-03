<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EtudiantResource\Pages;
use App\Models\Etudiant;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class EtudiantResource extends Resource
{
    protected static ?string $model = Etudiant::class;
    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';
    protected static ?string $navigationLabel = 'Étudiants';
    protected static ?string $pluralLabel = 'Étudiants';

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Nom')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('user.email')
                    ->label('Email')
                    ->searchable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('user.telephone')
                    ->label('Téléphone')
                    ->searchable()
                    ->copyable()
                    ->default('N/A'),
                Tables\Columns\TextColumn::make('numero_carte_etudiant')
                    ->label('N° Carte')
                    ->searchable()
                    ->copyable()
                    ->default('N/A'),
                Tables\Columns\TextColumn::make('universite')
                    ->label('Université')
                    ->searchable(),
                Tables\Columns\TextColumn::make('faculte')
                    ->label('Faculté')
                    ->searchable(),
                Tables\Columns\TextColumn::make('niveau')
                    ->label('Niveau')
                    ->badge()
                    ->color('info'),
                Tables\Columns\TextColumn::make('total_consultations')
                    ->label('Consultations')
                    ->badge()
                    ->color('success')
                    ->default(0),
                Tables\Columns\TextColumn::make('psyReferent.user.name')
                    ->label('Psy référent')
                    ->default('Aucun')
                    ->searchable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Inscrit le')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('niveau')
                    ->label('Niveau')
                    ->options([
                        'L1' => 'L1',
                        'L2' => 'L2',
                        'L3' => 'L3',
                        'M1' => 'M1',
                        'M2' => 'M2',
                        'Doctorat' => 'Doctorat',
                    ]),
                Tables\Filters\TernaryFilter::make('psy_referent_id')
                    ->label('A un psy référent')
                    ->nullable(),
            ])
            ->actions([
                Tables\Actions\DeleteAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListEtudiants::route('/'),
        ];
    }
}
