// lib/hasAccess.ts

export function hasAccess(plan: string, path: string): boolean {
  const accessMap: Record<string, string[]> = {
    free: [
      '/dashboard',
      '/dashboard/ai-assistant',
      '/dashboard/plan-summary',
      '/dashboard/pricing-plan',
      '/dashboard/settings',
      '/dashboard/maxi-ai',
      '/dashboard/nutrition-plan',
      '/dashboard/workout-plan',
    ],
    starter: [
      '/dashboard',
      '/dashboard/pricing-plan',
      '/dashboard/ai-assistant',
      '/dashboard/plan-summary',
      '/dashboard/maxi-ai',
      '/dashboard/nutrition-plan',
      '/dashboard/call-history',
      '/dashboard/workout-plan',
      '/dashboard/settings',
    ],
    proFit: [
      '/dashboard',
      '/dashboard/pricing-plan',
      '/dashboard/ai-assistant',
      '/dashboard/plan-summary',
      '/dashboard/maxi-ai',
      // '/dashboard/custom-plans',
      '/dashboard/call-history',
      '/dashboard/nutrition-plan',
      '/dashboard/workout-plan',
      '/dashboard/settings',
    ],
    maxFlex: [
      '/dashboard',
      '/dashboard/pricing-plan',
      '/dashboard/ai-assistant',
      '/dashboard/nutrition-plan',
      '/dashboard/maxi-ai',
      '/dashboard/workout-plan',
      '/dashboard/plan-summary',
      // '/dashboard/custom-plans',
      '/dashboard/call-history',
      // '/dashboard/regular-updates',
      '/dashboard/settings',
    ],
  }

  return accessMap[plan]?.includes(path) ?? false
}
