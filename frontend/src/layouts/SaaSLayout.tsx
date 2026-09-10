import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, BarChart3, Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function SaaSLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mapa básico para el Breadcrumb
  const routeNames: Record<string, string> = {
    '/app/thermodynamics': 'Motor Térmico',
    '/app/reports': 'Reportes de Auditoría',
    '/app/settings': 'Configuración'
  };
  
  const currentPathName = routeNames[location.pathname] || 'Dashboard';

  const menuItems = [
    { path: '/app/thermodynamics', label: 'Motor Térmico', icon: LayoutDashboard },
    { path: '/app/reports', label: 'Reportes', icon: BarChart3 },
    { path: '/app/settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#E2E8F0] font-sans selection:bg-[#FFD700] selection:text-black overflow-hidden">
      
      {/* Sidebar (Desktop Fijo Ancho) */}
      <aside className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:static z-50 h-full w-72 bg-white border-r-4 border-slate-800 flex flex-col transition-transform duration-200 ease-in-out shadow-md shadow-slate-300 lg:shadow-none
      `}>
        {/* Logo Area */}
        <div className="p-6 border-b-4 border-slate-800 flex items-center gap-4 bg-[#FFD700]">
          <div className="bg-white border-2 border-slate-800 p-2 shadow-sm shadow-slate-300">
            <Activity className="w-8 h-8 text-black stroke-[2px]" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-black leading-none">GNV</h1>
            <h2 className="text-sm font-bold uppercase tracking-widest text-black">Manager</h2>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-6 space-y-4 overflow-y-auto">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Módulos del Sistema</p>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-4 p-4 border-2 transition-all
                  ${isActive 
                    ? 'border-slate-800 bg-[#FFD700] shadow-sm shadow-slate-300 -translate-y-1' 
                    : 'border-transparent hover:border-slate-800 hover:bg-slate-100'
                  }
                `}
              >
                <Icon className="w-6 h-6 stroke-[2.5px]" />
                <span className="font-black uppercase tracking-wide">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card Area */}
        <div className="p-6 border-t-4 border-slate-800 bg-slate-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-xl uppercase border-2 border-slate-800">
              {user?.username.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate">{user?.username}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-slate-800 font-black uppercase text-sm hover:bg-black hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4 stroke-[2px]" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Topbar */}
        <header className="h-20 bg-white border-b-4 border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)] z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 border-2 border-slate-800 bg-[#FFD700] hover:bg-black hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6 stroke-[2px]" />
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm font-bold uppercase tracking-widest text-slate-400">GNV Manager</span>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-black uppercase tracking-widest bg-black text-white px-2 py-1">{currentPathName}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-xs font-bold uppercase tracking-widest px-3 py-1 border-2 border-slate-800 bg-green-400 text-black hidden sm:block">
              Sistema Online
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 lg:p-12 relative">
          <div className="max-w-[1600px] mx-auto w-full h-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
