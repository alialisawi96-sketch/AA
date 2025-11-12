import * as XLSX from 'xlsx';
import { ArchiveRecord } from '@/types/archive';

export const exportToExcel = (records: ArchiveRecord[], filename: string = 'archive-records') => {
  // تحضير البيانات للتصدير
  const data = records.map((record) => ({
    'نوع الملف': record.fileType === 'incoming' ? 'وارد' : 'صادر',
    'تاريخ الأرشفة': new Date(record.archiveDate).toLocaleDateString('ar-SA'),
    'اسم المؤرشف': record.archiverName,
    'الجهة المصدرة': record.issuingEntity || '',
    'تاريخ الكتاب': new Date(record.documentDate).toLocaleDateString('ar-SA'),
    'رقم الكتاب': record.documentNumber,
    'العنوان': record.title,
    'الملاحظات': record.notes,
    'نوع المرفق': record.attachedFile?.type || record.pdfFile ? 'PDF' : '',
    'اسم المرفق': record.attachedFile?.name || record.pdfFile?.name || '',
  }));

  // إنشاء ورقة العمل
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // تعيين عرض الأعمدة
  worksheet['!cols'] = [
    { wch: 10 }, // نوع الملف
    { wch: 15 }, // تاريخ الأرشفة
    { wch: 20 }, // اسم المؤرشف
    { wch: 25 }, // الجهة المصدرة
    { wch: 15 }, // تاريخ الكتاب
    { wch: 15 }, // رقم الكتاب
    { wch: 30 }, // العنوان
    { wch: 40 }, // الملاحظات
    { wch: 12 }, // نوع المرفق
    { wch: 25 }, // اسم المرفق
  ];

  // إنشاء كتاب العمل
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'السجلات');

  // تصدير الملف
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToCSV = (records: ArchiveRecord[], filename: string = 'archive-records') => {
  // تحضير البيانات للتصدير
  const headers = [
    'نوع الملف',
    'تاريخ الأرشفة',
    'اسم المؤرشف',
    'الجهة المصدرة',
    'تاريخ الكتاب',
    'رقم الكتاب',
    'العنوان',
    'الملاحظات',
    'نوع المرفق',
    'اسم المرفق'
  ];

  const rows = records.map((record) => [
    record.fileType === 'incoming' ? 'وارد' : 'صادر',
    new Date(record.archiveDate).toLocaleDateString('ar-SA'),
    record.archiverName,
    record.issuingEntity || '',
    new Date(record.documentDate).toLocaleDateString('ar-SA'),
    record.documentNumber,
    record.title,
    record.notes,
    record.attachedFile?.type || record.pdfFile ? 'PDF' : '',
    record.attachedFile?.name || record.pdfFile?.name || ''
  ]);

  // إنشاء محتوى CSV
  const csvContent = [
    '\ufeff' + headers.join(','), // BOM for Arabic support
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // تنزيل الملف
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
