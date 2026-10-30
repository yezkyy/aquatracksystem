<?php

use App\Models\Activity;
use App\Models\ActivityRecord;
use App\Models\Expense;
use App\Models\Harvest;
use App\Models\Project;
use App\Models\User;
use App\Services\CultivationService;
use App\Services\FinancialService;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Set up default roles
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $this->operatorRole = Role::firstOrCreate(['name' => 'Operator']);

    // Set up test user
    $this->user = User::factory()->create([
        'name' => 'Budi Santoso',
        'email' => 'budi@aquatrack.com',
        'password' => Hash::make('password'),
    ]);
    $this->user->assignRole($this->adminRole);
});

test('guest is redirected to login page', function () {
    $response = $this->get('/dashboard');
    $response->assertStatus(302);
    $response->assertRedirect('/login');
});

test('authenticated user can access dashboard', function () {
    $response = $this->actingAs($this->user)->get('/dashboard');
    $response->assertStatus(200);
});

test('project creation validation works with Indonesian messages', function () {
    $response = $this->actingAs($this->user)->post('/projects', [
        'name' => '', // blank to trigger validation
        'commodity' => '',
        'location' => '',
        'start_date' => '',
        'target_harvest_date' => '',
        'initial_stock' => -100,
        'person_in_charge_id' => 999,
        'status' => 'invalid_status',
    ]);

    $response->assertSessionHasErrors([
        'name' => 'Nama proyek wajib diisi.',
        'commodity' => 'Komoditas wajib diisi.',
        'location' => 'Lokasi wajib diisi.',
        'start_date' => 'Tanggal mulai wajib diisi.',
        'target_harvest_date' => 'Target panen wajib diisi.',
        'initial_stock' => 'Jumlah tebar awal tidak boleh negatif.',
        'person_in_charge_id' => 'Penanggung jawab tidak terdaftar di sistem.',
        'status' => 'Status proyek tidak valid.',
    ]);
});

test('project is successfully created and stored in database', function () {
    $response = $this->actingAs($this->user)->post('/projects', [
        'name' => 'Siklus Udang Kolam D',
        'commodity' => 'Udang Vaname',
        'location' => 'Kolam D',
        'start_date' => '2026-08-01',
        'target_harvest_date' => '2026-11-29',
        'initial_stock' => 100000,
        'person_in_charge_id' => $this->user->id,
        'status' => 'active',
        'notes' => 'Proyek baru untuk uji coba tebar padat.',
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('projects', [
        'name' => 'Siklus Udang Kolam D',
        'commodity' => 'Udang Vaname',
        'location' => 'Kolam D',
        'initial_stock' => 100000,
        'status' => 'active',
    ]);
});

test('cultivation metrics calculate correctly in CultivationService', function () {
    $cultivationService = new CultivationService;

    // Create a mock project
    $project = Project::create([
        'name' => 'Tambak Uji Coba',
        'commodity' => 'Udang Vaname',
        'location' => 'Tambak 99',
        'start_date' => now()->subDays(30)->startOfDay(),
        'target_harvest_date' => now()->addDays(90)->startOfDay(), // 120 days total
        'initial_stock' => 10000,
        'person_in_charge_id' => $this->user->id,
        'status' => 'active',
    ]);

    // 1. Check DoC (running days)
    $runningDays = $cultivationService->getRunningDays($project);
    expect($runningDays)->toBe(31); // day 1 to day 31 is 30 days diff + 1

    // 2. Check Survival Rate (SR) with zero mortality
    expect($cultivationService->getSurvivalRate($project))->toBe(100.0);

    // 3. Record mortality activity
    $mort = Activity::create([
        'project_id' => $project->id,
        'user_id' => $this->user->id,
        'type' => 'mortality',
        'activity_date' => now(),
        'title' => 'Udang mati harian',
    ]);
    ActivityRecord::create([
        'activity_id' => $mort->id,
        'data' => ['quantity' => 1200], // 12% mortality
    ]);

    // Check SR is now 88%
    expect($cultivationService->getSurvivalRate($project))->toBe(88.0);

    // 4. Record sampling activity to set weight
    $samp = Activity::create([
        'project_id' => $project->id,
        'user_id' => $this->user->id,
        'type' => 'sampling',
        'activity_date' => now(),
        'title' => 'Sampling udang',
    ]);
    ActivityRecord::create([
        'activity_id' => $samp->id,
        'data' => [
            'sample_count' => 50,
            'average_weight' => 15.0, // 15g average weight
            'estimated_biomass' => 132.0,
        ],
    ]);

    // Check average weight
    expect($cultivationService->getAverageWeight($project))->toBe(15.0);

    // Check dynamic biomass calculation: Live population = 8800 * 15g = 132000g = 132kg
    expect($cultivationService->getBiomass($project))->toBe(132.0);

    // 5. Record feeding to check FCR
    $feed = Activity::create([
        'project_id' => $project->id,
        'user_id' => $this->user->id,
        'type' => 'feeding',
        'activity_date' => now(),
        'title' => 'Feeding log',
    ]);
    ActivityRecord::create([
        'activity_id' => $feed->id,
        'data' => [
            'feed_type' => 'Pellet B',
            'quantity' => 198.0, // 198kg feed
            'unit' => 'kg',
        ],
    ]);

    // FCR = Total Feed / Biomass = 198 / 132 = 1.5
    expect($cultivationService->getFcr($project))->toBe(1.50);
});

test('financial metrics calculate correctly in FinancialService', function () {
    $financialService = new FinancialService;

    // Create a mock project
    $project = Project::create([
        'name' => 'Tambak Keuangan',
        'commodity' => 'Ikan Nila',
        'location' => 'Tambak 5',
        'start_date' => now()->subDays(60),
        'target_harvest_date' => now()->addDays(30),
        'initial_stock' => 5000,
        'person_in_charge_id' => $this->user->id,
        'status' => 'active',
    ]);

    // Record expenses
    Expense::create([
        'project_id' => $project->id,
        'user_id' => $this->user->id,
        'title' => 'Benih ikan',
        'category' => 'seed',
        'amount' => 5000000.00,
        'expense_date' => now()->subDays(58),
    ]);

    Expense::create([
        'project_id' => $project->id,
        'user_id' => $this->user->id,
        'title' => 'Pakan ikan',
        'category' => 'feed',
        'amount' => 8500000.00,
        'expense_date' => now()->subDays(30),
    ]);

    // Record harvests
    Harvest::create([
        'project_id' => $project->id,
        'user_id' => $this->user->id,
        'harvest_date' => now()->subDays(2),
        'quantity' => 800.0,
        'price_per_kg' => 25000.00,
        'revenue' => 20000000.00, // 800 * 25000
    ]);

    // Calculations
    expect($financialService->getTotalExpenses($project))->toBe(13500000.00);
    expect($financialService->getTotalRevenue($project))->toBe(20000000.00);
    expect($financialService->getProfit($project))->toBe(6500000.00); // 20M - 13.5M
});
