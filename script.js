"use strict";

// Temporary browser-memory storage: records reset after a page refresh.
const expenses = [];
const selectedExpenseIds = new Set();
let nextExpenseId = 1;
let viewedExpenseId = null;

// Use the IDs already defined in index.html.
const expenseForm = document.getElementById("expenseForm");
const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseTableBody = document.getElementById("expenseTableBody");
const totalAmount = document.getElementById("totalAmount");
const expenseDetails = document.getElementById("expenseDetails");
const message = document.getElementById("message");


// FIX: Clear general messages and optionally field errors.
function clearMessages(clearFieldErrors = false) {

    // Clear the general message.
    showMessage("", "");

    // Optionally clear all individual field errors.
    if (clearFieldErrors) {
        for (const input of [
            expenseName,
            expenseAmount,
            expenseCategory
        ]) {
            setFieldError(input, "");
        }
    }
}

// Show a success or error message using existing CSS classes.
function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
}

// 1. Validate the required fields before saving an expense.
function validateExpense(name, amount, category) {
    if (typeof name !== "string" || name.trim() === "") {
        return "Expense name is required.";
    }

    if (String(amount).trim() === "") {
        return "Amount is required.";
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) {
        return "Enter a valid numeric amount.";
    }

    if (numericAmount <= 0) {
        return "Amount must be greater than zero.";
    }

    // FIX 1: Reject amounts smaller than one cent.
    if (numericAmount < 0.01) {
        return "Amount must be at least $0.01.";
    }

    // FIX 2: Allow no more than two decimal places.
    const amountText = String(amount).trim();

    if (!/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(amountText)) {
        return "Amount cannot exceed two decimal places.";
    }

    if (!["Food", "Travel", "Shopping"].includes(category)) {
        return "Please select a valid category.";
    }

    return "";
}

// NEW: Validate one field before the form is submitted.
// Supply valid values for the other two fields to reuse validateExpense().
function validateField(input) {
    let error = "";

    if (input === expenseName) {
        error = validateExpense(expenseName.value, "1", "Food");
    } else if (input === expenseAmount) {
        error = expenseAmount.validity.badInput
            ? "Enter a valid numeric amount."
            : validateExpense("Valid name", expenseAmount.value, "Food");
    } else if (input === expenseCategory) {
        error = validateExpense("Valid name", "1", expenseCategory.value);
    }

    setFieldError(input, error);

    // FIX: Reuse global message-clearing function.
    // Keep individual field validation errors visible.
    clearMessages();
    return error === "";
}

// NEW: Place an error above its field; remove it when the field is valid.
function setFieldError(input, error) {
    const errorElement = document.getElementById(`${input.id}Error`);
    errorElement.textContent = error; // Safely display text, not HTML.
    errorElement.hidden = error === "";
    input.setAttribute("aria-invalid", error ? "true" : "false");
}

// NEW: Validate the name and amount as the user types.
for (const input of [expenseName, expenseAmount]) {
    input.addEventListener("input", function () {
        validateField(input);
    });
}

// NEW: Validate each field when the user leaves it.
for (const input of [expenseName, expenseAmount, expenseCategory]) {
    input.addEventListener("blur", function () {
        validateField(input);
    });
}

// NEW: Validate the category when the selected option changes.
expenseCategory.addEventListener("change", function () {
    validateField(expenseCategory);
});


// 2. Add one validated, JSON-compatible expense object to the array.
function addExpense(name, amount, category) {
    const error = validateExpense(name, amount, category);
    if (error) {
        showMessage(error, "error");
        return false;
    }

    expenses.push({
        id: nextExpenseId++,
        name: name.trim(),
        amount: Number(amount),
        category: category
    });

    displayExpenses();
    showMessage("Expense added successfully.", "success");
    return true;
}

// 3. Render one table row and one set of controls for each expense.
function displayExpenses() {
    expenseTableBody.replaceChildren();

    if (expenses.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 7;
        cell.textContent = "No expenses found.";
        row.appendChild(cell);
        expenseTableBody.appendChild(row);
    } else {
        expenses.forEach(function (expense) {
            const row = document.createElement("tr");

            const selectCell = document.createElement("td");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `expenseCheckbox-${expense.id}`;
            checkbox.dataset.expenseId = String(expense.id);
            checkbox.setAttribute("aria-label", `Select expense ${expense.id}`);
            checkbox.checked = selectedExpenseIds.has(expense.id);
            checkbox.addEventListener("change", function () {
                if (checkbox.checked) {
                    selectedExpenseIds.add(expense.id);
                } else {
                    selectedExpenseIds.delete(expense.id);
                }
            });
            selectCell.appendChild(checkbox);

            const idCell = document.createElement("td");
            idCell.textContent = String(expense.id);

            const nameCell = document.createElement("td");
            nameCell.textContent = expense.name;

            const amountCell = document.createElement("td");
            amountCell.textContent = `$${expense.amount.toFixed(2)}`;

            const categoryCell = document.createElement("td");
            categoryCell.textContent = expense.category;

            const viewCell = document.createElement("td");
            const viewButton = document.createElement("button");
            viewButton.type = "button";
            viewButton.textContent = "VIEW";
            viewButton.addEventListener("click", function () {
                viewExpense(expense.id);
            });
            viewCell.appendChild(viewButton);

            const deleteCell = document.createElement("td");
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "DELETE";
            deleteButton.addEventListener("click", function () {
                deleteExpense(expense.id);
            });
            deleteCell.appendChild(deleteButton);

            row.append(
                selectCell, idCell, nameCell, amountCell,
                categoryCell, viewCell, deleteCell
            );
            expenseTableBody.appendChild(row);
        });
    }

    calculateTotal();
}

