<template>
  <div class="flight-search">
  <div class="header">
      <div class="logo-container">
        <div class="logo-text">
          <h1 class="brand-name">SahelBooking</h1>
          <p class="tagline">Trouvez votre vol parfait</p>
        </div>
      </div>
      <div class="auth-section">
        <div v-if="currentUser" class="user-info">
          <span class="welcome-text">Bonjour, {{ currentUser.user_metadata?.first_name || currentUser.email }}</span>
          <button @click="signOut" class="auth-button logout">Déconnexion</button>
        </div>
        <div v-else class="auth-buttons">
          <button @click="showAuthModal = true" class="auth-button login">Connexion</button>
        </div>
      </div>
    </div>

    <form @submit.prevent="searchFlights" class="search-form">
      <div class="input-group origin-destination">
        <div class="input-wrapper">
          <label>De</label>
        <input 
          v-model="searchForm.origin"
          type="text"
          placeholder="Niamey (NIM)"
          required
          class="input-field"
        />
        </div>
        <button type="button" class="swap-button" @click="swapLocations" aria-label="Swap origin and destination">
          ⇄
        </button>
        <div class="input-wrapper">
          <label>Vers</label>
        <input 
          v-model="searchForm.destination"
          type="text"
          placeholder="Madrid (MAD)"
          required
          class="input-field"
        />
        </div>
      </div>

      <div class="input-group dates">
        <div class="input-wrapper">
          <label>Départ</label>
        <input
          v-model="searchForm.departureDate"
          type="date"
          required
          class="input-field"
        />
        </div>
        <div class="input-wrapper" v-if="tripType !== 'oneWay'">
          <label>Retour</label>
        <input
          v-model="searchForm.returnDate"
          type="date"
          class="input-field"
          placeholder="Retour"
        />
        </div>
      </div>

      <div class="input-group passengers-class">
        <div class="input-wrapper">
          <label>Passagers</label>
        <button type="button" class="passenger-button" @click="showPassengerModal = true">
          {{ passengerSummary }}
        </button>
        </div>
        <div class="input-wrapper">
          <label>Classe</label>
        <select v-model="travelClass" class="input-field">
          <option value="ECONOMY">Économique</option>
          <option value="BUSINESS">Affaires</option>
          <option value="FIRST">Première</option>
        </select>
        </div>
        <div class="input-wrapper">
          <label>Type de voyage</label>
        <button type="button" class="trip-type-button" @click="showTripTypeModal = true">
          {{ tripTypes[tripType] }}
        </button>
        </div>
      </div>

      <div class="search-button-container">
      <button type="submit" :disabled="loading" class="search-button">
          <span v-if="loading">Recherche...</span>
          <span v-else>Rechercher</span>
      </button>
      </div>
    </form>

    <!-- Passenger Modal -->
    <div v-if="showPassengerModal" class="modal-overlay" @click.self="showPassengerModal = false">
      <div class="modal-content">
        <h3>Passagers</h3>
        <div class="passenger-row" v-for="(label, key) in passengerLabels" :key="key">
          <div class="passenger-label">{{ label }}</div>
          <div class="passenger-controls">
            <button @click="decrementPassenger(key)" :disabled="passengers[key] === 0">-</button>
            <span>{{ passengers[key] }}</span>
            <button @click="incrementPassenger(key)">+</button>
          </div>
        </div>
        <button class="modal-close" @click="showPassengerModal = false">Fermer</button>
      </div>
    </div>

    <!-- Trip Type Modal -->
    <div v-if="showTripTypeModal" class="modal-overlay" @click.self="showTripTypeModal = false">
      <div class="modal-content">
        <h3>Type de voyage</h3>
        <ul class="trip-type-list">
          <li v-for="(label, key) in tripTypes" :key="key">
            <button @click="selectTripType(key)">{{ label }}</button>
          </li>
        </ul>
        <button class="modal-close" @click="showTripTypeModal = false">Fermer</button>
      </div>
    </div>


    <!-- Affichage des résultats -->
    <div v-if="flights.length > 0" class="results">
      <div class="results-header">
        <h3>Résultats ({{ flights.length }} vols trouvés)</h3>
      </div>
      
      <div class="flights-grid">
        <div v-for="(flight, index) in flights" :key="flight.id" class="flight-card">
          <div class="card-header">
          <div class="route">
              <span class="airport-code">{{ flight.itineraries[0].segments[0].departure.iataCode }}</span>
              <div class="flight-path">
                <div class="path-line"></div>
                <div class="plane-icon">✈</div>
              </div>
              <span class="airport-code">{{ flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode }}</span>
            </div>
            <div class="airline-info">
              <img :src="`https://content.airlinequality.com/iata-codes/${flight.itineraries[0].segments[0].carrierCode}.png`" :alt="flight.itineraries[0].segments[0].carrierCode" class="airline-logo" />
              <span class="airline-name">{{ flight.itineraries[0].segments[0].carrierCode }}</span>
            </div>
          </div>

          <div class="flight-details">
            <div class="time-info">
              <div class="departure">
                <span class="time-label">Départ</span>
                <span class="time-value">{{ formatTime(flight.itineraries[0].segments[0].departure.at) }}</span>
              </div>
              <div class="arrival">
                <span class="time-label">Arrivée</span>
                <span class="time-value">{{ formatTime(flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at) }}</span>
              </div>
          </div>

            <div class="price-section">
          <div class="price">
                <span class="amount">{{ flight.price.total }}</span>
                <span class="currency">{{ flight.price.currency }}</span>
          </div>
          </div>
        </div>

          <button @click="openReservationModal(flight)" class="reserve-button">
            Réserver maintenant
          </button>
      </div>
    </div>
    </div>

    <!-- Modale de réservation -->
    <ReservationModal 
      :show="showReservationModal" 
      :flight="selectedFlight" 
      :passenger-count="totalPassengers"
      @close="closeReservationModal"
      @reservation-success="handleReservationSuccess"
    />

    <!-- Notification -->
    <NotificationToast
      :show="showNotification"
      :type="notificationType"
      :title="notificationTitle"
      :message="notificationMessage"
      @close="closeNotification"
    />

    <!-- Modale d'authentification -->
    <AuthModal
      :show="showAuthModal"
      @close="showAuthModal = false"
      @auth-success="handleAuthSuccess"
    />
  </div>
