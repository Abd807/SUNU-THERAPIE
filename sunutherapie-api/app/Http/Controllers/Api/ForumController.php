<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ForumPost;
use App\Models\ForumComment;
use Illuminate\Http\Request;

class ForumController extends Controller
{
    // ─── Liste des posts ───
    public function index()
    {
        $posts = ForumPost::where('actif', true)
            ->with(['user', 'commentaires.user'])
            ->withCount('commentaires')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'titre' => $post->titre,
                    'contenu' => $post->contenu,
                    'likes' => $post->likes,
                    'commentaires_count' => $post->commentaires_count,
                    'created_at' => $post->created_at,
                    'auteur' => $post->anonyme ? 'Anonyme' : $post->user->name,
                    'anonyme' => $post->anonyme,
                    'commentaires' => $post->commentaires->map(function ($c) {
                        return [
                            'id' => $c->id,
                            'contenu' => $c->contenu,
                            'created_at' => $c->created_at,
                            'auteur' => $c->anonyme ? 'Anonyme' : $c->user->name,
                            'anonyme' => $c->anonyme,
                            'is_psy' => $c->user->role === 'psychologue',
                        ];
                    }),
                ];
            });

        return response()->json(['success' => true, 'data' => $posts]);
    }

    // ─── Créer un post ───
    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'contenu' => 'required|string',
            'anonyme' => 'boolean',
        ]);

        $post = ForumPost::create([
            'user_id' => $request->user()->id,
            'titre' => $request->titre,
            'contenu' => $request->contenu,
            'anonyme' => $request->anonyme ?? false,
            'actif' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Post créé avec succès',
            'data' => $post
        ], 201);
    }

    // ─── Liker un post ───
    public function liker($id)
    {
        $post = ForumPost::findOrFail($id);
        $post->increment('likes');
        return response()->json(['success' => true, 'likes' => $post->likes]);
    }

    // ─── Commenter un post ───
    public function commenter(Request $request, $id)
    {
        $request->validate([
            'contenu' => 'required|string',
            'anonyme' => 'boolean',
        ]);

        $post = ForumPost::findOrFail($id);

        $commentaire = ForumComment::create([
            'forum_post_id' => $post->id,
            'user_id' => $request->user()->id,
            'contenu' => $request->contenu,
            'anonyme' => $request->anonyme ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Commentaire ajouté',
            'data' => [
                'id' => $commentaire->id,
                'contenu' => $commentaire->contenu,
                'created_at' => $commentaire->created_at,
                'auteur' => $commentaire->anonyme ? 'Anonyme' : $request->user()->name,
                'anonyme' => $commentaire->anonyme,
                'is_psy' => $request->user()->role === 'psychologue',
            ]
        ], 201);
    }

    // ─── Supprimer un post (auteur ou admin) ───
    public function destroy(Request $request, $id)
    {
        $post = ForumPost::findOrFail($id);
        $user = $request->user();

        if ($post->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
        }

        $post->update(['actif' => false]);
        return response()->json(['success' => true, 'message' => 'Post supprimé']);
    }
}
