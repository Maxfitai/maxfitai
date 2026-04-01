import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 604800, // 7 days
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
  fields: [
    // Email added by default
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
      name: 'gender',
      type: 'text',
      required: true,
    },
    {
      name: 'plan',
      type: 'select',
      required: true,
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        // { label: 'Starter', value: 'starter' },
        { label: 'Pro Fit', value: 'proFit' },
        { label: 'Max Flex', value: 'maxFlex' },
      ],
    },
    {
      name: 'language',
      type: 'select',
      required: true,
      defaultValue: 'english',
      options: [
        { label: 'English', value: 'english' },
        { label: 'Arabic', value: 'arabic' },
        { label: 'Spanish', value: 'spanish' },
        { label: 'French', value: 'french' },
        { label: 'Urdu', value: 'urdu' },
      ],
    },
    {
      name: 'aiCallsUsed',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'maxAiCalls',
      type: 'number',
      defaultValue: 1, // Free plan gets 1 session
      access: {
        read: () => true,
        update: () => true,
      },
    },
    // {
    //   name: 'minutesAllowed',
    //   type: 'number',
    //   defaultValue: 1, // Free plan gets 1 session (sessions are now the quota unit)
    //   access: {
    //     read: () => true,
    //     update: () => true,
    //   },
    // },
    {
      name: 'minutesUsed',
      type: 'number',
      defaultValue: 0,
      admin: {
        components: {
          Field: '/src/components/admin/MinutesUsedField#MinutesUsedField',
        },
      },
      access: {
        read: () => true,
        update: () => true,
      },
    },
    // {
    //   name: 'aiCallHistory',
    //   type: 'array',
    //   fields: [
    //     { name: 'timestamp', type: 'date' },
    //     { name: 'type', type: 'text' }, // e.g., "nutrition", "workout"
    //     { name: 'response', type: 'textarea' },
    //   ],
    // },

    // ---------- Stripe billing mirror fields ----------
    // {
    //   name: 'stripeCustomerId',
    //   type: 'text',
    //   admin: { readOnly: true },
    //   index: true,
    // },
    // {
    //   name: 'stripeSubscriptionId',
    //   type: 'text',
    //   admin: { readOnly: true },
    //   index: true,
    // },
    // {
    //   name: 'stripePriceId',
    //   type: 'text',
    //   admin: { readOnly: true },
    // },
    // {
    //   name: 'stripeProductId',
    //   type: 'text',
    //   admin: { readOnly: true },
    // },
    // {
    //   name: 'subscriptionStatus',
    //   type: 'select',
    //   admin: { readOnly: true },
    //   options: [
    //     { label: 'Trialing', value: 'trialing' },
    //     { label: 'Active', value: 'active' },
    //     { label: 'Past Due', value: 'past_due' },
    //     { label: 'Canceled', value: 'canceled' },
    //     { label: 'Unpaid', value: 'unpaid' },
    //     { label: 'Incomplete', value: 'incomplete' },
    //     { label: 'Incomplete Expired', value: 'incomplete_expired' },
    //     { label: 'Paused', value: 'paused' },
    //   ],
    // },
    // {
    //   name: 'cancelAtPeriodEnd',
    //   type: 'checkbox',
    //   admin: { readOnly: true },
    //   defaultValue: false,
    // },
    // {
    //   name: 'currentPeriodEnd',
    //   type: 'date',
    //   admin: { readOnly: true },
    // },
    // {
    //   name: 'callsPeriodStart',
    //   type: 'date',
    //   admin: { readOnly: true },
    // },
    // {
    //   name: 'callsPeriodEnd',
    //   type: 'date',
    //   admin: { readOnly: true },
    // },
    // {
    //   name: 'planUpdatedAt',
    //   type: 'date',
    //   admin: { readOnly: true },
    // },
    {
      name: 'emailVerified',
      type: 'checkbox',
      defaultValue: false,
      access: {
        read: () => true,
        update: () => true,
      },
    },
    // {
    //   name: 'paypalSubscriptionId',
    //   type: 'text',
    //   admin: {
    //     position: 'sidebar',
    //   },
    // },
    // {
    //   name: 'IsPasswordUpdated',
    //   type: 'date',
    // },
    // {
    //   name: 'paypalCustomerId',
    //   type: 'text',
    //   admin: {
    //     position: 'sidebar',
    //   },
    // },
    {
      name: 'dodoSubscriptionId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'dodoCustomerId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'subscriptionStartDate',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'subscriptionCanceledAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'subscriptionEndDate',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'subscriptionCanceled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastPlanContext',
      type: 'json',
      admin: {
        description:
          'Array of all previous AI plan contexts (full workout + diet details). Appended on each generation for paid users only.',
        readOnly: true,
      },
    },
    {
      name: 'profileImg',
      type: 'text',
    },
  ],
}
