<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Etudiant extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'psy_referent_id',
        'psy_referent_depuis',
        'numero_etudiant',
        'numero_carte_etudiant',
        'universite',
        'faculte',
        'niveau',
        'date_naissance',
        'genre',
        'ville',
        'total_consultations',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'psy_referent_depuis' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function psyReferent()
    {
        return $this->belongsTo(Psychologue::class, 'psy_referent_id');
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class, 'etudiant_id');
    }

    public function ressources()
    {
        return $this->belongsToMany(Ressource::class, 'ressource_etudiant')
            ->withPivot('lu', 'lu_le')
            ->withTimestamps();
    }

    public function transferts()
    {
        return $this->hasMany(TransfertDossier::class);
    }
}
