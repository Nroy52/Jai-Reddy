import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Download, MessageSquare, Calendar, User } from 'lucide-react';
import { Task, TaskComment } from '@/lib/seed';
import { useAuth, User as AuthUser } from '@/contexts/AuthContext';
import { exportTasksCSV } from '@/lib/csv';
import { toast } from '@/hooks/use-toast';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [approvedUsers, setApprovedUsers] = useState<AuthUser[]>([]);

  // Load tasks and users
  useEffect(() => {
    const stored = localStorage.getItem('raghava:tasks');
    if (stored) {
      setTasks(JSON.parse(stored));
    }

    // Load approved users from localStorage
    const usersStr = localStorage.getItem('raghava_users');
    if (usersStr) {
      const users: AuthUser[] = JSON.parse(usersStr);
      const approved = users.filter(u => u.status === 'approved');
      setApprovedUsers(approved);
    }
  }, []);

  // Filter tasks based on role
  const getVisibleTasks = () => {
    if (!user) return [];
    
    return tasks.filter(task => {
      if (user.role === 'CEO' || user.role === 'Admin' || user.role === 'Super User') {
        return true; // See all tasks
      }
      
      if (user.role === 'Director') {
        // See tasks they created, assigned to them, or assigned to same team
        const assignee = approvedUsers.find(u => u.id === task.assigneeUserId);
        return task.createdByUserId === user.id || 
               task.assigneeUserId === user.id ||
               (assignee?.teamTag && assignee.teamTag === user.teamTag);
      }
      
      if (user.role === 'Staff') {
        // See tasks they created or assigned to them
        return task.createdByUserId === user.id || task.assigneeUserId === user.id;
      }
      
      return false;
    });
  };

  const visibleTasks = getVisibleTasks();

  const getTasksByStatus = (status: Task['status']) => {
    return visibleTasks.filter(t => t.status === status);
  };

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const newTask: Task = {
      id: `t${Date.now()}`,
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      status: 'Backlog',
      priority: formData.get('priority') as Task['priority'],
      dueDate: formData.get('dueDate') as string || undefined,
      assigneeUserId: formData.get('assigneeUserId') as string,
      createdByUserId: user.id,
      ftuId: formData.get('ftuId') as string || undefined,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [...tasks, newTask];
    setTasks(updated);
    localStorage.setItem('raghava:tasks', JSON.stringify(updated));
    setShowAddTask(false);
    toast({
      title: 'Success',
      description: 'Task created successfully'
    });
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    );
    setTasks(updated);
    localStorage.setItem('raghava:tasks', JSON.stringify(updated));
    toast({
      title: 'Updated',
      description: `Task moved to ${newStatus}`
    });
  };

  const addComment = (taskId: string) => {
    if (!user || !newComment.trim()) return;

    const comment: TaskComment = {
      id: `tc${Date.now()}`,
      authorUserId: user.id,
      text: newComment,
      createdAt: new Date().toISOString()
    };

    const updated = tasks.map(t =>
      t.id === taskId
        ? { ...t, comments: [...t.comments, comment], updatedAt: new Date().toISOString() }
        : t
    );

    setTasks(updated);
    localStorage.setItem('raghava:tasks', JSON.stringify(updated));
    setNewComment('');
    
    // Update selected task
    const updatedTask = updated.find(t => t.id === taskId);
    if (updatedTask) {
      setSelectedTask(updatedTask);
    }

    toast({
      title: 'Comment Added',
      description: 'Your comment has been posted'
    });
  };

  const getUserName = (userId: string) => {
    const user = approvedUsers.find(u => u.id === userId);
    return user ? `${user.name} — ${user.role}` : 'Unknown';
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'High': return 'default';
      case 'Med': return 'secondary';
      case 'Low': return 'outline';
    }
  };

  const StatusColumn = ({ status, title }: { status: Task['status']; title: string }) => {
    const columnTasks = getTasksByStatus(status);
    
    return (
      <div className="flex-1 min-w-[300px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              {title}
              <Badge variant="secondary">{columnTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {columnTasks.map(task => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">{task.title}</h4>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        {task.ftuId && <Badge variant="outline">{task.ftuId}</Badge>}
                      </div>
                       <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {approvedUsers.find(u => u.id === task.assigneeUserId)?.name}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        {task.comments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center text-muted-foreground py-8 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Tasks</h1>
            <p className="text-muted-foreground text-lg">Kanban board and task management</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => exportTasksCSV(visibleTasks)} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>Add a task to the board</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddTask} className="space-y-4">
                  <div>
                    <Label htmlFor="task-title">Title *</Label>
                    <Input id="task-title" name="title" required />
                  </div>
                  <div>
                    <Label htmlFor="task-desc">Description</Label>
                    <Textarea id="task-desc" name="description" rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="task-priority">Priority *</Label>
                    <Select name="priority" defaultValue="Med">
                      <SelectTrigger id="task-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Med">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="task-assignee">Assign To *</Label>
                    <Select name="assigneeUserId" required>
                      <SelectTrigger id="task-assignee">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {approvedUsers.map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} — {u.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="task-due">Due Date</Label>
                    <Input id="task-due" name="dueDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="task-ftu">FTU Code (optional)</Label>
                    <Input id="task-ftu" name="ftuId" placeholder="F1.T1" />
                  </div>
                  <Button type="submit" className="w-full">Create Task</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          <StatusColumn status="Backlog" title="Backlog" />
          <StatusColumn status="Doing" title="In Progress" />
          <StatusColumn status="Blocked" title="Blocked" />
          <StatusColumn status="Done" title="Done" />
        </div>

        {/* Task Detail Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedTask && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedTask.title}</DialogTitle>
                  <DialogDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Badge>
                      <Badge>{selectedTask.status}</Badge>
                      {selectedTask.ftuId && <Badge variant="outline">{selectedTask.ftuId}</Badge>}
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {selectedTask.description && (
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedTask.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Assigned To</Label>
                      <p className="text-sm mt-1">{getUserName(selectedTask.assigneeUserId)}</p>
                    </div>
                    <div>
                      <Label>Created By</Label>
                      <p className="text-sm mt-1">{getUserName(selectedTask.createdByUserId)}</p>
                    </div>
                    {selectedTask.dueDate && (
                      <div>
                        <Label>Due Date</Label>
                        <p className="text-sm mt-1">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Move To</Label>
                    <div className="flex gap-2 mt-2">
                      {(['Backlog', 'Doing', 'Blocked', 'Done'] as const).map(status => (
                        <Button
                          key={status}
                          variant={selectedTask.status === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            updateTaskStatus(selectedTask.id, status);
                            setSelectedTask({ ...selectedTask, status });
                          }}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-lg">Comments ({selectedTask.comments.length})</Label>
                    <div className="mt-3 space-y-3">
                      {selectedTask.comments.map(comment => (
                        <div key={comment.id} className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{getUserName(comment.authorUserId)}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 space-y-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={() => addComment(selectedTask.id)} className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Tasks;
