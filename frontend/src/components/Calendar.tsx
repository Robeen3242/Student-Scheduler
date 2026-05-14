import { useState } from "react";
import Schedule from "./Schedule";

import type { DailyRating } from "../types/DailyRating";
import CalendarGrid from "./CalendarGrid";
import RatingBox from "./RatingBox";


function Calendar() {
  const days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10,11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];
  const[ratingOpen, setRatingOpen] = useState(false);
  const [ratings, setRatings] = useState<DailyRating[]>([]);
  return (
    <div>
      <h2>Calendar</h2>
        <CalendarGrid 
          days = {days}
          onDayClick={(day) => setRatingOpen(true)} 
        />
        
        {/* Cover entire screen no matter where you scroll */}
        {/* bgColor: Black transparency with 50% opacity */}
        {/* Center inside */}
        {/* Onclick: Set state to false to collapse popup */}
        {ratingOpen && (
          <div
            style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
            }}
            onClick={() => setRatingOpen(false)} 
          >
        {/* Prevent click from propagating to the background. 'e' is the event object */}
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
            </div>
        )}
    </div>
  );
}

export default Calendar; {/* Need this to be referenced */}