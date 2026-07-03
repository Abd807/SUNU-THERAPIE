<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Etudiant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // ─── INSCRIPTION ÉTUDIANT ───
    public function registerEtudiant(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'telephone' => 'nullable|string|max:20',
            'numero_carte_etudiant' => 'required|string|max:50|unique:etudiants,numero_carte_etudiant',
            'universite' => 'required|string|max:255',
            'faculte' => 'required|string|max:255',
            'niveau' => 'required|in:L1,L2,L3,M1,M2,Doctorat',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Créer l'utilisateur (compte directement actif - OTP désactivé temporairement)
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'etudiant',
            'statut' => 'actif',
            'telephone' => $request->telephone,
            'email_verified' => true,
        ]);

        // Créer le profil étudiant
        Etudiant::create([
            'user_id' => $user->id,
            'numero_carte_etudiant' => $request->numero_carte_etudiant,
            'universite' => $request->universite,
            'faculte' => $request->faculte,
            'niveau' => $request->niveau,
        ]);

        // Charger la relation etudiant
        $user->load('etudiant');

        // Générer le token Sanctum pour connexion automatique
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Compte créé avec succès. Bienvenue sur SunuThérapie !',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    // ─── VÉRIFIER LE CODE EMAIL ───
    public function verifyEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Compte introuvable'], 404);
        }

        if ($user->email_verified) {
            return response()->json(['success' => false, 'message' => 'Compte déjà vérifié'], 400);
        }

        if ($user->verification_code !== $request->code) {
            return response()->json(['success' => false, 'message' => 'Code incorrect'], 400);
        }

        if (now()->isAfter($user->verification_expires_at)) {
            return response()->json(['success' => false, 'message' => 'Code expiré. Demandez un nouveau code.'], 400);
        }

        // Activer le compte
        $user->update([
            'statut' => 'actif',
            'email_verified' => true,
            'verification_code' => null,
            'verification_expires_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Compte vérifié avec succès ! Vous pouvez maintenant vous connecter.',
        ]);
    }

    // ─── RENVOYER LE CODE DE VÉRIFICATION ───
    public function resendVerification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Compte introuvable'], 404);
        }

        if ($user->email_verified) {
            return response()->json(['success' => false, 'message' => 'Compte déjà vérifié'], 400);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->update([
            'verification_code' => $code,
            'verification_expires_at' => now()->addMinutes(10),
        ]);

        try {
            $user->notify(new \App\Notifications\VerificationEmail($code));
        } catch (\Exception $e) {
            Log::error('Erreur renvoi email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Nouveau code envoyé à votre email.',
        ]);
    }

    // ─── CONNEXION ───
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        // Vérifier si l'email est vérifié
        if ($user->role === 'etudiant' && !$user->email_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Veuillez vérifier votre email avant de vous connecter.',
                'needs_verification' => true,
                'email' => $user->email,
            ], 403);
        }

        // Vérifier le statut
        if ($user->statut !== 'actif') {
            return response()->json([
                'success' => false,
                'message' => 'Votre compte n\'est pas encore actif. Contactez l\'administration.'
            ], 403);
        }

        // Charger les relations selon le rôle
        if ($user->role === 'psychologue') {
            $user->load('psychologue');
        } elseif ($user->role === 'etudiant') {
            $user->load('etudiant');
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie',
            'user' => $user,
            'token' => $token,
        ]);
    }

    // ─── DÉCONNEXION ───
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie'
        ]);
    }

    // ─── PROFIL ───
    public function profile(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'psychologue') {
            $user->load('psychologue');
        } elseif ($user->role === 'etudiant') {
            $user->load('etudiant');
        }

        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    }

    // ─── METTRE À JOUR LE PROFIL ───
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'photo' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['name', 'telephone', 'photo']));

        if ($user->role === 'etudiant' && $user->etudiant) {
            $user->etudiant->update($request->only([
                'numero_carte_etudiant',
                'universite',
                'faculte',
                'niveau',
            ]));
        }

        if ($user->role === 'psychologue' && $user->psychologue) {
            $user->psychologue->update($request->only([
                'bio',
                'specialites',
                'annees_experience',
                'diplome',
                'etablissement'
            ]));
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour',
            'user' => $user->fresh()->load($user->role)
        ]);
    }
}
