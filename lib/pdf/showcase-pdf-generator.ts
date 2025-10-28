import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ShowcasePDFData } from './types'

// Funções auxiliares
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatCurrency(value: number): string {
  return `₲${Math.round(value).toLocaleString('es-PY')}`
}

export async function generateShowcasePDF(data: ShowcasePDFData): Promise<void> {
  const doc = new jsPDF()
  
  // Configurações
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 15
  let yPos = margin

  // === LOGO E CABEÇALHO ===
  // Logo Dalia Joias (quadrado azul com texto branco)
  doc.setFillColor(41, 128, 185)
  doc.rect(margin, yPos, 20, 15, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('DALIA', margin + 3, yPos + 8)
  doc.text('JOIAS', margin + 3, yPos + 12)
  
  // Título principal
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Anexo de Piezas Consignadas', pageWidth / 2, yPos + 10, { align: 'center' })
  yPos += 25

  // === INFORMAÇÕES DO DOCUMENTO ===
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  
  // Linha 1: Número do anexo e C.I.
  doc.text(`Anexo de Piezas Consignadas No: ${data.showcase_code}`, margin, yPos)
  doc.text(`C.I: ${data.distributor_id.slice(0, 10)}`, pageWidth - margin - 35, yPos)
  yPos += 5
  
  // Linha 2: Cliente
  doc.text(`Cliente: ${data.distributor_name}`, margin, yPos)
  yPos += 5
  
  // Linha 3: Correo
  doc.text(`Correo: ${data.distributor_email || ''}`, margin, yPos)
  yPos += 5

  // Linha 4: Fecha e Teléfono
  doc.text(`Fecha: ${formatDate(data.sent_date)}`, margin, yPos)
  
  // Formatar telefone com prefixo internacional se necessário
  let phoneText = '+595 985 673 005' // Padrão
  if (data.distributor_phone) {
    const phone = data.distributor_phone
    // Se começar com +, usar direto; se começar com 55, adicionar +; senão adicionar +595
    if (phone.startsWith('+')) {
      phoneText = phone
    } else if (phone.startsWith('55')) {
      phoneText = `+${phone}`
    } else if (phone.startsWith('595')) {
      phoneText = `+${phone}`
    } else {
      phoneText = `+595 ${phone}`
    }
  }
  
  doc.text(`Teléfono: ${phoneText}`, pageWidth - margin - 60, yPos)
  yPos += 5

  // Linha 5: Dirección completa
  const fullAddress = data.distributor_address || 'Pedro Juan Caballero'
  doc.text(`Dirección: ${fullAddress}`, margin, yPos)
  yPos += 10

  // === TABELA DE PRODUTOS ===
  // Calcular totais
  const totalPieces = data.summary.total_sent_pieces
  const totalValue = data.summary.total_showcase_value
  
  // Preparar dados da tabela
  const tableData = data.products.map(p => [
    p.product_code,           // Coluna 1: Código
    p.product_name,           // Coluna 2: Producto
    '',                       // Coluna 3: Vazia
    formatCurrency(p.unit_price) // Coluna 4: Precio
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Código', 'Producto', '', 'Precio']],
    body: tableData,
    foot: [
      ['', 'bolsa personalizada', '', formatCurrency(150000)],
      ['', '', '', ''],
      ['', 'Total de Guaraníes =', 'GS', formatCurrency(totalValue)],
      ['', 'Total de Piezas =', `${totalPieces} unidades`, '']
    ],
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
      valign: 'middle'
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 8,
      halign: 'left',
      valign: 'middle'
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 30, halign: 'left' },      // Código
      1: { cellWidth: 90, halign: 'left' },      // Producto
      2: { cellWidth: 20, halign: 'center' },    // Vazia
      3: { cellWidth: 40, halign: 'right' }      // Precio
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto'
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  // === SEÇÃO DE NOTAS ===
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Notas:', margin, yPos)
  yPos += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const noteText = 'Declaro haber recibido las piezas citadas en este documento.'
  doc.text(noteText, margin, yPos)
  yPos += 15

  // === ASSINATURA ===
  const signatureY = pageHeight - 45

  // Linha para assinatura (mais longa)
  const signatureLineStart = pageWidth / 2 - 50
  const signatureLineEnd = pageWidth / 2 + 50
  doc.setLineWidth(0.5)
  doc.line(signatureLineStart, signatureY, signatureLineEnd, signatureY)
  
  // Nome do revendedor abaixo da linha
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(data.distributor_name, pageWidth / 2, signatureY + 6, { align: 'center' })

  // Informações do sistema no rodapé
  const finalFooterY = pageHeight - 10
  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generado: ${formatDateTime(new Date())}`, margin, finalFooterY)
  doc.text('Sistema Dalia Joias', pageWidth - margin, finalFooterY, { align: 'right' })

  // === SEGUNDA PÁGINA (SE HOUVER VENDA REGISTRADA) ===
  if (data.has_sale) {
    doc.addPage()
    yPos = margin

    // Cabeçalho da página de venda
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('RELATÓRIO DE VENDA', pageWidth / 2, yPos, { align: 'center' })
    yPos += 10

    doc.setFontSize(10)
    doc.text(`Mostruário: ${data.showcase_code}`, margin, yPos)
    yPos += 8

    // Informações da venda
    doc.setFont('helvetica', 'normal')
    doc.text(`Data da Venda: ${data.sale_date ? formatDate(data.sale_date) : 'N/A'}`, margin, yPos)
    yPos += 6
    
    if (data.sale_description) {
      doc.text(`Descrição: ${data.sale_description}`, margin, yPos)
      yPos += 6
    }
    yPos += 4

    // Tabela de produtos vendidos
    const saleTableData = data.products
      .filter(p => (p.sold_quantity || 0) > 0)
      .map(p => [
        p.product_code,
        p.product_name,
        (p.sold_quantity || 0).toString(),
        formatCurrency(p.unit_price),
        formatCurrency((p.sold_quantity || 0) * p.unit_price),
        `${p.commission_percentage || 0}%`,
        formatCurrency(p.commission_value || 0)
      ])

    autoTable(doc, {
      startY: yPos,
      head: [['Código', 'Produto', 'Qtd', 'Preço Unit.', 'Total', 'Comissão', 'Valor Com.']],
      body: saleTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 25, halign: 'right' }
      }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // Resumo financeiro
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo Financeiro', margin, yPos)
    yPos += 7

    const summaryData = [
      ['Peças Enviadas:', data.summary.total_sent_pieces.toString()],
      ['Peças Devolvidas:', data.summary.total_returned_pieces.toString()],
      ['Peças Vendidas:', data.summary.total_sold_pieces.toString()],
      ['Valor Total das Vendas:', formatCurrency(data.summary.total_sales_value)],
      ['Comissão Total:', formatCurrency(data.summary.total_commission)]
    ]

    autoTable(doc, {
      startY: yPos,
      body: summaryData,
      theme: 'plain',
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: margin }
    })
  }

  // Adicionar metadados ao PDF
  doc.setProperties({
    title: `Mostruário ${data.showcase_code}`,
    subject: 'Anexo de Piezas Consignadas',
    author: 'Sistema Dalia Joias',
    creator: 'Dalia Joias PDF Generator',
    keywords: `mostruário, ${data.showcase_code}, joias`
  })

  // Salvar PDF
  doc.save(`Anexo-Piezas-${data.showcase_code}.pdf`)
}
