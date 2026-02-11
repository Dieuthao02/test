
const cursor = document.querySelector('.cursor');
const trails = [];
const trailCount = 12;

for (let i = 0; i < trailCount; i++) {
    const t = document.createElement('div');
    t.className = 'cursor-trail';
    document.body.appendChild(t);
    trails.push({ el: t, x: 0, y: 0 });
}

let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

function animate() {
    let x = mouseX;
    let y = mouseY;

    trails.forEach((trail, index) => {
        trail.x += (x - trail.x) * 0.3;
        trail.y += (y - trail.y) * 0.3;
        trail.el.style.left = trail.x + 'px';
        trail.el.style.top = trail.y + 'px';

        x = trail.x;
        y = trail.y;
    });

    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';

    requestAnimationFrame(animate);
}

animate();






document.addEventListener('mousemove', e => {
    const p = document.createElement('span');
    p.style.position = 'fixed';
    p.style.left = e.clientX + 'px';
    p.style.top = e.clientY + 'px';
    p.style.width = '6px';
    p.style.height = '6px';
    p.style.borderRadius = '50%';
    p.style.background = 'rgba(0,255,136,0.6)';
    p.style.pointerEvents = 'none';
    p.style.zIndex = 9997;
    document.body.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 30;

    p.animate([
        { transform: 'translate(0,0)', opacity: 1 },
        { transform: `translate(${Math.cos(angle)*distance}px, ${Math.sin(angle)*distance}px)`, opacity: 0 }
    ], {
        duration: 600,
        easing: 'ease-out'
    });

    setTimeout(() => p.remove(), 600);
});







document.addEventListener('mousemove', e=>{
  cursor.style.left = e.clientX+'px';
  cursor.style.top  = e.clientY+'px';
});

document.querySelectorAll('.section').forEach(sec=>{
  sec.addEventListener('mouseenter', ()=>{
    const c = getComputedStyle(sec).getPropertyValue('--cursor-color');
    cursor.style.setProperty('--cursor-color', c.trim());
  });
});

const hovers = document.querySelectorAll('a, button, .card');
hovers.forEach(el=>{
  el.addEventListener('mouseenter', ()=> cursor.classList.add('active','hover'));
  el.addEventListener('mouseleave', ()=> cursor.classList.remove('hover'));
});

document.addEventListener('click', e=>{
  const r = document.createElement('div');
  r.className = 'cursor-ripple';
  r.style.left = e.clientX+'px';
  r.style.top  = e.clientY+'px';
  document.body.appendChild(r);
  setTimeout(()=>r.remove(), 500);
});

let enabled = !matchMedia('(pointer: coarse)').matches; // tắt trên mobile
document.body.style.cursor = enabled ? 'none' : 'auto';
cursor.style.display = enabled ? 'block' : 'none';

document.getElementById('toggleCursor').onclick = ()=>{
  enabled = !enabled;
  cursor.style.display = enabled ? 'block' : 'none';
  document.body.style.cursor = enabled ? 'none' : 'auto';
};




const form = document.querySelector(".contact-form");

form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const data = new FormData(form);

    await fetch(form.action, {
        method: form.method,
        body: data,
        headers: { 'Accept': 'application/json' }
    });

    form.innerHTML = "<h3 style='color:#00ff88'>Message Sent ✨</h3>";
});
