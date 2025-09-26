<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>SahelBooking</h1>
        <p>Trouvez votre vol parfait</p>
      </div>

      <AuthModal
        :show="true"
        @close="handleAuthClose"
        @auth-success="handleAuthSuccess"
      />
    </div>
  </div>
</template>

<script>
import AuthModal from './AuthModal.vue'
import { authService, getUserRoleById } from '@/config/supabase'

export default {
  name: 'AuthPage',
  components: {
    AuthModal
  },
  methods: {
    handleAuthClose() {
      // Don't allow closing on auth page
    },

    async handleAuthSuccess(authUser) {
      try {
        const role = await getUserRoleById(authUser.id)

        // Redirect to appropriate dashboard based on role
        switch (role) {
          case 'superadmin':
            this.$router.push('/superadmin')
            break
          case 'admin':
            this.$router.push('/admin')
            break
          case 'user':
          default:
            this.$router.push('/users')
            break
        }
      } catch (error) {
        console.error('Error getting user role:', error)
        // Default to user dashboard
        this.$router.push('/users')
      }
    }
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-container {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.auth-header h1 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.auth-header p {
  color: #666;
  margin-bottom: 2rem;
}
</style>
