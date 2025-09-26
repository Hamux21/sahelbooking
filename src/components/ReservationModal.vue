<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content reservation-modal">
      <div class="modal-header">
        <h2>Réservation de vol</h2>
        <button @click="$emit('close')" class="close-button">&times;</button>
      </div>

      <!-- Résumé du vol -->
      <div class="flight-summary">
        <h3>Détails du vol</h3>
        <div class="flight-details">
          <div class="route-info">
            <span class="route">{{ flight.itineraries[0].segments[0].departure.iataCode }}</span>
            <span class="arrow">→</span>
            <span class="route">{{ flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode }}</span>
          </div>
          <div class="time-info">
            <div class="departure">
              <strong>Départ:</strong> {{ formatTime(flight.itineraries[0].segments[0].departure.at) }}
            </div>
            <div class="arrival">
              <strong>Arrivée:</strong> {{ formatTime(flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at) }}
            </div>
          </div>
          <div class="price-info">
            <strong>Prix total:</strong> {{ flight.price.total }} {{ flight.price.currency }}
          </div>
        </div>
      </div>

      <!-- Formulaire de réservation -->
      <form @submit.prevent="submitReservation" class="reservation-form">
        <!-- Informations des passagers -->
        <div class="form-section">
          <h3>Informations des passagers</h3>
          <div v-for="(passenger, index) in passengers" :key="index" class="passenger-form">
            <h4>Passager {{ index + 1 }}</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Civilité *</label>
                <select v-model="passenger.title" required>
                  <option value="">Sélectionner</option>
                  <option value="M">Monsieur</option>
                  <option value="Mme">Madame</option>
                  <option value="Mlle">Mademoiselle</option>
                </select>
              </div>
              <div class="form-group">
                <label>Prénom *</label>
                <input v-model="passenger.first_name" type="text" required />
              </div>
              <div class="form-group">
                <label>Nom de famille *</label>
                <input v-model="passenger.last_name" type="text" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date de naissance *</label>
                <input v-model="passenger.birth_date" type="date" required />
              </div>
              <div class="form-group">
                <label>Nationalité *</label>
                <select v-model="passenger.nationality" required>
                  <option value="">Sélectionner</option>
                  <option value="NE">Niger</option>
                  <option value="FR">France</option>
                  <option value="US">États-Unis</option>
                  <option value="GB">Royaume-Uni</option>
                  <option value="DE">Allemagne</option>
                  <option value="ES">Espagne</option>
                  <option value="IT">Italie</option>
                  <option value="MA">Maroc</option>
                  <option value="DZ">Algérie</option>
                  <option value="SN">Sénégal</option>
                  <option value="CI">Côte d'Ivoire</option>
                  <option value="BF">Burkina Faso</option>
                  <option value="ML">Mali</option>
                  <option value="TD">Tchad</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Numéro de passeport *</label>
                <input v-model="passenger.passport_number" type="text" required />
              </div>
              <div class="form-group">
                <label>Date d'expiration du passeport *</label>
                <input v-model="passenger.passport_expiry" type="date" required />
              </div>
            </div>
          </div>
        </div>

        <!-- Informations de contact -->
        <div class="form-section">
          <h3>Informations de contact</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Email *</label>
              <input v-model="contactInfo.email" type="email" required />
            </div>
            <div class="form-group">
              <label>Téléphone *</label>
              <input v-model="contactInfo.phone" type="tel" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Adresse *</label>
              <input v-model="contactInfo.address" type="text" required />
            </div>
            <div class="form-group">
              <label>Ville *</label>
              <input v-model="contactInfo.city" type="text" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Code postal *</label>
              <input v-model="contactInfo.postalCode" type="text" required />
            </div>
            <div class="form-group">
              <label>Pays *</label>
              <select v-model="contactInfo.country" required>
                <option value="">Sélectionner</option>
                <option value="NE">Niger</option>
                <option value="FR">France</option>
                <option value="US">États-Unis</option>
                <option value="GB">Royaume-Uni</option>
                <option value="DE">Allemagne</option>
                <option value="ES">Espagne</option>
                <option value="IT">Italie</option>
                <option value="MA">Maroc</option>
                <option value="DZ">Algérie</option>
                <option value="SN">Sénégal</option>
                <option value="CI">Côte d'Ivoire</option>
                <option value="BF">Burkina Faso</option>
                <option value="ML">Mali</option>
                <option value="TD">Tchad</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Informations de paiement -->
        <div class="form-section">
          <h3>Informations de paiement</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Type de carte *</label>
              <select v-model="paymentInfo.cardType" required>
                <option value="">Sélectionner</option>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
              </select>
            </div>
            <div class="form-group">
              <label>Numéro de carte *</label>
              <input v-model="paymentInfo.cardNumber" type="text" placeholder="1234 5678 9012 3456" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Nom sur la carte *</label>
              <input v-model="paymentInfo.cardHolderName" type="text" required />
            </div>
            <div class="form-group">
              <label>Date d'expiration *</label>
              <input v-model="paymentInfo.expiryDate" type="month" required />
            </div>
            <div class="form-group">
              <label>CVV *</label>
              <input v-model="paymentInfo.cvv" type="text" placeholder="123" maxlength="4" required />
            </div>
          </div>
        </div>

        <!-- Options supplémentaires -->
        <div class="form-section">
          <h3>Options supplémentaires</h3>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input v-model="extras.insurance" type="checkbox" />
              Assurance voyage (+25€)
            </label>
            <label class="checkbox-label">
              <input v-model="extras.meal" type="checkbox" />
              Repas à bord (+15€)
            </label>
            <label class="checkbox-label">
              <input v-model="extras.seatSelection" type="checkbox" />
              Sélection de siège (+10€)
            </label>
            <label class="checkbox-label">
              <input v-model="extras.baggage" type="checkbox" />
              Bagage supplémentaire (+30€)
            </label>
          </div>
        </div>

        <!-- Résumé des prix -->
        <div class="price-summary">
          <h3>Résumé des prix</h3>
          <div class="price-breakdown">
            <div class="price-item">
              <span>Vol de base</span>
              <span>{{ flight.price.total }} {{ flight.price.currency }}</span>
            </div>
            <div v-if="extras.insurance" class="price-item">
              <span>Assurance voyage</span>
              <span>25€</span>
            </div>
            <div v-if="extras.meal" class="price-item">
              <span>Repas à bord</span>
              <span>15€</span>
            </div>
            <div v-if="extras.seatSelection" class="price-item">
              <span>Sélection de siège</span>
              <span>10€</span>
            </div>
            <div v-if="extras.baggage" class="price-item">
              <span>Bagage supplémentaire</span>
              <span>30€</span>
            </div>
            <div class="price-item total">
              <span><strong>Total</strong></span>
              <span><strong>{{ totalPrice }} {{ flight.price.currency }}</strong></span>
            </div>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            Annuler
          </button>
          <button type="submit" :disabled="loading" class="btn btn-primary">
            {{ loading ? 'Traitement...' : 'Confirmer la réservation' }}
          </button>
        </div>

        <!-- Messages d'erreur -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reservationService, passengerService, authService } from '@/config/supabase'

