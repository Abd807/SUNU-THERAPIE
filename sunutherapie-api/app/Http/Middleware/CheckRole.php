<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié'
            ], 401);
        }

        // Si l'utilisateur est admin, il a accès à tout
        if ($request->user()->role === 'admin') {
            return $next($request);
        }

        // Sinon vérifie le rôle demandé
        if ($request->user()->role !== $role) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé. Rôle requis: ' . $role
            ], 403);
        }

        return $next($request);
    }
}
