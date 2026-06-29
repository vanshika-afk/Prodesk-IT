// ── STEP 1: Grab HTML elements ────────────────────────────────────────────────

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

var expenseList  = document.getElementById('expenseList');
var alertBanner  = document.getElementById('alertBanner');
var downloadBtn  = document.getElementById('downloadBtn');
var rateInfo     = document.getElementById('rateInfo');

// ── STEP 2: Data variables ────────────────────────────────────────────────────

var totalSalary = 0;
var expenses    = [];
var myChart     = null;

// Currency state — we always store values in INR internally
// and convert for display only
var currentCurrency = 'INR';
var conversionRate  = 1;         // 1 INR = 1 INR by default
var currencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

// ── STEP 3: Load saved data from localStorage ─────────────────────────────────

var savedSalary   = localStorage.getItem('cashflow_salary');
var savedExpenses = localStorage.getItem('cashflow_expenses');

if (savedSalary !== null)   totalSalary = parseFloat(savedSalary);
if (savedExpenses !== null) expenses    = JSON.parse(savedExpenses);

renderAll();

// ── STEP 4: Set Salary ────────────────────────────────────────────────────────
// FIX: The entered amount is in the CURRENT display currency,
// so we must convert it BACK to INR before storing it.

setSalaryBtn.addEventListener('click', function () {
  salaryError.textContent = '';

  var value = parseFloat(salaryInput.value);

  if (salaryInput.value === '' || isNaN(value) || value <= 0) {
    salaryError.textContent = '⚠️ Please enter a valid positive salary.';
    return;
  }

  // Convert display-currency value back to INR for internal storage
  totalSalary = value / conversionRate;
  salaryInput.value = '';

  localStorage.setItem('cashflow_salary', totalSalary.toString());
  renderAll();
});

// ── STEP 5: Add Expense ───────────────────────────────────────────────────────
// FIX: Same as salary — user types in display currency, store in INR.

addExpenseBtn.addEventListener('click', function () {
  expenseError.textContent = '';

  var name   = expenseName.value.trim();
  var amount = parseFloat(expenseAmount.value);

  if (name === '') {
    expenseError.textContent = '⚠️ Expense name cannot be empty.';
    return;
  }

  if (expenseAmount.value === '' || isNaN(amount) || amount <= 0) {
    expenseError.textContent = '⚠️ Please enter a valid positive amount.';
    return;
  }

  // Convert display-currency amount back to INR for storage
  expenses.push({ name: name, amount: amount / conversionRate });
  localStorage.setItem('cashflow_expenses', JSON.stringify(expenses));

  expenseName.value   = '';
  expenseAmount.value = '';

  renderAll();
});

// ── STEP 6: Delete expense ────────────────────────────────────────────────────

function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem('cashflow_expenses', JSON.stringify(expenses));
  renderAll();
}

function makeDeleteHandler(index) {
  return function () {
    deleteExpense(index);
  };
}

// ── STEP 7: Currency Toggle ───────────────────────────────────────────────────

var currencyButtons = document.querySelectorAll('.currency-btn');

for (var i = 0; i < currencyButtons.length; i++) {
  currencyButtons[i].addEventListener('click', handleCurrencyClick);
}

function setActiveCurrencyButton(chosenCurrency) {
  for (var i = 0; i < currencyButtons.length; i++) {
    currencyButtons[i].classList.remove('active');
    if (currencyButtons[i].getAttribute('data-currency') === chosenCurrency) {
      currencyButtons[i].classList.add('active');
    }
  }
}

function handleCurrencyClick(event) {
  var chosenCurrency = event.target.getAttribute('data-currency');

  // Prevent re-fetching the same currency
  if (chosenCurrency === currentCurrency) return;

  if (chosenCurrency === 'INR') {
    currentCurrency = 'INR';
    conversionRate  = 1;
    rateInfo.textContent = '';
    setActiveCurrencyButton('INR');
    renderAll();
    return;
  }

  // --- FIX: Disable all buttons while fetching to prevent double-clicks ---
  for (var i = 0; i < currencyButtons.length; i++) {
    currencyButtons[i].disabled = true;
  }
  rateInfo.textContent = 'Fetching live rate…';

  // --- FIX: Updated to frankfurter.dev/v1 with correct query params ---
  // Old (broken): https://api.frankfurter.app/latest?from=INR&to=USD
  // New (correct): https://api.frankfurter.dev/v1/latest?base=INR&symbols=USD
  fetch('https://api.frankfurter.dev/v1/latest?base=INR&symbols=' + chosenCurrency)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      // data.rates looks like: { "USD": 0.012 }
      if (!data.rates || !data.rates[chosenCurrency]) {
        throw new Error('Rate not found in response');
      }

      conversionRate  = data.rates[chosenCurrency];
      currentCurrency = chosenCurrency;
      rateInfo.textContent =
        '1 INR = ' + conversionRate.toFixed(6) + ' ' + chosenCurrency +
        '  •  1 ' + chosenCurrency + ' = ' + (1 / conversionRate).toFixed(2) + ' INR';

      setActiveCurrencyButton(chosenCurrency);
      renderAll();
    })
    .catch(function (err) {
      console.error('Currency fetch error:', err);
      rateInfo.textContent = '⚠️ Could not fetch rate. Check your internet connection.';
      // Restore previous active button on failure
      setActiveCurrencyButton(currentCurrency);
    })
    .finally(function () {
      // Re-enable all buttons regardless of success or failure
      for (var i = 0; i < currencyButtons.length; i++) {
        currencyButtons[i].disabled = false;
      }
    });
}

