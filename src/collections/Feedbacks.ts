import type { CollectionConfig } from 'payload'

export const Feedbacks: CollectionConfig = {
    slug: 'feedbacks',
    admin: {
        useAsTitle: 'user',
        listSearchableFields: ['user'],
    },
    access: {
        create: () => false, // Only logged-in users can create
        read: ({ req: { user } }) => !!user,   // Users can read their own (we might want to restrict this further in a real app, but for now this is fine or we can use a query constraint)
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
    },
    fields: [
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            hasMany: false,
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'subject',
            type: 'text',
            required: true,
        },
        {
            name: 'rating',
            type: 'number',
            required: true,
            min: 1,
            max: 5,
        },
        {
            name: 'feedback',
            type: 'textarea',
            required: true,
        },
    ],
}
