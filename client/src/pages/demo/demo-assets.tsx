import { DemoLayout } from "./demo-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, Image as ImageIcon } from "lucide-react";
import triadBlueLogo from "@assets/TriadBlue-Logo-Lockup_1763606084811.png";
import consoleBlueLogo from "@assets/ConsoleBlue-logo_1763756605648.png";
import businessBlueprintLogo from "@assets/BluePrint Header Logo minus io_1763756646639.png";

export default function DemoAssets() {
  const sampleAssets = [
    {
      id: "1",
      type: "logo",
      fileName: "ConsoleBlue-logo.png",
      project: "ConsoleBlue",
      uploadedAt: "2 days ago",
      size: "45 KB",
      active: true,
      previewUrl: consoleBlueLogo
    },
    {
      id: "2",
      type: "favicon",
      fileName: "TriadBlue-favicon.png",
      project: "Global",
      uploadedAt: "1 week ago",
      size: "12 KB",
      active: true,
      previewUrl: triadBlueLogo
    },
    {
      id: "3",
      type: "logo",
      fileName: "BusinessBlueprint-logo.png",
      project: "BusinessBlueprint",
      uploadedAt: "2 weeks ago",
      size: "38 KB",
      active: false,
      previewUrl: businessBlueprintLogo
    }
  ];

  return (
    <DemoLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Asset Management</h1>
          <p className="text-muted-foreground">
            Upload and manage visual assets across all TriadBlue projects
          </p>
        </div>

        {/* Upload Section */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Upload Favicon
              </CardTitle>
              <CardDescription>
                PNG, SVG, ICO, WEBP formats. Max 2MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  Drag & drop or click to upload
                </p>
                <Button disabled size="sm" data-testid="button-upload-favicon">
                  Choose File (Demo Mode)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Upload Logo
              </CardTitle>
              <CardDescription>
                PNG, SVG, WEBP formats. Max 2MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  Drag & drop or click to upload
                </p>
                <Button disabled size="sm" data-testid="button-upload-logo">
                  Choose File (Demo Mode)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Asset Library */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Library</CardTitle>
            <CardDescription>
              All uploaded assets across projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  data-testid={`asset-${asset.id}`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 border rounded flex items-center justify-center bg-muted p-2">
                      <img
                        src={asset.previewUrl}
                        alt={asset.fileName}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{asset.fileName}</h4>
                        {asset.active && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="outline" className="capitalize">
                          {asset.type}
                        </Badge>
                        <span>{asset.project}</span>
                        <span>•</span>
                        <span>{asset.size}</span>
                        <span>•</span>
                        <span>{asset.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!asset.active && (
                      <Button size="sm" variant="outline" disabled data-testid={`button-activate-${asset.id}`}>
                        Activate
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" disabled data-testid={`button-delete-${asset.id}`}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-base">How Asset Management Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Upload favicons and logos for any TriadBlue project</p>
            <p>• Activate assets to use them across your dashboards</p>
            <p>• Global assets are available to all projects</p>
            <p>• Project-specific assets are scoped to individual platforms</p>
          </CardContent>
        </Card>
      </div>
    </DemoLayout>
  );
}
