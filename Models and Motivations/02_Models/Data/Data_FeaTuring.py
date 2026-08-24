from datetime import timedelta
import pandas as pd

#helper functions for simple consistent data processing
def _as_bool_series(series):
    if pd.api.types.is_bool_dtype(series):
        return series.fillna(False)

    return (
        series.astype(str)
        .str.strip()
        .str.lower()
        .isin(["true", "1", "yes", "y"])
    )

#helper function that returns the current observed window for tasks
def _active_task_window(tasks_df, current_date, days=None, exam=None):
    if tasks_df.empty:
        return tasks_df.copy()

    current_date = pd.to_datetime(current_date)
    due_dates = pd.to_datetime(tasks_df["date_due"])
    completed = _as_bool_series(tasks_df["isCompleted"])
    cancelled = _as_bool_series(tasks_df["isCancelled"])
    exams = _as_bool_series(tasks_df["exam"])

    window = (
        (due_dates >= current_date)
        & ~completed
        & ~cancelled
    )

    if days is not None:
        end_date = current_date + pd.Timedelta(days=days)
        window &= due_dates <= end_date

    if exam is not None:
        window &= exams if exam else ~exams

    active_tasks = tasks_df.loc[window].copy()
    active_tasks["date_due"] = due_dates.loc[window]
    return active_tasks


def _valid_course_ids(tasks_df):
    if tasks_df.empty or "courseId" not in tasks_df:
        return pd.Series(dtype="object")

    course_ids = tasks_df["courseId"].dropna().astype(str).str.strip()
    return course_ids[course_ids != ""]


def getWeightedMovingAverage(feature, current_date, days, ratings_df):
    #includes the current date and goes back the specified number of days
    start_date = current_date - timedelta(days=days - 1)

    window = ratings_df[
        (ratings_df["date"] >= start_date) &
        (ratings_df["date"] <= current_date)
    ]

    if window.empty:
        return None

    weighted_total = 0
    weight_sum = 0

    for row in window.itertuples():
        days_ago = (current_date - row.date).days
        weight = days - days_ago

        weighted_total += weight * getattr(row, feature)
        weight_sum += weight

    return weighted_total / weight_sum if weight_sum > 0 else None



def countUpcomingTasks(current_date, days, tasks_df, exam=False):
    # Calculates incomplete, active task occurrences due within n days.
    return len(_active_task_window(tasks_df, current_date, days, exam=exam))

def daysUntilNextExam(current_date, tasks_df):
    # Exam day should be included in the count.
    exams = _active_task_window(tasks_df, current_date, exam=True)
    if exams.empty:
        return None

    current_date = pd.to_datetime(current_date)
    next_exam_date = exams["date_due"].min()
    return int((next_exam_date - current_date).days)

def getPrioritySum(current_date, days, tasks_df):
    task_window = _active_task_window(tasks_df, current_date, days)
    if task_window.empty:
        return 0

    return pd.to_numeric(task_window["priority"], errors="coerce").fillna(0).sum()

def getAveragePriority(current_date, days, tasks_df):
    task_window = _active_task_window(tasks_df, current_date, days)
    if task_window.empty:
        return None

    priorities = pd.to_numeric(task_window["priority"], errors="coerce").dropna()
    if priorities.empty:
        return None

    return priorities.mean()

def getMaxPriority(current_date, days, tasks_df):
    task_window = _active_task_window(tasks_df, current_date, days)
    if task_window.empty:
        return None

    priorities = pd.to_numeric(task_window["priority"], errors="coerce").dropna()
    if priorities.empty:
        return None

    return priorities.max()

def getCourseCount(tasks_df):
    return _valid_course_ids(tasks_df).nunique()

def getCourseCountInWindow(current_date, days, tasks_df):
    task_window = _active_task_window(tasks_df, current_date, days)
    return _valid_course_ids(task_window).nunique()

def getCoursePriorityLoad(current_date, days, tasks_df):
    avg_priority = getAveragePriority(current_date, days, tasks_df)
    if avg_priority is None:
        return None
    return getCourseCountInWindow(current_date, days, tasks_df) * avg_priority
