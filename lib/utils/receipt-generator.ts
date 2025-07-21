import jsPDF from 'jspdf'

interface ReceiptData {
  orderNumber: string
  customerName?: string
  customerPhone?: string
  items: Array<{
    name: string
    color: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  paymentMethod: string
  employeeName: string
  date: Date
}

export function generateReceipt(data: ReceiptData): jsPDF {
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 120] // Receipt printer size
  })

  // Header
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('AutoPaint Pro Shop', 40, 10, { align: 'center' })
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('123 Paint Street, City, State 12345', 40, 15, { align: 'center' })
  doc.text('Phone: (555) 123-4567', 40, 19, { align: 'center' })
  
  // Line separator
  doc.line(5, 22, 75, 22)
  
  // Order details
  let yPos = 28
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Receipt #${data.orderNumber}`, 5, yPos)
  
  yPos += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Date: ${data.date.toLocaleDateString()} ${data.date.toLocaleTimeString()}`, 5, yPos)
  
  yPos += 4
  doc.text(`Cashier: ${data.employeeName}`, 5, yPos)
  
  if (data.customerName) {
    yPos += 4
    doc.text(`Customer: ${data.customerName}`, 5, yPos)
  }
  
  if (data.customerPhone) {
    yPos += 4
    doc.text(`Phone: ${data.customerPhone}`, 5, yPos)
  }
  
  // Line separator
  yPos += 5
  doc.line(5, yPos, 75, yPos)
  
  // Items
  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('ITEMS', 5, yPos)
  
  yPos += 5
  doc.setFont('helvetica', 'normal')
  
  data.items.forEach(item => {
    // Item name and color
    const itemText = `${item.name} (${item.color})`
    doc.text(itemText, 5, yPos)
    
    yPos += 4
    // Quantity, price, total
    doc.text(`${item.quantity} x $${item.price.toFixed(2)}`, 5, yPos)
    doc.text(`$${item.total.toFixed(2)}`, 65, yPos, { align: 'right' })
    
    yPos += 5
  })
  
  // Line separator
  doc.line(5, yPos, 75, yPos)
  
  // Totals
  yPos += 6
  doc.text('Subtotal:', 5, yPos)
  doc.text(`$${data.subtotal.toFixed(2)}`, 65, yPos, { align: 'right' })
  
  yPos += 4
  doc.text(`Tax (${(data.taxRate * 100).toFixed(1)}%):`, 5, yPos)
  doc.text(`$${data.taxAmount.toFixed(2)}`, 65, yPos, { align: 'right' })
  
  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL:', 5, yPos)
  doc.text(`$${data.total.toFixed(2)}`, 65, yPos, { align: 'right' })
  
  yPos += 6
  doc.setFont('helvetica', 'normal')
  doc.text(`Payment: ${data.paymentMethod}`, 5, yPos)
  
  // Footer
  yPos += 10
  doc.line(5, yPos, 75, yPos)
  yPos += 5
  doc.setFontSize(7)
  doc.text('Thank you for your business!', 40, yPos, { align: 'center' })
  doc.text('Return policy: 30 days with receipt', 40, yPos + 4, { align: 'center' })
  
  return doc
}

export function printReceipt(data: ReceiptData) {
  const pdf = generateReceipt(data)
  
  // Create blob and print
  const blob = pdf.output('blob')
  const url = URL.createObjectURL(blob)
  
  const printWindow = window.open(url, '_blank')
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print()
      printWindow.onafterprint = () => {
        printWindow.close()
        URL.revokeObjectURL(url)
      }
    }
  }
}