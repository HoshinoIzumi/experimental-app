"use client";

import { GoPlus } from "react-icons/go";
import Modal from "./Modal";
import { useState } from "react";
import { addNewTodo } from "@/api";
import type { ITask } from "@/types/tasks";
import { useRouter } from "next/navigation";

interface AddTaskProps {
  onAdded?: (task: ITask) => void;
}

const AddTask: React.FC<AddTaskProps> = ({ onAdded }) => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [newTaskValue, setNewTaskValue] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitNewTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTaskValue.trim();
    if (!title) return;

    try {
      setSubmitting(true);
      const saved = await addNewTodo(title, description);
      onAdded?.(saved);
      setNewTaskValue("");
      setDescription("");
      setModalOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Add task failed:", err);
      // TODO: toast/error handling
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setModalOpen(true)}
        className="btn btn-primary w-full"
      >
        <GoPlus size={20} className="ml-2" />
        Add new task
      </button>

      <Modal modalOpen={modalOpen} setModalOpen={setModalOpen}>
        <form onSubmit={handleSubmitNewTodo}>
          <h3 className="font-bold text-lg mb-4">Add New Task</h3>

          <input
            value={newTaskValue}
            onChange={(e) => setNewTaskValue(e.target.value)}
            type="text"
            placeholder="Task Title"
            className="input input-bordered w-full mb-4"
            autoFocus
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task Description"
            className="textarea textarea-bordered w-full mb-4"
          />

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={!newTaskValue.trim() || submitting}
          >
            {submitting ? "Saving..." : "Add Task"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AddTask;
