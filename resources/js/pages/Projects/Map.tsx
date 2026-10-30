import React, { useState, useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    MapPin, 
    Droplet, 
    Thermometer, 
    Compass, 
    Activity, 
    Calendar, 
    User, 
    ChevronRight,
    TrendingUp,
    Search,
    Filter,
    X,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaterQualityData {
    ph?: number;
    temperature?: number;
    do?: number;
    salinity?: number;
}

interface Project {
    id: number;
    name: string;
    commodity: string;
    location: string;
    start_date: string;
    target_harvest_date: string;
    initial_stock: number;
    person_in_charge: string;
    status: string;
    running_days: number;
    target_days: number;
    progress: number;
    biomass_kg: number;
    latitude: number | null;
    longitude: number | null;
    province: string | null;
    latest_water_quality: WaterQualityData | null;
}

interface MapProps {
    projects: Project[];
}

export default function Map({ projects }: MapProps) {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [commodityFilter, setCommodityFilter] = useState('all');
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

    // Selected project data helper
    const selectedProject = useMemo(() => {
        return projects.find(p => p.id === selectedProjectId) || null;
    }, [projects, selectedProjectId]);

    // Unique commodities & status lists for filter dropdown
    const commodities = useMemo(() => {
        const set = new Set(projects.map(p => p.commodity));
        return Array.from(set);
    }, [projects]);

    // Filter projects that have coordinates
    const mapProjects = useMemo(() => {
        return projects.filter(p => p.latitude !== null && p.longitude !== null);
    }, [projects]);

    // Filtered projects
    const filteredProjects = useMemo(() => {
        return mapProjects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (project.province && project.province.toLowerCase().includes(searchQuery.toLowerCase())) ||
                project.commodity.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' ? true : project.status === statusFilter;
            const matchesCommodity = commodityFilter === 'all' ? true : project.commodity === commodityFilter;

            return matchesSearch && matchesStatus && matchesCommodity;
        });
    }, [mapProjects, searchQuery, statusFilter, commodityFilter]);

    // Indonesia Map Dimensions in SVG Coordinates
    const width = 800;
    const height = 450;

    // Linear projection function: converts lat/long to X/Y coordinates
    // Indonesia bounds: Longitude 95.0 to 141.0, Latitude -11.0 to 6.0
    const projectCoords = (lat: number, lng: number) => {
        const x = ((lng - 95.0) / (141.0 - 95.0)) * width;
        const y = ((6.0 - lat) / (6.0 - (-11.0))) * height;
        return { x, y };
    };

    // Helper for health state
    const getHealthState = (project: Project) => {
        if (!project.latest_water_quality) return 'unknown';
        const doValue = project.latest_water_quality.do;
        if (doValue !== undefined) {
            if (doValue < 4.0) return 'danger';
            if (doValue < 5.0) return 'warning';
        }
        return 'success';
    };

    // Calculate aggregated KPIs
    const totalActive = projects.filter(p => p.status === 'active').length;
    const activeBiomass = useMemo(() => {
        const totalKg = projects.filter(p => p.status === 'active').reduce((acc, p) => acc + p.biomass_kg, 0);
        return (totalKg / 1000).toFixed(1);
    }, [projects]);
    
    const averageDo = useMemo(() => {
        const activeProjectsWithDo = projects.filter(p => p.latest_water_quality?.do !== undefined);
        if (activeProjectsWithDo.length === 0) return 0;
        const sum = activeProjectsWithDo.reduce((acc, p) => acc + (p.latest_water_quality!.do || 0), 0);
        return (sum / activeProjectsWithDo.length).toFixed(1);
    }, [projects]);

    return (
        <AppLayout>
            <Head title="Pemantauan Spasial Budidaya" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-fg-app tracking-tight">Peta Pemantauan Spasial</h2>
                        <p className="text-sm text-muted-app mt-1">
                            Pantau kualitas air, perkembangan biomassa, dan operasional tambak di seluruh Indonesia secara geografis.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        <Link 
                            href="/projects" 
                            className="h-10 px-4 rounded-input border border-border-app bg-white text-fg-app text-sm font-medium flex items-center justify-center gap-2 hover:bg-bg-app transition-colors"
                        >
                            Daftar Proyek
                        </Link>
                        <Link 
                            href="/projects/create" 
                            className="h-10 px-4 rounded-input bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-sm"
                        >
                            Tambah Proyek Baru
                        </Link>
                    </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* KPI 1 */}
                    <div className="bg-white border border-border-app p-5 rounded-card flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left">
                        <div className="h-11 w-11 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-muted-app uppercase tracking-wider block">Proyek Aktif</span>
                            <span className="text-xl font-bold text-fg-app block mt-0.5">{totalActive} Proyek</span>
                        </div>
                    </div>

                    {/* KPI 2 */}
                    <div className="bg-white border border-border-app p-5 rounded-card flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left">
                        <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-muted-app uppercase tracking-wider block">Biomassa Aktif</span>
                            <span className="text-xl font-bold text-fg-app block mt-0.5">{activeBiomass} Ton</span>
                        </div>
                    </div>

                    {/* KPI 3 */}
                    <div className="bg-white border border-border-app p-5 rounded-card flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left">
                        <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Droplet className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-muted-app uppercase tracking-wider block">Rata-rata Oksigen (DO)</span>
                            <span className="text-xl font-bold text-fg-app block mt-0.5">{averageDo} mg/L</span>
                        </div>
                    </div>

                    {/* KPI 4 */}
                    <div className="bg-white border border-border-app p-5 rounded-card flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left">
                        <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                            <Compass className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-muted-app uppercase tracking-wider block">Wilayah Terpantau</span>
                            <span className="text-xl font-bold text-fg-app block mt-0.5">
                                {Array.from(new Set(mapProjects.map(p => p.province).filter(Boolean))).length} Provinsi
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Interactive Map & Drawer Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Map Box */}
                    <div className="lg:col-span-8 bg-white border border-border-app rounded-card p-6 shadow-xs flex flex-col space-y-4">
                        
                        {/* Map Filters & Search */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-app">
                                    <Search className="h-4 w-4" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Cari proyek atau provinsi..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full h-10 pl-9 pr-4 rounded-input border border-border-app bg-white text-fg-app text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>

                            <div className="flex gap-2 shrink-0">
                                {/* Commodity Filter */}
                                <div className="relative">
                                    <select
                                        value={commodityFilter}
                                        onChange={e => setCommodityFilter(e.target.value)}
                                        className="h-10 px-3 pr-8 rounded-input border border-border-app bg-white text-fg-app text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer font-medium text-left"
                                    >
                                        <option value="all">Semua Komoditas</option>
                                        {commodities.map((c, i) => (
                                            <option key={i} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-app pointer-events-none" />
                                </div>

                                {/* Status Filter */}
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={e => setStatusFilter(e.target.value)}
                                        className="h-10 px-3 pr-8 rounded-input border border-border-app bg-white text-fg-app text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer font-medium text-left"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="active">Aktif</option>
                                        <option value="planning">Perencanaan</option>
                                        <option value="completed">Selesai</option>
                                    </select>
                                    <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-app pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Map Container */}
                        <div className="relative bg-[#0d1619] border border-[#16272b] rounded-card overflow-hidden select-none aspect-[800/450] w-full flex items-center justify-center p-2 shadow-inner">
                            {/* Watermark grid effect */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#142428_1px,transparent_1px),linear-gradient(to_bottom,#142428_1px,transparent_1px)] bg-[size:25px_25px] opacity-75" />

                            <svg 
                                viewBox={`0 0 ${width} ${height}`} 
                                className="w-full h-auto max-h-[450px] relative z-10 drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
                            >
                                {/* INTERACTIVE MAP SHAPES */}
                                <g transform="scale(1, 1.2857)" fill="#142327" stroke="#1c3035" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                                    {/* Sumatra */}
                                    <path 
                                        d="M 5,10 L 63,49 L 113,113 L 170,185 L 174,237 L 155,240 L 127,202 L 92,142 L 50,70 Z" 
                                        className={`transition-colors duration-200 cursor-pointer ${hoveredRegion === 'Sumatra' ? 'fill-[#1c3e44] stroke-[#0ea5a8]' : 'hover:fill-[#182d32] hover:stroke-[#254147]'}`}
                                        onMouseEnter={() => setHoveredRegion('Sumatra')}
                                        onMouseLeave={() => setHoveredRegion(null)}
                                    />
                                    {/* Java */}
                                    <path 
                                        d="M 177,247 L 205,251 L 236,262 L 268,268 L 308,272 L 337,292 L 334,300 L 268,288 L 191,268 Z" 
                                        className={`transition-colors duration-200 cursor-pointer ${hoveredRegion === 'Java' ? 'fill-[#1c3e44] stroke-[#0ea5a8]' : 'hover:fill-[#182d32] hover:stroke-[#254147]'}`}
                                        onMouseEnter={() => setHoveredRegion('Java')}
                                        onMouseLeave={() => setHoveredRegion(null)}
                                    />
                                    {/* Kalimantan */}
                                    <path 
                                        d="M 249,124 L 254,82 L 310,70 L 383,41 L 391,100 L 391,124 L 374,206 L 339,196 L 261,185 Z" 
                                        className={`transition-colors duration-200 cursor-pointer ${hoveredRegion === 'Kalimantan' ? 'fill-[#1c3e44] stroke-[#0ea5a8]' : 'hover:fill-[#182d32] hover:stroke-[#254147]'}`}
                                        onMouseEnter={() => setHoveredRegion('Kalimantan')}
                                        onMouseLeave={() => setHoveredRegion(null)}
                                    />
                                    {/* Sulawesi */}
                                    <path 
                                        d="M 424,229 L 431,185 L 423,144 L 435,103 L 478,113 L 520,93 L 500,110 L 461,130 L 496,144 L 485,160 L 460,154 L 480,206 L 465,210 L 450,175 L 443,239 Z" 
                                        className={`transition-colors duration-200 cursor-pointer ${hoveredRegion === 'Sulawesi' ? 'fill-[#1c3e44] stroke-[#0ea5a8]' : 'hover:fill-[#182d32] hover:stroke-[#254147]'}`}
                                        onMouseEnter={() => setHoveredRegion('Sulawesi')}
                                        onMouseLeave={() => setHoveredRegion(null)}
                                    />
                                    {/* Papua */}
                                    <path 
                                        d="M 631,140 L 678,140 L 696,160 L 795,175 L 800,288 L 730,227 L 713,216 L 660,185 Z" 
                                        className={`transition-colors duration-200 cursor-pointer ${hoveredRegion === 'Papua' ? 'fill-[#1c3e44] stroke-[#0ea5a8]' : 'hover:fill-[#182d32] hover:stroke-[#254147]'}`}
                                        onMouseEnter={() => setHoveredRegion('Papua')}
                                        onMouseLeave={() => setHoveredRegion(null)}
                                    />
                                    {/* Bali & Nusa Tenggara */}
                                    <g className="hover:fill-[#182d32] hover:stroke-[#254147] transition-colors cursor-pointer">
                                        <path d="M 345,296 A 3.5,3.5 0 1,1 345,297" />
                                        <path d="M 365,298 A 3.5,3.5 0 1,1 365,299" />
                                        <path d="M 380,299 L 400,298 L 396,303 H 383 Z" />
                                        <path d="M 420,300 H 455 L 450,304 H 418 Z" />
                                        <path d="M 475,316 L 505,326 L 500,333 L 470,321 Z" />
                                    </g>
                                    {/* Maluku */}
                                    <g className="hover:fill-[#182d32] hover:stroke-[#254147] transition-colors cursor-pointer">
                                        <path d="M 520,182 L 550,184 L 545,188 L 518,185 Z" />
                                        <path d="M 525,120 L 540,110 L 530,135 L 545,145 L 535,155 L 520,135 Z" />
                                        <path d="M 495,190 A 5,5 0 1,1 495,191" />
                                        <path d="M 560,220 A 3,3 0 1,1 560,221 M 575,235 A 4,4 0 1,1 575,236" />
                                    </g>
                                </g>

                                {/* Labels for Regions */}
                                <g fill="#4c6c74" fontSize="8" fontWeight="bold" opacity="0.8" pointerEvents="none">
                                    <text x="80" y="167">SUMATRA</text>
                                    <text x="290" y="161">KALIMANTAN</text>
                                    <text x="240" y="379">JAWA</text>
                                    <text x="440" y="206">SULAWESI</text>
                                    <text x="510" y="219">MALUKU</text>
                                    <text x="700" y="257">PAPUA</text>
                                </g>

                                {/* PINS/MARKERS OF FILTERED PROJECTS */}
                                {filteredProjects.map((project) => {
                                    const coords = projectCoords(project.latitude!, project.longitude!);
                                    const health = getHealthState(project);
                                    const isSelected = project.id === selectedProjectId;

                                    let markerColor = 'fill-emerald-400 stroke-emerald-950';
                                    if (health === 'warning') {
                                        markerColor = 'fill-amber-400 stroke-amber-950';
                                    } else if (health === 'danger') {
                                        markerColor = 'fill-rose-400 stroke-rose-950';
                                    } else if (health === 'unknown') {
                                        markerColor = 'fill-slate-400 stroke-slate-950';
                                    }

                                    return (
                                        <g 
                                            key={project.id} 
                                            transform={`translate(${coords.x}, ${coords.y})`}
                                            className="cursor-pointer group"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProjectId(project.id);
                                            }}
                                        >
                                            {/* Ripple Pulse Effect */}
                                            {project.status === 'active' && (
                                                <circle 
                                                    r="12" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    strokeWidth="1.5" 
                                                    className={`opacity-50 animate-ping duration-1000 ${
                                                        health === 'danger' ? 'text-rose-500' : health === 'warning' ? 'text-amber-500' : 'text-emerald-500'
                                                    }`} 
                                                />
                                            )}

                                            {/* Selection Highlight */}
                                            {isSelected && (
                                                <circle r="16" fill="none" stroke="#0ea5a8" strokeWidth="2" className="opacity-70 animate-pulse" />
                                            )}

                                            {/* Hover tooltip hint */}
                                            <title>{project.name} ({project.province})</title>

                                            {/* Pin Marker */}
                                            <circle 
                                                r={isSelected ? "7" : "5.5"} 
                                                className={`${isSelected ? 'fill-[#0ea5a8] stroke-white' : markerColor} stroke-2 transition-all duration-200 group-hover:scale-125`} 
                                            />
                                        </g>
                                    );
                                })}
                            </svg>

                            {/* Floating Map Legend */}
                            <div className="absolute bottom-4 left-4 bg-[#0d1619]/90 backdrop-blur-md border border-[#16272b] rounded-xl p-3 space-y-2 shadow-lg text-left max-w-[160px]">
                                <span className="text-[10px] font-bold text-white block">Kualitas Air (DO):</span>
                                <div className="flex flex-col gap-1.5 text-[9px] font-bold text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                        <span>Optimal (&ge; 5 mg/L)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                        <span>Peringatan (4-5)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]" />
                                        <span>Kritis (&lt; 4 mg/L)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                                        <span>Belum Ada Data</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Monitoring Panel / Drawer */}
                    <div className="lg:col-span-4 h-full">
                        <AnimatePresence mode="wait">
                            {selectedProject ? (
                                <motion.div
                                    key={selectedProject.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white border border-border-app rounded-card p-6 shadow-xs space-y-5 text-left h-full flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Drawer Header */}
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <span className="text-[10px] font-bold bg-primary-light text-primary px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                    {selectedProject.commodity}
                                                </span>
                                                <h3 className="text-base font-bold text-fg-app mt-2 leading-tight">
                                                    {selectedProject.name}
                                                </h3>
                                                <span className="text-xs text-muted-app block mt-0.5">
                                                    {selectedProject.location} · {selectedProject.province}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedProjectId(null)}
                                                className="h-8 w-8 rounded-lg hover:bg-bg-app flex items-center justify-center text-muted-app hover:text-fg-app transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="h-px bg-border-app/60 my-4" />

                                        {/* Project Progress */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-xs font-bold">
                                                <span className="text-muted-app">Progress Siklus</span>
                                                <span className="text-fg-app">{selectedProject.progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary rounded-full transition-all duration-500" 
                                                    style={{ width: `${selectedProject.progress}%` }} 
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] text-muted-app font-medium">
                                                <span>Hari {selectedProject.running_days}</span>
                                                <span>Target {selectedProject.target_days} hari</span>
                                            </div>
                                        </div>

                                        <div className="h-px bg-border-app/60 my-4" />

                                        {/* Water Quality Section */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-fg-app uppercase tracking-wider">
                                                Parameter Kualitas Air Terbaru
                                            </h4>

                                            {selectedProject.latest_water_quality ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* DO Gauge */}
                                                    <div className="bg-bg-app border border-border-app/40 rounded-card p-3 space-y-1">
                                                        <div className="flex items-center gap-1.5 text-blue-600">
                                                            <Droplet className="h-3.5 w-3.5" />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider">DO (Oksigen)</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-fg-app">
                                                            {selectedProject.latest_water_quality.do !== undefined 
                                                                ? `${selectedProject.latest_water_quality.do} mg/L` 
                                                                : '-'}
                                                        </p>
                                                        {selectedProject.latest_water_quality.do !== undefined && (
                                                            <span className={`text-[9px] font-bold block ${
                                                                selectedProject.latest_water_quality.do < 4.0 ? 'text-danger-app' : 'text-emerald-600'
                                                            }`}>
                                                                {selectedProject.latest_water_quality.do < 4.0 ? 'Kritis' : 'Normal'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Temp Gauge */}
                                                    <div className="bg-bg-app border border-border-app/40 rounded-card p-3 space-y-1">
                                                        <div className="flex items-center gap-1.5 text-amber-600">
                                                            <Thermometer className="h-3.5 w-3.5" />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider">Suhu</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-fg-app">
                                                            {selectedProject.latest_water_quality.temperature !== undefined 
                                                                ? `${selectedProject.latest_water_quality.temperature}°C` 
                                                                : '-'}
                                                        </p>
                                                        {selectedProject.latest_water_quality.temperature !== undefined && (
                                                            <span className={`text-[9px] font-bold block ${
                                                                (selectedProject.latest_water_quality.temperature < 28 || selectedProject.latest_water_quality.temperature > 32) ? 'text-amber-500' : 'text-emerald-600'
                                                            }`}>
                                                                {(selectedProject.latest_water_quality.temperature < 28 || selectedProject.latest_water_quality.temperature > 32) ? 'Peringatan' : 'Optimal'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* pH Gauge */}
                                                    <div className="bg-bg-app border border-border-app/40 rounded-card p-3 space-y-1">
                                                        <div className="flex items-center gap-1.5 text-emerald-600">
                                                            <Activity className="h-3.5 w-3.5" />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider">pH Air</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-fg-app">
                                                            {selectedProject.latest_water_quality.ph !== undefined 
                                                                ? selectedProject.latest_water_quality.ph 
                                                                : '-'}
                                                        </p>
                                                        {selectedProject.latest_water_quality.ph !== undefined && (
                                                            <span className={`text-[9px] font-bold block ${
                                                                (selectedProject.latest_water_quality.ph < 7.5 || selectedProject.latest_water_quality.ph > 8.5) ? 'text-danger-app' : 'text-emerald-600'
                                                            }`}>
                                                                {(selectedProject.latest_water_quality.ph < 7.5 || selectedProject.latest_water_quality.ph > 8.5) ? 'Tidak Stabil' : 'Stabil'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Salinity Gauge */}
                                                    <div className="bg-bg-app border border-border-app/40 rounded-card p-3 space-y-1">
                                                        <div className="flex items-center gap-1.5 text-indigo-600">
                                                            <Droplet className="h-3.5 w-3.5 animate-pulse" />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider">Salinitas</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-fg-app">
                                                            {selectedProject.latest_water_quality.salinity !== undefined 
                                                                ? `${selectedProject.latest_water_quality.salinity} ppt` 
                                                                : '-'}
                                                        </p>
                                                        {selectedProject.latest_water_quality.salinity !== undefined && (
                                                            <span className={`text-[9px] font-bold block ${
                                                                (selectedProject.latest_water_quality.salinity < 10 || selectedProject.latest_water_quality.salinity > 25) ? 'text-amber-500' : 'text-emerald-600'
                                                            }`}>
                                                                {(selectedProject.latest_water_quality.salinity < 10 || selectedProject.latest_water_quality.salinity > 25) ? 'Peringatan' : 'Optimal'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-bg-app border border-border-app/40 rounded-card p-4 flex flex-col items-center justify-center text-center space-y-1.5">
                                                    <Info className="h-4.5 w-4.5 text-muted-app" />
                                                    <p className="text-[11px] font-semibold text-muted-app">Belum ada catatan kualitas air untuk proyek ini.</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="h-px bg-border-app/60 my-4" />

                                        {/* Project Meta Info */}
                                        <div className="space-y-2 text-xs font-semibold">
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-app flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5" /> Penanggung Jawab
                                                </span>
                                                <span className="text-fg-app">{selectedProject.person_in_charge}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-app flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" /> Estimasi Panen
                                                </span>
                                                <span className="text-fg-app">
                                                    {new Date(selectedProject.target_harvest_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Link */}
                                    <div className="pt-4">
                                        <Link
                                            href={`/projects/${selectedProject.id}`}
                                            className="w-full h-10 rounded-input bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            Buka Dashboard Detail <ChevronRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-white border border-border-app rounded-card p-10 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-center space-y-4 h-full flex flex-col items-center justify-center min-h-[350px]">
                                    <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-muted-app">
                                        <MapPin className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <div className="max-w-[200px]">
                                        <h3 className="font-bold text-sm text-fg-app">Pilih Proyek</h3>
                                        <p className="text-xs text-muted-app mt-1">
                                            Silakan klik salah satu marker proyek pada peta untuk mulai memonitor kemajuan secara real-time.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
