import { useState } from "react";
{/* Pass functions through objects */}
type Props = {
    onClose: () => void;
}


function RatingBox({ onClose }: Props) {

  const features = ["stress", "burnout", "energy", "mood"] as const;
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1); 

  const [score, setScore] = useState({
    stress : 5,
    burnout : 5,
    energy : 5,
    mood : 5
  })
  return (
    <div>
        {/* Prevent click from propagating to the background. 'e' is the event object */}
        <div style={{ 
            background: "white",
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
            

            <button onClick={() => {console.log(score);
            setCurrentFeatureIndex((prev) => (prev + 1) % features.length)}}>
                Submit
            </button>

            <button onClick={onClose}>Close</button>
        </div>
    </div>
  );
}

export default RatingBox;