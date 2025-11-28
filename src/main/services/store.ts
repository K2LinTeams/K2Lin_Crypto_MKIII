interface Todo {
  id: number
  text: string
  done: boolean
}

interface Settings {
  autoClipboardListen: boolean
  panicModePassword?: string
  theme: 'dark' | 'light' | 'system'
}

interface StoreSchema {
  todos: Todo[]
  settings: Settings
}

const schema = {
  todos: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        text: { type: 'string' },
        done: { type: 'boolean' }
      }
    },
    default: [
      { id: 1, text: 'Buy Milk', done: false },
      { id: 2, text: 'Reply to boss', done: true },
      { id: 3, text: 'Dentist appointment', done: false }
    ]
  },
  settings: {
    type: 'object',
    properties: {
      autoClipboardListen: { type: 'boolean' },
      panicModePassword: { type: 'string' },
      theme: { type: 'string', enum: ['dark', 'light', 'system'] }
    },
    default: {
      autoClipboardListen: false,
      theme: 'dark'
    }
  }
} as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let store: any

async function getStore() {
  if (store) return store
  const { default: Store } = await import('electron-store')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store = new Store({ schema } as any)
  return store
}

export async function getStoreValue<K extends keyof StoreSchema>(key: K): Promise<StoreSchema[K]> {
  const s = await getStore()
  return s.get(key)
}

export async function setStoreValue<K extends keyof StoreSchema>(
  key: K,
  value: StoreSchema[K]
): Promise<void> {
  const s = await getStore()
  s.set(key, value)
}
