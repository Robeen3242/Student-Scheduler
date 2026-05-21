import {useState} from "react";

type ScheduleTask = {
  id: number;
  title: string;
  description: string;
  dueDate: string; // ISO format date string
  occurance: "daily" | "weekly" | "biweekly" | "monthly";
  priority: number; // 1-5, 5 being the highest priority
};

function Schedule() {
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);

  function addTask(task: ScheduleTask) {
    setTasks(prev => [...prev, task]);
  }

  function deleteTask(taskId: number) {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }

  return (
    <div className="schedule-container" style={{ padding: "10px" }}>
      <h1>Manage Schedule</h1>
    </div>
  );
}

export default Schedule;