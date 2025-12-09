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
import { Search, UserPlus, Download, Mail, Phone, Building2, Tag, Edit2, Trash2, ExternalLink, Loader2, Globe, Briefcase, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const Contacts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [ftuFilter, setFtuFilter] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  // Load contacts from Supabase
  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const mappedContacts: Contact[] = data.map(item => ({
          id: item.id,
          name: item.name,
          email: item.email,
          role: item.role as UserRole,
          department: item.department,
          org: item.org,
          phone: item.phone,
          tags: item.tags || [],
          notes: item.notes,
          ftuId: item.ftu_id,
          createdAt: item.created_at,
        }));
        setContacts(mappedContacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

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
      const matchesFtu = !ftuFilter || contact.ftuId?.toLowerCase().includes(ftuFilter.toLowerCase());

      return matchesSearch && matchesRole && matchesTag && matchesFtu;
    });
  }, [contacts, searchQuery, roleFilter, tagFilter, ftuFilter]);

  const handleAddContact = async () => {
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

    setIsSaving(true);

    try {
      if (editingContact) {
        // Update existing
        const { error } = await supabase
          .from('contacts')
          .update({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            department: formData.department,
            org: formData.org,
            phone: formData.phone,
            tags: formData.tags,
            notes: formData.notes,
            ftu_id: formData.ftuId,
          })
          .eq('id', editingContact.id);

        if (error) throw error;
        toast.success('Contact updated successfully');
      } else {
        // Add new
        const { error } = await supabase
          .from('contacts')
          .insert([{
            name: formData.name,
            email: formData.email,
            role: formData.role,
            department: formData.department,
            org: formData.org,
            phone: formData.phone,
            tags: formData.tags,
            notes: formData.notes,
            ftu_id: formData.ftuId,
            created_by: user?.id
          }]);

        if (error) throw error;
        toast.success('Contact added successfully');
      }

      // Refresh list
      await fetchContacts();

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
    } catch (error) {
      console.error('Error saving contact:', error);
      const message = error instanceof Error ? error.message : 'Failed to save contact';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setFormData(contact);
    setIsAddDialogOpen(true);
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success('Contact deleted');
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast.error('Failed to delete contact');
      }
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

  const ALL_ROLES: UserRole[] = [
    'Super User', 'CEO', 'Director', 'Managing Director', 'Admin', 'Staff',
    'IT Team', 'Family and Friends', 'CPDP Manager', 'CPDP TCO', 'CPDP Staff',
    'CPDP Patients', 'CPDP Training', 'CPDP Network', 'Guest', 'Manager',
    'Consultant', 'Partner'
  ];

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-screen font-sans text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-navy rounded-xl shadow-lg shadow-navy/20">
              <UserPlus className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy dark:text-slate-100 tracking-tight">Contacts</h1>
              <p className="text-slate-500 text-sm font-medium">Directory & Network</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportCSV} className="hidden md:flex">
              <Download className="h-4 w-4 mr-2" />
              Export
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
                <Button className="bg-navy hover:bg-navy-light text-white shadow-lg shadow-navy/20">
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* ... (Keep existing form content, it works fine) ... */}
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
                          {ALL_ROLES.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
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
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddContact} className="bg-navy text-white hover:bg-navy-light">{editingContact ? 'Update' : 'Add'} Contact</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content - Two Pane */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">

          {/* LEFT: List Pane */}
          <div className={`md:w-1/3 flex flex-col gap-4 ${selectedContact && 'hidden md:flex'}`}>

            {/* Search Bar */}
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-slate-200 focus:border-navy focus:ring-navy/20 rounded-xl shadow-sm"
              />
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-7 text-xs w-auto min-w-[100px] border-slate-200 bg-white rounded-lg">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {ALL_ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="h-7 text-xs w-auto min-w-[100px] border-slate-200 bg-white rounded-lg">
                    <SelectValue placeholder="Tag" />
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

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-navy" /></div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center p-8 text-slate-400 text-sm">No contacts found</div>
              ) : (
                filteredContacts.map(contact => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group relative
                          ${selectedContact?.id === contact.id
                        ? 'bg-white border-l-4 border-l-gold border-y-slate-100 border-r-slate-100 shadow-md transform scale-[1.02]'
                        : 'bg-white border-slate-200 hover:border-navy/30 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-bold ${selectedContact?.id === contact.id ? 'text-navy' : 'text-slate-800'}`}>
                          {contact.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          {contact.role} {contact.org && `• ${contact.org}`}
                        </p>
                      </div>
                      {/* Initials Avatar */}
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold
                             ${selectedContact?.id === contact.id ? 'bg-navy text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                        {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {contact.ftuId && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                          {contact.ftuId}
                        </span>
                      )}
                      {contact.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] border border-slate-200">
                          {tag}
                        </span>
                      ))}
                      {contact.tags.length > 2 && (
                        <span className="text-[10px] text-slate-400">+{contact.tags.length - 2}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* RIGHT: Detail Pane */}
          {selectedContact ? (
            <div className="md:w-2/3 bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden flex flex-col md:flex">
              {/* Mobile Back Button */}
              <div className="md:hidden p-4 border-b border-slate-100 flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedContact(null)}>← Back</Button>
                <span className="font-bold">Contact Details</span>
              </div>

              <div className="p-8 pb-4 border-b border-slate-50 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-navy to-slate-800 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-navy/20">
                      {selectedContact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-navy">{selectedContact.name}</h2>
                      <p className="text-slate-500 font-medium text-lg mt-1">{selectedContact.role}</p>
                      {selectedContact.org && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                          <Briefcase className="h-4 w-4" />
                          {selectedContact.department ? `${selectedContact.department}, ` : ''}{selectedContact.org}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditContact(selectedContact)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteContact(selectedContact.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-6">
                  {selectedContact.ftuId && (
                    <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white border-none py-1 px-3 text-sm">
                      <span className="opacity-70 mr-2">Focus</span>
                      {selectedContact.ftuId}
                    </Badge>
                  )}
                  {selectedContact.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-white border border-slate-200 text-slate-600">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto">

                {/* Contact Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-navy">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                      <a href={`mailto:${selectedContact.email}`} className="text-navy font-medium hover:underline block truncate mt-1">
                        {selectedContact.email}
                      </a>
                      <Button size="sm" variant="link" className="px-0 h-auto mt-1 text-gold hover:text-navy" onClick={() => window.location.href = `mailto:${selectedContact.email}`}>
                        Send Email →
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-navy">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                      <p className="text-navy font-medium mt-1">
                        {selectedContact.phone || 'No phone number'}
                      </p>
                      {selectedContact.phone && (
                        <Button size="sm" variant="link" className="px-0 h-auto mt-1 text-gold hover:text-navy" onClick={() => window.location.href = `tel:${selectedContact.phone}`}>
                          Call Now →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Linked Actions */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Linked Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-gold/50 cursor-pointer transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-slate-700">View Active Tasks</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-gold" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-gold/50 cursor-pointer transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-slate-700">View Vault Documents</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-gold" />
                    </div>
                  </div>
                </div>

                {selectedContact.notes && (
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-100/50">
                    <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Notes
                    </h3>
                    <p className="text-amber-900/80 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedContact.notes}
                    </p>
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* Empty State Right Pane (Desktop) */
            <div className="hidden md:flex md:w-2/3 bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200 items-center justify-center text-slate-400 flex-col gap-4">
              <div className="p-6 bg-white rounded-full shadow-sm">
                <UserPlus className="h-12 w-12 text-slate-300" />
              </div>
              <p className="font-medium">Select a contact to view details</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Contacts;
