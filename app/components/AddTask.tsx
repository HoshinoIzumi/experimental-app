'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { addNewTodo } from '@/api'
import type { ITask } from '@/types/tasks'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

interface AddTaskProps {
  onAdded?: (task: ITask) => void
}

export default function AddTask({ onAdded }: AddTaskProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const latch = useRef(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = title.trim()
    if (!t || submitting || latch.current) return
    latch.current = true
    try {
      setSubmitting(true)
      const saved = await addNewTodo(t, description.trim() || undefined)
      onAdded ? onAdded(saved) : router.refresh()
      setOpen(false)
      setTitle('')
      setDescription('')
    } finally {
      setSubmitting(false)
      latch.current = false
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add new task
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task Title"
            autoFocus
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task Description"
          />
          <Button type="submit" className="w-full" disabled={!title.trim() || submitting}>
            {submitting ? 'Saving...' : 'Add Task'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
