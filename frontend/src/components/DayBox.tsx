{/* onClick is a function with no args and no return value */}
type DayBoxProps = {
    onClick: () => void;
    passKey: number;
}

function DayBox({ onClick, passKey }: DayBoxProps) {
    return (
        <div className="day-box" 
        onClick={onClick}
        style={{ 
            border: "1px solid black",
            padding: "10px",
            cursor: "pointer",
            minHeight: "100px",
            minWidth: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <h3>{passKey}</h3>
        </div>
    );
}

export default DayBox;