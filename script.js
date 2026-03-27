let tasks = [];
let timers = {};
function startTimer(name, duration) {
  if (timers[name]) return;

  let totalSeconds = duration * 60;
  let remaining = totalSeconds;

  let progressBar = document.getElementById(`progress-${name}`);
  let timeText = document.getElementById(`time-${name}`);

  timers[name] = setInterval(() => {
    if (remaining <= 0) {
      clearInterval(timers[name]);
      delete timers[name];
      alert(name + " completed!");
      return;
    }

    remaining--;

    let percent = ((totalSeconds - remaining) / totalSeconds) * 100;
    progressBar.style.width = percent + "%";

    let mins = Math.floor(remaining / 60);
    let secs = remaining % 60;

    timeText.innerText = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, 1000);
}

function pauseTimer(name) {
  clearInterval(timers[name]);
  delete timers[name];
}

function resetTimer(name, duration) {
  pauseTimer(name);

  let progressBar = document.getElementById(`progress-${name}`);
  let timeText = document.getElementById(`time-${name}`);

  progressBar.style.width = "0%";
  timeText.innerText = `${duration}:00`;
}

function markComplete(name) {
  tasks.forEach(task => {
    let safeName = task.name.replace(/\s+/g, '_');
    if (safeName === name) {
      task.completed = true;
      alert(task.name + " marked as completed!");
    }
  });
}

function addTask() {
  let name = document.getElementById("name").value;
  let length = parseFloat(document.getElementById("length").value);
  let deadline = document.getElementById("deadline").value;
  let interest = parseInt(document.getElementById("interest").value);

  if (!name || !length || !deadline) {
    alert("Please fill all fields");
    return;
  }

  tasks.push({ 
  name, 
  length, 
  deadline, 
  interest,
  completed: false,
  carryForward: 0
});
  alert("Task Added!");

  document.getElementById("name").value = "";
  document.getElementById("length").value = "";
}

function daysLeft(deadline) {
  let today = new Date();
  let due = new Date(deadline);
  let diff = (due - today) / (1000 * 60 * 60 * 24);
  return diff > 0 ? diff : 1;
}

function totalPriority(tasks) {
  return tasks.reduce((sum, t) => sum + t.priority, 0);
}

function formatTime(hour) {
  let h = Math.floor(hour);
  let m = Math.round((hour - h) * 60);
  return `${h}:${m === 0 ? "00" : m}`;
}

function daysUntilExam() {
  let examDate = document.getElementById("examDate").value;

  if (!examDate) return 10; // default if not set

  let today = new Date();
  let exam = new Date(examDate);

  let diff = (exam - today) / (1000 * 60 * 60 * 24);
  return diff > 0 ? diff : 0;
}

function resetDailyTasks() {
  tasks.forEach(task => {
    task.completed = false;
  });
}

function generateSchedule() {
  let totalHours = parseFloat(document.getElementById("hours").value);

  if (tasks.length === 0) {
    alert("Add at least one task");
    return;
  }

// 🔁 Carry forward unfinished tasks
tasks.forEach(task => {
  if (!task.completed) {
    task.carryForward += 1;
  } else {
    task.carryForward = 0;
  }
});

  // Calculate priority
  tasks.forEach(task => {
    let urgency = 1 / daysLeft(task.deadline);
    task.priority = (urgency * 2) 
              + (task.length * 1.5) 
              + (task.interest * 2)
              + (task.carryForward * 3); // 🔥 extra boost
  });

  // Sort tasks
  tasks.sort((a, b) => b.priority - a.priority);

  // Allocate time

let days = daysUntilExam();
let revisionTime;

// 🎯 Smart Adjustment
if (days <= 2) {
  revisionTime = totalHours * 0.6;
} else if (days <= 5) {
  revisionTime = totalHours * 0.5;
} else if (days <= 10) {
  revisionTime = totalHours * 0.4;
} else {
  revisionTime = totalHours * 0.3;
}

  let studyTime = totalHours - revisionTime;
  if (days <= 2) {
  alert("⚠️ Exam is very close! Focus on revision.");
}

  let output = document.getElementById("output");
  output.innerHTML = "";

  let currentTime = 9;
  let totalP = totalPriority(tasks);

  tasks.forEach(task => {
    let time = (task.priority / totalP) * studyTime;

    let li = document.createElement("li");
    let durationMinutes = Math.round(time * 60);

    // ✅ Fix: safe ID (no spaces)
    let safeName = task.name.replace(/\s+/g, '_');

    li.innerHTML = `
      <strong>${task.name}</strong> 
      (${formatTime(currentTime)} - ${formatTime(currentTime + time)})

      <div class="timer-text" id="time-${safeName}">${durationMinutes}:00</div>

      <div class="progress-bar">
        <div class="progress" id="progress-${safeName}"></div>
      </div>

      <button onclick="startTimer('${safeName}', ${durationMinutes})">▶ Start</button>
      <button onclick="pauseTimer('${safeName}')">⏸ Pause</button>
      <button onclick="resetTimer('${safeName}', ${durationMinutes})">🔄 Reset</button>
      <button onclick="markComplete('${safeName}')">✅ Done</button>
    `;

    output.appendChild(li);
    currentTime += time;
  });

  // ✅ Revision block (correct)
  let rev = document.createElement("li");

  rev.innerText = "📖 Revision → " 
    + formatTime(currentTime) 
    + " - " 
    + formatTime(currentTime + revisionTime);

  output.appendChild(rev);
}