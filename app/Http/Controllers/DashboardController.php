<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Project;
use App\Services\CultivationService;
use App\Services\FinancialService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    protected CultivationService $cultivationService;

    protected FinancialService $financialService;

    public function __construct(CultivationService $cultivationService, FinancialService $financialService)
    {
        $this->cultivationService = $cultivationService;
        $this->financialService = $financialService;
    }

    public function index(Request $request): Response
    {
        $activeProjects = Project::where('status', 'active')->get();
        $allProjects = Project::all();

        // 1. KPI Cards
        $activeProjectCount = $activeProjects->count();

        $totalBiomass = 0.0;
        $srSum = 0.0;
        foreach ($activeProjects as $project) {
            $totalBiomass += $this->cultivationService->getBiomass($project);
            $srSum += $this->cultivationService->getSurvivalRate($project);
        }
        $averageSr = $activeProjectCount > 0 ? round($srSum / $activeProjectCount, 1) : 0.0;

        $totalExpenses = 0.0;
        foreach ($allProjects as $project) {
            $totalExpenses += $this->financialService->getTotalExpenses($project);
        }

        // Formatted for UI
        $kpis = [
            'active_projects' => [
                'value' => $activeProjectCount,
                'note' => '+'.Project::where('status', 'active')->whereMonth('created_at', now()->month)->count().' bulan ini',
            ],
            'total_biomass' => [
                'value' => number_format($totalBiomass / 1000, 1, ',', '.').' ton', // display in tons
                'raw_kg' => $totalBiomass,
            ],
            'survival_rate' => [
                'value' => $averageSr.'%',
                'raw' => $averageSr,
            ],
            'total_expenses' => [
                'value' => 'Rp'.number_format($totalExpenses / 1000000, 1, ',', '.').' juta', // display in millions
                'raw' => $totalExpenses,
            ],
        ];

        // 2. Production Chart (Mocking/Structuring Trend based on sampling dates or mock dates for 7, 30, 90 days)
        // In a real application, we retrieve the historical biomass points.
        // We will fetch the sampling data for active projects or fallback to a standard trend list.
        $chartData = $this->getProductionTrendData($request->get('chart_range', '30d'));

        // 3. Water Quality Card (Latest pH, Temp, DO, Salinity across active projects)
        $waterQuality = [
            'ph' => ['value' => '7,8', 'status' => 'normal', 'label' => 'pH'],
            'temperature' => ['value' => '29,4°C', 'status' => 'normal', 'label' => 'Suhu'],
            'do' => ['value' => '5,2 mg/L', 'status' => 'normal', 'label' => 'Oksigen Terlarut'],
            'salinity' => ['value' => '15 ppt', 'status' => 'normal', 'label' => 'Salinitas'],
        ];

        // Fetch actual latest water quality check from activities
        $latestWaterQualityActivity = Activity::where('type', 'water_quality')
            ->with('record')
            ->orderBy('activity_date', 'desc')
            ->first();

        if ($latestWaterQualityActivity && $latestWaterQualityActivity->record) {
            $data = $latestWaterQualityActivity->record->data;

            $phVal = (float) ($data['ph'] ?? 7.8);
            $tempVal = (float) ($data['temperature'] ?? 29.4);
            $doVal = (float) ($data['do'] ?? 5.2);
            $salVal = (float) ($data['salinity'] ?? 15.0);

            $waterQuality['ph'] = [
                'value' => number_format($phVal, 1, ',', '.'),
                'status' => ($phVal >= 7.5 && $phVal <= 8.5) ? 'normal' : 'danger',
                'label' => 'pH',
            ];
            $waterQuality['temperature'] = [
                'value' => number_format($tempVal, 1, ',', '.').'°C',
                'status' => ($tempVal >= 28 && $tempVal <= 32) ? 'normal' : 'warning',
                'label' => 'Suhu',
            ];
            $waterQuality['do'] = [
                'value' => number_format($doVal, 1, ',', '.').' mg/L',
                'status' => ($doVal >= 4.0) ? 'normal' : 'danger',
                'label' => 'Oksigen Terlarut',
            ];
            $waterQuality['salinity'] = [
                'value' => number_format($salVal, 1, ',', '.').' ppt',
                'status' => ($salVal >= 10 && $salVal <= 25) ? 'normal' : 'warning',
                'label' => 'Salinitas',
            ];
        }

        // 4. Active Projects List
        $projectsList = $activeProjects->map(function ($project) {
            $runningDays = $this->cultivationService->getRunningDays($project);
            $targetDays = $this->cultivationService->getTargetDurationDays($project);
            $progress = $this->cultivationService->getProgressPercentage($project);

            return [
                'id' => $project->id,
                'name' => $project->name,
                'commodity' => $project->commodity,
                'location' => $project->location,
                'running_days' => $runningDays,
                'target_days' => $targetDays,
                'progress' => $progress,
                'status' => $project->status,
            ];
        });

        // 5. Recent Activities
        $recentActivities = Activity::with(['project', 'record', 'user'])
            ->orderBy('activity_date', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'project_name' => $activity->project->name,
                    'location' => $activity->project->location,
                    'user_name' => $activity->user->name,
                    'type' => $activity->type,
                    'title' => $activity->title,
                    'activity_date' => $activity->activity_date->format('Y-m-d H:i'),
                    'activity_date_human' => $activity->activity_date->diffForHumans(),
                    'notes' => $activity->notes,
                    'record' => $activity->record ? $activity->record->data : null,
                ];
            });

        // 6. Financial Summary (Total Expenses, Total Revenue, Profit)
        $totalRev = 0.0;
        $totalExp = 0.0;
        foreach ($allProjects as $project) {
            $totalRev += $this->financialService->getTotalRevenue($project);
            $totalExp += $this->financialService->getTotalExpenses($project);
        }
        $netProfit = $totalRev - $totalExp;

        $financialSummary = [
            'expenses' => 'Rp'.number_format($totalExp / 1000000, 1, ',', '.').' jt',
            'expenses_raw' => $totalExp,
            'revenue' => 'Rp'.number_format($totalRev / 1000000, 1, ',', '.').' jt',
            'revenue_raw' => $totalRev,
            'profit' => 'Rp'.number_format($netProfit / 1000000, 1, ',', '.').' jt',
            'profit_raw' => $netProfit,
        ];

        // 7. Attention Card (Perlu Perhatian)
        $attentionItems = [];
        foreach ($activeProjects as $project) {
            // Check if sampling is due (no sampling in the last 7 days)
            $lastSampling = $project->activities()
                ->where('type', 'sampling')
                ->orderBy('activity_date', 'desc')
                ->first();

            if (! $lastSampling || $lastSampling->activity_date->diffInDays(now()) >= 7) {
                $attentionItems[] = [
                    'project_id' => $project->id,
                    'type' => 'warning', // info, warning, danger
                    'message' => "Sampling {$project->name} ({$project->location}) jatuh tempo hari ini",
                ];
            }

            // Check if latest water quality DO is too low
            $lastWQ = $project->activities()
                ->where('type', 'water_quality')
                ->with('record')
                ->orderBy('activity_date', 'desc')
                ->first();

            if ($lastWQ && $lastWQ->record && ($lastWQ->record->data['do'] ?? 5.0) < 4.0) {
                $attentionItems[] = [
                    'project_id' => $project->id,
                    'type' => 'danger',
                    'message' => "Kualitas air {$project->name} ({$project->location}) kritis: Oksigen < 4 mg/L",
                ];
            } elseif (! $lastWQ || $lastWQ->activity_date->diffInDays(now()) >= 1) {
                $attentionItems[] = [
                    'project_id' => $project->id,
                    'type' => 'info',
                    'message' => "Kualitas air {$project->name} ({$project->location}) hari ini belum dicatat",
                ];
            }

            // Check if nearing target harvest
            $running = $this->cultivationService->getRunningDays($project);
            $duration = $this->cultivationService->getTargetDurationDays($project);
            if ($running >= $duration) {
                $attentionItems[] = [
                    'project_id' => $project->id,
                    'type' => 'warning',
                    'message' => "Proyek {$project->name} mendekati jadwal panen (Hari ke-{$running} dari {$duration})",
                ];
            }
        }

        if (empty($attentionItems)) {
            $attentionItems[] = [
                'project_id' => null,
                'type' => 'info',
                'message' => 'Semua operasional berjalan dengan normal hari ini.',
            ];
        }

        return Inertia::render('Dashboard/Index', [
            'kpis' => $kpis,
            'chart_data' => $chartData,
            'water_quality' => $waterQuality,
            'active_projects' => $projectsList,
            'recent_activities' => $recentActivities,
            'financial_summary' => $financialSummary,
            'attention_items' => $attentionItems,
            'current_user' => [
                'name' => $request->user()->name,
                'role' => $request->user()->getRoleNames()->first() ?? 'Operator',
                'avatar' => $request->user()->avatar,
            ],
        ]);
    }

    /**
     * Get mocked production trend data or pull from sampling activities.
     */
    private function getProductionTrendData(string $range): array
    {
        // Simple default data for Recharts, scaled by range
        $points = 7;
        if ($range === '30d') {
            $points = 10;
        } elseif ($range === '3m') {
            $points = 12;
        }

        $data = [];
        $baseBiomass = 1.2; // in tons
        for ($i = 0; $i < $points; $i++) {
            $date = now()->subDays(($points - $i - 1) * ($range === '7d' ? 1 : ($range === '30d' ? 3 : 7)));

            // Increment biomass gradually to show growth
            $biomass = $baseBiomass + ($i * 0.28) + (rand(-10, 10) / 100);

            $data[] = [
                'label' => $date->format($range === '7d' ? 'd M' : 'd M Y'),
                'biomassa' => round($biomass, 2),
            ];
        }

        return $data;
    }
}
