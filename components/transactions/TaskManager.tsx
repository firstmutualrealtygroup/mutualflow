"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle, Plus, X, AlertCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: string;
  dueDate?: Date | null;
}

interface TaskManagerProps {
  transactionId: string;
  initialTasks: Task[];
}

export default function TaskManager({
  transactionId,
  initialTasks,
}: TaskManagerProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "MEDIUM" });
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleTask(task: Task) {
    setLoading(task.id);
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    if (res.ok) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
      );
    }
    setLoading(null);
  }

  async function addTask() {
    if (!newTask.title.trim()) return;
    setLoading("new");

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionId,
        title: newTask.title,
        priority: newTask.priority,
      }),
    });

    if (res.ok) {
      const task = await res.json();
      setTasks((prev) => [...prev, task]);
      setNewTask({ title: "", priority: "MEDIUM" });
      setShowAdd(false);
    }
    setLoading(null);
  }

  async function deleteTask(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  const priorityColors: Record<string, string> = {
    LOW: "text-gray-400",
    MEDIUM: "text-yellow-500",
    HIGH: "text-red-500",
  };

  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="font-semibold text-gray-900">Tasks</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {completed}/{tasks.length} completed
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Add Task Form */}
      {showAdd && (
        <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
              placeholder="Task description..."
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              autoFocus
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask((p) => ({ ...p, priority: e.target.value }))}
              className="px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <button
              onClick={addTask}
              disabled={loading === "new"}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              {loading === "new" ? "..." : "Add"}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="divide-y divide-gray-50">
        {tasks.length === 0 ? (
          <div className="px-5 py-6 text-center text-gray-400 text-sm">
            No tasks yet. Add tasks to track your progress.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 px-5 py-3 group hover:bg-gray-50 transition ${
                task.completed ? "opacity-60" : ""
              }`}
            >
              <button
                onClick={() => toggleTask(task)}
                disabled={loading === task.id}
                className="shrink-0"
              >
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 hover:text-blue-500 transition" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    task.completed ? "line-through text-gray-400" : "text-gray-700"
                  }`}
                >
                  {task.title}
                </p>
              </div>
              <AlertCircle
                className={`w-3.5 h-3.5 shrink-0 ${priorityColors[task.priority]}`}
              />
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