// 4. Show the complete record without changing stored data.

// CHANGED: Display expense details in a table with a CLOSE button.
function viewExpense(expenseId) {
    const expense = expenses.find(
        item => item.id === expenseId
    );

    if (!expense) {
        showMessage("Expense not found.", "error");
        return;
    }

    viewedExpenseId = expenseId;

    // Create the expense details table.
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");

    const details = [
        ["ID", expense.id],
        ["Name", expense.name],
        ["Amount", `$${expense.amount.toFixed(2)}`],
        ["Category", expense.category]
    ];

    details.forEach(function ([label, value]) {
        const row = document.createElement("tr");

        const header = document.createElement("th");
        header.scope = "row";
        header.textContent = label;

        const cell = document.createElement("td");
        cell.textContent = String(value);

        row.append(header, cell);
        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // NEW: Create CLOSE button.
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "CLOSE";
    closeButton.id = "closeExpenseDetails";

    // NEW: Clear the detail view when CLOSE is clicked.
    closeButton.addEventListener("click", function () {
        viewedExpenseId = null;

        const instruction = document.createElement("p");
        instruction.textContent =
            "Select VIEW on an expense to see its details.";

        expenseDetails.replaceChildren(instruction);
    });

    // CHANGED: Display the table and CLOSE button.
    expenseDetails.replaceChildren(table, closeButton);
}


// 5. Delete only the clicked record, and only after confirmation.
function deleteExpense(expenseId) {
    const index = expenses.findIndex(item => item.id === expenseId);
    if (index === -1) {
        showMessage("Expense not found.", "error");
        return false;
    }

    // FIX 3: Require the clicked record's checkbox to be selected.
    if (!selectedExpenseIds.has(expenseId)) {
        showMessage(
            "Please select the checkbox before deleting this expense.",
            "error"
        );
        return false;
    }

    const expense = expenses[index];
    if (!window.confirm(`Delete expense "${expense.name}" (ID ${expense.id})?`)) {
        return false; // Cancellation leaves the list and total unchanged.
    }

    expenses.splice(index, 1);
    selectedExpenseIds.delete(expenseId);

    if (viewedExpenseId === expenseId) {
        viewedExpenseId = null;
        const instruction = document.createElement("p");
        instruction.textContent = "Select VIEW on an expense to see its details.";
        expenseDetails.replaceChildren(instruction);
    }

    displayExpenses();
    showMessage("Expense deleted successfully.", "success");
    return true;
}

// 6. Recalculate the total after each add or delete.
function calculateTotal() {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalAmount.textContent = `$${total.toFixed(2)}`;
    return total;
}

// Handle form submissions without reloading the page.
expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // CHANGED: Check all three fields and display their errors before saving.
    const allFieldsValid = [expenseName, expenseAmount, expenseCategory]
        .map(validateField)
        .every(Boolean);

    if (!allFieldsValid) {
        return; // Keep invalid records out of the expenses array.
    }


    const saved = addExpense(
        expenseName.value,
        expenseAmount.value,
        expenseCategory.value
    );

    if (saved) {
        expenseForm.reset();
        // NEW: Clear field errors after a successful add.
        for (const input of [expenseName, expenseAmount, expenseCategory]) {
            setFieldError(input, "");
        }
    }
});


// FIX: Clear previous messages before a table action.
expenseTableBody.addEventListener("click", function () {
    clearMessages();
}, true);

// FIX: Clear previous messages when checkbox selection changes.
expenseTableBody.addEventListener("change", function () {
    clearMessages();
}, true);

// FIX: Clear previous messages when editing the expense form.
expenseForm.addEventListener("input", function () {
    clearMessages();
}, true);

// FIX: Clear previous messages when closing expense details.
expenseDetails.addEventListener("click", function () {
    clearMessages();
}, true);

// Populate the initial empty state and zero total.
displayExpenses();
