let timerStart = null;
const catImage = document.getElementById("cat-image");
const catMessage = document.getElementById("cat-message");

function updateCatState(isProductive) {
  if (isProductive) {
    catImage.src = "images/happy-cat.gif";
    catMessage.textContent = "Great job! I'm so proud of you!";
  } else {
    catImage.src = "images/sad-cat.gif";
    catMessage.textContent = "Why aren't we studying...? 😿";
  }
}


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

const canvasAuthUrl = `https://<your-canvas-url>/login/oauth2/auth?` +
  `client_id=${CLIENT_ID}&` +
  `response_type=code&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `state=${STATE}`;
