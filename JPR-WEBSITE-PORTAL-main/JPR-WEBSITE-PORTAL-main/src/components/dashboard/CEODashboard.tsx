import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Target,
  Camera,
  Pencil,
  Plus,
  Calendar,
  FileText,
  Settings,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { CEO_DASHBOARD_DATA, Pillar } from '@/data/ceoDashboardData';
import { getStatusEmoji, calculateAggregateTrend } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface DashboardTask {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  dueDate?: string | null;
  assigneeId?: string | null;
  ftuId?: string | null;
}

const DomainCard = ({
  pillar,
  onClick,
  index,
  trend
}: {
  pillar: Pillar;
  onClick: () => void;
  index: number;
  trend: string;
}) => {
  const Icon = pillar.icon;
  return (
    <Card
      className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 border-none group cursor-pointer h-full ${pillar.gradientClass}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full relative z-10">
        <div className={`p-3 rounded-full bg-white/90 shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300 ${pillar.colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-bold text-base leading-tight text-slate-800 dark:text-slate-100">
          F{index + 1}. {pillar.title} {getStatusEmoji(trend)}
        </h3>
        <p className="text-[10px] text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view 10 KPIs
        </p>
      </CardContent>
    </Card>
  );
};

export const CEODashboard = ({ activeObjectives = 0, netWorth = null }: { activeObjectives?: number; netWorth?: number | null }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedImage = localStorage.getItem('ceoProfileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*');

      if (error) throw error;

      if (data) {
        const mappedTasks: DashboardTask[] = data.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.due_date,
          assigneeId: t.assignee_user_id || t.user_id, // Support new schema
          ftuId: t.ftu_id
        }));
        setTasks(mappedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const formattedNetWorth = netWorth !== null
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(netWorth)
    : '$12.4M'; // Fallback

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem('ceoProfileImage', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 w-full h-full">
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-8">

          {/* Header */}
          {/* Header */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div
                className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
                title="Click to change profile photo"
              >
                {/* ... existing profile image rendering ... */}
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <Users className="h-10 w-10 text-slate-400" />
                )}
                {/* Overlay for hover effect */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-md border border-slate-100 dark:border-slate-700 cursor-pointer hover:scale-110 transition-transform"
                onClick={() => fileInputRef.current?.click()}>
                <Pencil className="h-3 w-3 text-slate-600 dark:text-slate-400" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-1">
                Welcome {user?.role || 'CEO'}, {user?.name} {getStatusEmoji(calculateAggregateTrend(CEO_DASHBOARD_DATA.flatMap(p => p.kpis)))}
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Top Stats Row */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Net Worth Card */}
            <Card className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Net Worth Today</p>
                    <h3 className="text-2xl font-bold mt-1">{formattedNetWorth}</h3>
                  </div>
                  <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                  +8.2% <span className="text-slate-400 font-normal">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">12 Month Target</p>
                    <h3 className="text-2xl font-bold mt-1">$15.0M</h3>
                  </div>
                  <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                    <Target className="h-4 w-4" />
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '82%' }} />
                </div>
                <div className="mt-1.5 text-xs text-slate-500 text-right">82% Achieved</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Priority Alerts</p>
                    <h3 className="text-2xl font-bold mt-1">3</h3>
                  </div>
                  <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-1 mt-1">
                  <p className="text-xs text-slate-600">- Quarterly review due</p>
                  <p className="text-xs text-slate-600">- Investment rebalancing</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Priority Alerts & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Priority Alerts */}
            <Card className="lg:col-span-2 border-none shadow-md bg-white dark:bg-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Priority Attention (Next 3 Steps)
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100" onClick={() => navigate('/tasks')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const priorityTasks = tasks
                      .filter((t) => t.status !== 'Done' && (t.priority === 'Critical' || t.priority === 'High'))
                      .sort((a, b) => {
                        // Sort by priority (Critical first) then due date
                        if (a.priority === 'Critical' && b.priority !== 'Critical') return -1;
                        if (b.priority === 'Critical' && a.priority !== 'Critical') return 1;
                        return new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime();
                      })
                      .slice(0, 3);

                    if (priorityTasks.length === 0) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          No critical or high priority tasks pending.
                        </div>
                      );
                    }

                    return priorityTasks.map((task, i: number) => (
                      <div key={task.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800 cursor-pointer" onClick={() => navigate('/tasks')}>
                        <div className={`p-2 rounded-full ${task.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">{task.title}</h4>
                            <Badge variant="outline" className={`${task.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'} border-none`}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">{task.description || 'No description'}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            {task.ftuId && (
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" /> {task.ftuId}
                              </span>
                            )}
                            <button className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium ml-auto">
                              Take Action
                            </button>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-none shadow-md bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: "New Project", icon: Plus, color: "bg-blue-500 hover:bg-blue-600" },
                    { label: "Schedule Meeting", icon: Calendar, color: "bg-indigo-500 hover:bg-indigo-600" },
                    { label: "Generate Report", icon: FileText, color: "bg-emerald-500 hover:bg-emerald-600" },
                    { label: "System Settings", icon: Settings, color: "bg-slate-600 hover:bg-slate-500" }
                  ].map((action, i) => (
                    <Button
                      key={i}
                      className={`w-full justify-start h-12 text-white border-none ${action.color} transition-all duration-300 group`}
                    >
                      <div className="p-1.5 bg-white/20 rounded mr-3 group-hover:scale-110 transition-transform">
                        <action.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{action.label}</span>
                      <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Note */}
          <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-lg">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">AI Note of the Day</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  "Focus on strengthening the Family domain this week. Your Topic scores show excellent progress in Financial Planning (92/100), but Personal Development could benefit from dedicated attention. Consider scheduling strategic time blocks for the Units that matter most."
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Domain Grid (5x2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {CEO_DASHBOARD_DATA.map((pillar, index) => (
              <DomainCard
                key={pillar.id}
                pillar={pillar}
                index={index}
                trend={calculateAggregateTrend(pillar.kpis)}
                onClick={() => navigate(`/dashboard/pillar/${pillar.id}`)}
              />
            ))}
          </div>

        </div >
      </div >
    </div >
  );
};
