import type { ScheduleTask } from "../types/ScheduleTask";

type CalendarTaskChipProps = {
  task: ScheduleTask;
};

function CalendarTaskChip({ task }: CalendarTaskChipProps) {
  const priorityColors: { [key: number]: string } = {
    5: "#ef4444", // red
    4: "#f97316", // orange
    3: "#eab308", // yellow
    2: "#84cc16", // lime
    1: "#22c55e", // green
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
