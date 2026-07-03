<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeRdv extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id',
        'date_proposee_1',
        'date_proposee_2',
        'date_proposee_3',
        'message_etudiant',
        'message_psychologue',
    ];

    protected $casts = [
        'date_proposee_1' => 'datetime',
        'date_proposee_2' => 'datetime',
        'date_proposee_3' => 'datetime',
    ];

    // Relations
    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }
}
