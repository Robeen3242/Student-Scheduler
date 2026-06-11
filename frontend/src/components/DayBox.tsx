import type { ScheduleTask } from "../types/ScheduleTask";
import CalendarTaskChip from "./CalendarTaskChip";

{/* onClick is a function with no args and no return value */}
//Repeatable box used in CalendarGrid
type DayBoxProps = {
    onClick: () => void;
    passKey: Date;
    tasks: ScheduleTask[];
    isCompleted: boolean;
}

function DayBox({ onClick, passKey, tasks, isCompleted }: DayBoxProps) {
    return (
        <button
            className={`day-box${isCompleted ? " day-box-complete" : ""}`}
            onClick={onClick}
            type="button"
        >
            <span className="day-box-header">
                <span className="day-box-date">{passKey.getDate()}</span>
            </span>
            <span className="day-box-content" aria-hidden="true">
                {tasks.map((task) => (
                  <CalendarTaskChip key={task.taskId} task={task} />
                ))}
            </span>
        </button>
    );
}

export default DayBox;
