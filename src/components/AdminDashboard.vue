<template>
  <div class="superadmin-layout">
    <aside class="sidebar-modern">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <i class="bi bi-person-badge"></i>
        </div>
        <div class="sidebar-title">Administrateur</div>
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
          <li :class="{active: currentView==='flights'}" @click="currentView='flights'">
            <i class="bi bi-airplane"></i>
            <span>Consultation des vols</span>
          </li>
          <li :class="{active: currentView==='reservations'}" @click="currentView='reservations'">
            <i class="bi bi-calendar-check"></i>
            <span>Réservations</span>
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
        <div class="content-wrapper">
          <div v-if="currentView==='dashboard'" class="dashboard-view">
            <h2>Bienvenue sur le tableau de bord administrateur</h2>
            <div class="stats-compact">
              <div class="stat-item">
                <div class="stat-icon"><i class="bi bi-people"></i></div>
                <div class="stat-info">
                  <div class="stat-number">{{ users.length }}</div>
                  <div class="stat-label">Utilisateurs</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon"><i class="bi bi-airplane"></i></div>
                <div class="stat-info">
                  <div class="stat-number">{{ flights.length }}</div>
                  <div class="stat-label">Vols</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon"><i class="bi bi-bookmark-check"></i></div>
                <div class="stat-info">
                  <div class="stat-number">{{ reservations.length }}</div>
                  <div class="stat-label">Réservations</div>
                </div>
              </div>
            </div>
            <div class="recent-activity-compact">
              <h3>Activité récente</h3>
              <div class="activity-compact">
                <div class="activity-column">
                  <h4>Derniers utilisateurs</h4>
                  <div v-for="user in recentUsers" :key="user.id" class="activity-item-compact">
                    <span class="activity-status-compact" :class="user.active ? 'active' : 'inactive'">
                      {{ user.active ? 'Actif' : 'Inactif' }}
                    </span>
                    <span class="activity-text">{{ user.email }}</span>
                  </div>
                </div>
                <div class="activity-column">
                  <h4>Dernières réservations</h4>
                  <div v-for="res in recentReservations" :key="res.id" class="activity-item-compact">
                    <span class="activity-status-compact" :class="res.status">{{ res.status }}</span>
                    <span class="activity-text">{{ res.reservation_number }} - {{ res.user_email }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="currentView==='users'">
          <div class="section-header">
            <h3>Gestion des utilisateurs</h3>
            <div class="section-stats">
              <span class="stat-badge">{{ users.length }} utilisateur(s)</span>
              <span class="stat-badge active">{{ activeUsersCount }} actif(s)</span>
              <span class="stat-badge inactive">{{ inactiveUsersCount }} inactif(s)</span>
            </div>
          </div>
          <div clas="filters-section">
            <div class="filters-row">
              <input v-model="userSearch" placeholder="Rechercher par email, prénom ou nom..." class="filter-input" />
              <select v-model="userStatusFilter" class="filter-input">
                <option value="">Tous les statuts</option>
                <option value="active">Actifs uniquement</option>
                <option value="inactive">Inactifs uniquement</option>
              </select>
            </div>
          </div>

          <div v-if="loadingUsers" class="loading">
            Chargement des utilisateurs...
          </div>
          <div v-else-if="filteredUsers.length === 0" class="no-data">
            Aucun utilisateur trouvé
          </div>
          <div v-else class="users-table-container">
            <table class="users-table-modern">
              <thead>
                <tr>
                  <th>Statut</th>
                  <th>Email</th>
                  <th>Prénom</th>
                  <th>Nom</th>
                  <th>Rôle</th>
                  <th>Créé le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in paginatedUsers" :key="user.id" class="user-row" :class="{ 'inactive': !user.active }">
                  <td class="status-cell">
                    <span class="status-indicator" :class="user.active ? 'active' : 'inactive'">
                      <span class="status-dot"></span>
                      {{ user.active ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td class="email-cell">
                    <div class="email-info">
                      <strong>{{ user.email }}</strong>
                    </div>
                  </td>
                  <td class="name-cell">
                    <input 
                      v-model="user.first_name" 
                      @input="markUserAsModified(user)"
                      placeholder="Prénom"
                      class="inline-input"
                      :class="{ 'modified': isFieldModified(user, 'first_name'), 'disabled': user.role === 'superadmin' }"
                      :disabled="user.role === 'superadmin'"
                      :title="user.role === 'superadmin' ? 'Impossible de modifier un super admin' : ''"
                    />
                  </td>
                  <td class="name-cell">
                    <input 
                      v-model="user.last_name" 
                      @input="markUserAsModified(user)"
                      placeholder="Nom"
                      class="inline-input"
                      :class="{ 'modified': isFieldModified(user, 'last_name'), 'disabled': user.role === 'superadmin' }"
                      :disabled="user.role === 'superadmin'"
                      :title="user.role === 'superadmin' ? 'Impossible de modifier un super admin' : ''"
                    />
                  </td>
                  <td class="role-cell">
                    <span v-if="user.role" class="role-tag">{{ formatRole(user.role) }}</span>
                    <span v-else class="role-tag default">Utilisateur</span>
                  </td>
                  <td class="date-cell">
                    <small v-if="user.created_at">{{ formatDateShort(user.created_at) }}</small>
                    <small v-else>-</small>
                  </td>
                  <td class="actions-cell">
                    <div class="action-buttons">
                      <button 
                        @click="updateUser(user)" 
                        class="btn-save-mini"
                        :disabled="!isUserModified(user) || user.role === 'superadmin'"
                        :class="{ 'has-changes': isUserModified(user), 'disabled': user.role === 'superadmin' }"
                        :title="user.role === 'superadmin' ? 'Impossible de modifier un super admin' : (isUserModified(user) ? 'Enregistrer les modifications' : 'Aucune modification')"
                      >
                        <i class="bi bi-floppy"></i>
                      </button>
                      <button 
                        @click="resetUserChanges(user)" 
                        class="btn-reset-mini"
                        v-if="isUserModified(user) && user.role !== 'superadmin'"
                        title="Annuler les modifications"
                      >
                        <i class="bi bi-arrow-counterclockwise"></i>
                      </button>
                      <button 
                        @click="toggleActive(user)" 
                        class="btn-toggle-mini"
                        :class="[user.active ? 'deactivate' : 'activate', { 'disabled': user.role === 'superadmin' }]"
                        :disabled="user.role === 'superadmin'"
                        :title="user.role === 'superadmin' ? 'Impossible de modifier un super admin' : (user.active ? 'Désactiver' : 'Activer')"
                      >
                        <i v-if="user.role === 'superadmin'" class="bi bi-shield-lock"></i>
                        <i v-else-if="user.active" class="bi bi-lock"></i>
                        <i v-else class="bi bi-unlock"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="filteredUsers.length > userPageSize" class="pagination">
            <!-- ...pagination utilisateurs... -->
          </div>
        </div>

        <div v-if="currentView==='flights'">
          <div class="section-header">
            <h3>Consultation des vols</h3>
          </div>
          <div class="filters-section">
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
          </div>
          <div v-if="loadingFlights" class="loading">Chargement des vols...</div>
          <div v-else-if="filteredFlights.length === 0" class="no-data">Aucun vol trouvé</div>
          <div v-else class="flights-table-container">
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
          </div>
        </div>

        <div v-if="currentView==='reservations'">
          <div class="section-header">
            <h3>Gestion des réservations</h3>
          </div>
          <div class="filters-section">
            <div class="filters-row">
              <input v-model="reservationSearch" placeholder="Rechercher par numéro, email, statut..." class="filter-input" />
              <select v-model="reservationStatusFilter" class="filter-input">
                <option value="">Tous statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>
          <div v-if="loadingReservations" class="loading">Chargement des réservations...</div>
          <div v-else-if="filteredReservations.length === 0" class="no-data">Aucune réservation trouvée</div>
          <div v-else class="reservation-table-container">
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
          </div>
        </div>



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
</main>
</div>

</template>

<script>
import { supabase, TABLES, authService, getUserRoleById } from '@/config/supabase'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      currentView: 'dashboard',
      user: null,
      users: [],
      originalUsers: [], // Pour tracking des modifications
      userSearch: '',
      userStatusFilter: '',
      userPage: 1,
      userPageSize: 15,
      flights: [],
      flightSearch: '',
      tripTypeFilter: '',
      travelClassFilter: '',
      flightPage: 1,
      flightPageSize: 10,
      showFlightModal: false,
      selectedFlight: null,
      loadingFlights: false,
      searchForm: {
        origin: '',
        destination: '',
        departureDate: '',
        returnDate: '',
        adults: 1,
        children: 0,
        travelClass: 'ECONOMY'
      },
      searchResults: [],
      reservations: [],
      reservationSearch: '',
      reservationStatusFilter: '',
      reservationPage: 1,
      reservationPageSize: 10,
      showReservationModal: false,
      selectedReservation: null,
      loading: false,
      loadingReservations: false,
      loadingUsers: false
    }
  },
  computed: {
    activeUsersCount() {
      return this.users.filter(u => u.active).length
    },
    inactiveUsersCount() {
      return this.users.filter(u => !u.active).length
    },
    filteredUsers() {
      return this.users.filter(u => {
        const search = this.userSearch.toLowerCase()
        const matchSearch = (
          u.email?.toLowerCase().includes(search) ||
          u.first_name?.toLowerCase().includes(search) ||
          u.last_name?.toLowerCase().includes(search)
        )
        
        let matchStatus = true
        if (this.userStatusFilter === 'active') {
          matchStatus = u.active === true
        } else if (this.userStatusFilter === 'inactive') {
          matchStatus = u.active === false
        }
        
        return matchSearch && matchStatus
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
    paginatedFlights() {
      const start = (this.flightPage - 1) * this.flightPageSize
      const end = start + this.flightPageSize
      return this.filteredFlights.slice(start, end)
    },
    flightPageCount() {
      return Math.ceil(this.filteredFlights.length / this.flightPageSize) || 1
    },
    
    // Nouvelles propriétés pour le dashboard
    confirmedReservationsCount() {
      return this.reservations.filter(r => r.status === 'confirmed').length
    },
    
    totalRevenue() {
      return this.reservations
        .filter(r => r.status === 'confirmed')
        .reduce((total, r) => total + (parseFloat(r.total_price) || 0), 0)
        .toFixed(0)
    },
    
    recentReservations() {
      return this.reservations
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3)
    },
    
    recentUsers() {
      return this.users
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3)
    },
    canSearch() {
      return this.searchForm.origin.trim() && this.searchForm.destination.trim() && this.searchForm.departureDate
    },
    filteredReservations() {
      return this.reservations.filter(r => {
        const search = this.reservationSearch.toLowerCase()
        const matchSearch = !search || (
          r.reservation_number?.toLowerCase().includes(search) ||
          r.user_email?.toLowerCase().includes(search) ||
          r.user_first_name?.toLowerCase().includes(search) ||
          r.user_last_name?.toLowerCase().includes(search) ||
          r.status?.toLowerCase().includes(search)
        )
        const matchStatus = !this.reservationStatusFilter || r.status === this.reservationStatusFilter
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
    async getCurrentUser() {
      try {
        const user = await authService.getCurrentUser()
        if (user) {
          const role = await getUserRoleById(user.id)
          this.user = { ...user, role }
          console.log('👤 Utilisateur récupéré:', this.user)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error)
        this.$router.push('/login')
      }
    },
    async logout() {
      try {
        await authService.signOut()
        this.$router.push('/login')
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      }
    },
    async fetchUsers() {
      this.loadingUsers = true
      try {
        console.log('🔍 Debug: Tentative de récupération des utilisateurs...')
        console.log('🔑 Utilisateur actuel:', this.user)
        console.log('📋 Table utilisée:', TABLES.USERS)
        
        // Essayons d'abord de compter tous les utilisateurs
        const { count, error: countError } = await supabase
          .from(TABLES.USERS)
          .select('*', { count: 'exact', head: true })
        
        if (countError) {
          console.error('❌ Erreur lors du comptage des utilisateurs:', countError)
        } else {
          console.log('📊 Nombre total d\'utilisateurs dans la table:', count)
        }
        
        // Récupération normale
        const { data, error } = await supabase
          .from(TABLES.USERS)
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('❌ Erreur lors de la récupération des utilisateurs:', error)
          console.error('❓ Code d\'erreur:', error.code)
          console.error('❓ Message:', error.message)
          console.error('❓ Détails:', error.details)
          return
        }
        
        console.log('📨 Réponse brute de Supabase:', data)
        this.users = data || []
        
        // Debug pour les statuts actifs/inactifs
        console.log('🔍 Debug statuts utilisateurs:')
        this.users.forEach((user, index) => {
          console.log(`� ${index + 1}. ${user.email}:`)
          console.log(`   - active: ${user.active} (type: ${typeof user.active})`)
          console.log(`   - role: ${user.role}`)
          console.log(`   - created_at: ${user.created_at}`)
        })
        
        // Gérer la colonne 'active' manquante dans la base de données
        console.log('🔧 Correction des statuts utilisateurs...')
        this.users.forEach(user => {
          if (user.active === undefined || user.active === null) {
            console.log(`⚠️ Colonne 'active' manquante pour ${user.email}, définition à true par défaut`)
            user.active = true
          }
        })
        
        // Sauvegarder une copie pour le tracking des modifications
        this.originalUsers = JSON.parse(JSON.stringify(this.users))
        console.log('👥 Utilisateurs récupérés:', this.users.length)
        console.log('📋 Détails des utilisateurs:', this.users)
        
        // Essayons aussi une requête sans filtre de sécurité si possible
        console.log('� Test avec bypass RLS (si autorisé)...')
        try {
          const { data: allUsers, error: bypassError } = await supabase
            .from(TABLES.USERS)
            .select('*', { count: 'exact' })
          
          if (!bypassError) {
            console.log('🔓 Résultat sans RLS:', allUsers?.length || 0, 'utilisateurs')
          } else {
            console.log('🔒 RLS actif, impossible de bypasser')
          }
        } catch (e) {
          console.log('🔒 Pas d\'accès bypass RLS')
        }
        
      } catch (error) {
        console.error('❌ Erreur générale lors de la récupération des utilisateurs:', error)
      } finally {
        this.loadingUsers = false
      }
    },
    async fetchFlights() {
      this.loadingFlights = true
      try {
        console.log('🛫 Récupération des vols...')
        const { data, error } = await supabase
          .from(TABLES.FLIGHTS)
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('❌ Erreur lors de la récupération des vols:', error)
          return
        }
        
        this.flights = data || []
        console.log('✅ Vols récupérés:', this.flights.length)
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des vols:', error)
      } finally {
        this.loadingFlights = false
      }
    },
    async fetchReservations() {
      this.loadingReservations = true
      try {
        // D'abord, vérifions toutes les tables disponibles et leurs données
        console.log('🔍 Tentative de récupération des réservations...')
        console.log('🗃️ Table utilisée:', TABLES.RESERVATIONS)
        
        // Essayons aussi de compter les lignes pour vérifier
        const { count, error: countError } = await supabase
          .from(TABLES.RESERVATIONS)
          .select('*', { count: 'exact', head: true })
        
        if (countError) {
          console.error('❌ Erreur lors du comptage:', countError)
        } else {
          console.log('📊 Nombre total de réservations dans la table:', count)
        }
        
        const { data: reservationsData, error: reservationsError } = await supabase
          .from(TABLES.RESERVATIONS)
          .select('*')
          .order('created_at', { ascending: false })
        
        if (reservationsError) {
          console.error('❌ Erreur lors de la récupération des réservations:', reservationsError)
          console.error('❓ Détails de l\'erreur:', reservationsError.message)
          console.error('❓ Code d\'erreur:', reservationsError.code)
          return
        }
        
        console.log('📊 Réservations brutes récupérées:', reservationsData?.length || 0)
        console.log('📋 Données des réservations:', reservationsData)
        
        if (!reservationsData || reservationsData.length === 0) {
          this.reservations = []
          console.log('⚠️ Aucune réservation trouvée dans la base de données')
          return
        }
        
        // Maintenant récupérons les utilisateurs pour chaque réservation
        const reservationsWithUsers = []
        for (const reservation of reservationsData) {
          let userInfo = null
          if (reservation.user_id) {
            const { data: userData, error: userError } = await supabase
              .from(TABLES.USERS)
              .select('email, first_name, last_name')
              .eq('id', reservation.user_id)
              .single()
            
            if (!userError && userData) {
              userInfo = userData
            }
          }
          
          reservationsWithUsers.push({
            ...reservation,
            user_email: userInfo?.email || 'Email inconnu',
            user_first_name: userInfo?.first_name || '',
            user_last_name: userInfo?.last_name || ''
          })
        }
        
        this.reservations = reservationsWithUsers
        console.log('✅ Réservations avec utilisateurs récupérées:', this.reservations.length)
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des réservations:', error)
      } finally {
        this.loadingReservations = false
      }
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    },
    // Méthodes améliorées pour la gestion des utilisateurs
    async updateUser(user) {
      // Validation des données
      if (!this.validateUserData(user)) {
        return
      }
      
      try {
        const { error } = await supabase.from(TABLES.USERS).update({
          first_name: user.first_name?.trim(),
          last_name: user.last_name?.trim()
        }).eq('id', user.id)
        
        if (error) {
          console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
          this.showNotification('Erreur lors de la mise à jour', 'error')
          return
        }
        
        // Mettre à jour les données originales pour le tracking
        const originalUser = this.originalUsers.find(u => u.id === user.id)
        if (originalUser) {
          originalUser.first_name = user.first_name
          originalUser.last_name = user.last_name
        }
        
        this.showNotification(`Utilisateur ${user.email} mis à jour avec succès`, 'success')
        console.log('✅ Utilisateur mis à jour:', user.email)
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error)
        this.showNotification('Erreur lors de la mise à jour', 'error')
      }
    },
    
    async toggleActive(user) {
      // Vérifier si c'est un super admin
      if (user.role === 'superadmin') {
        this.showNotification('Impossible de modifier le statut d\'un super admin', 'error')
        return
      }
      
      const action = user.active ? 'désactiver' : 'activer'
      const confirmMessage = `Êtes-vous sûr de vouloir ${action} l'utilisateur ${user.email} ?`
      
      if (!confirm(confirmMessage)) {
        return
      }
      
      try {
        console.log(`🔄 Tentative de ${action} l'utilisateur:`, user.email)
        console.log(`📊 État actuel: active = ${user.active}`)
        console.log(`🎯 Nouvelle valeur à enregistrer: active = ${!user.active}`)
        console.log(`👤 ID utilisateur:`, user.id)
        
        const { data, error } = await supabase
          .from(TABLES.USERS)
          .update({ active: !user.active })
          .eq('id', user.id)
          .select()
        
        if (error) {
          console.error('❌ Erreur lors du changement de statut:', error)
          this.showNotification('Erreur lors du changement de statut: ' + error.message, 'error')
          return
        }
        
        console.log('✅ Réponse Supabase:', data)
        
        // Mettre à jour localement
        user.active = !user.active
        const originalUser = this.originalUsers.find(u => u.id === user.id)
        if (originalUser) {
          originalUser.active = user.active
        }
        
        const statusText = user.active ? 'activé' : 'désactivé'
        this.showNotification(`Utilisateur ${user.email} ${statusText} avec succès`, 'success')
        console.log(`✅ Utilisateur ${statusText}:`, user.email, 'Nouvel état active:', user.active)
      } catch (error) {
        console.error('Erreur lors du changement de statut:', error)
        this.showNotification('Erreur lors du changement de statut', 'error')
      }
    },
    
    // Nouvelles méthodes pour le tracking des modifications
    markUserAsModified(user) {
      // Cette méthode est appelée automatiquement lors des changements d'input
      // Vue réactive s'occupe du reste
    },
    
    isUserModified(user) {
      const originalUser = this.originalUsers.find(u => u.id === user.id)
      if (!originalUser) return false
      
      return (
        user.first_name !== originalUser.first_name ||
        user.last_name !== originalUser.last_name
      )
    },
    
    resetUserChanges(user) {
      const originalUser = this.originalUsers.find(u => u.id === user.id)
      if (originalUser) {
        user.first_name = originalUser.first_name
        user.last_name = originalUser.last_name
      }
    },
    
    validateUserData(user) {
      if (user.first_name && user.first_name.trim().length < 2) {
        this.showNotification('Le prénom doit contenir au moins 2 caractères', 'error')
        return false
      }
      
      if (user.last_name && user.last_name.trim().length < 2) {
        this.showNotification('Le nom doit contenir au moins 2 caractères', 'error')
        return false
      }
      
      return true
    },
    
    formatRole(role) {
      const roles = {
        'user': 'Utilisateur',
        'admin': 'Administrateur',
        'superadmin': 'Super Admin'
      }
      return roles[role] || role
    },
    
    formatDateShort(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit' 
      })
    },

    formatDateTime(date) {
      if (!date) return ''
      return new Date(date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    formatTime(date) {
      if (!date) return ''
      return new Date(date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getCurrentDateTime() {
      const now = new Date()
      return now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    async refreshAllData() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchUsers(),
          this.fetchReservations(),
          this.fetchFlights()
        ])
        this.showNotification('Données actualisées avec succès', 'success')
      } catch (error) {
        console.error('Erreur lors de l\'actualisation:', error)
        this.showNotification('Erreur lors de l\'actualisation', 'error')
      } finally {
        this.loading = false
      }
    },
    
    isFieldModified(user, fieldName) {
      const originalUser = this.originalUsers.find(u => u.id === user.id)
      if (!originalUser) return false
      return user[fieldName] !== originalUser[fieldName]
    },
    
    showNotification(message, type = 'info') {
      // Pour l'instant on utilise console.log, mais on pourra ajouter un vrai système de notifications
      console.log(`[${type.toUpperCase()}] ${message}`)
      
      if (type === 'error') {
        alert(`Erreur: ${message}`)
      } else if (type === 'success') {
        // On pourrait ajouter une notification toast ici
        console.log(`✅ ${message}`)
      }
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
    // Méthodes pour les vols
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
    // Méthodes pour la recherche de vols
    async performFlightSearch() {
      if (!this.canSearch) return
      
      try {
        console.log('🔍 Recherche de vols avec critères:', this.searchForm)
        
        // Recherche dans les vols existants basée sur les critères
        let query = supabase
          .from(TABLES.FLIGHTS)
          .select('*')
          .eq('origin_code', this.searchForm.origin.toUpperCase())
          .eq('destination_code', this.searchForm.destination.toUpperCase())
        
        // Filtres optionnels
        if (this.searchForm.departureDate) {
          query = query.eq('departure_date', this.searchForm.departureDate)
        }
        
        if (this.searchForm.returnDate) {
          query = query.eq('return_date', this.searchForm.returnDate)
        }
        
        if (this.searchForm.travelClass) {
          query = query.eq('travel_class', this.searchForm.travelClass)
        }
        
        const { data, error } = await query.order('created_at', { ascending: false })
        
        if (error) {
          console.error('Erreur lors de la recherche:', error)
          alert('Erreur lors de la recherche de vols')
          return
        }
        
        this.searchResults = data || []
        console.log('✅ Résultats de recherche:', this.searchResults.length)
        
        if (this.searchResults.length === 0) {
          alert('Aucun vol trouvé pour ces critères')
        }
        
      } catch (error) {
        console.error('Erreur lors de la recherche:', error)
        alert('Erreur lors de la recherche de vols')
      }
    },
    clearSearch() {
      this.searchForm = {
        origin: '',
        destination: '',
        departureDate: '',
        returnDate: '',
        adults: 1,
        children: 0,
        travelClass: 'ECONOMY'
      }
      this.searchResults = []
    },
    // Méthode de debug temporaire
    async debugDatabase() {
      console.log('🔧 DEBUG - Test des tables de la base de données')
      
      // Test de toutes les tables possibles
      const tablesToTest = ['reservations', 'bookings', 'orders', 'flights', 'users']
      
      for (const tableName of tablesToTest) {
        try {
          console.log(`🔍 Test de la table: ${tableName}`)
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact' })
            .limit(5)
          
          if (error) {
            console.log(`❌ Erreur pour ${tableName}:`, error.message)
          } else {
            console.log(`✅ Table ${tableName}: ${count} enregistrements, premiers résultats:`, data)
          }
        } catch (e) {
          console.log(`❌ Exception pour ${tableName}:`, e.message)
        }
      }
      
      // Test de la structure de base sans RPC
      console.log('📋 Résumé des tests terminé - vérifiez les résultats ci-dessus')
    },
    
    // Debug spécifique pour les utilisateurs
    async debugUsers() {
      console.log('🔧 DEBUG UTILISATEURS - Tests avancés')
      
      // Test 1: Requête basique
      try {
        console.log('📍 Test 1: Requête basique')
        const { data: basicData, error: basicError } = await supabase
          .from('users')
          .select('*')
        
        console.log('✅ Résultat requête basique:', basicData?.length || 0, 'utilisateurs')
        if (basicError) console.error('❌ Erreur basique:', basicError)
      } catch (e) {
        console.error('❌ Exception requête basique:', e)
      }
      
      // Test 2: Requête avec select spécifique
      try {
        console.log('📍 Test 2: Select spécifique')
        const { data: selectData, error: selectError } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, active, role, created_at')
        
        console.log('✅ Résultat select spécifique:', selectData?.length || 0, 'utilisateurs')
        if (selectError) console.error('❌ Erreur select:', selectError)
      } catch (e) {
        console.error('❌ Exception select:', e)
      }
      
      // Test 3: Vérification des permissions RLS
      try {
        console.log('📍 Test 3: Vérification RLS')
        const { data: currentUser } = await supabase.auth.getUser()
        console.log('👤 Utilisateur authentifié:', currentUser.user?.id)
        console.log('📧 Email:', currentUser.user?.email)
        console.log('🏷️ Métadonnées:', currentUser.user?.user_metadata)
      } catch (e) {
        console.error('❌ Erreur auth:', e)
      }
      
      // Test 4: Tentative avec différents filtres
      try {
        console.log('📍 Test 4: Test avec différents filtres')
        
        // Sans filtre
        const { data: noFilter } = await supabase.from('users').select('*')
        console.log('📊 Sans filtre:', noFilter?.length || 0)
        
        // Avec filtre actif
        const { data: activeOnly } = await supabase.from('users').select('*').eq('active', true)
        console.log('📊 Utilisateurs actifs:', activeOnly?.length || 0)
        
        // Avec filtre rôle
        const { data: nonAdmins } = await supabase.from('users').select('*').neq('role', 'admin')
        console.log('📊 Non-admins:', nonAdmins?.length || 0)
        
      } catch (e) {
        console.error('❌ Erreur filtres:', e)
      }
      
      console.log('🏁 Fin du debug utilisateurs')
    },
    
    // Méthode pour tenter de récupérer tous les utilisateurs (bypass RLS si possible)
    async fetchAllUsersForAdmin() {
      console.log('🔓 Tentative de récupération de tous les utilisateurs pour admin...')
      
      try {
        // Méthode 1: Utiliser une vue ou fonction SQL si disponible
        const { data: allUsersData, error: allUsersError } = await supabase
          .rpc('get_all_users_for_admin')
        
        if (!allUsersError && allUsersData) {
          console.log('✅ Récupération via RPC admin réussie:', allUsersData.length)
          this.users = allUsersData
          this.originalUsers = JSON.parse(JSON.stringify(this.users))
          return
        }
      } catch (e) {
        console.log('❌ RPC admin non disponible')
      }
      
      // Méthode 2: Fallback sur la méthode normale
      console.log('📌 Utilisation de la méthode de récupération normale')
      await this.fetchUsers()
    },
    
    // Méthode pour activer tous les utilisateurs
    async activateAllUsers() {
      if (!confirm('Voulez-vous activer tous les utilisateurs inactifs ?')) {
        return
      }
      
      console.log('🔧 Activation de tous les utilisateurs...')
      let activatedCount = 0
      
      try {
        for (const user of this.users) {
          if (!user.active && !user.isDemoUser) {
            console.log(`✅ Activation de ${user.email}...`)
            
            const { error } = await supabase
              .from(TABLES.USERS)
              .update({ active: true })
              .eq('id', user.id)
            
            if (error) {
              console.error(`❌ Erreur pour ${user.email}:`, error)
            } else {
              user.active = true
              activatedCount++
            }
          }
        }
        
        // Mettre à jour les données originales
        this.originalUsers = JSON.parse(JSON.stringify(this.users))
        
        console.log(`✅ ${activatedCount} utilisateur(s) activé(s)`)
        this.showNotification(`${activatedCount} utilisateur(s) activé(s) avec succès`, 'success')
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'activation en masse:', error)
        this.showNotification('Erreur lors de l\'activation en masse', 'error')
      }
    },

    // Test spécifique pour la colonne 'active'
    async testActiveColumn() {
      console.log('🧪 Test de la colonne "active" dans la table users')
      
      try {
        // 1. Vérifier la structure de la table
        console.log('📋 1. Récupération d\'un utilisateur pour vérifier la structure...')
        const { data: sampleUser, error: sampleError } = await supabase
          .from(TABLES.USERS)
          .select('*')
          .limit(1)
          .single()
        
        if (sampleError) {
          console.error('❌ Erreur lors de la récupération d\'exemple:', sampleError)
          return
        }
        
        console.log('📊 Structure utilisateur actuelle:', Object.keys(sampleUser))
        console.log('🔍 Valeur de "active":', sampleUser.active, 'Type:', typeof sampleUser.active)
        
        // 2. Tenter une mise à jour de test
        if (sampleUser && sampleUser.id) {
          console.log('🔄 2. Test de mise à jour...')
          const testValue = sampleUser.active === false ? true : false
          
          const { data: updateResult, error: updateError } = await supabase
            .from(TABLES.USERS)
            .update({ active: testValue })
            .eq('id', sampleUser.id)
            .select()
          
          if (updateError) {
            console.error('❌ Erreur lors de la mise à jour de test:', updateError)
            this.showNotification('Erreur: ' + updateError.message, 'error')
          } else {
            console.log('✅ Mise à jour réussie:', updateResult)
            
            // Restaurer la valeur originale
            await supabase
              .from(TABLES.USERS)
              .update({ active: sampleUser.active })
              .eq('id', sampleUser.id)
            
            this.showNotification('Test de la colonne "active" réussi', 'success')
          }
        }
        
      } catch (error) {
        console.error('❌ Erreur lors du test de la colonne active:', error)
        this.showNotification('Erreur lors du test: ' + error.message, 'error')
      }
    }
  },
  async mounted() {
    console.log('AdminDashboard monté, chargement des données...')
    await this.getCurrentUser()
    await this.fetchUsers()
    await this.fetchFlights()
    await this.fetchReservations()
  }
}
</script>

