{/* onClick is a function with no args and no return value */}
//Repeatable box used in CalendarGrid
type DayBoxProps = {
    onClick: () => void;
    passKey: Date;
}

function DayBox({ onClick, passKey }: DayBoxProps) {
    return (
        <button className="day-box" onClick={onClick} type="button">
            <span className="day-box-header">
                <span className="day-box-date">{passKey.getDate()}</span>
            </span>
            <span className="day-box-content" aria-hidden="true" />
        </button>
    );
}

export default DayBox;
