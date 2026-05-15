import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import type { Message, Contact, Connection } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendada',
  sent: 'Enviada',
}

const resolveContent = (content: string, contacts: Contact[], contactIds: string[]): string => {
  const first = contacts.find((c) => contactIds.includes(c.id))
  if (!first) return content
  return content
    .replace(/\{\{nome\}\}/gi, first.name)
    .replace(/\{\{telefone\}\}/gi, first.phone)
}

const getContactNames = (contactIds: string[], contacts: Contact[]): string =>
  contactIds
    .map((id) => contacts.find((c) => c.id === id)?.name ?? 'Desconhecido')
    .join(', ')

export const generateMessagesReport = (
  connection: Connection,
  messages: Message[],
  contacts: Contact[],
  userName: string
): void => {
  const doc = new jsPDF()
  const now = dayjs().locale('pt-br')
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFillColor(99, 102, 241)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('Broadcast', 14, 18)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Relatório de Mensagens', 14, 28)

  doc.setFontSize(9)
  doc.text(`Gerado em ${now.format('DD/MM/YYYY [às] HH:mm')}`, pageWidth - 14, 28, { align: 'right' })

  doc.setTextColor(30, 41, 59)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`Conexão: ${connection.name}`, 14, 54)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`Usuário: ${userName}`, 14, 62)

  const sent = messages.filter((m) => m.status === 'sent').length
  const scheduled = messages.filter((m) => m.status === 'scheduled').length
  const totalContacts = new Set(messages.flatMap((m) => m.contactIds)).size

  const summaryItems = [
    { label: 'Total de mensagens', value: String(messages.length) },
    { label: 'Enviadas', value: String(sent) },
    { label: 'Agendadas', value: String(scheduled) },
    { label: 'Contatos alcançados', value: String(totalContacts) },
  ]

  const cardW = (pageWidth - 28 - 12) / 4
  const cardX = 14

  summaryItems.forEach((item, i) => {
    const x = cardX + i * (cardW + 4)

    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, 70, cardW, 22, 2, 2, 'F')

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(99, 102, 241)
    doc.text(item.value, x + cardW / 2, 80, { align: 'center' })

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(item.label, x + cardW / 2, 87, { align: 'center' })
  })

  const rows = messages.map((m) => [
    resolveContent(m.content, contacts, m.contactIds).slice(0, 60) +
      (m.content.length > 60 ? '...' : ''),
    getContactNames(m.contactIds, contacts),
    dayjs(m.scheduledAt).locale('pt-br').format('DD/MM/YYYY HH:mm'),
    m.sentAt ? dayjs(m.sentAt).locale('pt-br').format('DD/MM/YYYY HH:mm') : '-',
    STATUS_LABELS[m.status] ?? m.status,
  ])

  autoTable(doc, {
    startY: 100,
    head: [['Mensagem', 'Contatos', 'Agendado para', 'Enviado em', 'Status']],
    body: rows,
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 45 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
      4: { cellWidth: 25 },
    },
    margin: { left: 14, right: 14 },
  })

  const pageCount = (doc.internal as any).getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `Broadcast — ${connection.name} — Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
  }

  doc.save(`relatorio-${connection.name.toLowerCase().replace(/\s+/g, '-')}-${now.format('YYYY-MM-DD')}.pdf`)
}