const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

let stars = [];
const numStars = 200;
const velocity = 0.05;

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function generateStars() {
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            vx: Math.random() * velocity * 2 - velocity,
            vy: Math.random() * velocity * 2 - velocity,
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    stars.forEach(star => {
        ctx.moveTo(star.x, star.y);
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    });
    ctx.fill();
}

function update() {
    const isSpeedActive = canvas.classList.contains('speed-lines-active');

    stars.forEach(star => {
        if (isSpeedActive) {
            // Speed Lines Effect: Stars streak horizontally
            star.x -= star.radius * 5;
        } else {
            // Normal Effect: Stars drift slowly
            star.x += star.vx;
            star.y += star.vy;
        }

        // Wrap stars around the screen
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width && !isSpeedActive) star.x = 0; // Prevent wrapping when streaking
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
    });
}

function animate() {
    draw();
    update();
    requestAnimationFrame(animate);
}

export function initBackgroundAnimation() {
    setCanvasSize();
    generateStars();
    animate();
    window.addEventListener('resize', () => {
        setCanvasSize();
    });
}
