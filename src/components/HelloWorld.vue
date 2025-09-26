<template>
  <div class="flight-search">
    <h2>Recherche de vols</h2>
    
    <form @submit.prevent="searchFlights">
      <div class="form-group">
        <label>Départ:</label>
        <input 
          v-model="searchForm.origin"
          type="text"
          placeholder="Code aéroport (ex: CDG)"
          required
        />
      </div>
      
      <div class="form-group">
        <label>Destination:</label>
        <input 
          v-model="searchForm.destination"
          type="text"
          placeholder="Code aéroport (ex: JFK)"
          required
        />
      </div>
      
      <div class="form-group">
        <label>Date de départ:</label>
        <input 
          v-model="searchForm.departureDate"
          type="date"
          required
        />
      </div>
      
      <div class="form-group">
        <label>Date de retour (optionnel):</label>
        <input 
          v-model="searchForm.returnDate"
          type="date"
        />
      </div>
      
      <div class="form-group">
        <label>Nombre d'adultes:</label>
        <select v-model="searchForm.adults">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Recherche...' : 'Rechercher' }}
      </button>
    </form>

    <!-- Affichage des erreurs -->
    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- Affichage des résultats -->
    <div v-if="flights.length > 0" class="results">
      <h3>Résultats ({{ flights.length }} vols)</h3>
      
      <div v-for="flight in flights" :key="flight.id" class="flight-card">
        <div class="flight-info">
          <div class="route">
            <span>{{ flight.itineraries[0].segments[0].departure.iataCode }}</span>
            <span>→</span>
            <span>{{ flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode }}</span>
          </div>
          
          <div class="times">
            <span>Départ: {{ formatTime(flight.itineraries[0].segments[0].departure.at) }}</span>
            <span>Arrivée: {{ formatTime(flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at) }}</span>
          </div>
          
          <div class="price">
            {{ flight.price.total }} {{ flight.price.currency }}
          </div>
          
          <div class="airline">
            Compagnie: {{ flight.itineraries[0].segments[0].carrierCode }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AmadeusAPI from '@/services/amadeusApi'

export default {
  name: 'FlightSearch',
  data() {
    return {
      searchForm: {
        origin: '',
        destination: '',
        departureDate: '',
        returnDate: '',
        adults: 1
      },
      flights: [],
      loading: false,
      error: null
    }
  },
  methods: {
    async searchFlights() {
      this.loading = true
      this.error = null
      this.flights = []

      try {
        const params = {
          originLocationCode: this.searchForm.origin,
          destinationLocationCode: this.searchForm.destination,
          departureDate: this.searchForm.departureDate,
          adults: parseInt(this.searchForm.adults),
          max: 10
        }

        if (this.searchForm.returnDate) {
          params.returnDate = this.searchForm.returnDate
        }

        const response = await AmadeusAPI.searchFlights(params)
        this.flights = response.data || []
        
        if (this.flights.length === 0) {
          this.error = 'Aucun vol trouvé pour ces critères'
        }
      } catch (error) {
        console.error('Erreur:', error)
        this.error = 'Erreur lors de la recherche. Vérifiez vos paramètres.'
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
    }
  }
}
</script>

<style scoped>
.flight-search {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
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

.error {
  color: red;
  margin: 15px 0;
  padding: 10px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.results {
  margin-top: 30px;
}

.flight-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
}

.flight-info {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 15px;
  align-items: center;
}

.route {
  font-weight: bold;
  font-size: 1.1em;
}

.price {
  font-weight: bold;
  color: #007bff;
  font-size: 1.2em;
}

@media (max-width: 768px) {
  .flight-info {
    grid-template-columns: 1fr;
    gap: 10px;
    gap: 10px;}
}
</style>