from datetime import date

import META_Data_Cleaning as mdc
import Data_FeaTuring as ft
import pandas as pd
from pathlib import Path

def loadAllSemesters():
    """
    Load and clean data for all semesters.
    
    Returns:
    dict: A dictionary where keys are semester names and values are tuples of cleaned rating and tasks DataFrames.
    """
    dataframes = {}

    current_dir = Path(__file__).parent

    for file in current_dir.glob("*ratings.csv"):
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
    print(f"Processed data for semester: {semester} with {len(processed_values)} entries.")
    return processed_values




if __name__ == "__main__":
    all_semester_data = loadAllSemesters()
    
    for semester, semester_data in all_semester_data.items():
        rating_df, tasks_df = semester_data
        processed_data = processSemesterData(semester, (rating_df, tasks_df))
