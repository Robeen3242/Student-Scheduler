import { useState } from "react";
import type { FormEvent } from "react";
import type { Recurrence, ScheduleTask, ScheduleOccurrence } from "../types/ScheduleTask";

type TaskFormProps = {
  onSubmit: (task: ScheduleTask) => void;
}  

function TaskForm({ onSubmit }: TaskFormProps) {
  //Initializations
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence>("once");
  const [priority, setPriority] = useState(1);
  const [date_due, setDateDue] = useState("");

  const recurrenceMap = {
    daily: (date: Date) => {
        date.setDate(date.getDate() + 1);
    },

    weekly: (date: Date) => {
        date.setDate(date.getDate() + 7);
    },

    biweekly: (date: Date) => {
        date.setDate(date.getDate() + 14);
    },

    monthly: (date: Date) => {
        date.setMonth(date.getMonth() + 1);
    }
  };

  function handleSubmit(e: FormEvent) {
    // Handle form submission logic here
    e.preventDefault();

    const newTask: ScheduleTask = {
      id: crypto.randomUUID(),
      title,
      description,
      recurrence,
      priority,
      occurrences: [],
    };

    const occurrences = generateOccurrences(newTask, date_due);
    const taskWithOccurrences : ScheduleTask = {
        ...newTask,
        occurrences,
    };

    onSubmit(taskWithOccurrences);
    console.log(taskWithOccurrences);
    //Set back to defautlt values
    setTitle("");
    setDescription("");
    setRecurrence("once");
    setPriority(1);
    setDateDue("");
  }

  function generateOccurrences(task: ScheduleTask, date_due: string) {
    // This function would generate occurrences based on the task's recurrence pattern
    // For simplicity, we'll return an empty array here
    const occurrences: ScheduleOccurrence[] = [];
    const currentDate = new Date();
    const dueDate = new Date(date_due);
    if (task.recurrence === "once") {
        return [{
            id: crypto.randomUUID(),
            taskId: task.id,
            date_due: date_due,
            isCompleted: false,
            isCancelled: false,
        }];
    }
    const advanceDate = recurrenceMap[task.recurrence as Exclude<Recurrence, "once">];
    while (currentDate <= dueDate) {
      occurrences.push({
        id: crypto.randomUUID(),
        taskId: task.id,
        date_due: currentDate.toISOString().split("T")[0],
        isCancelled: false,
        isCompleted: false
      });
      advanceDate(currentDate);
    }

    return occurrences;
  }

  //FORM
  return (
    <div className="task-form-wrap">
      <form 
      onSubmit={handleSubmit}
      className="task-form">
      
      <label className="task-field">
        <span>Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Study session"
        />
      </label>

      <label className="task-field task-field-top">
        <span>Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What needs to get done?"
        />
      </label>

      <label className="task-field">
        <span>Recurrence</span>
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as Recurrence)}
        >
          <option value="once">Once</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Biweekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>

      <label className="task-field">
        <span>Priority</span>
        <input
          className="task-priority-input"
          type="number"
          min={1}
          max={5}
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
        />
      </label>

      <label className="task-field">
        <span>Due Date</span>
        <input
          type="date"
          value={date_due}
          onChange={(e) => setDateDue(e.target.value)}
        />
      </label>
      <div className="task-form-actions">
        <button type="submit" className="app-button app-button-primary">
          Add Task
        </button>
      </div>
      </form>
    </div>
  );
}

export default TaskForm;
