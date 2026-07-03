<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NoteConsultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id',
        'psychologue_id',
        'notes_privees',
        'recommandations',
        'tags',
        'suivi_recommande',
    ];

    protected $casts = [
        'tags' => 'array',
        'suivi_recommande' => 'boolean',
    ];

    // Relations
    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    public function psychologue()
    {
        return $this->belongsTo(User::class, 'psychologue_id');
    }
}
