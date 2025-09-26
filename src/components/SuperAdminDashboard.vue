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
      <!-- Loading Overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <!-- Dashboard -->
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

      <!-- Search -->
      <div v-if="currentView==='search'">
        <FlightSearch />
      </div>

      <!-- Users Management -->
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
            <button @click="addUser" :disabled="addingUser">Ajouter</button>
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
          <table v-if="filteredUsers.length" class="user-table">
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
                  <button @click="confirmDeleteUser(user)" class="delete-btn">Supprimer</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else>Aucun utilisateur trouvé.</p>
          <div v-if="filteredUsers.length" class="pagination">
            <button :disabled="userPage === 1" @click="userPage--"><</button>
            <span>Page {{ userPage }} / {{ userPageCount }}</span>
            <button :disabled="userPage === userPageCount" @click="userPage++">></button>
          </div>
        </section>
      </div>

      <!-- Reservations Management -->
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
          <table v-if="filteredReservations.length" class="reservation-table">
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
                  <button @click="showReservationModal(r)">Détails</button>
                  <button v-if="r.status === 'pending'" @click="updateReservationStatus(r, 'confirmed')">Confirmer</button>
                  <button v-if="r.status !== 'cancelled'" @click="updateReservationStatus(r, 'cancelled')">Annuler</button>
                  <button @click="confirmDeleteReservation(r)" class="delete-btn">Supprimer</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else>Aucune réservation trouvée.</p>
          <div v-if="filteredReservations.length" class="pagination">
            <button :disabled="reservationPage === 1" @click="reservationPage--"><</button>
            <span>Page {{ reservationPage }} / {{ reservationPageCount }}</span>
            <button :disabled="reservationPage === reservationPageCount" @click="reservationPage++">></button>
          </div>
        </section>
      </div>

      <!-- Reservation Details Modal -->
      <div v-if="showReservationModal" class="modal-overlay" @click.self="closeReservationModal">
        <div class="modal-content large">
          <h4>Détails de la réservation {{ selectedReservation?.reservation_number }}</h4>
          <p><strong>Utilisateur:</strong> {{ selectedReservation?.user_email }}</p>
          <p><strong>Montant:</strong> {{ selectedReservation?.total_price }} {{ selectedReservation?.currency }}</p>
          <p><strong>Statut:</strong> {{ selectedReservation?.status }}</p>
          <p><strong>Date:</strong> {{ formatDate(selectedReservation?.created_at) }}</p>
          <!-- Add more details if needed -->
          <button @click="closeReservationModal">Fermer</button>
        </div>
      </div>

      <!-- Supervision -->
      <div v-if="currentView==='supervision'">
        <section>
          <h3>Supervision globale</h3>
          <ul>
            <li>Total utilisateurs : {{ stats.users }}</li>
            <li>Total admins : {{ stats.admins }}</li>
            <li>Total superadmins : {{ stats.superadmins }}</li>
            <li>Total réservations : {{ stats.reservations }}</li>
          </ul>
          <button @click="exportUsers">Exporter utilisateurs (CSV)</button>
          <button @click="exportReservations">Exporter réservations (CSV)</button>
          <p style="margin-top:16px;">(Graphiques à venir)</p>
        </section>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="deleteTarget" class="modal-overlay" @click.self="cancelDelete">
        <div class="modal-content">
          <h4>Confirmer la suppression</h4>
          <p>Êtes-vous sûr de vouloir supprimer {{ deleteTarget.type === 'user' ? 'l\'utilisateur' : 'la réservation' }} ? Cette action est irréversible.</p>
          <button @click="proceedDelete" class="delete-btn">Supprimer</button>
          <button @click="cancelDelete">Annuler</button>
        </div>
      </div>
    </main>

    <!-- Toast Notifications -->
    <NotificationToast v-if="toast.message" :message="toast.message" :type="toast.type" @close="toast = {}" />
  </div>
</template>

<script>
import { supabase, TABLES } from '@/config/supabase'
import FlightSearch from './FlightSearch.vue'
import NotificationToast from './NotificationToast.vue'
import { handleLogout } from '@/router/index'

