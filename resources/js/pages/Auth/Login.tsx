import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { ShieldCheck, Mail, Lock, Loader2, Sparkles, Droplet, Activity, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white selection:bg-primary selection:text-white">
            <Head title="Masuk" />

            {/* LEFT SIDE PANEL: Visual Showcase (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-gradient-to-br from-[#0EA5A8] via-[#087F83] to-[#172022] p-12 flex-col justify-between relative overflow-hidden text-white">
                {/* Decorative background light circles */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0EA5A8]/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#087F83]/30 rounded-full blur-[100px]" />

                {/* Top: Brand Logo */}
                <div className="flex items-center gap-3 relative z-10">
                    <img src="/images/logo.jpg" alt="Logo" className="h-9 w-9 rounded-xl border border-white/10 shadow-sm" />
                    <div>
                        <h2 className="font-bold text-base tracking-tight leading-none">AquaTrack</h2>
                        <span className="text-[10px] font-semibold text-primary-light/80 tracking-wide uppercase">Budidaya Perikanan</span>
                    </div>
                </div>

                {/* Middle: Floating Bento Dashboard Mockups */}
                <div className="my-auto py-12 relative z-10 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-[480px] space-y-6">
                        
                        {/* Mock Project Progress Card */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-card p-5 shadow-[0_15px_35px_rgba(0,0,0,0.15)]"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-sm text-white">Budidaya Udang Vaname</h4>
                                    <span className="text-[11px] text-white/70">Tambak A · Siklus 02</span>
                                </div>
                                <span className="text-[10px] font-bold bg-white/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    Hari 86/120
                                </span>
                            </div>
                            <div className="mt-4 space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-bold text-white/90">
                                    <span>Progress Siklus</span>
                                    <span>72%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full" style={{ width: '72%' }} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Two Columns: Water Quality Tag and Total Biomass Tag */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Water Quality tag */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-card p-4 shadow-[0_15px_30px_rgba(0,0,0,0.1)] flex items-center gap-3"
                            >
                                <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-white">
                                    <Droplet className="h-4.5 w-4.5" />
                                </div>
                                <div className="text-left">
                                    <span className="text-[10px] font-medium text-white/70 block">DO Terkini</span>
                                    <span className="text-sm font-bold text-white block">5.2 mg/L</span>
                                </div>
                            </motion.div>

                            {/* Biomass tag */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-card p-4 shadow-[0_15px_30px_rgba(0,0,0,0.1)] flex items-center gap-3"
                            >
                                <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-white">
                                    <TrendingUp className="h-4.5 w-4.5" />
                                </div>
                                <div className="text-left">
                                    <span className="text-[10px] font-medium text-white/70 block">Total Biomassa</span>
                                    <span className="text-sm font-bold text-white block">3,8 Ton</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Bottom: Text description */}
                <div className="relative z-10 max-w-[500px] text-left">
                    <h3 className="text-xl lg:text-2xl font-bold tracking-tight mb-2">
                        Kelola Siklus Budidaya Secara Profesional
                    </h3>
                    <p className="text-xs lg:text-sm text-white/80 leading-relaxed">
                        Pantau pakan, sampling bobot, parameter kualitas air, mortalitas, dan laporan keuntungan dalam satu dashboard terintegrasi. Dirancang khusus untuk pengelolaan operasional budidaya yang efisien.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE PANEL: Login Form */}
            <div className="lg:col-span-6 xl:col-span-5 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-[#F7F8F8] lg:bg-white">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[400px] bg-white lg:bg-transparent rounded-card lg:rounded-none border border-border-app lg:border-0 p-8 sm:p-10 lg:p-0 shadow-sm lg:shadow-none space-y-8"
                >
                    {/* Header */}
                    <div className="text-left">
                        <div className="lg:hidden flex items-center gap-2.5 mb-6">
                            <img src="/images/logo.jpg" alt="Logo" className="h-8 w-8 rounded-lg border border-border-app" />
                            <span className="font-bold text-base text-fg-app">AquaTrack</span>
                        </div>

                        <h2 className="text-2xl font-bold text-fg-app tracking-tight">Selamat datang kembali</h2>
                        <p className="text-sm text-muted-app mt-1">Masuk untuk melanjutkan pengelolaan operasional budidaya Anda.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-1.5 text-left">
                            <label className="text-xs font-bold text-fg-app" htmlFor="email">
                                Alamat Email
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-app">
                                    <Mail className="h-4 w-4" />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className={`w-full h-11 pl-10 pr-4 rounded-input border ${errors.email ? 'border-danger-app focus:ring-danger-app' : 'border-border-app focus:ring-primary'} bg-white text-fg-app text-sm transition-all focus:outline-none focus:ring-2`}
                                    placeholder="nama@perusahaan.com"
                                    required
                                    autoFocus
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs font-semibold text-danger-app mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5 text-left">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-fg-app" htmlFor="password">
                                    Kata Sandi
                                </label>
                                <a href="#" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">
                                    Lupa kata sandi?
                                </a>
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-app">
                                    <Lock className="h-4 w-4" />
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className={`w-full h-11 pl-10 pr-10 rounded-input border ${errors.password ? 'border-danger-app focus:ring-danger-app' : 'border-border-app focus:ring-primary'} bg-white text-fg-app text-sm transition-all focus:outline-none focus:ring-2`}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-app hover:text-fg-app transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs font-semibold text-danger-app mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center text-left">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                                className="h-4.5 w-4.5 rounded border-border-app text-primary focus:ring-primary accent-primary cursor-pointer"
                            />
                            <label htmlFor="remember" className="ml-2 text-xs font-semibold text-muted-app select-none cursor-pointer">
                                Ingat saya di perangkat ini
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full h-11 rounded-input bg-primary hover:bg-primary-dark active:scale-[0.98] disabled:active:scale-100 text-white text-xs font-bold transition-all shadow-[0_4px_12px_rgba(14,165,168,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                'Masuk'
                            )}
                        </button>
                    </form>

                    {/* Bottom disclaimer */}
                    <div className="text-center pt-4 border-t border-border-app/50 text-[11px] text-muted-app font-medium">
                        &copy; {new Date().getFullYear()} AquaTrack. Semua hak cipta dilindungi.
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
