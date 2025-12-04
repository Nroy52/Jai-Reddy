import { SignUp } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-10" />

      <div className="w-full max-w-md relative z-10 animate-fade-in flex flex-col items-center">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors self-start">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        <SignUp
          signInUrl="/login"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
};

export default Signup;
