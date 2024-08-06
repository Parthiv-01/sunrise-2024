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
  Tabs,
  Tab,
  CssBaseline,
  ThemeProvider,
  createTheme,
  IconButton,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import {
  getActiveTasks,
  getCompletedTasks,
  completeTask,
  getAllTasks,
  initializeTasks,
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
  const [activeSection, setActiveSection] = useState<
    "todo" | "inProgress" | "completed"
  >("todo");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCounts, setTaskCounts] = useState({
    todo: 0,
    inProgress: 0,
    completed: 0,
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
    let taskList: Task[] = [];

    switch (activeSection) {
      case "todo":
        taskList = (await getAllTasks()) as Task[];
        taskList = taskList.filter((task) => !task.completed && !task.assigned);
        break;
      case "inProgress":
        taskList = (await getActiveTasks()) as Task[];
        break;
      case "completed":
        taskList = (await getCompletedTasks()) as Task[];
        break;
    }

    setTasks(taskList);
  };

  useEffect(() => {
    initializeTasks();
    updateTaskCounts(); // Update counts initially
    fetchTasks(); // Fetch initial tasks
  }, []);

  useEffect(() => {
    fetchTasks();
    updateTaskCounts(); // Update counts whenever the active section changes
  }, [activeSection]);

  const handleCompleteTask = (taskTitle: string) => {
    completeTask(taskTitle);
    fetchTasks();
    updateTaskCounts(); // Update counts after completing a task
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveSection(
      newValue === 0 ? "todo" : newValue === 1 ? "inProgress" : "completed"
    );
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
        {groupedTasks[groupId].reduce((rows: JSX.Element[], task, index) => {
          if (index % 2 === 0) {
            rows.push(
              <Grid
                container
                spacing={2}
                key={index}
                style={{ marginBottom: "1rem" }}
              >
                {groupedTasks[groupId].slice(index, index + 2).map((task) => (
                  <Grid item xs={12} sm={6} md={6} key={task.id}>
                    <Card style={{ maxWidth: "400px", margin: "0 auto" }}>
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
                            <Typography
                              variant="h6"
                              style={{ marginRight: "1rem" }}
                            >
                              Task: {task.id}
                            </Typography>
                            {activeSection === "inProgress" && (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleCompleteTask(task.title)}
                                style={{ marginLeft: "1rem" }}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                          <Typography variant="h6">{task.title}</Typography>
                          <Typography variant="body1">
                            {task.description}
                          </Typography>
                          <Typography variant="body2">
                            Persona: {task.persona}
                          </Typography>
                          <Typography variant="body2">
                            Group: {task.group}
                          </Typography>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            );
          }
          return rows;
        }, [])}
      </Grid>
    ));
  };

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
        </Toolbar>
      </AppBar>
      <Container>
        <Tabs
          value={
            activeSection === "todo"
              ? 0
              : activeSection === "inProgress"
              ? 1
              : 2
          }
          onChange={handleTabChange}
          aria-label="task tabs"
        >
          <Tab label={`To Do (${taskCounts.todo})`} />
          <Tab label={`In Progress (${taskCounts.inProgress})`} />
          <Tab label={`Completed (${taskCounts.completed})`} />
        </Tabs>
        {renderTasks(tasks)}
      </Container>
    </ThemeProvider>
  );
}
