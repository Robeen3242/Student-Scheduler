# Student Scheduler Backend Context

This file documents the backend code currently attributed to the user for the Student Scheduler project.

It is intentionally grounded only in the supplied backend source. It should be used as persistent context for future work so an assistant does not invent backend architecture, persistence behavior, or endpoint semantics that are not present in the current implementation.

# Stack

The supplied backend uses:

- FastAPI
- Pydantic
- FastAPI `CORSMiddleware`
- Python type hints and `Literal`
- `datetime.date`
- pandas
- CSV persistence
- in-memory Python collections

The FastAPI application is initialized with:

```py
app = FastAPI()
```

CORS is configured permissively:

```py
allow_origins=["*"]
allow_credentials=True
allow_methods=["*"]
allow_headers=["*"]
```

# Persistence Files

Two CSV filenames are defined:

```py
RATINGS_FILE = "ratings.csv"
TASK_FILE = "tasks.csv"
```

The supplied code contains CSV save helpers for ratings and tasks.

There is no corresponding course CSV file in the supplied backend code.

# Backend Domain Models

## `DailyRating`

```py
class DailyRating(BaseModel):
    date: date
    stress: int = Field(ge=0, le=10)
    energy: int = Field(ge=0, le=10)
    mood: int = Field(ge=0, le=10)
    burnout: int = Field(ge=0, le=10)
    sleep: int = Field(ge=0, le=10)
    time_spent: float = Field(ge=0, le=24)
    break_day: bool = False
```

Validation rules:

- `stress`: 0–10
- `energy`: 0–10
- `mood`: 0–10
- `burnout`: 0–10
- `sleep`: 0–10
- `time_spent`: 0–24
- `break_day`: boolean, default `False`

Unlike the frontend type, the backend parses `date` as a Python `date` object.

## `Recurrence`

```py
Recurrence = Literal["once", "daily", "weekly", "biweekly", "monthly"]
```

The recurrence values match the frontend recurrence union.

## `ScheduleOccurrence`

```py
class ScheduleOccurrence(BaseModel):
    id: str
    taskId: str
    date_due: str
    note: str | None = None
    isCompleted: bool
    isCancelled: bool
```

Each occurrence contains:

- its own ID,
- its parent task ID,
- due date string,
- optional note,
- completion state,
- cancellation state.

## `ScheduleTask`

```py
class ScheduleTask(BaseModel):
    taskId: str
    title: str
    description: str
    courseId: str | None = None
    recurrence: Recurrence
    priority: int
    exam: bool = False
    occurrences: list[ScheduleOccurrence]
```

A task owns its metadata and a list of occurrences.

The backend does not validate a numeric range for `priority` in the supplied code.

The `exam` field defaults to `False`.

## `Course`

```py
class Course(BaseModel):
    id: str
    name: str
```

Courses are referenced by tasks through `courseId`.

# In-Memory State

The backend keeps active application data in memory:

```py
daily_ratings: dict[str, DailyRating] = {}
tasks: list[ScheduleTask] = []
courses: list[Course] = []
```

Important consequences of the supplied implementation:

- ratings are keyed by date string,
- tasks are stored as a list,
- courses are stored as a list,
- CSV saving exists for ratings and tasks,
- no CSV-loading logic is present in the supplied code,
- no course persistence helper is present.

Therefore the source shown here saves some data to disk, but does not itself restore that data into memory when the backend starts.

# Ratings Endpoints

## `POST /ratings`

```py
@app.post("/ratings")
async def create_rating(rating: DailyRating):
    day = rating.date.isoformat()
    daily_ratings[day] = rating
    save_ratings_to_csv()
    return {"message": "saved", "rating": rating}
```

Behavior:

1. Pydantic validates the submitted rating.
2. `rating.date` is converted to ISO format.
3. The rating is stored in `daily_ratings` under that date.
4. A rating for the same date replaces the previous value.
5. All current ratings are written to CSV.
6. The saved rating is returned.

This is effectively date-based upsert behavior.

## `GET /ratings`

```py
@app.get("/ratings")
async def get_ratings():
    return {"ratings": list(daily_ratings.values())}
```

Returns the current in-memory ratings as:

```json
{
  "ratings": [...]
}
```

# Task Endpoints

## `GET /tasks`

```py
@app.get("/tasks")
async def get_tasks():
    return {"tasks": tasks}
```

Returns the current in-memory task list.

## `PUT /tasks/{task_id}`

The supplied source contains two definitions of this route.

The first version:

```py
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
```

The second version later in the file:

```py
@app.put("/tasks/{task_id}")
async def update_task(task_id: str, task: ScheduleTask):
    for index, saved_task in enumerate(tasks):
        if saved_task.taskId == task_id:
            tasks[index] = task
            return {"message": "task updated", "task": task}

    tasks.append(task)
    return {"message": "task saved", "task": task}
```

Both versions behave like an upsert:

- replace a matching task by `taskId`,
- otherwise append the supplied task.

However, only the first duplicate definition calls `save_tasks_to_csv()`.

This duplicate route/function definition should be treated as part of the current supplied source, not silently reconciled in future reasoning.

