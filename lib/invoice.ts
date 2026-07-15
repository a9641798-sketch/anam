import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// You might need to add jspdf-autotable to package.json if it's not there
// npm install jspdf-autotable

export const generateInvoice = (order: any, orderItems: any[]) => {
  const doc = new jsPDF();
  
  // Set default font
  doc.setFont('helvetica');

  // --- Monogram Logo ---
  // Golden square
  doc.setFillColor(212, 175, 55);
  doc.rect(14, 15, 20, 20, 'F');
  // White HH text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('HH', 24, 29, { align: 'center' });
  
  // --- Header Brand Name ---
  doc.setFontSize(24);
  doc.setTextColor(212, 175, 55); // Gold color
  doc.text('HER HIGHNESS', 40, 26);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Premium Artificial Jewelry', 40, 32);
  
  // --- Header Invoice Title ---
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('INVOICE', 196, 26, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Order ID: #${order.id.slice(0, 8).toUpperCase()}`, 196, 32, { align: 'right' });

  // Divider Line
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);
  
  // --- Billing Details ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('BILLED TO:', 14, 52);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`${order.customer_name || 'Customer Name'}`, 14, 59);
  doc.text(`${order.customer_email || ''}`, 14, 64);
  doc.text(`${order.customer_phone || ''}`, 14, 69);
  
  if (order.shipping_address) {
     try {
       const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
       if (addr.houseNo || addr.streetAddress) {
         doc.text(`${addr.houseNo || ''} ${addr.streetAddress || ''}`.trim(), 14, 74);
         doc.text(`${addr.city || ''}, ${addr.state || ''} ${addr.pincode || ''}`.trim(), 14, 79);
       }
     } catch(e) {}
  }
  
  // --- Order Info ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('ORDER DETAILS:', 196, 52, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 196, 59, { align: 'right' });
  doc.text(`Status: ${order.payment_status.toUpperCase()}`, 196, 64, { align: 'right' });
  
  // --- Table ---
  const tableColumn = ["Item Description", "Quantity", "Unit Price", "Total"];
  const tableRows: any[] = [];
  
  orderItems.forEach(item => {
    tableRows.push([
      item.products?.name || 'Product',
      item.quantity,
      `Rs. ${item.price_at_time.toFixed(2)}`,
      `Rs. ${(item.price_at_time * item.quantity).toFixed(2)}`
    ]);
  });
  
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 90,
    theme: 'grid',
    headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' },
    styles: { fontSize: 10, cellPadding: 6, textColor: [60, 60, 60], lineColor: [230, 230, 230] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY || 90;
  
  // --- Totals Box ---
  doc.setFillColor(249, 249, 249);
  doc.setDrawColor(230, 230, 230);
  doc.rect(130, finalY + 10, 66, 25, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.text('Total Amount:', 135, finalY + 26);
  
  doc.setTextColor(212, 175, 55); // Gold
  doc.text(`Rs. ${order.total_amount.toFixed(2)}`, 191, finalY + 26, { align: 'right' });
  
  // --- Footer ---
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for shopping with Her Highness.', 105, 280, { align: 'center' });
  
  return doc;
};

export const downloadInvoice = (order: any, orderItems: any[]) => {
  const doc = generateInvoice(order, orderItems);
  doc.save(`Invoice_${order.id.slice(0, 8).toUpperCase()}.pdf`);
};
