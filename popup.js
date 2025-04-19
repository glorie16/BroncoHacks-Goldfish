let timerStart = null;
const catImage = document.getElementById("cat-image");
const catMessage = document.getElementById("cat-message");

const characters = [
  {
    id: 'cat',
    name: 'Cat',
    happy: 'images/happy-cat.gif',
    sad: 'images/sad-cat.gif'
  },
  {
    id: 'lebron',
    name: 'LeBron',
    happy: 'images/lebron.gif',
    sad: 'images/angry-lebron.gif' 
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

function updateCatState(isProductive) {
  if (isProductive) {
    catImage.src = currentCharacter.happy;
    catMessage.textContent = "Great job! I'm so proud of you!";
  } else {
    catImage.src = currentCharacter.sad || currentCharacter.happy;
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

// Canvas OAuth setup (no changes needed unless you're using it)
const canvasAuthUrl = `https://<your-canvas-url>/login/oauth2/auth?` +
  `client_id=${CLIENT_ID}&` +
  `response_type=code&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `state=${STATE}`;