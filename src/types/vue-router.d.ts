declare module 'vue-router' {
  interface RouteMeta {
    /** page title */
    title?: string
    /** keepalive */
    keepAlive?: boolean
    /** requires authentication */
    requiresAuth?: boolean
    /** requires admin role */
    requiresAdmin?: boolean
  }
}
export {}
