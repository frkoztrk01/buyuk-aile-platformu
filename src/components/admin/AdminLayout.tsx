'use client';

import { useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Newspaper, 
  Users, 
  Building2, 
  Calendar,
  CalendarDays,
  MessageSquare,
  Video,
  FileText,
  LogOut,
  Home,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { ToastContainer } from '../ui/Toast';
import { useToast } from './useToast';

interface AdminLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Ana Sayfa Hero', href: '/admin/anasayfa-hero', icon: Home },
  { label: 'Haberler', href: '/admin/haberler', icon: Newspaper },
  { label: 'Etkinlikler', href: '/admin/etkinlikler', icon: CalendarDays },
  { label: 'Üyeler', href: '/admin/uyeler', icon: Users },
  { label: 'Kurucu Kuruluşlar', href: '/admin/kurucu-kuruluslar', icon: Building2 },
  { label: 'Buluşmalar', href: '/admin/bulusmalar', icon: Calendar },
  { label: 'Videolar', href: '/admin/videolar', icon: Video },
  { label: 'Hakkımızda', href: '/admin/hakkimizda', icon: FileText },
  { label: 'Manifesto', href: '/admin/manifesto', icon: FileText },
  { label: 'Mutabakat Zaptı', href: '/admin/mutabakat', icon: FileText },
  { label: 'İletişim Mesajları', href: '/admin/iletisim', icon: MessageSquare },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { toasts, removeToast, showSuccess } = useToast();

  useEffect(() => {
    setIsMounted(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await authClient.getSession();
      if (session?.data?.session) {
        setIsAuthenticated(true);
      } else {
        router.push('/admin/giris');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/admin/giris');
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      showSuccess('Başarıyla çıkış yapıldı');
      setTimeout(() => {
        router.push('/admin/giris');
        router.refresh();
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/admin/giris');
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  if (isChecking || !isAuthenticated) {
    return (
      <div className="flex h-screen bg-[#F9F9F9] items-center justify-center">
        <div className="text-center">
          <p className="text-[#1E3A5F] font-montserrat font-bold uppercase tracking-widest">
            Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F9F9F9] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-[250px]' : 'w-0'
        } bg-[#1E3A5F] transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Logo/Header Area */}
        <div className="h-20 border-b border-white/10 flex items-center justify-center px-6">
          <h1 className="text-white text-xs font-bold uppercase tracking-widest font-montserrat">
            KONTROL MERKEZİ
          </h1>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-0">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`flex items-center gap-4 px-6 py-4 text-white font-bold uppercase tracking-widest text-xs font-montserrat border-b border-white/10 transition-none ${
                      active
                        ? 'bg-[#1E3A5F] border-l-4 border-l-white'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-white/10 p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 text-white font-bold uppercase tracking-widest text-xs font-montserrat border border-white/20 hover:bg-white/10 transition-none"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>ÇIKIŞ</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-8">
          {children}
        </div>
      </main>

      {/* Toast Notifications */}
      {isMounted && <ToastContainer toasts={toasts} onRemove={removeToast} />}
    </div>
  );
}
