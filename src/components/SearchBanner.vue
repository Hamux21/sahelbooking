<template>
  <section class="bg-yellow-400/90">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <form class="grid grid-cols-1 md:grid-cols-6 gap-3 items-end" @submit.prevent="submit">
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-800 mb-1">De</label>
          <input v-model="from" class="w-full rounded-md border-gray-300 focus:ring-brand-blue focus:border-brand-blue" placeholder="Niamey" />
        </div>
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-800 mb-1">Vers</label>
          <input v-model="to" class="w-full rounded-md border-gray-300 focus:ring-brand-blue focus:border-brand-blue" placeholder="Madrid" />
        </div>
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-800 mb-1">Aller</label>
          <input type="date" v-model="depart" class="w-full rounded-md border-gray-300 focus:ring-brand-blue focus:border-brand-blue" />
        </div>
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-800 mb-1">Retour</label>
          <input type="date" v-model="retour" class="w-full rounded-md border-gray-300 focus:ring-brand-blue focus:border-brand-blue" />
        </div>
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-800 mb-1">Passagers</label>
          <input type="number" min="1" v-model.number="passagers" class="w-full rounded-md border-gray-300 focus:ring-brand-blue focus:border-brand-blue" />
        </div>
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-800 mb-1">Classe</label>
          <select v-model="classe" class="w-full rounded-md border-gray-300 focus:ring-brand-blue focus:border-brand-blue">
            <option value="ECONOMY">Économie</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">Première</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-800 mb-1">Devise</label>
          <select v-model="currency" class="w-full rounded-md border-gray-300 focus:ring-brand-blue focus:border-brand-blue">
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="XOF">XOF</option>
          </select>
        </div>
        <div class="md:col-span-4 flex justify-end">
          <button type="submit" class="btn-primary">Rechercher</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SearchBanner',
  emits: ['search'],
  data() {
    return {
      from: '',
      to: '',
      depart: '',
      retour: '',
      passagers: 1,
      classe: 'ECONOMY',
      currency: 'EUR',
    }
  },
  methods: {
    submit() {
      this.$emit('search', {
        from: this.from,
        to: this.to,
        date: this.depart,
        returnDate: this.retour,
        adults: this.passagers,
        travelClass: this.classe,
        currencyCode: this.currency,
      })
    }
  }
}
</script>

