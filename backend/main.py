from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Literal
from datetime import date 
from pydantic import BaseModel, Field

import features

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

daily_ratings: dict[str, DailyRating] = {}
tasks = list[ScheduleTask]()

@app.post("/ratings")
async def create_rating(rating: DailyRating):
    day = rating.date.isoformat()
    daily_ratings[day] = rating
    return {"message": "saved", "rating": rating}


@app.get("/ratings")
async def get_ratings():
    return {"ratings": list(daily_ratings.values())}


@app.post("/tasks")
async def create_task(task: ScheduleTask):
    tasks.append(task)
    print(tasks)
    return {"message": "task saved", "task": task}


@app.get("/tasks")
async def get_tasks():
    return {"tasks": tasks}


@app.put("/tasks/{task_id}")
async def update_task(task_id: str, task: ScheduleTask):
    for index, saved_task in enumerate(tasks):
        if saved_task.taskId == task_id:
            tasks[index] = task
            return {"message": "task updated", "task": task}
    tasks.append(task)
    return {"message": "task saved", "task": task}
