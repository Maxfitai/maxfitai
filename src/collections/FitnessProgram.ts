import type { CollectionConfig } from 'payload'

export const FitnessPrograms: CollectionConfig = {
  slug: 'fitness-programs',
  admin: {
    useAsTitle: 'user',
    group: 'Collections',
    listSearchableFields: ['user'],
    defaultColumns: ['id', 'user', 'generatedAt'],
  },
  access: {
    read: () => true,
    create: () => false,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'user',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'userDetails',
      type: 'group',
      fields: [
        { name: 'age', type: 'number' },
        { name: 'weight', type: 'number' },
        { name: 'height', type: 'text' },
        { name: 'fitnessGoals', type: 'textarea' },
        { name: 'injuries', type: 'textarea' },
        { name: 'fitnessLevel', type: 'text' },
        { name: 'workoutDaysPerWeek', type: 'number' },
        { name: 'dietaryRestrictions', type: 'textarea' },
      ],
    },
    {
      name: 'workoutPlan',
      type: 'json',
      required: true,
    },
    {
      name: 'dietPlan',
      type: 'json',
      required: true,
    },
    {
      name: 'generatedAt',
      type: 'date',
      defaultValue: () => new Date(),
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
        { label: 'Draft', value: 'draft' },
      ],
      defaultValue: 'active',
    },
  ],
  timestamps: true,
}
