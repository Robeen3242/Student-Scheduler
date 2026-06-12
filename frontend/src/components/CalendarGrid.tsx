//Overlay of the calendar that shows the schedules
import DayBox from "./DayBox";
import type { ScheduleTask } from "../types/ScheduleTask";
import {formatDate} from "../utils/dateUtils";

type CalendarGridProps = {
  days : (Date | null)[];
  onDayClick: (day: Date) => void;
  tasks : ScheduleTask[];
  completedRatingDates: ReadonlySet<string>;
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarGrid({ days, onDayClick, tasks, completedRatingDates }: CalendarGridProps) {
  return (
    <div className="calendar-grid">
      {weekdays.map((day) => (
        <div className="calendar-weekday" key={day}>{day}</div>
      ))}
      {days.map((day, index) => {
          if (day === null) {
            return <div className="day-box-empty" key={`empty-${index}`} />;
          }
      const dateString = formatDate(day); // "YYYY-MM-DD"
      const tasksForDay = tasks.filter(task => task.occurrences.some((occurrences) => occurrences.date_due === dateString));
      return (
        <DayBox
          key={dateString}
          onClick={() => onDayClick(day)}
          passKey={day}
          tasks={tasksForDay}
          isCompleted={completedRatingDates.has(dateString)}
        />
      );
      })}
    </div>
    );
}

export default CalendarGrid;
