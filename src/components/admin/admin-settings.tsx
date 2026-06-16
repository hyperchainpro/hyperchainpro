'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Globe,
  Shield,
  Palette,
  ToggleLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface SettingRecord {
  key: string;
  value: string;
  type: string;
  group: string;
}

const DEFAULT_SETTINGS: Record<string, { value: string; type: string; group: string }> = {
  'app.name': { value: 'BranchBoard', type: 'string', group: 'general' },
  'app.description': { value: 'A Figma-like design tool for teams', type: 'string', group: 'general' },
  'app.logo_url': { value: '', type: 'string', group: 'general' },
  'feature.community': { value: 'true', type: 'boolean', group: 'features' },
  'feature.ai_features': { value: 'true', type: 'boolean', group: 'features' },
  'feature.exports': { value: 'true', type: 'boolean', group: 'features' },
  'branding.primary_color': { value: '#6366f1', type: 'string', group: 'branding' },
  'branding.accent_color': { value: '#8b5cf6', type: 'string', group: 'branding' },
  'security.max_login_attempts': { value: '5', type: 'number', group: 'security' },
  'security.session_timeout': { value: '3600', type: 'number', group: 'security' },
};

function toBool(v: string): boolean {
  return v === 'true' || v === '1';
}

function fromBool(v: boolean): string {
  return v ? 'true' : 'false';
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, string> = {};
        (data.settings as SettingRecord[]).forEach((s) => {
          map[s.key] = s.value;
        });
        setSettings(map);
      } else {
        setError('Failed to load settings. Using defaults.');
        const map: Record<string, string> = {};
        Object.entries(DEFAULT_SETTINGS).forEach(([key, val]) => {
          map[key] = val.value;
        });
        setSettings(map);
      }
    } catch {
      setError('Network error. Using defaults.');
      const map: Record<string, string> = {};
      Object.entries(DEFAULT_SETTINGS).forEach(([key, val]) => {
        map[key] = val.value;
      });
      setSettings(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(settings).map(([key, value]) => {
        const def = DEFAULT_SETTINGS[key];
        return {
          key,
          value,
          type: def?.type || 'string',
          group: def?.group || 'general',
        };
      });

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: entries }),
      });

      if (res.ok) {
        toast.success('Settings saved successfully');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to save settings');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const map: Record<string, string> = {};
    Object.entries(DEFAULT_SETTINGS).forEach(([key, val]) => {
      map[key] = val.value;
    });
    setSettings(map);
    toast.info('Settings reset to defaults (not saved)');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure system-wide settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2 neu-flat border-0">
            <RotateCcw className="size-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving} className="neu-raised gap-2">
            <Save className="size-4" />
            {saving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="neu-card p-4 border-l-4 border-amber-400">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="neu-flat rounded-lg bg-background border-0 w-full sm:w-auto">
          <TabsTrigger value="general" className="gap-1.5">
            <Settings className="size-3.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-1.5">
            <ToggleLeft className="size-3.5" />
            Features
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-1.5">
            <Palette className="size-3.5" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Shield className="size-3.5" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-4">
          <div className="neu-card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">General Settings</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">App Name</Label>
                <Input
                  id="app-name"
                  value={settings['app.name'] || ''}
                  onChange={(e) => updateSetting('app.name', e.target.value)}
                  className="neu-input border-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-logo">Logo URL</Label>
                <Input
                  id="app-logo"
                  value={settings['app.logo_url'] || ''}
                  onChange={(e) => updateSetting('app.logo_url', e.target.value)}
                  placeholder="https://..."
                  className="neu-input border-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-desc">Description</Label>
              <Input
                id="app-desc"
                value={settings['app.description'] || ''}
                onChange={(e) => updateSetting('app.description', e.target.value)}
                className="neu-input border-0"
              />
            </div>
          </div>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features" className="mt-4">
          <div className="neu-card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <ToggleLeft className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Feature Flags</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Community</p>
                  <p className="text-xs text-muted-foreground">Enable community design sharing and browsing</p>
                </div>
                <Switch
                  checked={toBool(settings['feature.community'] || 'true')}
                  onCheckedChange={(v) => updateSetting('feature.community', fromBool(v))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">AI Features</p>
                  <p className="text-xs text-muted-foreground">Enable AI-powered design generation</p>
                </div>
                <Switch
                  checked={toBool(settings['feature.ai_features'] || 'true')}
                  onCheckedChange={(v) => updateSetting('feature.ai_features', fromBool(v))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Exports</p>
                  <p className="text-xs text-muted-foreground">Allow users to export designs as PNG, SVG, PDF</p>
                </div>
                <Switch
                  checked={toBool(settings['feature.exports'] || 'true')}
                  onCheckedChange={(v) => updateSetting('feature.exports', fromBool(v))}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding" className="mt-4">
          <div className="neu-card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Branding</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color" className="flex items-center gap-2">
                  Primary Color
                  <div
                    className="size-4 rounded-full border border-border"
                    style={{ backgroundColor: settings['branding.primary_color'] || '#6366f1' }}
                  />
                </Label>
                <Input
                  id="primary-color"
                  value={settings['branding.primary_color'] || '#6366f1'}
                  onChange={(e) => updateSetting('branding.primary_color', e.target.value)}
                  className="neu-input border-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accent-color" className="flex items-center gap-2">
                  Accent Color
                  <div
                    className="size-4 rounded-full border border-border"
                    style={{ backgroundColor: settings['branding.accent_color'] || '#8b5cf6' }}
                  />
                </Label>
                <Input
                  id="accent-color"
                  value={settings['branding.accent_color'] || '#8b5cf6'}
                  onChange={(e) => updateSetting('branding.accent_color', e.target.value)}
                  className="neu-input border-0"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-4">
          <div className="neu-card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Security</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-login">Max Login Attempts</Label>
                <Input
                  id="max-login"
                  type="number"
                  value={settings['security.max_login_attempts'] || '5'}
                  onChange={(e) => updateSetting('security.max_login_attempts', e.target.value)}
                  className="neu-input border-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (seconds)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings['security.session_timeout'] || '3600'}
                  onChange={(e) => updateSetting('security.session_timeout', e.target.value)}
                  className="neu-input border-0"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
