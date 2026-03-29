import { Task } from "@workspace/api-client-react/src/generated/api.schemas";

const NOTIFIED_TASKS_KEY = 'taskflow_notified_tasks';

export function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return;
  }
  if (Notification.permission !== "denied" && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

export function checkAndNotifyDeadlines(tasks: Task[]) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const notifiedTasks: string[] = JSON.parse(localStorage.getItem(NOTIFIED_TASKS_KEY) || '[]');
  const now = new Date().getTime();
  let updated = false;

  tasks.forEach(task => {
    if (task.status === 'done' || !task.deadline) return;

    const deadlineTime = new Date(task.deadline).getTime();
    const timeDiff = deadlineTime - now;
    const minsLeft = timeDiff / (1000 * 60);

    // If deadline is within 15 minutes and we haven't notified yet
    if (minsLeft > 0 && minsLeft <= 15 && !notifiedTasks.includes(task.id.toString())) {
      new Notification("Task Deadline Approaching!", {
        body: `"${task.title}" is due in ${Math.round(minsLeft)} minutes.`,
        icon: "/favicon.svg",
      });
      notifiedTasks.push(task.id.toString());
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem(NOTIFIED_TASKS_KEY, JSON.stringify(notifiedTasks));
  }
}
