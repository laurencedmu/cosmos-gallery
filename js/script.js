import { projecten } from './projecten.js';

const cursorText = document.querySelector('.cursor-text');
const box = document.querySelector('.box');
const overlay = document.querySelector('.overlay');
const overlayImage = document.querySelector('.overlay-image');
const overlayDescription = document.querySelector('.overlay-description');
const infoText = document.querySelector('.box .info-text');
const overlayButton = document.querySelector('.overlay-button');

let cursorImg = null;
let klikIndex = 0;
let stopFotos = false;
let mouseX = 0, mouseY = 0;
let posX = 0, posY = 0;

const showCursorText = () => {
    cursorText.textContent = '( click here! )';
    cursorText.style.opacity = '1';
};

const hideCursorText = () => {
    cursorText.textContent = '';
    cursorText.style.opacity = '0';
};

const ensureCursorImg = src => {
    if (!cursorImg) {
        cursorImg = document.createElement('img');
        cursorImg.className = 'cursor-img';
        document.body.appendChild(cursorImg);
    }
    if (!stopFotos) cursorImg.src = src;
};

document.addEventListener('mousemove', e => {
    mouseX = e.pageX;
    mouseY = e.pageY;
    cursorText.style.left = `${mouseX + 70}px`;
    cursorText.style.top = `${mouseY - 10}px`;
});

document.addEventListener('click', e => {
    const boxRect = box.getBoundingClientRect();
    if (mouseX >= boxRect.left && mouseX <= boxRect.right &&
        mouseY >= boxRect.top && mouseY <= boxRect.bottom) return;

    if (e.target.classList.contains('projecten') && stopFotos) {
        const clickedFoto = e.target;
        const project = projecten.find(p => clickedFoto.src.includes(p.src.split('/').pop()));

        overlayImage.src = project?.detail || clickedFoto.src;
        overlayImage.dataset.naam = project?.naam || 'download';
        overlayDescription.textContent = project?.description || '';

        document.querySelectorAll('.projecten')
            .forEach(img => img !== clickedFoto ? img.style.opacity = '0' : img.style.zIndex = 'auto');

        overlay.classList.add('show');
        return;
    }

    if (stopFotos) return;

    const foto = document.createElement('img');
    foto.src = projecten[klikIndex].src;
    foto.className = 'projecten show';
    foto.dataset.naam = projecten[klikIndex].naam;
    Object.assign(foto.style, {
        left: `${mouseX}px`,
        top: `${mouseY}px`,
        position: 'absolute',
        opacity: '1',
        transition: 'opacity 0.4s ease'
    });
    document.body.appendChild(foto);

    klikIndex = (klikIndex + 1) % projecten.length;
    ensureCursorImg(projecten[klikIndex].src);

    if (klikIndex === 1) hideCursorText();
});

overlay.addEventListener('click', () => {
    overlay.classList.remove('show');
    document.querySelectorAll('.projecten').forEach(img => {
        img.style.opacity = '1';
        img.style.zIndex = 'auto';
    });
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        stopFotos = true;
        hideCursorText();
        if (cursorImg) cursorImg.style.opacity = '0';
        document.body.style.cursor = 'pointer';
        infoText.textContent = 'space bar to place';
    }
    if (e.code === 'Space') {
        stopFotos = false;
        document.body.style.cursor = 'none';
        if (klikIndex === 0) showCursorText();
        if (cursorImg) cursorImg.style.opacity = '1';
        infoText.textContent = 'esc key to view';
    }
});

const animateCursor = () => {
    if (cursorImg && !stopFotos) {
        posX += (mouseX - posX) * 0.28;
        posY += (mouseY - posY) * 0.28;
        cursorImg.style.left = `${posX}px`;
        cursorImg.style.top = `${posY}px`;
    }
    requestAnimationFrame(animateCursor);
};
animateCursor();

if (box) {
    box.addEventListener('mouseenter', () => {
        document.querySelectorAll('.projecten').forEach(img => img.style.opacity = '0');
        cursorText.style.opacity = '0';
        if (cursorImg) cursorImg.style.opacity = '0';
    });
    box.addEventListener('mouseleave', () => {
        document.querySelectorAll('.projecten').forEach(img => img.style.opacity = '1');
        if (!stopFotos && klikIndex === 0) cursorText.style.opacity = '1';
        if (!stopFotos && cursorImg) cursorImg.style.opacity = '1';
    });
}

overlayButton.addEventListener('click', () => {
    if (!overlay.classList.contains('show') || !overlayImage.src) return;
    const link = document.createElement('a');
    link.href = overlayImage.src;
    link.download = overlayImage.dataset.naam || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

window.addEventListener('DOMContentLoaded', () => {
    document.body.style.cursor = 'none';
    ensureCursorImg(projecten[0].src);
    showCursorText();
    if (box) box.classList.add('show');
    cursorText.classList.add('show');
    infoText.textContent = 'esc key to view';
});
