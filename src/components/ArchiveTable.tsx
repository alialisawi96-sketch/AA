import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FileText, Download, Trash2, Eye, Pencil } from 'lucide-react';
import { ArchiveRecord } from '@/types/archive';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface ArchiveTableProps {
  records: ArchiveRecord[];
  onDelete: (id: string) => void;
  onEdit: (record: ArchiveRecord) => void;
}

export const ArchiveTable = ({ records, onDelete, onEdit }: ArchiveTableProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewRecord, setViewRecord] = useState<ArchiveRecord | null>(null);

  const handleDownload = (record: ArchiveRecord) => {
    if (record.attachedFile) {
      const link = document.createElement('a');
      link.href = record.attachedFile.data;
      link.download = record.attachedFile.name;
      link.click();
      toast.success('تم تحميل الملف');
    } else if (record.pdfFile) {
      // backward compatibility
      const link = document.createElement('a');
      link.href = record.pdfFile.data;
      link.download = record.pdfFile.name;
      link.click();
      toast.success('تم تحميل الملف');
    } else {
      toast.error('لا يوجد ملف مرفق');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  if (records.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">لا توجد سجلات حالياً</p>
        <p className="text-sm text-muted-foreground mt-2">ابدأ بإضافة سجل جديد</p>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">رقم الكتاب</TableHead>
                <TableHead className="text-right">الجهة المصدرة</TableHead>
                <TableHead className="text-right">المؤرشف</TableHead>
                <TableHead className="text-right">تاريخ الكتاب</TableHead>
                <TableHead className="text-right">تاريخ الأرشفة</TableHead>
                <TableHead className="text-right">مرفق</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Badge variant={record.fileType === 'incoming' ? 'default' : 'secondary'}>
                      {record.fileType === 'incoming' ? 'وارد' : 'صادر'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{record.title}</TableCell>
                  <TableCell>{record.documentNumber}</TableCell>
                  <TableCell className="text-sm">{record.issuingEntity || '-'}</TableCell>
                  <TableCell>{record.archiverName}</TableCell>
                  <TableCell>{formatDate(record.documentDate)}</TableCell>
                  <TableCell>{formatDate(record.archiveDate)}</TableCell>
                  <TableCell>
                    {(record.attachedFile || record.pdfFile) ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(record)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewRecord(record)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(record)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(record.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف السجل نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                  toast.success('تم حذف السجل');
                }
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!viewRecord} onOpenChange={() => setViewRecord(null)}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>تفاصيل السجل</AlertDialogTitle>
          </AlertDialogHeader>
          {viewRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">النوع</p>
                  <p className="mt-1">
                    <Badge variant={viewRecord.fileType === 'incoming' ? 'default' : 'secondary'}>
                      {viewRecord.fileType === 'incoming' ? 'وارد' : 'صادر'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">رقم الكتاب</p>
                  <p className="mt-1">{viewRecord.documentNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الجهة المصدرة</p>
                  <p className="mt-1">{viewRecord.issuingEntity || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">المؤرشف</p>
                  <p className="mt-1">{viewRecord.archiverName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تاريخ الكتاب</p>
                  <p className="mt-1">{formatDate(viewRecord.documentDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تاريخ الأرشفة</p>
                  <p className="mt-1">{formatDate(viewRecord.archiveDate)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">العنوان</p>
                <p className="mt-1">{viewRecord.title}</p>
              </div>
              {viewRecord.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الملاحظات</p>
                  <p className="mt-1 text-sm">{viewRecord.notes}</p>
                </div>
              )}
              {viewRecord.extractedText && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">النص المستخرج</p>
                  <div className="mt-2 max-h-32 overflow-y-auto bg-muted/50 p-3 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{viewRecord.extractedText}</p>
                  </div>
                </div>
              )}
              {(viewRecord.attachedFile || viewRecord.pdfFile) && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الملف المرفق</p>
                  <div className="mt-2 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">
                      {viewRecord.attachedFile?.name || viewRecord.pdfFile?.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(viewRecord)}
                    >
                      تحميل
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setViewRecord(null)}>إغلاق</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
