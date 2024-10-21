const express = require('express');
const router = express.Router();  // Define the router
const fs = require('fs').promises;
const tasksFile = './data/tasks.json';  // Path to the tasks.json file

// Middleware to protect routes (authentication check)
router.use((req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Create a new task
router.post('/tasks', async (req, res) => {
  const { taskName, dueDate } = req.body;
  const { userId } = req.session.user;

  try {
    const tasks = JSON.parse(await fs.readFile(tasksFile, 'utf-8'));
    const newTask = {
      taskId: tasks.length + 1,
      taskName,
      dueDate,
      status: 'pending',
      userId
    };
    tasks.push(newTask);
    await fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2));

    res.status(201).json({ message: 'Task created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve all tasks for the authenticated user
router.get('/tasks', async (req, res) => {
  const { userId } = req.session.user;

  try {
    const tasks = JSON.parse(await fs.readFile(tasksFile, 'utf-8'));
    const userTasks = tasks.filter(t => t.userId === userId);
    res.status(200).json(userTasks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve a specific task by ID
router.get('/tasks/:id', async (req, res) => {
  const { userId } = req.session.user;
  const { id } = req.params;

  try {
    const tasks = JSON.parse(await fs.readFile(tasksFile, 'utf-8'));
    const task = tasks.find(t => t.taskId === parseInt(id) && t.userId === userId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a task by ID
router.put('/tasks/:id', async (req, res) => {
  const { taskName, dueDate, status } = req.body;
  const { userId } = req.session.user;
  const { id } = req.params;

  try {
    const tasks = JSON.parse(await fs.readFile(tasksFile, 'utf-8'));
    const taskIndex = tasks.findIndex(t => t.taskId === parseInt(id) && t.userId === userId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    tasks[taskIndex] = { ...tasks[taskIndex], taskName, dueDate, status };
    await fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2));

    res.status(200).json({ message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a task by ID
router.delete('/tasks/:id', async (req, res) => {
  const { userId } = req.session.user;
  const { id } = req.params;

  try {
    const tasks = JSON.parse(await fs.readFile(tasksFile, 'utf-8'));
    const updatedTasks = tasks.filter(t => t.taskId !== parseInt(id) || t.userId !== userId);

    if (tasks.length === updatedTasks.length) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await fs.writeFile(tasksFile, JSON.stringify(updatedTasks, null, 2));
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
