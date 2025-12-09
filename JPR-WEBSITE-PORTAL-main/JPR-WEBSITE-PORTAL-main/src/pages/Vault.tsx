import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Upload, Eye, EyeOff, Search, Plus, Download, Lock, AlertTriangle, Copy, ExternalLink, Trash2, Loader2, Unlock, FileText } from 'lucide-react';
import { PasswordItem } from '@/lib/seed';
import { encryptPassword, decryptPassword } from '@/lib/crypto';
import { PasscodeGate } from '@/components/PasscodeGate';
import { exportVaultMetadataCSV, exportPasswordMetadataCSV } from '@/lib/csv';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { listVaultItems, uploadVaultFile, getVaultFileUrl, deleteVaultItem as deleteVaultItemService, VaultItem } from '@/services/vaultService';

const Vault = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'documents' | 'passwords'>('documents');
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [passwordItems, setPasswordItems] = useState<PasswordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // ... (keep state variables)
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sessionPasscode, setSessionPasscode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [ftuFilter, setFtuFilter] = useState('');
  const [revealedDocs, setRevealedDocs] = useState<Set<string>>(new Set());
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);

  // Load vault items from Supabase
  const fetchVaultItems = async () => {
    try {
      setIsLoading(true);
      const items = await listVaultItems();
      setVaultItems(items);
    } catch (error) {
      console.error('Error fetching vault items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vault items',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load password items from Supabase
  const fetchPasswordItems = async () => {
    try {
      const { data, error } = await supabase
        .from('password_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedItems: PasswordItem[] = data.map(item => ({
          id: item.id,
          title: item.title,
          username: item.username,
          url: item.url,
          passwordEnc: item.password_enc,
          tags: item.tags || [],
          ftuId: item.ftu_id,
          createdAt: item.created_at
        }));
        setPasswordItems(mappedItems);
      }
    } catch (error) {
      console.error('Error fetching password items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load passwords',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchVaultItems();
    fetchPasswordItems();
  }, []);

  // Check if session is unlocked
  useEffect(() => {
    const passcode = sessionStorage.getItem('raghava:session:passcode');
    if (passcode) {
      setIsUnlocked(true);
      setSessionPasscode(passcode);
    }
  }, []);

  const handleUnlock = (passcode: string) => {
    setIsUnlocked(true);
    setSessionPasscode(passcode);
  };

  const toggleRevealDoc = (id: string) => {
    setRevealedDocs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const revealPassword = async (item: PasswordItem) => {
    try {
      const decrypted = await decryptPassword(item.passwordEnc, sessionPasscode);
      setRevealedPasswords(prev => ({ ...prev, [item.id]: decrypted }));
      setTimeout(() => {
        setRevealedPasswords(prev => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      }, 10000); // Auto-hide after 10 seconds
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to decrypt password. Session passcode may be incorrect.',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`
    });
  };

  const handleOpenFile = async (storagePath: string) => {
    try {
      const url = await getVaultFileUrl(storagePath);
      window.open(url, '_blank');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to open file', variant: 'destructive' });
    }
  };

  const handleAddDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'doc';

    const meta = {
      title: formData.get('title') as string,
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
      ftuId: formData.get('ftuId') as string || '',
      sensitivity: formData.get('sensitivity') as string || 'Low'
    };

    try {
      if (type === 'doc' && file && file.size > 0) {
        if (file.size > 50 * 1024 * 1024) {
          toast({ title: 'Error', description: 'File too large (max 50MB)', variant: 'destructive' });
          return;
        }
        await uploadVaultFile(file, meta);
      } else {
        // Handle as Note/Text
        const value = formData.get('value') as string;
        const { error } = await supabase.from('vault_items').insert({
          user_id: user?.id,
          title: meta.title,
          type: type,
          value: value,
          tags: meta.tags,
          ftu_id: meta.ftuId,
          sensitivity: meta.sensitivity
        });
        if (error) throw error;
      }

      setShowAddDoc(false);
      toast({ title: 'Success', description: 'Item added to vault' });
      fetchVaultItems();
    } catch (error) {
      console.error('Error saving item:', error);
      const description = error instanceof Error ? error.message : 'Failed to save item';
      toast({ title: 'Error', description, variant: 'destructive' });
    }
  };

  const handleAddPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const plainPassword = formData.get('password') as string;

    try {
      const encrypted = await encryptPassword(plainPassword, sessionPasscode);

      const newPasswordData = {
        title: formData.get('title') as string,
        username: formData.get('username') as string || null,
        url: formData.get('url') as string || null,
        password_enc: encrypted,
        tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
        ftu_id: formData.get('ftuId') as string || null,
        created_by: user.id
      };

      const { error } = await supabase
        .from('password_items')
        .insert([newPasswordData]);

      if (error) throw error;

      setShowAddPassword(false);
      toast({
        title: 'Success',
        description: 'Password encrypted and saved'
      });
      fetchPasswordItems();
    } catch (error) {
      console.error('Error saving password:', error);
      toast({
        title: 'Error',
        description: 'Failed to encrypt/save password',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteItem = async (id: string, storagePath?: string | null) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteVaultItemService(id, storagePath);
        toast({ title: 'Deleted', description: 'Item removed' });
        fetchVaultItems();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete item', variant: 'destructive' });
      }
    }
  };

  const deletePasswordItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this password?')) {
      try {
        const { error } = await supabase
          .from('password_items')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({ title: 'Deleted', description: 'Password removed from vault' });
        fetchPasswordItems();
      } catch (error) {
        console.error('Error deleting password item:', error);
        toast({ title: 'Error', description: 'Failed to delete password', variant: 'destructive' });
      }
    }
  };

  // Filtering
  const allTags = Array.from(new Set([
    ...vaultItems.flatMap(item => item.tags),
    ...passwordItems.flatMap(item => item.tags)
  ]));

  const filteredVaultItems = vaultItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesTag = tagFilter === 'all' || (item.tags && item.tags.includes(tagFilter));
    const matchesFtu = !ftuFilter || (item.ftu_id || item.ftu_id)?.toLowerCase().includes(ftuFilter.toLowerCase());
    return matchesSearch && matchesType && matchesTag && matchesFtu;
  });

  const filteredPasswordItems = passwordItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = tagFilter === 'all' || item.tags.includes(tagFilter);
    const matchesFtu = !ftuFilter || item.ftuId?.toLowerCase().includes(ftuFilter.toLowerCase());
    return matchesSearch && matchesTag && matchesFtu;
  });

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-screen font-sans text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header: Vault Title + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-navy rounded-xl shadow-lg shadow-navy/20">
              <Lock className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy dark:text-slate-100 tracking-tight">Vault</h1>
              <p className="text-slate-500 text-sm font-medium">Secure Document & Password Storage</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-slate-200 focus:border-navy focus:ring-navy/20 rounded-xl"
              />
            </div>
            {/* Tab Toggle for Mobile/Desktop if needed, or just keep simple */}
            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'documents' ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-navy'}`}
              >
                Files
              </button>
              <button
                onClick={() => setActiveTab('passwords')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'passwords' ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-navy'}`}
              >
                Passwords
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">

          {/* 1. Status Card */}
          <Card className={`border-none shadow-sm overflow-hidden transition-all duration-300 ${!isUnlocked ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-cyan-50 dark:bg-cyan-950/30'}`}>
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-6">
                <div className="flex items-center gap-4 w-full">
                  <div className={`p-3 rounded-full shrink-0 ${!isUnlocked ? 'bg-amber-100/80 text-amber-600' : 'bg-cyan-100/80 text-cyan-600'}`}>
                    {!isUnlocked ? <Lock className="h-6 w-6" /> : <Unlock className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {!isUnlocked ? 'Vault is Locked' : 'Vault is Unlocked'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {!isUnlocked ? 'Content is encrypted and hidden.' : 'Protected by your session passcode.'}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  {!isUnlocked ? (
                    <Button
                      onClick={() => setShowPasscode(true)}
                      className="w-full sm:w-auto bg-navy text-white hover:bg-navy-light shadow-lg shadow-navy/20 border-none px-6 py-5 text-base font-semibold"
                    >
                      Enter Passcode
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowPasscode(true)}
                      className="w-full sm:w-auto border-2 border-gold text-navy hover:bg-gold/10 font-semibold"
                    >
                      Change Passcode
                    </Button>
                  )}
                </div>
              </div>


            </CardContent>
          </Card>

          {/* 2. Upload / Add Area */}
          {isUnlocked && (
            <div className="animate-fade-in">
              {activeTab === 'documents' ? (
                <div
                  onClick={() => setShowAddDoc(true)}
                  className="group cursor-pointer bg-slate-50 hover:bg-white border-2 border-dashed border-slate-200 hover:border-navy/30 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300"
                >
                  <div className="bg-navy text-white p-4 rounded-full shadow-xl shadow-navy/20 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-navy">Upload encrypted file</h3>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                    <Shield className="h-3 w-3" />
                    Files are encrypted with AES-256 before storage
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => setShowAddPassword(true)}
                  className="group cursor-pointer bg-slate-50 hover:bg-white border-2 border-dashed border-slate-200 hover:border-navy/30 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300"
                >
                  <div className="bg-navy text-white p-4 rounded-full shadow-xl shadow-navy/20 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-navy">Add new password</h3>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                    <Lock className="h-3 w-3" />
                    Credentials encrypted securely
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. List Area */}
          {isUnlocked && (
            <div className="animate-slide-up space-y-4">
              {activeTab === 'documents' ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                  {/* Table Header (Desktop) */}
                  <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-5 pl-2">File Name</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-2">Added On</div>
                    <div className="col-span-2">Tag</div>
                    <div className="col-span-1"></div>
                  </div>

                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredVaultItems.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No documents found.</p>
                      </div>
                    ) : (
                      filteredVaultItems.map(item => (
                        <div key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          {/* Mobile Card */}
                          <div className="md:hidden p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-navy">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                    <span>{(item.file_size ? (item.file_size / 1024).toFixed(1) + ' KB' : 'Note')}</span>
                                    <span>•</span>
                                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              {item.tags?.[0] && (
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase">
                                  {item.tags[0]}
                                </span>
                              )}
                            </div>
                            <div className="mt-4 flex items-center justify-end gap-2">
                              {item.storage_path ? (
                                <Button size="sm" variant="outline" className="w-full text-navy border-slate-200" onClick={() => handleOpenFile(item.storage_path!)}>
                                  Open
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="w-full" onClick={() => toggleRevealDoc(item.id)}>
                                  Reveal
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteItem(item.id, item.storage_path)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Desktop Row */}
                          <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center">
                            <div className="col-span-5 flex items-center gap-4 pl-2">
                              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-navy transition-colors">
                                {item.type === 'doc' ? <FileText className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100">{item.title}</p>
                                <p className="text-xs text-slate-400">{item.file_type || 'Secure Note'}</p>
                              </div>
                            </div>
                            <div className="col-span-2 text-sm font-medium text-slate-600">
                              {item.file_size ? (item.file_size / 1024).toFixed(1) + ' KB' : '-'}
                            </div>
                            <div className="col-span-2 text-sm font-medium text-slate-600">
                              {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </div>
                            <div className="col-span-2">
                              {item.tags?.[0] ? (
                                <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none px-2 py-0.5 font-semibold">
                                  {item.tags[0]}
                                </Badge>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </div>
                            <div className="col-span-1 flex justify-end gap-2 pr-2 opacity-50 group-hover:opacity-100 transition-opacity">
                              {item.storage_path ? (
                                <Button size="sm" variant="outline" className="h-8 px-3 text-xs font-bold text-navy border-slate-200 hover:bg-slate-50" onClick={() => handleOpenFile(item.storage_path!)}>
                                  Open
                                </Button>
                              ) : (
                                <Button size="sm" variant="ghost" onClick={() => toggleRevealDoc(item.id)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600" onClick={() => handleDeleteItem(item.id, item.storage_path)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                  {/* Password List */}
                  <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-4 pl-2">Title</div>
                    <div className="col-span-3">Username</div>
                    <div className="col-span-3">URL</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredPasswordItems.map(item => (
                      <div key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center">
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                            <Lock className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{item.title}</span>
                        </div>
                        <div className="col-span-3 text-sm text-slate-600 truncate hidden md:block">{item.username || '-'}</div>
                        <div className="col-span-3 text-sm text-blue-600 truncate hidden md:block">
                          {item.url ? (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                              {new URL(item.url).hostname} <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : '-'}
                        </div>
                        <div className="col-span-12 md:col-span-2 flex justify-end gap-2 mt-2 md:mt-0">
                          {revealedPasswords[item.id] ? (
                            <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded">
                              <code className="text-xs font-mono select-all">{revealedPasswords[item.id]}</code>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => copyToClipboard(revealedPasswords[item.id], 'Password')}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => revealPassword(item)}>
                              Reveal
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500" onClick={() => deletePasswordItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hidden Dialogs Handling (Keep existing dialogs but make sure triggers work) */}
          <Dialog open={showAddDoc} onOpenChange={setShowAddDoc}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Secure Document</DialogTitle>
                <DialogDescription>
                  Upload a file or add a secure note. Files are stored in encrypted storage.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddDocument} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="doc-file">File (Max 50MB) - Recommended</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input id="doc-file" type="file" name="file" className="cursor-pointer" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Uploads are stored in secure Supabase Storage.</p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or add legacy note</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="doc-title">Title</Label>
                  <Input id="doc-title" name="title" required placeholder="Project Alpha Specs" />
                </div>
                <div>
                  <Label htmlFor="doc-value">Content / Note</Label>
                  <Textarea id="doc-value" name="value" placeholder="Enter secure notes here..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doc-type">Type</Label>
                    <Select name="type" defaultValue="doc">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doc">Document</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="doc-sensitivity">Sensitivity</Label>
                    <Select name="sensitivity" defaultValue="Medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="doc-tags">Tags (comma-separated)</Label>
                  <Input id="doc-tags" name="tags" placeholder="urgent, legal, v1" />
                </div>
                <div>
                  <Label htmlFor="doc-ftu">FTU Code (optional)</Label>
                  <Input id="doc-ftu" name="ftuId" placeholder="F1.T2" />
                </div>
                <Button type="submit" className="w-full bg-navy hover:bg-navy-light text-white">Encrypt & Save</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddPassword} onOpenChange={setShowAddPassword}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Password</DialogTitle>
                <DialogDescription>Store credentials securely.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPassword} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="pwd-title">Title</Label>
                  <Input id="pwd-title" name="title" required placeholder="Github Login" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pwd-username">Username</Label>
                    <Input id="pwd-username" name="username" placeholder="user@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="pwd-password">Password</Label>
                    <Input id="pwd-password" name="password" required type="password" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pwd-url">URL</Label>
                  <Input id="pwd-url" name="url" placeholder="https://..." />
                </div>
                <div>
                  <Label htmlFor="pwd-tags">Tags (comma-separated)</Label>
                  <Input id="pwd-tags" name="tags" placeholder="tag1, tag2" />
                </div>
                <div>
                  <Label htmlFor="pwd-ftu">FTU Code (optional)</Label>
                  <Input id="pwd-ftu" name="ftuId" placeholder="F1.T1" />
                </div>
                <Button type="submit" className="w-full bg-navy hover:bg-navy-light text-white">Encrypt & Save</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showPasscode} onOpenChange={setShowPasscode}>
            <DialogContent>
              <PasscodeGate
                onUnlock={(code) => {
                  setSessionPasscode(code);
                  setIsUnlocked(true);
                  setShowPasscode(false);
                  // re-encrypt/decrypt logic if needed in real app
                }}
                onCancel={() => setShowPasscode(false)}
              />
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </div>
  );
};

export default Vault;
