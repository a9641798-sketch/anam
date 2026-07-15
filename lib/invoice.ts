import jsPDF from 'jspdf';
import 'jspdf-autotable';

// You might need to add jspdf-autotable to package.json if it's not there
// npm install jspdf-autotable

export const generateInvoice = (order: any, orderItems: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(212, 175, 55); // Gold color
  doc.text('HER HIGHNESS', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Premium Artificial Jewelry', 14, 30);
  
  // Invoice Details
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('INVOICE', 150, 22);
  
  doc.setFontSize(10);
  doc.text(`Order ID: ${order.id.slice(0, 8).toUpperCase()}`, 150, 30);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 150, 35);
  doc.text(`Status: ${order.payment_status.toUpperCase()}`, 150, 40);
  
  // Customer Details
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Bill To:', 14, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`${order.customer_name}`, 14, 57);
  doc.text(`${order.customer_email}`, 14, 62);
  doc.text(`${order.customer_phone}`, 14, 67);
  if (order.shipping_address) {
     const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
     doc.text(`${addr.houseNo}, ${addr.streetAddress}`, 14, 72);
     doc.text(`${addr.state}, ${addr.pincode}`, 14, 77);
  }
  
  // Table
  const tableColumn = ["Item", "Quantity", "Price", "Total"];
  const tableRows: any[] = [];
  
  orderItems.forEach(item => {
    const itemData = [
      item.products?.name || 'Product',
      item.quantity,
      `Rs. ${item.price_at_time.toFixed(2)}`,
      `Rs. ${(item.price_at_time * item.quantity).toFixed(2)}`
    ];
    tableRows.push(itemData);
  });
  
  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 90,
    theme: 'grid',
    headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255] },
    styles: { fontSize: 10, cellPadding: 5 }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY || 90;
  
  // Totals
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`Total Amount: Rs. ${order.total_amount.toFixed(2)}`, 140, finalY + 10);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for shopping with Her Highness.', 105, 280, { align: 'center' });
  
  return doc;
};

export const downloadInvoice = (order: any, orderItems: any[]) => {
  const doc = generateInvoice(order, orderItems);
  doc.save(`Invoice_${order.id.slice(0, 8).toUpperCase()}.pdf`);
};