<style scoped>
/* Layout principal identique superadmin */
.superadmin-layout {
  display: flex;
  min-height: 100vh;
  height: 100vh;
}
.main-content {
  flex: 1;
  background: #f7f7f7;
  padding: 32px 32px 32px 32px;
  overflow-x: auto;
  overflow-y: auto;
  min-width: 0;
  min-height: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
}
.content-wrapper {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0;
}
.filters-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  max-width: 800px;
  margin: 0 auto;
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
/* Table styles */
.user-table, .reservation-table, .flights-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-top: 16px;
  min-width: 800px;
}

.reservation-table,
.flights-table {
  max-width: 900px;
  margin: 0 auto;
}
.user-table th, .user-table td, 
.reservation-table th, .reservation-table td,
.flights-table th, .flights-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  text-align: left;
}
.user-table th, .reservation-table th, .flights-table th {
  background: #f7f7f7;
  font-weight: 600;
}
.user-table tr:last-child td, 
.reservation-table tr:last-child td,
.flights-table tr:last-child td {
  border-bottom: none;
}

.flights-table td {
  font-size: 0.9rem;
}

.btn-small {
  padding: 4px 8px;
  margin: 0 2px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  background: #007bff;
  color: white;
}

.btn-small:hover {
  background: #0056b3;
}

