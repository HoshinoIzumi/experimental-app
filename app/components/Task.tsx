'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { ITask } from '@/types/tasks'
import { updateTodo, deleteTodo } from '@/api'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface TaskProps {
  task: ITask
  onUpdated?: (task: ITask) => void
  onDeleted?: (id: string) => void
}

export default function Task({ task, onUpdated, onDeleted }: TaskProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [completed, setCompleted] = useState<boolean>(task.completed)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = title.trim()
    if (!t || updating) return
    try {
      setUpdating(true)
      const updated = await updateTodo(task.id, {
        title: t,
        description: description.trim() || undefined,
        completed,
      })
      onUpdated ? onUpdated(updated) : router.refresh()
      setOpen(false)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    try {
      setDeleting(true)
      await deleteTodo(task.id)
      onDeleted ? onDeleted(task.id) : router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <tr>
        <td>{task.title}</td>
        <td className="break-words">{task.description}</td>
        <td>{task.completed ? 'Yes' : 'No'}</td>
        <td><time dateTime={task.createdAt}>{new Date(task.createdAt).toISOString()}</time></td>
        <td>
          {task.updatedAt
            ? <time dateTime={task.updatedAt}>{new Date(task.updatedAt).toISOString()}</time>
            : 'N/A'}
        </td>
        <td className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Update
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} disabled={updating || deleting}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {/* 编辑弹窗：shadcn Dialog 自带 Portal，不会破坏 <tbody> 结构 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Task</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitUpdate} className="space-y-3">
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
            <div className="flex items-center gap-2">
              <Checkbox
                id={`completed-${task.id}`}
                checked={completed}
                onCheckedChange={(v) => setCompleted(Boolean(v))}
              />
              <label htmlFor={`completed-${task.id}`} className="text-sm">
                Completed
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={!title.trim() || updating}>
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
