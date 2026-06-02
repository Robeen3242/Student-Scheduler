import type { ScheduleTask } from "../types/ScheduleTask";

type taskboxProps = {
  task: ScheduleTask;
  onClick?: () => void;
}

function TaskBox({ task, onClick }: taskboxProps) {
  return (
    <article className="task-box" onClick={onClick} style={{ cursor: "pointer"}}>
      <div className="task-box-header">
        <h3>{task.title}</h3>
        <span className="task-box-priority">Prio: {task.priority}</span>
      </div>

      <div className="task-box-meta">
        <span>{task.recurrence}</span>  
        <span>{task.occurrences.length} due date{task.occurrences.length === 1 ? "" : "s"}</span>
      </div>
    </article>
  );
}

export default TaskBox;
