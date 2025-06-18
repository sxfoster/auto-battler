export function makeCardInteractive(cardElement) {
    const intensity = 3;

    const handleMouseMove = (e) => {
        const rect = cardElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const midX = rect.width / 2;
        const midY = rect.height / 2;

        const parallaxX = (x - midX) / midX;
        const parallaxY = (y - midY) / midY;

        cardElement.style.setProperty('--parallax-x', parallaxX);
        cardElement.style.setProperty('--parallax-y', parallaxY);
        cardElement.style.setProperty('--parallax-rotate-x', `${parallaxY * -intensity}deg`);
        cardElement.style.setProperty('--parallax-rotate-y', `${parallaxX * intensity}deg`);
    };

    const handleMouseLeave = () => {
        cardElement.style.setProperty('--parallax-rotate-x', '0deg');
        cardElement.style.setProperty('--parallax-rotate-y', '0deg');
        cardElement.style.setProperty('--parallax-x', 0);
        cardElement.style.setProperty('--parallax-y', 0);
    };

    cardElement.addEventListener('mousemove', handleMouseMove);
    cardElement.addEventListener('mouseleave', handleMouseLeave);
}
