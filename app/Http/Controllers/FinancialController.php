<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Harvest;
use App\Models\Project;
use App\Services\FinancialService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialController extends Controller
{
    protected FinancialService $financialService;

    public function __construct(FinancialService $financialService)
    {
        $this->financialService = $financialService;
    }

    /**
     * Display financial transaction ledger.
     */
    public function index(Request $request): Response
    {
        $queryExpenses = Expense::with(['project', 'user']);
        $queryHarvests = Harvest::with(['project', 'user']);

        // Filter by project if selected
        if ($request->filled('project_id')) {
            $projectId = $request->input('project_id');
            $queryExpenses->where('project_id', $projectId);
            $queryHarvests->where('project_id', $projectId);
        }

        $expenses = $queryExpenses->orderBy('expense_date', 'desc')->get()->map(function ($expense) {
            return [
                'id' => $expense->id,
                'project_name' => $expense->project->name,
                'project_id' => $expense->project->id,
                'title' => $expense->title,
                'category' => $expense->category,
                'amount' => $expense->amount,
                'expense_date' => $expense->expense_date->format('Y-m-d'),
                'user_name' => $expense->user->name,
                'notes' => $expense->notes,
            ];
        });

        $harvests = $queryHarvests->orderBy('harvest_date', 'desc')->get()->map(function ($harvest) {
            return [
                'id' => $harvest->id,
                'project_name' => $harvest->project->name,
                'project_id' => $harvest->project->id,
                'harvest_date' => $harvest->harvest_date->format('Y-m-d'),
                'quantity' => $harvest->quantity,
                'price_per_kg' => $harvest->price_per_kg,
                'revenue' => $harvest->revenue,
                'user_name' => $harvest->user->name,
                'notes' => $harvest->notes,
            ];
        });

        // Calculate Totals
        $totalExpenses = $expenses->sum('amount');
        $totalRevenue = $harvests->sum('revenue');
        $profit = $totalRevenue - $totalExpenses;

        $projects = Project::whereIn('status', ['active', 'planning'])->get(['id', 'name']);
        $allProjects = Project::all(['id', 'name']);

        return Inertia::render('Financial/Index', [
            'expenses' => $expenses,
            'harvests' => $harvests,
            'total_expenses' => $totalExpenses,
            'total_revenue' => $totalRevenue,
            'profit' => $profit,
            'projects' => $projects, // active projects for forms
            'all_projects' => $allProjects, // all projects for filter
            'filters' => $request->only(['project_id']),
        ]);
    }

    /**
     * Store new expense transaction.
     */
    public function storeExpense(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'category' => 'required|in:seed,feed,medicine,operation,labor,other',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'notes' => 'nullable|string',
        ], [
            'project_id.required' => 'Proyek wajib diisi.',
            'project_id.exists' => 'Proyek tidak valid.',
            'title.required' => 'Nama pengeluaran wajib diisi.',
            'category.required' => 'Kategori wajib diisi.',
            'category.in' => 'Kategori tidak valid.',
            'amount.required' => 'Jumlah biaya wajib diisi.',
            'amount.numeric' => 'Jumlah biaya harus berupa angka.',
            'amount.min' => 'Jumlah biaya tidak boleh negatif.',
            'expense_date.required' => 'Tanggal pengeluaran wajib diisi.',
            'expense_date.date' => 'Tanggal pengeluaran tidak valid.',
        ]);

        $validated['user_id'] = $request->user()->id;
        Expense::create($validated);

        return redirect()->route('financial.index')
            ->with('success', 'Pengeluaran berhasil dicatat.');
    }

    /**
     * Store new harvest transaction.
     */
    public function storeHarvest(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'harvest_date' => 'required|date',
            'quantity' => 'required|numeric|min:0.01',
            'price_per_kg' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ], [
            'project_id.required' => 'Proyek wajib diisi.',
            'project_id.exists' => 'Proyek tidak valid.',
            'harvest_date.required' => 'Tanggal panen wajib diisi.',
            'harvest_date.date' => 'Tanggal panen tidak valid.',
            'quantity.required' => 'Jumlah hasil panen wajib diisi.',
            'quantity.numeric' => 'Jumlah hasil panen harus berupa angka.',
            'quantity.min' => 'Jumlah hasil panen harus lebih dari 0 kg.',
            'price_per_kg.required' => 'Harga jual per kg wajib diisi.',
            'price_per_kg.numeric' => 'Harga jual harus berupa angka.',
            'price_per_kg.min' => 'Harga jual tidak boleh negatif.',
        ]);

        $validated['user_id'] = $request->user()->id;

        // Calculate revenue dynamically: quantity * price_per_kg
        $validated['revenue'] = $validated['quantity'] * $validated['price_per_kg'];

        Harvest::create($validated);

        return redirect()->route('financial.index')
            ->with('success', 'Panen berhasil dicatat.');
    }

    /**
     * Remove expense transaction.
     */
    public function destroyExpense(Expense $expense): RedirectResponse
    {
        $expense->delete();

        return redirect()->route('financial.index')
            ->with('success', 'Catatan pengeluaran berhasil dihapus.');
    }

    /**
     * Remove harvest transaction.
     */
    public function destroyHarvest(Harvest $harvest): RedirectResponse
    {
        $harvest->delete();

        return redirect()->route('financial.index')
            ->with('success', 'Catatan panen berhasil dihapus.');
    }
}
