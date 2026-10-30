import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { 
    ArrowLeft, 
    Calendar, 
    MapPin, 
    Scale, 
    User, 
    Plus, 
    Settings,
    LayoutDashboard,
    ClipboardList,
    TrendingUp,
    DollarSign,
    Trash2,
    Edit3,
    Droplet,
    Thermometer,
    Activity,
    Coins,
    Sparkles,
    AlertCircle,
    Info
} from 'lucide-react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityItem {
    id: number;
    type: string;
    title: string;
    activity_date: string;
    activity_date_human: string;
    user_name: string;
    notes: string | null;
    record: any;
}

interface ExpenseItem {
    id: number;
    title: string;
    category: string;
    amount: number;
    expense_date: string;
    user_name: string;
    notes: string | null;
}

interface HarvestItem {
    id: number;
    harvest_date: string;
    quantity: number;
    price_per_kg: number;
    revenue: number;
    user_name: string;
    notes: string | null;
}

interface ProjectShowProps {
    project: {
        id: number;
        name: string;
        commodity: string;
        location: string;
        start_date: string;
        target_harvest_date: string;
        initial_stock: number;
        person_in_charge: string;
        status: 'planning' | 'active' | 'completed' | 'archived';
        notes: string | null;
    };
    kpis: {
        running_days: number;
        target_days: number;
        progress: number;
        biomass: string;
        biomass_raw: number;
        average_weight: string;
        average_weight_raw: number;
        survival_rate: string;
        survival_rate_raw: number;
        fcr: number;
        total_expenses: string;
        total_expenses_raw: number;
        total_revenue: string;
        total_revenue_raw: number;
        profit: string;
        profit_raw: number;
    };
    activities: ActivityItem[];
    production_history: Array<{ date: string; average_weight: number; estimated_biomass: number }>;
    expenses: ExpenseItem[];
    harvests: HarvestItem[];
}

