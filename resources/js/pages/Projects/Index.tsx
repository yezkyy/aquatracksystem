import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { 
    Plus, 
    Search, 
    MapPin, 
    Scale, 
    User,
    Calendar,
    ArrowRight,
    SlidersHorizontal,
    FolderKanban
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Project {
    id: number;
    name: string;
    commodity: string;
    location: string;
    start_date: string;
    target_harvest_date: string;
    initial_stock: number;
    person_in_charge: string;
    status: 'planning' | 'active' | 'completed' | 'archived';
    running_days: number;
    target_days: number;
    progress: number;
}

interface ProjectsIndexProps {
    projects: Project[];
    commodities: string[];
    filters: {
        search?: string;
        status?: string;
        commodity?: string;
    };
}

export default function Index({ projects, filters, commodities }: ProjectsIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [commodityFilter, setCommodityFilter] = useState(filters.commodity || '');

    // Instant client-side filtering
    const filteredProjects = projects.filter(project => {
        const matchesSearch = !searchQuery || 
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.commodity.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || project.status === statusFilter;
        const matchesCommodity = !commodityFilter || project.commodity === commodityFilter;
        return matchesSearch && matchesStatus && matchesCommodity;
    });

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

    return (
        <AppLayout>
            <Head title="Proyek Budidaya" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-fg-app tracking-tight">Proyek Budidaya</h2>
                    <p className="text-sm text-muted-app mt-0.5">Kelola dan pantau seluruh siklus budidaya perikanan Anda.</p>
                </div>
                <Link
                    href="/projects/create"
                    className="h-11 px-5 rounded-input bg-primary hover:bg-primary-dark active:scale-95 text-white text-sm font-semibold transition-all shadow-[0_4px_12px_rgba(14,165,168,0.25)] flex items-center gap-2 cursor-pointer shrink-0"
                >
                    <Plus className="h-4 w-4" />
                    Buat Proyek
                </Link>
            </div>

            {/* Instant Search & Filters */}
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
                        placeholder="Cari proyek, lokasi, komoditas..."
                        className="w-full h-10 pl-10 pr-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-xs focus:outline-none focus:ring-2"
                    />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-1.5 text-muted-app text-xs font-semibold">
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>Filter:</span>
                    </div>

                    {/* Status Dropdown */}
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="h-10 px-3 rounded-input border border-border-app text-fg-app text-xs bg-white focus:outline-none focus:ring-primary focus:ring-2"
                    >
                        <option value="">Semua Status</option>
                        <option value="planning">Perencanaan</option>
                        <option value="active">Aktif</option>
                        <option value="completed">Selesai</option>
                        <option value="archived">Diarsipkan</option>
                    </select>

                    {/* Commodity Dropdown */}
                    <select
                        value={commodityFilter}
                        onChange={e => setCommodityFilter(e.target.value)}
                        className="h-10 px-3 rounded-input border border-border-app text-fg-app text-xs bg-white focus:outline-none focus:ring-primary focus:ring-2"
                    >
                        <option value="">Semua Komoditas</option>
                        {commodities.map((c, i) => (
                            <option key={i} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Project List */}
            {projects.length === 0 ? (
                <div className="bg-white border border-border-app rounded-card p-12 text-center shadow-xs">
                    <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center text-primary mx-auto mb-4">
                        <FolderKanban className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-fg-app">Belum ada proyek</h3>
                    <p className="text-sm text-muted-app max-w-sm mx-auto mt-1">
                        Buat proyek budidaya pertama Anda untuk mulai mencatat operasional harian.
                    </p>
                    <Link
                        href="/projects/create"
                        className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-input bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition-all shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Buat Proyek
                    </Link>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="bg-white border border-border-app rounded-card p-12 text-center shadow-xs">
                    <h3 className="font-bold text-base text-fg-app">Tidak menemukan proyek</h3>
                    <p className="text-xs text-muted-app mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => {
                        const status = getStatusDetails(project.status);
                        return (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white border border-border-app rounded-card hover:border-primary/30 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                            >
                                <div className="p-6 space-y-4">
                                    {/* Name & Status */}
                                    <div className="flex justify-between items-start gap-3">
                                        <h3 className="font-bold text-base text-fg-app hover:text-primary transition-colors leading-tight">
                                            <Link href={`/projects/${project.id}`}>
                                                {project.name}
                                            </Link>
                                        </h3>
                                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    {/* Parameters grid */}
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="flex items-center gap-2 text-muted-app">
                                            <MapPin className="h-4 w-4 shrink-0 text-primary" />
                                            <span className="truncate">{project.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-app">
                                            <Scale className="h-4 w-4 shrink-0 text-sky-500" />
                                            <span className="truncate">{project.commodity}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-app">
                                            <User className="h-4 w-4 shrink-0 text-purple-500" />
                                            <span className="truncate">{project.person_in_charge}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-app">
                                            <Calendar className="h-4 w-4 shrink-0 text-amber-500" />
                                            <span>Hari {project.running_days}/{project.target_days}</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1.5 pt-2">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-muted-app">Progress Siklus</span>
                                            <span className="text-primary">{project.progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-border-app rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-primary rounded-full transition-all duration-500" 
                                                style={{ width: `${project.progress}%` }} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer link */}
                                <Link 
                                    href={`/projects/${project.id}`}
                                    className="h-11 px-6 border-t border-border-app hover:bg-bg-app text-xs font-bold text-muted-app hover:text-primary transition-all flex items-center justify-between group cursor-pointer"
                                >
                                    <span>Lihat Detail Kolam</span>
                                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}
