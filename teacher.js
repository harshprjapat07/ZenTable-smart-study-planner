let currentIndex = null;
let currentBlobUrl = null;

function mainPage() { window.location.href = "main.html"; }

function refreshCounts() {
    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    const submissions = JSON.parse(localStorage.getItem("submissions")) || [];
    document.getElementById("count-assignments").innerText = assignments.length;
    document.getElementById("count-submissions").innerText = submissions.length;
}

function uploadAssignment() {
    let title = document.getElementById("title").value;
    let date = document.getElementById("date").value;
    let fileInput = document.getElementById("file");
    let file = fileInput.files[0];

    if (!title || !date || !file) {
        alert("Please fill all fields and select a PDF!");
        return;
    }

    let reader = new FileReader();
    reader.onload = function () {
        let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
        assignments.push({ title, date, file: reader.result });
        localStorage.setItem("assignments", JSON.stringify(assignments));
        
        // Reset fields
        document.getElementById("title").value = "";
        document.getElementById("date").value = "";
        fileInput.value = "";
        
        alert("Assignment Published Successfully!");
        loadAssignments();
        refreshCounts();
    };
    reader.readAsDataURL(file);
}

function loadAssignments() {
    let list = document.getElementById("assignmentList");
    let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    
    if (assignments.length === 0) {
        list.innerHTML = `<div class="empty-state">No assignments published.</div>`;
        return;
    }

    list.innerHTML = assignments.map(a => `
        <div class="list-item">
            <div>
                <strong>${a.title}</strong><br>
                <small style="color:gray"><i class="fa-regular fa-calendar"></i> Due: ${a.date}</small>
            </div>
            <span class="badge" style="background:#dcfce7; color:#166534; padding:4px 8px; border-radius:5px; font-size:0.7rem;">Active</span>
        </div>
    `).join('');
}

function loadSubmissions() {
    let list = document.getElementById("submissionList");
    let submissions = JSON.parse(localStorage.getItem("submissions")) || [];
    
    if (submissions.length === 0) {
        list.innerHTML = `<div class="empty-state">Waiting for submissions...</div>`;
        return;
    }

    list.innerHTML = submissions.map((s, i) => `
        <div class="list-item">
            <div>
                <strong>${s.name}</strong>
                <p id="marks-${i}" style="margin:0; font-size:0.85rem; color:var(--primary)">
                    ${s.marks ? 'Score: ' + s.marks + '/100' : 'Pending Grade'}
                </p>
            </div>
            <div>
                <button class="btn-sm btn-check" onclick="openPDF(${i})"><i class="fa-solid fa-file-pen"></i> Grade</button>
                <button class="btn-sm btn-ai" onclick="aiCheck(${i})"><i class="fa-solid fa-robot"></i> AI</button>
            </div>
        </div>
    `).join('');
}

function openPDF(index) {
    let submissions = JSON.parse(localStorage.getItem("submissions")) || [];
    let fileData = submissions[index].file;
    
    const byteString = atob(fileData.split(',')[1]);
    const mimeString = fileData.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: mimeString });

    if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = URL.createObjectURL(blob);

    document.getElementById("modal").style.display = "block";
    document.getElementById("pdf").src = currentBlobUrl; 
    currentIndex = index;
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
    document.getElementById("pdf").src = "";
}

function saveMarks() {
    let marks = document.getElementById("marks").value;
    let submissions = JSON.parse(localStorage.getItem("submissions")) || [];
    if (currentIndex !== null && marks) {
        submissions[currentIndex].marks = marks;
        localStorage.setItem("submissions", JSON.stringify(submissions));
        loadSubmissions();
        closeModal();
    }
}

function aiCheck(index) {
    let submissions = JSON.parse(localStorage.getItem("submissions")) || [];
    let marks = 60 + Math.floor(Math.random() * 35);
    submissions[index].marks = marks + " (AI)";
    localStorage.setItem("submissions", JSON.stringify(submissions));
    loadSubmissions();
}

// Initial Load
loadAssignments();
loadSubmissions();
refreshCounts();