import { Link, Outlet } from 'react-router-dom';
import { LogOut, Timer } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from './ui/button';

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <Timer className="w-6 h-6 text-brand-green-dark" />
            Kimaify
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.alias}
              </span>
            )}
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
