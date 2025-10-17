import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Archive } from '../types';
import { formatCurrency } from './formatters';

// Fix: Removed module augmentation for jspdf to prevent "module not found" errors.
// Type safety is bypassed by casting to 'any' where the autoTable plugin is used.

export const generateArchivePdf = (archive: Archive, currency: string) => {
    const doc = new jsPDF();
    const { periodName, periodStartDate, periodEndDate, data } = archive;
    const { members, groceries, deposits, summary } = data;

    // --- Header ---
    doc.setFontSize(20);
    doc.text('Meal Manager Archive Report', 14, 22);
    doc.setFontSize(14);
    doc.text(periodName, 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Period: ${new Date(periodStartDate).toLocaleDateString()} to ${new Date(periodEndDate).toLocaleDateString()}`, 14, 36);
    doc.text(`Archived on: ${new Date(archive.archivedAt).toLocaleString()}`, 14, 42);

    // --- Summary Table ---
    const summaryBody = members.map(m => [
        m.name,
        formatCurrency(m.totalPurchase, currency),
        formatCurrency(m.totalDeposit, currency),
        formatCurrency(m.balance, currency),
    ]);

    (doc as any).autoTable({
        startY: 50,
        head: [['Member Name', 'Total Purchase', 'Total Deposit', 'Final Balance']],
        body: summaryBody,
        foot: [[
            'Totals',
            formatCurrency(summary.totalGroceryCost, currency),
            formatCurrency(summary.totalDeposits, currency),
            ''
        ]],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo
        footStyles: { fillColor: [244, 244, 245] }, // Gray
    });

    let finalY = (doc as any).lastAutoTable.finalY;

    // --- Overall Stats ---
    doc.setFontSize(10);
    doc.text(`Total Members: ${summary.totalMembers}`, 14, finalY + 10);
    doc.text(`Average Expense per Person: ${formatCurrency(summary.averageExpense, currency)}`, 14, finalY + 15);

    // --- Grocery List Table ---
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Detailed Grocery List', 14, 22);
    const groceryBody = groceries.map(g => [
        new Date(g.date).toLocaleDateString(),
        g.name,
        g.purchaserName,
        formatCurrency(g.amount, currency),
    ]);
    (doc as any).autoTable({
        startY: 30,
        head: [['Date', 'Item', 'Purchased By', 'Amount']],
        body: groceryBody,
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38] }, // Red
    });

    // --- Deposit List Table ---
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Detailed Deposit List', 14, 22);
    const depositBody = deposits.map(d => [
        new Date(d.date).toLocaleDateString(),
        d.userName,
        formatCurrency(d.amount, currency),
        d.notes || '-',
    ]);
    (doc as any).autoTable({
        startY: 30,
        head: [['Date', 'Member', 'Amount', 'Notes']],
        body: depositBody,
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74] }, // Green
    });
    
    // --- Save the PDF ---
    doc.save(`Archive-${periodName.replace(/ /g, '_')}.pdf`);
};