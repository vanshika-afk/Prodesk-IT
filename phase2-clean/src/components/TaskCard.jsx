import { useState } from 'react'
import './TaskCard.css'

// TaskCard.jsx — renders a single task card
//
// PHASE 2 additions on top of Phase 1:
//   1. Priority border  — red / yellow / green left border based on priority
//   2. Priority badge   — small label showing the priority
//   3. Inline editing   — click "Edit" to turn text into an input field

function TaskCard({ task, onDelete, onMove, onEdit, leftColumn, rightColumn }) {

  // NEW — tracks if this card is currently being edited
  const [isEditing, setIsEditing] = useState(false)

  // NEW — holds the text while the user is typing in edit mode
  const [editText, setEditText] = useState(task.text)

  // Called when the user clicks Save after editing
  const handleSave = () => {
    if (editText.trim() === '') return   // don't save empty text
    onEdit(task.id, editText)            // update in App state
    setIsEditing(false)                  // exit edit mode
  }

  // Save on Enter, cancel on Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Enter')  handleSave()
    if (e.key === 'Escape') setIsEditing(false)
  }

  return (
    // NEW — priority-high / priority-medium / priority-low class sets the border color
    <div className={`task-card priority-${task.priority}`}>

      {/* NEW — Priority badge */}
      <span className={`priority-badge badge-${task.priority}`}>
        {task.priority === 'high'   && '🔴 High'}
        {task.priority === 'medium' && '🟡 Medium'}
        {task.priority === 'low'    && '🟢 Low'}
      </span>

      {/* NEW — Show input field in edit mode, plain text otherwise */}
      {isEditing ? (
        <div className="edit-area">
          <input
            type="text"
            className="edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="card-buttons">
            <button className="btn btn-save"   onClick={handleSave}>Save</button>
            <button className="btn btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {/* Task text — same as Phase 1 */}
          <p className="task-text">{task.text}</p>

          {/* Buttons — same as Phase 1, plus new Edit button */}
          <div className="card-buttons">

            {leftColumn && (
              <button className="btn btn-move" onClick={() => onMove(task.id, leftColumn)}>
                ← Back
              </button>
            )}

            {rightColumn && (
              <button className="btn btn-move" onClick={() => onMove(task.id, rightColumn)}>
                Next →
              </button>
            )}

            {/* NEW — Edit button */}
            <button className="btn btn-edit" onClick={() => setIsEditing(true)}>
              ✏️ Edit
            </button>

            <button className="btn btn-delete" onClick={() => onDelete(task.id)}>
              Delete
            </button>

          </div>
        </>
      )}

    </div>
  )
}

export default TaskCard
