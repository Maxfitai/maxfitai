import type { CollectionConfig } from 'payload'

export const Plans: CollectionConfig = {
  slug: 'plans',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: ({ req }) => {
      // Coaches can read their own plans, admins can read all
      if (req.user?.collection === 'admins') return true
      if (req.user?.collection === 'coaches') return true
      return false
    },
    create: ({ req }) => {
      // Only coaches and admins can create plans
      return req.user?.collection === 'coaches'
    },
    update: ({ req, id, data }) => {
      // Coaches can update their own plans, admins can update any
      if (req.user?.collection === 'admins') return false
      if (req.user?.collection === 'coaches') {
        // Check if the plan belongs to this coach
        return data?.coach === req.user.id
      }
      return false
    },
    delete: ({ req, id, data }) => {
      // Coaches can delete their own plans, admins can delete any
      if (req.user?.collection === 'admins') return true
      if (req.user?.collection === 'coaches') return true
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
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
      ],
    },
    {
      name: 'coach',
      type: 'relationship',
      relationTo: 'coaches',
      required: true,
      admin: {
        description: 'The coach who created this plan',
      },
    },
    {
      name: 'duration',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g., "30 minutes", "1 hour", "4 weeks"',
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      required: true,
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
      ],
    },
    {
      name: 'price',
      type: 'number',
      required: false,
      min: 0,
      admin: {
        description: 'Price in USD (optional)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'workouts',
      type: 'array',
      fields: [
        {
          name: 'day',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g., "Day 1", "Monday", "Week 1"',
          },
        },
        {
          name: 'exercises',
          type: 'array',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'sets',
              type: 'number',
              required: false,
            },
            {
              name: 'reps',
              type: 'text',
              required: false,
            },
            {
              name: 'duration',
              type: 'text',
              required: false,
            },
            {
              name: 'rest',
              type: 'text',
              required: false,
            },
            {
              name: 'notes',
              type: 'textarea',
              required: false,
            },
          ],
        },
      ],
    },
    {
      name: 'nutrition',
      type: 'group',
      fields: [
        {
          name: 'calories',
          type: 'text',
          required: false,
        },
        {
          name: 'protein',
          type: 'text',
          required: false,
        },
        {
          name: 'carbs',
          type: 'text',
          required: false,
        },
        {
          name: 'fats',
          type: 'text',
          required: false,
        },
        {
          name: 'meals',
          type: 'array',
          fields: [
            {
              name: 'mealType',
              type: 'select',
              options: [
                { label: 'Breakfast', value: 'breakfast' },
                { label: 'Lunch', value: 'lunch' },
                { label: 'Dinner', value: 'dinner' },
                { label: 'Snack', value: 'snack' },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
            },
          ],
        },
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
  ],
}
