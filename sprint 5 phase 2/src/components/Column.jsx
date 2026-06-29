import TaskCard from './TaskCard.jsx'
import './Column.css'

// Column.jsx — renders one column (To Do / In Progress / Done)
// PHASE 2: now also passes onEdit down to TaskCard

function Column({ title, columnId, tasks, onDelete, onMove, onEdit, leftColumn, rightColumn }) {
  return (
    <div className="column">

      <div className="column-header">
        <h2 className="column-title">{title}</h2>
        <span className="task-count">{tasks.length}</span>
      </div>

      <div className="task-list">

        {tasks.length === 0 && (
          <p className="empty-text">No tasks here</p>
        )}

        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            onMove={onMove}
            onEdit={onEdit}
            leftColumn={leftColumn}
            rightColumn={rightColumn}
          />
        ))}

      </div>
    </div>
  )
}

export default Column
