import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  Users,
  Shield,
  CheckSquare,
  MessageSquare,
  UserCircle,
  LogOut,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      // 1. Fetch unread tasks (Tasks assigned to user that are not Done)
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assignee_user_id', user.id)
        .neq('status', 'Done');

      if (taskCount !== null) setPendingTasks(taskCount);

      // 2. Fetch unread messages
      // Ideally we check a 'read' status table, but for now we'll just check threads with new activity
      // A better implementation needs a 'last_read_at' per user per thread.
      // For this MVP, we will count threads where the user is a participant.
      // (This is a simplified "unread" badge, effectively showing total active threads for now)
      // Real "unread" requires a separate 'thread_participants' table with 'last_read'.
      // changing to just show total threads for now as a notification of activity center
      const { count: msgCount } = await supabase
        .from('message_threads')
        .select('*', { count: 'exact', head: true })
        .contains('participant_ids', [user.id]);

      // NOTE: Proper unread count requires schema change (user_thread_status table).
      // We will just show 0 or a dot if API supported it, but for now let's show 0 to avoid fake noise
      // untill we implement read receipts.
      // ACTUALLY: User asked for notifications. Let's just show open tasks for now as it is reliable.

      // setUnreadMessages(msgCount || 0); 
    };

    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/contacts', icon: Users, label: 'Contacts' },
    { path: '/vault', icon: Shield, label: 'Vault' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <aside className="w-64 gradient-primary text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-[hsl(var(--gold))]" />
            <h1 className="text-xl font-bold">Dr Jai Reddy</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            // Calculate Badge Count
            let badgeCount = 0;
            if (item.label === 'Messages') badgeCount = unreadMessages;
            if (item.label === 'Tasks') badgeCount = pendingTasks;

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-white/90 hover:text-white hover:bg-white/10 ${isActive ? 'bg-white/20 text-white' : ''
                    }`}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {badgeCount}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="mb-4 p-3 bg-white/10 rounded-lg">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-white/70">{user?.email}</p>
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded ${user?.role === 'CEO' || user?.role === 'Managing Director'
                ? 'bg-[hsl(var(--gold))] text-[hsl(var(--navy))]'
                : 'bg-white/20 text-white'
                }`}>
                {user?.role}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
