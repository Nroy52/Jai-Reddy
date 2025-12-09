import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth, User } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CheckCircle, XCircle, AlertCircle, Users, Clock, Lock, Settings, FileText, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock Audit Logs
const MOCK_AUDIT_LOGS = [
  { id: 1, action: 'User Login', user: 'dnroy552@gmail.com', timestamp: '2024-03-15T10:30:00Z', details: 'Successful login from IP 192.168.1.1' },
  { id: 2, action: 'Role Update', user: 'Super User', timestamp: '2024-03-15T10:15:00Z', details: 'Changed role of user Sarah Williams to Director' },
  { id: 3, action: 'User Approval', user: 'Super User', timestamp: '2024-03-15T09:45:00Z', details: 'Approved new user registration' },
  { id: 4, action: 'System Config', user: 'Super User', timestamp: '2024-03-14T16:20:00Z', details: 'Updated security policy settings' },
  { id: 5, action: 'Failed Login', user: 'unknown@example.com', timestamp: '2024-03-14T14:10:00Z', details: 'Failed login attempt (3rd retry)' },
];

export const SuperUserDashboard = () => {
  const { getPendingUsers, getAllUsers, approveUser, denyUser, updateUserRole } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | 'All'>('All');

  const availableRoles = [
    'Super User', 'CEO', 'Director', 'Managing Director', 'Admin', 'Staff',
    'IT Team', 'Family and Friends', 'CPDP Manager', 'CPDP TCO', 'CPDP Staff',
    'CPDP Patients', 'CPDP Training', 'CPDP Network', 'Guest', 'Manager',
    'Consultant', 'Partner'
  ];

  const loadData = async () => {
    try {
      const pending = await getPendingUsers();
      setPendingUsers(pending);

      const all = await getAllUsers();
      setAllUsers(all.filter(u => u.status === 'approved'));
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      toast.error("Failed to load user data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (userId: string, userName: string) => {
    try {
      await approveUser(userId);
      toast.success(`${userName} has been approved`);
      loadData();
    } catch (e) {
      toast.error("Failed to approve user");
    }
  };

  const handleDeny = async (userId: string, userName: string) => {
    try {
      await denyUser(userId);
      toast.error(`${userName} has been denied access`);
      loadData();
    } catch (e) {
      toast.error("Failed to deny user");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      loadData();
    } catch (e) {
      toast.error("Failed to update role");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'Super User': 'bg-amber-500',
      'CEO': 'bg-purple-500',
      'Director': 'bg-blue-500',
      'Managing Director': 'bg-indigo-600',
      'Admin': 'bg-green-500',
      'IT Team': 'bg-cyan-500',
    };
    return colors[role] || 'bg-slate-500';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString() + ' ' + new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Shield className="h-8 w-8 text-amber-500" />
              Super User Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete system control and user management
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="text-sm py-1 px-3 border-amber-500/30 text-amber-700 bg-amber-50">
              <Lock className="h-3 w-3 mr-2" />
              Root Access Active
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={async () => {
                try {
                  alert('Starting diagnostics... (Click OK)');

                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) {
                    alert('CRITICAL: No active Supabase session found!');
                    return;
                  }
                  console.log('Session User ID:', session.user.id);

                  // 1. Check My Profile
                  const { data: myProfile, error: myError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                  if (myError) {
                    alert(`Error fetching MY profile: ${myError.message}`);
                  } else {
                    alert(`My Role in DB: ${myProfile.role}\nMy ID: ${myProfile.id}`);
                  }

                  // 2. Check All Profiles
                  const { data: allProfiles, count, error: listError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact' });

                  if (listError) {
                    alert(`Error fetching ALL profiles: ${listError.message}`);
                  } else {
                    const pendingUsers = allProfiles?.filter(p => p.status === 'pending') || [];
                    alert(`Total Profiles Found: ${allProfiles?.length}\nPending: ${pendingUsers.length}`);

                    if (pendingUsers.length > 0) {
                      alert(`Pending User Emails:\n${pendingUsers.map(p => p.email).join('\n')}`);
                    }
                  }

                } catch (e: any) {
                  alert(`Diagnostics Crashed: ${e.message}`);
                  console.error(e);
                }
              }}
            >
              <Settings className="h-3 w-3 mr-1" /> Run Diagnostics
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingUsers.length}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allUsers.length}</div>
              <p className="text-xs text-muted-foreground">Active in system</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <p className="text-xs text-muted-foreground">All services operational</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
              <FileText className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white p-1 shadow-sm border">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" /> User Management
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <FileText className="h-4 w-4" /> Audit Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" /> System Settings
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Pending Requests */}
            {pendingUsers.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-amber-800 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Pending Approvals
                  </CardTitle>
                  <CardDescription>
                    These users have requested access and are waiting for your approval.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-lg border shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg uppercase">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{user.name}</h4>
                            <p className="text-sm text-slate-500">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                Requested Role: <span className="font-semibold ml-1">{user.role}</span>
                              </Badge>
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {formatDate(user.signupDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(user.id, user.name)}
                            className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> Approve
                          </Button>
                          <Button
                            onClick={() => handleDeny(user.id, user.name)}
                            variant="destructive"
                            className="shadow-sm"
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Deny
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Users List */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>User Directory</CardTitle>
                <div className="flex flex-col md:flex-row gap-4 justify-between mt-4">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={selectedRole} onValueChange={(val: any) => setSelectedRole(val)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Roles</SelectItem>
                        {availableRoles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            No users found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-slate-50/50">
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900">{user.name}</span>
                                <span className="text-xs text-slate-500">{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" className="h-auto p-0 hover:bg-transparent font-normal">
                                    <Badge className={`${getRoleBadgeColor(user.role)} hover:opacity-80 transition-opacity cursor-pointer`}>
                                      {user.role}
                                    </Badge>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Change User Role</DialogTitle>
                                    <DialogDescription>
                                      Update the access level for {user.name}. careful, this will change their permissions immediately.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <Select
                                      defaultValue={user.role}
                                      onValueChange={(val: string) => handleRoleChange(user.id, val)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-[300px]">
                                        {availableRoles.map(role => (
                                          <SelectItem key={role} value={role}>{role}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <DialogFooter>
                                    <Button disabled variant="outline">Save changes is automatic</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(user.signupDate)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(user.lastLogin)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>System Audit Logs</CardTitle>
                <CardDescription>View recent security events and administrative actions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_AUDIT_LOGS.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell className="text-muted-foreground">{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Manage global application settings and policies.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                    <div>
                      <h4 className="font-semibold text-base">New User Registration</h4>
                      <p className="text-sm text-muted-foreground">Allow new users to sign up for the platform.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked readOnly className="h-5 w-5 accent-amber-500" />
                      <span className="text-sm font-medium">Enabled</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                    <div>
                      <h4 className="font-semibold text-base">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">Enforce 2FA for all Super User and Admin accounts.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="h-5 w-5 accent-amber-500" />
                      <span className="text-sm font-medium text-slate-500">Disabled</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                    <div>
                      <h4 className="font-semibold text-base">Public Profile Visibility</h4>
                      <p className="text-sm text-muted-foreground">Allow user profiles to be visible to search engines.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="h-5 w-5 accent-amber-500" />
                      <span className="text-sm font-medium text-slate-500">Disabled</span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button variant="outline" className="mr-2">Reset Defaults</Button>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-white">Save Changes</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
