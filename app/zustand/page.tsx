import { getAllTodos } from '@/api'
import ZustandClient from './ZustandClient'

export default async function ZustandPage() {
  const tasks = await getAllTodos() // SSR 取数
  return <ZustandClient initialTasks={tasks} />
}
