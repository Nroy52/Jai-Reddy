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
          {index + 1}. {pillar.title} {getStatusEmoji(trend)}
        </h3>
        <p className="text-[10px] text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view 10 KPIs
        </p>
      </CardContent>
    </Card>
  );
};

export const CEODashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedImage = localStorage.getItem('ceoProfileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

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
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div
                className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
                title="Click to change profile photo"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <Users className="h-10 w-10 text-slate-400" />
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white mb-1" />
                  <span className="text-xs text-white font-medium">Change</span>
                </div>
              </div>

              {/* Edit Badge */}
              <button
                className="absolute 0 -right-1 p-2 bg-white dark:bg-slate-700 rounded-full shadow-md border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors z-10"
                style={{ bottom: '0px' }}
                onClick={() => fileInputRef.current?.click()}
                title="Edit profile photo"
              >
                <Pencil className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </button>

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
                Welcome {user?.role}, {user?.name} {getStatusEmoji(calculateAggregateTrend(CEO_DASHBOARD_DATA.flatMap(p => p.kpis)))}
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Top Stats Row */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Net Worth Today</p>
                    <h3 className="text-2xl font-bold mt-1">$12.4M</h3>
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
                  <p className="text-xs text-slate-600">• Quarterly review due</p>
                  <p className="text-xs text-slate-600">• Investment rebalancing</p>
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
                    Priority Attention
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Q3 Financial Review",
                      desc: "Review and approve the quarterly financial statement.",
                      priority: "High",
                      due: "Today",
                      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    },
                    {
                      title: "Board Meeting Prep",
                      desc: "Finalize slides for the upcoming board meeting.",
                      priority: "Medium",
                      due: "Tomorrow",
                      color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    },
                    {
                      title: "New Hire Approval",
                      desc: "Approve the offer letter for the new CTO.",
                      priority: "Low",
                      due: "Next Week",
                      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    }
                  ].map((alert, i) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                      <div className={`p-2 rounded-full ${alert.color.split(' ')[0]} ${alert.color.split(' ')[1]}`}>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">{alert.title}</h4>
                          <Badge variant="outline" className={`${alert.color} border-none`}>
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{alert.desc}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Due: {alert.due}
                          </span>
                          <button className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                            Take Action
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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

        </div>
      </div>
    </div>
  );
};
