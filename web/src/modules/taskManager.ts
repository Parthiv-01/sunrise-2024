import Task from "@/model/Task";
import { initialTasks } from "@/utils/TaskList";

let tasks: Task[] = [];

// Initialize tasks to their initial state with task assignment based on completion
export function initializeTasks() {
  tasks = [...initialTasks];
  assignTasks();
}

// Assign tasks based on completion status and group
function assignTasks() {
  // Get the sorted list of unique group IDs
  const allGroups = Array.from(new Set(tasks.map((task) => task.group)));
  allGroups.sort((a, b) => a - b);

  // Reset tasks
  tasks.forEach((task) => (task.assigned = false));

  // Start with the lowest group and assign tasks if the current group is fully completed
  for (const group of allGroups) {
    if (areGroupTasksCompleted(group)) {
      // If tasks in this group are completed, continue to the next group
      continue;
    }

    // Assign the first two tasks of the current group that are not completed
    const tasksInGroup = tasks.filter(
      (task) => task.group === group && !task.completed
    );
    tasksInGroup.slice(0, 2).forEach((task) => (task.assigned = true));

    // Stop assignment if there are any remaining uncompleted tasks in this group
    break;
  }
}

// Helper function to convert Task instances to plain objects
function toPlainObject(task: Task): Record<string, any> {
  const { id, title, description, persona, group, completed } = task;
  return { id, title, description, persona, group, completed };
}

// Get tasks that are not completed and assigned
export function getActiveTasks(): Record<string, any>[] {
  return tasks
    .filter((task) => !task.completed && task.assigned)
    .map(toPlainObject);
}

// Get tasks that are completed
export function getCompletedTasks(): Record<string, any>[] {
  return tasks.filter((task) => task.completed).map(toPlainObject);
}

// Get all tasks from tasks
// Get all tasks
export function getAllTasks(): Record<string, any>[] {
  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    persona: task.persona,
    group: task.group,
    completed: task.completed,
    assigned: task.assigned,
  }));
}

// Check if all tasks from a given group are completed
function areGroupTasksCompleted(group: number): boolean {
  return tasks
    .filter((task) => task.group === group)
    .every((task) => task.completed);
}

// Check if all tasks from all lower groups are completed
function areLowerGroupTasksCompleted(currentGroup: number): boolean {
  const lowerGroupTasks = tasks.filter((task) => task.group < currentGroup);
  return lowerGroupTasks.every((task) => task.completed);
}

// Function to complete a task based on its title
export function completeTask(taskTitle: string): void {
  const task = tasks.find((task) => task.title === taskTitle);
  if (task) {
    if (areLowerGroupTasksCompleted(task.group)) {
      task.completed = true;
      assignTasks(); // Reassign tasks after completing one
    } else {
      console.error(
        `Cannot complete task "${taskTitle}". All tasks in lower groups must be completed first.`
      );
    }
  } else {
    console.error(`Task with title "${taskTitle}" not found.`);
  }
}

// Create a new task and add it to the task list
export function createTask(
  title: string,
  description: string,
  persona: string,
  group: number
): void {
  if (group > 1 && !areLowerGroupTasksCompleted(group)) {
    throw new Error(
      `Cannot add tasks to Group ${group} until all tasks in lower groups are completed.`
    );
  }

  const id = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
  const newTask = new Task(id, title, description, persona, group);
  tasks.push(newTask);
  assignTasks(); // Reassign tasks after adding one
}

// Update a task based on taskId
export function updateTask(
  taskId: number,
  updatedTask: Partial<Omit<Task, "id">>
): void {
  const task = tasks.find((task) => task.id === taskId);
  if (task) {
    Object.assign(task, updatedTask);
    assignTasks(); // Ensure tasks are reassigned after updating
  } else {
    throw new Error(`Task with ID ${taskId} not found.`);
  }
}

// Delete a task from the task list
export function deleteTask(taskId: number): void {
  tasks = tasks.filter((task) => task.id !== taskId);
  assignTasks(); // Reassign tasks after deleting one
}
