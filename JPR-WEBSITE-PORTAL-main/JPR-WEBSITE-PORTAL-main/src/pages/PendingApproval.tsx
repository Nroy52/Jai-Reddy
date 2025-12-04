import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, LogOut } from 'lucide-react';

const PendingApproval = () => {
    const { logout, user } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <Card className="max-w-md w-full shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert className="h-6 w-6 text-amber-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                        Access Pending
                    </CardTitle>
                    <CardDescription className="mt-2">
                        Hello, <span className="font-medium text-slate-900 dark:text-white">{user?.name}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center text-slate-600 dark:text-slate-400">
                        <p>
                            Your account has been created successfully but requires administrator approval before you can access the dashboard.
                        </p>
                        <p className="mt-4 text-sm bg-slate-100 dark:bg-slate-900 p-3 rounded-lg">
                            Please contact your system administrator or wait for your role to be assigned.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={logout}
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default PendingApproval;
