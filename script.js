/* ==========================================================================
   INTERACTIVE CANVAS & PDF EXPORT LOGIC - MAHAMOUDOU HOULDIA CV
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initSpacePhysicsCanvas();
  initGridToggle();
});

/* --- Space Physics & Constellation Canvas --- */
function initSpacePhysicsCanvas() {
  const canvas = document.getElementById('space-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Particle Generation
  const particleCount = Math.floor((width * height) / 14000);
  const particles = [];
  const mouse = { x: null, y: null, radius: 150 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.size = Math.random() * 2 + 0.8;
      this.color = Math.random() > 0.3 ? '#38bdf8' : (Math.random() > 0.5 ? '#7c3aed' : '#fbbf24');
      this.alpha = Math.random() * 0.7 + 0.3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Mouse attraction / repulsion force
      if (mouse.x && mouse.y) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw faint constellation physics lines between close particles
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          const alpha = (1 - dist / 110) * 0.25;
          ctx.save();
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* --- Interactive Grid Paper Toggle --- */
function initGridToggle() {
  const toggleBtn = document.getElementById('toggle-grid-btn');
  const gridTexture = document.querySelector('.paper-grid-texture');

  if (toggleBtn && gridTexture) {
    let active = true;
    toggleBtn.addEventListener('click', () => {
      active = !active;
      gridTexture.style.opacity = active ? '0.85' : '0.1';
      toggleBtn.classList.toggle('active', !active);
    });
  }
}

/* --- 1-Click PDF Export Functionality --- */
function exportPDF() {
  const element = document.getElementById('cv-document');
  const downloadBtn = document.getElementById('download-pdf-btn');

  if (!element) return;

  // Visual feedback during generation
  const originalText = downloadBtn ? downloadBtn.innerHTML : '';
  if (downloadBtn) {
    downloadBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Génération PDF...`;
    downloadBtn.disabled = true;
  }

  // Options configuration for html2pdf
  const opt = {
    margin: [10, 10, 10, 10], // mm
    filename: 'CV_MAHAMOUDOU_Houldia_BTS_Assurance_Physique_Maths.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      letterRendering: true,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  // Run html2pdf
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      if (downloadBtn) {
        downloadBtn.innerHTML = `<i class="fa-solid fa-check"></i> Téléchargé !`;
        setTimeout(() => {
          downloadBtn.innerHTML = originalText;
          downloadBtn.disabled = false;
        }, 3000);
      }
    })
    .catch((err) => {
      console.error('Erreur export PDF:', err);
      if (downloadBtn) {
        downloadBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Erreur! Imprimer (Ctrl+P)`;
        setTimeout(() => {
          downloadBtn.innerHTML = originalText;
          downloadBtn.disabled = false;
        }, 3000);
      }
    });
}
