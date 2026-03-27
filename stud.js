function mainPage() {
  window.location.href = "main.html";
}

function loadAssignments() {
  let list = document.getElementById("assignmentList");
  let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
  if (!list) return;

  if (assignments.length === 0) {
    list.innerHTML = "<p style='color:gray;'>No assignments posted yet.</p>";
    return;
  }

  list.innerHTML = assignments.map((a, i) => `
        <div class="assignment-box">
            <span class="badge" style="background:#e0e7ff; color:#4338ca; padding:4px 8px; border-radius:4px; font-size:0.7rem; font-weight:bold;">TASK</span>
            <p style="margin:10px 0;"><strong>${a.title}</strong></p>
            <p style="font-size:0.8rem; color:gray;"><i class="fa-regular fa-calendar"></i> Due: ${a.date}</p>
            <button class="view-btn" onclick="openPDF('${a.file}')">View Material</button>
            <div class="upload-zone">
                <label style="font-size:0.75rem; display:block; margin-bottom:5px;">Submit Solution (PDF):</label>
                <input type="file" class="file-input-custom" onchange="submitAssignment(event, ${i})">
            </div>
        </div>
    `).join('');
}

function submitAssignment(e, index) {
  let file = e.target.files[0];
  if (!file) return;

  let reader = new FileReader();
  reader.onload = function () {
    let submissions = JSON.parse(localStorage.getItem("submissions")) || [];
    submissions.push({
      id: "ASM-" + Date.now(), // unique ID
      name: localStorage.getItem("username") || "Anonymous", 
      assignmentIndex: index,
      file: reader.result,
      marks: null,
      submittedAt: new Date().toLocaleString()
    });
    localStorage.setItem("submissions", JSON.stringify(submissions));
    alert("Success! Your work has been sent to the teacher.");
    loadMySubmissions();
  };
  reader.readAsDataURL(file);
}

function loadMySubmissions() {
  let container = document.getElementById("mySubmissions");
  let submissions = JSON.parse(localStorage.getItem("submissions")) || [];
  if (!container) return;

  if (submissions.length === 0) {
    container.innerHTML = "<p style='color:gray; font-size:0.9rem;'>No submissions yet.</p>";
    return;
  }

  container.innerHTML = submissions.map(s => `
        <div class="assignment-box" style="padding:12px; margin-bottom:10px; background:#fcfcfc;">
            <p style="font-size:0.9rem; font-weight:bold;">ID: ${s.id}</p>
            <p class="status" style="font-size:0.8rem; color:var(--success)">● Submitted</p>
            <p style="font-size:0.85rem; margin-top:5px;">Result: <strong>${s.marks !== null ? s.marks + '/100' : "Awaiting Grade"}</strong></p>
            <p style="font-size:0.75rem; color:gray;">Submitted on: ${s.submittedAt}</p>
        </div>
    `).join('');
}

function Timetablemanager(){
  window.location.href="timetable.html"
}

function toggleChat() {
  const win = document.getElementById('chat-window');
  const icon = document.getElementById('toggle-icon');
  if (win.style.display === "none" || win.style.display === "") {
    win.style.display = "flex";
    icon.className = "fa-solid fa-chevron-down";
  } else {
    win.style.display = "none";
    icon.className = "fa-solid fa-chevron-up";
  }
}

async function askBuddy() {
  const input = document.getElementById('ai-input');
  const box = document.getElementById('chat-content');
  const text = input.value.trim();
  if (!text) return;

  box.innerHTML += `<div class="msg user-msg">${text}</div>`;
  input.value = "";
  box.scrollTop = box.scrollHeight;

  const typingId = "typing-" + Date.now();
  box.innerHTML += `<div class="msg bot-msg" id="${typingId}">...</div>`;

  try {
    
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await response.json();
    document.getElementById(typingId).innerText = data.reply || "Buddy couldn't respond.";
  } catch (error) {
    document.getElementById(typingId).innerText = "Buddy is currently offline. Try again later!";
  }
  box.scrollTop = box.scrollHeight;
}

function handleEnter(e) {
  if (e.key === 'Enter') askBuddy();
}

function clearAllData() {
  if (confirm("Reset account? This will clear all your submissions.")) {
    localStorage.clear();
    location.reload();
  }
}

loadAssignments();
loadMySubmissions();