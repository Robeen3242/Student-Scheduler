type ScheduleTask = {
  id: number;
  title: string;
  description: string;
  dueDate: string; // ISO format date string
  occurance: "daily" | "weekly" | "biweekly" | "monthly";
  priority: number; // 1-5, 5 being the highest priority
};

function Schedule() {
  //const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  return (
    <div className="schedule-container" style={{ padding: "10px" }}>
      <h1>Manage Schedule</h1>
    </div>
  );
}

export default Schedule;