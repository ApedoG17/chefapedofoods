'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Utensils, 
  Wallet, 
  Settings, 
  Send,
  LogOut 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  // Do not render the admin navigation sidebar when on the login screen
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-[#0D0D0D] text-white font-sans">{children}</div>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Live Orders', href: '/admin/orders', icon: ClipboardList },
    { name: 'Menu Manager', href: '/admin/menu', icon: Utensils },
    { name: 'Finance', href: '/admin/finance', icon: Wallet },
    { name: 'Marketing', href: '/admin/marketing', icon: Send },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];



  return (
    <div className="flex h-screen bg-[#0D0D0D] text-white font-sans overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#141414] border-r border-white/5 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-black tracking-widest text-white uppercase">
            Chef <span className="text-brand-yellow">Apedo</span>
          </h1>
          <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">Kitchen Display</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-brand-yellow text-[#18110E] font-bold shadow-[0_0_15px_rgba(255,184,0,0.2)]' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-white/60 hover:text-brand-red hover:bg-brand-red/10 transition-all cursor-pointer"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#0D0D0D]">
        {children}
      </main>
    </div>
  );
}
