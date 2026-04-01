import type { CollectionConfig } from 'payload'

export const RECIPE_CATEGORIES = [
  'High Protein Meals',
  'Protein Snacks',
  'Breakfast',
  'Smoothies & Drinks',
  'Vegetarian Meals',
  'Gluten-Free Meals',
  'Healthy Desserts',
  'Quick & Easy Meals',
] as const

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number]

export const Recipes: CollectionConfig = {
  slug: 'recipes',
  admin: {
    useAsTitle: 'title',
    group: 'Collections',
    listSearchableFields: ['title', 'category'],
    defaultColumns: ['title', 'category', 'prep_minutes'],
  },
  access: {
    create: () => true,
    read: () => true,
    update: () => true,
    delete: () => true,
  },
  timestamps: true,
  fields: [
    {
      name: 'csvImporter',
      type: 'ui',
      admin: {
        components: {
          Field: '/src/components/admin/CSVImportFieldSafe#CSVImportFieldSafe',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'category',
      type: 'select',
      options: RECIPE_CATEGORIES.map((cat) => ({ label: cat, value: cat })),
    },
    {
      name: 'ingredients',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    {
      name: 'prep_minutes',
      type: 'number',
    },
    {
      name: 'imgUrl',
      type: 'text',
    },
    {
      name: 'macros',
      type: 'group',
      fields: [
        {
          name: 'kcal',
          type: 'number',
        },
        {
          name: 'protein',
          type: 'number',
        },
        {
          name: 'carbs',
          type: 'number',
        },
        {
          name: 'fat',
          type: 'number',
        },
      ],
    },
    {
      name: 'steps',
      type: 'array',
      fields: [
        {
          name: 'step',
          type: 'textarea',
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
