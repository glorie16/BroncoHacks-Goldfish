
import { getAssignments, evaluateHealth } from './tamagotchi.js';

let health = 100;

document.addEventListener('DOMContentLoaded', async () => {
  const statusText = document.getElementById('status');
  const healthText = document.getElementById('health');
  const petImage = document.getElementById('pet');

  try {
    const assignments = await getAssignments();
    const result = evaluateHealth(assignments);
    health += result;

    if (health >= 100) {
      petImage.src = 'happy.png';
      statusText.textContent = 'Your Tamagotchi is thriving!';
    } else if (health >= 50) {
      petImage.src = 'meh.png';
      statusText.textContent = 'Your Tamagotchi is okay.';
    } else {
      petImage.src = 'sad.png';
      statusText.textContent = 'Uh oh. Missed some deadlines...';
    }

    healthText.textContent = health;
  } catch (err) {
    statusText.textContent = 'Error loading data.';
    console.error(err);
  }
});