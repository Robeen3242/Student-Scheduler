import type { ScheduleTask } from "../types/ScheduleTask";

type CalendarTaskChipProps = {
  task: ScheduleTask;
};

function CalendarTaskChip({ task }: CalendarTaskChipProps) {
  const priorityColors: { [key: number]: string } = {
    1: "#ef4444", // red
    2: "#f97316", // orange
    3: "#eab308", // yellow
    4: "#84cc16", // lime
    5: "#22c55e", // green
  };

  return (
    <div
      className="calendar-task-chip"
      title={task.title}
      style={{
        borderLeftColor: priorityColors[task.priority] || "#6b7280",
      }}
    >
      <span className="calendar-task-title">{task.title}</span>
      <span className="calendar-task-priority">{task.priority}</span>
    </div>
  );
}

export default CalendarTaskChip;
