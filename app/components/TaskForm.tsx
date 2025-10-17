"use client";
import { useEffect, useState } from "react";
import type { ITask } from "@/types/tasks";

type Values = Pick<ITask, "title" | "description" | "completed">;

interface TaskFormProps {
  mode?: "create" | "update";
  initial?: Partial<Values>;
  submitting?: boolean;
  onSubmit: (values: Values) => Promise<void> | void;
}

export default function TaskForm({
  mode = "create",
  initial = {},
  submitting = false,
  onSubmit,
}: TaskFormProps) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [completed, setCompleted] = useState<boolean>(
    initial.completed ?? false,
  );

  useEffect(() => {
    setTitle(initial.title ?? "");
    setDescription(initial.description ?? "");
    setCompleted(initial.completed ?? false);
  }, [initial.title, initial.description, initial.completed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    await onSubmit({
      title: t,
      description: description.trim() || undefined,
      completed,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="font-bold text-lg mb-4">
        {mode === "create" ? "Add New Task" : "Update Task"}
      </h3>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        type="text"
        placeholder="Task Title"
        className="input input-bordered w-full mb-3"
        autoFocus
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task Description"
        className="textarea textarea-bordered w-full mb-3"
      />

      {mode === "update" && (
        <label className="label cursor-pointer justify-start gap-2 mb-3">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
          />
          <span className="label-text">Completed</span>
        </label>
      )}

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={!title.trim() || submitting}
      >
        {submitting
          ? "Saving..."
          : mode === "create"
            ? "Add Task"
            : "Save Changes"}
      </button>
    </form>
  );
}
