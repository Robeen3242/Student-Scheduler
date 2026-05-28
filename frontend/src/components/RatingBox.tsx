//Form for selecting rating
import { useState } from "react";
import type { DailyRating } from "../types/DailyRating";
{/* Pass functions through objects */}
type Props = {
    onClose: () => void;
    onSubmit: (score: DailyRating) => void;
}

function RatingBox({ onClose, onSubmit }: Props) {
  const features = ["stress", "burnout", "energy", "mood"] as const;
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  const [score, setScore] = useState<DailyRating>({
    stress : 5,
    burnout : 5,
    energy : 5,
    mood : 5
  })
  return (
    <div>
        {/* Prevent click from propagating to the foreground. 'e' is the event object */}
        <div style={{ 
            background: "#263241",
            padding: "20px",
            display: "flex",
            flexDirection: "column", 
            alignItems: "center",
            gap: "10px",
            }} 
            onClick={(e) => e.stopPropagation()}>

            <h3>{capitalize(features[currentFeatureIndex])}</h3>
            <p> [Description] </p>
            <p>{score[features[currentFeatureIndex]]}</p>
            {/* Input range from 0 to 10. */}
            {/* use prev to safely update part of the object without losing other changes / ie give the latest updated values*/}        
            <input type = "range" min="0" max="10" value={score[features[currentFeatureIndex]]} 
            onChange={(e) => setScore(prev => ({...prev, [features[currentFeatureIndex]]: parseInt(e.target.value)}))} />
            

            <button 
              className="app-button app-button-primary"
              onClick={() => {
                const isLastFeature = currentFeatureIndex === features.length - 1;
                if (isLastFeature) {
                  onSubmit(score);
                  onClose(); // Close the popup after submitting the last feature
                } else{
                  setCurrentFeatureIndex((prev) => prev + 1); // Move to the next feature
                }
            }}>
                Submit
            </button>

            <button className="app-button app-button-secondary" onClick={onClose}>
              Close
            </button>
        </div>
    </div>
  );
}

export default RatingBox;
