<?php

namespace App\Filament\Resources\TransfertDossierResource\Pages;

use App\Filament\Resources\TransfertDossierResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditTransfertDossier extends EditRecord
{
    protected static string $resource = TransfertDossierResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
