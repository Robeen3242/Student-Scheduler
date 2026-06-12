import { useEffect, useState } from "react";
import {formatDate} from "../utils/dateUtils";

import type { DailyRating } from "../types/DailyRating";
import type { Course, ScheduleTask } from "../types/ScheduleTask";

import CalendarGrid from "./CalendarGrid";
import RatingBox from "./RatingBox";
import Modal from "./Modal";
import Schedule from "./Schedule";

function getCalendarDays(year: number, month: number) {
  const dates: (Date | null)[] = [];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startingWeekday = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

  for (let i = 0; i < startingWeekday; i++) {
    dates.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    dates.push(new Date(year, month, day));
  }

  return dates;
}

const ratingNumberFields: (keyof Pick<DailyRating, "stress" | "burnout" | "energy" | "mood" | "sleep" | "time_spent">)[] = [
  "stress",
  "burnout",
  "energy",
  "mood",
  "sleep",
  "time_spent",
];

function isDailyRatingComplete(rating: DailyRating) {
  return (
    Boolean(rating.date) &&
    ratingNumberFields.every((field) => Number.isFinite(rating[field])) &&
    typeof rating.break_day === "boolean"
  );
}


function Calendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const days = getCalendarDays(viewDate.getFullYear(), viewDate.getMonth());
  const currentMonthLabel = viewDate.toLocaleString("default", { month: "long", year: "numeric" });

  const[ratingOpen, setRatingOpen] = useState(false);
  const [selectedRatingDate, setSelectedRatingDate] = useState(formatDate(today));
  const [ratings, setRatings] = useState<DailyRating[]>([]);


  const[scheduleOpen, setScheduleOpen] = useState(false);

  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  function goToNextMonth () {
    setViewDate(prev => (new Date(prev.getFullYear(), prev.getMonth() + 1, 1)));
  }
  function goToPreviousMonth () {
    setViewDate(prev => (new Date(prev.getFullYear(), prev.getMonth() - 1, 1)));
  }

  useEffect(() => {
    async function loadRatings() {
      try {
        const response = await fetch("http://127.0.0.1:8000/ratings");
        const data = await response.json();
        setRatings(data.ratings ?? []);
      } catch (error) {
        console.warn("Unable to load ratings", error);
      }
    }

    async function loadCourses() {
      try {
        const response = await fetch("http://127.0.0.1:8000/courses");
        const data = await response.json();
        setCourses(data.courses ?? []);
      } catch (error) {
        console.warn("Unable to load courses", error);
      }
    }
    loadCourses();
    loadRatings();
    
  }, []);

  const completedRatingDates = new Set(
    ratings
      .filter(isDailyRatingComplete)
      .map((rating) => rating.date)
  );

  async function addTask(newTask: ScheduleTask) {
    setTasks(prev => [...prev, newTask]);
    const response = await fetch("http://127.0.0.1:8000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });
    const data = await response.json();
    console.log(data);
  }

  async function updateTask(updatedTask: ScheduleTask) {
    setTasks(prev => prev.map(task => task.taskId === updatedTask.taskId ? updatedTask : task));
    const response = await fetch(`http://127.0.0.1:8000/tasks/${updatedTask.taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    });
    const data = await response.json();
    console.log(data);
  }
  async function addCourse(course: Course) {
    setCourses(prev => [...prev, course]);
  }

  async function removeCourse(courseId: string) {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    tasks
      .filter(task => task.courseId === courseId)
      .forEach(task => updateTask({
        ...task,
        courseId: undefined,
      }));
    await fetch(`http://127.0.0.1:8000/courses/${courseId}`, {
      method: "DELETE",
    });
  }

  return (
    <div className="calendar-page">
      <h2>Calendar</h2>
      <div className="calendar-header">
        <button className="app-button app-button-secondary calendar-nav-button" type="button"
        onClick={goToPreviousMonth}>
          Previous
        </button>
        <h3 className="calendar-month-title">{currentMonthLabel}</h3>
        <button className="app-button app-button-secondary calendar-nav-button" type="button"
        onClick={goToNextMonth}>
          Next
        </button>
      </div>
        <CalendarGrid 
          days = {days}
          onDayClick={(day) => {
            setSelectedRatingDate(formatDate(day));
            setRatingOpen(true);
          }} 
          tasks={tasks}
          completedRatingDates={completedRatingDates}
        />
        
        {/* Cover entire screen no matter where you scroll */}
        {/* bgColor: Black transparency with 50% opacity */}
        {/* Center inside */}
        {/* Onclick: Set state to false to collapse popup */}
        {ratingOpen && (
          <Modal
            isOpen={ratingOpen}
            onClose={() => setRatingOpen(false)}
            title="Rate this day"
          >
            <RatingBox
              date={selectedRatingDate}
              onClose={() => setRatingOpen(false)}
              onSubmit={async (score) => {
                setRatings(prev => [
                  ...prev.filter((rating) => rating.date !== score.date),
                  score,
                ]);
                const response = await fetch("http://127.0.0.1:8000/ratings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(score),
                });

                const data = await response.json();
                console.log(data);
              }}
            />
          </Modal>
        )}
      <section className="calendar-actions">
        <button
        className="app-button app-button-primary"
        onClick={() => setScheduleOpen(true)} 
        >
          Open Schedule
        </button>
        {scheduleOpen && (
          <Modal
            isOpen={scheduleOpen}
            onClose={() => setScheduleOpen(false)}
            title="Schedule"
          >
            <Schedule 
            onClose={() => setScheduleOpen(false)} 
            tasks={tasks} 
            onAdd={addTask}
            onUpdate={updateTask}
            courses={courses}
            onAddCourse={addCourse}
            onRemoveCourse={removeCourse}
            />
          </Modal>
        )}
      </section>
    </div>
  );
}

export default Calendar; //Need this to be referenced
