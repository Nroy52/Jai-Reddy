import { SignIn } from '@clerk/clerk-react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-10" />

      <div className="w-full max-w-md relative z-10 animate-fade-in flex justify-center">
        <SignIn
          signUpUrl="/signup"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
};

export default Login;
