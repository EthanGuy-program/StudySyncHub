
// JavaScript
function makeElementsDraggable(draggedElementId, referenceElementId, behavior) {
  window.onload = function() {
    const draggedElement = document.getElementById(draggedElementId);
    const referenceElement = document.getElementById(referenceElementId);
  
    if (!draggedElement || !referenceElement) {
      console.error('Invalid element IDs provided. Dragged:', draggedElement, 'Reference:', referenceElement);
      return;
    }
  
    let isDragging = false;
  
    function handleMouseDown(e) {
      isDragging = true;
  
      const offsetX = e.clientX - draggedElement.offsetLeft;
      const offsetY = e.clientY - draggedElement.offsetTop;
  
      const referenceOffsetX = e.clientX - referenceElement.offsetLeft;
      const referenceOffsetY = e.clientY - referenceElement.offsetTop;
  
      function handleMouseMove(e) {
        if (isDragging) {
          draggedElement.style.left = e.clientX - offsetX + 'px';
          draggedElement.style.top = e.clientY - offsetY + 'px';
  
          if (behavior === 'together') {
            referenceElement.style.left = e.clientX - referenceOffsetX + 'px';
            referenceElement.style.top = e.clientY - referenceOffsetY + 'px';
          }
        }
      }
  
      function handleMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
  
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  
    referenceElement.addEventListener('mousedown', handleMouseDown);
    draggedElement.addEventListener('mousedown', handleMouseDown);
  }
  }
  function setupButtonListeners(buttonSelector, actions) {
    const buttons = document.querySelectorAll(buttonSelector);
  
    buttons.forEach(function(button) {
        button.addEventListener("click", function() {
            console.log("Button clicked");

            actions.forEach(function(action) {
                if (action.element) {
                    document.querySelector(action.element).style.display = action.display;
                }
                if (action.attribute) {
                    document.getElementById(action.attribute.id).href = action.attribute.value;
                }
            });
        });
    });
}

  // Example usage:
  // or
  // makeElementsDraggable("window", "otherElement", 'separate');
  // or
  //  setupButtonListeners(".ender", [
  //    { element: ".gradient-layer", display: "none" },
  //    { element: ".box-layer", display: "none" },
  //    { attribute: { id: "icono", value: "Images/icon-2.ico" } }
  //  ]);
  
  
  
  
  
  
  
  document.addEventListener('DOMContentLoaded', function() {
    makeElementsDraggable("window", "otherElement", 'together');
    makeElementsDraggable("game-window", "gameElement", 'together');
    makeElementsDraggable("kodder", "bodder", 'together');
    const hudLink = document.getElementById('start-Button');
    const movingBox = document.querySelector('.movingBox');
    let isBoxUp = false;
    document.getElementById('Chill').style.fontSize = '0px'
  
  // First set of buttons
  setupButtonListeners(".ender", [
      { element: ".gradient-layer", display: "none" },
      { element: ".box-layer", display: "none" },
      { attribute: { id: "icono", value: "Images/icon-2.ico" } }
  ]);
  
  // Second set of buttons
  setupButtonListeners(".changer", [
      { element: "#kodder", display: "none" },
      { element: ".boxer", display: "none" }
  ]);
  
  // Third set of buttons
  setupButtonListeners(".window-ender", [
      { element: "#gameElement", display: "none" },
      { element: "#game-window", display: "none" },
      { attribute: { id: "icono", value: "Images/icon-2.ico" } }
  ]);
  
    // Select the audio toggle button
    var audioToggleButton = document.querySelector('.toggle-audio');

    // Add click event listener to the audio toggle button
    audioToggleButton.addEventListener("click", function() {
        // Get the target ID from the button's data-target attribute
        var targetId = audioToggleButton.getAttribute("data-target");
        // Select the audio element using the target ID
        var audio = document.querySelector("." + targetId);

        // Check if the audio is paused
        if (audio.paused) {
            // If paused, play the audio
            audio.play();
            audioToggleButton.innerText = "Chill Music enabled";
        } else {
            // If playing, pause the audio
            audio.pause();
            audioToggleButton.innerText = "Chill Music disabled";
        }
    });
    function toggleMoveUp() {
      isBoxUp = !isBoxUp;
      movingBox.classList.toggle('move-up', isBoxUp);
    }
  
    function handleLinkClick() {
      toggleMoveUp();
    }
  
    hudLink.addEventListener('mouseover', function() {
      if (!isBoxUp) {
        movingBox.classList.add('move-up');
        document.getElementById('Chill').style.fontSize = '12px'
      }
    });
  
    hudLink.addEventListener('mouseout', function() {
      if (!isBoxUp) {
        movingBox.classList.remove('move-up');
        document.getElementById('Chill').style.fontSize = '0px'
      }
    });
    hudLink.addEventListener('click', handleLinkClick); // Add event listener here
  });
  
      function hideContentAndShowIframe() {
      // Get the gradient and box layers
      const gradientLayer = document.querySelector(".gradient-layer");
      const boxLayer = document.querySelector(".box-layer");
      document.getElementById("icono").href = "Images/icon-1.ico"
      const iframe = document.getElementById("myIframe");
      const othexLayer = document.getElementById("kodder");
      const gameLayer = document.getElementById("game-window");
      const theothergamelayer = document.getElementById("gameElement");
      const boxerLayer = document.querySelector(".boxer");
  
      othexLayer.style.display = "none";
      boxerLayer.style.display = "none";
      

      // Hide or remove both layers from the DOM
      gradientLayer.style.display = "none";
      boxLayer.style.display = "none";
      
      // Show the iframe
      iframe.style.display = "block";
      theothergamelayer.style.display = "block";
      gameLayer.style.display = "block";
      if (lockMouseCursor()) {
        lockMouseCursor();
      }
      iframe.src = "Extra/index.html";  // Correcting the path here
    
    }
  
      // For the actual button


      // Connect to the QWebChannel
// JavaScript