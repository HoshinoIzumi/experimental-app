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

const toErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unknown error'

export const useTodoStore = create<State & Actions>((set, get) => ({
  tasks: [],
  loading: false,
  error: undefined,
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
    } catch (e: unknown) {
      set({ error: toErrorMessage(e) })
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
    set({ tasks: get().tasks.map((t) => (t.id === id ? updated : t)) })
  },

  remove: async (id) => {
    await deleteTodo(id)
    set({ tasks: get().tasks.filter((t) => t.id !== id) })
  },
}))
