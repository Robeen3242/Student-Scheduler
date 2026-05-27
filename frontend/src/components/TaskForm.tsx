import React, { useState } from "react";
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

  const fieldStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "140px minmax(0, 1fr)",
    alignItems: "center",
    gap: "12px",
    width: "100%",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px",
    boxSizing: "border-box",
  };

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

  function handleSubmit(e: React.FormEvent) {
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
    <div
    style={{
        display: "flex",
        justifyContent: "center",
        width: "100%"
    }}>
      <form 
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "16px",

        width: "100%",
        maxWidth: "560px",

        padding: "20px",
        boxSizing: "border-box",
    }}>
      
      <label style={fieldStyle}>
        <span>Title:</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={{ ...fieldStyle, alignItems: "start" }}>
        <span>Description:</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            ...inputStyle,
            minHeight: "100px",
        }}/>
      </label>

      <label style={fieldStyle}>
        <span>Recurrence:</span>
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as Recurrence)}
          style={inputStyle}
        >
          <option value="once">Once</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Biweekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>

      <label style={fieldStyle}>
        <span>Priority (1-5):</span>
        <input
          type="number"
          min={1}
          max={5}
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          style={{ ...inputStyle, maxWidth: "120px" }}
        />
      </label>

      <label style={fieldStyle}>
        <span>Due Date:</span>
        <input
          type="date"
          style={inputStyle}
          value={date_due}
          onChange={(e) => setDateDue(e.target.value)}
        />
      </label>
      <button type="submit" style={{ alignSelf: "center" }}>Add Task</button>
      </form>
    </div>
  );
}

export default TaskForm;
