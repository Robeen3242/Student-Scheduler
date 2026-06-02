type Recurrence = "once" | "daily" | "weekly" | "biweekly" | "monthly";

type ScheduleOccurrence = {
  id: string;
  taskId: string;
  date_due: string;
  note?: string;
  isCompleted: boolean;
  isCancelled: boolean;
};

type ScheduleTask = {
  id: string; //taskId
  title: string;
  description: string;
  recurrence: Recurrence;
  priority: number;
  occurrences: ScheduleOccurrence[];
};

export type { ScheduleTask, ScheduleOccurrence, Recurrence };