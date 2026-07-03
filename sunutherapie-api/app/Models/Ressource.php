<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ressource extends Model
{
    use HasFactory;

    protected $fillable = [
        'psychologue_id',
        'titre',
        'description',
        'type',
        'categorie',
        'url',
        'fichier_path',
        'destinataires',
        'likes',
        'actif',
        'public',
    ];

    protected $casts = [
        'actif' => 'boolean',
        'public' => 'boolean',
    ];

    public function psychologue()
    {
        return $this->belongsTo(Psychologue::class);
    }

    public function etudiants()
    {
        return $this->belongsToMany(Etudiant::class, 'ressource_etudiant')
            ->withPivot('lu', 'lu_le')
            ->withTimestamps();
    }
}