export default function Show({ 
    project, 
    kpis, 
    activities, 
    production_history, 
    expenses, 
    harvests 
}: ProjectShowProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'production' | 'financial'>('overview');

    const getStatusDetails = (status: string) => {
        switch (status) {
            case 'planning':
                return { label: 'Perencanaan', color: 'bg-amber-50 text-amber-700 border-amber-200' };
            case 'active':
                return { label: 'Aktif', color: 'bg-primary-light text-primary border-primary/20' };
            case 'completed':
                return { label: 'Selesai', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'archived':
                return { label: 'Diarsipkan', color: 'bg-slate-100 text-slate-600 border-slate-200' };
            default:
                return { label: 'Tidak Diketahui', color: 'bg-gray-100 text-gray-600' };
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

    const handleDeleteProject = () => {
        if (confirm('Apakah Anda yakin ingin menghapus proyek ini? Seluruh data aktivitas dan transaksi keuangan terkait akan dihapus secara permanen.')) {
            router.delete(`/projects/${project.id}`);
        }
    };

    const handleDeleteActivity = (id: number) => {
        if (confirm('Hapus catatan aktivitas ini?')) {
            router.delete(`/activities/${id}`);
        }
    };

    const statusInfo = getStatusDetails(project.status);

    const tabs = [
        { id: 'overview', name: 'Ringkasan', icon: LayoutDashboard },
        { id: 'activities', name: 'Aktivitas', icon: ClipboardList },
        { id: 'production', name: 'Produksi', icon: TrendingUp },
        { id: 'financial', name: 'Keuangan', icon: DollarSign },
    ] as const;

    return (
        <AppLayout>
            <Head title={project.name} />

            {/* Back header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/projects"
                        className="h-10 w-10 rounded-input border border-border-app bg-white flex items-center justify-center text-muted-app hover:text-fg-app hover:bg-bg-app transition-all cursor-pointer"
                    >
                        <ArrowLeft className="h-4.5 w-4.5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-xl font-bold text-fg-app tracking-tight">{project.name}</h2>
                            <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                        <p className="text-xs text-muted-app mt-0.5">{project.location} · {project.commodity}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/activities/create?project_id=${project.id}`}
                        className="h-10 px-4 rounded-input bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Aktivitas
                    </Link>
                    <Link
                        href={`/projects/${project.id}/edit`}
                        className="h-10 w-10 rounded-input border border-border-app bg-white hover:bg-bg-app flex items-center justify-center text-muted-app hover:text-fg-app transition-all cursor-pointer"
                        title="Ubah Proyek"
                    >
                        <Edit3 className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={handleDeleteProject}
                        className="h-10 w-10 rounded-input border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center text-red-500 hover:text-red-700 transition-all cursor-pointer"
                        title="Hapus Proyek"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Cycle Progress Info */}
            <div className="bg-white p-5 rounded-card border border-border-app flex flex-col md:flex-row items-center gap-6 shadow-xs">
                <div className="w-full md:w-48 text-center md:text-left border-b md:border-b-0 md:border-r border-border-app pb-4 md:pb-0 md:pr-6 shrink-0">
                    <span className="text-[10px] font-bold text-muted-app uppercase tracking-wider block">Hari Berjalan</span>
                    <span className="text-2xl font-bold text-fg-app block mt-1">
                        Hari ke-{kpis.running_days}
                    </span>
                    <span className="text-xs text-muted-app font-medium block mt-0.5">
                        dari target {kpis.target_days} hari
                    </span>
                </div>

                <div className="flex-1 w-full space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-muted-app">Perkembangan Siklus Budidaya</span>
                        <span className="text-primary">{kpis.progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-border-app rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary rounded-full transition-all duration-500" 
                            style={{ width: `${kpis.progress}%` }} 
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border-app overflow-x-auto select-none">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-semibold text-sm cursor-pointer transition-all whitespace-nowrap ${
                                active 
                                ? 'border-primary text-primary' 
                                : 'border-transparent text-muted-app hover:text-fg-app'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            {/* Tab Panels */}
            <div className="mt-2">
                <AnimatePresence mode="wait">
                    {/* 1. OVERVIEW PANEL */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                        >
                            {/* Bento KPIs & Water Quality (Left 2 columns) */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Core KPIs Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Biomassa */}
                                    <div className="bg-white p-5 rounded-card border-l-4 border-l-primary border-y border-r border-border-app shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-all text-left group">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-muted-app uppercase tracking-wider block">Estimasi Biomassa</span>
                                            <TrendingUp className="h-4 w-4 text-primary opacity-60 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <span className="text-xl font-black text-fg-app block mt-2">{kpis.biomass}</span>
                                        <span className="text-[10px] text-muted-app font-medium mt-1 block">Telah disesuaikan mortalitas</span>
                                    </div>

                                    {/* Average Weight */}
                                    <div className="bg-white p-5 rounded-card border-l-4 border-l-purple-500 border-y border-r border-border-app shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-all text-left group">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-muted-app uppercase tracking-wider block">Bobot Rata-rata</span>
                                            <Scale className="h-4 w-4 text-purple-500 opacity-60 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <span className="text-xl font-black text-fg-app block mt-2">{kpis.average_weight}</span>
                                        <span className="text-[10px] text-muted-app font-medium mt-1 block">Berdasarkan sampling terakhir</span>
                                    </div>

                                    {/* Survival Rate */}
                                    <div className="bg-white p-5 rounded-card border-l-4 border-l-emerald-500 border-y border-r border-border-app shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-all text-left group">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-muted-app uppercase tracking-wider block">Survival Rate (SR)</span>
                                            <Activity className="h-4 w-4 text-emerald-500 opacity-60 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <span className="text-xl font-black text-fg-app block mt-2">{kpis.survival_rate}</span>
                                        <span className="text-[10px] text-muted-app font-medium mt-1 block">Tingkat kelangsungan hidup</span>
                                    </div>

                                    {/* FCR */}
                                    <div className="bg-white p-5 rounded-card border-l-4 border-l-amber-500 border-y border-r border-border-app shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-all text-left group">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-muted-app uppercase tracking-wider block">Feed Conversion Ratio</span>
                                            <Sparkles className="h-4 w-4 text-amber-500 opacity-60 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <span className="text-xl font-black text-fg-app block mt-2">{kpis.fcr}</span>
                                        <span className="text-[10px] text-muted-app font-medium mt-1 block">Rasio konversi pakan</span>
                                    </div>
                                </div>

                                {/* Latest Water Quality Section */}
                                <div className="bg-white p-6 rounded-card border border-border-app shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left">
                                    <div className="flex justify-between items-center border-b border-border-app/60 pb-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Droplet className="h-4 w-4 text-primary" />
                                            <h3 className="font-bold text-sm text-fg-app uppercase tracking-wider">Kondisi Kualitas Air Terakhir</h3>
                                        </div>
                                        {activities.find(a => a.type === 'water_quality') && (
                                            <span className="text-[10px] text-muted-app font-semibold">
                                                Dicatat {activities.find(a => a.type === 'water_quality')?.activity_date_human}
                                            </span>
                                        )}
                                    </div>

                                    {(() => {
                                        const wq = activities.find(a => a.type === 'water_quality')?.record;
                                        if (!wq) {
                                            return (
                                                <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-border-app rounded-xl bg-slate-50/50">
                                                    <Info className="h-5 w-5 text-muted-app" />
                                                    <div className="max-w-[280px]">
                                                        <p className="text-xs font-semibold text-fg-app">Belum Ada Rekaman Kualitas Air</p>
                                                        <p className="text-[10px] text-muted-app mt-0.5">Silakan catat kualitas air harian tambak pada tombol tambah aktivitas.</p>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        const doVal = Number(wq.do);
                                        const phVal = Number(wq.ph);
                                        const tempVal = Number(wq.temperature);
                                        const salVal = Number(wq.salinity);

                                        return (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                {/* DO */}
                                                <div className="p-4 rounded-xl border border-border-app/40 bg-slate-50/50 space-y-1">
                                                    <span className="text-[9px] font-bold text-blue-600 block uppercase tracking-wider">Oksigen (DO)</span>
                                                    <p className="text-base font-bold text-fg-app">{doVal ? `${doVal} mg/L` : '—'}</p>
                                                    <span className={`text-[9px] font-black ${doVal < 4.0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                                                        {doVal < 4.0 ? 'Kritis (<4)' : 'Optimal'}
                                                    </span>
                                                </div>

                                                {/* Suhu */}
                                                <div className="p-4 rounded-xl border border-border-app/40 bg-slate-50/50 space-y-1">
                                                    <span className="text-[9px] font-bold text-amber-600 block uppercase tracking-wider">Suhu</span>
                                                    <p className="text-base font-bold text-fg-app">{tempVal ? `${tempVal}°C` : '—'}</p>
                                                    <span className={`text-[9px] font-black ${(tempVal < 28 || tempVal > 32) ? 'text-amber-500' : 'text-emerald-600'}`}>
                                                        {(tempVal < 28 || tempVal > 32) ? 'Peringatan' : 'Optimal'}
                                                    </span>
                                                </div>

                                                {/* pH */}
                                                <div className="p-4 rounded-xl border border-border-app/40 bg-slate-50/50 space-y-1">
                                                    <span className="text-[9px] font-bold text-teal-600 block uppercase tracking-wider">pH Air</span>
                                                    <p className="text-base font-bold text-fg-app">{phVal || '—'}</p>
                                                    <span className={`text-[9px] font-black ${(phVal < 7.5 || phVal > 8.5) ? 'text-rose-500' : 'text-emerald-600'}`}>
                                                        {(phVal < 7.5 || phVal > 8.5) ? 'Tidak Stabil' : 'Stabil'}
                                                    </span>
                                                </div>

                                                {/* Salinitas */}
                                                <div className="p-4 rounded-xl border border-border-app/40 bg-slate-50/50 space-y-1">
                                                    <span className="text-[9px] font-bold text-indigo-600 block uppercase tracking-wider">Salinitas</span>
                                                    <p className="text-base font-bold text-fg-app">{salVal ? `${salVal} ppt` : '—'}</p>
                                                    <span className={`text-[9px] font-black ${(salVal < 10 || salVal > 25) ? 'text-amber-500' : 'text-emerald-600'}`}>
                                                        {(salVal < 10 || salVal > 25) ? 'Peringatan' : 'Optimal'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Sidebar Info (Right 1 column) */}
                            <div className="space-y-6">
                                {/* Informational Details */}
                                <div className="bg-white p-6 rounded-card border border-border-app shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left space-y-4">
                                    <h3 className="font-bold text-sm text-fg-app uppercase tracking-wider border-b border-border-app/60 pb-2 flex items-center gap-2">
                                        <Info className="h-4 w-4 text-primary" />
                                        Informasi Siklus
                                    </h3>
                                    <div className="space-y-3.5 text-xs font-semibold">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-app">Tanggal Tebar:</span>
                                            <span className="text-fg-app">{project.start_date}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-app">Target Panen:</span>
                                            <span className="text-fg-app">{project.target_harvest_date}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-app">Tebar Awal:</span>
                                            <span className="text-fg-app">{number_format(project.initial_stock, 0, ',', '.')} ekor</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-app">Penanggung Jawab:</span>
                                            <span className="text-fg-app">{project.person_in_charge}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Overview Mini-Card */}
                                <div className="bg-white p-6 rounded-card border border-border-app shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left space-y-4">
                                    <h3 className="font-bold text-sm text-fg-app uppercase tracking-wider border-b border-border-app/60 pb-2 flex items-center gap-2">
                                        <Coins className="h-4 w-4 text-primary" />
                                        Ringkasan Keuangan
                                    </h3>
                                    <div className="space-y-3 text-xs font-semibold">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-app">Pengeluaran:</span>
                                            <span className="text-red-500">{kpis.total_expenses}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-app">Hasil Panen:</span>
                                            <span className="text-emerald-600">{kpis.total_revenue}</span>
                                        </div>
                                        <div className="h-px bg-border-app/50 my-1" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-fg-app font-bold">Proyeksi Margin:</span>
                                            <span className={`font-black ${kpis.profit_raw >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                                                {kpis.profit}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Project notes */}
                                {project.notes && (
                                    <div className="bg-white p-5 rounded-card border border-border-app shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left space-y-2">
                                        <span className="text-[10px] font-bold text-muted-app uppercase tracking-wider block">Catatan Tambahan</span>
                                        <p className="text-xs text-fg-app bg-slate-50/50 p-3.5 rounded-xl border border-border-app/40 italic leading-relaxed">
                                            &ldquo;{project.notes}&rdquo;
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* 2. ACTIVITIES PANEL */}
                    {activeTab === 'activities' && (
                        <motion.div
                            key="activities"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-white rounded-card border border-border-app p-6 md:p-8 shadow-xs"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-base text-fg-app">Lini Masa Aktivitas</h3>
                                <Link 
                                    href={`/activities/create?project_id=${project.id}`}
                                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                    + Catat Aktivitas Baru
                                </Link>
                            </div>

                            <div className="relative border-l border-border-app ml-3.5 pl-6 space-y-6">
                                {activities.length === 0 ? (
                                    <p className="text-sm text-muted-app py-4">Belum ada catatan aktivitas untuk proyek ini.</p>
                                ) : (
                                    activities.map((activity) => (
                                        <div key={activity.id} className="relative group">
                                            <span className="absolute -left-[30px] top-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-primary group-hover:scale-125 transition-transform" />
                                            
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                <div className="text-left space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h4 className="font-semibold text-sm text-fg-app">
                                                            {activity.title}
                                                        </h4>
                                                        <span className="text-[10px] font-bold text-muted-app uppercase tracking-wider bg-bg-app px-2 py-0.5 rounded-md border border-border-app">
                                                            {activity.type === 'feeding' ? 'Pakan' : activity.type === 'water_quality' ? 'Kualitas Air' : activity.type === 'sampling' ? 'Sampling' : activity.type === 'mortality' ? 'Kematian' : 'Lainnya'}
                                                        </span>
                                                    </div>

                                                    {/* Custom parameter details */}
                                                    {activity.type === 'feeding' && activity.record && (
                                                        <p className="text-xs font-bold text-primary">
                                                            Pakan: {activity.record.feed_type} · {activity.record.quantity} kg
                                                        </p>
                                                    )}
                                                    {activity.type === 'water_quality' && activity.record && (
                                                        <p className="text-xs font-bold text-teal-600">
                                                            pH {activity.record.ph} · Oksigen {activity.record.do} mg/L · Suhu {activity.record.temperature}°C · Salinitas {activity.record.salinity} ppt
                                                        </p>
                                                    )}
                                                    {activity.type === 'sampling' && activity.record && (
                                                        <p className="text-xs font-bold text-purple-600">
                                                            Sampel: {activity.record.sample_count} ekor · Rata-rata bobot: {activity.record.average_weight} gr · Perkiraan biomassa: {activity.record.estimated_biomass} kg
                                                        </p>
                                                    )}
                                                    {activity.type === 'mortality' && activity.record && (
                                                        <p className="text-xs font-bold text-danger-app">
                                                            Kematian: {activity.record.quantity} ekor · Penyebab: {activity.record.cause || '-'}
                                                        </p>
                                                    )}

                                                    {activity.notes && (
                                                        <p className="text-xs text-muted-app italic max-w-2xl leading-relaxed">
                                                            &ldquo;{activity.notes}&rdquo;
                                                        </p>
                                                    )}

                                                    <div className="text-[10px] text-muted-app font-semibold mt-1">
                                                        {activity.activity_date} (Oleh {activity.user_name})
                                                    </div>
                                                </div>

                                                {/* Delete Activity */}
                                                <button
                                                    onClick={() => handleDeleteActivity(activity.id)}
                                                    className="opacity-0 group-hover:opacity-100 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer text-muted-app shrink-0 self-start sm:self-center"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* 3. PRODUCTION PANEL */}
                    {activeTab === 'production' && (
                        <motion.div
                            key="production"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="space-y-6"
                        >
                            {/* Growth Chart */}
                            <div className="bg-white p-6 rounded-card border border-border-app shadow-xs">
                                <h3 className="font-bold text-base text-fg-app mb-6">Grafik Perkembangan Ikan/Udang</h3>
                                
                                {production_history.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-muted-app">
                                        Belum ada data sampling yang tercatat untuk proyek ini.
                                    </div>
                                ) : (
                                    <div className="h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={production_history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E8E8" />
                                                <XAxis dataKey="date" stroke="#667276" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontWeight: '500' }} />
                                                <YAxis yAxisId="left" stroke="#667276" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontWeight: '500' }} unit="g" />
                                                <YAxis yAxisId="right" orientation="right" stroke="#667276" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontWeight: '500' }} unit="kg" />
                                                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E4E8E8', borderRadius: '10px' }} />
                                                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                                                <Line yAxisId="left" type="monotone" dataKey="average_weight" name="Bobot Rata-rata (gram)" stroke="#0EA5A8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                                <Line yAxisId="right" type="monotone" dataKey="estimated_biomass" name="Biomassa (kg)" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* Sampling History Table */}
                            <div className="bg-white p-6 rounded-card border border-border-app shadow-xs overflow-hidden">
                                <h3 className="font-bold text-sm text-fg-app uppercase tracking-wider mb-4">Log Sampling</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b border-border-app text-muted-app text-xs font-bold uppercase tracking-wider bg-bg-app">
                                                <th className="p-3">Tanggal</th>
                                                <th className="p-3">Bobot Rata-rata (gr)</th>
                                                <th className="p-3">Biomassa (kg)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-app">
                                            {production_history.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="p-4 text-center text-muted-app text-xs">Belum ada data sampling.</td>
                                                </tr>
                                            ) : (
                                                production_history.map((row, i) => (
                                                    <tr key={i} className="hover:bg-bg-app transition-colors text-xs font-medium">
                                                        <td className="p-3">{row.date}</td>
                                                        <td className="p-3">{row.average_weight} g</td>
                                                        <td className="p-3">{number_format(row.estimated_biomass, 1, ',', '.')} kg</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* 4. FINANCIAL PANEL */}
                    {activeTab === 'financial' && (
                        <motion.div
                            key="financial"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="space-y-6"
                        >
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-white p-5 rounded-card border border-border-app shadow-xs">
                                    <span className="text-[10px] font-bold text-muted-app uppercase tracking-wider block">Total Pengeluaran</span>
                                    <span className="text-xl font-bold text-red-600 block mt-2">{kpis.total_expenses}</span>
                                </div>
                                <div className="bg-white p-5 rounded-card border border-border-app shadow-xs">
                                    <span className="text-[10px] font-bold text-muted-app uppercase tracking-wider block">Total Pendapatan</span>
                                    <span className="text-xl font-bold text-emerald-600 block mt-2">{kpis.total_revenue}</span>
                                </div>
                                <div className="bg-white p-5 rounded-card border border-border-app shadow-xs">
                                    <span className="text-[10px] font-bold text-muted-app uppercase tracking-wider block">Keuntungan Bersih</span>
                                    <span className={`text-xl font-bold block mt-2 ${kpis.profit_raw >= 0 ? 'text-teal-600' : 'text-red-600'}`}>{kpis.profit}</span>
                                </div>
                            </div>

                            {/* Two Columns Table: Expenses & Harvest */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Expenses Table */}
                                <div className="bg-white p-6 rounded-card border border-border-app shadow-xs flex flex-col justify-between overflow-hidden">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-sm text-fg-app uppercase tracking-wider">Daftar Pengeluaran</h4>
                                            <Link href="/financial" className="text-xs text-primary hover:underline font-semibold cursor-pointer">Catat Biaya</Link>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm border-collapse">
                                                <thead>
                                                    <tr className="border-b border-border-app text-muted-app text-xs font-bold uppercase tracking-wider bg-bg-app">
                                                        <th className="p-3">Tanggal</th>
                                                        <th className="p-3">Kategori</th>
                                                        <th className="p-3">Pengeluaran</th>
                                                        <th className="p-3 text-right">Jumlah</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border-app">
                                                    {expenses.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="p-4 text-center text-muted-app text-xs">Belum ada pengeluaran.</td>
                                                        </tr>
                                                    ) : (
                                                        expenses.map((expense) => (
                                                            <tr key={expense.id} className="hover:bg-bg-app transition-colors text-xs font-medium">
                                                                <td className="p-3">{expense.expense_date}</td>
                                                                <td className="p-3">
                                                                    <span className="px-2 py-0.5 rounded bg-bg-app border border-border-app text-muted-app font-bold uppercase text-[9px] tracking-wider">
                                                                        {getCategoryLabel(expense.category)}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 truncate max-w-[120px]">{expense.title}</td>
                                                                <td className="p-3 text-right font-semibold text-red-600">
                                                                    Rp{number_format(expense.amount, 0, ',', '.')}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Harvest Table */}
                                <div className="bg-white p-6 rounded-card border border-border-app shadow-xs flex flex-col justify-between overflow-hidden">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-sm text-fg-app uppercase tracking-wider">Catatan Hasil Panen</h4>
                                            <Link href="/financial" className="text-xs text-primary hover:underline font-semibold cursor-pointer">Catat Panen</Link>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm border-collapse">
                                                <thead>
                                                    <tr className="border-b border-border-app text-muted-app text-xs font-bold uppercase tracking-wider bg-bg-app">
                                                        <th className="p-3">Tanggal</th>
                                                        <th className="p-3">Berat (kg)</th>
                                                        <th className="p-3">Harga/kg</th>
                                                        <th className="p-3 text-right">Pendapatan</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border-app">
                                                    {harvests.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="p-4 text-center text-muted-app text-xs">Belum ada panen.</td>
                                                        </tr>
                                                    ) : (
                                                        harvests.map((harvest) => (
                                                            <tr key={harvest.id} className="hover:bg-bg-app transition-colors text-xs font-medium">
                                                                <td className="p-3">{harvest.harvest_date}</td>
                                                                <td className="p-3">{number_format(harvest.quantity, 1, ',', '.')} kg</td>
                                                                <td className="p-3">Rp{number_format(harvest.price_per_kg, 0, ',', '.')}</td>
                                                                <td className="p-3 text-right font-semibold text-emerald-600">
                                                                    Rp{number_format(harvest.revenue, 0, ',', '.')}
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
                        </motion.div>
                    )}
                </AnimatePresence>
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
