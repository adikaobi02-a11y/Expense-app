import { jsPDF } from 'jspdf';
import { Expense, Category, CurrencyCode } from '../types';
import { formatCurrency } from './currency';

/**
 * Generate and download a formatted CSV file
 */
export const exportExpensesToCSV = (
  expenses: Expense[],
  categories: Category[],
  currencyCode: CurrencyCode = 'NGN'
) => {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  let csvContent = 'Date,Time,Category,Amount (' + currencyCode + '),Payment Method,Note\n';

  let totalAmount = 0;
  const categoryTotals: Record<string, number> = {};

  sorted.forEach((exp) => {
    const catName = catMap.get(exp.categoryId) || 'Other';
    const noteClean = (exp.note || '').replace(/"/g, '""');
    totalAmount += exp.amount;
    categoryTotals[catName] = (categoryTotals[catName] || 0) + exp.amount;

    csvContent += `"${exp.date}","${exp.time || ''}","${catName}","${exp.amount}","${exp.paymentMethod}","${noteClean}"\n`;
  });

  csvContent += `\n"SUMMARY","","","${totalAmount}","",""\n\n`;
  csvContent += 'Category,Total Spent (' + currencyCode + '),Percentage of Total\n';

  Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .forEach(([cat, sum]) => {
      const pct = totalAmount > 0 ? ((sum / totalAmount) * 100).toFixed(1) : '0';
      csvContent += `"${cat}","${sum}","${pct}%"\n`;
    });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Naija_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate and download a formatted PDF report with jsPDF
 */
export const exportExpensesToPDF = (
  expenses: Expense[],
  categories: Category[],
  currencyCode: CurrencyCode = 'NGN'
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  const totalAmount = sorted.reduce((sum, e) => sum + e.amount, 0);

  // Header background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 35, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('NAIJA EXPENSE TRACKER REPORT', 15, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Generated on ${dateStr} • Total Records: ${sorted.length}`, 15, 26);

  // Summary box
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(15, 42, 180, 24, 3, 3, 'F');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.text('Total Expenditure', 22, 51);
  doc.text('Transactions', 90, 51);
  doc.text('Top Category', 145, 51);

  // Calculate top category
  const catSums: Record<string, number> = {};
  sorted.forEach((e) => {
    const cName = catMap.get(e.categoryId) || 'Other';
    catSums[cName] = (catSums[cName] || 0) + e.amount;
  });
  const topCatEntry = Object.entries(catSums).sort(([, a], [, b]) => b - a)[0];
  const topCatName = topCatEntry ? topCatEntry[0] : 'None';

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text(formatCurrency(totalAmount, currencyCode), 22, 60);

  doc.setTextColor(15, 23, 42);
  doc.text(String(sorted.length), 90, 60);
  doc.text(topCatName.slice(0, 16), 145, 60);

  // Table Headers
  let y = 76;
  doc.setFillColor(226, 232, 240);
  doc.rect(15, y, 180, 8, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Date', 18, y + 5.5);
  doc.text('Category', 48, y + 5.5);
  doc.text('Note', 90, y + 5.5);
  doc.text('Payment', 142, y + 5.5);
  doc.text('Amount', 190, y + 5.5, { align: 'right' });

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  sorted.forEach((exp, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 4, 180, 7.5, 'F');
    }

    doc.setTextColor(71, 85, 105);
    doc.text(exp.date, 18, y + 1);

    const cName = catMap.get(exp.categoryId) || 'Other';
    doc.setTextColor(15, 23, 42);
    doc.text(cName.slice(0, 18), 48, y + 1);

    const note = (exp.note || '-').slice(0, 25);
    doc.setTextColor(100, 116, 139);
    doc.text(note, 90, y + 1);

    doc.setTextColor(71, 85, 105);
    doc.text(exp.paymentMethod, 142, y + 1);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(formatCurrency(exp.amount, currencyCode), 190, y + 1, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 7.5;
  });

  // Footer page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount} • Naija Expense Tracker`, 105, 290, { align: 'center' });
  }

  doc.save(`Naija_Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
