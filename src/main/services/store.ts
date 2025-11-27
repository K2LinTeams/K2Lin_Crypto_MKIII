import Store from 'electron-store'

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

// Initialize store
// Note: In renderer, we invoke this via IPC
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store = new Store<StoreSchema>({ schema } as any)

export function getStoreValue<K extends keyof StoreSchema>(key: K): StoreSchema[K] {
  return store.get(key)
}

export function setStoreValue<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): void {
  store.set(key, value)
}
