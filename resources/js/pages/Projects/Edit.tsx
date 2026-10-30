import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserItem {
    id: number;
    name: string;
}

interface EditProjectProps {
    project: {
        id: number;
        name: string;
        commodity: string;
        location: string;
        start_date: string;
        target_harvest_date: string;
        initial_stock: number;
        person_in_charge_id: number;
        status: 'planning' | 'active' | 'completed' | 'archived';
        latitude: number | null;
        longitude: number | null;
        province: string | null;
        notes: string | null;
    };
    users: UserItem[];
}

export default function Edit({ project, users }: EditProjectProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: project.name,
        commodity: project.commodity,
        location: project.location,
        start_date: project.start_date,
        target_harvest_date: project.target_harvest_date,
        initial_stock: project.initial_stock,
        person_in_charge_id: project.person_in_charge_id.toString(),
        status: project.status,
        latitude: project.latitude !== null ? project.latitude.toString() : '',
        longitude: project.longitude !== null ? project.longitude.toString() : '',
        province: project.province || '',
        notes: project.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/projects/${project.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Ubah Proyek - ${project.name}`} />

            {/* Back Header */}
            <div className="flex items-center gap-3">
                <Link
                    href={`/projects/${project.id}`}
                    className="h-10 w-10 rounded-input border border-border-app bg-white flex items-center justify-center text-muted-app hover:text-fg-app hover:bg-bg-app transition-all cursor-pointer"
                >
                    <ArrowLeft className="h-4.5 w-4.5" />
                </Link>
                <div>
                    <h2 className="text-xl font-bold text-fg-app tracking-tight">Ubah Proyek</h2>
                    <p className="text-xs text-muted-app mt-0.5">Perbarui detail siklus budidaya.</p>
                </div>
            </div>

            {/* Main Form Card */}
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl bg-white border border-border-app rounded-card p-6 md:p-8 shadow-xs"
            >
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Section 1: Informasi Proyek */}
                    <div className="space-y-4">
                        <div className="border-b border-border-app pb-2">
                            <h3 className="text-sm font-bold text-fg-app uppercase tracking-wider">Informasi Proyek</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nama Proyek */}
                            <div className="space-y-1.5 text-left">
                                <label htmlFor="name" className="text-xs font-bold text-fg-app">
                                    Nama Proyek <span className="text-danger-app">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={`w-full h-11 px-4 rounded-input border ${errors.name ? 'border-danger-app focus:ring-danger-app' : 'border-border-app focus:ring-primary'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2`}
                                    required
                                />
                                {errors.name && <p className="text-xs font-semibold text-danger-app mt-1">{errors.name}</p>}
                            </div>

                            {/* Komoditas */}
                            <div className="space-y-1.5 text-left">
                                <label htmlFor="commodity" className="text-xs font-bold text-fg-app">
                                    Komoditas <span className="text-danger-app">*</span>
                                </label>
                                <input
                                    id="commodity"
                                    type="text"
                                    value={data.commodity}
                                    onChange={e => setData('commodity', e.target.value)}
                                    className={`w-full h-11 px-4 rounded-input border ${errors.commodity ? 'border-danger-app focus:ring-danger-app' : 'border-border-app focus:ring-primary'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2`}
                                    required
                                />
                                {errors.commodity && <p className="text-xs font-semibold text-danger-app mt-1">{errors.commodity}</p>}
                            </div>

                            {/* Lokasi */}
                            <div className="space-y-1.5 text-left">
                                <label htmlFor="location" className="text-xs font-bold text-fg-app">
                                    Lokasi / Nomor Kolam <span className="text-danger-app">*</span>
                                </label>
                                <input
                                    id="location"
                                    type="text"
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                    className={`w-full h-11 px-4 rounded-input border ${errors.location ? 'border-danger-app focus:ring-danger-app' : 'border-border-app focus:ring-primary'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2`}
                                    required
                                />
                                {errors.location && <p className="text-xs font-semibold text-danger-app mt-1">{errors.location}</p>}
                            </div>

                            {/* Penanggung Jawab */}
                            <div className="space-y-1.5 text-left">
                                <label htmlFor="person_in_charge_id" className="text-xs font-bold text-fg-app">
                                    Penanggung Jawab <span className="text-danger-app">*</span>
                                </label>
                                <select
                                    id="person_in_charge_id"
                                    value={data.person_in_charge_id}
                                    onChange={e => setData('person_in_charge_id', e.target.value)}
                                    className={`w-full h-11 px-3 rounded-input border ${errors.person_in_charge_id ? 'border-danger-app focus:ring-danger-app' : 'border-border-app focus:ring-primary'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2`}
                                    required
                                >
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                                {errors.person_in_charge_id && <p className="text-xs font-semibold text-danger-app mt-1">{errors.person_in_charge_id}</p>}
                            </div>
                            {/* Provinsi */}
                            <div className="space-y-1.5 text-left">
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
                                {errors.province && <p className="text-xs font-semibold text-danger-app mt-1">{errors.province}</p>}
                            </div>

                            {/* Latitude */}
                            <div className="space-y-1.5 text-left">
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
                                    className={`w-full h-11 px-4 rounded-input border ${errors.latitude ? 'border-danger-app focus:ring-danger-app' : 'border-border-app focus:ring-primary'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2`}
                                />
                                {errors.latitude && <p className="text-xs font-semibold text-danger-app mt-1">{errors.latitude}</p>}
                            </div>

                            {/* Longitude */}
                            <div className="space-y-1.5 text-left">
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
                                    className={`w-full h-11 px-4 rounded-input border ${errors.longitude ? 'border-danger-app focus:ring-danger-app' : 'border-border-app focus:ring-primary'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2`}
                                />
                                {errors.longitude && <p className="text-xs font-semibold text-danger-app mt-1">{errors.longitude}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Data Operasional */}
                    <div className="space-y-4">
                        <div className="border-b border-border-app pb-2">
                            <h3 className="text-sm font-bold text-fg-app uppercase tracking-wider">Data Operasional</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Tanggal Mulai */}
                            <div className="space-y-1.5 text-left">
                                <label htmlFor="start_date" className="text-xs font-bold text-fg-app">
                                    Tanggal Mulai <span className="text-danger-app">*</span>
                                </label>
                                <input
                                    id="start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={e => setData('start_date', e.target.value)}
                                    className={`w-full h-11 px-4 rounded-input border ${errors.start_date ? 'border-danger-app focus:ring-danger-app' : 'border-border-app focus:ring-primary'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2`}
                                    required
                                />
                                {errors.start_date && <p className="text-xs font-semibold text-danger-app mt-1">{errors.start_date}</p>}
                            </div>

                            {/* Target Panen */}
                            <div className="space-y-1.5 text-left">
                                <label htmlFor="target_harvest_date" className="text-xs font-bold text-fg-app">
                                    Target Panen <span className="text-danger-app">*</span>
                                </label>
                                <input
                                    id="target_harvest_date"
                                    type="date"
                                    value={data.target_harvest_date}
                                    onChange={e => setData('target_harvest_date', e.target.value)}
                                    className={`w-full h-11 px-4 rounded-input border ${errors.target_harvest_date ? 'border-danger-app focus:ring-danger-app' : 'border-border-app focus:ring-primary'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2`}
                                    required
                                />
                                {errors.target_harvest_date && <p className="text-xs font-semibold text-danger-app mt-1">{errors.target_harvest_date}</p>}
                            </div>

                            {/* Jumlah Tebar Awal */}
                            <div className="space-y-1.5 text-left">
                                <label htmlFor="initial_stock" className="text-xs font-bold text-fg-app">
                                    Jumlah Tebar Awal <span className="text-danger-app">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="initial_stock"
                                        type="number"
                                        value={data.initial_stock || ''}
                                        onChange={e => setData('initial_stock', parseInt(e.target.value) || 0)}
                                        className={`w-full h-11 pl-4 pr-16 rounded-input border ${errors.initial_stock ? 'border-danger-app focus:ring-danger-app' : 'border-border-app focus:ring-primary'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2`}
                                        required
                                        min="0"
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-muted-app select-none pointer-events-none">
                                        ekor
                                    </span>
                                </div>
                                {errors.initial_stock && <p className="text-xs font-semibold text-danger-app mt-1">{errors.initial_stock}</p>}
                            </div>

                            {/* Status Proyek */}
                            <div className="space-y-1.5 text-left">
                                <label htmlFor="status" className="text-xs font-bold text-fg-app">
                                    Status Proyek <span className="text-danger-app">*</span>
                                </label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value as any)}
                                    className={`w-full h-11 px-3 rounded-input border ${errors.status ? 'border-danger-app focus:ring-danger-app' : 'border-border-app focus:ring-primary'} bg-white text-fg-app text-sm focus:outline-none focus:ring-2`}
                                    required
                                >
                                    <option value="planning">Perencanaan</option>
                                    <option value="active">Aktif</option>
                                    <option value="completed">Selesai</option>
                                    <option value="archived">Diarsipkan</option>
                                </select>
                                {errors.status && <p className="text-xs font-semibold text-danger-app mt-1">{errors.status}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Catatan */}
                    <div className="space-y-4">
                        <div className="border-b border-border-app pb-2">
                            <h3 className="text-sm font-bold text-fg-app uppercase tracking-wider">Catatan Tambahan</h3>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label htmlFor="notes" className="text-xs font-bold text-fg-app">
                                Catatan Proyek
                            </label>
                            <textarea
                                id="notes"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                rows={3}
                                className="w-full p-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2 resize-none"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border-app">
                        <Link
                            href={`/projects/${project.id}`}
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
                                'Simpan Perubahan'
                            )}
                        </button>
                    </div>

                </form>
            </motion.div>
        </AppLayout>
    );
}
