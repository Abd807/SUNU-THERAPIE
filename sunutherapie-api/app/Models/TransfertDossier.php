<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransfertDossier extends Model
{
    use HasFactory;

    protected $table = 'transferts_dossier'; // ← correction ici

    protected $fillable = [
        'etudiant_id',
        'ancien_psy_id',
        'nouveau_psy_id',
        'demande_par',
        'statut',
        'raison',
        'motif',
        'approuve_le',
    ];

    protected $casts = [
        'approuve_le' => 'datetime',
    ];

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function ancienPsy()
    {
        return $this->belongsTo(Psychologue::class, 'ancien_psy_id');
    }

    public function nouveauPsy()
    {
        return $this->belongsTo(Psychologue::class, 'nouveau_psy_id');
    }

    public function demandePar()
    {
        return $this->belongsTo(User::class, 'demande_par');
    }
}
