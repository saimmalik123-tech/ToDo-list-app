const email = document.querySelector('#email');
const password = document.querySelector('#password');
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const taskList = document.getElementById("taskList");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskModal = document.getElementById("taskInputContainer");
const newTaskInput = document.getElementById("newTaskInput");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const userName = document.querySelector('#name');

let accounts = JSON.parse(localStorage.getItem("accounts")) || accountsData;
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

function saveUserData() {
    if (currentUser) {
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        let idx = accounts.findIndex(a => a.email === currentUser.email);
        if (idx !== -1) {
            accounts[idx] = currentUser;
        } else {
            accounts.push(currentUser);
        }
        localStorage.setItem("accounts", JSON.stringify(accounts));
    }
}

function showPage(page) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(page + "Page").classList.add("active");
    window.location.hash = page;
}

function renderTasks() {
    if (!currentUser) return;
    let total = currentUser.tasks.length;
    let completed = currentUser.tasks.filter(t => t.status === "completed").length;
    let pending = currentUser.tasks.filter(t => t.status === "pending").length;
    let failed = currentUser.tasks.filter(t => t.status === "failed").length;
    document.getElementById("totalTasks").innerText = total;
    document.getElementById("completedTasks").innerText = completed;
    document.getElementById("pendingTasks").innerText = pending;
    document.getElementById("failedTasks").innerText = failed;

    userName.textContent = currentUser.name;

    taskList.innerHTML = "";
    currentUser.tasks.forEach((task) => {
        let div = document.createElement("div");
        div.classList.add("task");
        let toggleText = task.status === "pending" ? "Mark Completed" : task.status === "completed" ? "Mark Failed" : "Mark Pending";
        div.innerHTML = `
            <span>${task.title}</span> 
            <span>(${task.status})</span>
            <button onclick="toggleStatus(${task.id})">${toggleText}</button>
            <button onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(div);
    });
}

function toggleStatus(taskId) {
    let task = currentUser.tasks.find(t => t.id === taskId);
    if (task) {
        if (task.status === "pending") task.status = "completed";
        else if (task.status === "completed") task.status = "failed";
        else task.status = "pending";
    }
    saveUserData();
    renderTasks();
}

function deleteTask(taskId) {
    currentUser.tasks = currentUser.tasks.filter(t => t.id !== taskId);
    saveUserData();
    renderTasks();
}

function addTask(title) {
    if (!title.trim()) return;
    const newTask = {
        id: Date.now(),
        title: title,
        status: "pending"
    };
    currentUser.tasks.push(newTask);
    saveUserData();
    renderTasks();
}

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let emailVal = email.value.trim();
    let passwordVal = password.value.trim();
    const account = accounts.find(a => a.email === emailVal && a.password === passwordVal);
    if (account) {
        currentUser = account;
        saveUserData();
        showPage("dashboard");
        renderTasks();
        addTaskBtn.style.display = 'flex';
    } else {
        alert("Invalid Email or Password");
        showPage("login");
        addTaskBtn.style.display = 'none';
    }
});

logoutBtn.addEventListener("click", () => {
    currentUser = null;
    localStorage.removeItem("currentUser");
    showPage("login");
});

window.addEventListener("hashchange", () => {
    const path = window.location.hash.replace("#", "");
    if (path === "dashboard" && currentUser) {
        showPage("dashboard");
        renderTasks();
    } else {
        showPage("login");
    }
});

addTaskBtn.addEventListener("click", () => {
    newTaskInput.value = "";
    taskModal.style.display = "flex";
    newTaskInput.focus();
});

saveTaskBtn.addEventListener("click", () => {
    const title = newTaskInput.value.trim();
    if (title) {
        addTask(title);
        taskModal.style.display = "none";
    }
});

document.getElementById('closeModal').onclick = function () {
    taskModal.style.display = 'none';
};

const path = window.location.hash.replace("#", "");
if (currentUser) {
    showPage("dashboard");
    renderTasks();
} else {
    showPage("login");
}
