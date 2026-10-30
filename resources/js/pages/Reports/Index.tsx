import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { 
    Calendar, 
    Download, 
    BarChart3, 
    TrendingUp, 
    DollarSign, 
    SlidersHorizontal,
    ClipboardList
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { motion } from 'framer-motion';

interface ReportsProps {
    production: {
        total_biomass: string;
        average_weight: string;
        survival_rate: string;
        fcr: number;
    };
    financial: {
        total_expenses: string;
        total_revenue: string;
        profit: string;
        profit_raw: number;
    };
    activities: {
        total_activities: number;
        by_type: {
            feeding: number;
            water_quality: number;
            sampling: number;
            mortality: number;
            other: number;
        };
    };
    expense_chart: Array<{ name: string; value: number }>;
    projects: Array<{ id: number; name: string }>;
    filters: {
        start_date: string;
        end_date: string;
        project_id?: string;
    };
}

export default function Index({ 
    production, 
    financial, 
    activities, 
    expense_chart, 
    projects, 
    filters 
}: ReportsProps) {
    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (!value) delete newFilters[key as keyof typeof newFilters];
        
        router.get('/reports', newFilters, { preserveState: true, replace: true });
    };

    const handleExport = () => {
        alert('Ekspor Laporan berhasil! Laporan PDF/Excel sedang diunduh di latar belakang (Simulasi).');
    };

    // Recharts data for activities by type
    const activityChartData = [
        { name: 'Pakan', jumlah: activities.by_type.feeding, color: '#3B82F6' },
        { name: 'Kualitas Air', jumlah: activities.by_type.water_quality, color: '#0EA5A8' },
        { name: 'Sampling', jumlah: activities.by_type.sampling, color: '#8B5CF6' },
        { name: 'Kematian', jumlah: activities.by_type.mortality, color: '#DC2626' },
        { name: 'Lainnya', jumlah: activities.by_type.other, color: '#667276' },
    ];

    // Colors for the pie chart slices
    const PIE_COLORS = ['#0EA5A8', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];

    return (
        <AppLayout>
            <Head title="Laporan Analitis" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-fg-app tracking-tight">Laporan Analitis</h2>
                    <p className="text-sm text-muted-app mt-0.5">Tinjauan komprehensif performa produksi, keuangan, dan aktivitas.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="h-11 px-5 rounded-input bg-primary hover:bg-primary-dark active:scale-95 text-white text-sm font-semibold transition-all shadow-[0_4px_12px_rgba(14,165,168,0.25)] flex items-center gap-2 cursor-pointer shrink-0"
                >
                    <Download className="h-4 w-4" />
                    Ekspor Laporan
                </button>
            </div>

            {/* Date and Project Filters */}
            <div className="bg-white p-5 rounded-card border border-border-app flex flex-wrap gap-4 items-center justify-between shadow-xs select-none">
                <div className="flex items-center gap-1.5 text-muted-app text-xs font-semibold">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Filter Laporan:</span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Project Filter */}
                    <div className="flex flex-col gap-1 items-start">
                        <label className="text-[10px] font-bold text-muted-app uppercase">Proyek</label>
                        <select
                            value={filters.project_id || ''}
                            onChange={e => handleFilterChange('project_id', e.target.value)}
                            className="h-10 px-3 rounded-input border border-border-app text-fg-app text-xs bg-white focus:outline-none focus:ring-primary focus:ring-2"
                        >
                            <option value="">Semua Proyek</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div className="flex flex-col gap-1 items-start">
                        <label className="text-[10px] font-bold text-muted-app uppercase">Dari Tanggal</label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={e => handleFilterChange('start_date', e.target.value)}
                            className="h-10 px-3 rounded-input border border-border-app text-fg-app text-xs bg-white focus:outline-none focus:ring-primary focus:ring-2"
                        />
                    </div>

                    {/* End Date */}
                    <div className="flex flex-col gap-1 items-start">
                        <label className="text-[10px] font-bold text-muted-app uppercase">Sampai Tanggal</label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={e => handleFilterChange('end_date', e.target.value)}
                            className="h-10 px-3 rounded-input border border-border-app text-fg-app text-xs bg-white focus:outline-none focus:ring-primary focus:ring-2"
                        />
                    </div>
                </div>
            </div>

            {/* Reports Stat Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. PRODUCTION REPORT */}
                <div className="bg-white border border-border-app rounded-card p-6 shadow-xs space-y-4">
                    <div className="border-b border-border-app pb-2 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-sm text-fg-app uppercase tracking-wider">Performa Produksi</h3>
                    </div>
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center text-sm border-b border-border-app/50 pb-2">
                            <span className="text-muted-app">Total Biomassa:</span>
                            <span className="font-bold text-fg-app">{production.total_biomass}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-border-app/50 pb-2">
                            <span className="text-muted-app">Rata-rata Bobot:</span>
                            <span className="font-bold text-fg-app">{production.average_weight}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-border-app/50 pb-2">
                            <span className="text-muted-app">Tingkat Kelangsungan Hidup (SR):</span>
                            <span className="font-bold text-emerald-600">{production.survival_rate}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-app">Rata-rata FCR:</span>
                            <span className="font-bold text-primary">{production.fcr}</span>
                        </div>
                    </div>
                </div>

                {/* 2. FINANCIAL REPORT */}
                <div className="bg-white border border-border-app rounded-card p-6 shadow-xs space-y-4">
                    <div className="border-b border-border-app pb-2 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-teal-600" />
                        <h3 className="font-bold text-sm text-fg-app uppercase tracking-wider">Tinjauan Keuangan</h3>
                    </div>
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center text-sm border-b border-border-app/50 pb-2">
                            <span className="text-muted-app">Total Biaya Operasional:</span>
                            <span className="font-bold text-red-600">{financial.total_expenses}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-border-app/50 pb-2">
                            <span className="text-muted-app">Total Pendapatan Panen:</span>
                            <span className="font-bold text-emerald-600">{financial.total_revenue}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-app">Keuntungan Bersih:</span>
                            <span className={`font-bold ${financial.profit_raw >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                                {financial.profit}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. ACTIVITY REPORT SUMMARY */}
                <div className="bg-white border border-border-app rounded-card p-6 shadow-xs space-y-4">
                    <div className="border-b border-border-app pb-2 flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-purple-600" />
                        <h3 className="font-bold text-sm text-fg-app uppercase tracking-wider">Ringkasan Aktivitas</h3>
                    </div>
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center text-sm border-b border-border-app/50 pb-2">
                            <span className="text-muted-app">Total Kegiatan Dicatat:</span>
                            <span className="font-bold text-fg-app">{activities.total_activities} kali</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-border-app/50 pb-2">
                            <span className="text-muted-app">Pemberian Pakan:</span>
                            <span className="font-bold text-blue-600">{activities.by_type.feeding} kali</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-border-app/50 pb-2">
                            <span className="text-muted-app">Pencatatan Air:</span>
                            <span className="font-bold text-teal-600">{activities.by_type.water_quality} kali</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-app">Sampling & Kematian:</span>
                            <span className="font-bold text-purple-600">
                                {activities.by_type.sampling + activities.by_type.mortality} kali
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* A. Expenses by Category Pie Chart */}
                <div className="bg-white border border-border-app rounded-card p-6 shadow-xs">
                    <h3 className="font-bold text-base text-fg-app mb-6">Distribusi Biaya Pengeluaran</h3>
                    
                    {expense_chart.every(item => item.value === 0) ? (
                        <div className="py-12 text-center text-xs text-muted-app">Belum ada pengeluaran dalam rentang tanggal ini.</div>
                    ) : (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expense_chart.filter(item => item.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {expense_chart.filter(item => item.value > 0).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => 'Rp' + value.toLocaleString('id-ID')} />
                                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* B. Activities by Type Bar Chart */}
                <div className="bg-white border border-border-app rounded-card p-6 shadow-xs">
                    <h3 className="font-bold text-base text-fg-app mb-6">Frekuensi Aktivitas Operasional</h3>
                    
                    {activities.total_activities === 0 ? (
                        <div className="py-12 text-center text-xs text-muted-app">Belum ada aktivitas dalam rentang tanggal ini.</div>
                    ) : (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E8E8" />
                                    <XAxis dataKey="name" stroke="#667276" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontWeight: '500' }} />
                                    <YAxis stroke="#667276" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontWeight: '500' }} />
                                    <Tooltip cursor={{ fill: '#F7F8F8' }} />
                                    <Bar dataKey="jumlah" fill="#0EA5A8" radius={[6, 6, 0, 0]} maxBarSize={45}>
                                        {activityChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

            </div>

        </AppLayout>
    );
}
