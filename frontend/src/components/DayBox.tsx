{/* onClick is a function with no args and no return value */}
//Repeatable box used in CalendarGrid
type DayBoxProps = {
    onClick: () => void;
    passKey: Date;
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
            <h3>{passKey.getDate()}</h3>
        </div>
    );
}

export default DayBox;