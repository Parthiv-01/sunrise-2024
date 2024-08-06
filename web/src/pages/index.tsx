import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  CssBaseline,
  ThemeProvider,
  createTheme,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  getActiveTasks,
  getCompletedTasks,
  completeTask,
  getAllTasks,
  initializeTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from "@/modules/taskManager";

// Define light and dark themes
const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

// Define the task type based on the structure returned by the task manager functions
interface Task {
  id: number;
  title: string;
  description: string;
  persona: string;
  group: number;
  completed: boolean;
  assigned: boolean;
}

export default function Home() {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCounts, setTaskCounts] = useState({
    todo: 0,
    inProgress: 0,
    completed: 0,
  });

  // State for creating and updating tasks
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    persona: "",
    group: 0,
  });

  // Theme toggle handler
  const handleThemeToggle = () => {
    setThemeMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Fetch and update task counts
  const updateTaskCounts = async () => {
    const allTasks = await getAllTasks();
    const activeTasks = await getActiveTasks();
    const completedTasks = await getCompletedTasks();

    const todoCount = allTasks.filter(
      (task) => !task.completed && !task.assigned
    ).length;
    const inProgressCount = activeTasks.length;
    const completedCount = completedTasks.length;

    setTaskCounts({
      todo: todoCount,
      inProgress: inProgressCount,
      completed: completedCount,
    });
  };

  const fetchTasks = async () => {
    const allTasks = (await getAllTasks()) as Task[];
    setTasks(allTasks);
  };

  useEffect(() => {
    initializeTasks();
    updateTaskCounts(); // Update counts initially
    fetchTasks(); // Fetch initial tasks
  }, []);

  useEffect(() => {
    fetchTasks();
    updateTaskCounts(); // Update counts whenever the active section changes
  }, []);

  const handleCompleteTask = async (taskTitle: string) => {
    await completeTask(taskTitle);
    fetchTasks();
    updateTaskCounts(); // Update counts after completing a task
  };

  const handleOpen = (task?: Task) => {
    if (task) {
      setEditTask(task);
      setNewTask({
        title: task.title,
        description: task.description,
        persona: task.persona,
        group: task.group,
      });
    } else {
      setEditTask(null);
      setNewTask({
        title: "",
        description: "",
        persona: "",
        group: 0,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreateTask = async () => {
    try {
      await apiCreateTask(
        newTask.title,
        newTask.description,
        newTask.persona,
        newTask.group
      );
      fetchTasks();
      updateTaskCounts();
      handleClose();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleUpdateTask = async () => {
    if (editTask) {
      try {
        await apiUpdateTask(editTask.id, newTask);
        fetchTasks();
        updateTaskCounts();
        handleClose();
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    await apiDeleteTask(taskId);
    fetchTasks();
    updateTaskCounts();
  };

  const groupTasksByGroupId = (taskList: Task[]) => {
    return taskList.reduce((groups: { [key: string]: Task[] }, task: Task) => {
      const groupId = task.group || "default";
      if (!groups[groupId]) {
        groups[groupId] = [];
      }
      groups[groupId].push(task);
      return groups;
    }, {});
  };

  const renderTasks = (taskList: Task[]) => {
    const groupedTasks = groupTasksByGroupId(taskList);

    return Object.keys(groupedTasks).map((groupId) => (
      <Grid container spacing={3} key={groupId} style={{ marginTop: "1rem" }}>
        {groupedTasks[groupId].map((task) => (
          <Grid item xs={12} style={{ marginBottom: "1rem" }} key={task.id}>
            <Card
              style={{ width: "100%", maxWidth: "300px", margin: "0 auto" }}
            >
              <CardContent>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    {!task.completed && (
                      <IconButton
                        color="primary"
                        onClick={() => handleCompleteTask(task.title)}
                        style={{ marginRight: "1rem" }}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    )}
                    <IconButton
                      color="secondary"
                      onClick={() => handleOpen(task)}
                      style={{ marginRight: "1rem" }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                  <Typography variant="h6">{task.title}</Typography>
                  <Typography variant="body1">{task.description}</Typography>
                  <Typography variant="body2">
                    Persona: {task.persona}
                  </Typography>
                  <Typography variant="body2">Group: {task.group}</Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    ));
  };

  const todoTasks = tasks.filter((task) => !task.completed && !task.assigned);
  const inProgressTasks = tasks.filter(
    (task) => task.assigned && !task.completed
  );
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Task Manager</Typography>
          <div style={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={handleThemeToggle}>
            {themeMode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => handleOpen()}
            style={{ marginLeft: "1rem" }}
          >
            <AddIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container
        style={{ marginTop: "1rem", marginBottom: "1rem", padding: 0 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "30% 30% 30%",
            gap: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: themeMode === "light" ? "#f5f5f5" : "#333",
              padding: "1rem",
              height: "100%",
            }}
          >
            <Typography variant="h6">To Do ({taskCounts.todo})</Typography>
            {renderTasks(todoTasks)}
          </div>
          <div
            style={{
              backgroundColor: themeMode === "light" ? "#f5f5f5" : "#333",
              padding: "1rem",
              height: "100%",
            }}
          >
            <Typography variant="h6">
              In Progress ({taskCounts.inProgress})
            </Typography>
            {renderTasks(inProgressTasks)}
          </div>
          <div
            style={{
              backgroundColor: themeMode === "light" ? "#f5f5f5" : "#333",
              padding: "1rem",
              height: "100%",
            }}
          >
            <Typography variant="h6">
              Completed ({taskCounts.completed})
            </Typography>
            {renderTasks(completedTasks)}
          </div>
        </div>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>
            {editTask ? "Update Task" : "Create New Task"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              variant="outlined"
              value={newTask.title || (editTask ? editTask.title : "")}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={
                newTask.description || (editTask ? editTask.description : "")
              }
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Persona"
              fullWidth
              variant="outlined"
              value={newTask.persona || (editTask ? editTask.persona : "")}
              onChange={(e) =>
                setNewTask({ ...newTask, persona: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Group"
              type="number"
              fullWidth
              variant="outlined"
              value={newTask.group || (editTask ? editTask.group : "")}
              onChange={(e) =>
                setNewTask({ ...newTask, group: parseInt(e.target.value, 10) })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button
              onClick={editTask ? handleUpdateTask : handleCreateTask}
              color="primary"
            >
              {editTask ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}
