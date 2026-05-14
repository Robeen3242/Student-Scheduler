import DayBox from "./DayBox";

type CalendarGridProps = {
  days : number[];
  onDayClick: (day: number) => void;
};

function CalendarGrid({ days, onDayClick }: CalendarGridProps) {
  return (
    <div className="calendar-grid" style={{
         display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)"
    }}>
    {days.map((day) => (
        <DayBox key={day} onClick={() => onDayClick(day)} passKey={day} />
    ))}
    </div>
);}

export default CalendarGrid;