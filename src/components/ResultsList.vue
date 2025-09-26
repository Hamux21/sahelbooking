<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Résultats</h3>
      <div class="flex items-center gap-2 text-sm">
        <span>Trier :</span>
        <select v-model="sortBy" class="rounded-md border-gray-300">
          <option value="price">Prix</option>
          <option value="duration">Durée</option>
          <option value="popularity">Popularité</option>
        </select>
      </div>
    </div>
    <FlightCard v-for="(o, idx) in sortedOffers" :key="o.id" :offer="o" :rank="rankFor(idx)" :currency="currency" />
  </section>
</template>

<script>
import FlightCard from './FlightCard.vue'

export default {
  name: 'ResultsList',
  components: { FlightCard },
  props: { offers: Array, currency: { type: String, default: 'USD' } },
  data() { return { sortBy: 'price' } },
  computed: {
    sortedOffers() {
      const arr = [...(this.offers || [])]
      if (this.sortBy === 'price') {
        arr.sort((a,b) => Number(a.price?.total||0) - Number(b.price?.total||0))
      } else if (this.sortBy === 'duration') {
        const dur = (it) => (it?.duration||'').replace('PT','').replace('H',':').replace('M','')
        arr.sort((a,b) => dur(a.itineraries?.[0]).localeCompare(dur(b.itineraries?.[0])))
      }
      return arr
    }
  },
  methods: {
    rankFor(idx) {
      if (idx === 0 && this.sortBy === 'price') return 'cheap'
      if (idx === 0 && this.sortBy === 'duration') return 'fast'
      if (idx === 0) return 'best'
      return undefined
    }
  }
}
</script>

