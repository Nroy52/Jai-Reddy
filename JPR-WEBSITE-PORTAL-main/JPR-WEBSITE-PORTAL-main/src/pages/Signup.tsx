import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Guest');
  const [isLoading, setIsLoading] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const ALL_ROLES: UserRole[] = [
    'Super User', 'CEO', 'Director', 'Managing Director', 'Admin', 'Staff',
    'IT Team', 'Family and Friends', 'CPDP Manager', 'CPDP TCO', 'CPDP Staff',
    'CPDP Patients', 'CPDP Training', 'CPDP Network', 'Guest', 'Manager',
    'Consultant', 'Partner'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      await signUp(email, password, name, role);
      toast.success('Account created successfully!');
      navigate('/pending');
    } catch (error: any) {
      toast.error(error?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-10" />

      <div className="absolute top-4 right-4 z-20">
        <Button variant="ghost" size="sm" onClick={() => setShowPolicy(true)} className="text-xs">
          Privacy & Terms
        </Button>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in flex flex-col items-center">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors self-start">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        <Card className="w-full border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full gradient-primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      {showPolicy && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30 px-4">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl border p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Privacy Policy</h3>
                <p className="text-sm text-muted-foreground">
                  We collect only the data needed to operate this portal (your account details and in-app activity). Data is encrypted in transit and at rest.
                  You may request access or deletion of your records through our support channel.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowPolicy(false)}>Close</Button>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Terms & Conditions</h3>
              <p className="text-sm text-muted-foreground">
                Access is for authorized stakeholders only. By continuing, you agree to confidentiality, appropriate use of shared materials,
                and compliance with applicable regulations. Access may be suspended for misuse or security concerns.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Last updated: Jan 2025</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
