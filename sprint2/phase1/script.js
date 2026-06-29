var salaryInput   = document.getElementById('salaryInput');
var setSalaryBtn  = document.getElementById('setSalaryBtn');
var salaryError   = document.getElementById('salaryError');

var expenseName   = document.getElementById('expenseName');
var expenseAmount = document.getElementById('expenseAmount');
var addExpenseBtn = document.getElementById('addExpenseBtn');
var expenseError  = document.getElementById('expenseError');

var displaySalary   = document.getElementById('displaySalary');
var displayExpenses = document.getElementById('displayExpenses');
var displayBalance  = document.getElementById('displayBalance');
var expenseList     = document.getElementById('expenseList');

var totalSalary = 0;
var expenses    = [];

// ── Set Salary ────────────────────────────────────────────────────────────────
setSalaryBtn.addEventListener('click', function () {
  salaryError.textContent = '';
  var value = parseFloat(salaryInput.value);

  if (salaryInput.value === '' || isNaN(value) || value <= 0) {
    salaryError.textContent = '⚠ Please enter a valid positive salary.';
    return;
  }

  totalSalary = value;
  salaryInput.value = '';
  renderAll();
});

// ── Add Expense ───────────────────────────────────────────────────────────────
addExpenseBtn.addEventListener('click', function () {
  expenseError.textContent = '';
  var name   = expenseName.value.trim();
  var amount = parseFloat(expenseAmount.value);

  if (name === '') {
    expenseError.textContent = '⚠ Expense name cannot be empty.';
    return;
  }
  if (expenseAmount.value === '' || isNaN(amount) || amount <= 0) {
    expenseError.textContent = '⚠ Please enter a valid positive amount.';
    return;
  }

  expenses.push({ name: name, amount: amount });
  expenseName.value   = '';
  expenseAmount.value = '';
  renderAll();
});

// ── Render ────────────────────────────────────────────────────────────────────
function renderAll() {
  var totalExpenses = getTotalExpenses();
  var remaining     = totalSalary - totalExpenses;

  displaySalary.textContent   = '₹' + totalSalary.toLocaleString();
  displayExpenses.textContent = '₹' + totalExpenses.toLocaleString();
  displayBalance.textContent  = '₹' + remaining.toLocaleString();

  expenseList.innerHTML = '';

  if (expenses.length === 0) {
    expenseList.innerHTML = '<li class="empty-msg">No expenses logged yet.</li>';
    return;
  }

  for (var i = 0; i < expenses.length; i++) {
    var li = document.createElement('li');
    li.innerHTML =
      '<span class="li-name">' + expenses[i].name + '</span>' +
      '<span class="li-amount">₹' + expenses[i].amount.toLocaleString() + '</span>';
    expenseList.appendChild(li);
  }
}

function getTotalExpenses() {
  var total = 0;
  for (var i = 0; i < expenses.length; i++) total += expenses[i].amount;
  return total;
}
