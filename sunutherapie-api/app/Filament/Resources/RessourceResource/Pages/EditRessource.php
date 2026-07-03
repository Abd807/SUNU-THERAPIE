<?php

namespace App\Filament\Resources\RessourceResource\Pages;

use App\Filament\Resources\RessourceResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditRessource extends EditRecord
{
    protected static string $resource = RessourceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
