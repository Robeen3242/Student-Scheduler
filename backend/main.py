from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Literal
from datetime import date 
from pydantic import BaseModel, Field

import pandas as pd
import os

RATINGS_FILE = "ratings.csv"
TASK_FILE = "tasks.csv"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DailyRating(BaseModel):
    date: date
    stress: int = Field(ge=0, le=10)
    energy: int = Field(ge=0, le=10)
    mood: int = Field(ge=0, le=10)
    burnout: int = Field(ge=0, le=10)
    sleep: int = Field(ge=0, le=10)
    time_spent: float = Field(ge=0, le=24)
    break_day: bool = False

Recurrence = Literal["once", "daily", "weekly", "biweekly", "monthly"];

class ScheduleOccurrence(BaseModel):
    id: str
    taskId: str
    date_due: str
    note: str | None = None
    isCompleted: bool
    isCancelled: bool

class ScheduleTask(BaseModel):
    taskId: str
    title: str
    description: str
    courseId: str | None = None
    recurrence: Recurrence
    priority: int
    exam: bool = False
    occurrences: list[ScheduleOccurrence]

class Course(BaseModel):
    id: str
    name: str

daily_ratings: dict[str, DailyRating] = {}
tasks: list[ScheduleTask] = []
courses: list[Course] = []

@app.post("/ratings")
async def create_rating(rating: DailyRating):
    day = rating.date.isoformat()
    daily_ratings[day] = rating
    save_ratings_to_csv()
    return {"message": "saved", "rating": rating}


@app.get("/ratings")
async def get_ratings():
    return {"ratings": list(daily_ratings.values())}


@app.put("/tasks/{task_id}")
async def update_task(task_id: str, task: ScheduleTask):
    for index, saved_task in enumerate(tasks):
        if saved_task.taskId == task_id:
            tasks[index] = task
            save_tasks_to_csv()
            return {"message": "task updated", "task": task}

    tasks.append(task)
    save_tasks_to_csv()
    return {"message": "task saved", "task": task}


@app.get("/tasks")
async def get_tasks():
    return {"tasks": tasks}


@app.post("/courses")
async def create_course(course: Course):
    for index, saved_course in enumerate(courses):
        if saved_course.id == course.id:
            courses[index] = course
            return {"message": "course updated", "course": course}
    courses.append(course)
    return {"message": "course saved", "course": course}


@app.get("/courses")
async def get_courses():
    return {"courses": courses}


@app.delete("/courses/{course_id}")
async def delete_course(course_id: str):
    courses[:] = [course for course in courses if course.id != course_id]

    for task in tasks:
        if task.courseId == course_id:
            task.courseId = None

    save_tasks_to_csv()

    return {"message": "course deleted", "courses": courses}


@app.put("/tasks/{task_id}")
async def update_task(task_id: str, task: ScheduleTask):
    for index, saved_task in enumerate(tasks):
        if saved_task.taskId == task_id:
            tasks[index] = task
            return {"message": "task updated", "task": task}
    tasks.append(task)
    return {"message": "task saved", "task": task}

def save_ratings_to_csv():
    rows = [rating.model_dump() for rating in daily_ratings.values()]
    df = pd.DataFrame(rows)
    df.to_csv(RATINGS_FILE, index=False)

def save_tasks_to_csv():
    rows = []
    for task in tasks:
        for occurrence in task.occurrences:
            row = {
                "taskId": task.taskId,
                "title": task.title,
                "description": task.description,
                "courseId": task.courseId,
                "recurrence": task.recurrence,
                "priority": task.priority,
                "exam": task.exam,
                "occurrenceId": occurrence.id,
                "date_due": occurrence.date_due,
                "note": occurrence.note,
                "isCompleted": occurrence.isCompleted,
                "isCancelled": occurrence.isCancelled
            }
            rows.append(row)
    df = pd.DataFrame(rows)
    df.to_csv(TASK_FILE, index=False)