<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bibliotheque extends Model
{
    protected $table = 'bibliotheque';

    protected $fillable = [
        'titre',
        'auteur',
        'type',
        'categorie',
        'description',
        'url',
        'fichier_path',
        'couverture_path',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    protected $appends = ['fichier_url', 'couverture_url'];

    public function getFichierUrlAttribute()
    {
        return $this->fichier_path ? asset('storage/' . $this->fichier_path) : null;
    }

    public function getCouvertureUrlAttribute()
    {
        return $this->couverture_path ? asset('storage/' . $this->couverture_path) : null;
    }
}
