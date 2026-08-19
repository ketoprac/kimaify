import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Key, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginPage() {
  const { login, error: authError, loading } = useAuth();
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) {
      toast.error('Please enter your Kimai token.');
      setLocalError('Please enter your Kimai token.');
      return;
    }
    setSubmitting(true);
    setLocalError('');
    try {
      await login(trimmed);
      toast.success('Signed in successfully');
      navigate('/', { replace: true });
    } catch {
      toast.error('Your Kimai token is invalid or expired.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-green-soft rounded-lg mb-4">
            <Timer className="w-7 h-7 text-brand-green-dark" />
          </div>
          <h1 className="text-2xl font-semibold">Kimaify</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bulk timesheet entry for Kimai
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-base">
                <Key className="w-3.5 h-3.5 inline mr-1.5" />
                Sign In
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    setLocalError('');
                  }}
                  placeholder="Paste your Kimai API token"
                  autoFocus
                  disabled={submitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {displayError && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                  {displayError}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting || loading}
                className="w-full"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </CardContent>
          </form>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Your token is stored locally and sent directly to the Kimai API.
        </p>
      </div>
    </div>
  );
}
