import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useSEO } from '@/hooks/useSEO';
import { supabase } from '@/integrations/supabase/client';
import { addToast } from '@heroui/react';
import { ArrowLeft, Bell, Download, Shield, Upload, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // SEO optimization
  useSEO({
    title: "Settings | Syncopy",
    description: "Manage your Syncopy account settings, preferences, and privacy options. Customize your clipboard experience.",
    url: "https://syncopy.app/settings",
    noindex: true, // Settings page is private
    nofollow: true
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        display_name: displayName.trim() || null,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      addToast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        color: 'success',
        variant: 'solid',
        timeout: 5000,
      })

      await fetchProfile();
    } catch (error: any) {
      error('Error updating profile', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      addToast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
        color: 'success',
        variant: 'solid',
        timeout: 5000,
      })
      navigate('/');
    } catch (error: any) {
      addToast({
        title: 'Error signing out',
        description: error.message,
        color: 'danger',
        variant: 'solid',
        timeout: 5000,
      })
    }
  };

  const exportData = async () => {
    if (!user) return;

    try {
      // Fetch all user data
      const [itemsResult, boardsResult] = await Promise.all([
        supabase
          .from('clipboard_items')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('boards')
          .select('*')
          .eq('user_id', user.id)
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        items: itemsResult.data || [],
        boards: boardsResult.data || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `syncopy-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast({
        title: 'Data exported',
        description: 'Your data has been exported successfully.',
        color: 'success',
        variant: 'solid',
        timeout: 5000,  
      })
    } catch (error: any) {
      addToast({
        title: 'Export failed',
        description: error.message,
        color: 'danger',
        variant: 'solid',
        timeout: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="flex h-16 items-center px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile
              </CardTitle>
              <CardDescription>
                Manage your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed at this time.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <Button
                onClick={updateProfile}
                disabled={loading}
                className="bg-gradient-hero text-white"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* App Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Preferences
              </CardTitle>
              <CardDescription>
                Customize your Syncopy experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Desktop Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when clips are added or updated.
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save to Default Board</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save new clips to your default board.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Clipboard Preview</Label>
                  <p className="text-sm text-muted-foreground">
                    Display a preview of clipboard content before saving.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Data Management
              </CardTitle>
              <CardDescription>
                Export your data or manage your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={exportData}
                  variant="outline"
                  className="flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center"
                  disabled
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data (Coming Soon)
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-destructive">Danger Zone</h4>
                <p className="text-sm text-muted-foreground">
                  These actions cannot be undone. Please be careful.
                </p>
                
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;