export default {
  name: 'SuperAdminDashboard',
  components: { FlightSearch, NotificationToast },
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
      reservationPageSize: 5,
      loading: false,
      addingUser: false,
      showReservationModal: false,
      selectedReservation: null,
      deleteTarget: null,
      toast: {}
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
    showToast(message, type = 'info') {
      this.toast = { message, type }
      setTimeout(() => this.toast = {}, 5000)
    },
    async fetchUsers() {
      try {
        const { data, error } = await supabase.from(TABLES.USERS).select('*')
        if (error) throw error
        this.users = data
        this.stats.users = data.filter(u => u.role === 'user').length
        this.stats.admins = data.filter(u => u.role === 'admin').length
        this.stats.superadmins = data.filter(u => u.role === 'superadmin').length
      } catch (error) {
        this.showToast('Erreur lors du chargement des utilisateurs: ' + error.message, 'error')
      }
    },
    async fetchReservations() {
      try {
        const { data, error } = await supabase.from(TABLES.RESERVATIONS).select('*')
        if (error) throw error
        this.reservations = data
        this.stats.reservations = data.length
        // Populate user_email
        for (const r of this.reservations) {
          const user = this.users.find(u => u.id === r.user_id)
          r.user_email = user ? user.email : ''
        }
      } catch (error) {
        this.showToast('Erreur lors du chargement des réservations: ' + error.message, 'error')
      }
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    },
    async updateUser(user) {
      try {
        await supabase.from(TABLES.USERS).update({
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }).eq('id', user.id)
        this.showToast('Utilisateur mis à jour avec succès', 'success')
        await this.fetchUsers()
      } catch (error) {
        this.showToast('Erreur lors de la mise à jour: ' + error.message, 'error')
      }
    },
    async toggleActive(user) {
      try {
        await supabase.from(TABLES.USERS).update({ active: !user.active }).eq('id', user.id)
        this.showToast('Statut utilisateur changé', 'success')
        await this.fetchUsers()
      } catch (error) {
        this.showToast('Erreur lors du changement de statut: ' + error.message, 'error')
      }
    },
    async addUser() {
      if (!this.newUser.email) {
        this.showToast('Veuillez saisir l\'email', 'error')
        return
      }
      this.addingUser = true
      try {
        await supabase.from(TABLES.USERS).insert([{ ...this.newUser, active: true }])
        this.newUser = { id: '', email: '', first_name: '', last_name: '', role: 'user' }
        this.showAddUserModal = false
        this.showToast('Utilisateur ajouté avec succès', 'success')
        await this.fetchUsers()
      } catch (error) {
        this.showToast('Erreur lors de l\'ajout: ' + error.message, 'error')
      } finally {
        this.addingUser = false
      }
    },
    confirmDeleteUser(user) {
      this.deleteTarget = { type: 'user', item: user }
    },
    confirmDeleteReservation(reservation) {
      this.deleteTarget = { type: 'reservation', item: reservation }
    },
    async proceedDelete() {
      try {
        if (this.deleteTarget.type === 'user') {
          await supabase.from(TABLES.USERS).delete().eq('id', this.deleteTarget.item.id)
          this.showToast('Utilisateur supprimé', 'success')
          await this.fetchUsers()
        } else {
          await supabase.from(TABLES.RESERVATIONS).delete().eq('id', this.deleteTarget.item.id)
          this.showToast('Réservation supprimée', 'success')
          await this.fetchReservations()
        }
      } catch (error) {
        this.showToast('Erreur lors de la suppression: ' + error.message, 'error')
      } finally {
        this.deleteTarget = null
      }
    },
    cancelDelete() {
      this.deleteTarget = null
    },
    showReservationModal(reservation) {
      this.selectedReservation = reservation
      this.showReservationModal = true
    },
    closeReservationModal() {
      this.showReservationModal = false
      this.selectedReservation = null
    },
    async updateReservationStatus(reservation, status) {
      try {
        await supabase.from(TABLES.RESERVATIONS).update({ status }).eq('id', reservation.id)
        this.showToast('Statut mis à jour', 'success')
        await this.fetchReservations()
      } catch (error) {
        this.showToast('Erreur lors de la mise à jour: ' + error.message, 'error')
      }
    },
    exportUsers() {
      const csv = 'Email,Prénom,Nom,Rôle,Actif\n' + this.users.map(u => `${u.email},${u.first_name},${u.last_name},${u.role},${u.active}`).join('\n')
      this.downloadCSV(csv, 'utilisateurs.csv')
    },
    exportReservations() {
      const csv = 'Numéro,Utilisateur,Montant,Statut,Date\n' + this.reservations.map(r => `${r.reservation_number},${r.user_email},${r.total_price} ${r.currency},${r.status},${this.formatDate(r.created_at)}`).join('\n')
      this.downloadCSV(csv, 'reservations.csv')
    },
    downloadCSV(csv, filename) {
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    }
  },
  async mounted() {
    this.loading = true
    try {
      await this.fetchUsers()
      await this.fetchReservations()
    } catch (error) {
      this.showToast('Erreur lors du chargement initial: ' + error.message, 'error')
    } finally {
      this.loading = false
    }
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
  position: relative;
}
.add-user-btn {
  margin-bottom: 16px;
  background: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
.add-user-btn:hover {
  background: #45a049;
}
section {
  margin-bottom: 32px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-content.large {
  max-width: 700px;
}
.modal-content h4 {
  margin-top: 0;
}
.modal-content input, .modal-content select {
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.modal-content button {
  margin: 8px 8px 0 0;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.modal-content button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.delete-btn {
  background: #f44336;
  color: white;
}
.delete-btn:hover {
  background: #d32f2f;
}
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1a237e;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
