import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const pages = [
  { name: "Tool", url: "https://siteinspector.dev", id: "tool" },
  { name: "Analyze", url: "https://siteinspector.dev/analyze", id: "analyze" },
  { name: "Dashboard", url: "https://siteinspector.dev/dashboard", id: "dashboard" },
];

export default function SiteInspector() {
  const [activeTab, setActiveTab] = useState("tool");

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-4 p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Site Inspector</h1>
            <p className="text-sm text-muted-foreground">AI-powered website analysis and inspection tool</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {pages.map((page) => (
              <TabsTrigger key={page.id} value={page.id} data-testid={`tab-site-inspector-${page.id}`}>
                {page.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {pages.map((page) => (
            <TabsContent key={page.id} value={page.id} className="mt-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                  <span className="text-sm font-medium">{page.url}</span>
                  <a 
                    href={page.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    data-testid={`link-site-inspector-${page.id}`}
                  >
                    <Button size="icon" variant="ghost">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>

                <iframe
                  src={page.url}
                  className="w-full border rounded-md bg-background"
                  style={{ height: "calc(100vh - 240px)", minHeight: "600px" }}
                  title={page.name}
                  data-testid={`iframe-site-inspector-${page.id}`}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
