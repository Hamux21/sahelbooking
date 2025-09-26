<template>
  <div class="superadmin-layout">
    <aside class="sidebar">
      <h2>SuperAdmin</h2>
      <div class="user-info">
        <p><strong>{{ user?.email }}</strong></p>
        <p>Rôle: {{ user?.role }}</p>
        <button @click="logout" class="logout-btn">Déconnexion</button>
      </div>
      <ul>
        <li :class="{active: currentView==='dashboard'}" @click="currentView='dashboard'">Dashboard</li>
        <li :class="{active: currentView==='search'}" @click="currentView='search'">Rechercher un vol</li>
        <li :class="{active: currentView==='users'}" @click="currentView='users'">Gestion des utilisateurs</li>
        <li :class="{active: currentView==='reservations'}" @click="currentView='reservations'">Gestion des réservations</li>
        <li :class="{active: currentView==='supervision'}" @click="currentView='supervision'">Supervision globale</li>
      </ul>
    </aside>
    <main class="main-content">
      <div v-if="currentView==='dashboard'">
        <h2>Tableau de bord Super Administrateur</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <h4>Utilisateurs</h4>
            <p class="stat-value">{{ stats.users }}</p>
          </div>
          <div class="stat-card">
            <h4>Admins</h4>
            <p class="stat-value">{{ stats.admins }}</p>
          </div>
          <div class="stat-card">
            <h4>SuperAdmins</h4>
            <p class="stat-value">{{ stats.superadmins }}</p>
          </div>
          <div class="stat-card">
            <h4>Réservations</h4>
            <p class="stat-value">{{ stats.reservations }}</p>
          </div>
        </div>
        <p style="margin-top:24px;">Bienvenue sur le dashboard !</p>
      </div>
      <div v-if="currentView==='search'">
        <FlightSearch />
      </div>
      <div v-if="currentView==='users'">
        <button @click="showAddUserModal = true" class="add-user-btn">Ajouter un utilisateur</button>
        <div v-if="showAddUserModal" class="modal-overlay" @click.self="showAddUserModal = false">
          <div class="modal-content">
            <h4>Ajouter un utilisateur (après inscription Auth)</h4>
            <input v-model="newUser.id" placeholder="UUID (auth.users)" />
            <input v-model="newUser.email" placeholder="Email" />
            <input v-model="newUser.first_name" placeholder="Prénom" />
            <input v-model="newUser.last_name" placeholder="Nom" />
            <select v-model="newUser.role">
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
              <option value="superadmin">SuperAdmin</option>
            </select>
            <button @click="addUser">Ajouter</button>
            <button @click="showAddUserModal = false">Annuler</button>
          </div>
        </div>
        <section>
          <h3>Gestion des utilisateurs</h3>
          <div class="filters-row">
            <input v-model="userSearch" placeholder="Rechercher par email, prénom ou nom..." class="filter-input" />
            <select v-model="userRoleFilter" class="filter-input">
              <option value="">Tous rôles</option>
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
              <option value="superadmin">SuperAdmin</option>
            </select>
          </div>
          <table class="user-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Rôle</th>
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
                  <select v-model="user.role">
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">SuperAdmin</option>
                  </select>
                </td>
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
        </section>
      </div>
      <div v-if="currentView==='reservations'">
        <section>
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
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in paginatedReservations" :key="r.id">
                <td>{{ r.reservation_number }}</td>
                <td>{{ r.user_email || r.user_id }}</td>
                <td>{{ r.total_price }} {{ r.currency }}</td>
                <td>{{ r.status }}</td>
                <td>{{ formatDate(r.created_at) }}</td>
              </tr>
            </tbody>
          </table>
          <div class="pagination">
            <button :disabled="reservationPage === 1" @click="reservationPage--">&lt;</button>
            <span>Page {{ reservationPage }} / {{ reservationPageCount }}</span>
            <button :disabled="reservationPage === reservationPageCount" @click="reservationPage++">&gt;</button>
          </div>
        </section>
      </div>
      <div v-if="currentView==='supervision'">
        <section>
          <h3>Supervision globale</h3>
          <ul>
            <li>Total utilisateurs : {{ stats.users }}</li>
            <li>Total admins : {{ stats.admins }}</li>
            <li>Total superadmins : {{ stats.superadmins }}</li>
            <li>Total réservations : {{ stats.reservations }}</li>
          </ul>
          <p style="margin-top:16px;">(Graphiques et exports à venir)</p>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import { supabase, TABLES } from '@/config/supabase'
