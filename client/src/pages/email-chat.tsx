import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, EmailThread, EmailMessage } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, User, Bot, Plus, AlertTriangle, Paperclip, X } from "lucide-react";
import { format } from "date-fns";
import { VoiceInput } from "@/components/voice-input";
import { Badge } from "@/components/ui/badge";

export default function EmailChat() {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    // Restore last-used project from localStorage
    return localStorage.getItem("emailChat:lastProjectId") || "";
  });
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [attachments, setAttachments] = useState<Array<{file: File, base64: string}>>([]);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [showNewThreadDialog, setShowNewThreadDialog] = useState(false);
  const [newThreadTo, setNewThreadTo] = useState("");
  const [newThreadSubject, setNewThreadSubject] = useState("");
  const [newThreadBody, setNewThreadBody] = useState("");

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Auto-select first project if none selected or saved project doesn't exist
  useEffect(() => {
    if ((!selectedProjectId || !projects.find((p: Project) => p.id === selectedProjectId)) && projects.length > 0) {
      const firstProjectId = projects[0].id;
      setSelectedProjectId(firstProjectId);
      localStorage.setItem("emailChat:lastProjectId", firstProjectId);
    }
  }, [projects, selectedProjectId]);

  const { data: emailSettings } = useQuery<{ agentEmail: string } | null>({
    queryKey: [`/api/projects/${selectedProjectId}/email-settings`],
    enabled: !!selectedProjectId,
  });

  const { data: threads = [], isLoading: threadsLoading } = useQuery<EmailThread[]>({
    queryKey: [`/api/projects/${selectedProjectId}/email-threads`],
    enabled: !!selectedProjectId,
  });

  // Auto-populate agent email when email settings are available
  useEffect(() => {
    if (emailSettings?.agentEmail) {
      setNewThreadTo(emailSettings.agentEmail);
    } else {
      setNewThreadTo("");
    }
  }, [emailSettings]);

  const { data: messages = [] } = useQuery<EmailMessage[]>({
    queryKey: [`/api/email-threads/${selectedThreadId}/messages`],
    enabled: !!selectedThreadId,
  });

  const sendEmailMutation = useMutation({
    mutationFn: async ({ subject, body, attachments: emailAttachments }: { subject: string; body: string; attachments?: Array<{filename: string; contentType: string; content: string}> }) => {
      const thread = threads.find(t => t.id === selectedThreadId);
      if (!thread) throw new Error("Thread not found");

      // Ensure subject is not empty (guard against null, undefined, and empty string)
      const emailSubject = thread.subject?.trim() || "Re: Conversation";

      return await apiRequest("POST", `/api/projects/${selectedProjectId}/send-email`, {
        to: thread.agentEmail,
        subject: emailSubject,
        body,
        attachments: emailAttachments,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/email-threads/${selectedThreadId}/messages`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/email-threads`] });
      setMessageInput("");
      setAttachments([]);
      toast({
        title: "Message sent",
        description: "Your email has been sent to the agent",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const createThreadMutation = useMutation({
    mutationFn: async ({ to, subject, body }: { to: string; subject: string; body: string }) => {
      return await apiRequest("POST", `/api/projects/${selectedProjectId}/send-email`, {
        to,
        subject,
        body,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/email-threads`] });
      setShowNewThreadDialog(false);
      setNewThreadTo("");
      setNewThreadSubject("");
      setNewThreadBody("");
      if (data.thread?.id) {
        setSelectedThreadId(data.thread.id);
      }
      toast({
        title: "Conversation started",
        description: "Your message has been sent to the agent",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || sendEmailMutation.isPending) return;
    const thread = threads.find(t => t.id === selectedThreadId);
    
    const emailAttachments = attachments.map(att => ({
      filename: att.file.name,
      contentType: att.file.type || 'application/octet-stream',
      content: att.base64.split(',')[1], // Remove data:mime;base64, prefix
    }));
    
    sendEmailMutation.mutate({
      subject: thread?.subject?.trim() || "Re: Conversation",
      body: messageInput,
      attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        continue;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [...prev, {
          file,
          base64: reader.result as string,
        }]);
      };
      reader.readAsDataURL(file);
    }
    
    // Reset input
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Update localStorage when project selection changes
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    localStorage.setItem("emailChat:lastProjectId", projectId);
    setSelectedThreadId(null); // Clear thread selection when changing projects
    
    // Auto-populate agent email from project settings
    queryClient.fetchQuery({
      queryKey: [`/api/projects/${projectId}/email-settings`],
    }).then((settings: any) => {
      if (settings?.agentEmail) {
        setNewThreadTo(settings.agentEmail);
      }
    }).catch(() => {
      // Email settings not configured for this project
      setNewThreadTo("");
    });
  };

  const selectedThread = threads.find(t => t.id === selectedThreadId);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Email Chat</h1>
            <p className="text-sm text-muted-foreground">
              Communicate with project agents via email
            </p>
          </div>
          {selectedProjectId && (
            <Dialog open={showNewThreadDialog} onOpenChange={setShowNewThreadDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-conversation">
                  <Plus className="w-4 h-4 mr-2" />
                  New Conversation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {!emailSettings?.agentEmail && (
                    <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-500">Email settings not configured</p>
                        <p className="text-muted-foreground mt-1">
                          Go to Email Settings to configure an agent email address for this project.
                        </p>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Agent Email</label>
                    <Input
                      placeholder="agent@agentmail.triadblue.com"
                      value={newThreadTo}
                      onChange={(e) => setNewThreadTo(e.target.value)}
                      data-testid="input-new-thread-to"
                      readOnly={!!emailSettings?.agentEmail}
                    />
                    {emailSettings?.agentEmail && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Using email from project settings
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      placeholder="Enter subject"
                      value={newThreadSubject}
                      onChange={(e) => setNewThreadSubject(e.target.value)}
                      data-testid="input-new-thread-subject"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <div className="relative">
                      <Textarea
                        placeholder="Type your message..."
                        rows={5}
                        value={newThreadBody}
                        onChange={(e) => setNewThreadBody(e.target.value)}
                        data-testid="textarea-new-thread-body"
                      />
                      <div className="absolute bottom-2 right-2">
                        <VoiceInput
                          onTranscript={(text) => setNewThreadBody(prev => prev ? `${prev} ${text}` : text)}
                          variant="ghost"
                          size="icon"
                          continuous={true}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (newThreadTo && newThreadSubject && newThreadBody) {
                        createThreadMutation.mutate({
                          to: newThreadTo,
                          subject: newThreadSubject,
                          body: newThreadBody,
                        });
                      }
                    }}
                    disabled={!newThreadTo || !newThreadSubject || !newThreadBody || createThreadMutation.isPending}
                    data-testid="button-send-new-conversation"
                  >
                    {createThreadMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={selectedProjectId} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-64" data-testid="select-project">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {sendEmailMutation.error && (
          <div className="mt-2 text-sm text-destructive" data-testid="text-send-error">
            {(sendEmailMutation.error as any)?.message || "Failed to send message"}
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-medium">Email Threads</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {threadsLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading threads...
                </div>
              ) : threads.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No email threads yet. Start a new conversation!
                </div>
              ) : (
                threads.map((thread) => (
                  <Card
                    key={thread.id}
                    className={`p-3 cursor-pointer hover-elevate ${selectedThreadId === thread.id ? "bg-accent" : ""}`}
                    onClick={() => setSelectedThreadId(thread.id)}
                    data-testid={`thread-${thread.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">{thread.subject}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {thread.agentEmail}
                        </div>
                      </div>
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    {thread.hasActionableItems && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Action items detected</span>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col">
          {!selectedThreadId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Select a thread to view messages</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b">
                <h2 className="font-medium">{selectedThread?.subject}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedThread?.agentEmail}
                </p>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isSent = message.direction === "sent";
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isSent ? "justify-end" : ""}`}
                        data-testid={`message-${message.id}`}
                      >
                        {!isSent && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                        <div className={`flex flex-col ${isSent ? "items-end" : ""} max-w-[70%]`}>
                          <Card className={`p-3 ${isSent ? "bg-primary text-primary-foreground" : ""}`}>
                            <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                          </Card>
                          <span className="text-xs text-muted-foreground mt-1">
                            {format(new Date(message.createdAt), "MMM d, h:mm a")}
                          </span>
                        </div>
                        {isSent && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="p-4 border-t space-y-2">
                {interimTranscript && (
                  <div className="p-2 bg-muted/50 rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground italic">
                      Listening: {interimTranscript}...
                    </p>
                  </div>
                )}
                
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((attachment, index) => (
                      <Badge key={index} variant="secondary" className="gap-2">
                        <Paperclip className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{attachment.file.name}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeAttachment(index)}
                          data-testid={`button-remove-attachment-${index}`}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="email-file-input"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    data-testid="input-file"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => document.getElementById('email-file-input')?.click()}
                    disabled={sendEmailMutation.isPending}
                    data-testid="button-attach-file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !sendEmailMutation.isPending) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    disabled={sendEmailMutation.isPending}
                    data-testid="input-message"
                  />
                  <VoiceInput
                    onTranscript={(text) => {
                      setMessageInput(prev => prev ? `${prev} ${text}` : text);
                      setInterimTranscript("");
                    }}
                    onInterimTranscript={(text) => setInterimTranscript(text)}
                    variant="outline"
                    size="icon"
                    continuous={true}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sendEmailMutation.isPending}
                    data-testid="button-send"
                  >
                    {sendEmailMutation.isPending ? (
                      <span className="text-xs">Sending...</span>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
