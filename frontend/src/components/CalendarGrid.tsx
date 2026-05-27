//Overlay of the calendar that shows the schedules
import DayBox from "./DayBox";

type CalendarGridProps = {
  days : (Date | null)[];
  onDayClick: (day: Date) => void;
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarGrid({ days, onDayClick }: CalendarGridProps) {

  return (
    <div 
      className="calendar-grid" 
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)"
    }}>
      {weekdays.map((day) => (
        <div key={day} style={{ fontWeight: "bold", textAlign: "center" }}>{day}</div>
      ))}

      {days.map((day, index) => (
          day === null ? <div key={`empty-${index}`} /> :
         <DayBox key={day?.toISOString()} onClick={() => onDayClick(day)} passKey={day} />
      ))}
    </div>
  );
}

export default CalendarGrid;