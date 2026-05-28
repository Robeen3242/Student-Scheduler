import {useState} from "react";
import type {
  ScheduleTask
} from "../types/ScheduleTask";
import TaskForm from "./TaskForm";

type ScheduleProps = {
  onClose: () => void;
}

function Schedule({ onClose }: ScheduleProps) {
  const [, setTasks] = useState<ScheduleTask[]>([]);
  type scheduleView = "main" | "addTask";
  const [view, setView] = useState<scheduleView>("main");

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

        <div 
        className="modal-actions"
        style={{ 
          display: "flex",
          marginBottom: "20px",
        }}>
          {view === "main" && (
          <>
            <button 
            className="app-button app-button-primary"
            onClick={() => setView("addTask")
            }>
              Add Task
            </button>
            <button className="app-button app-button-secondary" onClick={onClose}>
              Close
            </button>
          </>)}

          {view === "addTask" && (
          <div className="schedule-form-panel">
            <TaskForm onSubmit={addtask}/>
            <button className="app-button app-button-back" onClick={() => setView("main")}>
              Back
            </button>
          </div>)}
        </div>
      </div>
    </div>
  );
}

export default Schedule;