</template>

<script>
import { searchFlights } from '@/services/amadeus'
import ReservationModal from './ReservationModal.vue'
import NotificationToast from './NotificationToast.vue'
import AuthModal from './AuthModal.vue'
import { authService, getUserRoleById } from '@/config/supabase'
import AdminDashboard from './AdminDashboard.vue'

export default {
  name: 'FlightSearch',
  components: {
    ReservationModal,
    NotificationToast,
    AuthModal
  },
  data() {
    return {
      searchForm: {
        origin: '',
        destination: '',
        departureDate: '',
        returnDate: '',
      },
      passengers: {
        adults: 1,
        students: 0,
        seniors: 0,
        youths: 0,
        children: 0,
        toddlers: 0,
        infants: 0
      },
      travelClass: 'ECONOMY',
      tripType: 'roundTrip',
      flights: [],
      loading: false,
      showPassengerModal: false,
      showTripTypeModal: false,
      showReservationModal: false,
      selectedFlight: null,
      showNotification: false,
      notificationType: 'success',
      notificationTitle: '',
      notificationMessage: '',
      showAuthModal: false,
      currentUser: null,
      passengerLabels: {
        adults: 'Adults 18-64',
        students: 'Students over 18',
        seniors: 'Seniors over 65',
        youths: 'Youths 12-17',
        children: 'Children 2-11',
        toddlers: 'Toddlers in own seat under 2',
        infants: 'Infants on lap under 2'
      },
      tripTypes: {
        roundTrip: 'Aller-retour',
        oneWay: 'Sens Unique',
        multiCity: 'Multi-villes'
      },
  userRole: null
    }
  },
  async mounted() {
    await this.checkAuthStatus()
  },
  computed: {
    passengerSummary() {
      const total = Object.values(this.passengers).reduce((a, b) => a + b, 0)
      return `${total} passager${total > 1 ? 's' : ''}`
    },
    totalPassengers() {
      return Object.values(this.passengers).reduce((a, b) => a + b, 0)
    }
  },
  methods: {
    swapLocations() {
      const temp = this.searchForm.origin
      this.searchForm.origin = this.searchForm.destination
      this.searchForm.destination = temp
    },
    incrementPassenger(type) {
      this.passengers[type]++
    },
    decrementPassenger(type) {
      if (this.passengers[type] > 0) {
        this.passengers[type]--
      }
    },
    selectTripType(type) {
      this.tripType = type
      this.showTripTypeModal = false
    },
    openReservationModal(flight) {
      // Vérifier si l'utilisateur est connecté
      if (!this.currentUser) {
        this.showAuthModal = true
        return
      }
      
      this.selectedFlight = flight
      this.showReservationModal = true
    },
    closeReservationModal() {
      this.selectedFlight = null
      this.showReservationModal = false
    },
    async searchFlights() {
      this.loading = true
      this.error = null
      this.flights = []

      try {
        // Validation des dates
        if (this.searchForm.returnDate && new Date(this.searchForm.returnDate) <= new Date(this.searchForm.departureDate)) {
          throw new Error('La date de retour doit être postérieure à la date de départ.')
        }

        const totalAdults = this.passengers.adults + this.passengers.students + this.passengers.seniors + this.passengers.youths
        const totalChildren = this.passengers.children + this.passengers.toddlers + this.passengers.infants

        const params = {
          originLocationCode: this.searchForm.origin,
          destinationLocationCode: this.searchForm.destination,
          departureDate: this.searchForm.departureDate,
          adults: totalAdults,
          children: totalChildren,
          max: 10,
          travelClass: this.travelClass,
          tripType: this.tripType
        }

        if (this.searchForm.returnDate) {
          params.returnDate = this.searchForm.returnDate
        }

        const flights = await searchFlights({
          from: this.searchForm.origin,
          to: this.searchForm.destination,
          date: this.searchForm.departureDate,
          returnDate: this.searchForm.returnDate,
          adults: totalAdults,
          children: totalChildren,
          max: 10,
          travelClass: this.travelClass,
          tripType: this.tripType
        })
        this.flights = flights || []
        
        if (this.flights.length === 0) {
          this.showErrorNotification('Aucun résultat', 'Aucun vol trouvé pour ces critères de recherche.')
        }
      } catch (error) {
        console.error('Erreur:', error)
        this.showErrorNotification('Erreur de recherche', error.message || 'Erreur lors de la recherche. Vérifiez vos paramètres.')
      } finally {
        this.loading = false
      }
    },

    formatTime(dateString) {
      return new Date(dateString).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    handleReservationSuccess(reservationData) {
      // Afficher une notification de succès
      this.showSuccessNotification(
        'Réservation confirmée !',
        `Numéro de réservation: ${reservationData.reservationId}\nPrix total: ${reservationData.totalPrice} ${reservationData.flight.price.currency}`
      )
      
      // Ici vous pouvez ajouter d'autres actions comme rediriger vers une page de confirmation
      // ou envoyer un email de confirmation
    },
    showSuccessNotification(title, message) {
      this.notificationType = 'success'
      this.notificationTitle = title
      this.notificationMessage = message
      this.showNotification = true
    },
    showErrorNotification(title, message) {
      this.notificationType = 'error'
      this.notificationTitle = title
      this.notificationMessage = message
      this.showNotification = true
    },
    closeNotification() {
      this.showNotification = false
    },
    async handleAuthSuccess(user) {
      this.currentUser = user
      // Récupérer le rôle depuis la table users
      if (user?.id) {
        try {
          this.userRole = await getUserRoleById(user.id)
        } catch (e) {
          this.userRole = 'user'
        }
      } else {
        this.userRole = 'user'
      }
      this.showAuthModal = false
      this.showSuccessNotification('Connexion réussie', `Bienvenue ${user.user_metadata?.first_name || user.email} !`)
    },
    async signOut() {
      try {
        await authService.signOut()
        this.currentUser = null
        this.showSuccessNotification('Déconnexion', 'Vous avez été déconnecté avec succès')
      } catch (error) {
        this.showErrorNotification('Erreur', 'Erreur lors de la déconnexion')
      }
    },
    async checkAuthStatus() {
      try {
        const user = await authService.getCurrentUser()
        this.currentUser = user
        if (user?.id) {
          try {
            this.userRole = await getUserRoleById(user.id)
          } catch (e) {
            this.userRole = 'user'
          }
        } else {
          this.userRole = 'user'
        }
      } catch (error) {
        this.userRole = null
        console.log('Aucun utilisateur connecté')
      }
    }
  }
}
</script>

<style scoped>
.flight-search {
  width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background: #f7f7f7;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  background: #6ca1eb;
  padding: 20px 0;
  margin-bottom: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome-text {
  color: #b3d4fc;
  font-size: 0.9em;
}

.auth-button {
  padding: 8px 16px;
  border: 1px solid #b3d4fc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.2s ease;
}

.auth-button.login {
  background: transparent;
  color: #b3d4fc;
}

.auth-button.login:hover {
  background: #b3d4fc;
  color: #003580;
}

.auth-button.logout {
  background: #ff6b35;
  color: white;
  border-color: #ff6b35;
}

.auth-button.logout:hover {
  background: #e55a2b;
  border-color: #e55a2b;
}

.logo-text {
  text-align: center;
}

.brand-name {
  margin: 0;
  font-size: 2.5em;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
}

.tagline {
  margin: 5px 0 0 0;
  font-size: 1.1em;
  color: #b3d4fc;
  font-weight: 400;
}

form.search-form {
  background: white;
  padding: 30px;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e0e0e0;
}

.input-group {
  display: flex;
  align-items: end;
  gap: 15px;
  margin-bottom: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.input-wrapper label {
  font-weight: 600;
  color: #333;
  font-size: 0.9em;
  margin-bottom: 8px;
  display: block;
  text-align: left;
  height: 20px;
  line-height: 20px;
}

.input-field {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  background: #fff;
  height: 48px;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #0071c2;
}

.swap-button {
  background: #f0f0f0;
  border: 2px solid #e0e0e0;
  color: #666;
  font-size: 18px;
  padding: 12px;
  cursor: pointer;
  border-radius: 4px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  align-self: end;
  margin-bottom: 8px;
  margin-top: 28px;
}

.swap-button:hover {
  background: #e0e0e0;
  border-color: #0071c2;
}

.search-button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.search-button {
  background: #0071c2;
  color: white;
  padding: 12px 40px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.2s ease;
  height: 48px;
  min-width: 150px;
}

.search-button:hover {
  background: #005a9e;
}

.passenger-button,
.trip-type-button {
  background: white;
  color: #333;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: border-color 0.2s ease;
  text-align: left;
  height: 48px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.passenger-button:hover,
.trip-type-button:hover {
  border-color: #0071c2;
}

.search-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.form-group {
  display: contents;
}

.form-group label {
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  grid-column: span 2;
  justify-self: start;
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}


.results {
  background: #f7f7f7;
  padding: 30px 0;
}

.results-header {
  max-width: 1200px;
  margin: 0 auto 30px auto;
  padding: 0 20px;
}

.results-header h3 {
  margin: 0;
  font-size: 1.5em;
  color: #333;
  font-weight: 600;
}

.flights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.flight-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  transition: box-shadow 0.2s ease;
}

.flight-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.route {
  display: flex;
  align-items: center;
  gap: 15px;
}

.airport-code {
  font-size: 1.2em;
  font-weight: 700;
  color: #333;
  padding: 6px 10px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.flight-path {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plane-icon {
  font-size: 1em;
  color: #0071c2;
}

.path-line {
  width: 30px;
  height: 2px;
  background: #0071c2;
  border-radius: 1px;
}

.airline-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.airline-logo {
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.airline-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9em;
}

.flight-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.time-info {
  display: flex;
  gap: 30px;
}

.departure,
.arrival {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.time-label {
  font-size: 0.8em;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
}

.time-value {
  font-size: 1em;
  font-weight: 600;
  color: #333;
}

.price-section {
  text-align: right;
}

.price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.amount {
  font-size: 1.5em;
  font-weight: 700;
  color: #0071c2;
}

.currency {
  font-size: 0.8em;
  color: #666;
  font-weight: 500;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px 30px;
  width: 320px;
  max-width: 90vw;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.passenger-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.passenger-label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.passenger-controls button {
  background-color: #007bff;
  border: none;
  color: white;
  font-size: 18px;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 5px;
  user-select: none;
}

.passenger-controls button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.passenger-controls span {
  min-width: 20px;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
  color: #222;
}

.modal-close {
  margin-top: 15px;
  background-color: #007bff;
  border: none;
  color: white;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  font-weight: 600;
  font-size: 16px;
}

.modal-close:hover {
  background-color: #0056b3;
}

.trip-type-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.trip-type-list li {
  margin-bottom: 10px;
}

.trip-type-list button {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  color: #333;
  transition: background-color 0.2s ease;
}

.trip-type-list button:hover,
.trip-type-list button:focus {
  background-color: #e9f0ff;
  outline: none;
}

.reserve-button {
  background: #ff6b35;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  width: 100%;
  transition: background-color 0.2s ease;
}

.reserve-button:hover {
  background: #e55a2b;
}

/* Responsive Design */
@media (max-width: 768px) {
  .input-group {
    flex-direction: column;
    gap: 15px;
  }
  
  .swap-button {
    align-self: center;
    margin: 10px 0;
  }
  
  .flights-grid {
    grid-template-columns: 1fr;
    padding: 0 15px;
  }
  
  .flight-details {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .time-info {
    justify-content: center;
  }
  
  .price-section {
    text-align: center;
  }
  
  .price {
    align-items: center;
  }
  
  .card-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .route {
    justify-content: center;
  }
}
</style>