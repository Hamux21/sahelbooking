import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes. Vérifiez votre fichier .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Récupérer le rôle d'un utilisateur par son id
export async function getUserRoleById(userId) {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('role')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data?.role || 'user'
}

// Configuration pour les tables
export const TABLES = {
  RESERVATIONS: 'reservations',
  USERS: 'users',
  FLIGHTS: 'flights',
  PASSENGERS: 'passengers'
}

// Fonctions utilitaires pour les réservations
export const reservationService = {
  // Créer une nouvelle réservation
  async createReservation(reservationData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESERVATIONS)
        .insert([reservationData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error)
      throw error
    }
  },

  // Récupérer les réservations d'un utilisateur
  async getUserReservations(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESERVATIONS)
        .select(`
          *,
          passengers (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error)
      throw error
    }
  },

  // Mettre à jour une réservation
  async updateReservation(reservationId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESERVATIONS)
        .update(updates)
        .eq('id', reservationId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error)
      throw error
    }
  },

  // Annuler une réservation
  async cancelReservation(reservationId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESERVATIONS)
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', reservationId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la réservation:', error)
      throw error
    }
  }
}

// Fonctions utilitaires pour les passagers
export const passengerService = {
  // Créer des passagers pour une réservation
  async createPassengers(reservationId, passengers) {
    try {
      const passengersWithReservationId = passengers.map(passenger => ({
        ...passenger,
        reservation_id: reservationId
      }))

      const { data, error } = await supabase
        .from(TABLES.PASSENGERS)
        .insert(passengersWithReservationId)
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la création des passagers:', error)
      throw error
    }
  }
}

// Fonctions d'authentification
export const authService = {
  // Inscription
  async signUp(email, password, userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      throw error
    }
  },

  // Connexion
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      throw error
    }
  },

  // Déconnexion
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      throw error
    }
  },

  // Récupérer l'utilisateur actuel
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      throw error
    }
  }
}
