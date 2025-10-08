import { GoPlus } from 'react-icons/go'
import Modal from './Modal'

const AddTask = () => {
    
  return (
    <div>
        <button className='btn btn-primary w-full'>
        <GoPlus size={20} className='ml-2'/>
        Add new task
        </button>

        <Modal />
    </div>
  )
}

export default AddTask
