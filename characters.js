const characters = [
    {
      id: 'cat',
    name: 'Cat',
      preview: 'images/happy-cat.gif',
      happy: 'images/happy-cat.gif',
      sad: 'images/sad-cat.gif',
      dying: 'images/dead-cat.gif'
    },
    {
      id: 'lebron',
      name: 'LeBron',
      preview: 'images/new_lebron_preview.GIF',
      happy: 'images/happy_lebron.GIF',
      sad: 'images/angry_lebron.GIF',
      dying: 'images/dead_lebron.GIF'
    }
  ];
  
  
  const list = document.getElementById("character-list");
  
  characters.forEach(character => {
    const btn = document.createElement("button");
    btn.textContent = character.name;
  
    const img = document.createElement("img");
    img.src = character.preview;
    img.alt = character.name;
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.display = "block";
  
    btn.appendChild(img);

    btn.addEventListener("click", () => {
      chrome.storage.local.set({selectedCharacter: character.id});
    });
  
    list.appendChild(btn);
  });
  
  // Optional: Go-back button
  document.getElementById("go-back").addEventListener("click", () => {
    window.location.href = "popup.html"; // Or wherever you want to go back to
  });