export default {
  name: 'ReservationModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    flight: {
      type: Object,
      required: true
    },
    passengerCount: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      passengers: [],
      contactInfo: {
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
      },
      paymentInfo: {
        cardType: '',
        cardNumber: '',
        cardHolderName: '',
        expiryDate: '',
        cvv: ''
      },
      extras: {
        insurance: false,
        meal: false,
        seatSelection: false,
        baggage: false
      },
      loading: false,
      error: null
    }
  },
  computed: {
    totalPrice() {
      let total = parseFloat(this.flight.price.total)
      if (this.extras.insurance) total += 25
      if (this.extras.meal) total += 15
      if (this.extras.seatSelection) total += 10
      if (this.extras.baggage) total += 30
      return total.toFixed(2)
    }
  },
  watch: {
    passengerCount: {
      immediate: true,
      handler(newCount) {
        this.initializePassengers(newCount)
      }
    }
  },
  methods: {
    initializePassengers(count) {
      this.passengers = Array.from({ length: count }, () => ({
        title: '',
  first_name: '',
  last_name: '',
  birth_date: '',
        nationality: '',
  passport_number: '',
  passport_expiry: ''
      }))
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
    async submitReservation() {
      this.loading = true
      this.error = null

      try {
        // Validation des données
        this.validateForm()

        // Récupérer l'utilisateur actuel
        const currentUser = await authService.getCurrentUser()
        if (!currentUser) {
          throw new Error('Vous devez être connecté pour effectuer une réservation')
        }

        // Générer un numéro de réservation unique
        const reservationNumber = 'SB-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase()

        // Préparer les données de réservation
        const reservationData = {
          user_id: currentUser.id,
          reservation_number: reservationNumber,
          flight_data: {
            origin: this.flight.itineraries[0].segments[0].departure.iataCode,
            destination: this.flight.itineraries[0].segments[this.flight.itineraries[0].segments.length - 1].arrival.iataCode,
            departure_date: this.flight.itineraries[0].segments[0].departure.at,
            arrival_date: this.flight.itineraries[0].segments[this.flight.itineraries[0].segments.length - 1].arrival.at,
            airline: this.flight.itineraries[0].segments[0].carrierCode,
            flight_details: this.flight
          },
          total_price: parseFloat(this.totalPrice),
          currency: this.flight.price.currency,
          status: 'confirmed',
          payment_status: 'pending',
          extras: this.extras,
          contact_info: this.contactInfo,
          payment_info: {
            // Ne stockez jamais les vraies informations de carte
            card_type: this.paymentInfo.cardType,
            card_last_four: this.paymentInfo.cardNumber.slice(-4),
            // Chiffrez les autres données sensibles si nécessaire
          }
        }

        // Créer la réservation dans Supabase
        const reservation = await reservationService.createReservation(reservationData)

        // Créer les passagers
        await passengerService.createPassengers(reservation.id, this.passengers)

        // Succès de la réservation
        this.$emit('reservation-success', {
          reservationId: reservation.id,
          reservationNumber: reservation.reservation_number,
          totalPrice: this.totalPrice,
          currency: this.flight.price.currency,
          flight: this.flight
        })

        // Fermer la modale
        this.$emit('close')

      } catch (error) {
        console.error('Erreur de réservation:', error)
        this.error = error.message || 'Erreur lors de la réservation'
      } finally {
        this.loading = false
      }
    },
    validateForm() {
      // Validation des passagers
      for (let i = 0; i < this.passengers.length; i++) {
        const passenger = this.passengers[i]
  if (!passenger.title || !passenger.first_name || !passenger.last_name || 
            !passenger.birth_date || !passenger.nationality || 
            !passenger.passport_number || !passenger.passport_expiry) {
          throw new Error(`Veuillez remplir toutes les informations du passager ${i + 1}`)
        }
      }

      // Validation des informations de contact
      if (!this.contactInfo.email || !this.contactInfo.phone || 
          !this.contactInfo.address || !this.contactInfo.city || 
          !this.contactInfo.postalCode || !this.contactInfo.country) {
        throw new Error('Veuillez remplir toutes les informations de contact')
      }

      // Validation des informations de paiement
      if (!this.paymentInfo.cardType || !this.paymentInfo.cardNumber || 
          !this.paymentInfo.cardHolderName || !this.paymentInfo.expiryDate || 
          !this.paymentInfo.cvv) {
        throw new Error('Veuillez remplir toutes les informations de paiement')
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.contactInfo.email)) {
        throw new Error('Veuillez entrer une adresse email valide')
      }

      // Validation du numéro de carte
      const cardNumber = this.paymentInfo.cardNumber.replace(/\s/g, '')
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        throw new Error('Le numéro de carte doit contenir entre 13 et 19 chiffres')
      }
    }
  }
}
</script>

<style scoped>
.reservation-modal {
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  width: 90vw;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5em;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #333;
}

.flight-summary {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.flight-summary h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.flight-details {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 15px;
  align-items: center;
}

.route-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.route {
  font-weight: bold;
  font-size: 1.2em;
  color: #007bff;
}

.arrow {
  font-size: 1.2em;
  color: #666;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.price-info {
  text-align: right;
  font-size: 1.1em;
  color: #28a745;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fff;
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2em;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 10px;
}

.passenger-form {
  margin-bottom: 25px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.passenger-form h4 {
  margin: 0 0 15px 0;
  color: #495057;
  font-size: 1.1em;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
  font-size: 0.9em;
}

.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.price-summary {
  background: #e9ecef;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.price-summary h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.price-item.total {
  border-top: 2px solid #333;
  margin-top: 10px;
  padding-top: 15px;
  font-size: 1.1em;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.15s ease-in-out;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-top: 15px;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .reservation-modal {
    width: 95vw;
    max-height: 95vh;
  }
  
  .flight-details {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .checkbox-group {
    grid-template-columns: 1fr;
  }
}
</style>
