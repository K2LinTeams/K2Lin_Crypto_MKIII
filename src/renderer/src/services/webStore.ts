// Stateless store for Web (In-Memory only)
// "Burn after reading" - refresh wipes everything.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const memoryStore: Record<string, any> = {
  todos: [
    { id: 1, text: 'Buy Milk (Web Mode)', done: false },
    { id: 2, text: 'Data is ephemeral', done: true }
  ]
}

export const webStore = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get(key: string): Promise<any> {
    return memoryStore[key]
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async set(key: string, value: any): Promise<void> {
    memoryStore[key] = value
  }
}
