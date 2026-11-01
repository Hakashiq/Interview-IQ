import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { playHoverTick, playMechanicalToggle, toggleAudio, isAudioEnabled } from '../../utils/soundEffects';
import {
  HiOutlineViewGrid, HiOutlineClipboardList, HiOutlineDocumentText,
  HiOutlineChartBar, HiOutlineCog, HiOutlineLogout, HiOutlineMenu, HiOutlineX,
  HiOutlineAcademicCap, HiOutlineUserGroup, HiOutlineUser, HiOutlineClock,
  HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineVolumeUp, HiOutlineVolumeOff
} from 'react-icons/hi';

const navItems = [
  { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard', code: 'MOD.01' },
  { to: '/interviews', icon: HiOutlineClipboardList, label: 'Interviews', code: 'MOD.02' },
  { to: '/resume', icon: HiOutlineDocumentText, label: 'Resume Analyzer', code: 'MOD.03' },
  { to: '/questions', icon: HiOutlineAcademicCap, label: 'Question Bank', code: 'MOD.04' },
  { to: '/analytics', icon: HiOutlineChartBar, label: 'Telemetry', code: 'MOD.05' },
  { to: '/history', icon: HiOutlineClock, label: 'Log History', code: 'MOD.06' },
];

const accountItems = [
  { to: '/profile', icon: HiOutlineUser, label: 'Profile', code: 'USR.01' },
  { to: '/settings', icon: HiOutlineCog, label: 'Settings', code: 'SYS.01' },
];

const adminItems = [
  { to: '/admin', icon: HiOutlineUserGroup, label: 'Admin Panel', code: 'ADM.01' },
];

const mentorItems = [
  { to: '/mentor', icon: HiOutlineUserGroup, label: 'Mentor Hub', code: 'MNT.01' },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const [soundActive, setSoundActive] = useState(isAudioEnabled());
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
    playMechanicalToggle(nextState);
  };

  const handleAudioToggle = () => {
    const next = toggleAudio();
    setSoundActive(next);
    playMechanicalToggle(next);
  };

  const handleLogout = async () => {
    playMechanicalToggle(false);
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#00050a]/95 backdrop-blur-xl text-ghost-ice border-r border-ghost-ice/15">
      {/* Brand & Collapse Header */}
      <div className="p-4 border-b border-ghost-ice/15 flex items-center justify-between gap-2">
        <Link
          to="/"
          onMouseEnter={playHoverTick}
          className="flex items-center gap-3 min-w-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-ghost-blue flex items-center justify-center text-white font-mono font-bold text-xs shadow-md shadow-ghost-blue/30 flex-shrink-0">
            IQ
          </div>
          {!collapsed && (
            <div className="truncate">
              <h1 className="text-sm font-display font-bold text-white tracking-tightest">
                GHOST // IQ
              </h1>
              <p className="text-[10px] font-mono text-ghost-ice/50 uppercase tracking-widest">
                APPLIANCE CORE
              </p>
            </div>
          )}
        </Link>
        <button
          onClick={toggleCollapse}
          onMouseEnter={playHoverTick}
          data-sfx="toggle"
          className="p-1.5 rounded-lg border border-ghost-ice/15 hover:border-ghost-ice/30 text-ghost-ice/50 hover:text-white transition-colors focus:outline-none flex-shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <HiOutlineChevronRight className="w-4 h-4" /> : <HiOutlineChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className={`flex items-center justify-between px-3 mb-2 font-mono text-[9px] uppercase tracking-widest text-ghost-ice/40 ${collapsed ? 'justify-center' : ''}`}>
          {!collapsed && <span>APPLIANCE MODULES</span>}
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        {navItems.map(({ to, icon: Icon, label, code }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => {
              setMobileOpen(false);
              playMechanicalToggle(true);
            }}
            onMouseEnter={playHoverTick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl text-xs font-ui uppercase tracking-wider font-medium transition-all ${
                collapsed ? 'justify-center p-2.5 w-10 h-10 mx-auto' : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-ghost-blue/15 text-white border border-ghost-blue/40 shadow-sm shadow-ghost-blue/10'
                  : 'text-ghost-ice/70 hover:text-white hover:bg-ghost-ice/5 border border-transparent'
              }`
            }
            title={label}
          >
            <Icon className="w-4 h-4 flex-shrink-0 text-ghost-ice" />
            {!collapsed && (
              <div className="flex items-center justify-between flex-1">
                <span>{label}</span>
                <span className="font-mono text-[9px] text-ghost-ice/30">{code}</span>
              </div>
            )}
          </NavLink>
        ))}

        <div className={`px-3 mt-5 mb-2 font-mono text-[9px] uppercase tracking-widest text-ghost-ice/40 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '•' : 'SYSTEM & IDENTITY'}
        </div>
        {accountItems.map(({ to, icon: Icon, label, code }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => {
              setMobileOpen(false);
              playMechanicalToggle(true);
            }}
            onMouseEnter={playHoverTick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl text-xs font-ui uppercase tracking-wider font-medium transition-all ${
                collapsed ? 'justify-center p-2.5 w-10 h-10 mx-auto' : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-ghost-blue/15 text-white border border-ghost-blue/40 shadow-sm shadow-ghost-blue/10'
                  : 'text-ghost-ice/70 hover:text-white hover:bg-ghost-ice/5 border border-transparent'
              }`
            }
            title={label}
          >
            <Icon className="w-4 h-4 flex-shrink-0 text-ghost-ice" />
            {!collapsed && (
              <div className="flex items-center justify-between flex-1">
                <span>{label}</span>
                <span className="font-mono text-[9px] text-ghost-ice/30">{code}</span>
              </div>
            )}
          </NavLink>
        ))}

        {isMentor() && (
          <>
            <div className={`px-3 mt-5 mb-2 font-mono text-[9px] uppercase tracking-widest text-ghost-ice/40 ${collapsed ? 'text-center' : ''}`}>
              {collapsed ? '•' : 'MENTOR CORRIDOR'}
            </div>
            {mentorItems.map(({ to, icon: Icon, label, code }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => {
                  setMobileOpen(false);
                  playMechanicalToggle(true);
                }}
                onMouseEnter={playHoverTick}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl text-xs font-ui uppercase tracking-wider font-medium transition-all ${
                    collapsed ? 'justify-center p-2.5 w-10 h-10 mx-auto' : 'px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-ghost-blue/15 text-white border border-ghost-blue/40 shadow-sm shadow-ghost-blue/10'
                      : 'text-ghost-ice/70 hover:text-white hover:bg-ghost-ice/5 border border-transparent'
                  }`
                }
                title={label}
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-ghost-ice" />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span>{label}</span>
                    <span className="font-mono text-[9px] text-ghost-ice/30">{code}</span>
                  </div>
                )}
              </NavLink>
            ))}
          </>
        )}

        {isAdmin() && (
          <>
            <div className={`px-3 mt-5 mb-2 font-mono text-[9px] uppercase tracking-widest text-ghost-ice/40 ${collapsed ? 'text-center' : ''}`}>
              {collapsed ? '•' : 'ROOT SUPERVISOR'}
            </div>
            {adminItems.map(({ to, icon: Icon, label, code }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => {
                  setMobileOpen(false);
                  playMechanicalToggle(true);
                }}
                onMouseEnter={playHoverTick}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl text-xs font-ui uppercase tracking-wider font-medium transition-all ${
                    collapsed ? 'justify-center p-2.5 w-10 h-10 mx-auto' : 'px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-ghost-blue/15 text-white border border-ghost-blue/40 shadow-sm shadow-ghost-blue/10'
                      : 'text-ghost-ice/70 hover:text-white hover:bg-ghost-ice/5 border border-transparent'
                  }`
                }
                title={label}
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-ghost-ice" />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span>{label}</span>
                    <span className="font-mono text-[9px] text-ghost-ice/30">{code}</span>
                  </div>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Audio Haptic Engine Control Rack */}
      <div className="px-3 py-2 border-t border-ghost-ice/15">
        <button
          onClick={handleAudioToggle}
          onMouseEnter={playHoverTick}
          data-sfx="toggle"
          className="w-full flex items-center justify-between p-2 rounded-lg border border-ghost-ice/15 bg-ghost-ice/5 hover:bg-ghost-ice/10 text-ghost-ice/80 hover:text-white transition-all"
          title="Toggle Procedural Web Audio Engine"
        >
          <div className="flex items-center gap-2">
            {soundActive ? (
              <HiOutlineVolumeUp className="w-4 h-4 text-ghost-blue" />
            ) : (
              <HiOutlineVolumeOff className="w-4 h-4 text-ghost-ice/40" />
            )}
            {!collapsed && (
              <span className="font-mono text-[10px] uppercase tracking-wider">
                {soundActive ? 'SFX: 7kHz ACTIVE' : 'SFX: MUTED'}
              </span>
            )}
          </div>
          {!collapsed && (
            <span className={`w-2 h-2 rounded-full ${soundActive ? 'bg-ghost-blue animate-pulse' : 'bg-ghost-ice/20'}`} />
          )}
        </button>
      </div>

      {/* User Status Rack */}
      <div className="p-3 border-t border-ghost-ice/15">
        <div className={`p-2 rounded-xl bg-ghost-void/90 border border-ghost-ice/15 flex items-center gap-2.5 ${collapsed ? 'flex-col justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-ghost-blue/20 border border-ghost-blue/40 flex items-center justify-center text-ghost-ice font-mono font-bold text-xs flex-shrink-0">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          {!collapsed ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-ui font-semibold text-white truncate">{user?.fullName}</p>
                <p className="text-[10px] font-mono text-ghost-ice/50 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                onMouseEnter={playHoverTick}
                className="p-1.5 rounded-lg border border-ghost-ice/15 hover:border-ghost-alert/40 text-ghost-ice/50 hover:text-red-400 hover:bg-ghost-alert/10 transition-colors"
                title="Disconnect Session"
              >
                <HiOutlineLogout className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              onMouseEnter={playHoverTick}
              className="p-1.5 rounded-lg border border-ghost-ice/15 hover:border-ghost-alert/40 text-ghost-ice/50 hover:text-red-400 hover:bg-ghost-alert/10 transition-colors"
              title="Disconnect Session"
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
        onMouseEnter={playHoverTick}
        data-sfx="toggle"
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-xl bg-ghost-void/90 border border-ghost-ice/20 shadow-xl text-ghost-ice"
      >
        {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-[#00050a]/80 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#00050a] border-r border-ghost-ice/15 z-40 shadow-2xl
          transform transition-all duration-300 ease-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
