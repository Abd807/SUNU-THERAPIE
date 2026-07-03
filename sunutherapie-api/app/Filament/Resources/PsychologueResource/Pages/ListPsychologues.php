<?php

namespace App\Filament\Resources\PsychologueResource\Pages;

use App\Filament\Resources\PsychologueResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListPsychologues extends ListRecords
{
    protected static string $resource = PsychologueResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
