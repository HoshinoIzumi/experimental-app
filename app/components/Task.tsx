'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from './Modal'
import TaskForm from './TaskForm'
import { updateTodo, deleteTodo } from '@/api'
import type { ITask } from '@/types/tasks'

interface TaskProps {
  task: ITask
  onUpdated?: (task: ITask) => void
  onDeleted?: (id: string) => void
}

const Task: React.FC<TaskProps> = ({ task, onUpdated, onDeleted }) => {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
        <td>{new Date(task.createdAt).toLocaleString()}</td>
        <td>{task.updatedAt ? new Date(task.updatedAt).toLocaleString() : 'N/A'}</td>
        <td><button className="btn btn-sm" onClick={() => setEditOpen(true)} disabled={deleting}>Update</button></td>
        <td><button className="btn btn-sm btn-error" onClick={handleDelete} disabled={updating || deleting}>Delete</button></td>
      </tr>

      <Modal modalOpen={editOpen} setModalOpen={setEditOpen}>
        <TaskForm
          mode="update"
          initial={{ title: task.title, description: task.description, completed: task.completed }}
          submitting={updating}
          onSubmit={async (v) => {
            try {
              setUpdating(true)
              const updated = await updateTodo(task.id, v)
              onUpdated ? onUpdated(updated) : router.refresh()
              setEditOpen(false)
            } finally {
              setUpdating(false)
            }
          }}
        />
      </Modal>
    </>
  )
}

export default Task
