import './TaskCard.css'

// TaskCard.jsx — renders a single task card
// Props it receives from Column.jsx:
//   task        — the task object { id, text, column }
//   onDelete    — function to call when Delete is clicked
//   onMove      — function to call when a Move button is clicked
//   leftColumn  — where to move if the user clicks "← Back"
//   rightColumn — where to move if the user clicks "Next →"

function TaskCard({ task, onDelete, onMove, leftColumn, rightColumn }) {
  return (
    <div className="task-card">

      {/* Task Text */}
      <p className="task-text">{task.text}</p>

      {/* Action Buttons */}
      <div className="card-buttons">

        {/* Move Left — only show if there is a column to the left */}
        {leftColumn && (
          <button
            className="btn btn-move"
            onClick={() => onMove(task.id, leftColumn)}
          >
            ← Back
          </button>
        )}

        {/* Move Right — only show if there is a column to the right */}
        {rightColumn && (
          <button
            className="btn btn-move"
            onClick={() => onMove(task.id, rightColumn)}
          >
            Next →
          </button>
        )}

        {/* Delete — always show */}
        <button
          className="btn btn-delete"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>

      </div>
    </div>
  )
}

export default TaskCard
