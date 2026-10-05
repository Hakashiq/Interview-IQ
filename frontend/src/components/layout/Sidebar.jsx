import { useState } from 'react';
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
    <div className="flex flex-col h-full bg-white text-slate-800">
      {/* Brand & Collapse Header */}
      <div className="p-4 border-b border-slate-200/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs flex-shrink-0">
            IQ
          </div>
          {!collapsed && (
            <div className="truncate">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">InterviewIQ</h1>
              <p className="text-[11px] text-slate-500 font-medium">AI Career Studio</p>
            </div>
          )}
        </div>
        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none flex-shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <HiOutlineChevronRight className="w-4 h-4" /> : <HiOutlineChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className={`text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '•' : 'Main'}
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg text-xs font-semibold transition-all ${
                collapsed ? 'justify-center p-2.5 w-10 h-10 mx-auto' : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
            title={label}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        <p className={`text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mt-5 mb-2 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '•' : 'Account'}
        </p>
        {accountItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg text-xs font-semibold transition-all ${
                collapsed ? 'justify-center p-2.5 w-10 h-10 mx-auto' : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
            title={label}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {isMentor() && (
          <>
            <p className={`text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mt-5 mb-2 ${collapsed ? 'text-center' : ''}`}>
              {collapsed ? '•' : 'Mentor'}
            </p>
            {mentorItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg text-xs font-semibold transition-all ${
                    collapsed ? 'justify-center p-2.5 w-10 h-10 mx-auto' : 'px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
                title={label}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </>
        )}

        {isAdmin() && (
          <>
            <p className={`text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mt-5 mb-2 ${collapsed ? 'text-center' : ''}`}>
              {collapsed ? '•' : 'Admin'}
            </p>
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg text-xs font-semibold transition-all ${
                    collapsed ? 'justify-center p-2.5 w-10 h-10 mx-auto' : 'px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
                title={label}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-slate-200/80">
        <div className={`p-2 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center gap-2.5 ${collapsed ? 'flex-col justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          {!collapsed ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <HiOutlineLogout className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <HiOutlineLogout className="w-4 h-4" />
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
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs text-slate-700"
      >
        {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/30 z-40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-slate-200/90 z-40 shadow-xs
          transform transition-all duration-300 ease-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
