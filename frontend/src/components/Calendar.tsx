import { useState } from "react";
import Schedule from "./Schedule";

import type { DailyRating } from "../types/DailyRating";
import CalendarGrid from "./CalendarGrid";
import RatingBox from "./RatingBox";
import Modal from "./Modal";

function getCalendarDays(year: number, month: number) {
  const dates: (Date | null)[] = [];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startingWeekday = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

  for (let i = 0; i < startingWeekday; i++) {
    dates.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    dates.push(new Date(year, month, day));
  }

  return dates;
}
function Calendar() {
  const today = new Date();
  const days = getCalendarDays(today.getFullYear(), today.getMonth())
  const[ratingOpen, setRatingOpen] = useState(false);
  const [, setRatings] = useState<DailyRating[]>([]);

  const[scheduleOpen, setScheduleOpen] = useState(false);
  return (
    <div className="calendar-page">
      <h2>Calendar</h2>
        <CalendarGrid 
          days = {days}
          onDayClick={() => setRatingOpen(true)} 
        />
        
        {/* Cover entire screen no matter where you scroll */}
        {/* bgColor: Black transparency with 50% opacity */}
        {/* Center inside */}
        {/* Onclick: Set state to false to collapse popup */}
        {ratingOpen && (
          <Modal
            isOpen={ratingOpen}
            onClose={() => setRatingOpen(false)}
            title="Rate this day"
          >
            <RatingBox
              onClose={() => setRatingOpen(false)}
              onSubmit={async (score) => {
                setRatings(prev => [...prev, score]);
                const response = await fetch("http://127.0.0.1:8000/ratings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(score),
                });

                const data = await response.json();
                console.log(data);
              }}
            />
          </Modal>
        )}
      <section className="calendar-actions">
        <button
        className="app-button app-button-primary"
        onClick={() => setScheduleOpen(true)} 
        >
          Open Schedule
        </button>
        {scheduleOpen && (
          <Modal
            isOpen={scheduleOpen}
            onClose={() => setScheduleOpen(false)}
            title="Schedule"
          >
            <Schedule onClose={() => setScheduleOpen(false)} />
          </Modal>
        )}
      </section>
    </div>
  );
}

export default Calendar; //Need this to be referenced
