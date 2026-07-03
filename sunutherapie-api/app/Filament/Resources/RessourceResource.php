<?php

namespace App\Filament\Resources;

use App\Filament\Resources\RessourceResource\Pages;
use App\Models\Ressource;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class RessourceResource extends Resource
{
    protected static ?string $model = Ressource::class;
    protected static ?string $navigationIcon = 'heroicon-o-book-open';
    protected static ?string $navigationLabel = 'Ressources';
    protected static ?string $navigationGroup = 'Contenu';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Informations')
                ->schema([
                    Forms\Components\TextInput::make('titre')
                        ->label('Titre')
                        ->required()
                        ->maxLength(255),
                    Forms\Components\Textarea::make('description')
                        ->label('Description')
                        ->rows(3)
                        ->columnSpanFull(),
                    Forms\Components\Select::make('type')
                        ->label('Type')
                        ->options([
                            'lien_youtube' => 'Lien YouTube',
                            'lien_web' => 'Lien Web',
                            'video_upload' => 'Vidéo uploadée',
                            'pdf' => 'PDF',
                            'audio' => 'Audio',
                            'note' => 'Note texte',
                        ])
                        ->required(),
                    Forms\Components\Select::make('categorie')
                        ->label('Catégorie')
                        ->options([
                            'anxiete' => 'Anxiété',
                            'depression' => 'Dépression',
                            'stress' => 'Stress',
                            'sommeil' => 'Sommeil',
                            'confiance' => 'Confiance en soi',
                            'deuil' => 'Deuil',
                            'autre' => 'Autre',
                        ])
                        ->required(),
                    Forms\Components\TextInput::make('url')
                        ->label('URL / Lien')
                        ->url()
                        ->columnSpanFull(),
                ])->columns(2),

            Forms\Components\Section::make('Modération')
                ->schema([
                    Forms\Components\Toggle::make('actif')
                        ->label('Approuvé et visible')
                        ->helperText('Activer pour publier la ressource')
                        ->default(false),
                    Forms\Components\Toggle::make('public')
                        ->label('Public (visible par tous les étudiants)')
                        ->default(false),
                ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('titre')
                    ->label('Titre')
                    ->searchable()
                    ->sortable()
                    ->limit(40),
                Tables\Columns\TextColumn::make('psychologue.user.name')
                    ->label('Psychothérapeute')
                    ->searchable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match($state) {
                        'lien_youtube' => 'YouTube',
                        'lien_web' => 'Lien Web',
                        'video_upload' => 'Vidéo',
                        'pdf' => 'PDF',
                        'audio' => 'Audio',
                        'note' => 'Note',
                        default => $state
                    })
                    ->colors([
                        'danger' => 'lien_youtube',
                        'info' => 'lien_web',
                        'success' => 'video_upload',
                        'warning' => 'pdf',
                        'gray' => 'note',
                    ]),
                Tables\Columns\TextColumn::make('categorie')
                    ->label('Catégorie')
                    ->badge()
                    ->color('info'),
                Tables\Columns\IconColumn::make('actif')
                    ->label('Approuvé')
                    ->boolean()
                    ->trueColor('success')
                    ->falseColor('danger'),
                Tables\Columns\IconColumn::make('public')
                    ->label('Public')
                    ->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créé le')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'lien_youtube' => 'YouTube',
                        'lien_web' => 'Lien Web',
                        'video_upload' => 'Vidéo',
                        'pdf' => 'PDF',
                        'audio' => 'Audio',
                        'note' => 'Note',
                    ]),
                Tables\Filters\TernaryFilter::make('actif')
                    ->label('Approuvé'),
            ])
            ->actions([
                Tables\Actions\Action::make('approuver')
                    ->label('Approuver')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->visible(fn ($record) => !$record->actif)
                    ->action(fn ($record) => $record->update(['actif' => true])),
                Tables\Actions\Action::make('rejeter')
                    ->label('Rejeter')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->visible(fn ($record) => $record->actif)
                    ->action(fn ($record) => $record->update(['actif' => false])),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRessources::route('/'),
            'edit' => Pages\EditRessource::route('/{record}/edit'),
        ];
    }
}
