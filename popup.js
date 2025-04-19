let timerStart = null;
const catImage = document.getElementById("cat-image");
const catMessage = document.getElementById("cat-message");

function updateCatState(isProductive) {
  if (isProductive) {
    catImage.src = "images/happy-cat.png";
    catMessage.textContent = "Great job! I'm so proud of you!";
  } else {
    catImage.src = "images/sad-cat.png";
    catMessage.textContent = "Why aren't we studying...? 😿";
  }
}

document.getElementById("start-timer").addEventListener("click", () => {
  timerStart = Date.now();
  chrome.storage.local.set({ timerStart });
  catImage.src = "images/happy-cat.png";
  catMessage.textContent = "Timer started. Let's study!";
});

document.getElementById("check-status").addEventListener("click", () => {
  chrome.storage.local.get("timerStart", (data) => {
    const now = Date.now();
    if (data.timerStart) {
      const minutesPassed = (now - data.timerStart) / 60000;
      if (minutesPassed > 0 && minutesPassed < 60) {
        updateCatState(true);
      } else {
        updateCatState(false);
      }
    } else {
      updateCatState(false);
    }
  });
});