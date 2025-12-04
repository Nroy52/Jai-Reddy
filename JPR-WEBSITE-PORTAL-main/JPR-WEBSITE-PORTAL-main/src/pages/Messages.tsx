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
import { Plus, Send, Users, Bell, Mail } from 'lucide-react';
import { useAuth, User as AuthUser } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  senderId: string;
  recipientType: 'individual' | 'team' | 'all';
  recipientId?: string; // user ID for individual, team tag for team
  text: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  otherUserId?: string;
  teamTag?: string;
  messages: Message[];
  lastMessage: Message;
  unreadCount: number;
}

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<AuthUser[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [recipientType, setRecipientType] = useState<'individual' | 'team'>('individual');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load approved users
  useEffect(() => {
    const usersStr = localStorage.getItem('raghava_users');
    if (usersStr) {
      const allUsers: AuthUser[] = JSON.parse(usersStr);
      const approved = allUsers.filter(u => u.status === 'approved' && u.id !== user?.id);
      setApprovedUsers(approved);
    }
  }, [user]);

  // Load messages
  useEffect(() => {
    const stored = localStorage.getItem('raghava:messages_v2');
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  // Get unique teams
  const getTeams = () => {
    const teams = new Set<string>();
    approvedUsers.forEach(u => {
      if (u.teamTag) teams.add(u.teamTag);
    });
    return Array.from(teams);
  };

  // Get conversations
  const getConversations = (): Conversation[] => {
    if (!user) return [];

    const conversations = new Map<string, Conversation>();

    messages.forEach(msg => {
      let conversationKey = '';
      let otherUserId: string | undefined;
      let teamTag: string | undefined;

      if (msg.recipientType === 'individual') {
        // Individual conversation
        if (msg.senderId === user.id) {
          conversationKey = `user-${msg.recipientId}`;
          otherUserId = msg.recipientId;
        } else if (msg.recipientId === user.id) {
          conversationKey = `user-${msg.senderId}`;
          otherUserId = msg.senderId;
        } else {
          return; // Not relevant to current user
        }
      } else if (msg.recipientType === 'team') {
        // Team conversation
        const isUserInTeam = user.teamTag === msg.recipientId;
        const isSender = msg.senderId === user.id;
        
        if (isUserInTeam || isSender) {
          conversationKey = `team-${msg.recipientId}`;
          teamTag = msg.recipientId;
        } else {
          return; // Not relevant to current user
        }
      } else if (msg.recipientType === 'all') {
        // All users conversation (CEO broadcasts)
        conversationKey = 'all-users';
      }

      if (!conversationKey) return;

      if (!conversations.has(conversationKey)) {
        conversations.set(conversationKey, {
          otherUserId,
          teamTag,
          messages: [],
          lastMessage: msg,
          unreadCount: 0
        });
      }

      const conv = conversations.get(conversationKey)!;
      conv.messages.push(msg);
      conv.lastMessage = msg;
      
      // Count unread messages (messages sent to me that I haven't read)
      if (msg.senderId !== user.id && !msg.read) {
        conv.unreadCount++;
      }
    });

    // Sort by last message timestamp
    return Array.from(conversations.values()).sort((a, b) => 
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );
  };

  const conversations = getConversations();
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const getUserName = (userId: string) => {
    const foundUser = approvedUsers.find(u => u.id === userId);
    return foundUser?.name || 'Unknown User';
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.otherUserId) {
      return getUserName(conversation.otherUserId);
    } else if (conversation.teamTag) {
      return `${conversation.teamTag} Team`;
    } else {
      return 'All Users';
    }
  };

  const markConversationAsRead = (conversation: Conversation) => {
    if (!user) return;

    const updatedMessages = messages.map(msg => {
      // Mark as read if it's in this conversation and sent to me
      if (msg.senderId !== user.id) {
        if (conversation.otherUserId && 
            ((msg.senderId === conversation.otherUserId && msg.recipientId === user.id) ||
             (msg.recipientId === conversation.otherUserId && msg.senderId === user.id))) {
          return { ...msg, read: true };
        } else if (conversation.teamTag && msg.recipientType === 'team' && msg.recipientId === conversation.teamTag) {
          return { ...msg, read: true };
        } else if (!conversation.otherUserId && !conversation.teamTag && msg.recipientType === 'all') {
          return { ...msg, read: true };
        }
      }
      return msg;
    });

    setMessages(updatedMessages);
    localStorage.setItem('raghava:messages_v2', JSON.stringify(updatedMessages));
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    markConversationAsRead(conversation);
  };

  const sendMessage = () => {
    if (!user || !selectedConversation || !messageText.trim()) return;

    const newMessage: Message = {
      id: `msg${Date.now()}`,
      senderId: user.id,
      recipientType: selectedConversation.otherUserId ? 'individual' : (selectedConversation.teamTag ? 'team' : 'all'),
      recipientId: selectedConversation.otherUserId || selectedConversation.teamTag,
      text: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    localStorage.setItem('raghava:messages_v2', JSON.stringify(updated));
    setMessageText('');

    toast({
      title: 'Message sent',
      description: `Sent to ${getConversationTitle(selectedConversation)}`
    });
  };

  const handleCreateNewMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !selectedRecipient || !messageText.trim()) return;

    let msgRecipientType: 'individual' | 'team' | 'all' = recipientType;
    let recipientId: string | undefined = selectedRecipient;

    if (selectedRecipient === 'all') {
      msgRecipientType = 'all';
      recipientId = undefined;
    }

    const newMessage: Message = {
      id: `msg${Date.now()}`,
      senderId: user.id,
      recipientType: msgRecipientType,
      recipientId,
      text: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    localStorage.setItem('raghava:messages_v2', JSON.stringify(updated));
    
    setShowNewMessage(false);
    setMessageText('');
    setSelectedRecipient('');

    toast({
      title: 'Message sent',
      description: 'Your message has been delivered'
    });
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
          {/* Conversations List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Conversations
              </CardTitle>
              <CardDescription>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-1 p-4">
                  {conversations.map((conv, idx) => (
                    <Card
                      key={idx}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedConversation === conv ? 'border-primary shadow-sm' : ''
                      }`}
                      onClick={() => handleSelectConversation(conv)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{getConversationTitle(conv)}</h4>
                          {conv.unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage.senderId === user?.id ? 'You: ' : ''}
                          {conv.lastMessage.text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(conv.lastMessage.timestamp).toLocaleDateString()} {new Date(conv.lastMessage.timestamp).toLocaleTimeString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                  {conversations.length === 0 && (
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
            {selectedConversation ? (
              <>
                <CardHeader>
                  <CardTitle>{getConversationTitle(selectedConversation)}</CardTitle>
                  <CardDescription>
                    {selectedConversation.messages.length} message{selectedConversation.messages.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[450px] mb-4 pr-4">
                    <div className="space-y-4">
                      {selectedConversation.messages.map(msg => {
                        const isOwnMessage = msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                              <div className="text-xs text-muted-foreground mb-1">
                                {getUserName(msg.senderId)} • {new Date(msg.timestamp).toLocaleString()}
                              </div>
                              <div
                                className={`p-3 rounded-lg ${
                                  isOwnMessage
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
                    <Textarea
                      placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      rows={3}
                    />
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
