import {useEffect, useState} from "react";
import type { Course, ScheduleTask } from "../types/ScheduleTask";
import TaskForm from "./TaskForm";
import TaskBox from "./TaskBox";

type ScheduleProps = {
  onClose: () => void;
  tasks: ScheduleTask[];
  onAdd: (task: ScheduleTask) => void;
  onUpdate: (task: ScheduleTask) => void;
}

function Schedule({ onClose, tasks, onAdd, onUpdate }: ScheduleProps) {

  const [selectedTask, setSelectedTask] = useState<ScheduleTask | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseName, setCourseName] = useState("");
  const [courseError, setCourseError] = useState("");

  type scheduleView = "main" | "addTask" | "addCourse" | "editTask";
  const [view, setView] = useState<scheduleView>("main");

  useEffect(() => {
    async function loadCourses() {
      const response = await fetch("http://127.0.0.1:8000/courses");
      const data = await response.json();
      setCourses(data.courses ?? []);
    }

    loadCourses().catch((error) => {
      console.error("Failed to load courses", error);
    });
  }, []);

  function addtask(newtask: ScheduleTask) {
    onAdd(newtask);
    setView("main");
  }

  async function addCourse() {
    const trimmedCourse = courseName.trim();
    if (!trimmedCourse) {
      setCourseError("Enter a course name.");
      return;
    }

    const alreadyExists = courses.some(course => course.name.toLowerCase() === trimmedCourse.toLowerCase());
    if (alreadyExists) {
      setCourseError("That course already exists.");
      return;
    }

    const newCourse: Course = {
      id: crypto.randomUUID(),
      name: trimmedCourse,
    };

    setCourses(prev => [...prev, newCourse]);
    await fetch("http://127.0.0.1:8000/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCourse),
    });
    setCourseName("");
    setCourseError("");
    setView("main");
  }

  async function removeCourse(courseId: string) {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    tasks
      .filter(task => task.courseId === courseId)
      .forEach(task => onUpdate({
        ...task,
        courseId: undefined,
      }));
    await fetch(`http://127.0.0.1:8000/courses/${courseId}`, {
      method: "DELETE",
    });
  }

  function getCourseName(courseId?: string) {
    return courses.find(course => course.id === courseId)?.name;
  }

  function backToMain() {
    setCourseName("");
    setCourseError("");
    setView("main");
  }

  function updateTask(updatedTask: ScheduleTask) {
    setSelectedTask(null);
    onUpdate(updatedTask);
    setView("main");
  }

  return (
    <div>
      <div 
      style={{
        background: "#263241",
        padding: "20px",
        display: "flex",
        flexDirection: "column", 
        alignItems: "center",
      }}
      onClick={(e) => e.stopPropagation()
      }>

        <div 
        className="modal-actions"
        style={{ 
          display: "flex",
          marginBottom: "20px",
        }}>
          {view === "main" && (
          <div className="schedule-main-panel">
            <div className="schedule-action-row">
              <button 
              className="app-button app-button-primary"
              onClick={() => setView("addTask")
              }>
                Add Task
              </button>
              <button
              className="app-button app-button-course"
              onClick={() => setView("addCourse")}
              >
                Add Course
              </button>
              <button className="app-button app-button-secondary" onClick={onClose}>
                Close
              </button>
            </div>

            <div className="course-list">
              {courses.length === 0 ? (
                <p className="course-list-empty">No courses yet.</p>
              ) : (
                courses.map((course) => (
                  <div className="course-box" key={course.id}>
                    <span>{course.name}</span>
                    <button
                      className="course-box-remove"
                      type="button"
                      onClick={() => removeCourse(course.id)}
                      aria-label={`Remove ${course.name}`}
                    >
                      x
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="task-list">
              {tasks.length === 0 ? (
                <p className="task-list-empty">No tasks yet.</p>
              ) : (
                tasks.map((task) => (
                  <TaskBox 
                  key={task.taskId} 
                  task={task} 
                  courseName={getCourseName(task.courseId)}
                  onClick={() => {
                    setSelectedTask(task);
                    setView("editTask");
                  }}/>
                ))
              )}
            </div>
          </div>)}

          {view === "addTask" && (
          <div className="schedule-form-panel">
            <TaskForm onSubmit={addtask} courses={courses}/>
            <button className="app-button app-button-back" onClick={backToMain}>
              Back
            </button>
          </div>)}

          {view === "addCourse" && (
          <div className="schedule-form-panel">
            <div className="course-form-wrap">
              <label className="task-field">
                <span>Course</span>
                <input
                  value={courseName}
                  onChange={(e) => {
                    setCourseName(e.target.value);
                    setCourseError("");
                  }}
                  placeholder="MATH 101"
                />
              </label>
              {courseError && <p className="course-form-error">{courseError}</p>}
              <div className="task-form-actions">
                <button className="app-button app-button-primary" onClick={addCourse}>
                  Add Course
                </button>
              </div>
            </div>
            <button className="app-button app-button-back" onClick={backToMain}>
              Back
            </button>
          </div>)}

          {view === "editTask" && selectedTask && (
          <div className="schedule-form-panel">
            <TaskForm onSubmit={updateTask} task={selectedTask} courses={courses}/>
            <button className="app-button app-button-back" onClick={backToMain}>
              Back
            </button>
          </div>)}
        </div>
      </div>
    </div>
  );
}

export default Schedule;
