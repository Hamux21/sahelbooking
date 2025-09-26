<template>
  <div class="user-dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <h1>SahelBooking</h1>
        <div class="user-info">
          <span>Bonjour, {{ user?.email }}</span>
          <button @click="logout" class="logout-btn">Déconnexion</button>
        </div>
      </div>
    </header>

    <main class="dashboard-main">
      <FlightSearch :user="user" @logout="logout" />
    </main>
  </div>
</template>

<script>
import FlightSearch from './FlightSearch.vue'
import { handleLogout } from '@/router/index'

export default {
  name: 'UserDashboard',
  components: {
    FlightSearch
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  methods: {
    logout() {
      handleLogout(this.user?.role)
    }
  }
}
</script>

<style scoped>
.user-dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-header {
  background: #1a237e;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info span {
  font-size: 0.9rem;
}

.logout-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.logout-btn:hover {
  background: #d32f2f;
}

.dashboard-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
