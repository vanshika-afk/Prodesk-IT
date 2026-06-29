import TaskCard from './TaskCard.jsx'
import './Column.css'

// Column.jsx — renders one column (To Do / In Progress / Done)
// Props it receives from App.jsx:
//   title      — the column heading text
//   columnId   — 'todo' | 'inprogress' | 'done'
//   tasks      — array of tasks that belong to this column
//   onDelete   — function to delete a task
//   onMove     — function to move a task to another column
//   leftColumn — the column to the left (or null if none)
//   rightColumn — the column to the right (or null if none)

function Column({ title, columnId, tasks, onDelete, onMove, leftColumn, rightColumn }) {
  return (
    <div className="column">

      {/* Column Header */}
      <div className="column-header">
        <h2 className="column-title">{title}</h2>
        <span className="task-count">{tasks.length}</span>
      </div>

      {/* Task Cards */}
      <div className="task-list">

        {/* Show a message when the column is empty */}
        {tasks.length === 0 && (
          <p className="empty-text">No tasks here</p>
        )}

        {/* Render a card for each task */}
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            onMove={onMove}
            leftColumn={leftColumn}
            rightColumn={rightColumn}
          />
        ))}

      </div>
    </div>
  )
}

export default Column
