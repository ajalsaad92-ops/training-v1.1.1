import { useState, useEffect } from "react";
import { fileStore, type StoredFile } from "@/lib/fileStore";
import { useUserRole } from "@/hooks/useUserRole";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Upload, X, Eye, Loader2, Image as ImageIcon } from "lucide-react";

const ACCEPTED_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

const acceptString = Object.keys(ACCEPTED_TYPES).join(",");

const isImage = (mime: string) => mime.startsWith("image/");
const isPDF = (mime: string) => mime === "application/pdf";

export function FileUploadButton({
  entityKey,
  onUpload,
  accept,
  multiple = false,
  label = "رفع ملف",
}: {
  entityKey: string;
  onUpload?: (file: StoredFile) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
}) {
  const { userId } = useUserRole();
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const stored = await fileStore.save(entityKey, files[i], userId);
        onUpload?.(stored);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-primary/10 text-primary hover:bg-primary/20 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
      <input type="file" accept={accept || acceptString} multiple={multiple} onChange={handleChange} className="hidden" />
      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
      {label}
    </label>
  );
}

export function FileList({
  entityKey,
  onDelete,
  showDelete = false,
}: {
  entityKey: string;
  onDelete?: (fileId: string) => void;
  showDelete?: boolean;
}) {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadFiles = async () => {
    const f = await fileStore.getByEntity(entityKey);
    setFiles(f);
  };

  useEffect(() => { loadFiles(); }, [entityKey]);

  const handlePreview = async (file: StoredFile) => {
    const url = await fileStore.getObjectURL(file.id);
    setPreviewFile(file);
    setPreviewUrl(url);
  };

  const handleDownload = async (file: StoredFile) => {
    const url = await fileStore.getObjectURL(file.id);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (fileId: string) => {
    await fileStore.delete(fileId);
    onDelete?.(fileId);
    loadFiles();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (files.length === 0) return null;

  return (
    <>
      <div className="space-y-1.5">
        {files.map(f => (
          <div key={f.id} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
            {isImage(f.mime_type) ? <ImageIcon className="w-4 h-4 text-primary shrink-0" /> : <FileText className="w-4 h-4 text-primary shrink-0" />}
            <span className="text-xs text-foreground flex-1 truncate">{f.filename}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">{formatSize(f.size)}</span>
            <button onClick={() => handlePreview(f)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="عرض"><Eye className="w-3.5 h-3.5" /></button>
            <button onClick={() => handleDownload(f)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="تحميل"><Download className="w-3.5 h-3.5" /></button>
            {showDelete && (
              <button onClick={() => handleDelete(f.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!previewFile} onOpenChange={() => { setPreviewFile(null); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}>
        <DialogContent className="max-w-4xl max-h-[85vh]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {previewFile?.filename}
            </DialogTitle>
          </DialogHeader>
          {previewUrl && previewFile && (
            <div className="flex-1 overflow-auto min-h-0">
              {isImage(previewFile.mime_type) ? (
                <img src={previewUrl} alt={previewFile.filename} className="max-w-full max-h-[70vh] mx-auto object-contain" />
              ) : isPDF(previewFile.mime_type) ? (
                <iframe src={previewUrl} className="w-full h-[70vh] border-0 rounded" title={previewFile.filename} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                  <FileText className="w-16 h-16 opacity-30" />
                  <p className="text-sm">لا يمكن عرض هذا الملف مباشرة</p>
                  <Button size="sm" variant="outline" onClick={() => handleDownload(previewFile)}><Download className="w-3.5 h-3.5" />تحميل الملف</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export { acceptString, ACCEPTED_TYPES };
