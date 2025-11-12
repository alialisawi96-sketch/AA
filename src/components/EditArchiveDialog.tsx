import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Loader2 } from 'lucide-react';
import { ArchiveRecord } from '@/types/archive';
import { toast } from 'sonner';
import { extractTextFromPDF, extractTextFromImage } from '@/lib/textExtraction';

interface EditArchiveDialogProps {
  record: ArchiveRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<ArchiveRecord>) => void;
}

export const EditArchiveDialog = ({ record, open, onOpenChange, onUpdate }: EditArchiveDialogProps) => {
  const [formData, setFormData] = useState({
    fileType: 'incoming' as 'incoming' | 'outgoing',
    archiverName: '',
    issuingEntity: '',
    documentDate: '',
    documentNumber: '',
    title: '',
    notes: '',
  });
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [currentFile, setCurrentFile] = useState<{ name: string; type: 'pdf' | 'image' } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        fileType: record.fileType,
        archiverName: record.archiverName,
        issuingEntity: record.issuingEntity || '',
        documentDate: record.documentDate,
        documentNumber: record.documentNumber,
        title: record.title,
        notes: record.notes,
      });
      
      if (record.attachedFile) {
        setCurrentFile({ name: record.attachedFile.name, type: record.attachedFile.type });
      } else if (record.pdfFile) {
        setCurrentFile({ name: record.pdfFile.name, type: 'pdf' });
      }
    }
  }, [record]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (file && validTypes.includes(file.type)) {
      setAttachedFile(file);
      setCurrentFile(null);
      toast.success('تم رفع الملف بنجاح');
    } else {
      toast.error('الرجاء رفع ملف PDF أو صورة فقط (JPG, PNG, WEBP)');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (file && validTypes.includes(file.type)) {
      setAttachedFile(file);
      setCurrentFile(null);
      toast.success('تم رفع الملف بنجاح');
    } else {
      toast.error('الرجاء رفع ملف PDF أو صورة فقط (JPG, PNG, WEBP)');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!record || !formData.archiverName || !formData.documentNumber || !formData.title || !formData.issuingEntity) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    setIsExtracting(true);
    let fileData: { name: string; data: string; type: 'pdf' | 'image' } | undefined = record.attachedFile;
    
    // Handle backward compatibility with old pdfFile
    if (!fileData && record.pdfFile) {
      fileData = {
        name: record.pdfFile.name,
        data: record.pdfFile.data,
        type: 'pdf',
      };
    }
    
    let extractedText = record.extractedText;

    if (attachedFile) {
      const reader = new FileReader();
      const fileDataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(attachedFile);
      });

      const fileType = attachedFile.type.startsWith('image/') ? 'image' : 'pdf';
      
      try {
        if (fileType === 'pdf') {
          extractedText = await extractTextFromPDF(fileDataUrl);
        } else {
          extractedText = await extractTextFromImage(fileDataUrl);
        }
        if (extractedText) {
          toast.success('تم استخراج النص من الملف بنجاح');
        }
      } catch (error) {
        console.error('Error extracting text:', error);
        toast.error('فشل استخراج النص من الملف');
      }

      fileData = {
        name: attachedFile.name,
        data: fileDataUrl,
        type: fileType as 'pdf' | 'image',
      };
    }

    const updates: Partial<ArchiveRecord> = {
      ...formData,
      attachedFile: fileData,
      extractedText: extractedText || undefined,
    };

    onUpdate(record.id, updates);
    onOpenChange(false);
    setIsExtracting(false);
    toast.success('تم تعديل السجل بنجاح');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل السجل</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="edit-fileType">نوع الملف *</Label>
              <Select
                value={formData.fileType}
                onValueChange={(value: 'incoming' | 'outgoing') =>
                  setFormData({ ...formData, fileType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incoming">وارد</SelectItem>
                  <SelectItem value="outgoing">صادر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-archiverName">اسم المؤرشف *</Label>
              <Input
                id="edit-archiverName"
                value={formData.archiverName}
                onChange={(e) => setFormData({ ...formData, archiverName: e.target.value })}
                placeholder="أدخل اسم المؤرشف"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-issuingEntity">الجهة المصدرة *</Label>
              <Input
                id="edit-issuingEntity"
                value={formData.issuingEntity}
                onChange={(e) => setFormData({ ...formData, issuingEntity: e.target.value })}
                placeholder="أدخل اسم الجهة المصدرة أو الموردة"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-documentDate">تاريخ الكتاب</Label>
              <Input
                id="edit-documentDate"
                type="date"
                value={formData.documentDate}
                onChange={(e) => setFormData({ ...formData, documentDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-documentNumber">عدد الكتاب *</Label>
              <Input
                id="edit-documentNumber"
                value={formData.documentNumber}
                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                placeholder="أدخل رقم الكتاب"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-title">العنوان *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="أدخل عنوان الكتاب"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">ملاحظات</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أدخل أي ملاحظات إضافية"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>ملف PDF أو صورة</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-smooth ${
                isDragging ? 'border-primary bg-accent' : 'border-border'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {attachedFile ? (
                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm">{attachedFile.name} (جديد)</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setAttachedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : currentFile ? (
                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm">{currentFile.name} (حالي)</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      اسحب وأفلت ملف PDF أو صورة هنا أو انقر للاختيار
                    </p>
                    <p className="text-xs text-muted-foreground">
                      (PDF, JPG, PNG, WEBP)
                    </p>
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="edit-file-upload"
                    />
                    <Label htmlFor="edit-file-upload">
                      <Button type="button" variant="outline" asChild>
                        <span>اختر ملف</span>
                      </Button>
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isExtracting}>
              {isExtracting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري استخراج النص...
                </>
              ) : (
                'حفظ التعديلات'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
