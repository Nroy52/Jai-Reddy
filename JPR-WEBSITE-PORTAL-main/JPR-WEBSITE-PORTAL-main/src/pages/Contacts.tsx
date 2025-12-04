import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { exportContactsCSV } from '@/lib/csv';
import { Contact, UserRole } from '@/lib/seed';
import { Search, UserPlus, Download, Mail, Phone, Building2, Tag, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'raghava:contacts';

const Contacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    email: '',
    role: 'Staff',
    department: '',
    org: '',
    phone: '',
    tags: [],
    notes: '',
    ftuId: '',
  });

  // Load contacts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setContacts(JSON.parse(stored));
    }
  }, []);

  // Save contacts to localStorage
  const saveContacts = (newContacts: Contact[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newContacts));
    setContacts(newContacts);
  };

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    contacts.forEach(c => c.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [contacts]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesRole = roleFilter === 'all' || contact.role === roleFilter;
      const matchesTag = tagFilter === 'all' || contact.tags.includes(tagFilter);
      
      return matchesSearch && matchesRole && matchesTag;
    });
  }, [contacts, searchQuery, roleFilter, tagFilter]);

  const handleAddContact = () => {
    // Validate
    if (!formData.name?.trim() || !formData.email?.trim()) {
      toast.error('Name and email are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Invalid email format');
      return;
    }

    // Check for duplicate email
    if (contacts.some(c => c.email === formData.email && c.id !== editingContact?.id)) {
      toast.error('Contact with this email already exists');
      return;
    }

    if (editingContact) {
      // Update existing
      const updated = contacts.map(c => 
        c.id === editingContact.id 
          ? { ...formData, id: c.id, createdAt: c.createdAt } as Contact
          : c
      );
      saveContacts(updated);
      toast.success('Contact updated successfully');
    } else {
      // Add new
      const newContact: Contact = {
        ...formData,
        id: `c${Date.now()}`,
        name: formData.name!,
        email: formData.email!,
        role: (formData.role || 'Staff') as UserRole,
        tags: formData.tags || [],
        createdAt: new Date().toISOString(),
      } as Contact;
      saveContacts([...contacts, newContact]);
      toast.success('Contact added successfully');
    }

    // Reset form
    setFormData({
      name: '',
      email: '',
      role: 'Staff',
      department: '',
      org: '',
      phone: '',
      tags: [],
      notes: '',
      ftuId: '',
    });
    setEditingContact(null);
    setIsAddDialogOpen(false);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setFormData(contact);
    setIsAddDialogOpen(true);
  };

  const handleDeleteContact = (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      saveContacts(contacts.filter(c => c.id !== id));
      toast.success('Contact deleted');
    }
  };

  const handleExportCSV = () => {
    exportContactsCSV(filteredContacts);
    toast.success('Contacts exported to CSV');
  };

  const handleTagInput = (value: string) => {
    const tags = value.split(',').map(t => t.trim()).filter(Boolean);
    setFormData({ ...formData, tags });
  };

  const openExplorer = (ftuId: string) => {
    navigate(`/explorer?ftu=${ftuId}`);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Contacts</h1>
          <p className="text-muted-foreground text-lg">Manage your organization directory</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>Contact Directory</CardTitle>
                <CardDescription>Rolodex-style contact management ({filteredContacts.length} contacts)</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (!open) {
                    setEditingContact(null);
                    setFormData({
                      name: '',
                      email: '',
                      role: 'Staff',
                      department: '',
                      org: '',
                      phone: '',
                      tags: [],
                      notes: '',
                      ftuId: '',
                    });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary text-white">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
                      <DialogDescription>
                        {editingContact ? 'Update contact information' : 'Enter contact details below'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CEO">CEO</SelectItem>
                              <SelectItem value="Director">Director</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Staff">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone || ''}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1-555-0000"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            value={formData.department || ''}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            placeholder="Engineering"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="org">Organization</Label>
                          <Input
                            id="org"
                            value={formData.org || ''}
                            onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                            placeholder="Acme Corp"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          value={formData.tags?.join(', ') || ''}
                          onChange={(e) => handleTagInput(e.target.value)}
                          placeholder="Finance, Leadership, Advisor"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ftuId">FTU ID (optional)</Label>
                        <Input
                          id="ftuId"
                          value={formData.ftuId || ''}
                          onChange={(e) => setFormData({ ...formData, ftuId: e.target.value })}
                          placeholder="F1.T2.U3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes || ''}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Additional notes..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddContact}>
                        {editingContact ? 'Update' : 'Add'} Contact
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, email, or tags..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Filter by Role</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="CEO">CEO</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Filter by Tag</Label>
                  <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className="w-[160px]">
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
              </div>
            </div>

            {filteredContacts.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No contacts found. {contacts.length === 0 ? 'Add your first contact to get started.' : 'Try adjusting your filters.'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredContacts.map((contact) => (
                  <div 
                    key={contact.id} 
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-lg">{contact.name}</h3>
                          <Badge variant="outline">{contact.role}</Badge>
                          {contact.ftuId && (
                            <Badge 
                              variant="secondary" 
                              className="cursor-pointer hover:bg-secondary/80"
                              onClick={() => openExplorer(contact.ftuId!)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {contact.ftuId}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <a href={`mailto:${contact.email}`} className="hover:text-primary">
                              {contact.email}
                            </a>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <a href={`tel:${contact.phone}`} className="hover:text-primary">
                                {contact.phone}
                              </a>
                            </div>
                          )}
                          {contact.department && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building2 className="h-4 w-4" />
                              {contact.department}
                              {contact.org && ` • ${contact.org}`}
                            </div>
                          )}
                        </div>

                        {contact.tags.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            {contact.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {contact.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {contact.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditContact(contact)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contacts;
