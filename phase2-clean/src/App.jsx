import { useState, useEffect } from 'react'
import Column from './components/Column.jsx'
import './App.css'

// App.jsx — main component, all state lives here
//
// PHASE 2 additions on top of Phase 1:
//   1. Priority system  — each task has a priority (high / medium / low)
//   2. localStorage     — tasks are saved so they survive page refresh
//   3. Inline editing   — handled inside TaskCard, we just update state here

function App() {

  // Load tasks from localStorage on first render
  // If nothing is saved yet, start with an empty array
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('kanban-tasks')
    return saved ? JSON.parse(saved) : []
  })

  const [inputText, setInputText]   = useState('')

  // NEW — priority dropdown value, default is 'medium'
  const [priority, setPriority]     = useState('medium')

  // NEW — save to localStorage every time tasks change
  useEffect(() => {
    localStorage.setItem('kanban-tasks', JSON.stringify(tasks))
  }, [tasks])

  // Add a new task to the "To Do" column
  const handleAddTask = () => {
    if (inputText.trim() === '') return

    const newTask = {
      id:       Date.now(),
      text:     inputText,
      column:   'todo',
      priority: priority,   // NEW — store the chosen priority
    }

    setTasks([...tasks, newTask])
    setInputText('')
    setPriority('medium')   // reset dropdown to medium after adding
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTask()
  }

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const handleMoveTask = (taskId, newColumn) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, column: newColumn } : task
    ))
  }

  // NEW — update a task's text after inline editing
  const handleEditTask = (taskId, newText) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, text: newText } : task
    ))
  }

  return (
    <div className="app">

      <header className="header">
        <h1 className="header-title">My Kanban Board</h1>
        <p className="header-subtitle">Sprint 5 — Phase 2</p>
      </header>

      {/* Add Task Row — now includes a priority dropdown */}
      <div className="add-task-section">
        <input
          type="text"
          className="task-input"
          placeholder="What needs to be done?"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* NEW — Priority dropdown */}
        <select
          className="priority-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>

        <button className="add-button" onClick={handleAddTask}>
          + Add Task
        </button>
      </div>

      {/* Board */}
      <div className="board">

        <Column
          title="To Do"
          columnId="todo"
          tasks={tasks.filter(t => t.column === 'todo')}
          onDelete={handleDeleteTask}
          onMove={handleMoveTask}
          onEdit={handleEditTask}
          leftColumn={null}
          rightColumn="inprogress"
        />

        <Column
          title="In Progress"
          columnId="inprogress"
          tasks={tasks.filter(t => t.column === 'inprogress')}
          onDelete={handleDeleteTask}
          onMove={handleMoveTask}
          onEdit={handleEditTask}
          leftColumn="todo"
          rightColumn="done"
        />

        <Column
          title="Done"
          columnId="done"
          tasks={tasks.filter(t => t.column === 'done')}
          onDelete={handleDeleteTask}
          onMove={handleMoveTask}
          onEdit={handleEditTask}
          leftColumn="inprogress"
          rightColumn={null}
        />

      </div>
    </div>
  )
}

export default App
