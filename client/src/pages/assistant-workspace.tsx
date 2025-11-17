import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, EmailThread, EmailMessage } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, User, Bot, Paperclip, X } from "lucide-react";
import { format } from "date-fns";
import { VoiceInput } from "@/components/voice-input";
import { PageShell } from "@/components/layout/page-shell";

export default function AssistantWorkspace() {
  const { toast } = useToast();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [attachments, setAttachments] = useState<Array<{file: File, base64: string}>>([]);
  const [interimTranscript, setInterimTranscript] = useState("");

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch ALL email threads across ALL projects
  const { data: allThreadsData = [], isLoading: threadsLoading } = useQuery<{
    projectId: string;
    projectName: string;
    projectColor: string;
    threads: EmailThread[];
  }[]>({
    queryKey: ["/api/assistant/all-threads"],
    queryFn: async () => {
      const results = await Promise.all(
        projects.map(async (project) => {
          try {
            const threads = await fetch(`/api/projects/${project.id}/email-threads`, {
              credentials: "include",
            }).then(res => res.ok ? res.json() : []);
            
            return {
              projectId: project.id,
              projectName: project.name,
              projectColor: project.color,
              threads: threads || [],
            };
          } catch {
            return {
              projectId: project.id,
              projectName: project.name,
              projectColor: project.color,
              threads: [],
            };
          }
        })
      );
      return results.filter(r => r.threads.length > 0);
    },
    enabled: projects.length > 0,
  });

  // Flatten all threads for display
  const allThreads = allThreadsData.flatMap(project => 
    project.threads.map(thread => ({
      ...thread,
      projectName: project.projectName,
      projectColor: project.projectColor,
      projectId: project.projectId,
    }))
  ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  const selectedThread = allThreads.find(t => t.id === selectedThreadId);

  const { data: messages = [] } = useQuery<EmailMessage[]>({
    queryKey: [`/api/email-threads/${selectedThreadId}/messages`],
    enabled: !!selectedThreadId,
  });

  // Handle file attachment selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (attachments.length + files.length > 10) {
      toast({
        title: "Too many files",
        description: "Maximum 10 files per email",
        variant: "destructive",
      });
      return;
    }

    const newAttachments = await Promise.all(
      files.map(async (file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 10MB limit`,
            variant: "destructive",
          });
          return null;
        }

        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(file);
        });

        return { file, base64 };
      })
    );

    setAttachments([...attachments, ...newAttachments.filter(Boolean) as Array<{file: File, base64: string}>]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const sendEmailMutation = useMutation({
    mutationFn: async ({ body, attachments: emailAttachments }: { 
      body: string; 
      attachments?: Array<{filename: string; contentType: string; content: string}> 
    }) => {
      if (!selectedThreadId) throw new Error("No thread selected");

      return apiRequest("POST", `/api/email-threads/${selectedThreadId}/reply`, {
        body,
        attachments: emailAttachments,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/email-threads/${selectedThreadId}/messages`] });
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/all-threads"] });
      setMessageInput("");
      setAttachments([]);
      toast({
        title: "Email sent",
        description: "Your reply has been sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send email",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!messageInput.trim() || !selectedThreadId) return;

    const emailAttachments = attachments.map(att => ({
      filename: att.file.name,
      contentType: att.file.type,
      content: att.base64,
    }));

    sendEmailMutation.mutate({
      body: messageInput,
      attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
    });
  };

  return (
    <PageShell>
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Assistant Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Email monitoring across all projects
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden min-w-0">
        {/* Thread List */}
        <div className="basis-80 lg:basis-96 max-w-sm border-r flex flex-col flex-shrink-0">
          <div className="p-4 border-b">
            <h2 className="font-semibold">All Email Threads</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {allThreads.length} conversation{allThreads.length !== 1 ? 's' : ''}
            </p>
          </div>

          <ScrollArea className="flex-1">
            {threadsLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : allThreads.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No email threads found</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {allThreads.map((thread) => (
                  <Card
                    key={thread.id}
                    className={`cursor-pointer transition-colors hover-elevate ${
                      selectedThreadId === thread.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedThreadId(thread.id)}
                    data-testid={`thread-card-${thread.id}`}
                  >
                    <CardHeader className="p-3 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              style={{ backgroundColor: thread.projectColor }}
                              className="text-white text-xs"
                            >
                              {thread.projectName}
                            </Badge>
                          </div>
                          <CardTitle className="text-sm line-clamp-1">
                            {thread.subject}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {thread.agentEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{format(new Date(thread.lastMessageAt), 'MMM d, h:mm a')}</span>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message View */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {!selectedThread ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a thread to view messages</p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    style={{ backgroundColor: selectedThread.projectColor }}
                    className="text-white"
                  >
                    {selectedThread.projectName}
                  </Badge>
                </div>
                <h2 className="font-semibold">{selectedThread.subject}</h2>
                <p className="text-sm text-muted-foreground">{selectedThread.agentEmail}</p>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.direction === 'sent' ? 'flex-row-reverse' : ''
                      }`}
                      data-testid={`message-${message.id}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.direction === 'sent' ? 'bg-primary' : 'bg-muted'
                      }`}>
                        {message.direction === 'sent' ? (
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <div className={`flex-1 ${message.direction === 'sent' ? 'text-right' : ''}`}>
                        <div className={`inline-block max-w-[80%] ${
                          message.direction === 'sent' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        } rounded-lg p-3`}>
                          <div className="text-xs opacity-70 mb-1">
                            {message.direction === 'sent' ? 'You' : message.fromEmail}
                          </div>
                          <div className="whitespace-pre-wrap break-words">{message.body}</div>
                          <div className="text-xs opacity-70 mt-2">
                            {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t p-4">
                <div className="max-w-3xl mx-auto">
                  {attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {attachments.map((att, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-2">
                          <Paperclip className="w-3 h-3" />
                          {att.file.name}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeAttachment(idx)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Textarea
                      value={messageInput + interimTranscript}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Type your reply..."
                      className="min-h-[80px] resize-none"
                      data-testid="input-reply-message"
                    />
                    <div className="flex flex-col gap-2">
                      <VoiceInput
                        onTranscript={(transcript: string) => {
                          setMessageInput(prev => prev + (prev ? ' ' : '') + transcript);
                          setInterimTranscript("");
                        }}
                        onInterimTranscript={(transcript: string) => {
                          setInterimTranscript(' ' + transcript);
                        }}
                        continuous={true}
                      />
                      <label htmlFor="file-upload">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          data-testid="button-attach-file"
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="*/*"
                      />
                      <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!messageInput.trim() || sendEmailMutation.isPending}
                        data-testid="button-send-reply"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
