import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { 
    Plus, 
    Search, 
    Calendar,
    User,
    ArrowRight,
    SlidersHorizontal,
    ClipboardList,
    Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Activity {
    id: number;
    project_name: string;
    project_id: number;
    type: 'feeding' | 'water_quality' | 'sampling' | 'mortality' | 'other';
    title: string;
    activity_date: string;
    activity_date_human: string;
    user_name: string;
    notes: string | null;
    record: any;
}

interface ProjectItem {
    id: number;
    name: string;
}

interface ActivitiesIndexProps {
    activities: Activity[];
    projects: ProjectItem[];
    filters: {
        project_id?: string;
        type?: string;
        search?: string;
    };
}

export default function Index({ activities, projects, filters }: ActivitiesIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [projectFilter, setProjectFilter] = useState(filters.project_id || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');

    // Instant client-side filtering
    const filteredActivities = activities.filter(activity => {
        const matchesSearch = !searchQuery || 
            activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (activity.notes && activity.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesProject = !projectFilter || activity.project_id.toString() === projectFilter.toString();
        const matchesType = !typeFilter || activity.type === typeFilter;
        return matchesSearch && matchesProject && matchesType;
    });

    const getActivityTypeDetails = (type: string) => {
        switch (type) {
            case 'feeding':
                return { label: 'Pakan', color: 'bg-blue-50 text-blue-700 border-blue-100' };
            case 'water_quality':
                return { label: 'Kualitas Air', color: 'bg-teal-50 text-teal-700 border-teal-100' };
            case 'sampling':
                return { label: 'Sampling', color: 'bg-purple-50 text-purple-700 border-purple-100' };
            case 'mortality':
                return { label: 'Kematian', color: 'bg-red-50 text-red-700 border-red-100' };
            default:
                return { label: 'Lainnya', color: 'bg-slate-50 text-slate-700 border-slate-100' };
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus catatan aktivitas ini secara permanen?')) {
            router.delete(`/activities/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Catatan Aktivitas" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-fg-app tracking-tight">Aktivitas Operasional</h2>
                    <p className="text-sm text-muted-app mt-0.5">Catat dan pantau aktivitas harian budidaya perikanan.</p>
                </div>
                <Link
                    href="/activities/create"
                    className="h-11 px-5 rounded-input bg-primary hover:bg-primary-dark active:scale-95 text-white text-sm font-semibold transition-all shadow-[0_4px_12px_rgba(14,165,168,0.25)] flex items-center gap-2 cursor-pointer shrink-0"
                >
                    <Plus className="h-4 w-4" />
                    Catat Aktivitas
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-card border border-border-app flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
                {/* Search */}
                <div className="relative w-full md:max-w-xs">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-app">
                        <Search className="h-4 w-4" />
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Cari aktivitas..."
                        className="w-full h-10 pl-10 pr-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-xs focus:outline-none focus:ring-2"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-1.5 text-muted-app text-xs font-semibold">
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>Filter:</span>
                    </div>

                    {/* Project filter */}
                    <select
                        value={projectFilter}
                        onChange={e => setProjectFilter(e.target.value)}
                        className="h-10 px-3 rounded-input border border-border-app text-fg-app text-xs bg-white focus:outline-none focus:ring-primary focus:ring-2"
                    >
                        <option value="">Semua Proyek</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    {/* Type filter */}
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        className="h-10 px-3 rounded-input border border-border-app text-fg-app text-xs bg-white focus:outline-none focus:ring-primary focus:ring-2"
                    >
                        <option value="">Semua Jenis</option>
                        <option value="feeding">Pemberian Pakan</option>
                        <option value="water_quality">Kualitas Air</option>
                        <option value="sampling">Sampling</option>
                        <option value="mortality">Kematian</option>
                        <option value="other">Lainnya</option>
                    </select>
                </div>
            </div>

            {/* Activities Timeline */}
            <div className="bg-white rounded-card border border-border-app p-6 md:p-8 shadow-xs">
                {activities.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center text-primary mx-auto mb-4">
                            <ClipboardList className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-lg text-fg-app">Belum ada aktivitas</h3>
                        <p className="text-sm text-muted-app max-w-sm mx-auto mt-1">
                            Aktivitas budidaya yang Anda catat akan muncul di lini masa ini.
                        </p>
                        <Link
                            href="/activities/create"
                            className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-input bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition-all shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Aktivitas
                        </Link>
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="font-bold text-base text-fg-app">Tidak menemukan aktivitas</h3>
                        <p className="text-xs text-muted-app mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                    </div>
                ) : (
                    <div className="relative border-l border-border-app ml-3.5 pl-6 space-y-6">
                        {filteredActivities.map((activity) => {
                            const details = getActivityTypeDetails(activity.type);
                            return (
                                <motion.div 
                                    key={activity.id}
                                    layout
                                    className="relative group flex flex-col sm:flex-row justify-between items-start gap-4"
                                >
                                    {/* Circle bullet */}
                                    <span className="absolute -left-[30px] top-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-primary group-hover:scale-125 transition-transform" />

                                    <div className="text-left space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-semibold text-sm text-fg-app">
                                                {activity.title}
                                            </h4>
                                            <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${details.color}`}>
                                                {details.label}
                                            </span>
                                            <Link 
                                                href={`/projects/${activity.project_id}`}
                                                className="text-xs text-primary hover:underline font-semibold"
                                            >
                                                {activity.project_name}
                                            </Link>
                                        </div>

                                        {/* Parameter display based on type */}
                                        {activity.type === 'feeding' && activity.record && (
                                            <div className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 inline-block">
                                                Pakan: {activity.record.feed_type} · {activity.record.quantity} kg
                                            </div>
                                        )}
                                        {activity.type === 'water_quality' && activity.record && (
                                            <div className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 inline-block space-x-3">
                                                <span>pH: {activity.record.ph}</span>
                                                <span>Suhu: {activity.record.temperature}°C</span>
                                                <span>DO: {activity.record.do} mg/L</span>
                                                <span>Salinitas: {activity.record.salinity} ppt</span>
                                            </div>
                                        )}
                                        {activity.type === 'sampling' && activity.record && (
                                            <div className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 inline-block space-x-3">
                                                <span>Berat Rata-rata: {activity.record.average_weight} gram</span>
                                                <span>Estimasi Biomassa: {activity.record.estimated_biomass} kg</span>
                                                {activity.record.sample_count && <span>Sampel: {activity.record.sample_count} ekor</span>}
                                            </div>
                                        )}
                                        {activity.type === 'mortality' && activity.record && (
                                            <div className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 inline-block">
                                                Kematian: {activity.record.quantity} ekor · Penyebab: {activity.record.cause || 'Tidak diketahui'}
                                            </div>
                                        )}

                                        {activity.notes && (
                                            <p className="text-xs text-muted-app leading-relaxed italic bg-bg-app/40 p-3 rounded-lg border border-border-app max-w-2xl">
                                                &ldquo;{activity.notes}&rdquo;
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 text-[10px] text-muted-app font-semibold">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{activity.activity_date_human}</span>
                                            <span>•</span>
                                            <User className="h-3.5 w-3.5" />
                                            <span>Oleh {activity.user_name}</span>
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                                        <button
                                            onClick={() => handleDelete(activity.id)}
                                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-app hover:text-danger-app transition-opacity p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                                            title="Hapus Aktivitas"
                                        >
                                            <Trash2 className="h-4.5 w-4.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
