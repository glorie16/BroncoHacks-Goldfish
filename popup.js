// let timerStart = null;
// let pausedTime = null;
// let timerInterval = null;
const catImage = document.getElementById("cat-image");
const catMessage = document.getElementById("cat-message");
// const timerDisplay = document.getElementById("timer-display");
const assignmentsContainer = document.getElementById("assignments-container");

function updateCatState(overdueAssignments, upcomingAssignments) {
  const anyOverdueNotCompleted = overdueAssignments.some(assignment => !assignment.completed);
  const completedUpcoming = upcomingAssignments.filter(a => a.completed).length;
  const upcomingPercentage = completedUpcoming / upcomingAssignments.length;

  if(anyOverdueNotCompleted){
    // catImage.src = "images/dying-cat.png";
    catMessage.textContent = "Oh no! You have missing assignments!";
  } else if(upcomingPercentage < 0.5){
    // catImage.src = "images/sad-cat.png";
    catMessage.textContent = "Why aren't we studying...? 😿";
} else{
  // catImage.src = "images/happy-cat.png";
  catMessage.textContent = "Great job! I'm so proud of you!";
  }
}

// function updateTimerDisplay() {
//   if (!timerStart) return;
//   const now = Date.now();
//   const elapsedMs = now - timerStart;
//   const minutes = Math.floor(elapsedMs / 60000);
//   const seconds = Math.floor((elapsedMs % 60000) / 1000);
//   timerDisplay.textContent = `Timer: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
// }

// document.getElementById("start-timer").addEventListener("click", () => {
//   if (pausedTime) {
//     timerStart += Date.now() - pausedTime;
//     pausedTime = null;
//   } else {
//     timerStart = Date.now();
//   }
//   chrome.storage.local.set({ timerStart });
//   catImage.src = "images/happy-cat.png";
//   catMessage.textContent = "Timer started. Let's study!";
//   clearInterval(timerInterval);
//   timerInterval = setInterval(updateTimerDisplay, 1000);
// });

// document.getElementById("pause-timer").addEventListener("click", () => {
//   if (timerStart) {
//     clearInterval(timerInterval);
//     pausedTime = Date.now();
//     catMessage.textContent = "Timer paused. Take a quick break!";
//   }
// });

// document.getElementById("end-timer").addEventListener("click", () => {
//   clearInterval(timerInterval);
//   timerStart = null;
//   pausedTime = null;
//   timerDisplay.textContent = "Timer: 00:00";
//   catImage.src = "images/sad-cat.png";
//   catMessage.textContent = "Timer ended. Ready to start again?";
//   chrome.storage.local.set({ timerStart: null });
// });

document.getElementById("check-status").addEventListener("click", () => {
  // chrome.storage.local.get("timerStart", (data) => {
  //   const now = Date.now();
  //   if (data.timerStart) {
  //     timerStart = data.timerStart;
  //     const minutesPassed = (now - data.timerStart) / 60000;
  //     updateCatState(minutesPassed > 0 && minutesPassed < 60);
  //     clearInterval(timerInterval);
  //     timerInterval = setInterval(updateTimerDisplay, 1000);
  //   } else {
  //     updateCatState(false);
  //   }
  // });
  fetchAssignments();
});

function fetchAssignments() {
  const canvasToken = "---"; // replace with Canvas API token

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
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  let anyOverdue = false;
  let overdueAssignments = [];
  let upcomingAssignments = [];

  // Filters upcoming assignments (assignments due in the next week)
  assignments.forEach(assignment => {
    const dueDate = new Date(assignment.due_at);
    if(dueDate < now && !assignment.completed){
      overdueAssignments.push(assignment);
    } else if(dueDate > now && dueDate <= oneWeekFromNow){
      upcomingAssignments.push(assignment);
    }
  });

  assignments.sort((a, b) => new Date(a.due_at) - new Date(b.due_at));

  assignments.forEach(assignment => {
    const dueDate = new Date(assignment.due_at);
    const isOverdue = !assignment.completed && dueDate < now;
    const div = document.createElement("div");
    div.className = "assignment" + (assignment.completed ? " completed" : "") + (isOverdue ? " overdue" : "");
    div.innerHTML = `
      <p><strong>${assignment.name}</strong></p>
      <p>Due: ${dueDate.toLocaleString()}</p>
    `;
    assignmentsContainer.appendChild(div);
    if (isOverdue) anyOverdue = true;
  });

  updatedCompletedText(upcomingAssignments);
  updateCatState(overdueAssignments, upcomingAssignments);
}

function updatedCompletedText(upcomingAssignments){
  // Counts completed upcoming assignments
  const completedUpcoming = upcomingAssignments.filter(a => a.completed).length;
  const completedText = document.getElementById("completed-text");

  if(completedText){
    completedText.textContent = `Completed Upcoming Assignments: ${completedUpcoming}/${upcomingAssignments.length}`;
  } else{
    const textElement = document.createElement("p");
    textElement.id = "completed-text";
    textElement.textContent = `Completed Upcoming Assignments: ${completedUpcoming}/${upcomingAssignments.length}`;
    catMessage.insertAdjacentElement("afterend", textElement);
  }
}

// window.markComplete = function(button) {
//   const div = button.parentElement;
//   div.classList.add("completed");
//   button.remove();
//   catImage.src = "images/happy-cat.png";
//   catMessage.textContent = "Yay! Another task done!";
// };
