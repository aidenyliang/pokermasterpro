import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MailIcon, LockIcon, UserIcon, EyeIcon, EyeOffIcon } from '@/components/ui/custom/PokerIcons';
import { signUp } from '@/lib/supabase/client';
import { useGameStore } from '@/stores/gameStore';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm = ({ onToggleMode }: RegisterFormProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { setAuth } = useGameStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await signUp(email, password, username);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      if (data.user) {
        setSuccess(true);
        setAuth(
          data.user.id,
          username,
          data.user.user_metadata?.avatar_url
        );
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="w-full max-w-md mx-auto bg-gray-900/90 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-400">
              Registration Successful!
            </CardTitle>
            <CardDescription className="text-gray-400">
              Welcome to PokerMaster Pro! You can now start playing.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto bg-gray-900/90 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-400">
            Join the ultimate poker experience
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                Username
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  required
                  minLength={3}
                  maxLength={20}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm Password
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <div className="text-center text-gray-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Sign In
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RegisterForm;
