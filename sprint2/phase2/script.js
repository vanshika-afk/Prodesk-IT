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
var myChart     = null;

// ── Load from localStorage ────────────────────────────────────────────────────
var savedSalary   = localStorage.getItem('cashflow_salary');
var savedExpenses = localStorage.getItem('cashflow_expenses');
if (savedSalary   !== null) totalSalary = parseFloat(savedSalary);
if (savedExpenses !== null) expenses    = JSON.parse(savedExpenses);
renderAll();

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
  localStorage.setItem('cashflow_salary', totalSalary.toString());
  renderAll();
});

// ── Add Expense ───────────────────────────────────────────────────────────────
addExpenseBtn.addEventListener('click', function () {
  expenseError.textContent = '';
  var name   = expenseName.value.trim();
  var amount = parseFloat(expenseAmount.value);
  if (name === '') { expenseError.textContent = '⚠ Expense name cannot be empty.'; return; }
  if (expenseAmount.value === '' || isNaN(amount) || amount <= 0) {
    expenseError.textContent = '⚠ Please enter a valid positive amount.';
    return;
  }
  expenses.push({ name: name, amount: amount });
  localStorage.setItem('cashflow_expenses', JSON.stringify(expenses));
  expenseName.value = ''; expenseAmount.value = '';
  renderAll();
});

// ── Delete ────────────────────────────────────────────────────────────────────
function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem('cashflow_expenses', JSON.stringify(expenses));
  renderAll();
}
function makeDeleteHandler(index) {
  return function () { deleteExpense(index); };
}

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
  } else {
    for (var i = 0; i < expenses.length; i++) {
      var li  = document.createElement('li');
      var btn = document.createElement('button');
      btn.textContent = '✕';
      btn.className   = 'delete-btn';
      btn.addEventListener('click', makeDeleteHandler(i));
      li.innerHTML =
        '<span class="li-name">' + expenses[i].name + '</span>' +
        '<span class="li-amount">₹' + expenses[i].amount.toLocaleString() + '</span>';
      li.appendChild(btn);
      expenseList.appendChild(li);
    }
  }
  renderChart(totalExpenses, remaining);
}

function renderChart(totalExpenses, remaining) {
  var ctx = document.getElementById('myChart').getContext('2d');
  if (myChart !== null) myChart.destroy();
  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Remaining', 'Expenses'],
      datasets: [{
        data: [remaining > 0 ? remaining : 0, totalExpenses],
        backgroundColor: ['#0A5FFF', '#E2E5EA'],
        borderColor: ['#fff', '#fff'],
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 12 }, color: '#4B5563', padding: 16 } }
      }
    }
  });
}

function getTotalExpenses() {
  var total = 0;
  for (var i = 0; i < expenses.length; i++) total += expenses[i].amount;
  return total;
}
