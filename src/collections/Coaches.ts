import type { CollectionConfig } from 'payload'

export const Coaches: CollectionConfig = {
  slug: 'coaches',
  auth: {
    tokenExpiration: 604800, // 7 days
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req }) => {
      // Coaches can read their own data, admins can read all
      if (req.user?.collection === 'admins') return true
      if (req.user?.collection === 'coaches') return true
      return false
    },
    create: ({ req }) => {
      // Only admins can create coaches
      return req.user?.collection === 'admins'
    },
    update: ({ req, id }) => {
      // Coaches can update their own profile, admins can update any
      if (req.user?.collection === 'admins') return true
      if (req.user?.collection === 'coaches' && req.user.id === id) return true
      return false
    },
    delete: ({ req }) => {
      // Only admins can delete coaches
      return req.user?.collection === 'admins'
    },
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
    {
      name: 'phone',
      type: 'text',
      required: false,
    },
    {
      name: 'bio',
      type: 'textarea',
      required: false,
    },
    {
      name: 'specializations',
      type: 'array',
      fields: [
        {
          name: 'specialization',
          type: 'text',
        },
      ],
    },
    {
      name: 'yearsOfExperience',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'certifications',
      type: 'array',
      fields: [
        {
          name: 'certification',
          type: 'text',
        },
      ],
    },
    {
      name: 'profileImage',
      type: 'text',
      required: false,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Inactive coaches cannot login',
      },
    },
    {
      name: 'calendlyUrl',
      type: 'text',
      required: false,
      admin: {
        description: 'Calendly URL for booking sessions',
      },
    },
    {
      name: 'pricePerSession',
      type: 'number',
      required: false,
      min: 0,
      defaultValue: 50,
      admin: {
        description: 'Price per session in USD',
      },
    },
  ],
}