// ── STEP 8: Render everything ─────────────────────────────────────────────────

function renderAll() {
  renderSummary();
  renderExpenses();
  renderChart();
}

function renderSummary() {
  var totalExpenses = getTotalExpenses();
  var remaining     = totalSalary - totalExpenses;
  var sym           = currencySymbols[currentCurrency];

  displaySalary.textContent   = sym + convert(totalSalary).toFixed(2);
  displayExpenses.textContent = sym + convert(totalExpenses).toFixed(2);
  displayBalance.textContent  = sym + convert(remaining).toFixed(2);

  var tenPercent = totalSalary * 0.10;

  if (totalSalary > 0 && remaining < tenPercent) {
    displayBalance.classList.add('danger');
    alertBanner.classList.remove('hidden');
  } else {
    displayBalance.classList.remove('danger');
    alertBanner.classList.add('hidden');
  }
}

function renderExpenses() {
  expenseList.innerHTML = '';
  var sym = currencySymbols[currentCurrency];

  if (expenses.length === 0) {
    expenseList.innerHTML = '<li class="empty-msg">No expenses added yet.</li>';
    return;
  }

  for (var i = 0; i < expenses.length; i++) {
    var item = expenses[i];
    var li   = document.createElement('li');

    li.innerHTML =
      '<span>' + item.name + '</span>' +
      '<span>' + sym + convert(item.amount).toFixed(2) + '</span>';

    var btn = document.createElement('button');
    btn.textContent = '🗑';
    btn.className   = 'delete-btn';
    btn.addEventListener('click', makeDeleteHandler(i));

    li.appendChild(btn);
    expenseList.appendChild(li);
  }
}

function renderChart() {
  var totalExpenses = getTotalExpenses();
  var remaining     = totalSalary - totalExpenses;
  var ctx           = document.getElementById('myChart').getContext('2d');

  if (myChart !== null) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Remaining Balance', 'Total Expenses'],
      datasets: [{
        data: [remaining > 0 ? remaining : 0, totalExpenses],
        backgroundColor: ['#4f46e5', '#f87171'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

// ── STEP 9: PDF Download using jsPDF ─────────────────────────────────────────

downloadBtn.addEventListener('click', function () {
  var jsPDF = window.jspdf.jsPDF;
  var doc   = new jsPDF();

  var sym           = currencySymbols[currentCurrency];
  var totalExpenses = getTotalExpenses();
  var remaining     = totalSalary - totalExpenses;

  doc.setFontSize(20);
  doc.text('Cash-Flow Report', 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text('Generated: ' + new Date().toLocaleDateString(), 20, 30);
  if (currentCurrency !== 'INR') {
    doc.text('Currency: ' + currentCurrency + '  (1 INR = ' + conversionRate.toFixed(6) + ' ' + currentCurrency + ')', 20, 37);
  }

  doc.setFontSize(13);
  doc.setTextColor(0);
  doc.text('Summary', 20, 48);

  doc.setFontSize(11);
  doc.text('Total Salary:      ' + sym + convert(totalSalary).toFixed(2),   20, 58);
  doc.text('Total Expenses:    ' + sym + convert(totalExpenses).toFixed(2), 20, 66);
  doc.text('Remaining Balance: ' + sym + convert(remaining).toFixed(2),     20, 74);

  doc.setFontSize(13);
  doc.text('Expense List', 20, 88);

  doc.setFontSize(11);
  var startY = 98;

  if (expenses.length === 0) {
    doc.text('No expenses recorded.', 20, startY);
  } else {
    for (var i = 0; i < expenses.length; i++) {
      var item = expenses[i];
      var line = (i + 1) + '.  ' + item.name + '   —   ' + sym + convert(item.amount).toFixed(2);
      doc.text(line, 20, startY + (i * 10));
    }
  }

  doc.save('cashflow-report.pdf');
});

// ── Helper functions ──────────────────────────────────────────────────────────

function getTotalExpenses() {
  var total = 0;
  for (var i = 0; i < expenses.length; i++) {
    total = total + expenses[i].amount;
  }
  return total;
}

function convert(amount) {
  return amount * conversionRate;
}
