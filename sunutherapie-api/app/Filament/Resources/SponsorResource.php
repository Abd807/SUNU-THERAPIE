<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SponsorResource\Pages;
use App\Models\Sponsor;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SponsorResource extends Resource
{
    protected static ?string $model = Sponsor::class;
    protected static ?string $navigationIcon = 'heroicon-o-star';
    protected static ?string $navigationLabel = 'Sponsors';
    protected static ?string $navigationGroup = 'Contenu';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Informations')
                ->schema([
                    Forms\Components\TextInput::make('nom')
                        ->label('Nom du sponsor')
                        ->required()
                        ->maxLength(255),
                    Forms\Components\TextInput::make('url')
                        ->label('Site web')
                        ->url()
                        ->maxLength(255),
                    Forms\Components\Select::make('niveau')
                        ->label('Niveau de partenariat')
                        ->options([
                            'officiel' => 'Officiel',
                            'associe' => 'Associé',
                            'contributeur' => 'Contributeur',
                        ])
                        ->required()
                        ->default('contributeur'),
                    Forms\Components\TextInput::make('ordre')
                        ->label('Ordre d\'affichage')
                        ->numeric()
                        ->default(0),
                    Forms\Components\Textarea::make('description')
                        ->label('Description')
                        ->rows(3)
                        ->columnSpanFull(),
                    Forms\Components\TextInput::make('logo')
                        ->label('URL du logo')
                        ->url()
                        ->columnSpanFull(),
                ])->columns(2),

            Forms\Components\Section::make('Visibilité')
                ->schema([
                    Forms\Components\Toggle::make('actif')
                        ->label('Visible sur l\'application')
                        ->default(true),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('nom')
                    ->label('Nom')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('niveau')
                    ->label('Niveau')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match($state) {
                        'officiel' => 'Officiel',
                        'associe' => 'Associé',
                        'contributeur' => 'Contributeur',
                        default => $state
                    })
                    ->colors([
                        'success' => 'officiel',
                        'warning' => 'associe',
                        'gray' => 'contributeur',
                    ]),
                Tables\Columns\TextColumn::make('url')
                    ->label('Site web')
                    ->url(fn ($record) => $record->url)
                    ->limit(30),
                Tables\Columns\TextColumn::make('ordre')
                    ->label('Ordre')
                    ->sortable(),
                Tables\Columns\IconColumn::make('actif')
                    ->label('Actif')
                    ->boolean()
                    ->trueColor('success')
                    ->falseColor('danger'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créé le')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('niveau')
                    ->options([
                        'officiel' => 'Officiel',
                        'associe' => 'Associé',
                        'contributeur' => 'Contributeur',
                    ]),
                Tables\Filters\TernaryFilter::make('actif')
                    ->label('Actif'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->reorderable('ordre')
            ->defaultSort('ordre');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSponsors::route('/'),
            'create' => Pages\CreateSponsor::route('/create'),
            'edit' => Pages\EditSponsor::route('/{record}/edit'),
        ];
    }
}
