import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, LogOut, Clock, Mail, User } from 'lucide-react';

const PendingApproval = () => {
    const { logout, user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    if (!user) return null;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <Card className="max-w-md w-full shadow-xl border-t-4 border-t-amber-500 overflow-hidden">
                <CardHeader className="text-center pb-2 bg-white dark:bg-slate-900/50">
                    <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6 shadow-sm ring-1 ring-amber-100 dark:bg-amber-900/20 dark:ring-amber-900/50">
                        <ShieldAlert className="h-8 w-8 text-amber-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Access Pending
                    </CardTitle>
                    <CardDescription className="text-base">
                        Your account is currently under review
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6 px-8">
                    <div className="text-center text-slate-600 dark:text-slate-400 leading-relaxed">
                        <p>
                            Welcome, <span className="font-semibold text-slate-900 dark:text-white">{user?.name}</span>.
                            Your account has been successfully created, but access to the dashboard is restricted until an administrator approves your role.
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 space-y-3 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="font-medium text-slate-900 dark:text-slate-200">Role:</span>
                            <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                {user.role}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span className="font-medium text-slate-900 dark:text-slate-200">Email:</span>
                            <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="font-medium text-slate-900 dark:text-slate-200">Status:</span>
                            <span className="text-amber-600 font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Awaiting Approval
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs text-center text-slate-400 mb-4">
                            Please contact your system administrator if this process takes longer than 24 hours.
                        </p>
                        <Button
                            variant="outline"
                            className="w-full gap-2 h-11 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            onClick={logout}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out and Return Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PendingApproval;
