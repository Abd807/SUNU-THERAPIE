<?php

namespace App\Filament\Resources\RessourceResource\Pages;

use App\Filament\Resources\RessourceResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListRessources extends ListRecords
{
    protected static string $resource = RessourceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
