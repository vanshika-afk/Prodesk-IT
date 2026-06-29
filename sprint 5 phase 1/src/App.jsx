import { useState } from 'react'
import Column from './components/Column.jsx'
import './App.css'

// App.jsx is the main component
// All the state (data) lives here and is passed down to child components

function App() {

  // This holds all our tasks
  // Each task is an object: { id, text, column }
  const [tasks, setTasks] = useState([])

  // This holds whatever the user is typing in the input box
  const [inputText, setInputText] = useState('')

  // Called when the user clicks "Add Task"
  const handleAddTask = () => {
    // Don't add an empty task
    if (inputText.trim() === '') return

    // Create a new task object
    const newTask = {
      id: Date.now(),      // unique number based on time
      text: inputText,
      column: 'todo',      // all new tasks start in "To Do"
    }

    // Add the new task to our tasks array
    setTasks([...tasks, newTask])

    // Clear the input box
    setInputText('')
  }

  // Called when the user presses Enter in the input box
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTask()
  }

  // Called when the user clicks the Delete button on a card
  const handleDeleteTask = (taskId) => {
    // Keep every task except the one that was deleted
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  // Called when the user clicks Move buttons on a card
  const handleMoveTask = (taskId, newColumn) => {
    // Find the task and update its column
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, column: newColumn }
      }
      return task
    }))
  }

  return (
    <div className="app">

      {/* Page Header */}
      <header className="header">
        <h1 className="header-title">My Kanban Board</h1>
        <p className="header-subtitle">Sprint 5 — Phase 1</p>
      </header>

      {/* Add Task Input */}
      <div className="add-task-section">
        <input
          type="text"
          className="task-input"
          placeholder="What needs to be done?"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="add-button" onClick={handleAddTask}>
          + Add Task
        </button>
      </div>

      {/* Board: 3 columns side by side */}
      <div className="board">

        <Column
          title="To Do"
          columnId="todo"
          tasks={tasks.filter(t => t.column === 'todo')}
          onDelete={handleDeleteTask}
          onMove={handleMoveTask}
          // Can only move RIGHT (to In Progress)
          leftColumn={null}
          rightColumn="inprogress"
        />

        <Column
          title="In Progress"
          columnId="inprogress"
          tasks={tasks.filter(t => t.column === 'inprogress')}
          onDelete={handleDeleteTask}
          onMove={handleMoveTask}
          // Can move LEFT (to To Do) or RIGHT (to Done)
          leftColumn="todo"
          rightColumn="done"
        />

        <Column
          title="Done"
          columnId="done"
          tasks={tasks.filter(t => t.column === 'done')}
          onDelete={handleDeleteTask}
          onMove={handleMoveTask}
          // Can only move LEFT (to In Progress)
          leftColumn="inprogress"
          rightColumn={null}
        />

      </div>

    </div>
  )
}

export default App
