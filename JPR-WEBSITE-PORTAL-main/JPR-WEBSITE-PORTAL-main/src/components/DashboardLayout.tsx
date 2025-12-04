import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Shield,
  CheckSquare,
  MessageSquare,
  FileText,
  LogOut,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    { path: '/review', icon: FileText, label: 'Review' },
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
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-white/90 hover:text-white hover:bg-white/10 ${isActive ? 'bg-white/20 text-white' : ''
                    }`}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
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
