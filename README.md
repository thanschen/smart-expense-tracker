# Smart Expense Tracker

A JavaScript and HTML expense tracker for adding, viewing, and deleting expense records while keeping a running total.

## Features

- **In-memory data:** Store expenses as JSON-compatible JavaScript objects with unique, sequential IDs.
- **Expense list:** Display one table row per record, with a checkbox, **VIEW** button, and **DELETE** button.
- **Checkbox selection:** Select or deselect records without changing their expense data.
- **View details:** Display an expense without modifying it; show a clear error for unknown record IDs.
- **Delete expenses:** Confirm or cancel deletion. Remove only the requested record, and leave data unchanged when deletion is canceled.
- **Running total:** Recalculate the total after adding or deleting an expense.
- **Empty state:** Display a message when no expenses are available.
- **Safe text display:** Use `textContent` for user-entered names to prevent HTML injection.
- **Responsive layout:** Ensure sections display appropriately on desktop and mobile screens using CSS.

## Error Handling

- Handle empty expense names.
- Reject invalid, zero, negative, or non-finite amounts.
- Reject invalid categories and handle missing record IDs.
- Keep existing valid expenses unchanged when an operation fails.

## Data Storage

Expenses are stored **in memory** as JavaScript objects. This description does not imply permanent storage across page reloads.
