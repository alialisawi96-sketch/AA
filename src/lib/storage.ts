import { ArchiveRecord } from '@/types/archive';

const STORAGE_KEY = 'archive_records';

export const storage = {
  getRecords: (): ArchiveRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from storage:', error);
      return [];
    }
  },

  saveRecords: (records: ArchiveRecord[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw new Error('فشل في حفظ البيانات. قد تكون المساحة ممتلئة.');
    }
  },

  addRecord: (record: ArchiveRecord): void => {
    const records = storage.getRecords();
    records.unshift(record);
    storage.saveRecords(records);
  },

  updateRecord: (id: string, updates: Partial<ArchiveRecord>): void => {
    const records = storage.getRecords();
    const index = records.findIndex(r => r.id === id);
    if (index !== -1) {
      records[index] = { ...records[index], ...updates };
      storage.saveRecords(records);
    }
  },

  deleteRecord: (id: string): void => {
    const records = storage.getRecords();
    const filtered = records.filter(r => r.id !== id);
    storage.saveRecords(filtered);
  },
};
