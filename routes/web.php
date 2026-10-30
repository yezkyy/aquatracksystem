<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FinancialController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

// Redirect root to dashboard (auth middleware will handle guest redirection to login)
Route::redirect('/', '/dashboard');

// Protected Routes (Require Authentication)
Route::middleware(['auth'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Project Map
    Route::get('/map', [ProjectController::class, 'map'])->name('projects.map');

    // Projects CRUD
    Route::resource('projects', ProjectController::class);

    // Activities
    Route::resource('activities', ActivityController::class)->only(['index', 'create', 'store', 'destroy']);

    // Financial (Expenses and Harvests)
    Route::get('/financial', [FinancialController::class, 'index'])->name('financial.index');
    Route::post('/financial/expense', [FinancialController::class, 'storeExpense'])->name('financial.expense.store');
    Route::delete('/financial/expense/{expense}', [FinancialController::class, 'destroyExpense'])->name('financial.expense.destroy');
    Route::post('/financial/harvest', [FinancialController::class, 'storeHarvest'])->name('financial.harvest.store');
    Route::delete('/financial/harvest/{harvest}', [FinancialController::class, 'destroyHarvest'])->name('financial.harvest.destroy');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    // Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile.update');
    Route::post('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password.update');
});
