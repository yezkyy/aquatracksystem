import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    FolderKanban, 
    ClipboardList, 
    BarChart3, 
    Settings, 
    LogOut, 
    Menu, 
    X, 
    User,
    ChevronDown,
    Bell,
    Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { url, props } = usePage();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    // Flash notifications
    const flash = props.flash as { success?: string; error?: string } || {};
    
    // Auth user info
    const auth = props.auth as { 
        user: { 
            name: string; 
            email: string; 
            avatar?: string;
            role?: string;
        } 
    };
    
    const user = auth?.user || {
        name: 'Pengguna',
        email: 'user@example.com',
        avatar: undefined,
        role: 'Operator'
    };

    const navItems = [
        {
            group: 'Ruang Kerja',
            items: [
                { name: 'Ringkasan', icon: LayoutDashboard, href: '/dashboard' },
                { name: 'Peta Proyek', icon: Map, href: '/map' },
                { name: 'Proyek', icon: FolderKanban, href: '/projects' },
                { name: 'Aktivitas', icon: ClipboardList, href: '/activities' },
            ]
        },
        {
            group: 'Analisis',
            items: [
                { name: 'Laporan', icon: BarChart3, href: '/reports' },
            ]
        },
        {
            group: 'Sistem',
            items: [
                { name: 'Pengaturan', icon: Settings, href: '/settings' },
            ]
        }
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return url === '/dashboard';
        }
        return url.startsWith(href);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const SidebarContent = () => (
        <div className="h-full flex flex-col justify-between p-6 bg-white border-r border-border-app select-none">
            <div className="space-y-8">
                {/* Brand Logo */}
                <Link href="/dashboard" className="flex items-center gap-3 px-2">
                    <img src="/images/logo.jpg" alt="Logo" className="h-9 w-9 rounded-xl border border-border-app shadow-xs" />
                    <div>
                        <h1 className="font-bold text-base text-fg-app tracking-tight leading-none">AquaTrack</h1>
                        <span className="text-[10px] font-semibold text-primary tracking-wide uppercase">Budidaya Perikanan</span>
                    </div>
                </Link>

                {/* Nav Links */}
                <nav className="space-y-6">
                    {navItems.map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-2">
                            <span className="text-[11px] font-bold text-muted-app uppercase tracking-widest px-2">
                                {group.group}
                            </span>
                            <div className="space-y-1">
                                {group.items.map((item, itemIdx) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={itemIdx}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 h-10 rounded-input text-sm font-medium transition-all duration-200 ${
                                                active 
                                                ? 'bg-primary-light text-primary' 
                                                : 'text-muted-app hover:text-fg-app hover:bg-bg-app'
                                            }`}
                                            onClick={() => setIsMobileOpen(false)}
                                        >
                                            <Icon className={`h-4.5 w-4.5 ${active ? 'text-primary' : 'text-muted-app'}`} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Bottom Profile Info */}
            <div className="relative pt-4 border-t border-border-app">
                <div className="flex items-center justify-between gap-3 px-2">
                    <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full bg-primary-light border border-border-app overflow-hidden flex items-center justify-center text-primary font-bold">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-sm text-fg-app truncate max-w-[110px] leading-tight">
                                {user.name}
                            </p>
                            <span className="text-[11px] text-muted-app font-medium capitalize">
                                {user.role || 'Operator'}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="h-8 w-8 rounded-lg hover:bg-bg-app flex items-center justify-center text-muted-app hover:text-fg-app transition-colors cursor-pointer"
                    >
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isProfileDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)} />
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-14 left-0 right-0 z-20 bg-white border border-border-app rounded-input shadow-lg p-1.5 space-y-0.5"
                            >
                                <Link 
                                    href="/settings" 
                                    className="flex items-center gap-3 px-3 h-9 w-full rounded-lg text-sm text-fg-app hover:bg-bg-app transition-colors"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                >
                                    <User className="h-4 w-4 text-muted-app" />
                                    Profil Saya
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-3 h-9 w-full rounded-lg text-sm text-danger-app hover:bg-red-50 transition-colors text-left cursor-pointer"
                                >
                                    <LogOut className="h-4 w-4 text-danger-app" />
                                    Keluar
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-bg-app text-fg-app antialiased selection:bg-primary selection:text-white">
            
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-[260px] h-screen sticky top-0 shrink-0">
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                
                {/* Header */}
                <header className="h-16 border-b border-border-app bg-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-4">
                        {/* Mobile Toggle */}
                        <button 
                            onClick={() => setIsMobileOpen(true)}
                            className="lg:hidden h-10 w-10 rounded-input border border-border-app flex items-center justify-center text-fg-app hover:bg-bg-app transition-colors cursor-pointer"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        
                        {/* Breadcrumbs or title (optional placeholder) */}
                        <span className="hidden md:inline text-xs font-semibold text-muted-app uppercase tracking-widest bg-bg-app px-2.5 py-1.5 rounded-lg">
                            Sistem Aktif
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notification Bell */}
                        <button className="relative h-10 w-10 rounded-input border border-border-app flex items-center justify-center text-muted-app hover:text-fg-app hover:bg-bg-app transition-colors cursor-pointer">
                            <Bell className="h-4.5 w-4.5" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                        </button>
                        
                        <div className="h-px bg-border-app w-4 rotate-90" />
                        
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary-light border border-border-app overflow-hidden flex items-center justify-center text-primary font-bold text-xs">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    user.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <span className="hidden sm:inline text-sm font-semibold text-fg-app">{user.name}</span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
                    {/* Flash Message Banner */}
                    <AnimatePresence>
                        {flash.success && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium rounded-input flex items-center gap-3"
                            >
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                                {flash.success}
                            </motion.div>
                        )}
                        {flash.error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-input flex items-center gap-3"
                            >
                                <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                                {flash.error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {children}
                </main>
            </div>

            {/* Mobile Drawer Sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        {/* Overlay backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black z-40 lg:hidden"
                        />
                        {/* Slide-in sidebar */}
                        <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-white z-50 lg:hidden shadow-2xl"
                        >
                            <div className="absolute top-4 right-4 z-10">
                                <button 
                                    onClick={() => setIsMobileOpen(false)}
                                    className="h-10 w-10 rounded-input hover:bg-bg-app flex items-center justify-center text-muted-app hover:text-fg-app transition-colors cursor-pointer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
