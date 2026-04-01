import type { CollectionConfig } from 'payload'

export const Conversations: CollectionConfig = {
  slug: 'conversations',
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
      if (req.user?.collection === 'coaches') return true
      return false
    },
    delete: ({ req }) => {
      if (req.user?.collection === 'admins') return true
      return false
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The user in this conversation',
      },
    },
    {
      name: 'coach',
      type: 'relationship',
      relationTo: 'coaches',
      required: true,
      admin: {
        description: 'The coach in this conversation',
      },
    },
    {
      name: 'enrollment',
      type: 'relationship',
      relationTo: 'enrollments' as any,
      required: false,
      admin: {
        description: 'The enrollment that triggered this conversation',
      },
    },
    {
      name: 'lastMessage',
      type: 'text',
      required: false,
      admin: {
        description: 'Preview of the last message',
      },
    },
    {
      name: 'lastMessageAt',
      type: 'date',
      required: false,
      admin: {
        description: 'When the last message was sent',
      },
    },
    {
      name: 'userUnreadCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Unread count for user',
      },
    },
    {
      name: 'coachUnreadCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Unread count for coach',
      },
    },
  ],
}
