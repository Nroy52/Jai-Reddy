import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, ArrowRight } from 'lucide-react';

const Onboarding = () => {
    const { user, updateUserRole } = useAuth();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRoleSubmit = () => {
        if (!selectedRole) return;

        setIsLoading(true);
        // Simulate a small delay for better UX
        setTimeout(() => {
            updateUserRole(selectedRole as UserRole);
            navigate('/pending');
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <Card className="max-w-md w-full shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="h-6 w-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                        Select Your Role
                    </CardTitle>
                    <CardDescription className="mt-2">
                        Welcome, <span className="font-medium text-slate-900 dark:text-white">{user?.name}</span>.
                        Please select the role that best describes your position.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Role
                        </label>
                        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CEO">CEO</SelectItem>
                                <SelectItem value="Director">Director</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Staff">Staff</SelectItem>
                                <SelectItem value="IT Team">IT Team</SelectItem>
                                <SelectItem value="Family and Friends">Family and Friends</SelectItem>
                                <SelectItem value="CPDP Manager">CPDP Manager</SelectItem>
                                <SelectItem value="CPDP TCO">CPDP TCO</SelectItem>
                                <SelectItem value="CPDP Staff">CPDP Staff</SelectItem>
                                <SelectItem value="CPDP Patients">CPDP Patients</SelectItem>
                                <SelectItem value="CPDP Training">CPDP Training</SelectItem>
                                <SelectItem value="CPDP Network">CPDP Network</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Your selection will be reviewed by an administrator.
                        </p>
                    </div>

                    <Button
                        className="w-full gradient-primary text-white"
                        onClick={handleRoleSubmit}
                        disabled={!selectedRole || isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Continue'}
                        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Onboarding;
