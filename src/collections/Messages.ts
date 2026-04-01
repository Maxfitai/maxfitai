import type { CollectionConfig } from 'payload'

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'id',
    group: 'Chat',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.collection === 'admins') return true
      if (req.user?.collection === 'coaches') return true
      if (req.user?.collection === 'users') return true
      return false
    },
    create: ({ req }) => {
      if (req.user?.collection === 'users') return true
      if (req.user?.collection === 'coaches') return true
      return false
    },
    update: ({ req }) => {
      if (req.user?.collection === 'admins') return true
      return false
    },
    delete: ({ req }) => {
      if (req.user?.collection === 'admins') return true
      return false
    },
  },
  fields: [
    {
      name: 'conversation',
      type: 'relationship',
      relationTo: 'conversations' as any,
      required: true,
      admin: {
        description: 'The conversation this message belongs to',
      },
    },
    {
      name: 'sender',
      type: 'relationship',
      relationTo: ['users', 'coaches'],
      required: true,
      admin: {
        description: 'Who sent this message',
      },
    },
    {
      name: 'content',
      type: 'text',
      required: true,
      admin: {
        description: 'Message content',
      },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the message has been read',
      },
    },
  ],
}
