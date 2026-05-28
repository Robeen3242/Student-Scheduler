//Overlay of the calendar that shows the schedules
import DayBox from "./DayBox";

type CalendarGridProps = {
  days : (Date | null)[];
  onDayClick: (day: Date) => void;
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarGrid({ days, onDayClick }: CalendarGridProps) {

  return (
    <div className="calendar-grid">
      {weekdays.map((day) => (
        <div className="calendar-weekday" key={day}>{day}</div>
      ))}

      {days.map((day, index) => (
          day === null ? <div className="day-box-empty" key={`empty-${index}`} /> :
         <DayBox key={day?.toISOString()} onClick={() => onDayClick(day)} passKey={day} />
      ))}
    </div>
  );
}

export default CalendarGrid;
