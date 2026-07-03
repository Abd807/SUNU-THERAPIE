<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'statut',
        'telephone',
        'photo',
        'verification_code',
        'verification_expires_at',
        'email_verified',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'verification_code',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'verification_expires_at' => 'datetime',
        'email_verified' => 'boolean',
        'password' => 'hashed',
    ];

    // FILAMENT ACCESS
    public function canAccessPanel(Panel $panel): bool
    {
        return $this->role === 'admin';
    }

    // Relations
    public function psychologue()
    {
        return $this->hasOne(Psychologue::class);
    }

    public function etudiant()
    {
        return $this->hasOne(Etudiant::class);
    }

    public function consultationsEtudiant()
    {
        return $this->hasManyThrough(Consultation::class, Etudiant::class, 'user_id', 'etudiant_id', 'id', 'id');
    }

    public function consultationsPsychologue()
    {
        return $this->hasManyThrough(Consultation::class, Psychologue::class, 'user_id', 'psychologue_id', 'id', 'id');
    }

    // Scopes
    public function scopeAdmin($query)
    {
        return $query->where('role', 'admin');
    }

    public function scopePsychologue($query)
    {
        return $query->where('role', 'psychologue');
    }

    public function scopeEtudiant($query)
    {
        return $query->where('role', 'etudiant');
    }

    public function scopeActif($query)
    {
        return $query->where('statut', 'actif');
    }

    // Helpers
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isPsychologue()
    {
        return $this->role === 'psychologue';
    }

    public function isEtudiant()
    {
        return $this->role === 'etudiant';
    }
}
