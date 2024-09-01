const carousel = document.querySelector('.carousel');
const cards = document.querySelectorAll('.carousel > *');
const cardMargin = 10;
let currentIndex = 0;
let startX = 0;
let endX = 0;

function updateCarousel() {
    const containerWidth = document.querySelector('.carousel-container').offsetWidth;
    const cardWidth = cards[0]?.offsetWidth || 0;
    const totalCardWidth = cardWidth + cardMargin * 2;
    const centerOffset = (containerWidth / 2) - (cardWidth / 2);
    const offset = centerOffset - (currentIndex * totalCardWidth);
    carousel.style.transform = `translateX(${offset}px)`;
    updateHighlightedCard();
}

function updateHighlightedCard() {
    cards.forEach((card, index) => {
        card.classList.remove('highlighted');
        if (index === currentIndex) {
            card.classList.add('highlighted');
        }
    });
}

function handleSwipe() {
    if (startX - endX > 50) { // Swipe left
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    } else if (endX - startX > 50) { // Swipe right
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
    }
}

document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
});

document.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
    }
});

cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        if (card.dataset.url) {
            window.open(card.dataset.url, '_blank');
        }
    });

    card.addEventListener('focus', () => {
        currentIndex = index;
        updateCarousel();
    });
});

const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {
    // Get the dropdown text and convert it to lowercase
    const dropdownText = dropdown.innerText.trim().toLowerCase();

    // Split the dataset links into an array
    const links = dropdown.dataset.links.split('|');

    // Create a container for dropdown content
    const dropdownContent = document.createElement('div');
    dropdownContent.className = 'dropdown-content';

    links.forEach(link => {
        // Try to extract the text after the dropdown text reference
        const extractedText = link.split(`/${dropdownText}/`)[1]?.replace(/\/$/, '');

        // Create a link element
        const linkElement = document.createElement('a');
        linkElement.href = link;
        linkElement.target = '_blank';
        
        // Set link text to extracted text or fallback to full link
        linkElement.textContent = extractedText || link;

        // Append the link to the dropdown content
        dropdownContent.appendChild(linkElement);
    });

    // Append the dropdown content to the dropdown element
    dropdown.appendChild(dropdownContent);


    dropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('highlighted');
    });

    dropdown.addEventListener('focus', () => {
        const index = Array.from(dropdowns).indexOf(dropdown) + cards.length;
        currentIndex = index;
        updateCarousel();
    });
});

cards[0]?.focus();
updateCarousel();