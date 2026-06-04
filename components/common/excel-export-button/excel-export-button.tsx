'use client';

import { IconDownload } from '@tabler/icons-react';
import { Button } from '@mantine/core';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export type ExcelExportValue = string | number | boolean | null | undefined;

export type ExcelExportColumn<TItem> = {
  key: string;
  headerKey: string;
  width: number;
  value: (item: TItem) => ExcelExportValue;
};

export type ExcelExportButtonProps<TItem> = {
  items: TItem[];
  columns: ExcelExportColumn<TItem>[];
  worksheetName: string;
  fileNameKey: string;
  labelKey: string;
  noteKey: string;
  className?: string;
  disabled?: boolean;
};

export function ExcelExportButton<TItem>({
  items,
  columns,
  worksheetName,
  fileNameKey,
  labelKey,
  noteKey,
  className,
  disabled = false,
}: ExcelExportButtonProps<TItem>) {
  const t = useTranslations('common');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (items.length === 0) {
      return;
    }

    setIsExporting(true);

    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(worksheetName);

      sheet.columns = columns.map(({ key, width }) => ({ key, width }));

      const lastColLetter = String.fromCharCode(64 + columns.length);
      sheet.mergeCells(`A1:${lastColLetter}1`);
      const noteCell = sheet.getCell('A1');
      noteCell.value = t(noteKey);
      noteCell.font = { italic: true, color: { argb: 'FF666666' } };
      noteCell.alignment = { horizontal: 'left', vertical: 'middle' };

      const headerRow = sheet.addRow(
        Object.fromEntries(
          columns.map((column) => [column.key, t(column.headerKey)]),
        ),
      );
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F5F9' },
      };

      items.forEach((item) => {
        sheet.addRow(
          Object.fromEntries(
            columns.map((column) => [column.key, column.value(item)]),
          ),
        );
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${t(fileNameKey)}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      return;
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="default"
      size="xs"
      leftSection={<IconDownload size={14} />}
      className={className}
      disabled={disabled || items.length === 0}
      loading={isExporting}
      onClick={handleExport}
    >
      {t(labelKey)}
    </Button>
  );
}
