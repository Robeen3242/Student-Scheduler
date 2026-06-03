import type { ScheduleTask } from "../types/ScheduleTask";
import CalendarTaskChip from "./CalendarTaskChip";

{/* onClick is a function with no args and no return value */}
//Repeatable box used in CalendarGrid
type DayBoxProps = {
    onClick: () => void;
    passKey: Date;
    tasks: ScheduleTask[];
}

function DayBox({ onClick, passKey, tasks }: DayBoxProps) {
    return (
        <button className="day-box" onClick={onClick} type="button">
            <span className="day-box-header">
                <span className="day-box-date">{passKey.getDate()}</span>
            </span>
            <span className="day-box-content" aria-hidden="true">
                {tasks.map((task) => (
                  <CalendarTaskChip key={task.id} task={task} />
                ))}
            </span>
        </button>
    );
}

export default DayBox;
