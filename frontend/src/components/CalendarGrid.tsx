//Overlay of the calendar that shows the schedules
import DayBox from "./DayBox";

import type { ScheduleTask } from "../types/ScheduleTask";

type CalendarGridProps = {
  days : (Date | null)[];
  onDayClick: (day: Date) => void;
  tasks : ScheduleTask[];
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarGrid({ days, onDayClick, tasks }: CalendarGridProps) {
  return (
    <div className="calendar-grid">
      {weekdays.map((day) => (
        <div className="calendar-weekday" key={day}>{day}</div>
      ))}
      {days.map((day, index) => {
          if (day === null) {
            return <div className="day-box-empty" key={`empty-${index}`} />;
          }
      const dateString = day.toISOString().split("T")[0]; // "YYYY-MM-DD"
      const tasksForDay = tasks.filter(task => task.occurrences.some((occurrences) => occurrences.date_due === dateString));
      return (
        <DayBox key={dateString} onClick={() => onDayClick(day)} passKey={day} tasks={tasksForDay} />
      );
      })}
    </div>
    );
}

export default CalendarGrid;
