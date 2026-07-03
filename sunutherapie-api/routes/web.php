<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardExportController;

// Page d'accueil
Route::get('/', function () {
    return view('welcome');
});

// ─── Export PDF (admin connecté uniquement) ───
Route::middleware(['auth'])->group(function () {
    Route::get('/admin/dashboard/export-pdf', [DashboardExportController::class, 'exportPdf'])
        ->name('dashboard.export.pdf');
});
