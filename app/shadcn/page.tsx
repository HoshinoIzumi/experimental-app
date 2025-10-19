'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { getAllTodos, addNewTodo, deleteTodo, updateTodo } from '@/api'
import type { ITask } from '@/types/tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import {
  Table, TableHeader, TableHead, TableRow, TableBody, TableCell
} from '@/components/ui/table'

type CreateValues = { title: string; description?: string }
type UpdateValues = { title: string; description?: string; completed: boolean }

export default function ShadcnPage() {
  const [tasks, setTasks] = useState<ITask[]>([])
  const [createOpen, setCreateOpen] = useState(false)

  // ====== Create form ======
  const {
    register: regC,
    handleSubmit: submitC,
    reset: resetC,
    formState: stateC,
  } = useForm<CreateValues>({ defaultValues: { title: '', description: '' } })

  useEffect(() => {
    (async () => setTasks(await getAllTodos()))()
  }, [])

  const onCreate = async (v: CreateValues) => {
    const saved = await addNewTodo(v.title.trim(), v.description?.trim() || undefined)
    setTasks(prev => [saved, ...prev])
    resetC()
    setCreateOpen(false)
  }

  const onDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return
    await deleteTodo(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<ITask | null>(null)

  const {
    register: regU,
    handleSubmit: submitU,
    reset: resetU,
    setValue: setU,
    formState: stateU,
  } = useForm<UpdateValues>({
    defaultValues: useMemo(
      () => ({ title: '', description: '', completed: false }),
      []
    ),
  })

  const openEdit = (t: ITask) => {
    setEditing(t)
    resetU({
      title: t.title,
      description: t.description ?? '',
      completed: t.completed,
    })
    setEditOpen(true)
  }

  const onUpdate = async (v: UpdateValues) => {
    if (!editing) return
    const updated = await updateTodo(editing.id, {
      title: v.title.trim(),
      description: v.description?.trim() || undefined,
      completed: v.completed,
    })
    setTasks(prev => prev.map(x => (x.id === updated.id ? updated : x)))
    setEditOpen(false)
    setEditing(null)
  }

  return (
    <main className="max-w-4xl mx-auto mt-6 space-y-5">
      <h1 className="text-2xl font-bold">Todo (shadcn/ui)</h1>

      <Button asChild variant="outline" className="w-full">
        <Link href="/">Back to Home</Link>
      </Button>

      {/* Create: Dialog + RHF */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">Add new task</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitC(onCreate)} className="space-y-3">
            <Input placeholder="Task Title" autoFocus {...regC('title', { required: true })} />
            <Textarea placeholder="Task Description" {...regC('description')} />
            <Button type="submit" className="w-full" disabled={!stateC.isValid || stateC.isSubmitting}>
              {stateC.isSubmitting ? 'Saving…' : 'Add Task'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* List */}
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map(t => (
              <TableRow key={t.id}>
                <TableCell>{t.title}</TableCell>
                <TableCell className="break-words">{t.description}</TableCell>
                <TableCell>{t.completed ? 'Yes' : 'No'}</TableCell>
                <TableCell><time dateTime={t.createdAt}>{new Date(t.createdAt).toISOString()}</time></TableCell>
                <TableCell>
                  {t.updatedAt ? <time dateTime={t.updatedAt}>{new Date(t.updatedAt).toISOString()}</time> : 'N/A'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(t)}>
                    Update
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(t.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Update */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setEditing(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Task</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitU(onUpdate)} className="space-y-3">
            <Input placeholder="Task Title" {...regU('title', { required: true })} />
            <Textarea placeholder="Task Description" {...regU('description')} />
            <div className="flex items-center gap-2">
              <Checkbox
                checked={!!editing && stateU.defaultValues !== undefined ? undefined : undefined}
                onCheckedChange={(v) => setU('completed', Boolean(v))}
              />
              <span className="text-sm">Completed</span>
            </div>
            <input type="hidden" {...regU('completed')} />

            <Button type="submit" className="w-full" disabled={!stateU.isValid || stateU.isSubmitting}>
              {stateU.isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
