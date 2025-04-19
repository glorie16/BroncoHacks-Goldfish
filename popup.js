// let timerStart = null;
const catImage = document.getElementById("cat-image");
const catMessage = document.getElementById("cat-message");
const assignmentsContainer = document.getElementById("assignments-container");

const characters = [
  {
    id: 'cat',
    name: 'Cat',
    happy: 'images/happy-cat.gif',
    sad: 'images/sad-cat.gif',
    dying: 'images/dead-cat.gif'
  },
  {
    id: 'lebron',
    name: 'LeBron',
    happy: 'images/happy_lebron.GIF',
    sad: 'images/angry_lebron.GIF',
    dying: 'images/dead_lebron.GIF'
  }
];

let currentCharacter = characters[0]; // fallback default

document.getElementById("change-character").addEventListener("click", () => {
  window.location.href = "characters.html";
});

chrome.storage.local.get('selectedCharacter', (data) => {
  const selected = data.selectedCharacter || 'cat';
  const char = characters.find(c => c.id === selected);
  if (char) {
    currentCharacter = char;
    catImage.src = char.happy;
  } else {
    catImage.src = 'images/happy-cat.gif'; // fallback
  }
});

function updateCatState(overdueAssignments, upcomingAssignments) {
  const anyOverdueNotCompleted = overdueAssignments.some(assignment => !assignment.completed);
  const completedUpcoming = upcomingAssignments.filter(a => a.completed).length;
  const upcomingPercentage = completedUpcoming / upcomingAssignments.length;

  if(anyOverdueNotCompleted){
    catImage.src = currentCharacter.dying;
    catMessage.textContent = "Oh no! You have missing assignments!";
  } else if(upcomingPercentage < 0.5){
    catImage.src = currentCharacter.sad;
    catMessage.textContent = "Why aren't we studying...?";
} else{
  catImage.src = currentCharacter.happy;
  catMessage.textContent = "Great job! I'm so proud of you!";
  }
  adjustImagePosition();

}

document.getElementById("check-status").addEventListener("click", () => {
  fetchAssignments();
});


// Canvas OAuth setup (no changes needed unless you're using it)
// const canvasAuthUrl = `https://<your-canvas-url>/login/oauth2/auth?` +
//   `client_id=${CLIENT_ID}&` +
//   `response_type=code&` +
//   `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
//   `state=${STATE}`;

function fetchAssignments() {
  const canvasToken = "7~PAEPV8VJCr34K49hFeNGkZmFM6VtzN8Xrtcf4ZW2WzAUyXVQ6mYZZ333f9mZPJJ8"; // replace with Canvas API token

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

window.addEventListener("load", () => {
  adjustImagePosition();
});

function adjustImagePosition() {
  const isDyingLeBron = catImage.src.includes("dead_lebron.GIF");

  catImage.classList.remove("tall-character"); // Always reset first

  if (!isDyingLeBron && catImage.naturalHeight > 300) {
    catImage.classList.add("tall-character");
  }
}
