import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ParticleBackground from './ParticleBackground';

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    const handleToggle = () => {
      setCollapsed(localStorage.getItem('sidebar-collapsed') === 'true');
    };
    window.addEventListener('sidebar-toggle', handleToggle);
    return () => window.removeEventListener('sidebar-toggle', handleToggle);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FAFAFC] text-slate-900 relative">
      <ParticleBackground />
      <Sidebar />
      <div
        className={`flex-1 flex flex-col relative z-10 transition-all duration-300 ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Navbar />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
