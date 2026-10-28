import { useState, useCallback } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LogOut, Timer, Moon, Sun, Menu, PanelLeft, Settings } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Sidebar } from './sidebar/Sidebar';
import { SettingsModal } from './SettingsModal';
import { useSidebarData, pushRecentCombination } from './sidebar/useSidebarData';
import type { PresetSelection } from './sidebar/sidebarTypes';
import type { Timesheet } from '../types';

const COLLAPSED_KEY = 'kimaify_sidebar_collapsed';

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  const [allTimesheets, setAllTimesheets] = useState<Timesheet[]>([]);
  const sidebarData = useSidebarData(allTimesheets);

  const [selectedPreset, setSelectedPreset] = useState<PresetSelection | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = useCallback(() => {
    setCollapsed(v => {
      const next = !v;
      try { localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleSelectPreset = useCallback((preset: PresetSelection) => {
    setSelectedPreset(preset);
    if (preset.customerId && preset.projectId && preset.activityId) {
      pushRecentCombination({ customerId: preset.customerId, projectId: preset.projectId, activityId: preset.activityId });
    }
    setDrawerOpen(false);
  }, []);

  const handleClearSelectedPreset = useCallback(() => {
    setSelectedPreset(null);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              aria-label="Open sidebar"
              aria-controls="sidebar-drawer"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex h-8 w-8"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={toggleCollapsed}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
              <Timer className="w-6 h-6 text-brand-green-dark" />
              Kimaify
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-green-dark text-white text-sm font-medium">
                  {user.alias.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {user.alias}
                </span>
              </div>
            )}
            <Button
              onClick={() => setSettingsOpen(true)}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              onClick={toggle}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
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

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <aside
          className={`hidden lg:flex flex-col border-r bg-card overflow-y-auto transition-all duration-200 ${collapsed ? 'w-14' : 'w-[280px]'} flex-shrink-0`}
          aria-label="Sidebar"
        >
          {collapsed ? (
            <div className="flex flex-col items-center gap-1 py-3">
              <span className="text-[10px] text-muted-foreground">Menu</span>
            </div>
          ) : (
            <Sidebar
              loading={sidebarData.loading}
              error={sidebarData.error}
              combinations={sidebarData.recentCombinations}
              selectedPreset={selectedPreset}
              onSelectPreset={handleSelectPreset}
              onRetry={() => sidebarData.reload(true)}
            />
          )}
        </aside>

        {/* Mobile drawer */}
        <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DialogContent
            id="sidebar-drawer"
            aria-label="Sidebar navigation"
            className="p-0 gap-0 w-[85vw] max-w-[320px] h-[100dvh] left-0 top-0 translate-x-0 translate-y-0 rounded-none border-r overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
          >
            <DialogTitle className="sr-only">Navigation</DialogTitle>
            <div className="p-2 pt-8">
              <Sidebar
                loading={sidebarData.loading}
                error={sidebarData.error}
                combinations={sidebarData.recentCombinations}
                selectedPreset={selectedPreset}
                onSelectPreset={handleSelectPreset}
                onRetry={() => sidebarData.reload(true)}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings modal */}
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

        <main className="flex-1 min-w-0 max-w-7xl mx-auto px-4 py-6">
          <Outlet
            context={{
              refs: sidebarData.customers.length || sidebarData.projects.length || sidebarData.activities.length
                ? { customers: sidebarData.customers, projects: sidebarData.projects, activities: sidebarData.activities }
                : null,
              lookups: sidebarData.lookups,
              refetchRefs: sidebarData.refetch,
              loading: sidebarData.loading,
              error: sidebarData.error,
              selectedPreset,
              onClearSelectedPreset: handleClearSelectedPreset,
              setAllTimesheetsForSidebar: setAllTimesheets,
            }}
          />
        </main>
      </div>
    </div>
  );
}
