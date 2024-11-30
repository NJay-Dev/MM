// @ts-nocheck

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'index.html' || currentPage === '') {
        setupLoginPage();
    } else if (currentPage === 'employee_dashboard.html') {
        setupEmployeeDashboard();
    } else if (currentPage === 'admin_dashboard.html') {
        setupAdminDashboard();
    }

    // Setup logout functionality
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
});

function setupLoginPage() {
    const loginForm = document.getElementById('employee-login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data));
            if (data.role === 'admin') {
                window.location.href = 'admin_dashboard.html';
            } else {
                window.location.href = 'employee_dashboard.html';
            }
        } else {
            alert('Login failed. Please try again.');
        }
    });
}

function setupEmployeeDashboard() {
    const transactionForm = document.getElementById('transaction-form');
    const timesheetForm = document.getElementById('timesheet-form');

    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const clientName = document.getElementById('client-name').value;
        const amount = document.getElementById('amount').value;
        const description = document.getElementById('description').value;

        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clientName, amount, description }),
        });

        const data = await response.json();

        if (data.success) {
            alert('Transaction logged successfully');
            transactionForm.reset();
        } else {
            alert('Failed to log transaction. Please try again.');
        }
    });

    timesheetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('date').value;
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;

        const response = await fetch('/api/timesheets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date, startTime, endTime }),
        });

        const data = await response.json();

        if (data.success) {
            alert('Time logged successfully');
            timesheetForm.reset();
        } else {
            alert('Failed to log time. Please try again.');
        }
    });
}

function setupAdminDashboard() {
    fetchTransactions();
    fetchTimesheets();
}

async function fetchTransactions() {
    const response = await fetch('/api/transactions');
    const transactions = await response.json();
    const tableBody = document.querySelector('#transactions-table tbody');
    tableBody.innerHTML = '';
    transactions.forEach(transaction => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = transaction.employee;
        row.insertCell().textContent = transaction.clientName;
        row.insertCell().textContent = `$${transaction.amount}`;
        row.insertCell().textContent = transaction.description;
        row.insertCell().textContent = new Date(transaction.date).toLocaleString();
    });
}

async function fetchTimesheets() {
    const response = await fetch('/api/timesheets');
    const timesheets = await response.json();
    const tableBody = document.querySelector('#timesheets-table tbody');
    tableBody.innerHTML = '';
    timesheets.forEach(timesheet => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = timesheet.employee;
        row.insertCell().textContent = timesheet.date;
        row.insertCell().textContent = timesheet.startTime;
        row.insertCell().textContent = timesheet.endTime;
        row.insertCell().textContent = timesheet.totalHours;
    });
}