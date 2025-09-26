<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <h1>SahelBooking - Admin</h1>
        <div class="user-info">
          <span>Bonjour, {{ user?.email }}</span>
          <span>Rôle: {{ user?.role }}</span>
          <button @click="logout" class="logout-btn">Déconnexion</button>
        </div>
      </div>
    </header>

    <div class="admin-layout">
      <aside class="sidebar">
        <nav class="nav-menu">
          <ul>
            <li :class="{active: currentView==='dashboard'}" @click="currentView='dashboard'">
              Dashboard
            </li>
            <li :class="{active: currentView==='search'}" @click="currentView='search'">
              Rechercher un vol
            </li>
            <li :class="{active: currentView==='users'}" @click="currentView='users'">
              Gestion des utilisateurs
            </li>
            <li :class="{active: currentView==='reservations'}" @click="currentView='reservations'">
              Gestion des réservations
            </li>
          </ul>
        </nav>
      </aside>

      <main class="main-content">
        <div v-if="currentView==='dashboard'">
          <h2>Tableau de bord Administrateur</h2>
          <p>Bienvenue sur votre dashboard administrateur !</p>
        </div>

        <div v-if="currentView==='search'">
          <FlightSearch :user="user" @logout="logout" />
        </div>

        <div v-if="currentView==='users'">
          <h3>Gestion des utilisateurs</h3>
          <div class="filters-row">
            <input v-model="userSearch" placeholder="Rechercher par email, prénom ou nom..." class="filter-input" />
          </div>
          <table class="user-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedUsers" :key="user.id">
                <td>{{ user.email }}</td>
                <td><input v-model="user.first_name" /></td>
                <td><input v-model="user.last_name" /></td>
                <td>
                  <span v-if="user.active">Actif</span>
                  <span v-else>Inactif</span>
                </td>
                <td>
                  <button @click="updateUser(user)">Enregistrer</button>
                  <button @click="toggleActive(user)">{{ user.active ? 'Désactiver' : 'Activer' }}</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="pagination">
            <button :disabled="userPage === 1" @click="userPage--">&lt;</button>
            <span>Page {{ userPage }} / {{ userPageCount }}</span>
            <button :disabled="userPage === userPageCount" @click="userPage++">&gt;</button>
          </div>
        </div>

        <div v-if="currentView==='reservations'">
          <h3>Gestion des réservations</h3>
          <div class="filters-row">
            <input v-model="reservationSearch" placeholder="Rechercher par numéro, email, statut..." class="filter-input" />
            <select v-model="reservationStatusFilter" class="filter-input">
              <option value="">Tous statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <table class="reservation-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Utilisateur</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in paginatedReservations" :key="r.id">
                <td>{{ r.reservation_number }}</td>
                <td>{{ r.user_email || r.user_id }}</td>
                <td>{{ r.total_price }} {{ r.currency }}</td>
                <td>{{ r.status }}</td>
                <td>{{ formatDate(r.created_at) }}</td>
                <td>
                  <button @click="viewReservation(r)">Voir</button>
                  <button @click="printTicket(r)">Imprimer</button>
                  <button v-if="r.status !== 'cancelled'" @click="cancelReservation(r)">Annuler (-30%)</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="pagination">
            <button :disabled="reservationPage === 1" @click="reservationPage--">&lt;</button>
            <span>Page {{ reservationPage }} / {{ reservationPageCount }}</span>
            <button :disabled="reservationPage === reservationPageCount" @click="reservationPage++">&gt;</button>
          </div>
          <div v-if="showReservationModal" class="modal-overlay" @click.self="showReservationModal = false">
            <div class="modal-content">
              <h4>Détail réservation</h4>
              <div v-if="selectedReservation">
                <p><strong>Numéro :</strong> {{ selectedReservation.reservation_number }}</p>
                <p><strong>Utilisateur :</strong> {{ selectedReservation.user_email || selectedReservation.user_id }}</p>
                <p><strong>Montant :</strong> {{ selectedReservation.total_price }} {{ selectedReservation.currency }}</p>
                <p><strong>Statut :</strong> {{ selectedReservation.status }}</p>
                <p><strong>Date :</strong> {{ formatDate(selectedReservation.created_at) }}</p>
                <button @click="showReservationModal = false">Fermer</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>

import { supabase, TABLES } from '@/config/supabase'
import FlightSearch from './FlightSearch.vue'
import { handleLogout } from '@/router/index'

