<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-backdrop"></div>
    <div class="modal-content auth-modal">
      <div class="modal-header">
        <h2>{{ isLogin ? 'Connexion' : 'Inscription' }}</h2>
        <button @click="$emit('close')" class="close-button">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="!isLogin" class="form-row">
          <div class="form-group">
            <label>Prénom *</label>
            <input v-model="formData.firstName" type="text" required />
          </div>
          <div class="form-group">
            <label>Nom *</label>
            <input v-model="formData.lastName" type="text" required />
          </div>
        </div>

        <div class="form-group">
          <label>Email *</label>
          <input v-model="formData.email" type="email" required />
        </div>

        <div class="form-group">
          <label>Mot de passe *</label>
          <input v-model="formData.password" type="password" required />
        </div>

        <div v-if="!isLogin" class="form-group">
          <label>Confirmer le mot de passe *</label>
          <input v-model="formData.confirmPassword" type="password" required />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn btn-primary">
            {{ loading ? 'Traitement...' : (isLogin ? 'Se connecter' : 'S\'inscrire') }}
          </button>
        </div>

        <div class="auth-switch">
          <p>
            {{ isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?' }}
            <button type="button" @click="toggleMode" class="link-button">
              {{ isLogin ? 'S\'inscrire' : 'Se connecter' }}
            </button>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { authService } from '@/config/supabase'

export default {
  name: 'AuthModal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLogin: true,
      loading: false,
      error: null,
      success: null,
      formData: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    toggleMode() {
      this.isLogin = !this.isLogin
      this.error = null
      this.success = null
      this.resetForm()
    },
    resetForm() {
      this.formData = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    },
    async handleSubmit() {
      this.loading = true
      this.error = null
      this.success = null

      try {
        if (this.isLogin) {
          await this.handleLogin()
        } else {
          await this.handleSignUp()
        }
      } catch (error) {
        this.error = error.message || 'Une erreur est survenue'
      } finally {
        this.loading = false
      }
    },
    async handleLogin() {
      const { data, error } = await authService.signIn(this.formData.email, this.formData.password)
      if (error) throw error
      this.success = 'Connexion réussie !'
      this.$emit('auth-success', data?.user)
      setTimeout(() => {
        this.$emit('close')
      }, 1500)
    },
    async handleSignUp() {
      // Validation
      if (this.formData.password !== this.formData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas')
      }
      
      if (this.formData.password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères')
      }

      const userData = {
        first_name: this.formData.firstName,
        last_name: this.formData.lastName
      }

      const { data, error } = await authService.signUp(
        this.formData.email, 
        this.formData.password, 
        userData
      )
      if (error) throw error
      this.success = 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.'
      this.$emit('auth-success', data?.user)
      setTimeout(() => {
        this.$emit('close')
      }, 2000)
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.resetForm()
        this.error = null
        this.success = null
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.auth-modal {
  max-width: 450px;
  width: 90vw;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 15px 25px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 30px 20px;
  text-align: center;
  position: relative;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.8em;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: white;
  padding: 8px;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.auth-form {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.form-group input {
  padding: 15px 18px;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f8f9fa;
  color: #2c3e50;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-group input::placeholder {
  color: #a0aec0;
}

.form-actions {
  margin-top: 10px;
}

.btn {
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.auth-switch {
  text-align: center;
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid #e2e8f0;
}

.auth-switch p {
  margin: 0;
  color: #718096;
  font-size: 0.95em;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  text-decoration: none;
  font-size: inherit;
  padding: 0;
  font-weight: 600;
  transition: color 0.2s ease;
}

.link-button:hover {
  color: #5a67d8;
  text-decoration: underline;
}

.error-message {
  background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
  color: #c53030;
  padding: 15px;
  border-radius: 12px;
  border-left: 4px solid #e53e3e;
  font-size: 0.9em;
  font-weight: 500;
}

.success-message {
  background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
  color: #276749;
  padding: 15px;
  border-radius: 12px;
  border-left: 4px solid #38a169;
  font-size: 0.9em;
  font-weight: 500;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .auth-modal {
    margin: 20px;
    width: calc(100vw - 40px);
  }

  .modal-header {
    padding: 25px 25px 15px;
  }

  .modal-header h2 {
    font-size: 1.6em;
  }

  .auth-form {
    padding: 25px;
  }
}

@media (max-width: 480px) {
  .auth-modal {
    margin: 10px;
    width: calc(100vw - 20px);
  }

  .modal-header {
    padding: 20px 20px 10px;
  }

  .modal-header h2 {
    font-size: 1.4em;
  }

  .auth-form {
    padding: 20px;
    gap: 15px;
  }

  .form-group input {
    padding: 12px 15px;
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .btn {
    padding: 14px 20px;
    font-size: 15px;
  }
}
</style>
