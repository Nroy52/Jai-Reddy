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
import { Shield, Upload, Eye, EyeOff, Search, Plus, Download, Lock, AlertTriangle, Copy, ExternalLink, Trash2 } from 'lucide-react';
import { VaultItem, PasswordItem } from '@/lib/seed';
import { encryptPassword, decryptPassword } from '@/lib/crypto';
import { PasscodeGate } from '@/components/PasscodeGate';
import { exportVaultMetadataCSV, exportPasswordMetadataCSV } from '@/lib/csv';
import { toast } from '@/hooks/use-toast';

const Vault = () => {
  const [activeTab, setActiveTab] = useState<'documents' | 'passwords'>('documents');
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [passwordItems, setPasswordItems] = useState<PasswordItem[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sessionPasscode, setSessionPasscode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [revealedDocs, setRevealedDocs] = useState<Set<string>>(new Set());
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Load vault items
  useEffect(() => {
    const stored = localStorage.getItem('raghava:vault:items');
    if (stored) {
      setVaultItems(JSON.parse(stored));
    }
  }, []);

  // Load password items
  useEffect(() => {
    const stored = localStorage.getItem('raghava:pm:items');
    if (stored) {
      setPasswordItems(JSON.parse(stored));
    }
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

  const handleAddDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    
    if (file && file.size > 1048576) {
      toast({
        title: 'Error',
        description: 'File must be 1MB or less',
        variant: 'destructive'
      });
      return;
    }

    let value = formData.get('value') as string;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        value = reader.result as string;
        saveDocument(formData, value);
      };
      reader.readAsDataURL(file);
    } else {
      saveDocument(formData, value);
    }
  };

  const saveDocument = (formData: FormData, value: string) => {
    const newDoc: VaultItem = {
      id: `v${Date.now()}`,
      title: formData.get('title') as string,
      type: formData.get('type') as 'doc' | 'note',
      value,
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
      ftuId: formData.get('ftuId') as string || undefined,
      sensitivity: formData.get('sensitivity') as 'Low' | 'Medium' | 'High',
      createdAt: new Date().toISOString()
    };

    const updated = [...vaultItems, newDoc];
    setVaultItems(updated);
    localStorage.setItem('raghava:vault:items', JSON.stringify(updated));
    setShowAddDoc(false);
    toast({
      title: 'Success',
      description: 'Document added to vault'
    });
  };

  const handleAddPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const plainPassword = formData.get('password') as string;

    try {
      const encrypted = await encryptPassword(plainPassword, sessionPasscode);
      
      const newPassword: PasswordItem = {
        id: `p${Date.now()}`,
        title: formData.get('title') as string,
        username: formData.get('username') as string || undefined,
        url: formData.get('url') as string || undefined,
        passwordEnc: encrypted,
        tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
        ftuId: formData.get('ftuId') as string || undefined,
        createdAt: new Date().toISOString()
      };

      const updated = [...passwordItems, newPassword];
      setPasswordItems(updated);
      localStorage.setItem('raghava:pm:items', JSON.stringify(updated));
      setShowAddPassword(false);
      toast({
        title: 'Success',
        description: 'Password encrypted and saved'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to encrypt password',
        variant: 'destructive'
      });
    }
  };

  const deleteVaultItem = (id: string) => {
    const updated = vaultItems.filter(item => item.id !== id);
    setVaultItems(updated);
    localStorage.setItem('raghava:vault:items', JSON.stringify(updated));
    toast({ title: 'Deleted', description: 'Document removed from vault' });
  };

  const deletePasswordItem = (id: string) => {
    const updated = passwordItems.filter(item => item.id !== id);
    setPasswordItems(updated);
    localStorage.setItem('raghava:pm:items', JSON.stringify(updated));
    toast({ title: 'Deleted', description: 'Password removed from vault' });
  };

  // Filtering
  const allTags = Array.from(new Set([
    ...vaultItems.flatMap(item => item.tags),
    ...passwordItems.flatMap(item => item.tags)
  ]));

  const filteredVaultItems = vaultItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesTag = tagFilter === 'all' || item.tags.includes(tagFilter);
    return matchesSearch && matchesType && matchesTag;
  });

  const filteredPasswordItems = passwordItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = tagFilter === 'all' || item.tags.includes(tagFilter);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Demo Mode:</strong> This vault is for demonstration purposes only. Do not store real sensitive data or passwords.
          </AlertDescription>
        </Alert>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Vault</h1>
          </div>
          <p className="text-muted-foreground text-lg">Secure document and password storage</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'documents' | 'passwords')}>
          <TabsList className="mb-6">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="passwords">
              <Lock className="h-4 w-4 mr-2" />
              Passwords
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                {activeTab === 'documents' && (
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="doc">Documents</SelectItem>
                        <SelectItem value="note">Notes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="tag">Tag</Label>
                  <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger id="tag">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {allTags.map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  {activeTab === 'documents' && (
                    <>
                      <Button onClick={() => exportVaultMetadataCSV(filteredVaultItems)} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Dialog open={showAddDoc} onOpenChange={setShowAddDoc}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Document</DialogTitle>
                            <DialogDescription>Upload a file or create a note (max 1MB)</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddDocument} className="space-y-4">
                            <div>
                              <Label htmlFor="doc-title">Title *</Label>
                              <Input id="doc-title" name="title" required />
                            </div>
                            <div>
                              <Label htmlFor="doc-type">Type *</Label>
                              <Select name="type" defaultValue="doc">
                                <SelectTrigger id="doc-type">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="doc">Document</SelectItem>
                                  <SelectItem value="note">Note</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="doc-file">Upload File (optional)</Label>
                              <Input id="doc-file" name="file" type="file" />
                            </div>
                            <div>
                              <Label htmlFor="doc-value">Content</Label>
                              <Textarea id="doc-value" name="value" rows={4} placeholder="Enter content..." />
                            </div>
                            <div>
                              <Label htmlFor="doc-sensitivity">Sensitivity *</Label>
                              <Select name="sensitivity" defaultValue="Low">
                                <SelectTrigger id="doc-sensitivity">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Low">Low</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="doc-tags">Tags (comma-separated)</Label>
                              <Input id="doc-tags" name="tags" placeholder="tag1, tag2" />
                            </div>
                            <div>
                              <Label htmlFor="doc-ftu">FTU Code (optional)</Label>
                              <Input id="doc-ftu" name="ftuId" placeholder="F1.T1" />
                            </div>
                            <Button type="submit" className="w-full">Add Document</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                  {activeTab === 'passwords' && isUnlocked && (
                    <>
                      <Button onClick={() => exportPasswordMetadataCSV(filteredPasswordItems)} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Dialog open={showAddPassword} onOpenChange={setShowAddPassword}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Password</DialogTitle>
                            <DialogDescription>Store an encrypted password</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddPassword} className="space-y-4">
                            <div>
                              <Label htmlFor="pwd-title">Title *</Label>
                              <Input id="pwd-title" name="title" required />
                            </div>
                            <div>
                              <Label htmlFor="pwd-username">Username</Label>
                              <Input id="pwd-username" name="username" />
                            </div>
                            <div>
                              <Label htmlFor="pwd-url">URL</Label>
                              <Input id="pwd-url" name="url" type="url" placeholder="https://" />
                            </div>
                            <div>
                              <Label htmlFor="pwd-password">Password *</Label>
                              <Input id="pwd-password" name="password" type="password" required />
                            </div>
                            <div>
                              <Label htmlFor="pwd-tags">Tags (comma-separated)</Label>
                              <Input id="pwd-tags" name="tags" placeholder="tag1, tag2" />
                            </div>
                            <div>
                              <Label htmlFor="pwd-ftu">FTU Code (optional)</Label>
                              <Input id="pwd-ftu" name="ftuId" placeholder="F1.T1" />
                            </div>
                            <Button type="submit" className="w-full">Encrypt & Save</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <TabsContent value="documents">
            <div className="grid gap-4">
              {filteredVaultItems.map(item => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge variant={item.type === 'doc' ? 'default' : 'secondary'}>{item.type}</Badge>
                          <Badge variant={
                            item.sensitivity === 'High' ? 'destructive' :
                            item.sensitivity === 'Medium' ? 'default' : 'secondary'
                          }>
                            {item.sensitivity}
                          </Badge>
                          {item.tags.map(tag => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                          {item.ftuId && <Badge variant="outline">{item.ftuId}</Badge>}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteVaultItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item.sensitivity === 'High' && !revealedDocs.has(item.id) ? (
                      <Button variant="outline" onClick={() => toggleRevealDoc(item.id)} className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Click to Reveal (Session Only)
                      </Button>
                    ) : (
                      <div>
                        {item.sensitivity === 'High' && (
                          <Button variant="ghost" size="sm" onClick={() => toggleRevealDoc(item.id)} className="mb-2">
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide
                          </Button>
                        )}
                        <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto">
                          {item.value.startsWith('data:') ? (
                            <a href={item.value} download className="text-primary hover:underline flex items-center gap-2">
                              <Download className="h-4 w-4" />
                              Download File
                            </a>
                          ) : (
                            <pre className="whitespace-pre-wrap">{item.value}</pre>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {filteredVaultItems.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No documents found. Add your first document to get started.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="passwords">
            {!isUnlocked ? (
              <PasscodeGate onUnlock={handleUnlock} />
            ) : (
              <div className="grid gap-4">
                {filteredPasswordItems.map(item => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            {item.username && <span className="text-sm">@{item.username}</span>}
                            {item.tags.map(tag => (
                              <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                            {item.ftuId && <Badge variant="outline">{item.ftuId}</Badge>}
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deletePasswordItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {item.url && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {item.url}
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {revealedPasswords[item.id] ? (
                            <>
                              <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                                {revealedPasswords[item.id]}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(revealedPasswords[item.id], 'Password')}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => revealPassword(item)}
                              className="w-full"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Reveal Password (10s)
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredPasswordItems.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No passwords found. Add your first password to get started.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Vault;
