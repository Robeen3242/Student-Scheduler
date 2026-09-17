from datetime import timedelta

import META_Data_Cleaning as mdc
import Data_FeaTuring as ft
import pandas as pd
from pathlib import Path

TERM_ORDER = {
    "winter": 1,
    "spring": 2,
    "summer": 3,
    "fall": 4,
}

SEMESTER_GAP_DEFAULTS = {
    "stress_wma_3": 0,
    "stress_wma_7": 0,
    "energy_wma_3": 8,
    "energy_wma_7": 8,
    "mood_wma_3": 5,
    "mood_wma_7": 5,
    "burnout_wma_3": 0,
    "burnout_wma_7": 0,
    "sleep_wma_3": 10,
    "sleep_wma_7": 10,
    "time_spent_wma_3": 0,
    "time_spent_wma_7": 0,
    "days_until_next_exam": -1,
    "tasks_in3": 0,
    "tasks_in7": 0,
    "exams_in3": 0,
    "exams_in7": 0,
    "priority_sum7": 0,
    "avgppt7": 0,
    "max_priority7": 0,
    "course_count": 0,
    "course_count7": 0,
    "course_priority_load7": 0,
    "burnout": 0,
}


def semesterSortKey(file):
    semester = file.name.replace("_ratings.csv", "")
    term, year = semester.rsplit("_", 1)
    return (int(year), TERM_ORDER[term.lower()])


def loadAllSemesters():
    """
    Load and clean data for all semesters.
    
    Returns:
    dict: A dictionary where keys are semester names and values are tuples of cleaned rating and tasks DataFrames.
    """
    dataframes = {}

    current_dir = Path(__file__).parent

    for file in sorted(current_dir.glob("*ratings.csv"), key=semesterSortKey):
        df = pd.read_csv(file)

        if df.empty:
            print(f"The DataFrame for {file.name} is empty. No cleaning needed.")
            continue

        semester = file.name.replace("_ratings.csv", "")

        # Clean ratings
        df = mdc.cleanData(df)
        # Get corresponding tasks
        tasks_path = current_dir / f"{semester}_tasks.csv"
        tasks_df = pd.read_csv(tasks_path)
        
        dataframes[semester] = (df, tasks_df)   

    return dataframes


def processSemesterData(semester,semester_data):
    """
    Process the ratings and tasks data for a given semester.
    
    Args:
    semester (str): The name of the semester.
    semester_data (tuple): A tuple containing the ratings and tasks DataFrames for the semester.
    
    Returns:
    dict: A dictionary containing the processed data for the semester.
    """
    processed_values = {}

    ratings_df = semester_data[0]
    tasks_df = semester_data[1]

    ratings_df["date"] = pd.to_datetime(ratings_df["date"]).dt.date

    for row in ratings_df.itertuples():
        current_date = row.date
        processed_values[current_date] = {}

        for column in ratings_df.columns:
            if column == "date" or column == "break_day":
                continue

            processed_values[current_date] |= {
                f"{column}_wma_3": ft.getWeightedMovingAverage(
                    column, current_date, 3, ratings_df
                ),
                f"{column}_wma_7": ft.getWeightedMovingAverage(
                    column, current_date, 7, ratings_df
                )
            }

        processed_values[current_date] |= {
            "days_until_next_exam": ft.daysUntilNextExam(current_date, tasks_df),
            "tasks_in3": ft.countUpcomingTasks(current_date, 3, tasks_df),
            "tasks_in7": ft.countUpcomingTasks(current_date, 7, tasks_df),
            "exams_in3": ft.countUpcomingTasks(current_date, 3, tasks_df, exam=True),
            "exams_in7": ft.countUpcomingTasks(current_date, 7, tasks_df, exam=True),
            "priority_sum7": ft.getPrioritySum(current_date, 7, tasks_df),
            "avgppt7": ft.getAveragePriority(current_date, 7, tasks_df),
            "max_priority7": ft.getMaxPriority(current_date, 7, tasks_df),
            "course_count": ft.getCourseCount(tasks_df),
            "course_count7": ft.getCourseCountInWindow(current_date, 7, tasks_df),
            "course_priority_load7": ft.getCoursePriorityLoad(current_date, 7, tasks_df)
        }
        processed_values[current_date] |= {
            "burnout": ft.getBurnout(current_date, ratings_df)
        }
    print(f"Processed data for semester: {semester} with {len(processed_values)} entries.")
    return processed_values


