import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Asset, Project } from "@shared/schema";
import { Upload, Image as ImageIcon, Trash2, CheckCircle2, Globe } from "lucide-react";

export default function AssetManagement() {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  const uploadAssetMutation = useMutation({
    mutationFn: async ({ file, type, projectId }: { file: File; type: string; projectId?: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      if (projectId) {
        formData.append("projectId", projectId);
      }

      const response = await fetch("/api/assets", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      setFaviconFile(null);
      setFaviconPreview(null);
      setLogoFile(null);
      setLogoPreview(null);
      toast({
        title: "Upload successful",
        description: "Asset uploaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activateAssetMutation = useMutation({
    mutationFn: async (assetId: string) => {
      return await apiRequest("PATCH", `/api/assets/${assetId}/activate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({
        title: "Asset activated",
        description: "Asset is now active and will be displayed on the site.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Activation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: string) => {
      return await apiRequest("DELETE", `/api/assets/${assetId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({
        title: "Asset deleted",
        description: "Asset has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onload = () => setFaviconPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadFavicon = (projectId?: string) => {
    if (faviconFile) {
      uploadAssetMutation.mutate({ file: faviconFile, type: "favicon", projectId });
    }
  };

  const handleUploadLogo = (projectId?: string) => {
    if (logoFile) {
      uploadAssetMutation.mutate({ file: logoFile, type: "logo", projectId });
    }
  };

  const favicons = assets.filter((a) => a.type === "favicon");
  const logos = assets.filter((a) => a.type === "logo");
  const activeFavicon = favicons.find((a) => a.isActive);
  const activeLogo = logos.find((a) => a.isActive);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Asset Management</h1>
        <p className="text-muted-foreground">
          Upload and manage favicons and logos for your website
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Favicon Upload */}
        <Card data-testid="card-favicon-upload">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Favicon
            </CardTitle>
            <CardDescription>
              Upload a favicon for browser tabs (PNG, SVG, ICO, max 2MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="favicon-upload">Select Favicon</Label>
              <Input
                id="favicon-upload"
                type="file"
                accept=".png,.svg,.ico,.webp"
                onChange={handleFaviconChange}
                data-testid="input-favicon-file"
              />
            </div>

            {faviconPreview && (
              <div className="flex items-center gap-4 p-4 border rounded-md">
                <img
                  src={faviconPreview}
                  alt="Favicon preview"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-sm text-muted-foreground">
                  {faviconFile?.name}
                </span>
              </div>
            )}

            <Button
              onClick={handleUploadFavicon}
              disabled={!faviconFile || uploadAssetMutation.isPending}
              className="w-full"
              data-testid="button-upload-favicon"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Favicon
            </Button>

            {activeFavicon && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Active Favicon:</p>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <img
                    src={`/uploads/${activeFavicon.filename}`}
                    alt="Active favicon"
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-sm flex-1">{activeFavicon.originalFilename}</span>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <Card data-testid="card-logo-upload">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Company Logo
            </CardTitle>
            <CardDescription>
              Upload a company logo for headers and widgets (PNG, SVG, max 2MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logo-upload">Select Logo</Label>
              <Input
                id="logo-upload"
                type="file"
                accept=".png,.svg,.webp"
                onChange={handleLogoChange}
                data-testid="input-logo-file"
              />
            </div>

            {logoPreview && (
              <div className="flex items-center gap-4 p-4 border rounded-md">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-16 h-16 object-contain"
                />
                <span className="text-sm text-muted-foreground">
                  {logoFile?.name}
                </span>
              </div>
            )}

            <Button
              onClick={handleUploadLogo}
              disabled={!logoFile || uploadAssetMutation.isPending}
              className="w-full"
              data-testid="button-upload-logo"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </Button>

            {activeLogo && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Active Logo:</p>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <img
                    src={`/uploads/${activeLogo.filename}`}
                    alt="Active logo"
                    className="h-8 w-auto object-contain"
                  />
                  <span className="text-sm flex-1">{activeLogo.originalFilename}</span>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Asset Library */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Library</CardTitle>
          <CardDescription>All uploaded assets</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : assets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No assets uploaded yet
            </p>
          ) : (
            <div className="space-y-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-4 p-4 border rounded-md hover-elevate"
                  data-testid={`asset-item-${asset.id}`}
                >
                  <img
                    src={`/uploads/${asset.filename}`}
                    alt={asset.originalFilename}
                    className={`object-contain ${
                      asset.type === "favicon" ? "w-6 h-6" : "h-8 w-auto"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{asset.originalFilename}</p>
                    <p className="text-sm text-muted-foreground">
                      {asset.type} • {(asset.size / 1024).toFixed(1)}KB •{" "}
                      {new Date(asset.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {asset.isActive ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full">
                        Active
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => activateAssetMutation.mutate(asset.id)}
                        disabled={activateAssetMutation.isPending}
                        data-testid={`button-activate-${asset.id}`}
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAssetMutation.mutate(asset.id)}
                      disabled={deleteAssetMutation.isPending}
                      data-testid={`button-delete-${asset.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
