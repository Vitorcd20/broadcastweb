export interface User {
  uid: string
  email: string
  displayName: string | null
  createdAt: Date
}

export interface Connection {
  id: string
  userId: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Contact {
  id: string
  userId: string
  connectionId: string
  name: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

export type MessageStatus = 'scheduled' | 'sent'

export interface Message {
  id: string
  userId: string
  connectionId: string
  contactIds: string[]
  content: string
  status: MessageStatus
  scheduledAt: Date
  sentAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface FirestoreConnection extends Omit<Connection, 'id' | 'createdAt' | 'updatedAt'> {
  createdAt: { toDate: () => Date }
  updatedAt: { toDate: () => Date }
}

export interface FirestoreContact extends Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> {
  createdAt: { toDate: () => Date }
  updatedAt: { toDate: () => Date }
}

export interface FirestoreMessage extends Omit<Message, 'id' | 'scheduledAt' | 'sentAt' | 'createdAt' | 'updatedAt'> {
  scheduledAt: { toDate: () => Date }
  sentAt: { toDate: () => Date } | null
  createdAt: { toDate: () => Date }
  updatedAt: { toDate: () => Date }
}

export interface Template {
  id: string
  userId: string
  name: string
  content: string
  createdAt: Date
  updatedAt: Date
}