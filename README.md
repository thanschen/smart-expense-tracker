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

## Validation Feature

- Display validation errors immediately above the corresponding input fields within the Add Expense section.
- Validate inputs on the client side without requiring form submission.
- Show errors when a user leaves a required field empty or enters an invalid value.
- Validate text and amount fields during input or when leaving the field, and category when its selection changes.
- Display an asterisk (*) beside required field labels.
- Automatically clear error messages when the input becomes valid.
- Preserve existing validation when the form is submitted.
- Validate the required fields before saving an expense.
- Keep existing valid expenses unchanged when an operation fails.

## Error Handling Feature

- Handle empty expense names.
- Reject invalid, zero, negative, or non-finite amounts.
- Reject invalid categories and handle missing record IDs.
- Keep existing valid expenses unchanged when an operation fails.

## Data Storage

Expenses are stored **in memory** as JavaScript objects. This description does not imply permanent storage across page reloads.
