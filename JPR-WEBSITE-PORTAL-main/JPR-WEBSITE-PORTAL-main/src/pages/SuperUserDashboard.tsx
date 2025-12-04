import { useState, useEffect } from 'react';
import { useAuth, User } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, XCircle, AlertCircle, Users, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const SuperUserDashboard = () => {
  const { getPendingUsers, approveUser, denyUser } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const loadData = () => {
    setPendingUsers(getPendingUsers());
    
    const usersStr = localStorage.getItem('raghava_users');
    if (usersStr) {
      const users: User[] = JSON.parse(usersStr);
      setAllUsers(users.filter(u => u.status === 'approved'));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (userId: string, userName: string) => {
    approveUser(userId);
    toast.success(`${userName} has been approved`);
    loadData();
  };

  const handleDeny = (userId: string, userName: string) => {
    denyUser(userId);
    toast.error(`${userName} has been denied access`);
    loadData();
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'CEO': 'bg-purple-500',
      'Director': 'bg-blue-500',
      'Admin': 'bg-green-500',
      'IT Team': 'bg-cyan-500',
      'CPDP Manager': 'bg-orange-500',
      'CPDP TCO': 'bg-emerald-500',
      'CPDP Staff': 'bg-indigo-500',
    };
    return colors[role] || 'bg-gray-500';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString() + ' ' + new Date(dateStr).toLocaleTimeString();
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Shield className="h-10 w-10 text-yellow-500" />
            Super User Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Review and manage user access, view signup and login details
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{pendingUsers.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-blue-500" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{allUsers.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Approved users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-500">All Clear</Badge>
              <p className="text-sm text-muted-foreground mt-2">System secure</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        {pendingUsers.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Pending User Approvals</CardTitle>
              <CardDescription>
                Review user information and approve or deny access to the portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-6 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{user.name}</h3>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Signed up: {formatDate(user.signupDate)}
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApprove(user.id, user.name)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDeny(user.id, user.name)}
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">All Approved Users</CardTitle>
            <CardDescription>
              View signup dates, last login times, names, and roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Signup Date</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.teamTag || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {formatDate(user.signupDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        {formatDate(user.lastLogin)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Super User Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Login Credentials:</p>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p><strong>Email:</strong> superuser@raghava.ai</p>
                <p><strong>Password:</strong> superadmin123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
