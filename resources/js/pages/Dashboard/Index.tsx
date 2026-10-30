import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { 
    Plus, 
    ArrowUpRight, 
    TrendingUp, 
    Droplet, 
    Activity, 
    DollarSign, 
    AlertTriangle,
    CheckCircle,
    Info,
    Calendar,
    ArrowRight,
    Sparkles,
    Thermometer,
    Compass,
    Waves,
    User,
    Coins,
    ArrowDownRight
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

interface KPIItem {
    value: string | number;
    note: string;
    raw_kg?: number;
    raw?: number;
}

interface DashboardProps {
    kpis: {
        active_projects: KPIItem;
        total_biomass: KPIItem;
        survival_rate: KPIItem;
        total_expenses: KPIItem;
    };
    chart_data: Array<{ label: string; biomassa: number }>;
    water_quality: {
        [key: string]: { value: string; status: 'normal' | 'warning' | 'danger'; label: string };
    };
    active_projects: Array<{
        id: number;
        name: string;
        commodity: string;
        location: string;
        running_days: number;
        target_days: number;
        progress: number;
        status: string;
    }>;
    recent_activities: Array<{
        id: number;
        project_name: string;
        location: string;
        user_name: string;
        type: string;
        title: string;
        activity_date: string;
        activity_date_human: string;
        notes: string | null;
        record: any;
    }>;
    financial_summary: {
        expenses: string;
        expenses_raw: number;
        revenue: string;
        revenue_raw: number;
        profit: string;
        profit_raw: number;
    };
    attention_items: Array<{
        project_id: number | null;
        type: 'info' | 'warning' | 'danger';
        message: string;
    }>;
}

export default function Index({ 
    kpis, 
    chart_data, 
    water_quality, 
    active_projects, 
    recent_activities, 
    financial_summary,
    attention_items 
}: DashboardProps) {
    const { auth } = usePage<any>().props;
    const userName = auth?.user?.name || 'Pengguna';
    const [chartRange, setChartRange] = useState('30d');

    const handleRangeChange = (range: string) => {
        setChartRange(range);
        router.get('/dashboard', { chart_range: range }, { preserveState: true, preserveScroll: true });
    };

    const getActivityTypeDetails = (type: string) => {
        switch (type) {
            case 'feeding':
                return { label: 'Pakan', color: 'bg-sky-50 text-sky-700 border-sky-100/50' };
            case 'water_quality':
                return { label: 'Kualitas Air', color: 'bg-teal-50 text-teal-700 border-teal-100/50' };
            case 'sampling':
                return { label: 'Sampling', color: 'bg-purple-50 text-purple-700 border-purple-100/50' };
            case 'mortality':
                return { label: 'Kematian', color: 'bg-red-50 text-red-700 border-red-100/50' };
            default:
                return { label: 'Lainnya', color: 'bg-slate-50 text-slate-700 border-slate-100/50' };
        }
    };

    const getActivityAvatarStyle = (type: string) => {
        switch (type) {
            case 'feeding':
                return 'bg-sky-500 text-white shadow-[0_2px_8px_rgba(14,165,233,0.25)] border-sky-100';
            case 'water_quality':
                return 'bg-teal-500 text-white shadow-[0_2px_8px_rgba(20,184,166,0.25)] border-teal-100';
            case 'sampling':
                return 'bg-purple-500 text-white shadow-[0_2px_8px_rgba(168,85,247,0.25)] border-purple-100';
            case 'mortality':
                return 'bg-red-500 text-white shadow-[0_2px_8px_rgba(239,68,68,0.25)] border-red-100';
            default:
                return 'bg-primary text-white shadow-[0_2px_8px_rgba(14,165,168,0.25)] border-primary-light';
        }
    };

    const getNotesBorderColor = (type: string) => {
        switch (type) {
            case 'feeding': return 'border-l-sky-500/70';
            case 'water_quality': return 'border-l-teal-500/70';
            case 'sampling': return 'border-l-purple-500/70';
            case 'mortality': return 'border-l-red-500/70';
            default: return 'border-l-primary/70';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.04 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } }
    };

    return (
        <AppLayout>
            <Head title="Ringkasan Dashboard" />

            {/* Header Greeting */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border-app/40 pb-4 mb-1">
                <div className="text-left">
                    <h2 className="text-xl lg:text-2xl font-extrabold text-fg-app tracking-tight flex items-center gap-1.5">
                        Selamat pagi, {userName}
                    </h2>
                    <p className="text-xs text-muted-app mt-0.5 font-medium">Berikut ringkasan operasional budidaya perikanan Anda hari ini.</p>
                </div>
                <Link
                    href="/projects/create"
                    className="h-9 px-4 rounded-input bg-primary hover:bg-primary-dark active:scale-[0.96] text-white text-[11px] font-bold transition-all shadow-[0_3px_10px_rgba(14,165,168,0.2)] flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                    <Plus className="h-3.5 w-3.5 stroke-[3px]" />
                    Buat Proyek
                </Link>
            </div>

            {/* Compact Bento Grid Container */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                
                {/* 1. KPI CARDS */}
                {/* Proyek Aktif */}
                <motion.div 
                    variants={itemVariants} 
                    className="bg-white rounded-card border border-border-app/60 p-4 flex flex-col justify-between relative overflow-hidden group hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 border-l-4 border-l-primary"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-muted-app uppercase tracking-wider">Proyek Budidaya</span>
                        <div className="h-7 w-7 rounded-lg bg-primary-light flex items-center justify-center text-primary shadow-xs">
                            <Plus className="h-4 w-4 stroke-[2.5px]" />
                        </div>
                    </div>
                    <div className="mt-2.5">
                        <p className="text-2xl font-black text-fg-app tracking-tight group-hover:text-primary transition-colors leading-none">
                            {kpis.active_projects.value}
                        </p>
                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                            {kpis.active_projects.note}
                        </span>
                    </div>
                </motion.div>

                {/* Total Biomassa */}
                <motion.div 
                    variants={itemVariants} 
                    className="bg-white rounded-card border border-border-app/60 p-4 flex flex-col justify-between relative overflow-hidden group hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 border-l-4 border-l-sky-500"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-muted-app uppercase tracking-wider">Total Biomassa</span>
                        <div className="h-7 w-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500 shadow-xs">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2.5">
                        <p className="text-2xl font-black text-fg-app tracking-tight leading-none">
                            {kpis.total_biomass.value}
                        </p>
                        <span className="text-[9px] font-extrabold text-sky-700 bg-sky-50 border border-sky-100/50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                            Aktif terhitung
                        </span>
                    </div>
                </motion.div>

                {/* Survival Rate */}
                <motion.div 
                    variants={itemVariants} 
                    className="bg-white rounded-card border border-border-app/60 p-4 flex flex-col justify-between relative overflow-hidden group hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 border-l-4 border-l-emerald-500"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-muted-app uppercase tracking-wider">Kelangsungan Hidup (SR)</span>
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-xs">
                            <Activity className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2.5">
                        <p className="text-2xl font-black text-emerald-600 tracking-tight leading-none">
                            {kpis.survival_rate.value}
                        </p>
                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                            Rata-rata siklus
                        </span>
                    </div>
                </motion.div>

                {/* Total Biaya */}
                <motion.div 
                    variants={itemVariants} 
                    className="bg-white rounded-card border border-border-app/60 p-4 flex flex-col justify-between relative overflow-hidden group hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 border-l-4 border-l-amber-500"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-muted-app uppercase tracking-wider">Total Investasi Biaya</span>
                        <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shadow-xs">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2.5">
                        <p className="text-2xl font-black text-amber-600 tracking-tight leading-none">
                            {kpis.total_expenses.value}
                        </p>
                        <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                            Semua siklus
                        </span>
                    </div>
                </motion.div>

                {/* 2. AREA PRODUCTION CHART (Height reduced to h-52) */}
                <motion.div variants={itemVariants} className="bg-white rounded-card border border-border-app/70 p-4 md:col-span-2 lg:col-span-3 flex flex-col justify-between shadow-xs hover:shadow-xs transition-all duration-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <div className="text-left">
                            <h3 className="font-extrabold text-sm text-fg-app tracking-tight">Perkembangan Produksi</h3>
                            <p className="text-[10px] text-muted-app mt-0.5">Pertumbuhan berat biomassa total kolam aktif.</p>
                        </div>
                        <div className="flex bg-bg-app p-0.5 rounded-lg border border-border-app select-none">
                            {['7d', '30d', '3m'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => handleRangeChange(range)}
                                    className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                                        chartRange === range 
                                        ? 'bg-white text-primary shadow-xs' 
                                        : 'text-muted-app hover:text-fg-app'
                                    }`}
                                >
                                    {range === '7d' ? '7H' : range === '30d' ? '30H' : '3M'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chart_data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="areaColorBiomass" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0EA5A8" stopOpacity={0.25}/>
                                        <stop offset="95%" stopColor="#0EA5A8" stopOpacity={0.0}/>
                                    </linearGradient>
                                    <filter id="shadowFilter" height="130%">
                                        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0EA5A8" floodOpacity="0.2" />
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E8E8" />
                                <XAxis 
                                    dataKey="label" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    stroke="#667276" 
                                    style={{ fontSize: '10px', fontWeight: '600' }} 
                                />
                                <YAxis 
                                    tickLine={false} 
                                    axisLine={false} 
                                    stroke="#667276" 
                                    style={{ fontSize: '10px', fontWeight: '600' }}
                                    unit="t"
                                />
                                <Tooltip 
                                    contentStyle={{ background: '#172022', border: 'none', borderRadius: '8px', padding: '6px 10px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#FFFFFF' }}
                                    itemStyle={{ color: '#0EA5A8', fontSize: '11px', fontWeight: 'bold' }}
                                    formatter={(value: any) => [`${value} t`, 'Biomassa']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="biomassa" 
                                    stroke="#0EA5A8" 
                                    strokeWidth={2.5} 
                                    fillOpacity={1} 
                                    fill="url(#areaColorBiomass)"
                                    filter="url(#shadowFilter)"
                                    dot={{ r: 3.5, strokeWidth: 1.5, fill: '#FFFFFF', stroke: '#0EA5A8' }}
                                    activeDot={{ r: 5.5, strokeWidth: 0, fill: '#087F83' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 3. WATER QUALITY GRID */}
                <motion.div variants={itemVariants} className="bg-white rounded-card border border-border-app/70 p-4 flex flex-col justify-between shadow-xs hover:shadow-xs transition-all duration-200">
                    <div className="text-left">
                        <h3 className="font-extrabold text-sm text-fg-app tracking-tight">Kualitas Air</h3>
                        <p className="text-[10px] text-muted-app mt-0.5 font-medium">Rata-rata status parameter hari ini.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {Object.entries(water_quality).map(([key, item]) => {
                            const statusColor = item.status === 'normal'
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-100/50'
                                : item.status === 'warning'
                                ? 'text-amber-700 bg-amber-50 border-amber-100/50'
                                : 'text-red-700 bg-red-50 border-red-100/50';

                            const Icon = key === 'ph' ? Waves 
                                : key === 'temperature' ? Thermometer
                                : key === 'do' ? Droplet
                                : Compass;

                            const iconColor = key === 'ph' ? 'text-sky-500' 
                                : key === 'temperature' ? 'text-amber-600'
                                : key === 'do' ? 'text-teal-500'
                                : 'text-indigo-500';

                            let progressVal = 70;
                            if (item.status === 'warning') progressVal = 40;
                            else if (item.status === 'danger') progressVal = 15;

                            const gaugeBarColor = item.status === 'normal'
                                ? 'bg-emerald-500'
                                : item.status === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-red-500';

                            return (
                                <div key={key} className="p-2.5 bg-bg-app/40 rounded-xl border border-border-app/50 flex flex-col justify-between text-left hover:border-primary/20 hover:bg-bg-app/80 transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-muted-app uppercase tracking-wider block">
                                            {item.label}
                                        </span>
                                        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-base font-extrabold text-fg-app tracking-tight block">
                                            {item.value}
                                        </span>
                                        <div className="h-1 w-full bg-border-app rounded-full overflow-hidden mt-1 mb-2">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${gaugeBarColor}`}
                                                style={{ width: `${progressVal}%` }} 
                                            />
                                        </div>
                                        <span className={`px-1.5 py-0.5 rounded-md border text-[8px] font-extrabold uppercase tracking-widest inline-block ${statusColor}`}>
                                            {item.status === 'normal' ? 'Normal' : item.status === 'warning' ? 'Waspada' : 'Bahaya'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* 4. ATTENTION CARD LIST */}
                <motion.div variants={itemVariants} className="bg-white rounded-card border border-border-app/70 p-4 md:col-span-2 shadow-xs flex flex-col hover:shadow-xs transition-all duration-200">
                    <div className="text-left mb-3">
                        <h3 className="font-extrabold text-sm text-fg-app tracking-tight">Perlu Perhatian</h3>
                        <p className="text-[10px] text-muted-app mt-0.5">Tindakan operasional kolam hari ini.</p>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto max-h-[220px] pr-1">
                        {attention_items.map((item, idx) => {
                            const iconStyle = item.type === 'danger' 
                                ? 'text-red-700 bg-red-50 border-red-100/60 shadow-xs' 
                                : item.type === 'warning'
                                ? 'text-amber-700 bg-amber-50 border-amber-100/60 shadow-xs'
                                : 'text-sky-700 bg-sky-50 border-sky-100/60 shadow-xs';
                            
                            const borderSeverityClass = item.type === 'danger'
                                ? 'border-l-4 border-l-red-500 bg-red-50/10'
                                : item.type === 'warning'
                                ? 'border-l-4 border-l-amber-500 bg-amber-50/10'
                                : 'border-l-4 border-l-sky-500 bg-sky-50/10';

                            const Icon = item.type === 'danger' ? AlertTriangle 
                                : item.type === 'warning' ? AlertTriangle
                                : Info;

                            return (
                                <div 
                                    key={idx}
                                    className={`flex gap-3 p-2.5 rounded-xl border border-border-app transition-all hover:bg-bg-app/20 ${borderSeverityClass}`}
                                >
                                    <div className={`h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 ${iconStyle}`}>
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-[11px] font-semibold text-fg-app leading-tight">
                                            {item.message}
                                        </p>
                                        {item.project_id && (
                                            <Link 
                                                href={`/projects/${item.project_id}`}
                                                className="text-[8px] font-extrabold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-0.5 mt-1 cursor-pointer uppercase tracking-widest"
                                            >
                                                Pemeriksaan <ArrowRight className="h-2.5 w-2.5 stroke-[3px]" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* 5. ACTIVE PROJECTS PANEL */}
                <motion.div variants={itemVariants} className="bg-white rounded-card border border-border-app/70 p-4 md:col-span-2 shadow-xs flex flex-col justify-between hover:shadow-xs transition-all duration-200">
                    <div>
                        <div className="flex justify-between items-center mb-3.5 text-left">
                            <div>
                                <h3 className="font-extrabold text-sm text-fg-app tracking-tight">Daftar Proyek Aktif</h3>
                                <p className="text-[10px] text-muted-app mt-0.5 font-medium">Siklus budidaya sedang berjalan.</p>
                            </div>
                            <Link 
                                href="/projects"
                                className="text-[11px] font-bold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                            >
                                Lihat Semua <ArrowRight className="h-3 w-3 stroke-[2.5px]" />
                            </Link>
                        </div>

                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                            {active_projects.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-xs text-muted-app">Belum ada proyek aktif.</p>
                                    <Link href="/projects/create" className="text-[10px] font-bold text-primary hover:underline mt-1 inline-block">
                                        Buat Proyek Baru
                                    </Link>
                                </div>
                            ) : (
                                active_projects.map((project) => (
                                    <Link 
                                        key={project.id}
                                        href={`/projects/${project.id}`}
                                        className="block p-3 rounded-xl border border-border-app/60 hover:border-primary/40 bg-white hover:bg-bg-app/10 transition-all cursor-pointer text-left group"
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h4 className="font-extrabold text-xs text-fg-app group-hover:text-primary transition-colors leading-tight">
                                                    {project.name}
                                                </h4>
                                                <span className="text-[9px] text-muted-app font-semibold mt-0.5 inline-block uppercase tracking-wider">
                                                    {project.location} · {project.commodity}
                                                </span>
                                            </div>
                                            <span className="text-[8px] font-bold text-primary bg-primary-light border border-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                H-{project.running_days}/{project.target_days}
                                            </span>
                                        </div>

                                        <div className="mt-3">
                                            <div className="flex justify-between items-center mb-1 text-[9px] font-bold">
                                                <span className="text-muted-app">Progress</span>
                                                <span className="text-primary">{project.progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-border-app rounded-full overflow-hidden relative">
                                                <div 
                                                    className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_6px_rgba(14,165,168,0.3)] relative" 
                                                    style={{ width: `${project.progress}%` }} 
                                                >
                                                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* 6. RECENT ACTIVITIES WITH COMPACT TIMELINE */}
                <motion.div variants={itemVariants} className="bg-white rounded-card border border-border-app/70 p-4 md:col-span-2 shadow-xs flex flex-col hover:shadow-xs transition-all duration-200">
                    <div className="text-left mb-4">
                        <h3 className="font-extrabold text-sm text-fg-app tracking-tight">Aktivitas Terkini</h3>
                        <p className="text-[10px] text-muted-app mt-0.5 font-medium">Umpan balik operasional kolam dari petugas.</p>
                    </div>

                    <div className="space-y-5 flex-1 overflow-y-auto max-h-[260px] pr-2 pl-1.5">
                        {recent_activities.length === 0 ? (
                            <p className="text-xs text-muted-app pl-2 py-4 text-left font-medium">Belum ada aktivitas dicatat.</p>
                        ) : (
                            recent_activities.map((activity, idx) => {
                                const details = getActivityTypeDetails(activity.type);
                                const avatarStyle = getActivityAvatarStyle(activity.type);
                                const notesBorder = getNotesBorderColor(activity.type);
                                return (
                                    <div key={activity.id} className="flex gap-4 items-start relative group text-left">
                                        {/* Timeline connector and avatar */}
                                        <div className="relative flex flex-col items-center justify-start shrink-0 w-6 self-stretch">
                                            {recent_activities.length > 1 && (
                                                <div className={`absolute w-0.5 bg-border-app/70 ${
                                                    idx === 0 
                                                        ? 'top-[12px] bottom-0' 
                                                        : idx === recent_activities.length - 1 
                                                        ? 'top-0 h-[12px]' 
                                                        : 'top-0 bottom-0'
                                                }`} />
                                            )}
                                            
                                            <div className={`relative h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold shadow-sm group-hover:scale-105 transition-transform z-10 ${avatarStyle}`}>
                                                {activity.user_name.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        
                                        {/* Content column */}
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                <span className="text-[11px] font-bold text-fg-app leading-tight">
                                                    {activity.title}
                                                </span>
                                                <span className="text-[9px] text-muted-app font-semibold uppercase tracking-wider">
                                                    ({activity.project_name})
                                                </span>
                                            </div>
                                            
                                            {activity.type === 'feeding' && activity.record && (
                                                <p className="text-[11px] font-bold text-sky-600">
                                                    Pakan: {activity.record.feed_type} · {activity.record.quantity} kg
                                                </p>
                                            )}

                                            {activity.type === 'water_quality' && activity.record && (
                                                <p className="text-[11px] font-bold text-teal-600">
                                                    pH {activity.record.ph} · Oksigen {activity.record.do} mg/L · Suhu {activity.record.temperature}°C
                                                </p>
                                            )}

                                            {activity.type === 'sampling' && activity.record && (
                                                <p className="text-[11px] font-bold text-purple-600">
                                                    Bobot rata-rata: {activity.record.average_weight} gr · Biomassa {activity.record.estimated_biomass} kg
                                                </p>
                                            )}

                                            {activity.type === 'mortality' && activity.record && (
                                                <p className="text-[11px] font-bold text-red-600">
                                                    Kematian: {activity.record.quantity} ekor · Penyebab: {activity.record.cause || '-'}
                                                </p>
                                            )}

                                            {activity.notes && (
                                                <p className={`text-[10px] text-muted-app mt-1 leading-relaxed italic bg-bg-app/50 px-2.5 py-1.5 rounded-lg border-l-2 border-y border-r border-border-app/40 max-w-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${notesBorder}`}>
                                                    &ldquo;{activity.notes}&rdquo;
                                                </p>
                                            )}
                                            
                                            <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-muted-app font-semibold uppercase tracking-wider">
                                                <span className={`px-1.5 py-0 border ${details.color} text-[8px] tracking-widest font-extrabold rounded-md`}>
                                                    {details.label}
                                                </span>
                                                <span>•</span>
                                                <span>{activity.activity_date_human}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <User className="h-2.5 w-2.5" />
                                                    {activity.user_name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>

                {/* 7. FINANCIAL SUMMARY CARD */}
                <motion.div variants={itemVariants} className="bg-white rounded-card border border-border-app p-5 md:col-span-2 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 text-left">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-extrabold text-sm text-fg-app tracking-tight flex items-center gap-2">
                                    <Coins className="h-4.5 w-4.5 text-primary" />
                                    Ringkasan Finansial
                                </h3>
                                <p className="text-[10px] text-muted-app mt-0.5 font-medium">Gabungan seluruh operasional kolam/tambak.</p>
                            </div>
                            <Link 
                                href="/financial"
                                className="text-[11px] font-bold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                            >
                                Buka Ledger <ArrowRight className="h-3 w-3 stroke-[2.5px]" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {/* Expenses */}
                            <div className="p-3 bg-red-50/20 rounded-xl border border-red-100/60 flex flex-col justify-between h-20 text-left hover:bg-red-50/40 transition-all group">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-red-600 uppercase tracking-wider block">Pengeluaran</span>
                                    <ArrowDownRight className="h-3.5 w-3.5 text-red-500 opacity-60 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-sm font-extrabold text-red-700 tracking-tight mt-auto block">
                                    {financial_summary.expenses}
                                </span>
                            </div>

                            {/* Revenue */}
                            <div className="p-3 bg-emerald-50/20 rounded-xl border border-emerald-100/60 flex flex-col justify-between h-20 text-left hover:bg-emerald-50/40 transition-all group">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">Pendapatan</span>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500 opacity-60 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-sm font-extrabold text-emerald-700 tracking-tight mt-auto block">
                                    {financial_summary.revenue}
                                </span>
                            </div>

                            {/* Profit */}
                            <div className={`p-3 rounded-xl border flex flex-col justify-between h-20 text-left hover:bg-opacity-80 transition-all group ${
                                financial_summary.profit_raw >= 0 
                                ? 'bg-teal-50/20 border-teal-100/60 hover:bg-teal-50/40' 
                                : 'bg-red-50/20 border-red-100/60 hover:bg-red-50/40'
                            }`}>
                                <div className="flex justify-between items-center">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                                        financial_summary.profit_raw >= 0 ? 'text-teal-600' : 'text-red-600'
                                    }`}>
                                        Keuntungan
                                    </span>
                                    <Coins className={`h-3.5 w-3.5 opacity-60 group-hover:scale-110 transition-transform ${
                                        financial_summary.profit_raw >= 0 ? 'text-teal-500' : 'text-red-500'
                                    }`} />
                                </div>
                                <span className={`text-sm font-extrabold tracking-tight mt-auto block ${
                                    financial_summary.profit_raw >= 0 ? 'text-teal-700' : 'text-red-700'
                                }`}>
                                    {financial_summary.profit}
                                </span>
                            </div>
                        </div>

                        {/* Visual distribution stacked progress bar */}
                        {(() => {
                            const exp = financial_summary.expenses_raw || 0;
                            const rev = financial_summary.revenue_raw || 0;
                            const profit = financial_summary.profit_raw || 0;
                            const total = rev > 0 ? rev : (exp + Math.max(0, profit)) || 1;
                            
                            const expPct = Math.min(100, Math.round((exp / total) * 100));
                            const profitPct = Math.min(100 - expPct, Math.round((Math.max(0, profit) / total) * 100));
                            const marginPct = rev > 0 ? Math.round((profit / rev) * 100) : 0;

                            return (
                                <div className="border-t border-border-app/60 pt-4 mt-2">
                                    <div className="flex justify-between items-center text-[10px] font-extrabold mb-2">
                                        <span className="text-muted-app">Margin & Aliran Kas</span>
                                        {profit >= 0 ? (
                                            <span className="text-teal-600">Laba Bersih: {marginPct}% dari pendapatan</span>
                                        ) : (
                                            <span className="text-red-600">Rugi Bersih</span>
                                        )}
                                    </div>
                                    
                                    <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
                                        {expPct > 0 && (
                                            <div 
                                                className="bg-red-500 transition-all duration-500 flex items-center justify-center" 
                                                style={{ width: `${expPct}%` }}
                                                title={`Pengeluaran: ${expPct}%`}
                                            />
                                        )}
                                        {profitPct > 0 && (
                                            <div 
                                                className="bg-teal-500 transition-all duration-500 flex items-center justify-center" 
                                                style={{ width: `${profitPct}%` }}
                                                title={`Keuntungan Bersih: ${profitPct}%`}
                                            />
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-4 mt-2.5 text-[9px] font-semibold text-muted-app">
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-red-500 block" />
                                            <span>Biaya Operasional ({expPct}%)</span>
                                        </div>
                                        {profit > 0 && (
                                            <div className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-teal-500 block" />
                                                <span>Laba Bersih ({profitPct}%)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}
