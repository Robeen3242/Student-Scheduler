{/* onClick is a function with no args and no return value */}
type DayBoxProps = {
    onClick: () => void;
}

function DayBox({ onClick }: DayBoxProps) {
    return (
        <div className="day-box" 
        onClick={onClick}
        style={{ border: "1px solid black", padding: "10px", cursor: "pointer" }}>
            <h3>Day Box</h3>
        </div>
    );
}

export default DayBox;