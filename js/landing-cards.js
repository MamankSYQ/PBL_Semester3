(() => {
    'use strict';

    const cards = Array.from(
        document.querySelectorAll('.card-grid .grid-item[role="button"]')
    );

    if (cards.length === 0) return;

    const selectCard = (selectedCard) => {
        cards.forEach((card) => {
            const isSelected = card === selectedCard;
            card.setAttribute('aria-pressed', String(isSelected));
            card.classList.toggle('is-selected', isSelected);
        });
    };

    cards.forEach((card) => {
        card.addEventListener('click', () => selectCard(card));

        card.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            selectCard(card);
        });
    });

    selectCard(cards.find((card) => card.getAttribute('aria-pressed') === 'true') || cards[0]);
})();
