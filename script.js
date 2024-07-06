document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    startCountdownIfNotInProgress();

    // Prepare the sound for immediate playback
    const audio = new Audio('alarm.mp3');
    document.body.addEventListener('click', () => {
        audio.play();
        audio.pause();
    }, { once: true });
});

function addTask() {
    const secondsInput = document.getElementById('secondsInput').value;
    const taskInput = document.getElementById('taskInput').value;

    if (secondsInput === '' || taskInput === '') {
        alert('Please fill in both fields');
        return;
    }

    const task = {
        id: Date.now(),
        seconds: parseInt(secondsInput, 10),
        task: taskInput,
        score: null,
        countdownInProgress: false
    };

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.unshift(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    addTaskToTable(task, tasks.length);
    document.getElementById('secondsInput').value = '';
    document.getElementById('taskInput').value = '';
    startCountdownIfNotInProgress();
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach((task, index) => addTaskToTable(task, tasks.length - index));
}

function addTaskToTable(task, index) {
    const taskTableBody = document.getElementById('taskTableBody');
    const row = document.createElement('tr');

    row.dataset.id = task.id;
    row.dataset.seconds = task.seconds;

    row.innerHTML = `
        <td>${index}</td>
        <td>${task.seconds}</td>
        <td>${task.task}</td>
        <td>${task.score !== null ? task.score : ''}</td>
        <td>
            <button class="edit" onclick="editTask(${task.id})">Edit</button>
            <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
            <button class="score" onclick="scoreTask(${task.id})">Score</button>
        </td>
    `;

    if (task.score !== null) {
        row.style.backgroundColor = getGradientColor(task.score);
    }

    taskTableBody.insertBefore(row, taskTableBody.firstChild);
}

function deleteTask(id) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    document.getElementById('taskTableBody').innerHTML = '';
    loadTasks();
    startCountdownIfNotInProgress();
}

function editTask(id) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(task => task.id === id);
    if (task) {
        document.getElementById('secondsInput').value = task.seconds;
        document.getElementById('taskInput').value = task.task;
        deleteTask(id);
    }
}

function scoreTask(id) {
    const score = prompt('Enter a score between 0 and 100:');
    if (score === null) return;

    const scoreValue = parseInt(score, 10);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
        alert('Please enter a valid number between 0 and 100.');
        return;
    }

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.score = scoreValue;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        document.getElementById('taskTableBody').innerHTML = '';
        loadTasks();
    }
}

function getGradientColor(score) {
    const red = Math.floor((100 - score) * 2.55);
    const green = Math.floor(score * 2.55);
    return `rgb(${red}, ${green}, 0)`;
}

function startCountdownIfNotInProgress() {
    const rows = document.querySelectorAll('#taskTableBody tr');

    for (let i = rows.length - 1; i >= 0; i--) {
        const row = rows[i];
        const seconds = parseInt(row.dataset.seconds, 10);
        if (!row.dataset.countdownInProgress && seconds > 0) {
            row.dataset.countdownInProgress = true;
            countdownForRow(row, seconds);
            break;
        }
    }
}

function countdownForRow(row, seconds) {
    const initialSeconds = seconds;
    const interval = setInterval(() => {
        if (seconds > 0) {
            seconds--;
            row.cells[1].innerText = seconds;
        } else {
            clearInterval(interval);
            playSound().then(() => {
                setScoreAndColor(row, 100);
                row.cells[1].innerText = initialSeconds; // Show the initial amount of the timer
                row.dataset.countdownInProgress = false; // Reset countdown status
                alert('Congratulations KHALED!');
                startCountdownIfNotInProgress(); // Start countdown for the next row
            });
        }
    }, 1000);
}


function setScoreAndColor(row, score) {
    row.cells[3].innerText = score;
    row.style.backgroundColor = getGradientColor(score);

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(task => task.id == row.dataset.id);
    if (task) {
        task.score = score;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function playSound() {
    const audio = new Audio('alarm.mp3');
    return new Promise((resolve) => {
        audio.play();
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0; // Reset audio playback to the beginning
            resolve();
        }, 10000); // Play sound for 10 seconds
    });
}