import { DemoLayout } from "./demo-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Mail, Send, Paperclip, Archive } from "lucide-react";

export default function DemoEmailChat() {
  const [selectedThread, setSelectedThread] = useState<string | null>("thread-1");

  const sampleThreads = [
    {
      id: "thread-1",
      project: "BusinessBlueprint",
      subject: "Digital IQ Report Request",
      from: "john.smith@example.com",
      preview: "Hi, I'm interested in getting a Digital IQ assessment for my restaurant...",
      unread: true,
      date: "2 hours ago",
      color: "bg-blue-500"
    },
    {
      id: "thread-2",
      project: "HostsBlue",
      subject: "Domain Transfer Question",
      from: "sarah.johnson@startup.io",
      preview: "I'd like to transfer my domain to HostsBlue. Can you help with the process?",
      unread: true,
      date: "5 hours ago",
      color: "bg-purple-500"
    },
    {
      id: "thread-3",
      project: "SwipesBlue",
      subject: "Payment Processing Setup",
      from: "mike.chen@retailshop.com",
      preview: "We're ready to start accepting payments. What's the onboarding process?",
      unread: false,
      date: "Yesterday",
      color: "bg-green-500"
    },
    {
      id: "thread-4",
      project: "BlueLink",
      subject: "Custom Integration Request",
      from: "alex.rivera@techcorp.com",
      preview: "Looking for a custom SaaS solution that integrates with our existing systems...",
      unread: false,
      date: "2 days ago",
      color: "bg-orange-500"
    }
  ];

  const sampleMessages = {
    "thread-1": [
      {
        from: "john.smith@example.com",
        content: "Hi, I'm interested in getting a Digital IQ assessment for my restaurant. We've been in business for 15 years but our online presence is basically non-existent. Can you help?",
        timestamp: "Today at 2:45 PM",
        isMe: false
      },
      {
        from: "businessblueprint@agentmail.triadblue.com",
        content: "Absolutely! We specialize in helping established businesses build their digital presence. The Digital IQ assessment will give you a comprehensive view of your current online visibility and a roadmap for improvement. Would you like to schedule a consultation?",
        timestamp: "Today at 3:12 PM",
        isMe: true
      }
    ],
    "thread-2": [
      {
        from: "sarah.johnson@startup.io",
        content: "I'd like to transfer my domain startup.io to HostsBlue. I'm currently with GoDaddy. Can you help with the process?",
        timestamp: "Today at 11:30 AM",
        isMe: false
      }
    ],
    "thread-3": [
      {
        from: "mike.chen@retailshop.com",
        content: "We're ready to start accepting payments through SwipesBlue. What's the onboarding process like?",
        timestamp: "Yesterday at 4:20 PM",
        isMe: false
      },
      {
        from: "swipesblue@agentmail.triadblue.com",
        content: "Great! The onboarding process typically takes 24-48 hours. We'll need some basic business information and bank account details for deposits. Most merchants are up and running within a day!",
        timestamp: "Yesterday at 5:15 PM",
        isMe: true
      }
    ],
    "thread-4": [
      {
        from: "alex.rivera@techcorp.com",
        content: "Looking for a custom SaaS solution that integrates with our existing CRM and inventory systems. Is this something BlueLink can handle?",
        timestamp: "2 days ago",
        isMe: false
      }
    ]
  };

  const currentMessages = selectedThread ? sampleMessages[selectedThread as keyof typeof sampleMessages] || [] : [];
  const currentThread = sampleThreads.find(t => t.id === selectedThread);

  return (
    <DemoLayout>
      <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] p-4 gap-4 min-w-0">
        {/* Thread List */}
        <Card className="w-full md:w-80 md:max-w-80 flex flex-col min-h-0 md:min-h-full">
          <div className="p-4 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Inbox
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Sample conversations across projects</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {sampleThreads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedThread === thread.id ? 'bg-accent' : 'hover-elevate'
                  }`}
                  data-testid={`thread-${thread.id}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${thread.color}`} />
                      <span className="text-xs font-medium truncate">{thread.project}</span>
                    </div>
                    {thread.unread && <Badge variant="destructive" className="h-5 px-1 text-xs">New</Badge>}
                  </div>
                  <h4 className="font-medium text-sm truncate">{thread.subject}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{thread.from}</p>
                  <p className="text-xs text-muted-foreground truncate mt-1">{thread.preview}</p>
                  <p className="text-xs text-muted-foreground mt-1">{thread.date}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Message View */}
        <Card className="flex-1 flex flex-col min-w-0 min-h-0">
          {currentThread ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${currentThread.color}`} />
                      <Badge variant="outline">{currentThread.project}</Badge>
                    </div>
                    <h3 className="font-semibold">{currentThread.subject}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{currentThread.from}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2" data-testid="button-archive-thread">
                    <Archive className="h-4 w-4" />
                    Archive
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl">
                  {currentMessages.map((message, idx) => (
                    <div key={idx} className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${message.isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                        <p className="text-xs font-medium mb-1">{message.from}</p>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="space-y-2">
                  <Input placeholder="Subject (if new thread)" disabled className="text-sm" data-testid="input-email-subject" />
                  <Textarea 
                    placeholder="Type your reply here... (Demo mode - read only)" 
                    className="min-h-24 resize-none" 
                    disabled
                    data-testid="textarea-email-reply"
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" disabled className="gap-2" data-testid="button-attach-files">
                      <Paperclip className="h-4 w-4" />
                      Attach Files
                    </Button>
                    <Button size="sm" disabled className="gap-2" data-testid="button-send-reply">
                      <Send className="h-4 w-4" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a thread to view messages</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DemoLayout>
  );
}
