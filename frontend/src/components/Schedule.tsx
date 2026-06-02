import {useState} from "react";
import type {
  ScheduleTask
} from "../types/ScheduleTask";
import TaskForm from "./TaskForm";
import TaskBox from "./TaskBox";

type ScheduleProps = {
  onClose: () => void;
}

function Schedule({ onClose }: ScheduleProps) {
  //list of saved tasks
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);

  const [selectedTask, setSelectedTask] = useState<ScheduleTask | null>(null);

  type scheduleView = "main" | "addTask" | "editTask";
  const [view, setView] = useState<scheduleView>("main");

  function addtask(newtask: ScheduleTask) {
    setTasks(prev => [...prev, newtask]);
    setView("main");
  }

  function updateTask(updatedTask: ScheduleTask) {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
    setSelectedTask(null);
    setView("main");
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
          <div className="schedule-main-panel">
            <div className="schedule-action-row">
              <button 
              className="app-button app-button-primary"
              onClick={() => setView("addTask")
              }>
                Add Task
              </button>
              <button className="app-button app-button-secondary" onClick={onClose}>
                Close
              </button>
            </div>

            <div className="task-list">
              {tasks.length === 0 ? (
                <p className="task-list-empty">No tasks yet.</p>
              ) : (
                tasks.map((task) => (
                  <TaskBox 
                  key={task.id} 
                  task={task} 
                  onClick={() => {
                    setSelectedTask(task);
                    setView("editTask");
                  }}/>
                ))
              )}
            </div>
          </div>)}

          {view === "addTask" && (
          <div className="schedule-form-panel">
            <TaskForm onSubmit={addtask}/>
            <button className="app-button app-button-back" onClick={() => setView("main")}>
              Back
            </button>
          </div>)}

          {view === "editTask" && selectedTask && (
          <div className="schedule-form-panel">
            <TaskForm onSubmit={updateTask} task={selectedTask}/>
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
