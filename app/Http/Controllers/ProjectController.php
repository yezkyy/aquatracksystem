<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Models\Project;
use App\Models\User;
use App\Services\CultivationService;
use App\Services\FinancialService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    protected CultivationService $cultivationService;

    protected FinancialService $financialService;

    public function __construct(CultivationService $cultivationService, FinancialService $financialService)
    {
        $this->cultivationService = $cultivationService;
        $this->financialService = $financialService;
    }

    /**
     * Display projects on an interactive map.
     */
    public function map(Request $request): Response
    {
        $projects = Project::with(['personInCharge', 'activities' => function($q) {
            $q->where('type', 'water_quality')->with('record')->orderBy('activity_date', 'desc');
        }])->get()->map(function ($project) {
            $runningDays = $this->cultivationService->getRunningDays($project);
            $targetDays = $this->cultivationService->getTargetDurationDays($project);
            $progress = $this->cultivationService->getProgressPercentage($project);
            $biomass = $this->cultivationService->getBiomass($project);

            // Get latest water quality
            $latestWQActivity = $project->activities->first();
            $waterQuality = null;
            if ($latestWQActivity && $latestWQActivity->record) {
                $waterQuality = $latestWQActivity->record->data;
            }

            return [
                'id' => $project->id,
                'name' => $project->name,
                'commodity' => $project->commodity,
                'location' => $project->location,
                'start_date' => $project->start_date->format('Y-m-d'),
                'target_harvest_date' => $project->target_harvest_date->format('Y-m-d'),
                'initial_stock' => $project->initial_stock,
                'person_in_charge' => $project->personInCharge->name,
                'status' => $project->status,
                'running_days' => $runningDays,
                'target_days' => $targetDays,
                'progress' => $progress,
                'biomass_kg' => $biomass,
                'latitude' => $project->latitude ? (float) $project->latitude : null,
                'longitude' => $project->longitude ? (float) $project->longitude : null,
                'province' => $project->province,
                'latest_water_quality' => $waterQuality,
            ];
        });

        return Inertia::render('Projects/Map', [
            'projects' => $projects,
        ]);
    }

    /**
     * Display a listing of projects.
     */
    public function index(Request $request): Response
    {
        $query = Project::with('personInCharge');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('commodity', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Commodity filter
        if ($request->filled('commodity')) {
            $query->where('commodity', $request->input('commodity'));
        }

        $projects = $query->orderBy('start_date', 'desc')->get()->map(function ($project) {
            $runningDays = $this->cultivationService->getRunningDays($project);
            $targetDays = $this->cultivationService->getTargetDurationDays($project);
            $progress = $this->cultivationService->getProgressPercentage($project);
            $biomass = $this->cultivationService->getBiomass($project);

            return [
                'id' => $project->id,
                'name' => $project->name,
                'commodity' => $project->commodity,
                'location' => $project->location,
                'start_date' => $project->start_date->format('Y-m-d'),
                'target_harvest_date' => $project->target_harvest_date->format('Y-m-d'),
                'initial_stock' => $project->initial_stock,
                'person_in_charge' => $project->personInCharge->name,
                'status' => $project->status,
                'running_days' => $runningDays,
                'target_days' => $targetDays,
                'progress' => $progress,
                'biomass_kg' => $biomass,
                'latitude' => $project->latitude ? (float) $project->latitude : null,
                'longitude' => $project->longitude ? (float) $project->longitude : null,
                'province' => $project->province,
            ];
        });

        // Get unique commodities for filtering dropdown
        $commodities = Project::distinct()->pluck('commodity');

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters' => $request->only(['search', 'status', 'commodity']),
            'commodities' => $commodities,
        ]);
    }

    /**
     * Show the form for creating a new project.
     */
    public function create(): Response
    {
        $users = User::all(['id', 'name']);

        return Inertia::render('Projects/Create', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $project = Project::create($request->validated());

        return redirect()->route('projects.show', $project->id)
            ->with('success', 'Proyek berhasil dibuat.');
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project): Response
    {
        $project->load('personInCharge');

        // Metrik & KPI
        $runningDays = $this->cultivationService->getRunningDays($project);
        $targetDays = $this->cultivationService->getTargetDurationDays($project);
        $progress = $this->cultivationService->getProgressPercentage($project);
        $biomass = $this->cultivationService->getBiomass($project);
        $averageWeight = $this->cultivationService->getAverageWeight($project);
        $survivalRate = $this->cultivationService->getSurvivalRate($project);
        $fcr = $this->cultivationService->getFcr($project);

        $totalExpenses = $this->financialService->getTotalExpenses($project);
        $totalRevenue = $this->financialService->getTotalRevenue($project);
        $profit = $this->financialService->getProfit($project);

        $kpis = [
            'running_days' => $runningDays,
            'target_days' => $targetDays,
            'progress' => $progress,
            'biomass' => number_format($biomass / 1000, 2, ',', '.').' ton', // tons
            'biomass_raw' => $biomass,
            'average_weight' => number_format($averageWeight, 1, ',', '.').' gram',
            'average_weight_raw' => $averageWeight,
            'survival_rate' => $survivalRate.'%',
            'survival_rate_raw' => $survivalRate,
            'fcr' => $fcr,
            'total_expenses' => 'Rp '.number_format($totalExpenses, 0, ',', '.'),
            'total_expenses_raw' => $totalExpenses,
            'total_revenue' => 'Rp '.number_format($totalRevenue, 0, ',', '.'),
            'total_revenue_raw' => $totalRevenue,
            'profit' => 'Rp '.number_format($profit, 0, ',', '.'),
            'profit_raw' => $profit,
        ];

        // Tab: Aktivitas
        $activities = $project->activities()->with(['record', 'user'])
            ->orderBy('activity_date', 'desc')
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'type' => $activity->type,
                    'title' => $activity->title,
                    'activity_date' => $activity->activity_date->format('Y-m-d H:i'),
                    'activity_date_human' => $activity->activity_date->diffForHumans(),
                    'user_name' => $activity->user->name,
                    'notes' => $activity->notes,
                    'record' => $activity->record ? $activity->record->data : null,
                ];
            });

        // Tab: Produksi (Sampling chart data)
        $samplingHistory = $project->activities()->where('type', 'sampling')
            ->with('record')
            ->orderBy('activity_date', 'asc')
            ->get()
            ->map(function ($activity) {
                return [
                    'date' => $activity->activity_date->format('d/m/Y'),
                    'average_weight' => (float) ($activity->record->data['average_weight'] ?? 0.0),
                    'estimated_biomass' => (float) ($activity->record->data['estimated_biomass'] ?? 0.0),
                ];
            });

        // Tab: Keuangan (Expenses and Harvest details)
        $expenses = $project->expenses()->with('user')
            ->orderBy('expense_date', 'desc')
            ->get()
            ->map(function ($expense) {
                return [
                    'id' => $expense->id,
                    'title' => $expense->title,
                    'category' => $expense->category,
                    'amount' => $expense->amount,
                    'expense_date' => $expense->expense_date->format('Y-m-d'),
                    'user_name' => $expense->user->name,
                    'notes' => $expense->notes,
                ];
            });

        $harvests = $project->harvests()->with('user')
            ->orderBy('harvest_date', 'desc')
            ->get()
            ->map(function ($harvest) {
                return [
                    'id' => $harvest->id,
                    'harvest_date' => $harvest->harvest_date->format('Y-m-d'),
                    'quantity' => $harvest->quantity,
                    'price_per_kg' => $harvest->price_per_kg,
                    'revenue' => $harvest->revenue,
                    'user_name' => $harvest->user->name,
                    'notes' => $harvest->notes,
                ];
            });

        return Inertia::render('Projects/Show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'commodity' => $project->commodity,
                'location' => $project->location,
                'start_date' => $project->start_date->format('Y-m-d'),
                'target_harvest_date' => $project->target_harvest_date->format('Y-m-d'),
                'initial_stock' => $project->initial_stock,
                'person_in_charge' => $project->personInCharge->name,
                'status' => $project->status,
                'latitude' => $project->latitude ? (float) $project->latitude : null,
                'longitude' => $project->longitude ? (float) $project->longitude : null,
                'province' => $project->province,
                'notes' => $project->notes,
            ],
            'kpis' => $kpis,
            'activities' => $activities,
            'production_history' => $samplingHistory,
            'expenses' => $expenses,
            'harvests' => $harvests,
        ]);
    }

    /**
     * Show the form for editing the specified project.
     */
    public function edit(Project $project): Response
    {
        $users = User::all(['id', 'name']);

        return Inertia::render('Projects/Edit', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'commodity' => $project->commodity,
                'location' => $project->location,
                'start_date' => $project->start_date->format('Y-m-d'),
                'target_harvest_date' => $project->target_harvest_date->format('Y-m-d'),
                'initial_stock' => $project->initial_stock,
                'person_in_charge_id' => $project->person_in_charge_id,
                'status' => $project->status,
                'latitude' => $project->latitude ? (float) $project->latitude : null,
                'longitude' => $project->longitude ? (float) $project->longitude : null,
                'province' => $project->province,
                'notes' => $project->notes,
            ],
            'users' => $users,
        ]);
    }

    /**
     * Update the specified project in storage.
     */
    public function update(StoreProjectRequest $request, Project $project): RedirectResponse
    {
        $project->update($request->validated());

        return redirect()->route('projects.show', $project->id)
            ->with('success', 'Proyek berhasil diperbarui.');
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy(Project $project): RedirectResponse
    {
        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Proyek berhasil dihapus.');
    }
}
