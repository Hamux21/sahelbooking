<template>
  <div class="superadmin-layout">
    <aside class="sidebar-modern">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <i class="bi bi-shield-lock-fill"></i>
        </div>
        <div class="sidebar-title">Superadministrateur</div>
      </div>
      <div class="sidebar-user-info" style="padding: 0 24px 24px 24px; border-bottom: 1px solid #2e5fd0;">
        <div class="sidebar-user-email">{{ user?.email }}</div>
        <div class="sidebar-user-role">{{ user?.role }}</div>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li :class="{active: currentView==='dashboard'}" @click="currentView='dashboard'">
            <i class="bi bi-grid-1x2-fill"></i>
            <span>Tableau de bord</span>
          </li>
          <li :class="{active: currentView==='users'}" @click="currentView='users'">
            <i class="bi bi-person-badge"></i>
            <span>Gestion des utilisateurs</span>
          </li>
          <li :class="{active: currentView==='reservations'}" @click="currentView='reservations'">
            <i class="bi bi-calendar-check"></i>
            <span>Réservations</span>
          </li>
          <li :class="{active: currentView==='supervision'}" @click="currentView='supervision'">
            <i class="bi bi-bar-chart-line"></i>
            <span>Supervision globale</span>
          </li>
        </ul>
      </nav>
      <div class="sidebar-bottom">
        <button @click="logout" class="sidebar-logout">
          <i class="bi bi-box-arrow-right"></i> Déconnexion
        </button>
      </div>
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
          <table class="users-table-modern">
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
              <tr v-for="user in paginatedUsers" :key="user.id" :class="{ 'inactive': !user.active }">
                <td class="email-cell">
                  <div class="email-info">
                    <strong>{{ user.email }}</strong>
                  </div>
                </td>
                <td class="name-cell">
                  <input v-model="user.first_name" placeholder="Prénom" class="inline-input" />
                </td>
                <td class="name-cell">
                  <input v-model="user.last_name" placeholder="Nom" class="inline-input" />
                </td>
                <td class="role-cell">
                  <select v-model="user.role" class="inline-input">
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">SuperAdmin</option>
                  </select>
                </td>
                <td class="status-cell">
                  <span class="status-indicator" :class="user.active ? 'active' : 'inactive'">
                    <span class="status-dot"></span>
                    {{ user.active ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <div class="action-buttons">
                    <button @click="updateUser(user)" class="btn-save-mini" title="Enregistrer">💾</button>
                    <button @click="toggleActive(user)" class="btn-toggle-mini" :class="user.active ? 'deactivate' : 'activate'" :title="user.active ? 'Désactiver' : 'Activer'">
                      {{ user.active ? '🔒' : '✅' }}
                    </button>
                  </div>
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
      <div v-if="currentView==='flights'">
        <section>
          <h3>Consultation des vols</h3>
          <div class="filters-row">
            <input v-model="flightSearch" placeholder="Rechercher par code aéroport..." class="filter-input" />
            <select v-model="tripTypeFilter" class="filter-input">
              <option value="">Tous types</option>
              <option value="oneWay">Aller simple</option>
              <option value="roundTrip">Aller-retour</option>
            </select>
            <select v-model="travelClassFilter" class="filter-input">
              <option value="">Toutes classes</option>
              <option value="ECONOMY">Économique</option>
              <option value="BUSINESS">Affaires</option>
              <option value="FIRST">Première</option>
            </select>
          </div>
          <table class="flights-table">
            <thead>
              <tr>
                <th>Origine</th>
                <th>Destination</th>
                <th>Date départ</th>
                <th>Date retour</th>
                <th>Classe</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="flight in paginatedFlights" :key="flight.id">
                <td>{{ flight.origin_code }}</td>
                <td>{{ flight.destination_code }}</td>
                <td>{{ formatDateShort(flight.departure_date) }}</td>
                <td>{{ formatDateShort(flight.return_date) }}</td>
                <td>{{ formatTravelClass(flight.travel_class) }}</td>
                <td>{{ formatTripType(flight.trip_type) }}</td>
                <td>
                  <button class="btn-small" @click="viewFlightDetails(flight)">Voir</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="pagination">
            <button :disabled="flightPage === 1" @click="flightPage--">&lt;</button>
            <span>Page {{ flightPage }} / {{ flightPageCount }}</span>
            <button :disabled="flightPage === flightPageCount" @click="flightPage++">&gt;</button>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in paginatedReservations" :key="r.id">
                <td>{{ r.reservation_number }}</td>
                <td>{{ r.user_email || r.user_id }}</td>
                <td>{{ r.total_price }} {{ r.currency }}</td>
                <td>
                  <span class="status-badge" :class="r.status">{{ r.status }}</span>
                </td>
                <td>{{ formatDate(r.created_at) }}</td>
                <td>
                  <button class="btn-small" @click="viewReservation(r)">Voir</button>
                  <button class="btn-small btn-danger" @click="cancelReservation(r)" v-if="r.status !== 'cancelled'">Annuler</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="pagination">
            <button :disabled="reservationPage === 1" @click="reservationPage--">&lt;</button>
            <span>Page {{ reservationPage }} / {{ reservationPageCount }}</span>
            <button :disabled="reservationPage === reservationPageCount" @click="reservationPage++">&gt;</button>
          </div>
        </section>
        <!-- Modal de détails réservation -->
        <div v-if="showReservationModal" class="modal-overlay" @click.self="showReservationModal = false">
          <div class="modal-content" id="recu-reservation">
            <h3>Détail de la réservation</h3>
            <div v-if="selectedReservation">
              <p><strong>Numéro :</strong> {{ selectedReservation.reservation_number }}</p>
              <p><strong>Utilisateur :</strong> {{ selectedReservation.user_email || selectedReservation.user_id }}</p>
              <p><strong>Nom :</strong> {{ selectedReservation.user_first_name }} {{ selectedReservation.user_last_name }}</p>
              <p><strong>Montant :</strong> {{ selectedReservation.total_price }} {{ selectedReservation.currency }}</p>
              <p><strong>Statut :</strong> <span class="status-badge" :class="selectedReservation.status">{{ selectedReservation.status }}</span></p>
              <p><strong>Date :</strong> {{ formatDate(selectedReservation.created_at) }}</p>
              <hr />
              <button class="btn-primary" @click="printTicket(selectedReservation)">Imprimer le reçu</button>
              <button class="btn-secondary" @click="showReservationModal = false">Fermer</button>
            </div>
          </div>
        </div>
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
      reservationPageSize: 5,
      flights: [],
      flightSearch: '',
      tripTypeFilter: '',
      travelClassFilter: '',
      flightPage: 1,
      flightPageSize: 10,
      showFlightModal: false,
      selectedFlight: null,
      showReservationModal: false,
      selectedReservation: null
    }
  },
    paginatedFlights() {
      const start = (this.flightPage - 1) * this.flightPageSize
      const end = start + this.flightPageSize
      return this.filteredFlights.slice(start, end)
    },
    filteredFlights() {
      return this.flights.filter(flight => {
        const search = this.flightSearch.toLowerCase()
        const matchSearch =
          flight.origin_code?.toLowerCase().includes(search) ||
          flight.destination_code?.toLowerCase().includes(search)
        const matchTripType = this.tripTypeFilter ? flight.trip_type === this.tripTypeFilter : true
        const matchTravelClass = this.travelClassFilter ? flight.travel_class === this.travelClassFilter : true
        return matchSearch && matchTripType && matchTravelClass
      })
    },
    flightPageCount() {
      return Math.ceil(this.filteredFlights.length / this.flightPageSize) || 1
    },
    formatDateShort(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    },
    formatTravelClass(travelClass) {
      const classes = {
        'ECONOMY': 'Économique',
        'PREMIUM_ECONOMY': 'Économique Premium',
        'BUSINESS': 'Affaires',
        'FIRST': 'Première'
      }
      return classes[travelClass] || travelClass
    },
    formatTripType(tripType) {
      const types = {
        'oneWay': 'Aller simple',
        'roundTrip': 'Aller-retour'
      }
      return types[tripType] || tripType
    },
    viewFlightDetails(flight) {
      this.selectedFlight = flight
      this.showFlightModal = true
    },
    viewReservation(res) {
      this.selectedReservation = res
      this.showReservationModal = true
    },
    printTicket(res) {
      // Impression du reçu uniquement (modal)
      const printContents = document.getElementById('recu-reservation').innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Pour restaurer l'état Vue
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
  async mounted() {
    this.fetchUsers()
    this.fetchReservations()
    // Récupération des vols
    const { data, error } = await supabase.from(TABLES.FLIGHTS).select('*').order('created_at', { ascending: false })
    if (!error) {
      this.flights = data || []
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
  min-height: 100vh;
  height: 100vh;
}
/* Nouveau sidebar moderne */
.sidebar-modern {
  width: 260px;
  background: #2453c7;
  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0,0,0,0.06);
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 32px 24px 16px 24px;
}
.sidebar-logo {
  font-size: 2rem;
  color: #fff;
}
.sidebar-title {
  font-size: 1.3rem;
  font-weight: bold;
  letter-spacing: 1px;
}
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px 24px 24px;
  border-bottom: 1px solid #2e5fd0;
}
.sidebar-user-info {
  display: flex;
  flex-direction: column;
}
.sidebar-user-email {
  font-size: 0.95rem;
  font-weight: 500;
}
.sidebar-user-role {
  font-size: 0.85rem;
  color: #cfd8ff;
}
.sidebar-nav {
  flex: 1;
  margin-top: 18px;
}
.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar-nav li {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 32px;
  cursor: pointer;
  font-size: 1.08rem;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: background 0.2s, color 0.2s;
}
.sidebar-nav li.active, .sidebar-nav li:hover {
  background: #1a3e8a;
  color: #fff;
}
.sidebar-nav i {
  font-size: 1.2rem;
}
.sidebar-bottom {
  padding: 24px;
  border-top: 1px solid #2e5fd0;
}
.sidebar-logout {
  width: 100%;
  background: #fff;
  color: #2453c7;
  border: none;
  border-radius: 8px;
  padding: 10px 0;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.sidebar-logout:hover {
  background: #2453c7;
  color: #fff;
  border: 1px solid #fff;
}
.main-content {
  flex: 1;
  padding: 0;
  background: #f7f7f7;
  min-height: 100vh;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content > div[v-if="currentView='search'"] {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0 16px;
  box-sizing: border-box;
}
.main-content .search-banner, .main-content .flight-search-form {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}
@media (max-width: 1000px) {
  .main-content .search-banner, .main-content .flight-search-form {
    max-width: 100%;
    padding: 0 8px;
  }
}

/* Réduction des marges/paddings du formulaire de recherche */
.main-content .search-banner, .main-content .flight-search-form {
  margin: 0 !important;
  padding: 0 !important;
  max-width: 900px;
  width: 100%;
}
.add-user-btn {
  margin-bottom: 16px;
  background: #2453c7;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  transition: transform 0.06s ease, background 0.2s ease;
}
.add-user-btn:hover { background: #1a3e8a; }
.add-user-btn:active { transform: translateY(1px); }
section {
  margin-bottom: 32px;
}

/* Modern table + controls (aligné au style admin) */
.users-table-modern {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  margin-top: 16px;
}
.users-table-modern thead {
  background: linear-gradient(135deg, #2453c7 0%, #1a3e8a 100%);
  color: white;
}
.users-table-modern th {
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}
.users-table-modern tbody tr {
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
}
.users-table-modern tbody tr:hover {
  background-color: #f8f9fa;
}
.users-table-modern tbody tr.inactive {
  opacity: 0.8;
}
.users-table-modern td {
  padding: 0.75rem;
  vertical-align: middle;
}
.email-cell { min-width: 200px; }
.name-cell { width: 160px; }
.role-cell { width: 140px; }
.status-cell { width: 140px; }
.actions-cell { width: 120px; }

.email-info strong { color: #2c3e50; font-size: 0.9rem; }

.inline-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: #f8f9fa;
}
.inline-input:focus {
  outline: none;
  border-color: #2453c7;
  background: white;
  box-shadow: 0 0 0 2px rgba(36,83,199,0.12);
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
}
.status-dot { width: 10px; height: 10px; border-radius: 50%; }
.status-indicator.active { color: #28a745; }
.status-indicator.inactive { color: #dc3545; }
.status-indicator.active .status-dot { background: #28a745; }
.status-indicator.inactive .status-dot { background: #dc3545; }

.action-buttons { display: flex; gap: 0.35rem; }
.btn-save-mini, .btn-toggle-mini {
  width: 34px; height: 34px; border: none; border-radius: 6px;
  cursor: pointer; font-size: 0.95rem; display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
}
.btn-save-mini { background: #e9ecef; color: #495057; }
.btn-save-mini:hover { background: #dbe0e5; }
.btn-toggle-mini { background: #e9ecef; }
.btn-toggle-mini.activate { background: #d4edda; color: #155724; }
.btn-toggle-mini.activate:hover { background: #c3e6cb; }
.btn-toggle-mini.deactivate { background: #f8d7da; color: #721c24; }
.btn-toggle-mini.deactivate:hover { background: #f1b0b7; }

/* Statut badges pour réservations */
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}
.status-badge.confirmed { background: #d4edda; color: #155724; }
.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.cancelled { background: #f8d7da; color: #721c24; }
</style>