.btn-danger {
  background: #dc3545;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-primary {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 16px;
}

.btn-primary:hover {
  background: #0056b3;
}

.search-results {
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.search-results pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  overflow-x: auto;
}

/* Styles pour le formulaire de recherche */
.search-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-secondary:hover {
  background: #545b62;
}

.search-results-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.results-info {
  background: #e9ecef;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.results-info p {
  margin: 0;
  color: #6c757d;
  font-style: italic;
}

.admin-summary {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-top: 2rem;
}

.admin-summary ul {
  margin-top: 1rem;
}

.admin-summary li {
  margin-bottom: 0.5rem;
}

/* Styles pour la gestion améliorée des utilisateurs */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.section-stats {
  display: flex;
  gap: 1rem;
}

.stat-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: #e9ecef;
  color: #495057;
}

.stat-badge.active {
  background: #d4edda;
  color: #155724;
}

.stat-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

/* Tableau moderne pour de nombreux utilisateurs */
.users-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  margin-bottom: 2rem;
  max-width: 900px;
  margin: 0 auto;
  overflow-x: auto;
}

.users-table-modern {
  width: 100%;
  border-collapse: collapse;
}

.users-table-modern thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  opacity: 0.7;
}

.users-table-modern td {
  padding: 0.75rem;
  vertical-align: middle;
}

