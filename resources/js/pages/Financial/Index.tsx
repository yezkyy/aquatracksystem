import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { 
    DollarSign, 
    Plus, 
    Trash2, 
    TrendingUp, 
    ArrowDownRight, 
    SlidersHorizontal,
    PlusCircle,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Expense {
    id: number;
    project_name: string;
    project_id: number;
    title: string;
    category: 'seed' | 'feed' | 'medicine' | 'operation' | 'labor' | 'other';
    amount: number | string;
    expense_date: string;
    user_name: string;
    notes: string | null;
}

interface Harvest {
    id: number;
    project_name: string;
    project_id: number;
    harvest_date: string;
    quantity: number | string;
    price_per_kg: number | string;
    revenue: number | string;
    user_name: string;
    notes: string | null;
}

interface ProjectItem {
    id: number;
    name: string;
}

interface FinancialIndexProps {
    expenses: Expense[];
    harvests: Harvest[];
    total_expenses: number;
    total_revenue: number;
    profit: number;
    projects: ProjectItem[];
    all_projects: ProjectItem[];
    filters: {
        project_id?: string;
    };
}

export default function Index({ 
    expenses, 
    harvests, 
    total_expenses, 
    total_revenue, 
    profit, 
    projects, 
    all_projects,
    filters 
}: FinancialIndexProps) {
    const [activeForm, setActiveForm] = useState<'expense' | 'harvest'>('expense');

    // Expense Form
    const expenseForm = useForm({
        project_id: '',
        title: '',
        category: 'feed',
        amount: '',
        expense_date: new Date().toISOString().substring(0, 10),
        notes: '',
    });

    // Harvest Form
    const harvestForm = useForm({
        project_id: '',
        harvest_date: new Date().toISOString().substring(0, 10),
        quantity: '',
        price_per_kg: '',
        notes: '',
    });

    const handleFilterChange = (projectId: string) => {
        router.get('/financial', { project_id: projectId }, { preserveState: true, replace: true });
    };

    const handleExpenseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        expenseForm.post('/financial/expense', {
            onSuccess: () => {
                expenseForm.reset('title', 'amount', 'notes');
            }
        });
    };

    const handleHarvestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        harvestForm.post('/financial/harvest', {
            onSuccess: () => {
                harvestForm.reset('quantity', 'price_per_kg', 'notes');
            }
        });
    };

    const handleDeleteExpense = (id: number) => {
        if (confirm('Hapus catatan pengeluaran ini?')) {
            router.delete(`/financial/expense/${id}`);
        }
    };

    const handleDeleteHarvest = (id: number) => {
        if (confirm('Hapus catatan hasil panen ini?')) {
            router.delete(`/financial/harvest/${id}`);
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            seed: 'Benih',
            feed: 'Pakan',
            medicine: 'Obat-obatan',
            operation: 'Operasional',
            labor: 'Tenaga Kerja',
            other: 'Lainnya',
        };
        return labels[category] || category;
    };

    return (
        <AppLayout>
            <Head title="Keuangan Budidaya" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-fg-app tracking-tight">Keuangan Siklus</h2>
                    <p className="text-sm text-muted-app mt-0.5">Catat biaya operasional dan pendapatan hasil panen budidaya.</p>
                </div>

                {/* Project Filter */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-input border border-border-app shrink-0 shadow-xs">
                    <SlidersHorizontal className="h-4 w-4 text-muted-app" />
                    <span className="text-xs font-semibold text-muted-app">Filter Proyek:</span>
                    <select
                        value={filters.project_id || ''}
                        onChange={e => handleFilterChange(e.target.value)}
                        className="border-0 bg-transparent text-fg-app text-xs font-bold focus:ring-0 focus:outline-none cursor-pointer"
                    >
                        <option value="">Semua Proyek</option>
                        {all_projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Financial Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Total Expenses */}
                <div className="bg-white p-6 rounded-card border border-border-app shadow-xs group hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-muted-app uppercase tracking-wider">Total Biaya Operasional</span>
                        <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                            <ArrowDownRight className="h-4.5 w-4.5" />
                        </div>
                    </div>
                    <span className="text-2xl lg:text-3xl font-bold text-red-600 block mt-4">
                        Rp{number_format(total_expenses, 0, ',', '.')}
                    </span>
                </div>

                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-card border border-border-app shadow-xs group hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-muted-app uppercase tracking-wider">Total Pendapatan Panen</span>
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <TrendingUp className="h-4.5 w-4.5" />
                        </div>
                    </div>
                    <span className="text-2xl lg:text-3xl font-bold text-emerald-600 block mt-4">
                        Rp{number_format(total_revenue, 0, ',', '.')}
                    </span>
                </div>

                {/* Net Profit */}
                <div className={`bg-white p-6 rounded-card border border-border-app shadow-xs group hover:shadow-md transition-all duration-300 ${
                    profit >= 0 ? 'hover:border-teal-300' : 'hover:border-red-300'
                }`}>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-muted-app uppercase tracking-wider">Keuntungan Bersih</span>
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                            profit >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-500'
                        }`}>
                            <DollarSign className="h-4.5 w-4.5" />
                        </div>
                    </div>
                    <span className={`text-2xl lg:text-3xl font-bold block mt-4 ${
                        profit >= 0 ? 'text-teal-600' : 'text-red-600'
                    }`}>
                        Rp{number_format(profit, 0, ',', '.')}
                    </span>
                </div>
            </div>

            {/* Split Grid: Forms (Left) & Ledgers (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* 1. TRANSACTIONS FORM (Left Columns: 4) */}
                <div className="lg:col-span-4 bg-white border border-border-app rounded-card p-6 shadow-xs space-y-6">
                    {/* Toggle Forms */}
                    <div className="flex bg-bg-app p-1 rounded-lg border border-border-app select-none">
                        <button
                            onClick={() => setActiveForm('expense')}
                            className={`flex-1 py-2 text-center rounded-md text-xs font-bold cursor-pointer transition-all ${
                                activeForm === 'expense' 
                                ? 'bg-white text-primary shadow-xs' 
                                : 'text-muted-app hover:text-fg-app'
                            }`}
                        >
                            Catat Pengeluaran
                        </button>
                        <button
                            onClick={() => setActiveForm('harvest')}
                            className={`flex-1 py-2 text-center rounded-md text-xs font-bold cursor-pointer transition-all ${
                                activeForm === 'harvest' 
                                ? 'bg-white text-primary shadow-xs' 
                                : 'text-muted-app hover:text-fg-app'
                            }`}
                        >
                            Catat Panen
                        </button>
                    </div>

                    {/* A. EXPENSE FORM */}
                    {activeForm === 'expense' && (
                        <form onSubmit={handleExpenseSubmit} className="space-y-4">
                            {/* Proyek */}
                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-fg-app" htmlFor="exp_project">
                                    Pilih Proyek / Kolam <span className="text-danger-app">*</span>
                                </label>
                                <select
                                    id="exp_project"
                                    value={expenseForm.data.project_id}
                                    onChange={e => expenseForm.setData('project_id', e.target.value)}
                                    className="w-full h-11 px-3 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                    required
                                >
                                    <option value="">Pilih Proyek...</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Nama Pengeluaran */}
                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-fg-app" htmlFor="exp_title">
                                    Nama Pengeluaran <span className="text-danger-app">*</span>
                                </label>
                                <input
                                    id="exp_title"
                                    type="text"
                                    value={expenseForm.data.title}
                                    onChange={e => expenseForm.setData('title', e.target.value)}
                                    placeholder="Contoh: Beli Pakan Starter B 5 Sak"
                                    className="w-full h-11 px-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                    required
                                />
                            </div>

                            {/* Kategori & Jumlah */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-bold text-fg-app" htmlFor="exp_category">
                                        Kategori <span className="text-danger-app">*</span>
                                    </label>
                                    <select
                                        id="exp_category"
                                        value={expenseForm.data.category}
                                        onChange={e => expenseForm.setData('category', e.target.value as any)}
                                        className="w-full h-11 px-3 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                        required
                                    >
                                        <option value="seed">Benih</option>
                                        <option value="feed">Pakan</option>
                                        <option value="medicine">Obat-obatan</option>
                                        <option value="operation">Operasional</option>
                                        <option value="labor">Tenaga Kerja</option>
                                        <option value="other">Lainnya</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-bold text-fg-app" htmlFor="exp_amount">
                                        Jumlah Biaya (Rp) <span className="text-danger-app">*</span>
                                    </label>
                                    <input
                                        id="exp_amount"
                                        type="number"
                                        value={expenseForm.data.amount}
                                        onChange={e => expenseForm.setData('amount', e.target.value)}
                                        placeholder="Contoh: 1250000"
                                        className="w-full h-11 px-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Tanggal */}
                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-fg-app" htmlFor="exp_date">
                                    Tanggal Transaksi <span className="text-danger-app">*</span>
                                </label>
                                <input
                                    id="exp_date"
                                    type="date"
                                    value={expenseForm.data.expense_date}
                                    onChange={e => expenseForm.setData('expense_date', e.target.value)}
                                    className="w-full h-11 px-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                    required
                                />
                            </div>

                            {/* Catatan */}
                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-fg-app" htmlFor="exp_notes">
                                    Catatan / Keterangan
                                </label>
                                <textarea
                                    id="exp_notes"
                                    value={expenseForm.data.notes}
                                    onChange={e => expenseForm.setData('notes', e.target.value)}
                                    placeholder="Tulis no kwitansi atau detail merk..."
                                    rows={2}
                                    className="w-full p-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={expenseForm.processing}
                                className="w-full h-11 rounded-input bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {expenseForm.processing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <PlusCircle className="h-4 w-4" />
                                        Simpan Pengeluaran
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* B. HARVEST FORM */}
                    {activeForm === 'harvest' && (
                        <form onSubmit={handleHarvestSubmit} className="space-y-4">
                            {/* Proyek */}
                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-fg-app" htmlFor="har_project">
                                    Pilih Proyek / Kolam <span className="text-danger-app">*</span>
                                </label>
                                <select
                                    id="har_project"
                                    value={harvestForm.data.project_id}
                                    onChange={e => harvestForm.setData('project_id', e.target.value)}
                                    className="w-full h-11 px-3 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                    required
                                >
                                    <option value="">Pilih Proyek...</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Hasil Panen & Harga */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-bold text-fg-app" htmlFor="har_quantity">
                                        Hasil Panen (kg) <span className="text-danger-app">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="har_quantity"
                                            type="number"
                                            step="0.01"
                                            value={harvestForm.data.quantity}
                                            onChange={e => harvestForm.setData('quantity', e.target.value)}
                                            placeholder="Contoh: 850.5"
                                            className="w-full h-11 pl-4 pr-12 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                            required
                                            min="0.01"
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-muted-app pointer-events-none">
                                            kg
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-bold text-fg-app" htmlFor="har_price">
                                        Harga Jual (Rp/kg) <span className="text-danger-app">*</span>
                                    </label>
                                    <input
                                        id="har_price"
                                        type="number"
                                        value={harvestForm.data.price_per_kg}
                                        onChange={e => harvestForm.setData('price_per_kg', e.target.value)}
                                        placeholder="Contoh: 54000"
                                        className="w-full h-11 px-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Tanggal */}
                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-fg-app" htmlFor="har_date">
                                    Tanggal Panen <span className="text-danger-app">*</span>
                                </label>
                                <input
                                    id="har_date"
                                    type="date"
                                    value={harvestForm.data.harvest_date}
                                    onChange={e => harvestForm.setData('harvest_date', e.target.value)}
                                    className="w-full h-11 px-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                    required
                                />
                            </div>

                            {/* Catatan */}
                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-fg-app" htmlFor="har_notes">
                                    Catatan / Keterangan
                                </label>
                                <textarea
                                    id="har_notes"
                                    value={harvestForm.data.notes}
                                    onChange={e => harvestForm.setData('notes', e.target.value)}
                                    placeholder="Tulis no DO pembeli, grade ikan/udang, atau info logistik..."
                                    rows={3}
                                    className="w-full p-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={harvestForm.processing}
                                className="w-full h-11 rounded-input bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {harvestForm.processing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <TrendingUp className="h-4 w-4" />
                                        Simpan Hasil Panen
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* 2. HISTORY LEDGERS (Right Columns: 8) */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Expenses List */}
                    <div className="bg-white border border-border-app rounded-card p-6 shadow-xs flex flex-col justify-between overflow-hidden">
                        <div>
                            <h3 className="font-bold text-sm text-fg-app uppercase tracking-wider mb-4">Ledger Pengeluaran</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-border-app text-muted-app text-xs font-bold uppercase tracking-wider bg-bg-app">
                                            <th className="p-3">Tanggal</th>
                                            <th className="p-3">Proyek</th>
                                            <th className="p-3">Kategori</th>
                                            <th className="p-3">Nama Biaya</th>
                                            <th className="p-3 text-right">Jumlah</th>
                                            <th className="p-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-app">
                                        {expenses.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-4 text-center text-muted-app text-xs">Belum ada catatan pengeluaran.</td>
                                            </tr>
                                        ) : (
                                            expenses.map((expense) => (
                                                <tr key={expense.id} className="hover:bg-bg-app transition-colors text-xs font-medium group">
                                                    <td className="p-3 whitespace-nowrap">{expense.expense_date}</td>
                                                    <td className="p-3 truncate max-w-[100px]">{expense.project_name}</td>
                                                    <td className="p-3">
                                                        <span className="px-2 py-0.5 rounded bg-bg-app border border-border-app text-muted-app font-bold uppercase text-[9px] tracking-wider whitespace-nowrap">
                                                            {getCategoryLabel(expense.category)}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <p className="truncate max-w-[120px] font-semibold text-fg-app">{expense.title}</p>
                                                        {expense.notes && <span className="text-[10px] text-muted-app italic font-normal truncate max-w-[120px] block">{expense.notes}</span>}
                                                    </td>
                                                    <td className="p-3 text-right font-bold text-red-600">
                                                        Rp{number_format(expense.amount as number, 0, ',', '.')}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <button
                                                            onClick={() => handleDeleteExpense(expense.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-muted-app hover:text-red-600 transition-opacity p-1 rounded hover:bg-red-50 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Harvests List */}
                    <div className="bg-white border border-border-app rounded-card p-6 shadow-xs flex flex-col justify-between overflow-hidden">
                        <div>
                            <h3 className="font-bold text-sm text-fg-app uppercase tracking-wider mb-4">Catatan Panen & Pendapatan</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-border-app text-muted-app text-xs font-bold uppercase tracking-wider bg-bg-app">
                                            <th className="p-3">Tanggal</th>
                                            <th className="p-3">Proyek</th>
                                            <th className="p-3">Hasil Panen</th>
                                            <th className="p-3">Harga/kg</th>
                                            <th className="p-3 text-right">Pendapatan</th>
                                            <th className="p-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-app">
                                        {harvests.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-4 text-center text-muted-app text-xs">Belum ada catatan panen.</td>
                                            </tr>
                                        ) : (
                                            harvests.map((harvest) => (
                                                <tr key={harvest.id} className="hover:bg-bg-app transition-colors text-xs font-medium group">
                                                    <td className="p-3 whitespace-nowrap">{harvest.harvest_date}</td>
                                                    <td className="p-3 truncate max-w-[100px]">{harvest.project_name}</td>
                                                    <td className="p-3 whitespace-nowrap">{number_format(harvest.quantity as number, 1, ',', '.')} kg</td>
                                                    <td className="p-3 whitespace-nowrap">Rp{number_format(harvest.price_per_kg as number, 0, ',', '.')}</td>
                                                    <td className="p-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                                                        Rp{number_format(harvest.revenue as number, 0, ',', '.')}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <button
                                                            onClick={() => handleDeleteHarvest(harvest.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-muted-app hover:text-red-600 transition-opacity p-1 rounded hover:bg-red-50 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </AppLayout>
    );
}

// Number format helper
function number_format(number: number, decimals: number, decPoint: string, thousandsSep: string = '.') {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    const n = !isFinite(+number) ? 0 : +number;
    const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
    const sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep;
    const dec = (typeof decPoint === 'undefined') ? '.' : decPoint;
    let s = '';
    const toFixedFix = function(n: number, prec: number) {
        const k = Math.pow(10, prec);
        return '' + (Math.round(n * k) / k).toFixed(prec);
    };
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}
