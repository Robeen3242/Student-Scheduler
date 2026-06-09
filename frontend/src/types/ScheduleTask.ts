type Recurrence = "once" | "daily" | "weekly" | "biweekly" | "monthly";

type ScheduleOccurrence = {
  id: string;
  taskId: string;
  date_due: string;
  note?: string;
  isCompleted: boolean;
  isCancelled: boolean;
};

type Course = {
  id: string;
  name: string;
};

type ScheduleTask = {
  taskId: string;
  title: string;
  description: string;
  courseId?: string;
  recurrence: Recurrence;
  priority: number;
  exam: boolean;
  occurrences: ScheduleOccurrence[];
};

export type { Course, ScheduleTask, ScheduleOccurrence, Recurrence };
