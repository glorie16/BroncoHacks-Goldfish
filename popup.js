let timerStart = null;
let pausedTime = null;
let timerInterval = null;
const catImage = document.getElementById("cat-image");
const catMessage = document.getElementById("cat-message");
const timerDisplay = document.getElementById("timer-display");
const assignmentsContainer = document.getElementById("assignments-container");

function updateCatState(isProductive) {
  if (isProductive) {
    catImage.src = "images/happy-cat.png";
    catMessage.textContent = "Great job! I'm so proud of you!";
  } else {
    catImage.src = "images/sad-cat.png";
    catMessage.textContent = "Why aren't we studying...? 😿";
  }
}

function updateTimerDisplay() {
  if (!timerStart) return;
  const now = Date.now();
  const elapsedMs = now - timerStart;
  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);
  timerDisplay.textContent = `Timer: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.getElementById("start-timer").addEventListener("click", () => {
  if (pausedTime) {
    timerStart += Date.now() - pausedTime;
    pausedTime = null;
  } else {
    timerStart = Date.now();
  }
  chrome.storage.local.set({ timerStart });
  catImage.src = "images/happy-cat.png";
  catMessage.textContent = "Timer started. Let's study!";
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimerDisplay, 1000);
});

document.getElementById("pause-timer").addEventListener("click", () => {
  if (timerStart) {
    clearInterval(timerInterval);
    pausedTime = Date.now();
    catMessage.textContent = "Timer paused. Take a quick break!";
  }
});

document.getElementById("end-timer").addEventListener("click", () => {
  clearInterval(timerInterval);
  timerStart = null;
  pausedTime = null;
  timerDisplay.textContent = "Timer: 00:00";
  catImage.src = "images/sad-cat.png";
  catMessage.textContent = "Timer ended. Ready to start again?";
  chrome.storage.local.set({ timerStart: null });
});

document.getElementById("check-status").addEventListener("click", () => {
  chrome.storage.local.get("timerStart", (data) => {
    const now = Date.now();
    if (data.timerStart) {
      timerStart = data.timerStart;
      const minutesPassed = (now - data.timerStart) / 60000;
      updateCatState(minutesPassed > 0 && minutesPassed < 60);
      clearInterval(timerInterval);
      timerInterval = setInterval(updateTimerDisplay, 1000);
    } else {
      updateCatState(false);
    }
  });
  fetchAssignments();
});

function fetchAssignments() {
  const canvasToken = "7~hwrcF4zuQNJUCALn9hA44mFGn44AvVUn4nFah7N47X4PkvFtMh8UBP4QMkZCNABt"; // <-- Hardcoded token

  fetch("https://canvas.instructure.com/api/v1/courses?enrollment_state=active", {
    headers: {
      Authorization: `Bearer ${canvasToken}`
    }
  })
  .then(res => res.json())
  .then(courses => {
    const courseIds = courses.map(c => c.id);
    const assignmentPromises = courseIds.map(courseId =>
      fetch(`https://canvas.instructure.com/api/v1/courses/${courseId}/assignments`, {
        headers: { Authorization: `Bearer ${canvasToken}` }
      }).then(res => res.json())
    );
    return Promise.all(assignmentPromises);
  })
  .then(courseAssignments => {
    const allAssignments = courseAssignments.flat();
    displayAssignments(allAssignments.map(a => ({
      name: a.name,
      due_at: a.due_at,
      completed: a.has_submitted_submissions
    })));
  })
  .catch(err => {
    console.error(err);
    catMessage.textContent = "Failed to fetch assignments. Check token.";
  });
}


function displayAssignments(assignments) {
  assignmentsContainer.innerHTML = "<h3>Assignments</h3>";
  const now = new Date();
  let anyOverdue = false;

  assignments.forEach(assignment => {
    const dueDate = new Date(assignment.due_at);
    const isOverdue = !assignment.completed && dueDate < now;
    const div = document.createElement("div");
    div.className = "assignment" + (assignment.completed ? " completed" : "") + (isOverdue ? " overdue" : "");
    div.innerHTML = `
      <p><strong>${assignment.name}</strong></p>
      <p>Due: ${dueDate.toLocaleString()}</p>
      <button onclick="markComplete(this)">Mark Complete</button>
    `;
    assignmentsContainer.appendChild(div);
    if (isOverdue) anyOverdue = true;
  });

  updateCatState(!anyOverdue);
}

window.markComplete = function(button) {
  const div = button.parentElement;
  div.classList.add("completed");
  button.remove();
  catImage.src = "images/happy-cat.png";
  catMessage.textContent = "Yay! Another task done!";
};