import FlightSearch from './FlightSearch.vue'
import { handleLogout } from '@/router/index'
export default {
  name: 'SuperAdminDashboard',
  components: { FlightSearch },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      users: [],
      showAddUserModal: false,
      newUser: {
        id: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'user'
      },
      currentView: 'dashboard',
      reservations: [],
      stats: {
        users: 0,
        admins: 0,
        superadmins: 0,
        reservations: 0
      },
      userSearch: '',
      userRoleFilter: '',
      reservationSearch: '',
      reservationStatusFilter: '',
  userPage: 1,
  userPageSize: 5,
  reservationPage: 1,
  reservationPageSize: 5
    }
  },
  computed: {
    paginatedUsers() {
      const start = (this.userPage - 1) * this.userPageSize
      const end = start + this.userPageSize
      return this.filteredUsers.slice(start, end)
    },
    filteredUsers() {
      return this.users.filter(u => {
        const search = this.userSearch.toLowerCase()
        const matchSearch =
          u.email?.toLowerCase().includes(search) ||
          u.first_name?.toLowerCase().includes(search) ||
          u.last_name?.toLowerCase().includes(search)
        const matchRole = this.userRoleFilter ? u.role === this.userRoleFilter : true
        return matchSearch && matchRole
      })
    },
    userPageCount() {
      return Math.ceil(this.filteredUsers.length / this.userPageSize) || 1
    },
    paginatedReservations() {
      const start = (this.reservationPage - 1) * this.reservationPageSize
      const end = start + this.reservationPageSize
      return this.filteredReservations.slice(start, end)
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
        this.stats.users = data.filter(u => u.role === 'user').length
        this.stats.admins = data.filter(u => u.role === 'admin').length
        this.stats.superadmins = data.filter(u => u.role === 'superadmin').length
      }
    },
    async fetchReservations() {
      const { data, error } = await supabase.from(TABLES.RESERVATIONS).select('*')
      if (!error) {
        this.reservations = data
        this.stats.reservations = data.length
        // Optionnel : peupler user_email si besoin
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
        last_name: user.last_name,
        role: user.role
      }).eq('id', user.id)
      await this.fetchUsers()
    },
    async toggleActive(user) {
      await supabase.from(TABLES.USERS).update({ active: !user.active }).eq('id', user.id)
      await this.fetchUsers()
    },
    async addUser() {
      if (!this.newUser.id || !this.newUser.email) return
      await supabase.from(TABLES.USERS).insert([{ ...this.newUser, active: true }])
      this.newUser = { id: '', email: '', first_name: '', last_name: '', role: 'user' }
      this.showAddUserModal = false
      await this.fetchUsers()
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
.stats-grid {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 24px 32px;
  min-width: 160px;
  text-align: center;
}
.stat-value {
  font-size: 2.2rem;
  font-weight: bold;
  color: #1a237e;
  margin-top: 8px;
}
.reservation-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-top: 16px;
}
.reservation-table th, .reservation-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}
.reservation-table th {
  background: #f7f7f7;
  font-weight: 600;
}
.reservation-table tr:last-child td {
  border-bottom: none;
}
.superadmin-layout {
  display: flex;
  min-height: 80vh;
}
.sidebar {
  width: 220px;
  background: #1a237e;
  color: #fff;
  padding: 32px 0 0 0;
  min-height: 100vh;
  box-shadow: 2px 0 8px rgba(0,0,0,0.06);
}
.sidebar h2 {
  text-align: center;
  margin-bottom: 16px;
  font-size: 1.3rem;
  letter-spacing: 1px;
}
.user-info {
  padding: 16px 32px;
  border-bottom: 1px solid #3949ab;
  margin-bottom: 16px;
}
.user-info p {
  margin: 4px 0;
  font-size: 0.9rem;
}
.user-info strong {
  color: #fff;
}
.logout-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-top: 8px;
  width: 100%;
}
.logout-btn:hover {
  background: #d32f2f;
}
.sidebar ul {
  list-style: none;
  padding: 0;
}
.sidebar li {
  padding: 16px 32px;
  cursor: pointer;
  transition: background 0.2s;
}
.sidebar li.active, .sidebar li:hover {
  background: #3949ab;
}
.main-content {
  flex: 1;
  padding: 40px 32px;
  background: #f7f7f7;
  min-height: 100vh;
}
.add-user-btn {
  margin-bottom: 16px;
}
section {
  margin-bottom: 32px;
}
</style>
