'use client'
import { useTodoStore } from '@/lib/todo-store'
import type { ITask } from '@/types/tasks'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Modal from '@/app/components/Modal'

export default function ZustandClient({ initialTasks }: { initialTasks: ITask[] }) {
  const hydrate = useTodoStore(s => s.hydrate)
  const tasks   = useTodoStore(s => s.tasks)
  const add     = useTodoStore(s => s.add)
  const update  = useTodoStore(s => s.update)
  const remove  = useTodoStore(s => s.remove)

  useEffect(() => { hydrate(initialTasks) }, [hydrate, initialTasks])

  // —— Add 弹窗状态 ——
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submitNew = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    setSubmitting(true)
    try {
      await add(t, desc.trim() || undefined)
      setTitle('')
      setDesc('')
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  // —— Update 弹窗状态 ——
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<ITask | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editCompleted, setEditCompleted] = useState(false)
  const [updating, setUpdating] = useState(false)

  const openEdit = (t: ITask) => {
    setEditing(t)
    setEditTitle(t.title)
    setEditDesc(t.description ?? '')
    setEditCompleted(t.completed)
    setEditOpen(true)
  }

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    const t = editTitle.trim()
    if (!t) return
    setUpdating(true)
    try {
      await update(editing.id, {
        title: t,
        description: editDesc.trim() || undefined,
        completed: editCompleted,
      })
      setEditOpen(false)
      setEditing(null)
    } finally {
      setUpdating(false)
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return
    await remove(id)
  }

  return (
    <main className="max-w-4xl mx-auto mt-4">
      <div className="text-center my-5 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Todo List (Zustand)</h1>

        {/* 回首页 */}
        <Link href="/" className="btn btn-outline w-full">Back to Home</Link>

        {/* 新建按钮 */}
        <button className="btn btn-primary w-full" onClick={() => setOpen(true)}>
          Add new task
        </button>
      </div>

      {/* 列表 */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Completed</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td className="break-words">{t.description}</td>
                <td>{t.completed ? 'Yes' : 'No'}</td>
                {/* 用 ISO 文本，避免 SSR/CSR 时区差异的水合警告 */}
                <td><time dateTime={t.createdAt}>{new Date(t.createdAt).toISOString()}</time></td>
                <td>{t.updatedAt ? <time dateTime={t.updatedAt}>{new Date(t.updatedAt).toISOString()}</time> : 'N/A'}</td>
                <td className="text-right space-x-2">
                  <button className="btn btn-sm" onClick={() => openEdit(t)}>Update</button>
                  <button className="btn btn-sm btn-error" onClick={() => onDelete(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal modalOpen={open} setModalOpen={setOpen}>
        <form onSubmit={submitNew}>
          <h3 className="font-bold text-lg mb-4">Add New Task</h3>
          <input
            className="input input-bordered w-full mb-4"
            placeholder="Task Title"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            autoFocus
          />
          <textarea
            className="textarea textarea-bordered w-full mb-4"
            placeholder="Task Description"
            value={desc}
            onChange={(e)=>setDesc(e.target.value)}
          />
          <button type="submit" className="btn btn-primary w-full" disabled={!title.trim() || submitting}>
            {submitting ? 'Saving...' : 'Add Task'}
          </button>
        </form>
      </Modal>

      {/* Update Modal */}
      <Modal modalOpen={editOpen} setModalOpen={setEditOpen}>
        <form onSubmit={submitUpdate}>
          <h3 className="font-bold text-lg mb-4">Update Task</h3>
          <input
            className="input input-bordered w-full mb-3"
            value={editTitle}
            onChange={(e)=>setEditTitle(e.target.value)}
            placeholder="Task Title"
            autoFocus
          />
          <textarea
            className="textarea textarea-bordered w-full mb-3"
            value={editDesc}
            onChange={(e)=>setEditDesc(e.target.value)}
            placeholder="Task Description"
          />
          <label className="label cursor-pointer justify-start gap-2 mb-3">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={editCompleted}
              onChange={(e)=>setEditCompleted(e.target.checked)}
            />
            <span className="label-text">Completed</span>
          </label>
          <button type="submit" className="btn btn-primary w-full" disabled={!editTitle.trim() || updating}>
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Modal>
    </main>
  )
}
