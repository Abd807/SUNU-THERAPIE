<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bibliotheque;
use Illuminate\Http\Request;

class BibliothequeController extends Controller
{
    // Bibliothèque publique : livres et vidéos accessibles à tous les étudiants.
    public function index(Request $request)
    {
        try {
            $query = Bibliotheque::where('actif', true);

            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }
            if ($request->filled('categorie')) {
                $query->where('categorie', $request->categorie);
            }

            $items = $query->orderBy('created_at', 'desc')->get();

            return response()->json(['success' => true, 'data' => $items]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
