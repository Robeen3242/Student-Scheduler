import { useState } from "react";
import type { Course, ScheduleTask } from "../types/ScheduleTask";
import TaskForm from "./TaskForm";
import TaskBox from "./TaskBox";

type ScheduleProps = {
  onClose: () => void;
  tasks: ScheduleTask[];
  onAdd: (task: ScheduleTask) => void;
  onUpdate: (task: ScheduleTask) => void;
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onRemoveCourse: (courseId: string) => void;
}

function Schedule({ onClose, tasks, onAdd, onUpdate, courses, onAddCourse, onRemoveCourse }: ScheduleProps) {

  const [selectedTask, setSelectedTask] = useState<ScheduleTask | null>(null);
  const [courseName, setCourseName] = useState("");
  const [courseError, setCourseError] = useState("");

  type scheduleView = "main" | "addTask" | "addCourse" | "editTask";
  const [view, setView] = useState<scheduleView>("main");

  function handleAddCourse() {
    if (!courseName.trim()) {
      setCourseError("Course name is required");
      return;
    }

    const newCourse = {
      id: crypto.randomUUID(),
      name: courseName.trim(),
    };

    onAddCourse(newCourse);

    setCourseName("");
    setCourseError("");
    setView("main");
  }

  function addtask(newtask: ScheduleTask) {
    onAdd(newtask);
    setView("main");
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
                      onClick={() => onRemoveCourse(course.id)}
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
                <button className="app-button app-button-primary" onClick={handleAddCourse}>
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
