const carousel = document.querySelector('.carousel');
const cards = document.querySelectorAll('.carousel > *');
const dropdowns = document.querySelectorAll('.carousel > .dropdown');
const cardMargin = 10; // Margin between cards

let currentIndex = 0;

function updateCarousel() {
    const containerWidth = document.querySelector('.carousel-container').offsetWidth;
    const cardWidth = cards[0]?.offsetWidth || 0; // Get the width of a card including padding and border
    const totalCardWidth = cardWidth + cardMargin * 2; // Total width including margins
    const centerOffset = (containerWidth / 2) - (cardWidth / 2); // Center card alignment
    const offset = centerOffset - (currentIndex * totalCardWidth);
    carousel.style.transform = `translateX(${offset}px)`;
    updateHighlightedCard();
}

function updateHighlightedCard() {
    cards.forEach((card, index) => {
        if (card.className.includes("card")) {
            card.classList.remove('highlighted');
        } else {
            card.classList.remove('highlighted');
        }
        if (index === currentIndex) {
            if (card.className.includes("card")) {
                card.classList.add('highlighted');
            } else {
                card.classList.add('highlighted');
            }
        }
    });
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('highlighted');
    });
    if (currentIndex >= cards.length) {
        
        cards[currentIndex - cards.length].classList.add('highlighted');
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % (cards.length);
        updateCarousel();
    } else if (e.key === 'ArrowLeft') {
        currentIndex = (currentIndex - 1 + cards.length) % (cards.length);
        updateCarousel();
    }
    if (e.key === 'A') {
        currentIndex = (currentIndex + 1) % (cards.length);
        updateCarousel();
    } else if (e.key === 'D') {
        currentIndex = (currentIndex - 1 + cards.length) % (cards.length);
        updateCarousel();
    }
});

cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        if (card.className.includes("card")) {window.open(card.dataset.url, '_blank');} else {}
    });

    card.addEventListener('focus', () => {
        currentIndex = index;
        updateCarousel();
    });
});

dropdowns.forEach(dropdown => {
    const links = dropdown.dataset.links.split('|');
    const dropdownContent = document.createElement('div');
    dropdownContent.className = 'dropdown-content';
    links.forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.href = link;
        linkElement.target = '_blank';
        linkElement.textContent = link;
        dropdownContent.appendChild(linkElement);
    });
    dropdown.appendChild(dropdownContent);

    dropdown.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents the event from bubbling up and causing issues
        dropdown.classList.toggle('highlighted');
    });

    dropdown.addEventListener('focus', () => {
        const index = Array.from(dropdowns).indexOf(dropdown) + cards.length;
        currentIndex = index;
        updateCarousel();
    });
});

cards[0]?.focus(); // Set initial focus if cards are present
updateCarousel(); // Initial update
updateHighlightedCard(); // Initial highlight