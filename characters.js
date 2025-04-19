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
      happy: 'images/lebron.PNG',
      sad: 'images/sad-lebron.PNG'
    }
  ];
  
  const list = document.getElementById("character-list");
  
  characters.forEach(character => {
    const btn = document.createElement("button");
    btn.textContent = character.name;
  
    const img = document.createElement("img");
    img.src = character.happy;
    img.alt = character.name;
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.display = "block";
  
    btn.appendChild(img);

    btn.addEventListener("click", () => {
      chrome.storage.local.set("selectedCharacter", character.id);
    });
  
    list.appendChild(btn);
  });
  
  // Optional: Go-back button
  document.getElementById("go-back").addEventListener("click", () => {
    window.location.href = "popup.html"; // Or wherever you want to go back to
  });