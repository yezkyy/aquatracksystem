import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { 
    ArrowLeft, 
    Loader2, 
    Info, 
    Calendar,
    MapPin, 
    User, 
    Fish, 
    Clipboard, 
    Hash, 
    Sparkles, 
    Calculator,
    AlertCircle,
    Bookmark
} from 'lucide-react';
import { motion } from 'framer-motion';
import DatePicker from '@/components/DatePicker';
import Select from '@/components/Select';

interface UserItem {
    id: number;
    name: string;
}

interface CreateProjectProps {
    users: UserItem[];
}

export default function Create({ users }: CreateProjectProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        commodity: '',
        location: '',
        start_date: '',
        target_harvest_date: '',
        initial_stock: 0,
        person_in_charge_id: '',
        status: 'active', // default status
        latitude: '',
        longitude: '',
        province: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/projects');
    };

    // Calculate cycle duration dynamically
    const getCycleDuration = () => {
        if (!data.start_date || !data.target_harvest_date) return null;
        const start = new Date(data.start_date);
        const end = new Date(data.target_harvest_date);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : null;
    };
    const duration = getCycleDuration();

    // Get commodity-based contextual tips
    const getCommodityTip = (comm: string) => {
        const c = comm.toLowerCase();
        if (c.includes('udang')) {
            return {
                title: 'Panduan Udang Vaname',
                tips: [
                    'Pastikan kincir air berfungsi 24 jam untuk menjaga kadar DO tetap tinggi.',
                    'Jaga salinitas air optimal antara 15-25 ppt.',
                    'Disarankan melakukan sampling berkala setiap minggu setelah DoC 30.'
                ],
                bg: 'bg-sky-50/50 text-sky-950 border-sky-100/50',
                iconColor: 'text-sky-500',
                badgeBg: 'bg-sky-100 text-sky-800'
            };
        } else if (c.includes('nila') || c.includes('lele') || c.includes('patin') || c.includes('gurame') || c.includes('ikan')) {
            return {
                title: 'Panduan Ikan Air Tawar',
                tips: [
                    'Jaga debit pintu air masuk untuk sirkulasi oksigen alami.',
                    'Pemberian pakan pellet apung disesuaikan dengan respon ikan (ad libitum).',
                    'Periksa pH air berkala, jaga di kisaran netral (7.0 - 8.0).'
                ],
                bg: 'bg-teal-50/50 text-teal-950 border-teal-100/50',
                iconColor: 'text-teal-500',
                badgeBg: 'bg-teal-100 text-teal-800'
            };
        }
        return {
            title: 'Tips Budidaya',
            tips: [
                'Isi kolom komoditas untuk menampilkan panduan spesifik.',
                'Gunakan jumlah tebar awal yang akurat untuk tracking FCR (Feed Conversion Ratio) yang tepat.'
            ],
            bg: 'bg-bg-app/40 text-fg-app border-border-app/70',
            iconColor: 'text-primary',
            badgeBg: 'bg-border-app text-muted-app'
        };
    };
    const tip = getCommodityTip(data.commodity);

    // Get selected PIC name
    const picUser = users?.find(u => u.id === Number(data.person_in_charge_id));
    const picName = picUser ? picUser.name : 'Belum dipilih';

    return (
        <AppLayout>
            <Head title="Buat Proyek Baru" />

            {/* Back Header */}
            <div className="flex items-center gap-3">
                <Link
                    href="/projects"
                    className="h-10 w-10 rounded-input border border-border-app bg-white flex items-center justify-center text-muted-app hover:text-fg-app hover:bg-bg-app active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                    <ArrowLeft className="h-4.5 w-4.5" />
                </Link>
                <div className="text-left">
                    <h2 className="text-xl font-bold text-fg-app tracking-tight">Buat Proyek Baru</h2>
                    <p className="text-xs text-muted-app mt-0.5">Mulai mencatat siklus budidaya perikanan baru.</p>
                </div>
            </div>

            {/* Split Page Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-6">
                
                {/* Form Card (2/3 width) */}
                <motion.div 
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 bg-white border border-border-app/70 rounded-card p-6 md:p-8 shadow-xs text-left"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Section 1: Informasi Proyek */}
                        <div className="space-y-5">
                            <div className="border-b border-border-app/60 pb-2 flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-primary-light flex items-center justify-center text-primary">
                                    <Clipboard className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-fg-app uppercase tracking-wider leading-none">Informasi Proyek</h3>
                                    <p className="text-[10px] text-muted-app mt-1">Detail administratif mengenai lokasi dan pengelola proyek.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nama Proyek */}
                                <div className="space-y-1.5">
                                    <label htmlFor="name" className="text-xs font-bold text-fg-app">
                                        Nama Proyek <span className="text-danger-app">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-app/70">
                                            <Bookmark className="h-4 w-4" />
                                        </div>
                                        <input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="Contoh: Budidaya Udang Vaname - Tambak A"
                                            className={`w-full h-11 pl-10 pr-4 rounded-input border ${errors.name ? 'border-danger-app focus:ring-danger-app/20' : 'border-border-app focus:ring-primary/20'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2 focus:border-primary transition-all`}
                                            required
                                        />
                                    </div>
                                    {errors.name && (
                                        <div className="flex items-center gap-1 text-danger-app mt-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <p className="text-[10px] font-semibold">{errors.name}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Komoditas */}
                                <div className="space-y-1.5">
                                    <label htmlFor="commodity" className="text-xs font-bold text-fg-app">
                                        Komoditas <span className="text-danger-app">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-app/70">
                                            <Fish className="h-4 w-4" />
                                        </div>
                                        <input
                                            id="commodity"
                                            type="text"
                                            value={data.commodity}
                                            onChange={e => setData('commodity', e.target.value)}
                                            placeholder="Contoh: Udang Vaname, Ikan Nila"
                                            className={`w-full h-11 pl-10 pr-4 rounded-input border ${errors.commodity ? 'border-danger-app focus:ring-danger-app/20' : 'border-border-app focus:ring-primary/20'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2 focus:border-primary transition-all`}
                                            required
                                        />
                                    </div>
                                    {errors.commodity && (
                                        <div className="flex items-center gap-1 text-danger-app mt-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <p className="text-[10px] font-semibold">{errors.commodity}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Lokasi */}
                                <div className="space-y-1.5">
                                    <label htmlFor="location" className="text-xs font-bold text-fg-app">
                                        Lokasi / Nomor Kolam <span className="text-danger-app">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-app/70">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <input
                                            id="location"
                                            type="text"
                                            value={data.location}
                                            onChange={e => setData('location', e.target.value)}
                                            placeholder="Contoh: Tambak Barat Blok B"
                                            className={`w-full h-11 pl-10 pr-4 rounded-input border ${errors.location ? 'border-danger-app focus:ring-danger-app/20' : 'border-border-app focus:ring-primary/20'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2 focus:border-primary transition-all`}
                                            required
                                        />
                                    </div>
                                    {errors.location && (
                                        <div className="flex items-center gap-1 text-danger-app mt-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <p className="text-[10px] font-semibold">{errors.location}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Penanggung Jawab */}
                                <div className="space-y-1.5">
                                    <label htmlFor="person_in_charge_id" className="text-xs font-bold text-fg-app">
                                        Penanggung Jawab <span className="text-danger-app">*</span>
                                    </label>
                                    <Select
                                        value={data.person_in_charge_id}
                                        onChange={val => setData('person_in_charge_id', val)}
                                        options={(users || []).map(u => ({ value: u.id, label: u.name }))}
                                        placeholder="Pilih Penanggung Jawab..."
                                        error={errors.person_in_charge_id}
                                        leftIcon={<User className="h-4 w-4" />}
                                    />
                                    {errors.person_in_charge_id && (
                                        <div className="flex items-center gap-1 text-danger-app mt-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <p className="text-[10px] font-semibold">{errors.person_in_charge_id}</p>
                                        </div>
                                    )}
                                </div>
                                {/* Provinsi */}
                                <div className="space-y-1.5">
                                    <label htmlFor="province" className="text-xs font-bold text-fg-app">
                                        Provinsi (Untuk Peta)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-app/70">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <input
                                            id="province"
                                            type="text"
                                            value={data.province}
                                            onChange={e => setData('province', e.target.value)}
                                            placeholder="Contoh: Jawa Timur, Jawa Barat"
                                            className={`w-full h-11 pl-10 pr-4 rounded-input border ${errors.province ? 'border-danger-app focus:ring-danger-app/20' : 'border-border-app focus:ring-primary/20'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2 focus:border-primary transition-all`}
                                        />
                                    </div>
                                    {errors.province && (
                                        <div className="flex items-center gap-1 text-danger-app mt-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <p className="text-[10px] font-semibold">{errors.province}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Latitude */}
                                <div className="space-y-1.5">
                                    <label htmlFor="latitude" className="text-xs font-bold text-fg-app">
                                        Latitude (Koordinat, Contoh: -8.2192)
                                    </label>
                                    <input
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        value={data.latitude}
                                        onChange={e => setData('latitude', e.target.value)}
                                        placeholder="-8.2192"
                                        className={`w-full h-11 px-4 rounded-input border ${errors.latitude ? 'border-danger-app focus:ring-danger-app/20' : 'border-border-app focus:ring-primary/20'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2 focus:border-primary transition-all`}
                                    />
                                    {errors.latitude && (
                                        <div className="flex items-center gap-1 text-danger-app mt-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <p className="text-[10px] font-semibold">{errors.latitude}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Longitude */}
                                <div className="space-y-1.5">
                                    <label htmlFor="longitude" className="text-xs font-bold text-fg-app">
                                        Longitude (Koordinat, Contoh: 114.3692)
                                    </label>
                                    <input
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        value={data.longitude}
                                        onChange={e => setData('longitude', e.target.value)}
                                        placeholder="114.3692"
                                        className={`w-full h-11 px-4 rounded-input border ${errors.longitude ? 'border-danger-app focus:ring-danger-app/20' : 'border-border-app focus:ring-primary/20'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2 focus:border-primary transition-all`}
                                    />
                                    {errors.longitude && (
                                        <div className="flex items-center gap-1 text-danger-app mt-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <p className="text-[10px] font-semibold">{errors.longitude}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Data Operasional */}
                        <div className="space-y-5">
                            <div className="border-b border-border-app/60 pb-2 flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-primary-light flex items-center justify-center text-primary">
                                    <Calculator className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-fg-app uppercase tracking-wider leading-none">Data Operasional</h3>
                                    <p className="text-[10px] text-muted-app mt-1">Parameter tanggal siklus budidaya dan bibit awal.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Tanggal Mulai */}
                                <div className="space-y-1.5">
                                    <label htmlFor="start_date" className="text-xs font-bold text-fg-app">
                                        Tanggal Mulai <span className="text-danger-app">*</span>
                                    </label>
                                    <DatePicker
                                        value={data.start_date}
                                        onChange={val => setData('start_date', val)}
                                        placeholder="Pilih tanggal mulai..."
                                        error={errors.start_date}
                                    />
                                    {errors.start_date && (
                                        <div className="flex items-center gap-1 text-danger-app mt-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <p className="text-[10px] font-semibold">{errors.start_date}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Target Panen */}
                                <div className="space-y-1.5">
                                    <label htmlFor="target_harvest_date" className="text-xs font-bold text-fg-app">
                                        Target Tanggal Panen <span className="text-danger-app">*</span>
                                    </label>
                                    <DatePicker
                                        value={data.target_harvest_date}
                                        onChange={val => setData('target_harvest_date', val)}
                                        placeholder="Pilih target panen..."
                                        error={errors.target_harvest_date}
                                    />
                                    {errors.target_harvest_date && (
                                        <div className="flex items-center gap-1 text-danger-app mt-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <p className="text-[10px] font-semibold">{errors.target_harvest_date}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Jumlah Tebar Awal */}
                                <div className="space-y-1.5">
                                    <label htmlFor="initial_stock" className="text-xs font-bold text-fg-app">
                                        Jumlah Tebar Awal (Bibit) <span className="text-danger-app">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-app/70">
                                            <Hash className="h-4 w-4" />
                                        </div>
                                        <input
                                            id="initial_stock"
                                            type="number"
                                            value={data.initial_stock || ''}
                                            onChange={e => setData('initial_stock', parseInt(e.target.value) || 0)}
                                            placeholder="Contoh: 10000"
                                            className={`w-full h-11 pl-10 pr-16 rounded-input border ${errors.initial_stock ? 'border-danger-app focus:ring-danger-app/20' : 'border-border-app focus:ring-primary/20'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2 focus:border-primary transition-all`}
                                            required
                                            min="0"
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-[10px] font-extrabold text-muted-app select-none pointer-events-none uppercase tracking-wider">
                                            ekor
                                        </span>
                                    </div>
                                    {errors.initial_stock && (
                                        <div className="flex items-center gap-1 text-danger-app mt-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <p className="text-[10px] font-semibold">{errors.initial_stock}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Catatan */}
                        <div className="space-y-5">
                            <div className="border-b border-border-app/60 pb-2 flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-primary-light flex items-center justify-center text-primary">
                                    <Sparkles className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-fg-app uppercase tracking-wider leading-none">Catatan Tambahan</h3>
                                    <p className="text-[10px] text-muted-app mt-1">Informasi penunjang khusus untuk operator di lapangan.</p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="notes" className="text-xs font-bold text-fg-app">
                                    Catatan Proyek
                                </label>
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    placeholder="Tulis instruksi khusus tebar, pakan awal, atau parameter lingkungan di sini..."
                                    rows={3}
                                    className="w-full p-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2 focus:border-primary transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-border-app/60">
                            <Link
                                href="/projects"
                                className="h-10 px-5 rounded-input border border-border-app bg-white hover:bg-bg-app active:scale-95 text-fg-app text-[11px] font-bold transition-all flex items-center justify-center cursor-pointer"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="h-10 px-5 rounded-input bg-primary hover:bg-primary-dark active:scale-95 text-white text-[11px] font-bold transition-all shadow-[0_3px_10px_rgba(14,165,168,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Proyek'
                                )}
                            </button>
                        </div>

                    </form>
                </motion.div>

                {/* Side Assist Panel (1/3 width) */}
                <motion.div 
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                >
                    {/* Live Preview Card */}
                    <div className="bg-white border border-border-app/70 rounded-card p-5 shadow-xs text-left">
                        <div className="flex items-center justify-between border-b border-border-app/60 pb-3 mb-4">
                            <span className="text-[10px] font-black text-muted-app uppercase tracking-wider">Preview Kartu</span>
                            <span className="text-[9px] font-extrabold text-primary bg-primary-light border border-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Proyek Baru
                            </span>
                        </div>

                        <div className="p-4 rounded-xl border border-primary/20 bg-primary-light/5 hover:bg-primary-light/10 transition-all">
                            <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1 min-w-0">
                                    <h4 className="font-extrabold text-sm text-fg-app leading-tight break-words">
                                        {data.name || 'Nama Proyek Baru'}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-app font-semibold uppercase tracking-wider">
                                        <span>{data.location || 'Lokasi'}</span>
                                        {data.commodity && (
                                            <>
                                                <span>·</span>
                                                <span className="text-primary font-bold">{data.commodity}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[9px] font-bold text-primary bg-primary-light border border-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                                    H-0/{duration || '—'}
                                </span>
                            </div>

                            <div className="mt-4 border-t border-border-app/40 pt-3 flex items-center justify-between text-[10px] font-bold">
                                <span className="text-muted-app">Tebar Awal:</span>
                                <span className="text-fg-app">{data.initial_stock ? `${data.initial_stock.toLocaleString('id-ID')} ekor` : '—'}</span>
                            </div>

                            <div className="mt-1 flex items-center justify-between text-[10px] font-bold">
                                <span className="text-muted-app">Penanggung Jawab:</span>
                                <span className="text-fg-app truncate max-w-[120px]">{picName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cycle Stats Estimator Card */}
                    <div className="bg-white border border-border-app/70 rounded-card p-5 shadow-xs text-left">
                        <div className="border-b border-border-app/60 pb-3 mb-4 flex items-center gap-1.5">
                            <Calculator className="h-4 w-4 text-primary" />
                            <h4 className="text-xs font-bold text-fg-app tracking-tight">Kalkulator Siklus</h4>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-2.5 bg-bg-app/50 rounded-lg border border-border-app/40">
                                <div className="text-left">
                                    <span className="text-[9px] text-muted-app font-bold uppercase tracking-wider">Target Hari Budidaya</span>
                                    <p className="text-sm font-black text-fg-app mt-0.5">
                                        {duration ? `${duration} Hari (DoC)` : '—'}
                                    </p>
                                </div>
                                <Calendar className="h-5 w-5 text-muted-app/60" />
                            </div>

                            {/* Help Box */}
                            <div className="p-3 bg-bg-app border border-border-app/50 rounded-xl flex items-start gap-2">
                                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <p className="text-[10px] font-medium text-muted-app leading-normal text-left">
                                    Target panen dan tebar awal akan digunakan sebagai parameter utama algoritma FCR & SR pada grafik Dashboard utama.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Smart Guidance Card */}
                    <div className={`border rounded-card p-5 shadow-xs text-left transition-all ${tip.bg}`}>
                        <div className="border-b border-border-app/40 pb-3 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Sparkles className={`h-4 w-4 ${tip.iconColor}`} />
                                <h4 className="text-xs font-bold tracking-tight">{tip.title}</h4>
                            </div>
                            <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${tip.badgeBg}`}>
                                Panduan Cepat
                            </span>
                        </div>

                        <ul className="space-y-2.5">
                            {tip.tips.map((item, idx) => (
                                <li key={idx} className="flex gap-2 items-start text-[10px] font-medium leading-relaxed">
                                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1.5 ${tip.iconColor} bg-current`} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
                
            </div>
        </AppLayout>
    );
}

