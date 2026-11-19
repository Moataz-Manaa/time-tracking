import React from 'react';

export default function TaskFields({ task, disabled = false }) {
  return <>
    <label>
      Status
      <select name="status" defaultValue={task?.status || 'todo'} disabled={disabled}>
        <option value="todo">To do</option>
        <option value="in-progress">In progress</option>
        <option value="done">Done</option>
      </select>
    </label>
    <label>
      Priority
      <select name="priority" defaultValue={task?.priority || 'medium'} disabled={disabled}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </label>
    <label>
      Deadline (optional)
      <input type="date" name="dueDate" defaultValue={task?.dueDate?.slice(0, 10) || ''} disabled={disabled}/>
    </label>
  </>;
}
