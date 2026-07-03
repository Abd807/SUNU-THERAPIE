<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    protected $fillable = [
        'etudiant_id',
        'psychologue_id',
        'type',
        'mode',
        'statut',
        'date_consultation',
        'date_debut',
        'date_fin',
        'duree_minutes',
        'motif_consultation',
        'motif_refus',
        'agora_channel_name',
        'note_etudiant',
        'commentaire_etudiant',
    ];

    protected $casts = [
        'date_consultation' => 'datetime',
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'note_etudiant' => 'decimal:2',
    ];

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class, 'etudiant_id');
    }

    public function psychologue()
    {
        return $this->belongsTo(Psychologue::class, 'psychologue_id');
    }
}
