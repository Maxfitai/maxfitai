import type { CollectionConfig } from 'payload'

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  admin: {
    useAsTitle: 'id',
    group: 'Enrollments',
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
        description: 'The user who is enrolling',
      },
    },
    {
      name: 'coach',
      type: 'relationship',
      relationTo: 'coaches',
      required: true,
      admin: {
        description: 'The coach whose plan the user is enrolling in',
      },
    },
    {
      name: 'plan',
      type: 'relationship',
      relationTo: 'plans',
      required: true,
      admin: {
        description: 'The plan the user is enrolling in',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: {
        description: 'Status of the enrollment request',
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Optional notes from the user',
      },
    },
  ],
}
