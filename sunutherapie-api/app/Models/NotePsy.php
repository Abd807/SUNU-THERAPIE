<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotePsy extends Model
{
    protected $table = 'notes_psy';

    protected $fillable = [
        'psychologue_id',
        'etudiant_id',
        'consultation_id',
        'titre',
        'contenu',
        'type',
        'partagee_avec_etudiant',
        'partagee_le',
    ];

    protected $casts = [
        'partagee_avec_etudiant' => 'boolean',
        'partagee_le' => 'datetime',
    ];

    public function psychologue(): BelongsTo
    {
        return $this->belongsTo(Psychologue::class);
    }

    public function etudiant(): BelongsTo
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }
}
