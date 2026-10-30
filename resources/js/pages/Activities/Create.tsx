import React, { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { ArrowLeft, Loader2, Info, Clock, Layers, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import DatePicker from '@/components/DatePicker';
import Select from '@/components/Select';

interface ProjectItem {
    id: number;
    name: string;
}

interface CreateActivityProps {
    projects: ProjectItem[];
    selected_project_id: string | null;
}

export default function Create({ projects, selected_project_id }: CreateActivityProps) {
    const { data, setData, post, processing, errors } = useForm({
        project_id: selected_project_id || '',
        type: 'feeding', // default type
        title: 'Pemberian Pakan', // default prefill
        activity_date: new Date().toISOString().substring(0, 16), // current datetime local
        notes: '',
        
        // Feeding fields
        feed_type: '',
        quantity: '',
        unit: 'kg',

        // Water quality fields
        ph: '',
        temperature: '',
        do: '',
        salinity: '',

        // Sampling fields
        sample_count: '',
        average_weight: '',
        estimated_biomass: '',

        // Mortality fields
        cause: '',
    });

    const datePart = data.activity_date ? data.activity_date.substring(0, 10) : '';
    const timePart = data.activity_date ? data.activity_date.substring(11, 16) : '08:00';

    // Auto-update title and fields when activity type changes
    useEffect(() => {
        let defaultTitle = '';
        if (data.type === 'feeding') defaultTitle = 'Pemberian Pakan';
        else if (data.type === 'water_quality') defaultTitle = 'Pencatatan Kualitas Air';
        else if (data.type === 'sampling') defaultTitle = 'Sampling Bobot Ikan';
        else if (data.type === 'mortality') defaultTitle = 'Pencatatan Kematian';
        else if (data.type === 'other') defaultTitle = '';

        setData(prevData => ({
            ...prevData,
            title: defaultTitle
        }));
    }, [data.type]);

    // Handle dynamic biomass calculation during sampling
    // Biomass = (average_weight / 1000) * total_stock (estimated or typed by user).
    // In our case, we can let user input estimated biomass or make it editable.
    const handleAverageWeightChange = (weight: string) => {
        setData(prevData => {
            const wVal = parseFloat(weight) || 0;
            const cVal = parseInt(prevData.sample_count) || 0;
            // A simple estimation helper (usually biomass is estimated for the whole population, e.g. wVal * total_pop)
            // But we can let them type the estimated biomass or prepopulate it:
            // estimated_biomass = weight * total_live_stock / 1000.
            // Since we don't have total_live_stock in client-side easily without querying, we can let them input it or compute a default.
            return {
                ...prevData,
                average_weight: weight,
                estimated_biomass: prevData.estimated_biomass || ((wVal * 5000) / 1000).toString(), // mock default or let them edit
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/activities');
    };

    const getPhStatus = (ph: string) => {
        const val = parseFloat(ph);
        if (isNaN(val)) return null;
        if (val >= 7.5 && val <= 8.5) {
            return { label: 'Kondisi normal', color: 'text-emerald-600 bg-emerald-50' };
        }
        return { label: 'Kondisi tidak ideal (rentang normal: 7,5 - 8,5)', color: 'text-danger-app bg-red-50' };
    };

    const phStatus = getPhStatus(data.ph);

    return (
        <AppLayout>
            <Head title="Catat Aktivitas Baru" />

            {/* Back Header */}
            <div className="flex items-center gap-3">
                <Link
                    href="/activities"
                    className="h-10 w-10 rounded-input border border-border-app bg-white flex items-center justify-center text-muted-app hover:text-fg-app hover:bg-bg-app transition-all cursor-pointer"
                >
                    <ArrowLeft className="h-4.5 w-4.5" />
                </Link>
                <div>
                    <h2 className="text-xl font-bold text-fg-app tracking-tight">Catat Aktivitas Baru</h2>
                    <p className="text-xs text-muted-app mt-0.5">Catat data operasional harian tambak/kolam budidaya.</p>
                </div>
            </div>

            {/* Form Card */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl bg-white border border-border-app rounded-card p-6 md:p-8 shadow-xs"
            >
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Section 1: Informasi Utama */}
                    <div className="space-y-4">
                        <div className="border-b border-border-app pb-2">
                            <h3 className="text-sm font-bold text-fg-app uppercase tracking-wider">Informasi Aktivitas</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Proyek / Kolam */}
                            <div className="space-y-1.5 text-left">
                                <label htmlFor="project_id" className="text-xs font-bold text-fg-app">
                                    Pilih Proyek / Kolam <span className="text-danger-app">*</span>
                                </label>
                                <Select
                                    value={data.project_id}
                                    onChange={val => setData('project_id', val)}
                                    options={(projects || []).map(p => ({ value: p.id, label: p.name }))}
                                    placeholder="Pilih Proyek..."
                                    error={errors.project_id}
                                    leftIcon={<Layers className="h-4 w-4" />}
                                />
                                {errors.project_id && <p className="text-xs font-semibold text-danger-app mt-1">{errors.project_id}</p>}
                            </div>

                            {/* Jenis Aktivitas */}
                            <div className="space-y-1.5 text-left">
                                <label htmlFor="type" className="text-xs font-bold text-fg-app">
                                    Jenis Aktivitas <span className="text-danger-app">*</span>
                                </label>
                                <Select
                                    value={data.type}
                                    onChange={val => setData('type', val)}
                                    options={[
                                        { value: 'feeding', label: 'Pemberian Pakan' },
                                        { value: 'water_quality', label: 'Kualitas Air' },
                                        { value: 'sampling', label: 'Sampling' },
                                        { value: 'mortality', label: 'Kematian' },
                                        { value: 'other', label: 'Lainnya' }
                                    ]}
                                    placeholder="Pilih Jenis..."
                                    error={errors.type}
                                    leftIcon={<Activity className="h-4 w-4" />}
                                />
                                {errors.type && <p className="text-xs font-semibold text-danger-app mt-1">{errors.type}</p>}
                            </div>

                            {/* Tanggal Catat */}
                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-fg-app">
                                    Tanggal Catat <span className="text-danger-app">*</span>
                                </label>
                                <DatePicker
                                    value={datePart}
                                    onChange={val => setData('activity_date', `${val}T${timePart}`)}
                                    placeholder="Pilih tanggal..."
                                    error={errors.activity_date}
                                />
                            </div>

                            {/* Waktu Catat */}
                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-fg-app">
                                    Waktu Catat <span className="text-danger-app">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-app/70">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="time"
                                        value={timePart}
                                        onChange={e => setData('activity_date', `${datePart}T${e.target.value}`)}
                                        className="w-full h-11 pl-10 pr-4 rounded-input border border-border-app focus:ring-primary/20 focus:border-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Judul Aktivitas */}
                            <div className="space-y-1.5 text-left sm:col-span-2">
                                <label htmlFor="title" className="text-xs font-bold text-fg-app">
                                    Judul Aktivitas <span className="text-danger-app">*</span>
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="Contoh: Pemberian Pakan Pagi"
                                    className={`w-full h-11 px-4 rounded-input border ${errors.title ? 'border-danger-app focus:ring-danger-app/20' : 'border-border-app focus:ring-primary/20'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2 focus:border-primary transition-all`}
                                    required
                                />
                                {errors.title && <p className="text-xs font-semibold text-danger-app mt-1">{errors.title}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Dynamic Form Fields based on Type */}
                    <div className="pt-4 border-t border-border-app space-y-4">
                        <div className="pb-2">
                            <h3 className="text-sm font-bold text-fg-app uppercase tracking-wider">Detail Data Operasional</h3>
                            <p className="text-xs text-muted-app mt-0.5">Lengkapi formulir sesuai data lapangan.</p>
                        </div>

                        {/* A. FEEDING */}
                        {data.type === 'feeding' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="feed_type" className="text-xs font-bold text-fg-app">
                                        Jenis Pakan <span className="text-danger-app">*</span>
                                    </label>
                                    <input
                                        id="feed_type"
                                        type="text"
                                        value={data.feed_type}
                                        onChange={e => setData('feed_type', e.target.value)}
                                        placeholder="Contoh: Starter Pellet A"
                                        className="w-full h-11 px-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                        required
                                    />
                                    {errors.feed_type && <p className="text-xs font-semibold text-danger-app mt-1">{errors.feed_type}</p>}
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="quantity" className="text-xs font-bold text-fg-app">
                                        Jumlah Pakan <span className="text-danger-app">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="quantity"
                                            type="number"
                                            step="0.01"
                                            value={data.quantity}
                                            onChange={e => setData('quantity', e.target.value)}
                                            placeholder="Contoh: 25.00"
                                            className="w-full h-11 pl-4 pr-16 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                            required
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-muted-app select-none pointer-events-none">
                                            kg
                                        </span>
                                    </div>
                                    {errors.quantity && <p className="text-xs font-semibold text-danger-app mt-1">{errors.quantity}</p>}
                                </div>
                            </div>
                        )}

                        {/* B. WATER QUALITY */}
                        {data.type === 'water_quality' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {/* pH */}
                                    <div className="space-y-1.5 text-left">
                                        <label htmlFor="ph" className="text-xs font-bold text-fg-app">
                                            pH Air <span className="text-danger-app">*</span>
                                        </label>
                                        <input
                                            id="ph"
                                            type="number"
                                            step="0.1"
                                            value={data.ph}
                                            onChange={e => setData('ph', e.target.value)}
                                            placeholder="7.8"
                                            className="w-full h-11 px-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                            required
                                        />
                                        {errors.ph && <p className="text-xs font-semibold text-danger-app mt-1">{errors.ph}</p>}
                                    </div>

                                    {/* Temperature */}
                                    <div className="space-y-1.5 text-left">
                                        <label htmlFor="temperature" className="text-xs font-bold text-fg-app">
                                            Suhu Air <span className="text-danger-app">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="temperature"
                                                type="number"
                                                step="0.1"
                                                value={data.temperature}
                                                onChange={e => setData('temperature', e.target.value)}
                                                placeholder="29.4"
                                                className="w-full h-11 pl-4 pr-10 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                                required
                                            />
                                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-muted-app pointer-events-none">
                                                °C
                                            </span>
                                        </div>
                                        {errors.temperature && <p className="text-xs font-semibold text-danger-app mt-1">{errors.temperature}</p>}
                                    </div>

                                    {/* DO */}
                                    <div className="space-y-1.5 text-left">
                                        <label htmlFor="do" className="text-xs font-bold text-fg-app">
                                            DO (Oksigen) <span className="text-danger-app">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="do"
                                                type="number"
                                                step="0.1"
                                                value={data.do}
                                                onChange={e => setData('do', e.target.value)}
                                                placeholder="5.2"
                                                className="w-full h-11 pl-4 pr-16 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                                required
                                            />
                                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-bold text-muted-app pointer-events-none">
                                                mg/L
                                            </span>
                                        </div>
                                        {errors.do && <p className="text-xs font-semibold text-danger-app mt-1">{errors.do}</p>}
                                    </div>

                                    {/* Salinity */}
                                    <div className="space-y-1.5 text-left">
                                        <label htmlFor="salinity" className="text-xs font-bold text-fg-app">
                                            Salinitas <span className="text-danger-app">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="salinity"
                                                type="number"
                                                value={data.salinity}
                                                onChange={e => setData('salinity', e.target.value)}
                                                placeholder="15"
                                                className="w-full h-11 pl-4 pr-12 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                                required
                                            />
                                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[11px] font-bold text-muted-app pointer-events-none">
                                                ppt
                                            </span>
                                        </div>
                                        {errors.salinity && <p className="text-xs font-semibold text-danger-app mt-1">{errors.salinity}</p>}
                                    </div>
                                </div>

                                {/* Dynamic pH/DO status alert */}
                                {phStatus && (
                                    <div className={`p-3 rounded-lg border text-xs font-medium ${phStatus.color}`}>
                                        {phStatus.label}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* C. SAMPLING */}
                        {data.type === 'sampling' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="sample_count" className="text-xs font-bold text-fg-app">
                                        Jumlah Sampel <span className="text-danger-app">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="sample_count"
                                            type="number"
                                            value={data.sample_count}
                                            onChange={e => setData('sample_count', e.target.value)}
                                            placeholder="100"
                                            className="w-full h-11 pl-4 pr-16 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                            required
                                            min="1"
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-[11px] font-bold text-muted-app pointer-events-none">
                                            ekor
                                        </span>
                                    </div>
                                    {errors.sample_count && <p className="text-xs font-semibold text-danger-app mt-1">{errors.sample_count}</p>}
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="average_weight" className="text-xs font-bold text-fg-app">
                                        Bobot Rata-rata <span className="text-danger-app">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="average_weight"
                                            type="number"
                                            step="0.01"
                                            value={data.average_weight}
                                            onChange={e => handleAverageWeightChange(e.target.value)}
                                            placeholder="18.50"
                                            className="w-full h-11 pl-4 pr-16 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                            required
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-muted-app pointer-events-none">
                                            gram
                                        </span>
                                    </div>
                                    {errors.average_weight && <p className="text-xs font-semibold text-danger-app mt-1">{errors.average_weight}</p>}
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="estimated_biomass" className="text-xs font-bold text-fg-app">
                                        Perkiraan Biomassa <span className="text-danger-app">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="estimated_biomass"
                                            type="number"
                                            step="0.1"
                                            value={data.estimated_biomass}
                                            onChange={e => setData('estimated_biomass', e.target.value)}
                                            placeholder="925.0"
                                            className="w-full h-11 pl-4 pr-16 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                            required
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-muted-app pointer-events-none">
                                            kg
                                        </span>
                                    </div>
                                    {errors.estimated_biomass && <p className="text-xs font-semibold text-danger-app mt-1">{errors.estimated_biomass}</p>}
                                </div>
                            </div>
                        )}

                        {/* D. MORTALITY */}
                        {data.type === 'mortality' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="quantity" className="text-xs font-bold text-fg-app">
                                        Jumlah Kematian <span className="text-danger-app">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="quantity"
                                            type="number"
                                            value={data.quantity}
                                            onChange={e => setData('quantity', e.target.value)}
                                            placeholder="150"
                                            className="w-full h-11 pl-4 pr-16 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                            required
                                            min="1"
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-[11px] font-bold text-muted-app pointer-events-none">
                                            ekor
                                        </span>
                                    </div>
                                    {errors.quantity && <p className="text-xs font-semibold text-danger-app mt-1">{errors.quantity}</p>}
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="cause" className="text-xs font-bold text-fg-app">
                                        Penyebab Kematian
                                    </label>
                                    <input
                                        id="cause"
                                        type="text"
                                        value={data.cause}
                                        onChange={e => setData('cause', e.target.value)}
                                        placeholder="Contoh: Fluktuasi pH, Stress tebar"
                                        className="w-full h-11 px-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                    />
                                    {errors.cause && <p className="text-xs font-semibold text-danger-app mt-1">{errors.cause}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 3: Catatan */}
                    <div className="pt-4 border-t border-border-app space-y-3 text-left">
                        <label htmlFor="notes" className="text-xs font-bold text-fg-app">
                            Catatan Operasional / Keterangan
                        </label>
                        <textarea
                            id="notes"
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            placeholder="Tambahkan catatan khusus mengenai kondisi pakan, cuaca kolam, perilaku ikan..."
                            rows={3}
                            className="w-full p-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border-app">
                        <Link
                            href="/activities"
                            className="h-11 px-5 rounded-input border border-border-app bg-white hover:bg-bg-app active:scale-95 text-fg-app text-xs font-semibold transition-all flex items-center justify-center cursor-pointer"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="h-11 px-5 rounded-input bg-primary hover:bg-primary-dark active:scale-95 text-white text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Aktivitas'
                            )}
                        </button>
                    </div>

                </form>
            </motion.div>
        </AppLayout>
    );
}
