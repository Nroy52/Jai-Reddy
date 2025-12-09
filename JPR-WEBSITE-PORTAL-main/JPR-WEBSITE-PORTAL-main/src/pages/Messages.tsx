import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Send, Users, Bell, Mail, Loader2 } from 'lucide-react';
import { useAuth, User as AuthUser } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
  ftuId?: string;
}

interface Thread {
  id: string;
  title?: string;
  type: 'individual' | 'team' | 'all';
  recipientId?: string; // user ID or team tag
  participantIds: string[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

const Messages = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvedUsers, setApprovedUsers] = useState<AuthUser[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [recipientType, setRecipientType] = useState<'individual' | 'team'>('individual');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [ftuId, setFtuId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load approved users
  // Load approved users
  useEffect(() => {
    const loadUsers = async () => {
      // Fetch users from Supabase (using direct query or context)
      // Since we want all approved users to populate the picker
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, role, team_tag, status');

        if (data) {
          const mappedUsers: AuthUser[] = data
            .filter(u => u.status === 'approved' && u.id !== user?.id)
            .map(u => ({
              id: u.id,
              name: u.name || u.email || 'Unknown',
              email: u.email,
              role: u.role as any,
              teamTag: u.team_tag,
              status: u.status as any,
              signupDate: new Date().toISOString() // Not critical here
            }));
          setApprovedUsers(mappedUsers);
        }
      } catch (err) {
        console.error('Failed to load users for directory', err);
      }
    };

    if (user) {
      loadUsers();
    }
  }, [user]);

  // Load threads and messages from Supabase
  const fetchThreads = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Fetch threads where user is a participant OR type is 'all' OR (type is 'team' and user tag matches)
      // Supabase filter for arrays is tricky, so we'll fetch most and filter client side or use specific query
      // For now, let's fetch all threads and filter client side for simplicity in this demo migration
      // In production, use RLS and more specific queries

      const { data: threadsData, error } = await supabase
        .from('message_threads')
        .select(`
          *,
          messages (*)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (threadsData) {
        const mappedThreads: Thread[] = threadsData.map(t => {
          const msgs = (t.messages || []).map((m: any) => ({
            id: m.id,
            senderId: m.sender_id,
            text: m.text,
            timestamp: m.timestamp,
            read: true, // TODO: Implement read status in DB
            ftuId: t.ftu_id // Inherit from thread for now or need message specific FTU
          })).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

          return {
            id: t.id,
            title: t.title,
            type: t.type || 'individual',
            recipientId: t.recipient_id,
            participantIds: t.participant_ids || [],
            messages: msgs,
            lastMessage: msgs[msgs.length - 1],
            unreadCount: 0, // TODO: Implement unread count
            updatedAt: t.updated_at
          };
        });

        // Filter relevant threads
        const relevantThreads = mappedThreads.filter(t => {
          if (t.type === 'all') return true;
          if (t.type === 'team') return t.recipientId === user.teamTag;
          return t.participantIds.includes(user.id);
        });

        setThreads(relevantThreads);

        // Update selected thread if it exists
        if (selectedThread) {
          const updatedSelected = relevantThreads.find(t => t.id === selectedThread.id);
          if (updatedSelected) setSelectedThread(updatedSelected);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedThread?.messages]);

  // Get unique teams
  const getTeams = () => {
    // Start with default teams
    const teams = new Set<string>(['Leadership', 'Clinical', 'Operations', 'Admin', 'HR', 'IT', 'Finance']);

    approvedUsers.forEach(u => {
      // Add explicit team tags
      if (u.teamTag) teams.add(u.teamTag);
      // ALSO ADD ROLES AS TEAMS
      if (u.role) teams.add(u.role);
    });

    return Array.from(teams).sort();
  };

  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  const getUserName = (userId: string) => {
    if (userId === user?.id) return 'You';
    const foundUser = approvedUsers.find(u => u.id === userId);
    return foundUser?.name || 'Unknown User';
  };

  const getThreadTitle = (thread: Thread) => {
    if (thread.type === 'individual') {
      const otherId = thread.participantIds.find(id => id !== user?.id);
      return otherId ? getUserName(otherId) : 'Just You';
    } else if (thread.type === 'team') {
      return `${thread.recipientId} Team`;
    } else {
      return 'All Users';
    }
  };

  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread);
    // TODO: Mark as read in DB
  };

  const sendMessage = async () => {
    if (!user || !selectedThread || !messageText.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          thread_id: selectedThread.id,
          sender_id: user.id,
          text: messageText,
          timestamp: new Date().toISOString()
        }]);

      if (error) throw error;

      // Update thread timestamp
      await supabase
        .from('message_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedThread.id);

      setMessageText('');
      setFtuId('');
      fetchThreads();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  const handleCreateNewMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !selectedRecipient || !messageText.trim()) return;

    let msgRecipientType: 'individual' | 'team' | 'all' = recipientType;
    let recipientId: string | undefined = selectedRecipient;
    let participantIds: string[] = [user.id];

    if (selectedRecipient === 'all') {
      msgRecipientType = 'all';
      recipientId = undefined;
      // All users are participants effectively
    } else if (msgRecipientType === 'individual') {
      participantIds.push(selectedRecipient);
    } else if (msgRecipientType === 'team') {
      recipientId = selectedRecipient;

      // FINDS ALL USERS IN THIS TEAM/ROLE AND ADDS THEM AS PARTICIPANTS
      const teamMembers = approvedUsers.filter(u =>
        u.role === selectedRecipient ||
        u.teamTag === selectedRecipient ||
        // Handle special mapping if needed, e.g. "IT" matches "IT Team"
        (selectedRecipient === 'IT' && u.role === 'IT Team') ||
        (selectedRecipient === 'HR' && u.role === 'Admin') // Example mapping
      );

      const memberIds = teamMembers.map(u => u.id);
      // Remove duplicates
      participantIds = Array.from(new Set([...participantIds, ...memberIds]));
    }

    try {
      // Check if thread exists
      let threadId: string | null = null;

      // Simple client-side check for now (ideal: server-side or complex query)
      const existingThread = threads.find(t => {
        if (t.type !== msgRecipientType) return false;
        if (msgRecipientType === 'individual') {
          return t.participantIds.includes(selectedRecipient) && t.participantIds.includes(user.id);
        }
        if (msgRecipientType === 'team') {
          return t.recipientId === selectedRecipient;
        }
        return true; // 'all'
      });

      if (existingThread) {
        threadId = existingThread.id;
      } else {
        // Create new thread
        const { data: newThread, error: threadError } = await supabase
          .from('message_threads')
          .insert([{
            type: msgRecipientType,
            recipient_id: recipientId,
            participant_ids: participantIds,
            ftu_id: ftuId || null,
            title: msgRecipientType === 'individual' ? null : (msgRecipientType === 'team' ? `${recipientId} Team` : 'All Users')
          }])
          .select()
          .single();

        if (threadError) throw threadError;
        threadId = newThread.id;
      }

      if (threadId) {
        const { error: msgError } = await supabase
          .from('messages')
          .insert([{
            thread_id: threadId,
            sender_id: user.id,
            text: messageText,
            timestamp: new Date().toISOString()
          }]);

        if (msgError) throw msgError;

        setShowNewMessage(false);
        setMessageText('');
        setSelectedRecipient('');
        setFtuId('');
        fetchThreads();

        toast({
          title: 'Message sent',
          description: 'Your message has been delivered'
        });
      }
    } catch (error) {
      console.error('Error creating message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Messages</h1>
            <p className="text-muted-foreground text-lg">Direct and group messaging</p>
          </div>
          <div className="flex items-center gap-4">
            {totalUnread > 0 && (
              <Badge variant="destructive" className="px-3 py-1">
                <Bell className="h-4 w-4 mr-1" />
                {totalUnread} unread
              </Badge>
            )}
            <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                  <DialogDescription>Send a message to a user or team</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateNewMessage} className="space-y-4">
                  <div>
                    <Label htmlFor="recipient-type">Send To</Label>
                    <Select value={recipientType} onValueChange={(val) => setRecipientType(val as 'individual' | 'team')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual User</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="recipient">Recipient *</Label>
                    <Select value={selectedRecipient} onValueChange={setSelectedRecipient} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient..." />
                      </SelectTrigger>
                      <SelectContent>
                        {recipientType === 'individual' ? (
                          <>
                            {user?.role === 'CEO' && (
                              <SelectItem value="all">All Users</SelectItem>
                            )}
                            {approvedUsers.map(u => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name} - {u.role}
                              </SelectItem>
                            ))}
                          </>
                        ) : (
                          getTeams().map(team => (
                            <SelectItem key={team} value={team}>
                              {team} Team
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ftu-code">FTU Code (optional)</Label>
                    <Input
                      id="ftu-code"
                      placeholder="F1.T1"
                      value={ftuId}
                      onChange={(e) => setFtuId(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-message-text">Message *</Label>
                    <Textarea
                      id="new-message-text"
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Threads List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Conversations
              </CardTitle>
              <CardDescription>{threads.length} conversation{threads.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-1 p-4">
                  {threads.map((thread) => (
                    <Card
                      key={thread.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${selectedThread?.id === thread.id ? 'border-primary shadow-sm' : ''
                        }`}
                      onClick={() => handleSelectThread(thread)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{getThreadTitle(thread)}</h4>
                          {thread.unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {thread.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {thread.lastMessage?.senderId === user?.id ? 'You: ' : ''}
                          {thread.lastMessage?.text}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            {thread.lastMessage && new Date(thread.lastMessage.timestamp).toLocaleDateString()} {thread.lastMessage && new Date(thread.lastMessage.timestamp).toLocaleTimeString()}
                          </p>
                          {thread.lastMessage?.ftuId && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                              {thread.lastMessage.ftuId}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {threads.length === 0 && (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                      No messages yet. Start a new conversation!
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message View */}
          <Card className="md:col-span-2">
            {selectedThread ? (
              <>
                <CardHeader>
                  <CardTitle>{getThreadTitle(selectedThread)}</CardTitle>
                  <CardDescription>
                    {selectedThread.messages.length} message{selectedThread.messages.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[450px] mb-4 pr-4">
                    <div className="space-y-4">
                      {selectedThread.messages.map(msg => {
                        const isOwnMessage = msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2 justify-end">
                                {msg.ftuId && (
                                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                                    {msg.ftuId}
                                  </Badge>
                                )}
                                {getUserName(msg.senderId)} • {new Date(msg.timestamp).toLocaleString()}
                              </div>
                              <div
                                className={`p-3 rounded-lg ${isOwnMessage
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                                  }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="FTU (opt)"
                        className="w-24"
                        value={ftuId}
                        onChange={(e) => setFtuId(e.target.value)}
                      />
                      <Textarea
                        placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        rows={3}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={sendMessage} disabled={!messageText.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="py-24 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view messages</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
