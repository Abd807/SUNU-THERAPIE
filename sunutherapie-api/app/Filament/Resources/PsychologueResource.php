<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PsychologueResource\Pages;
use App\Models\Psychologue;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PsychologueResource extends Resource
{
    protected static ?string $model = Psychologue::class;
    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationLabel = 'Psychologues';
    protected static ?string $modelLabel = 'Psychologue';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informations Utilisateur')
                    ->schema([
                        Forms\Components\TextInput::make('user.name')
                            ->label('Nom complet *')
                            ->required()
                            ->maxLength(255),
                        
                        Forms\Components\TextInput::make('user.email')
                            ->label('Email *')
                            ->email()
                            ->required()
                            ->unique(table: 'users', column: 'email', ignorable: fn ($record) => $record?->user)
                            ->maxLength(255),
                        
                        Forms\Components\TextInput::make('password')
                            ->label('Mot de passe *')
                            ->password()
                            ->required(fn (string $context): bool => $context === 'create')
                            ->minLength(8)
                            ->dehydrated(fn ($state) => filled($state))
                            ->helperText('Laissez vide pour conserver le mot de passe actuel'),
                        
                        Forms\Components\TextInput::make('user.telephone')
                            ->label('Téléphone')
                            ->tel()
                            ->maxLength(20),
                    ])->columns(2),

                Forms\Components\Section::make('Informations Professionnelles (Optionnelles)')
                    ->schema([
                        Forms\Components\TextInput::make('numero_ordre')
                            ->label('Numéro d\'ordre IREMPT')
                            ->maxLength(50),
                        
                        Forms\Components\TextInput::make('diplome')
                            ->label('Diplôme')
                            ->maxLength(255),
                        
                        Forms\Components\TextInput::make('etablissement')
                            ->label('Établissement')
                            ->maxLength(255),
                        
                        Forms\Components\TextInput::make('annees_experience')
                            ->label('Années d\'expérience')
                            ->numeric()
                            ->default(0),
                        
                        Forms\Components\TagsInput::make('specialites')
                            ->label('Spécialités')
                            ->suggestions([
                                'Anxiété',
                                'Dépression',
                                'Stress académique',
                                'Troubles du sommeil',
                                'Addictions',
                                'Relations familiales',
                                'Estime de soi',
                                'Orientation professionnelle',
                            ]),
                        
                        Forms\Components\Textarea::make('bio')
                            ->label('Biographie')
                            ->rows(4)
                            ->columnSpanFull(),
                    ])->columns(2),

                Forms\Components\Section::make('Disponibilité')
                    ->schema([
                        Forms\Components\Toggle::make('disponible')
                            ->label('Disponible pour consultations')
                            ->default(true),
                        
                        Forms\Components\Toggle::make('urgence')
                            ->label('Disponible pour urgences')
                            ->default(false),
                    ])->columns(2),
            ]);
    }

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
                    ->default('N/A'),
                
                Tables\Columns\TextColumn::make('numero_ordre')
                    ->label('N° Ordre')
                    ->searchable()
                    ->default('N/A'),
                
                Tables\Columns\IconColumn::make('disponible')
                    ->label('Disponible')
                    ->boolean()
                    ->trueColor('success')
                    ->falseColor('danger'),
                
                Tables\Columns\TextColumn::make('note_moyenne')
                    ->label('Note')
                    ->suffix('/5')
                    ->default('N/A'),
                
                Tables\Columns\TextColumn::make('total_consultations')
                    ->label('Consultations')
                    ->badge()
                    ->default(0),
                
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Créé le')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('disponible')
                    ->label('Disponible'),
                Tables\Filters\TernaryFilter::make('urgence')
                    ->label('Urgences'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
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
            'index' => Pages\ListPsychologues::route('/'),
            'create' => Pages\CreatePsychologue::route('/create'),
            'edit' => Pages\EditPsychologue::route('/{record}/edit'),
        ];
    }
}
