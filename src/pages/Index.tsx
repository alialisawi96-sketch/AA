import { useState, useEffect, useMemo } from 'react';
import { ArchiveForm } from '@/components/ArchiveForm';
import { ArchiveFilters } from '@/components/ArchiveFilters';
import { ArchiveTable } from '@/components/ArchiveTable';
import { EditArchiveDialog } from '@/components/EditArchiveDialog';
import { ArchiveRecord, FilterOptions } from '@/types/archive';
import { storage } from '@/lib/storage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileArchive, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToExcel, exportToCSV } from '@/lib/exportUtils';
import { toast } from 'sonner';

const Index = () => {
  const [records, setRecords] = useState<ArchiveRecord[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    fileType: 'all',
    searchTerm: '',
  });
  const [editingRecord, setEditingRecord] = useState<ArchiveRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    setRecords(storage.getRecords());
  }, []);

  const handleAddRecord = (record: ArchiveRecord) => {
    storage.addRecord(record);
    setRecords(storage.getRecords());
  };

  const handleDeleteRecord = (id: string) => {
    storage.deleteRecord(id);
    setRecords(storage.getRecords());
  };

  const handleUpdateRecord = (id: string, updates: Partial<ArchiveRecord>) => {
    storage.updateRecord(id, updates);
    setRecords(storage.getRecords());
  };

  const handleEditRecord = (record: ArchiveRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      // Filter by type
      if (filters.fileType && filters.fileType !== 'all' && record.fileType !== filters.fileType) {
        return false;
      }

      // Filter by date range
      if (filters.dateFrom) {
        const recordDate = new Date(record.archiveDate);
        const fromDate = new Date(filters.dateFrom);
        if (recordDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const recordDate = new Date(record.archiveDate);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (recordDate > toDate) return false;
      }

      // Smart search - including extracted text
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          record.title.toLowerCase().includes(searchLower) ||
          record.documentNumber.toLowerCase().includes(searchLower) ||
          record.archiverName.toLowerCase().includes(searchLower) ||
          (record.issuingEntity && record.issuingEntity.toLowerCase().includes(searchLower)) ||
          record.notes.toLowerCase().includes(searchLower) ||
          (record.extractedText && record.extractedText.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, [records, filters]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">
            برنامج المهندس للارشفة الالكترونية
          </h1>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4 max-w-7xl flex-1">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <FileArchive className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              نظام الأرشفة الإلكتروني
            </h2>
          </div>
          <p className="text-muted-foreground text-lg">
            نظام شامل لأرشفة وإدارة الكتب والمستندات مع البحث الذكي في محتوى الملفات
          </p>
        </div>

        <Tabs defaultValue="add" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="add">إضافة سجل جديد</TabsTrigger>
            <TabsTrigger value="view">عرض السجلات ({records.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-6">
            <ArchiveForm onSubmit={handleAddRecord} />
          </TabsContent>

          <TabsContent value="view" className="space-y-6">
            <ArchiveFilters filters={filters} onFilterChange={setFilters} />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                عرض {filteredRecords.length} من أصل {records.length} سجل
              </p>
              {filteredRecords.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      exportToExcel(filteredRecords, 'سجلات-الأرشفة');
                      toast.success('تم تصدير السجلات إلى Excel بنجاح');
                    }}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    تصدير Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      exportToCSV(filteredRecords, 'سجلات-الأرشفة');
                      toast.success('تم تصدير السجلات إلى CSV بنجاح');
                    }}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    تصدير CSV
                  </Button>
                </div>
              )}
            </div>
            <ArchiveTable 
              records={filteredRecords} 
              onDelete={handleDeleteRecord}
              onEdit={handleEditRecord}
            />
          </TabsContent>
        </Tabs>

        <EditArchiveDialog
          record={editingRecord}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdate={handleUpdateRecord}
        />
      </div>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground py-4 mt-8 border-t">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm">
            مديرية زراعة النجف - شعبة GIS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
