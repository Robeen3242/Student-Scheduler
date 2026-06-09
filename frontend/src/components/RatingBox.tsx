//Form for selecting rating
import { useState } from "react";
import type { DailyRating } from "../types/DailyRating";
{/* Pass functions through objects */}
type Props = {
    date: string;
    onClose: () => void;
    onSubmit: (score: DailyRating) => void;
}

function RatingBox({ date, onClose, onSubmit }: Props) {
  const features = ["stress", "burnout", "energy", "mood", "sleep", "time_spent"] as const;
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const feature = features[Math.min(currentFeatureIndex, features.length - 1)];
  const featureSettings: Record<typeof features[number], { label: string; min: number; max: number; step: number }> = {
    stress: { label: "Stress", min: 0, max: 10, step: 1 },
    burnout: { label: "Burnout", min: 0, max: 10, step: 1 },
    energy: { label: "Energy", min: 0, max: 10, step: 1 },
    mood: { label: "Mood", min: 0, max: 10, step: 1 },
    sleep: { label: "Sleep", min: 0, max: 10, step: 1 },
    time_spent: { label: "Time Spent", min: 0, max: 24, step: 0.25 },
  };
  const currentSettings = featureSettings[feature];
  const [score, setScore] = useState<DailyRating>({
    date,
    stress : 5,
    burnout : 5,
    energy : 5,
    mood : 5,
    sleep : 5,
    time_spent : 0,
    break_day : false
  })

  const isBreakStep = currentFeatureIndex === features.length;
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

            {isBreakStep ? (
              <>
                <h3>Break Day</h3>
                <label className="rating-checkbox-field">
                  <input
                    type="checkbox"
                    checked={score.break_day}
                    onChange={(e) => setScore(prev => ({...prev, break_day: e.target.checked}))}
                  />
                  <span>Today was a break.</span>
                </label>
              </>
            ) : (
              <>
                <h3>{currentSettings.label}</h3>
                <p> [Description] </p>
                <p>{score[feature]}</p>
                {/* use prev to safely update part of the object without losing other changes / ie give the latest updated values*/}        
                <input
                  type="range"
                  min={currentSettings.min}
                  max={currentSettings.max}
                  step={currentSettings.step}
                  value={score[feature]}
                  onChange={(e) => setScore(prev => ({...prev, [feature]: Number(e.target.value)}))}
                />
              </>
            )}
            

            <button 
              className="app-button app-button-primary"
              onClick={() => {
                if (isBreakStep) {
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
