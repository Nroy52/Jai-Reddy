import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type ProfileRow = {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
  team_tag?: string | null;
  status?: string | null;
};

const Profile = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [teamTag, setTeamTag] = useState('');
  const [status, setStatus] = useState('');
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [contactNumber, setContactNumber] = useState('');
  const [about, setAbout] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from<ProfileRow>('profiles')
          .select('id, email, name, role, team_tag, status')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setName(data.name || '');
        setEmail(data.email);
        setRole(data.role || '');
        setTeamTag(data.team_tag || '');
        setStatus(data.status || '');

        // Load avatar + extra contact details from localStorage
        const extras = localStorage.getItem(`raghava:profile:${user.id}`);
        if (extras) {
          const parsed = JSON.parse(extras);
          setAvatarDataUrl(parsed.avatar ?? null);
          setContactNumber(parsed.contactNumber ?? '');
          setAbout(parsed.about ?? '');
        }
      } catch (err) {
        console.error('Failed to load profile', err);
        toast({
          title: 'Error',
          description: 'Unable to load your profile right now',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleAvatarChange = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          team_tag: teamTag,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Persist local-only extras
      localStorage.setItem(`raghava:profile:${user.id}`, JSON.stringify({
        avatar: avatarDataUrl,
        contactNumber,
        about,
      }));

      toast({
        title: 'Profile updated',
        description: 'Your details have been saved'
      });
    } catch (err) {
      console.error('Failed to save profile', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unable to save profile',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">You need to be signed in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground text-lg">
            View and update your personal information, contact details, and profile photo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>Update how others see you in the portal.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-28 w-28">
                <AvatarImage src={avatarDataUrl ?? undefined} alt={name || email} />
                <AvatarFallback>{(name || email || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleAvatarChange(e.target.files?.[0])}
              />
              <p className="text-xs text-muted-foreground text-center">
                Image is stored locally on this device. Re-upload if you switch browsers or devices.
              </p>
            </CardContent>
          </Card>

          {/* Details form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Basic info pulled from your profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={saveProfile}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full-name">Full name</Label>
                    <Input
                      id="full-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="team-tag">Team / Tag</Label>
                    <Input
                      id="team-tag"
                      placeholder="e.g. Clinical, Operations"
                      value={teamTag}
                      onChange={(e) => setTeamTag(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={email} disabled />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Role</Label>
                      <Input value={role || 'Guest'} disabled />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Input value={status || 'pending'} disabled />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact-number">Contact number</Label>
                    <Input
                      id="contact-number"
                      placeholder="+1 555 000 0000"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Stored locally for quick reference.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="about">About / notes</Label>
                    <Textarea
                      id="about"
                      placeholder="Add a short note or instructions"
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
