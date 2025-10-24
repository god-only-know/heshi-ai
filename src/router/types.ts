import type { RouteLocationNormalized } from 'vue-router'

export type EnhancedRouteLocation = RouteLocationNormalized & {
  name: string
  meta: {
    keepAlive?: boolean
  }
}
