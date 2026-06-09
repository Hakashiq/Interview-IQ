import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineViewGrid, HiOutlineClipboardList, HiOutlineDocumentText,
  HiOutlineChartBar, HiOutlineCog, HiOutlineLogout, HiOutlineMenu, HiOutlineX,
  HiOutlineAcademicCap, HiOutlineUserGroup, HiOutlineUser, HiOutlineClock,
  HiOutlineChevronLeft, HiOutlineChevronRight
} from 'react-icons/hi';

const navItems = [
  { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { to: '/interviews', icon: HiOutlineClipboardList, label: 'Interviews' },
  { to: '/resume', icon: HiOutlineDocumentText, label: 'Resume Analyzer' },
  { to: '/questions', icon: HiOutlineAcademicCap, label: 'Question Bank' },
  { to: '/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
  { to: '/history', icon: HiOutlineClock, label: 'History' },
];

const accountItems = [
  { to: '/profile', icon: HiOutlineUser, label: 'Profile' },
  { to: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

const adminItems = [
  { to: '/admin', icon: HiOutlineUserGroup, label: 'Admin Panel' },
];

const mentorItems = [
  { to: '/mentor', icon: HiOutlineUserGroup, label: 'Mentor Hub' },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const isMentor = () => {
    return user?.roles?.includes('ROLE_MENTOR');
  };

  const toggleCollapse = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    localStorage.setItem('sidebar-collapsed', String(nextState));
    window.dispatchEvent(new Event('sidebar-toggle'));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full transition-all duration-300">
      {/* Logo & Collapse Trigger */}
      <div className={`p-4 border-b border-white/5 transition-all duration-300 flex items-center justify-between gap-2`}>
        <div className="flex items-center gap-3 min-w-0">
          <img src="/favicon.svg" alt="Logo" className="w-8 h-8 flex-shrink-0" />
          {!collapsed && (
            <div className="animate-fade-in truncate">
              <h1 className="text-sm font-display font-bold text-white leading-tight">InterviewIQ</h1>
              <p className="text-[10px] text-gray-500">AI Mock Interviews</p>
            </div>
          )}
        </div>
        <button 
          onClick={toggleCollapse} 
          className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all border border-white/5 focus:outline-none flex-shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <HiOutlineChevronRight className="w-4 h-4" /> : <HiOutlineChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className={`text-xs text-gray-600 uppercase tracking-wider font-semibold px-4 mb-3 ${collapsed ? 'text-center px-1' : ''}`}>
          {collapsed ? '•' : 'Main Menu'}
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => 
              `${isActive ? 'nav-link-active' : 'nav-link'} flex items-center gap-3 transition-all duration-200 ${
                collapsed ? 'justify-center p-3 w-12 h-12 mx-auto rounded-xl' : 'px-4 py-3'
              }`
            }
            title={label}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}

        <p className={`text-xs text-gray-600 uppercase tracking-wider font-semibold px-4 mt-6 mb-3 ${collapsed ? 'text-center px-1' : ''}`}>
          {collapsed ? '•' : 'Account'}
        </p>
        {accountItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => 
              `${isActive ? 'nav-link-active' : 'nav-link'} flex items-center gap-3 transition-all duration-200 ${
                collapsed ? 'justify-center p-3 w-12 h-12 mx-auto rounded-xl' : 'px-4 py-3'
              }`
            }
            title={label}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}

        {isMentor() && (
          <>
            <p className={`text-xs text-gray-600 uppercase tracking-wider font-semibold px-4 mt-6 mb-3 ${collapsed ? 'text-center px-1' : ''}`}>
              {collapsed ? '•' : 'Mentor'}
            </p>
            {mentorItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => 
                  `${isActive ? 'nav-link-active' : 'nav-link'} flex items-center gap-3 transition-all duration-200 ${
                    collapsed ? 'justify-center p-3 w-12 h-12 mx-auto rounded-xl' : 'px-4 py-3'
                  }`
                }
                title={label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </NavLink>
            ))}
          </>
        )}

        {isAdmin() && (
          <>
            <p className={`text-xs text-gray-600 uppercase tracking-wider font-semibold px-4 mt-6 mb-3 ${collapsed ? 'text-center px-1' : ''}`}>
              {collapsed ? '•' : 'Admin'}
            </p>
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => 
                  `${isActive ? 'nav-link-active' : 'nav-link'} flex items-center gap-3 transition-all duration-200 ${
                    collapsed ? 'justify-center p-3 w-12 h-12 mx-auto rounded-xl' : 'px-4 py-3'
                  }`
                }
                title={label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>



      {/* User Section */}
      <div className="p-4 border-t border-white/5">
        <div className={`glass-card p-4 flex items-center gap-3 transition-all duration-300 ${collapsed ? 'flex-col justify-center p-2' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          {!collapsed ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors" title="Logout">
                <HiOutlineLogout className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors" title="Logout">
              <HiOutlineLogout className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl glass-card text-white"
      >
        {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-surface-800/80 backdrop-blur-xl border-r border-white/5 z-40
        transform transition-all duration-300 ease-out
        ${collapsed ? 'w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
