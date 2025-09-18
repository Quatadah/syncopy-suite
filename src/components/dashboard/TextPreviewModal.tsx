import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Copy, Download, FileText, X } from "lucide-react";

interface TextPreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  title?: string;
  type?: "text" | "image" | "link" | "code";
  onCopy?: (content: string) => Promise<void>;
}

export function TextPreviewModal({
  isOpen,
  onOpenChange,
  content,
  title,
  type = "text",
  onCopy,
}: TextPreviewModalProps) {
  const handleCopy = async () => {
    try {
      if (onCopy) {
        await onCopy(content);
      } else {
        await navigator.clipboard.writeText(content);
      }
      toast({
        title: "Copied to clipboard",
        description: "Text content has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "clipboard-content"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Text content is being downloaded",
    });
  };

  const getTypeIcon = () => {
    switch (type) {
      case "code":
        return <FileText className="w-5 h-5" />;
      case "link":
        return <FileText className="w-5 h-5" />;
      case "image":
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "code":
        return "Code";
      case "link":
        return "Link";
      case "image":
        return "Image";
      default:
        return "Text";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {getTypeIcon()}
            </div>
            <div>
              <DialogTitle>
                {title || `${getTypeLabel()} Content`}
              </DialogTitle>
              <DialogDescription>
                View and manage your clipboard content
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Content type indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-muted/50 rounded-md font-medium">
              {getTypeLabel()}
            </span>
            <span>•</span>
            <span>{content.length} characters</span>
          </div>

          {/* Text content */}
          <div className="relative">
            <div className="bg-muted/30 rounded-lg border border-border/50 p-4 max-h-96 overflow-auto">
              {type === "code" ? (
                <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                  {content}
                </pre>
              ) : (
                <div className="text-sm whitespace-pre-wrap break-words">
                  {content}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Text
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TextPreviewModal;