export default {
  name: 'AdminDashboard',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentView: 'dashboard',
      users: [],
      userSearch: '',
      userPage: 1,
      userPageSize: 5,
      reservations: [],
      reservationSearch: '',
      reservationStatusFilter: '',
      reservationPage: 1,
      reservationPageSize: 5,
      showReservationModal: false,
      selectedReservation: null
    }
  },
  computed: {
    filteredUsers() {
      return this.users.filter(u => {
        const search = this.userSearch.toLowerCase()
        return (
          u.email?.toLowerCase().includes(search) ||
          u.first_name?.toLowerCase().includes(search) ||
          u.last_name?.toLowerCase().includes(search)
        )
      })
    },
    paginatedUsers() {
      const start = (this.userPage - 1) * this.userPageSize
      const end = start + this.userPageSize
      return this.filteredUsers.slice(start, end)
    },
    userPageCount() {
      return Math.ceil(this.filteredUsers.length / this.userPageSize) || 1
    },
    filteredReservations() {
      return this.reservations.filter(r => {
        const search = this.reservationSearch.toLowerCase()
        const matchSearch =
          (r.reservation_number?.toLowerCase().includes(search) ||
            r.user_email?.toLowerCase().includes(search) ||
            r.status?.toLowerCase().includes(search))
        const matchStatus = this.reservationStatusFilter ? r.status === this.reservationStatusFilter : true
        return matchSearch && matchStatus
      })
    },
    paginatedReservations() {
      const start = (this.reservationPage - 1) * this.reservationPageSize
      const end = start + this.reservationPageSize
      return this.filteredReservations.slice(start, end)
    },
    reservationPageCount() {
      return Math.ceil(this.filteredReservations.length / this.reservationPageSize) || 1
    }
  },
  methods: {
    logout() {
      handleLogout(this.user?.role)
    },
    async fetchUsers() {
      const { data, error } = await supabase.from(TABLES.USERS).select('*')
      if (!error) {
        this.users = data
      }
    },
    async fetchReservations() {
      const { data, error } = await supabase.from(TABLES.RESERVATIONS).select('*')
      if (!error) {
        this.reservations = data
        for (const r of this.reservations) {
          const user = this.users.find(u => u.id === r.user_id)
          r.user_email = user ? user.email : ''
        }
      }
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    },
    async updateUser(user) {
      await supabase.from(TABLES.USERS).update({
        first_name: user.first_name,
        last_name: user.last_name
      }).eq('id', user.id)
      await this.fetchUsers()
    },
    async toggleActive(user) {
      await supabase.from(TABLES.USERS).update({ active: !user.active }).eq('id', user.id)
      await this.fetchUsers()
    },
    viewReservation(res) {
      this.selectedReservation = res
      this.showReservationModal = true
    },
    printTicket(res) {
      window.print() // Simple impression, à adapter pour un vrai ticket
    },
    async cancelReservation(res) {
      if (!confirm('Confirmer l’annulation ? 30% de pénalité seront appliqués.')) return
      const penalite = Math.round(res.total_price * 0.3 * 100) / 100
      const nouveauMontant = Math.round((res.total_price - penalite) * 100) / 100
      await supabase.from(TABLES.RESERVATIONS).update({
        status: 'cancelled',
        total_price: nouveauMontant
      }).eq('id', res.id)
      await this.fetchReservations()
    }
  },
  mounted() {
    this.fetchUsers()
    this.fetchReservations()
  }
}
</script>

<style scoped>
.filters-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.filter-input {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
}
.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}
.pagination button {
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid #888;
  background: #f8f8f8;
  cursor: pointer;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
/* Table styles (optionnel) */
.user-table, .reservation-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-top: 16px;
}
.user-table th, .user-table td, .reservation-table th, .reservation-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}
.user-table th, .reservation-table th {
  background: #f7f7f7;
  font-weight: 600;
}
.user-table tr:last-child td, .reservation-table tr:last-child td {
  border-bottom: none;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  min-width: 320px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
}
.admin-dashboard {
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

.admin-layout {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  padding: 2rem 0;
}

.nav-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  padding: 1rem 2rem;
  cursor: pointer;
  transition: background 0.2s;
  border-left: 3px solid transparent;
}

.nav-menu li:hover {
  background: #34495e;
}

.nav-menu li.active {
  background: #3498db;
  border-left-color: #2980b9;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background: white;
}
</style>
