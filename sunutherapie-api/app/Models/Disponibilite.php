<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Disponibilite extends Model
{
    protected $fillable = [
        'psychologue_id',
        'date',
        'titre',
        'jour_semaine',
        'heure_debut',
        'heure_fin',
        'duree',
        'type',
        'note',
        'rappels',
        'actif',
        'notifier_admin',
    ];

    protected $casts = [
        'actif' => 'boolean',
        'notifier_admin' => 'boolean',
        'rappels' => 'array',
        'date' => 'date',
    ];

    public function psychologue(): BelongsTo
    {
        return $this->belongsTo(Psychologue::class, 'psychologue_id');
    }
}
