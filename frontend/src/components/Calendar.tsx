import { useState } from "react";
import DayBox from "./DayBox";
import RatingBox from "./RatingBox";

function Calendar() {
  const[ratingOpen, setRatingOpen] = useState(false);
  return (
    <div>
      <h2>Calendar</h2>
      <p>This is the calendar page.</p>
      <h3>Here is a day box:</h3>
      <DayBox onClick={() => setRatingOpen(true)} />
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
            <RatingBox onClose={() => setRatingOpen(false)} />
        </div>
        )}
    </div>
  );
}

export default Calendar; {/* Need this to be referenced */}