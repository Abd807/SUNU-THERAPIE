<?php

namespace App\Filament\Resources\BibliothequeResource\Pages;

use App\Filament\Resources\BibliothequeResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditBibliotheque extends EditRecord
{
    protected static string $resource = BibliothequeResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
