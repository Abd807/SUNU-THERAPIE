<?php

namespace App\Filament\Resources\BibliothequeResource\Pages;

use App\Filament\Resources\BibliothequeResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListBibliotheques extends ListRecords
{
    protected static string $resource = BibliothequeResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
