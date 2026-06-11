from datetime import timedelta, date


def getWeightedMovingAverage(feature, current_date, days, daily_ratings):
    #includes the current date and goes back the specified number of days
    total = 0
    count = 0
    weighted_sum = 0
    for i in range(days):
        date_to_check = current_date - timedelta(days=i)
        if date_to_check in daily_ratings:
            count += 1
            total += (days-i) * daily_ratings[date_to_check][feature]
            weighted_sum += (days-i)
    return total / weighted_sum if weighted_sum > 0 else None

def countUpcomingTasks(current_date, days, tasks, exam=False):
    #calculates tasks within n days
    count = 0
    for task in tasks:
        if exam and not task.exam:
                continue
        for occurrence in task.occurrences:
            if occurrence.isCompleted:
                continue
            if occurrence.isCancelled:
                continue
            due_date = date.fromisoformat(occurrence.date_due)
            if current_date <= due_date <= current_date + timedelta(days=days):
                if not exam and task.exam:
                    continue
                count += 1
    return count

def daysUntilNextExam(current_date, tasks):
    #exam day should be included in the count
    min_days = None
    for task in tasks:
        if not task.exam:
            continue
        for occurrence in task.occurrences:
            due_date = date.fromisoformat(occurrence.date_due)
            days_until = (due_date - current_date).days
            if days_until >= 0 and (min_days is None or days_until < min_days):
                min_days = days_until
    return min_days

def getPrioritySum(current_date, days, tasks):
    total = 0
    for task in tasks:
        for occurrence in task.occurrences:
            if occurrence.isCompleted:
                continue
            if occurrence.isCancelled:
                continue
            due_date = date.fromisoformat(occurrence.date_due)
            if current_date <= due_date <= current_date + timedelta(days=days):
                total += task.priority
    return total

def getAveragePriority(current_date, days, tasks):
    total = 0
    count = 0
    for task in tasks:
        for occurrence in task.occurrences:
            if occurrence.isCompleted:
                continue
            if occurrence.isCancelled:
                continue
            due_date = date.fromisoformat(occurrence.date_due)
            if current_date <= due_date <= current_date + timedelta(days=days):
                total += task.priority
                count += 1
    return total / count if count > 0 else None

def getAveragePriorityPerTask(current_date, days, tasks):
    return getAveragePriority(current_date, days, tasks)

def getAvgPriority(current_date, days, tasks):
    return getAveragePriority(current_date, days, tasks)

def getMaxPriority(current_date, days, tasks):
    max_priority = None
    for task in tasks:
        for occurrence in task.occurrences:
            if occurrence.isCompleted:
                continue
            if occurrence.isCancelled:
                continue
            due_date = date.fromisoformat(occurrence.date_due)
            if current_date <= due_date <= current_date + timedelta(days=days):
                if max_priority is None or task.priority > max_priority:
                    max_priority = task.priority
    return max_priority

def getCourseCount(tasks):
    courses = set()
    for task in tasks:
        if task.courseId:
            courses.add(task.courseId)
    return len(courses)

def getCourseCountInWindow(current_date, days, tasks):
    courses = set()
    for task in tasks:
        if not task.courseId:
            continue
        for occurrence in task.occurrences:
            if occurrence.isCompleted:
                continue
            if occurrence.isCancelled:
                continue
            due_date = date.fromisoformat(occurrence.date_due)
            if current_date <= due_date <= current_date + timedelta(days=days):
                courses.add(task.courseId)
                break
    return len(courses)

def getCoursePriorityLoad(current_date, days, tasks):
    avg_priority = getAveragePriority(current_date, days, tasks)
    if avg_priority is None:
        return None
    return getCourseCountInWindow(current_date, days, tasks) * avg_priority
