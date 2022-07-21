import { defineStore } from 'pinia';

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [
      { id: 1, name: 'Ibrahim' },
      { id: 2, name: 'Nisa' },
      { id: 3, name: 'Maryam' },
      { id: 4, name: 'Me' }
    ],
  }),
  getters: {
    headCounts(): number {
      return this.customers.length;
    }
  },
  actions: {
    register(name: string) {
      //
      this.customers.push({
        name,
        id: this.customers.length + 1
      });
    }
  }
});