def fillBetweenSemesters(current_semester, next_semester, defaults):
    """
    Create default rows for dates between two semesters.

    Args:
    current_semester (dict): Processed data for the earlier semester.
    next_semester (dict): Processed data for the later semester.
    defaults (dict): Default feature values to use for each in-between date.

    Returns:
    dict: Date-keyed default rows for dates after the current semester and before the next semester.
    """
    if not current_semester or not next_semester:
        return {}

    current_end = max(current_semester)
    next_start = min(next_semester)

    gap_start = current_end + timedelta(days=1)
    gap_end = next_start - timedelta(days=1)

    if gap_start > gap_end:
        return {}

    gap_rows = {}
    current_date = gap_start

    while current_date <= gap_end:
        gap_rows[current_date] = defaults.copy()
        current_date += timedelta(days=1)

    return gap_rows


def joinSemesters(current_semester, next_semester, defaults):
    """
    Join two processed semesters and fill any dates between them with defaults.
    """
    return (
        current_semester
        | fillBetweenSemesters(current_semester, next_semester, defaults)
        | next_semester
    )


def generateHeap(processed_semesters, gap_defaults=SEMESTER_GAP_DEFAULTS):
    batches = []
    scope = {}
    included_semesters = []
    previous_semester_data = None

    for semester, semester_data in processed_semesters.items():
        if previous_semester_data is not None:
            scope.update(fillBetweenSemesters(
                previous_semester_data,
                semester_data,
                gap_defaults
            ))

        scope.update(semester_data)
        included_semesters.append(semester)
        previous_semester_data = semester_data

        batches.append(scope.copy())

        print(
            f"Batch {len(batches)}: "
            f"{', '.join(included_semesters)}"
        )
    return batches


def generateStack(all_semesters, gap_defaults=SEMESTER_GAP_DEFAULTS):
    batches = []
    loaded_semesters = list(all_semesters.keys())

    for i, semester in enumerate(loaded_semesters):
        next_index = i + 1

        if next_index >= len(loaded_semesters):
            print(f"No next semester for {semester}; stopping stack generation.")
            break

        next_semester = loaded_semesters[next_index]

        if semester not in all_semesters:
            print(f"Skipping Batch {len(batches) + 1}: {semester} is missing from processed semesters.")
            continue

        if next_semester not in all_semesters:
            print(f"Skipping Batch {len(batches) + 1}: {next_semester} is missing from processed semesters.")
            continue

        batches.append(joinSemesters(
            all_semesters[semester],
            all_semesters[next_semester],
            gap_defaults
        ))

        print(f"Batch {len(batches)}: {semester}, {next_semester}")

    return batches

def saveBatches(batches, batch_type="batch"):
    output_dir = Path(__file__).parent / "Batches"
    output_dir.mkdir(exist_ok=True)

    for i, batch in enumerate(batches, start=1):
        batch_df = pd.DataFrame.from_dict(batch, orient="index")
        batch_df.index.name = "date"
        batch_df = batch_df.sort_index()

        output_path = output_dir / f"{batch_type}_{i}.csv"
        batch_df.to_csv(output_path)
        print(f"Saved {output_path.name} with {len(batch_df)} rows.")

    return output_dir

if __name__ == "__main__":
    # raw data of all semesters
    all_semester_data = loadAllSemesters()
    # names of loaded semesters

    # processed data for all semesters
    processed_data = {}
    for semester, semester_data in all_semester_data.items():
        rating_df, tasks_df = semester_data
        processed_data[semester] = processSemesterData(semester, semester_data)

    heap_batches = generateHeap(processed_data)
    stack_batches = generateStack(processed_data)
    saveBatches(heap_batches, "heap_batch")
    saveBatches(stack_batches, "stack_batch")
    print("Done")
