import type { CollectionConfig } from 'payload'

export const Admins: CollectionConfig = {
  slug: 'admins',
  auth: {
    tokenExpiration: 604800,
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
    create: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
    update: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
    delete: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    // {
    //   name: 'role',
    //   type: 'select',
    //   options: [
    //     // { label: 'Super Admin', value: 'super_admin' },
    //     { label: 'Admin', value: 'admin' },
    //   ],
    //   defaultValue: 'admin',
    //   required: true,
    // },
  ],
}