.status-cell {
  width: 120px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-indicator.active .status-dot {
  background: #28a745;
}

.status-indicator.inactive .status-dot {
  background: #dc3545;
}

.status-indicator.active {
  color: #28a745;
}

.status-indicator.inactive {
  color: #dc3545;
}

.email-cell {
  min-width: 200px;
}

.email-info strong {
  color: #2c3e50;
  font-size: 0.9rem;
}

.name-cell {
  width: 150px;
}

.inline-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.inline-input:focus {
  outline: none;
  border-color: #007bff;
  background: white;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.15);
}

.inline-input.modified {
  border-color: #ffc107;
  background: #fff3cd;
}

.inline-input.disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  border-color: #e9ecef;
}

.btn-toggle-mini.disabled,
.btn-save-mini.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f9fa;
  color: #6c757d;
}

.role-cell {
  width: 120px;
}

/* Sidebar moderne admin (identique superadmin) */
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

.actions-cell {
  width: 120px;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.btn-save-mini,
.btn-reset-mini,
.btn-toggle-mini {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-save-mini {
  background: #e9ecef;
  color: #6c757d;
}

.btn-save-mini:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-save-mini.has-changes {
  background: #28a745;
  color: white;
}

.btn-save-mini.has-changes:hover {
  background: #218838;
}

.btn-reset-mini {
  background: #ffc107;
  color: #212529;
}

.btn-reset-mini:hover {
  background: #e0a800;
}

.btn-toggle-mini {
  background: #e9ecef;
}

.btn-toggle-mini.activate {
  background: #d4edda;
  color: #155724;
}

.btn-toggle-mini.activate:hover {
  background: #c3e6cb;
}

.btn-toggle-mini.deactivate {
  background: #f8d7da;
  color: #721c24;
}

.btn-toggle-mini.deactivate:hover {
  background: #f1b0b7;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-btn {
  padding: 0.75rem 1rem;
  border: 2px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-weight: 600;
  color: #495057;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
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


.admin-layout {
  display: flex;
  max-width: 1000px;
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
  padding: 1rem;
  background: white;
  max-width: 100%;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-style: italic;
}

/* Styles simplifiés pour les réservations */
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.confirmed {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

/* ===== STYLES DASHBOARD COMPACT ===== */

.dashboard-view {
  padding: 0;
  max-width: 800px;
  margin: 0 auto;
}


/* Statistiques compactes */
.stats-compact {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.stat-item:hover {
  border-color: #007bff;
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.2rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Actions rapides compactes */
.quick-actions-compact {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.action-btn-compact {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.action-btn-compact:hover {
  border-color: #007bff;
  background: #f8f9ff;
}

.action-btn-compact.secondary:hover {
  border-color: #6c757d;
  background: #f8f9fa;
}

/* Activité récente compacte */
.recent-activity-compact {
  max-width: 800px;
  margin: 0 auto;
}

.recent-activity-compact h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.activity-compact {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.activity-column {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
}

.activity-column h4 {
  color: #495057;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.activity-item-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.activity-item-compact:last-child {
  border-bottom: none;
}

.activity-status-compact {
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;
  min-width: 60px;
  text-align: center;
}

.activity-status-compact.confirmed {
  background: #d4edda;
  color: #155724;
}

.activity-status-compact.pending {
  background: #fff3cd;
  color: #856404;
}

.activity-status-compact.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.activity-status-compact.active {
  background: #d4edda;
  color: #155724;
}

.activity-status-compact.inactive {
  background: #f8d7da;
  color: #721c24;
}

.activity-text {
  flex: 1;
  color: #495057;
  font-size: 0.8rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
    max-width: 100%;
  }
  
  .sidebar-modern {
    width: 100%;
    order: -1;
    min-height: auto;
  }
  
  .main-content {
    padding: 1rem;
    order: 1;
  }
  
  .content-wrapper {
    max-width: 100%;
    padding: 0 0.5rem;
  }
  
  .stats-compact {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quick-actions-compact {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .activity-compact {
    grid-template-columns: 1fr;
  }
  
  .filters-row,
  .section-header,
  .filters-section {
    max-width: 100%;
    margin: 0;
  }
  
  .users-table-container,
  .reservation-table,
  .flights-table {
    max-width: 100%;
    overflow-x: auto;
  }
}
</style>
