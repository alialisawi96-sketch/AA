export interface ArchiveRecord {
  id: string;
  fileType: 'incoming' | 'outgoing';
  archiveDate: string;
  archiverName: string;
  issuingEntity: string; // الجهة المصدرة
  documentDate: string;
  documentNumber: string;
  title: string;
  notes: string;
  attachedFile?: {
    name: string;
    data: string; // base64
    type: 'pdf' | 'image'; // نوع الملف
  };
  // للتوافق مع السجلات القديمة
  pdfFile?: {
    name: string;
    data: string; // base64
  };
  extractedText?: string; // النص المستخرج من PDF أو الصور
}

export interface FilterOptions {
  fileType?: 'incoming' | 'outgoing' | 'all';
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}
