import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { sanitizeField, validateContactName, validatePhone, checkRateLimit } from '@/lib/security'

export interface CsvContact {
  name: string
  phone: string
}

export const parseCsv = (text: string): CsvContact[] => {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''))
  const nameIndex = headers.findIndex((h) => h.includes('nome') || h.includes('name'))
  const phoneIndex = headers.findIndex((h) =>
    h.includes('telefone') || h.includes('phone') || h.includes('tel') || h.includes('celular')
  )

  if (nameIndex === -1 || phoneIndex === -1) {
    throw new Error('O CSV deve ter colunas "nome" e "telefone"')
  }

  return lines
    .slice(1)
    .map((line) => {
      const cols = line.split(',').map((c) => c.trim().replace(/['"]/g, ''))
      return {
        name: sanitizeField(cols[nameIndex] ?? ''),
        phone: sanitizeField(cols[phoneIndex] ?? ''),
      }
    })
    .filter((c) => {
      const nameOk = validateContactName(c.name).valid
      const phoneOk = validatePhone(c.phone).valid
      return nameOk && phoneOk
    })
}

export const importContactsFromCsv = async (
  userId: string,
  connectionId: string,
  contacts: CsvContact[]
): Promise<number> => {
  if (!checkRateLimit('csv-import', 3, 60_000))
    throw new Error('Muitas importações. Aguarde um momento.')

  if (contacts.length > 1000)
    throw new Error('Limite de 1000 contatos por importação.')

  const BATCH_SIZE = 500
  let imported = 0

  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    const chunk = contacts.slice(i, i + BATCH_SIZE)

    chunk.forEach((contact) => {
      const ref = doc(collection(db, 'contacts'))
      batch.set(ref, {
        userId,
        connectionId,
        name: contact.name,
        phone: contact.phone,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    })

    await batch.commit()
    imported += chunk.length
  }

  return imported
}
