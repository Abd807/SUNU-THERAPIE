<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sponsor;
use Illuminate\Http\Request;

class SponsorController extends Controller
{
    // Liste des sponsors actifs
    public function index()
    {
        try {
            $sponsors = Sponsor::where('actif', true)
                ->orderBy('ordre')
                ->orderByRaw("FIELD(niveau, 'officiel', 'associe', 'contributeur')")
                ->get();

            return response()->json([
                'success' => true,
                'sponsors' => $sponsors
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Détail d'un sponsor
    public function show($id)
    {
        try {
            $sponsor = Sponsor::where('actif', true)->findOrFail($id);

            return response()->json([
                'success' => true,
                'sponsor' => $sponsor
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
