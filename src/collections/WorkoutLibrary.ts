import type { CollectionConfig } from 'payload'

export const WorkoutLibrary: CollectionConfig = {
  slug: 'workout-library',
  admin: {
    useAsTitle: 'title',
    group: 'Collections',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.collection === 'admins') return true
      if (req.user?.collection === 'coaches') return true
      return false
    },
    create: ({ req }) => {
      return req.user?.collection === 'coaches'
    },
    update: ({ req, data }) => {
      // if (req.user?.collection === 'admins') return true
      if (req.user?.collection === 'coaches') {
        return data?.coach === req.user.id
      }
      return false
    },
    delete: ({ req, data }) => {
      if (req.user?.collection === 'admins') return true
      if (req.user?.collection === 'coaches') {
        return data?.coach === req.user.id
      }
      return false
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'coach',
      type: 'relationship',
      relationTo: 'coaches',
      required: true,
    },
    {
      name: 'contentType',
      type: 'select',
      required: true,
      options: [
        { label: 'YouTube Video', value: 'youtube' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'Instagram', value: 'instagram' },
      ],
    },
    {
      name: 'videoUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'URL to the video content',
      },
    },
    {
      name: 'thumbnailUrl',
      type: 'text',
      admin: {
        description: 'Optional custom thumbnail URL',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Strength Training', value: 'strength' },
        { label: 'Cardio', value: 'cardio' },
        { label: 'Yoga', value: 'yoga' },
        { label: 'HIIT', value: 'hiit' },
        { label: 'Nutrition', value: 'nutrition' },
        { label: 'Recovery', value: 'recovery' },
        { label: 'Mobility', value: 'mobility' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Make visible to clients',
      },
    },
  ],
}
