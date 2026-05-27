import {useState} from "react";
import type {
  ScheduleTask, 
  ScheduleOccurrence, 
  Recurrence
} from "../types/ScheduleTask";
import TaskForm from "./TaskForm";

type ScheduleProps = {
  onClose: () => void;
}

function Schedule({ onClose }: ScheduleProps) {
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  function addtask(newtask: ScheduleTask) {
    setTasks(prev => [...prev, newtask]);
  }

  return (
    <div>
      <div 
      style={{
        background: "#263241",
        padding: "20px",
        display: "flex",
        flexDirection: "column", 
        alignItems: "center",
      }}
      onClick={(e) => e.stopPropagation()
      }>
        <button 
        style={{
          padding: "10px 20px",
          backgroundColor: "lightblue",
          border: "none",
          cursor: "pointer",
          marginBottom: "20px",
        }}
        onClick={() => setAddTaskOpen(true)
        }>
          Add Task
        </button>
        {addTaskOpen && (
          <TaskForm onSubmit={addtask} />
        )}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Schedule;
