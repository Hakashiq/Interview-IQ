import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { playHoverTick, playMechanicalToggle } from '../../utils/soundEffects';
import {
  HiOutlineBell, HiOutlineSearch, HiOutlineLogout,
  HiOutlineUser, HiOutlineCog, HiOutlineCheck
} from 'react-icons/hi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data || []);
      } catch {
        setNotifications([
          { id: 1, title: 'SYSTEM INITIALIZATION', message: 'Ghost Core MK-IV telemetry active. Upload resume for custom track benchmark.', createdAt: new Date().toISOString(), read: false },
        ]);
      }
    };
    fetchNotifications();
  }, []);

  const handleLogout = async () => {
    playMechanicalToggle(false);
    await logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (id) => {
    playMechanicalToggle(true);
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const handleMarkAllRead = async () => {
    playMechanicalToggle(true);
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('Telemetry notifications acknowledged');
    } catch {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#00050a]/90 backdrop-blur-xl border-b border-ghost-ice/15">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        
        {/* Precision Search Bar */}
        <div className="hidden sm:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ghost-ice/40" />
            <input
              id="navbar-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search interview logs, tracks, questions..."
              className="w-full pl-10 pr-12 py-2 rounded-xl bg-[#000307]/80 border border-ghost-ice/20 text-xs font-mono text-ghost-ice placeholder-ghost-ice/35 focus:outline-none focus:border-ghost-blue focus:ring-1 focus:ring-ghost-blue transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium text-ghost-ice/40 bg-ghost-ice/5 border border-ghost-ice/15 pointer-events-none">
              CMD+K
            </kbd>
          </div>
        </div>

        {/* Telemetry Indicator Status */}
        <div className="hidden md:flex items-center gap-2 pl-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-ghost-ice/15 bg-ghost-ice/5 font-mono text-[10px] text-ghost-ice/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SYS.LIVE // 0-EGRESS</span>
          </div>
        </div>

        {/* Right Nav Section */}
        <div className="flex items-center gap-3 ml-auto">
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              id="navbar-notifications-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
                playMechanicalToggle(!showNotifications);
              }}
              onMouseEnter={playHoverTick}
              data-sfx="toggle"
              className="relative p-2 rounded-xl border border-ghost-ice/15 hover:border-ghost-ice/30 bg-ghost-ice/5 text-ghost-ice/70 hover:text-white transition-colors"
              title="System Notifications"
            >
              <HiOutlineBell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center px-1 text-[9px] font-mono font-bold text-white bg-ghost-blue rounded-full shadow-sm shadow-ghost-blue">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 ghost-panel py-2 shadow-2xl z-50">
                <div className="px-4 py-2.5 border-b border-ghost-ice/15 flex items-center justify-between">
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Telemetry Dispatch
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      onMouseEnter={playHoverTick}
                      className="text-[11px] font-mono text-ghost-blue hover:underline flex items-center gap-1"
                    >
                      <HiOutlineCheck className="w-3.5 h-3.5" />
                      ACK ALL
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-ghost-ice/40 font-mono text-xs">
                    No active dispatches
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto divide-y divide-ghost-ice/10">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkRead(notif.id)}
                        onMouseEnter={playHoverTick}
                        className={`px-4 py-3 hover:bg-ghost-ice/5 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-ghost-blue/10 border-l-2 border-ghost-blue' : ''
                        }`}
                      >
                        <p className="text-xs font-mono font-bold text-white">{notif.title}</p>
                        <p className="text-xs font-ui text-ghost-ice/70 mt-0.5 leading-relaxed">{notif.message}</p>
                        <p className="text-[10px] font-mono text-ghost-ice/40 mt-1">{formatTime(notif.createdAt || notif.time)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              id="navbar-profile-btn"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
                playMechanicalToggle(!showProfile);
              }}
              onMouseEnter={playHoverTick}
              data-sfx="toggle"
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-ghost-ice/15 hover:border-ghost-ice/30 bg-ghost-ice/5 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-ghost-blue flex items-center justify-center text-white text-xs font-mono font-bold flex-shrink-0 shadow-sm shadow-ghost-blue/40">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-ui font-semibold text-white leading-tight">{user?.fullName || 'User'}</p>
                <p className="text-[9px] font-mono text-ghost-ice/50 uppercase leading-tight">
                  {user?.roles?.[0]?.replace('ROLE_', '') || 'OPERATOR'}
                </p>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 ghost-panel py-1.5 shadow-2xl z-50">
                <div className="px-4 py-2.5 border-b border-ghost-ice/15">
                  <p className="text-xs font-ui font-bold text-white">{user?.fullName}</p>
                  <p className="text-[10px] font-mono text-ghost-ice/50 truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    id="navbar-profile-link"
                    onClick={() => {
                      playMechanicalToggle(true);
                      navigate('/profile');
                      setShowProfile(false);
                    }}
                    onMouseEnter={playHoverTick}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-ui uppercase tracking-wider text-ghost-ice/80 hover:text-white hover:bg-ghost-ice/5 transition-colors"
                  >
                    <HiOutlineUser className="w-4 h-4 text-ghost-ice/50" />
                    Operator Profile
                  </button>
                  <button
                    id="navbar-settings-link"
                    onClick={() => {
                      playMechanicalToggle(true);
                      navigate('/settings');
                      setShowProfile(false);
                    }}
                    onMouseEnter={playHoverTick}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-ui uppercase tracking-wider text-ghost-ice/80 hover:text-white hover:bg-ghost-ice/5 transition-colors"
                  >
                    <HiOutlineCog className="w-4 h-4 text-ghost-ice/50" />
                    System Settings
                  </button>
                </div>
                <div className="border-t border-ghost-ice/15 pt-1">
                  <button
                    id="navbar-logout-btn"
                    onClick={handleLogout}
                    onMouseEnter={playHoverTick}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-ui uppercase tracking-wider text-red-400 hover:bg-ghost-alert/15 transition-colors"
                  >
                    <HiOutlineLogout className="w-4 h-4" />
                    Disconnect Session
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
