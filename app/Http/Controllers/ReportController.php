<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Expense;
use App\Models\Harvest;
use App\Models\Project;
use App\Services\CultivationService;
use App\Services\FinancialService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    protected CultivationService $cultivationService;

    protected FinancialService $financialService;

    public function __construct(CultivationService $cultivationService, FinancialService $financialService)
    {
        $this->cultivationService = $cultivationService;
        $this->financialService = $financialService;
    }

    /**
     * Display cultivation and financial report analytics.
     */
    public function index(Request $request): Response
    {
        $startDateInput = $request->input('start_date');
        $endDateInput = $request->input('end_date');

        // Defaults to last 30 days if not set
        $startDate = $startDateInput ? now()->parse($startDateInput)->startOfDay() : now()->subDays(30)->startOfDay();
        $endDate = $endDateInput ? now()->parse($endDateInput)->endOfDay() : now()->endOfDay();

        // 1. Production Stats (filter projects active or started within the range)
        $projects = Project::where(function ($query) use ($startDate, $endDate) {
            $query->whereBetween('start_date', [$startDate, $endDate])
                ->orWhere('status', 'active');
        })->get();

        $totalBiomass = 0.0;
        $srSum = 0.0;
        $fcrSum = 0.0;
        $projectCount = $projects->count();

        foreach ($projects as $project) {
            $totalBiomass += $this->cultivationService->getBiomass($project);
            $srSum += $this->cultivationService->getSurvivalRate($project);
            $fcrSum += $this->cultivationService->getFcr($project);
        }

        $avgSr = $projectCount > 0 ? round($srSum / $projectCount, 1) : 0.0;
        $avgFcr = $projectCount > 0 ? round($fcrSum / $projectCount, 2) : 0.0;

        $productionReport = [
            'total_biomass' => number_format($totalBiomass / 1000, 2, ',', '.').' ton',
            'average_weight' => $projectCount > 0 ? number_format($projects->map(fn ($p) => $this->cultivationService->getAverageWeight($p))->average(), 1, ',', '.').' gram' : '0 gram',
            'survival_rate' => $avgSr.'%',
            'fcr' => $avgFcr,
        ];

        // 2. Financial Stats (filter transactions by date range)
        $expensesQuery = Expense::whereBetween('expense_date', [$startDate, $endDate]);
        $harvestsQuery = Harvest::whereBetween('harvest_date', [$startDate, $endDate]);

        // If filter by specific project is set
        if ($request->filled('project_id')) {
            $projId = $request->input('project_id');
            $expensesQuery->where('project_id', $projId);
            $harvestsQuery->where('project_id', $projId);
        }

        $totalExpenses = (float) $expensesQuery->sum('amount');
        $totalRevenue = (float) $harvestsQuery->sum('revenue');
        $profit = $totalRevenue - $totalExpenses;

        $financialReport = [
            'total_expenses' => 'Rp '.number_format($totalExpenses, 0, ',', '.'),
            'total_revenue' => 'Rp '.number_format($totalRevenue, 0, ',', '.'),
            'profit' => 'Rp '.number_format($profit, 0, ',', '.'),
            'profit_raw' => $profit,
        ];

        // 3. Activity Stats (filter by date range)
        $activitiesQuery = Activity::whereBetween('activity_date', [$startDate, $endDate]);
        if ($request->filled('project_id')) {
            $activitiesQuery->where('project_id', $request->input('project_id'));
        }

        $activities = $activitiesQuery->get();
        $totalActivities = $activities->count();

        // Group by type
        $typesCount = [
            'feeding' => $activities->where('type', 'feeding')->count(),
            'water_quality' => $activities->where('type', 'water_quality')->count(),
            'sampling' => $activities->where('type', 'sampling')->count(),
            'mortality' => $activities->where('type', 'mortality')->count(),
            'other' => $activities->where('type', 'other')->count(),
        ];

        $activityReport = [
            'total_activities' => $totalActivities,
            'by_type' => $typesCount,
        ];

        // 4. Financial Charts: Group expenses by category
        $expensesByCategory = Expense::whereBetween('expense_date', [$startDate, $endDate])
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->pluck('total', 'category')
            ->toArray();

        $categoryLabels = [
            'seed' => 'Benih',
            'feed' => 'Pakan',
            'medicine' => 'Obat-obatan',
            'operation' => 'Operasional',
            'labor' => 'Tenaga Kerja',
            'other' => 'Lainnya',
        ];

        $expenseChartData = [];
        foreach ($categoryLabels as $key => $label) {
            $expenseChartData[] = [
                'name' => $label,
                'value' => (float) ($expensesByCategory[$key] ?? 0.0),
            ];
        }

        $allProjects = Project::all(['id', 'name']);

        return Inertia::render('Reports/Index', [
            'production' => $productionReport,
            'financial' => $financialReport,
            'activities' => $activityReport,
            'expense_chart' => $expenseChartData,
            'projects' => $allProjects,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'project_id' => $request->input('project_id'),
            ],
        ]);
    }
}
