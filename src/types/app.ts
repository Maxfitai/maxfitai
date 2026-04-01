export type AppPlan = 'free' | 'starter' | 'proFit' | 'maxFlex'

export type AppSubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'

export interface AppUser {
  id: string
  email: string
  firstName: string
  lastName: string
  profileImg?: string
  plan: AppPlan
  emailVerified?: boolean
  aiCallsUsed?: number
  maxAiCalls?: number
  minutesUsed?: number
  minutesAllowed?: number
  currentPeriodEnd?: string | null
  stripeCustomerId?: string
  stripeSubscriptionId?: string | null
  stripePriceId?: string | null
  stripeProductId?: string | null
  subscriptionStatus?: AppSubscriptionStatus
  cancelAtPeriodEnd?: boolean
  callsPeriodStart?: string | null
  callsPeriodEnd?: string | null
  planUpdatedAt?: string | null
}
