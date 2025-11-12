import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { FilterOptions } from '@/types/archive';

interface ArchiveFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export const ArchiveFilters = ({ filters, onFilterChange }: ArchiveFiltersProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search">البحث الذكي</Label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="search"
              placeholder="ابحث في العنوان، رقم الكتاب، المؤرشف..."
              value={filters.searchTerm || ''}
              onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
              className="pr-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filterType">نوع الملف</Label>
            <Select
              value={filters.fileType || 'all'}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  fileType: value as 'incoming' | 'outgoing' | 'all',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="incoming">وارد</SelectItem>
                <SelectItem value="outgoing">صادر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFrom">من تاريخ</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateTo">إلى تاريخ</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
