import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Upload, X, Loader2 } from 'lucide-react';
import { ArchiveRecord } from '@/types/archive';
import { toast } from 'sonner';
import { extractTextFromPDF, extractTextFromImage } from '@/lib/textExtraction';

interface ArchiveFormProps {
  onSubmit: (record: ArchiveRecord) => void;
}

export const ArchiveForm = ({ onSubmit }: ArchiveFormProps) => {
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
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

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
      toast.success('تم رفع الملف بنجاح');
    } else {
      toast.error('الرجاء رفع ملف PDF أو صورة فقط (JPG, PNG, WEBP)');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.archiverName || !formData.documentNumber || !formData.title || !formData.issuingEntity) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    setIsExtracting(true);
    let fileData = undefined;
    let extractedText = '';

    if (attachedFile) {
      const reader = new FileReader();
      const fileDataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(attachedFile);
      });

      const fileType = attachedFile.type.startsWith('image/') ? 'image' : 'pdf';
      
      // استخراج النص
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
        type: fileType,
      };
    }

    const record: ArchiveRecord = {
      id: Date.now().toString(),
      ...formData,
      archiveDate: new Date().toISOString(),
      attachedFile: fileData,
      extractedText: extractedText || undefined,
    };

    onSubmit(record);

    // Reset form
    setFormData({
      fileType: 'incoming',
      archiverName: '',
      issuingEntity: '',
      documentDate: '',
      documentNumber: '',
      title: '',
      notes: '',
    });
    setAttachedFile(null);
    setIsExtracting(false);
    toast.success('تم إضافة السجل بنجاح');
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fileType">نوع الملف *</Label>
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
            <Label htmlFor="archiverName">اسم المؤرشف *</Label>
            <Input
              id="archiverName"
              value={formData.archiverName}
              onChange={(e) => setFormData({ ...formData, archiverName: e.target.value })}
              placeholder="أدخل اسم المؤرشف"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuingEntity">الجهة المصدرة *</Label>
            <Input
              id="issuingEntity"
              value={formData.issuingEntity}
              onChange={(e) => setFormData({ ...formData, issuingEntity: e.target.value })}
              placeholder="أدخل اسم الجهة المصدرة أو الموردة"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentDate">تاريخ الكتاب</Label>
            <Input
              id="documentDate"
              type="date"
              value={formData.documentDate}
              onChange={(e) => setFormData({ ...formData, documentDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentNumber">عدد الكتاب *</Label>
            <Input
              id="documentNumber"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              placeholder="أدخل رقم الكتاب"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">العنوان *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="أدخل عنوان الكتاب"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">ملاحظات</Label>
          <Textarea
            id="notes"
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
                <span className="text-sm">{attachedFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setAttachedFile(null)}
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
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>اختر ملف</span>
                    </Button>
                  </Label>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isExtracting}>
          {isExtracting ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري استخراج النص...
            </>
          ) : (
            'حفظ السجل'
          )}
        </Button>
      </form>
    </Card>
  );
};