# Course Endpoints

## `POST /courses`

```py
@app.post("/courses")
async def create_course(course: Course):
    for index, saved_course in enumerate(courses):
        if saved_course.id == course.id:
            courses[index] = course
            return {"message": "course updated", "course": course}

    courses.append(course)
    return {"message": "course saved", "course": course}
```

This behaves like an upsert based on course ID:

- replace existing matching course,
- otherwise append.

The supplied code does not save courses to CSV.

## `GET /courses`

```py
@app.get("/courses")
async def get_courses():
    return {"courses": courses}
```

Returns the current in-memory course list.

## `DELETE /courses/{course_id}`

```py
@app.delete("/courses/{course_id}")
async def delete_course(course_id: str):
    courses[:] = [
        course for course in courses
        if course.id != course_id
    ]

    for task in tasks:
        if task.courseId == course_id:
            task.courseId = None

    save_tasks_to_csv()

    return {
        "message": "course deleted",
        "courses": courses
    }
```

Behavior:

1. removes the course from the in-memory list,
2. scans all tasks,
3. unassigns tasks associated with the deleted course,
4. saves tasks to CSV,
5. returns the remaining courses.

Deleting a course does not delete associated tasks.

# CSV Persistence

## Ratings

```py
def save_ratings_to_csv():
    rows = [
        rating.model_dump()
        for rating in daily_ratings.values()
    ]

    df = pd.DataFrame(rows)
    df.to_csv(RATINGS_FILE, index=False)
```

Each `DailyRating` becomes one row.

The source uses `model_dump()` to convert Pydantic models into dictionaries.

## Tasks

```py
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
```

Task persistence is flattened by occurrence.

This means one parent task can produce multiple CSV rows, with the task metadata repeated once for every occurrence.

The CSV uses `occurrenceId` for the occurrence ID even though the Pydantic model field is named `id`.

# Current Backend Data Flow

```text
Frontend request
      |
      v
FastAPI endpoint
      |
      +--> Pydantic validation
      |
      +--> update in-memory collection
      |
      +--> optional CSV save
      |
      v
JSON response
```

Persistence behavior differs by resource:

```text
Ratings:
memory -> ratings.csv

Tasks:
memory -> tasks.csv
(depending on which supplied PUT definition is considered)

Courses:
memory only

Course deletion:
may alter tasks -> tasks.csv
```

# Backend / Frontend Contract

The supplied frontend and backend models are broadly aligned.

## Daily ratings

Frontend sends a date string such as:

```text
YYYY-MM-DD
```

FastAPI/Pydantic parses that into a Python `date`.

The backend serializes the model back through FastAPI when responding.

## Tasks

Both frontend and backend use:

- `taskId`
- `title`
- `description`
- optional `courseId`
- recurrence
- priority
- exam
- occurrences

## Occurrences

Both sides use:

- `id`
- `taskId`
- `date_due`
- optional `note`
- `isCompleted`
- `isCancelled`

## Courses

Both sides use:

- `id`
- `name`

# Important Current-State Notes

1. The supplied backend has no startup CSV-loading logic.
2. Ratings and tasks can be written to CSV, but the shown source does not reconstruct in-memory state from those files.
3. Courses are in-memory only in the supplied implementation.
4. `POST /ratings` replaces existing ratings by date because `daily_ratings` is keyed by ISO date.
5. `PUT /tasks/{task_id}` behaves like an upsert.
6. The source contains duplicate `PUT /tasks/{task_id}` endpoint definitions.
7. The first duplicate task PUT persists to CSV; the second does not.
8. `GET /tasks` exists in the backend even though the supplied frontend currently does not call it on mount.
9. `POST /courses` exists in the backend even though the supplied frontend `addCourse` path currently does not call it.
10. Deleting a course unassigns related tasks instead of deleting those tasks.
11. Task CSV persistence is flattened to one row per occurrence.
12. The backend does not generate recurrence occurrences; it accepts the occurrences already present in `ScheduleTask`.
13. The backend does not enforce the frontend convention that exam tasks are priority `6`.
14. The backend does not enforce a general priority range.
15. CORS is currently open to all origins, methods, and headers.
16. API state primarily lives in Python memory during runtime.
17. `os` is imported in the supplied code but is not used in the shown implementation.
18. `BaseModel` is imported twice in the supplied code.
19. Future changes should distinguish between current behavior and intended behavior rather than silently treating obvious inconsistencies as already fixed.

# Guidance for Future AI Work

When working on this backend:

- Preserve the supplied Pydantic field names unless intentionally changing the frontend/backend contract.
- Do not assume database persistence exists.
- Do not assume CSV loading exists.
- Do not assume courses are persisted.
- Do not assume task recurrence is generated server-side.
- Do not silently replace the in-memory architecture with a database.
- Do not silently change task update semantics from upsert to strict update.
- Do not silently change course deletion semantics.
- Do not silently remove or reconcile duplicate route definitions when describing the current code.
- Treat the frontend and backend as separate sources of truth when identifying integration bugs.
- If recommending improvements, clearly separate those recommendations from descriptions of the current implementation.
