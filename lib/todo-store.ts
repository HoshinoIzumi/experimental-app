'use client'

import { create } from 'zustand'
import type { ITask } from '@/types/tasks'
import { getAllTodos, addNewTodo, updateTodo, deleteTodo } from '@/api'

type State = {
  tasks: ITask[]
  loading: boolean
  error?: string
  _hydrated: boolean
}

type Actions = {
  hydrate: (tasks: ITask[]) => void
  fetchAll: () => Promise<void>
  add: (title: string, description?: string) => Promise<void>
  update: (id: string, patch: Partial<ITask>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useTodoStore = create<State & Actions>((set, get) => ({
  tasks: [],
  loading: false,
  error: undefined,
  _hydrrated: false, // 小拼写修正：下面统一用 _hydrated
  _hydrated: false,

  hydrate: (tasks) => {
    if (get()._hydrated) return
    set({ tasks, _hydrated: true })
  },

  fetchAll: async () => {
    set({ loading: true, error: undefined })
    try {
      const list = await getAllTodos()
      set({ tasks: list })
    } catch (e: any) {
      set({ error: e?.message || 'Load failed' })
    } finally {
      set({ loading: false })
    }
  },

  add: async (title, description) => {
    const created = await addNewTodo(title, description)
    set({ tasks: [created, ...get().tasks] })
  },

  update: async (id, patch) => {
    const updated = await updateTodo(id, patch)
    set({ tasks: get().tasks.map(t => (t.id === id ? updated : t)) })
  },

  remove: async (id) => {
    await deleteTodo(id)
    set({ tasks: get().tasks.filter(t => t.id !== id) })
  },
}))
