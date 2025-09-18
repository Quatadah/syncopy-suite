import {
    addToast,
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader
} from "@heroui/react";
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
      addToast({
        title: "Copied to clipboard",
        description: "Text content has been copied to your clipboard",
        color: "success",
        variant: "solid",
        timeout: 3000,
      });
    } catch (error) {
      addToast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard",
        color: "danger",
        variant: "solid",
        timeout: 5000,
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
    
    addToast({
      title: "Download started",
      description: "Text content is being downloaded",
      color: "success",
      variant: "solid",
      timeout: 3000,
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
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  {getTypeIcon()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {title || `${getTypeLabel()} Content`}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    View and manage your clipboard content
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
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
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={onClose}
                startContent={<X className="w-4 h-4" />}
              >
                Close
              </Button>
              <Button
                color="primary"
                variant="light"
                onPress={handleDownload}
                startContent={<Download className="w-4 h-4" />}
              >
                Download
              </Button>
              <Button
                color="primary"
                onPress={handleCopy}
                startContent={<Copy className="w-4 h-4" />}
              >
                Copy Text
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default TextPreviewModal;
