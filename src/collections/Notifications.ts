import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'id',
    group: 'Notifications',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.collection === 'admins') return true
      if (req.user?.collection === 'coaches') return true
      if (req.user?.collection === 'users') return true
      return false
    },
    create: ({ req }) => {
      if (req.user?.collection === 'admins') return true
      return false
    },
    update: ({ req }) => {
      if (req.user?.collection === 'admins') return true
      if (req.user?.collection === 'coaches') return true
      if (req.user?.collection === 'users') return true
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
      relationTo: ['users', 'coaches'],
      required: true,
      admin: {
        description: 'Who this notification is for',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Enrollment Request', value: 'enrollment_request' },
        { label: 'Enrollment Accepted', value: 'enrollment_accepted' },
        { label: 'Enrollment Rejected', value: 'enrollment_rejected' },
        { label: 'New Message', value: 'new_message' },
      ],
      admin: {
        description: 'Type of notification',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Notification title',
      },
    },
    {
      name: 'message',
      type: 'text',
      required: true,
      admin: {
        description: 'Notification message',
      },
    },
    {
      name: 'relatedId',
      type: 'text',
      required: false,
      admin: {
        description: 'ID of related entity (enrollment, conversation, etc.)',
      },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the notification has been read',
      },
    },
  ],
}
