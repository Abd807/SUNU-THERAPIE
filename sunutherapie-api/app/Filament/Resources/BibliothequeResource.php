<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BibliothequeResource\Pages;
use App\Models\Bibliotheque;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class BibliothequeResource extends Resource
{
    protected static ?string $model = Bibliotheque::class;
    protected static ?string $navigationIcon = 'heroicon-o-book-open';
    protected static ?string $navigationLabel = 'Bibliothèque';
    protected static ?string $modelLabel = 'ressource bibliothèque';
    protected static ?string $pluralModelLabel = 'bibliothèque';
    protected static ?string $navigationGroup = 'Contenu';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Informations')
                ->schema([
                    Forms\Components\Select::make('type')
                        ->label('Type')
                        ->options([
                            'livre' => 'Livre (PDF)',
                            'video' => 'Vidéo (lien)',
                        ])
                        ->default('livre')
                        ->required()
                        ->live(),
                    Forms\Components\TextInput::make('titre')
                        ->label('Titre')
                        ->required()
                        ->maxLength(255),
                    Forms\Components\TextInput::make('auteur')
                        ->label('Auteur')
                        ->maxLength(255)
                        ->visible(fn (Get $get) => $get('type') === 'livre'),
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
                        ->default('autre')
                        ->required(),
                    Forms\Components\Textarea::make('description')
                        ->label('Description')
                        ->rows(3)
                        ->columnSpanFull(),
                ])->columns(2),

            Forms\Components\Section::make('Média')
                ->schema([
                    Forms\Components\FileUpload::make('fichier_path')
                        ->label('Fichier PDF du livre')
                        ->disk('public')
                        ->directory('bibliotheque/pdf')
                        ->acceptedFileTypes(['application/pdf'])
                        ->maxSize(51200)
                        ->visible(fn (Get $get) => $get('type') === 'livre'),
                    Forms\Components\TextInput::make('url')
                        ->label('Lien de la vidéo (YouTube / URL)')
                        ->url()
                        ->maxLength(2048)
                        ->visible(fn (Get $get) => $get('type') === 'video'),
                    Forms\Components\FileUpload::make('couverture_path')
                        ->label('Image de couverture')
                        ->image()
                        ->disk('public')
                        ->directory('bibliotheque/couvertures')
                        ->imageEditor()
                        ->columnSpanFull(),
                ])->columns(2),

            Forms\Components\Section::make('Publication')
                ->schema([
                    Forms\Components\Toggle::make('actif')
                        ->label('Visible par tous les étudiants')
                        ->default(true),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('couverture_path')
                    ->label('')
                    ->disk('public')
                    ->height(44),
                Tables\Columns\TextColumn::make('titre')
                    ->label('Titre')
                    ->searchable()
                    ->sortable()
                    ->limit(40),
                Tables\Columns\TextColumn::make('auteur')
                    ->label('Auteur')
                    ->searchable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->formatStateUsing(fn ($state) => $state === 'livre' ? 'Livre' : 'Vidéo')
                    ->colors([
                        'warning' => 'livre',
                        'danger' => 'video',
                    ]),
                Tables\Columns\TextColumn::make('categorie')
                    ->label('Catégorie')
                    ->badge()
                    ->color('info'),
                Tables\Columns\IconColumn::make('actif')
                    ->label('Visible')
                    ->boolean()
                    ->trueColor('success')
                    ->falseColor('danger'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ajouté le')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options(['livre' => 'Livre', 'video' => 'Vidéo']),
                Tables\Filters\TernaryFilter::make('actif')->label('Visible'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBibliotheques::route('/'),
            'create' => Pages\CreateBibliotheque::route('/create'),
            'edit' => Pages\EditBibliotheque::route('/{record}/edit'),
        ];
    }
}
