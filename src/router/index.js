import { createRouter, createWebHistory } from 'vue-router'
import { supabase, authService, getUserRoleById } from '@/config/supabase'

// Logout handler
export const handleLogout = async (userRole = 'user') => {
  try {
    await authService.signOut()
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'superadmin':
        window.location.href = '/superadmin'
        break
      case 'admin':
        window.location.href = '/admin'
        break
      case 'user':
      default:
        window.location.href = '/users'
        break
    }
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Route components
import AuthPage from '@/components/AuthPage.vue'
import UserDashboard from '@/components/UserDashboard.vue'
import AdminDashboard from '@/components/AdminDashboard.vue'
import SuperAdminDashboard from '@/components/SuperAdminDashboard.vue'

// Navigation guards
const requireAuth = async (to, from, next) => {
  try {
    const user = await authService.getCurrentUser()

    if (!user) {
      next('/login')
      return
    }

    // Get user role
    const role = await getUserRoleById(user.id)

    // Redirect based on role if trying to access wrong route
    if (to.meta.requiresRole) {
      if (to.meta.requiresRole !== role) {
        // Redirect to appropriate dashboard based on role
        switch (role) {
          case 'superadmin':
            next('/admin')
            return
          case 'admin':
            next('/admin')
            return
          case 'user':
          default:
            next('/users')
            return
        }
      }
    }

    next()
  } catch (error) {
    console.error('Auth check failed:', error)
    next('/login')
  }
}

const routes = [
  {
    path: '/',
    name: 'FlightSearch',
    component: () => import('@/components/FlightSearch.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: AuthPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/users',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { requiresAuth: true, requiresRole: 'user' },
    beforeEnter: requireAuth
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresRole: 'admin' },
    beforeEnter: requireAuth
  },
  {
    path: '/superadmin',
    name: 'SuperAdminDashboard',
    component: SuperAdminDashboard,
    meta: { requiresAuth: true, requiresRole: 'superadmin' },
    beforeEnter: requireAuth
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth) {
    try {
      const user = await authService.getCurrentUser()

      if (!user) {
        next('/login')
        return
      }

      // Get user role and redirect to appropriate dashboard
      const role = await getUserRoleById(user.id)

      if (to.path === '/users' && role !== 'user') {
        switch (role) {
          case 'superadmin':
            next('/superadmin')
            return
          case 'admin':
            next('/admin')
            return
          default:
            next('/users')
            return
        }
      }

      if (to.path === '/admin' && !['admin', 'superadmin'].includes(role)) {
        next('/users')
        return
      }

      if (to.path === '/superadmin' && role !== 'superadmin') {
        switch (role) {
          case 'admin':
            next('/admin')
            return
          case 'user':
          default:
            next('/users')
            return
        }
      }

      next()
    } catch (error) {
      console.error('Navigation guard error:', error)
      next('/login')
    }
  } else {
    // For non-protected routes, check if user is already authenticated
    try {
      const user = await authService.getCurrentUser()

      if (user && to.path === '/login') {
        // Redirect authenticated users to their appropriate dashboard
        const role = await getUserRoleById(user.id)

        switch (role) {
          case 'superadmin':
            next('/superadmin')
            return
          case 'admin':
            next('/admin')
            return
          case 'user':
          default:
            next('/users')
            return
        }
      }

      next()
    } catch (error) {
      next()
    }
  }
})

export default router
