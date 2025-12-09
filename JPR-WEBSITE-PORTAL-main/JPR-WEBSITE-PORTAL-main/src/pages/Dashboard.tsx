import { useState, useEffect } from "react";
import { useAuth, User } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FocusSpotlight } from '@/components/FocusSpotlight';
import { useNavigate } from 'react-router-dom';
import { SuperUserDashboard } from './SuperUserDashboard';
import { CEODashboard } from '@/components/dashboard/CEODashboard';
import {
  TrendingUp,
  DollarSign,
  Server,
  Shield,
  Heart,
  BookOpen,
  Network,
  Stethoscope,
  ClipboardList,
  CheckCircle2,
  Target,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

// IT Team Dashboard
const ITTeamDashboard = ({ user }: { user: User }) => (
  <div className="p-8">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Server className="h-10 w-10 text-blue-500" />
          IT Team Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">Welcome, {user.name}</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">All Systems</span>
                <Badge className="bg-green-500">Operational</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Database</span>
                <Badge className="bg-green-500">99.9% Uptime</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">API</span>
                <Badge className="bg-green-500">Healthy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">12 security patches applied this month</p>
            <Button className="mt-4 w-full">View Security Logs</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-sm text-muted-foreground">3 critical, 5 normal</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// Family and Friends Dashboard
const FamilyFriendsDashboard = ({ user }: { user: User }) => (
  <div className="p-8">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Heart className="h-10 w-10 text-pink-500" />
          Family & Friends Portal
        </h1>
        <p className="text-muted-foreground text-lg">Welcome, {user.name}</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shared Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">5 upcoming family events</p>
            <Button className="mt-4 w-full">View Calendar</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Photo Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">124 photos shared this month</p>
            <Button className="mt-4 w-full">Browse Photos</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">New messages</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// CPDP Manager Dashboard
const CPDPManagerDashboard = ({ user }: { user: User }) => (
  <div className="p-8">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <ClipboardList className="h-10 w-10 text-purple-500" />
          CPDP Manager Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">Welcome, {user.name}</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">247</div>
            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12% this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Today's schedule</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">87%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '87%' }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// CPDP TCO Dashboard
const CPDPTCODashboard = ({ user }: { user: User }) => (
  <div className="p-8">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <DollarSign className="h-10 w-10 text-green-500" />
          CPDP TCO Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">Welcome, {user.name} - Total Cost of Ownership</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$450K</div>
            <p className="text-xs text-muted-foreground">$420K utilized (93%)</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '93%' }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cost per Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$1,821</div>
            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              -5% vs target
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Operational Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">94%</div>
            <Badge className="mt-2 bg-green-500">On Target</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$5.4M</div>
            <p className="text-xs text-muted-foreground">Annual projection</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// CPDP Staff Dashboard
const CPDPStaffDashboard = ({ user }: { user: User }) => (
  <div className="p-8">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Stethoscope className="h-10 w-10 text-blue-500" />
          CPDP Staff Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">Welcome, {user.name}</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">14</div>
            <p className="text-sm text-muted-foreground">Patient appointments</p>
            <Button className="mt-4 w-full">View Schedule</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">7</div>
            <p className="text-sm text-muted-foreground">3 high priority</p>
            <Button className="mt-4 w-full">View Tasks</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-sm text-muted-foreground">Unread messages</p>
            <Button className="mt-4 w-full">Check Messages</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// CPDP Patients Dashboard
const CPDPPatientsDashboard = ({ user }: { user: User }) => (
  <div className="p-8">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Heart className="h-10 w-10 text-red-500" />
          Patient Portal
        </h1>
        <p className="text-muted-foreground text-lg">Welcome, {user.name}</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Dr. Smith</p>
                <p className="text-xs text-muted-foreground">Tomorrow at 10:00 AM</p>
              </div>
              <Button className="w-full">View All Appointments</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Medical Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Access your health information</p>
            <Button className="w-full">View Records</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2</div>
            <p className="text-sm text-muted-foreground">New messages from your care team</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// CPDP Training Dashboard
const CPDPTrainingDashboard = ({ user }: { user: User }) => (
  <div className="p-8">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <BookOpen className="h-10 w-10 text-indigo-500" />
          Training & Development
        </h1>
        <p className="text-muted-foreground text-lg">Welcome, {user.name}</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">8 in progress, 4 completed</p>
            <Button className="mt-4 w-full">View Courses</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">156</div>
            <p className="text-sm text-muted-foreground">Enrolled learners</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">89%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '89%' }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// CPDP Network Dashboard
const CPDPNetworkDashboard = ({ user }: { user: User }) => (
  <div className="p-8">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Network className="h-10 w-10 text-cyan-500" />
          CPDP Network Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">Welcome, {user.name}</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Network Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">48</div>
            <p className="text-sm text-muted-foreground">Active partnerships</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">127</div>
            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +18% this quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Collaboration Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">9</div>
            <p className="text-sm text-muted-foreground">5 active, 4 planned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Network Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">96%</div>
            <Badge className="mt-2 bg-green-500">Excellent</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCEO = user?.role === 'CEO' || user?.role === 'Managing Director';
  const isSuperUser = user?.role === 'Super User';

  // Super User gets special dashboard
  if (isSuperUser) {
    return <SuperUserDashboard />;
  }

  // Role-specific dashboard rendering
  const renderRoleSpecificDashboard = () => {
    switch (user?.role) {
      case 'IT Team':
        return <ITTeamDashboard user={user} />;
      case 'Family and Friends':
        return <FamilyFriendsDashboard user={user} />;
      case 'CPDP Manager':
        return <CPDPManagerDashboard user={user} />;
      case 'CPDP TCO':
        return <CPDPTCODashboard user={user} />;
      case 'CPDP Staff':
        return <CPDPStaffDashboard user={user} />;
      case 'CPDP Patients':
        return <CPDPPatientsDashboard user={user} />;
      case 'CPDP Training':
        return <CPDPTrainingDashboard user={user} />;
      case 'CPDP Network':
        return <CPDPNetworkDashboard user={user} />;
      default:
        return null;
    }
  };

  // Check for role-specific dashboards first
  const roleSpecificDashboard = renderRoleSpecificDashboard();
  if (roleSpecificDashboard) {
    return roleSpecificDashboard;
  }

  if (!isCEO) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground text-lg">Role: {user?.role}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Dashboard</CardTitle>
                <CardDescription>General access dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access to contacts, tasks, and team collaboration features available here.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>Your access level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">View assigned tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Manage contacts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Team messaging</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  View Tasks
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Send Message
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Browse Contacts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // CEO-exclusive dashboard
  return <CEODashboardWrapper />;
};

// Wrapper to fetch data for CEO Dashboard
const CEODashboardWrapper = () => {
  const [netWorth, setNetWorth] = useState<number | null>(null);
  const [activeObjectives, setActiveObjectives] = useState(0);

  useEffect(() => {
    // Fetch dashboard data
    import('@/services/dashboardService').then(({ getTodayDashboard }) => {
      getTodayDashboard().then(data => {
        setNetWorth(data.netWorthToday);
        setActiveObjectives(data.activeObjectives);
      });
    });
  }, []);

  return <CEODashboard activeObjectives={activeObjectives} netWorth={netWorth} />;
};

export default Dashboard;
