import React, { useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { User, Shield, Globe, Camera, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsProps {
    user: {
        name: string;
        email: string;
        avatar: string | null;
        role: string;
    };
    status: string | null;
}

export default function Index({ user, status }: SettingsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);

    // Profile Form
    const profileForm = useForm({
        name: user.name,
        email: user.email,
        avatar_file: null as File | null,
    });

    // Password Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.setData('avatar_file', file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Since we are uploading a file, we must send it as a POST request (Laravel doesn't support file uploads in PUT/PATCH requests natively without workarounds)
        profileForm.post('/settings/profile', {
            forceFormData: true,
            onSuccess: () => {
                // Done
            }
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.post('/settings/password', {
            onSuccess: () => {
                passwordForm.reset();
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Pengaturan Sistem" />

            {/* Header */}
            <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-fg-app tracking-tight">Pengaturan</h2>
                <p className="text-sm text-muted-app mt-0.5">Kelola identitas akun, preferensi bahasa, dan keamanan sistem Anda.</p>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* A. PROFILE SETTINGS */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Profil Form Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-border-app rounded-card p-6 md:p-8 shadow-xs"
                    >
                        <div className="border-b border-border-app pb-4 mb-6 flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                                <User className="h-4.5 w-4.5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-fg-app uppercase tracking-wider">Profil Pengguna</h3>
                                <p className="text-xs text-muted-app mt-0.5">Identitas utama Anda yang terlihat oleh pengguna lain.</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            {/* Avatar Upload */}
                            <div className="flex flex-col sm:flex-row items-center gap-5 text-left">
                                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                    <div className="h-20 w-20 rounded-full bg-primary-light border-2 border-border-app overflow-hidden flex items-center justify-center text-primary text-2xl font-bold">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200">
                                        <Camera className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-fg-app">Foto Profil</h4>
                                    <p className="text-xs text-muted-app mt-1">
                                        Disarankan file JPG/PNG berukuran maksimal 2MB.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleAvatarClick}
                                        className="mt-2.5 h-8 px-3.5 rounded-lg border border-border-app bg-white hover:bg-bg-app text-fg-app text-xs font-semibold cursor-pointer"
                                    >
                                        Pilih Gambar
                                    </button>
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="name" className="text-xs font-bold text-fg-app">
                                        Nama Lengkap <span className="text-danger-app">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={profileForm.data.name}
                                        onChange={e => profileForm.setData('name', e.target.value)}
                                        className="w-full h-11 px-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                        required
                                    />
                                    {profileForm.errors.name && <p className="text-xs font-semibold text-danger-app mt-1">{profileForm.errors.name}</p>}
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="email" className="text-xs font-bold text-fg-app">
                                        Alamat Email <span className="text-danger-app">*</span>
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={profileForm.data.email}
                                        onChange={e => profileForm.setData('email', e.target.value)}
                                        className="w-full h-11 px-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                        required
                                    />
                                    {profileForm.errors.email && <p className="text-xs font-semibold text-danger-app mt-1">{profileForm.errors.email}</p>}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end pt-4 border-t border-border-app">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="h-10 px-5 rounded-input bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                                >
                                    {profileForm.processing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Simpan Perubahan'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Preferences Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-border-app rounded-card p-6 md:p-8 shadow-xs"
                    >
                        <div className="border-b border-border-app pb-4 mb-6 flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                <Globe className="h-4.5 w-4.5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-fg-app uppercase tracking-wider">Preferensi Sistem</h3>
                                <p className="text-xs text-muted-app mt-0.5">Konfigurasi regional dan bahasa tampilan aplikasi.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-fg-app">Bahasa Aplikasi</label>
                                <select 
                                    className="w-full h-11 px-3 rounded-input border border-border-app bg-white text-fg-app text-sm focus:outline-none"
                                    disabled
                                >
                                    <option value="id">Bahasa Indonesia</option>
                                </select>
                                <span className="text-[10px] text-muted-app font-medium">Bahasa wajib terpilih untuk seluruh UI.</span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-fg-app">Zona Waktu</label>
                                <select 
                                    className="w-full h-11 px-3 rounded-input border border-border-app bg-white text-fg-app text-sm focus:outline-none"
                                    defaultValue="WIB"
                                >
                                    <option value="WIB">WIB (Asia/Jakarta)</option>
                                    <option value="WITA">WITA (Asia/Makassar)</option>
                                    <option value="WIT">WIT (Asia/Jayapura)</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* B. SECURITY SETTINGS (Right Column: 1) */}
                <div className="lg:col-span-1">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-border-app rounded-card p-6 shadow-xs"
                    >
                        <div className="border-b border-border-app pb-4 mb-6 flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                                <Shield className="h-4.5 w-4.5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-fg-app uppercase tracking-wider">Keamanan Akun</h3>
                                <p className="text-xs text-muted-app mt-0.5">Ubah kata sandi secara berkala untuk keamanan data.</p>
                            </div>
                        </div>


                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            {/* Current Password */}
                            <div className="space-y-1.5 text-left">
                                <label htmlFor="current_password" className="text-xs font-bold text-fg-app">
                                    Kata Sandi Saat Ini <span className="text-danger-app">*</span>
                                </label>
                                <input
                                    id="current_password"
                                    type="password"
                                    value={passwordForm.data.current_password}
                                    onChange={e => passwordForm.setData('current_password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-11 px-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                    required
                                />
                                {passwordForm.errors.current_password && <p className="text-xs font-semibold text-danger-app mt-1">{passwordForm.errors.current_password}</p>}
                            </div>

                            {/* New Password */}
                            <div className="space-y-1.5 text-left">
                                <label htmlFor="password" className="text-xs font-bold text-fg-app">
                                    Kata Sandi Baru <span className="text-danger-app">*</span>
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={e => passwordForm.setData('password', e.target.value)}
                                    placeholder="Min. 8 karakter"
                                    className="w-full h-11 px-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                    required
                                />
                                {passwordForm.errors.password && <p className="text-xs font-semibold text-danger-app mt-1">{passwordForm.errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5 text-left">
                                <label htmlFor="password_confirmation" className="text-xs font-bold text-fg-app">
                                    Konfirmasi Kata Sandi Baru <span className="text-danger-app">*</span>
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                    placeholder="Tulis kembali sandi baru"
                                    className="w-full h-11 px-4 rounded-input border border-border-app focus:ring-primary bg-white text-fg-app text-sm focus:outline-none focus:ring-2"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="w-full h-11 rounded-input bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                            >
                                {passwordForm.processing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Perbarui Kata Sandi'
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>

            </div>

        </AppLayout>
    );
}
