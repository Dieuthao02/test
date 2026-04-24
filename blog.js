/* ============================================================
   QUẢN LÝ CHUYỂN TRANG
   ============================================================ */
function switchPage(pageId) {
    const hero = document.querySelector('.hero');
    const container = document.querySelector('.container');
    const detailPages = document.querySelectorAll('[id^="post-detail-"], [id^="offer-"]');

    if (pageId === 'home') {
        if(container) container.style.display = 'block';
        if(hero) hero.style.display = 'block';

        detailPages.forEach(page => {
            page.classList.add('hidden-page');
            page.style.display = 'none';
        });
        
        localStorage.setItem('currentPage', 'home');
    } else {
        const targetPage = document.getElementById(pageId);
        if (targetPage) {

            if(hero) hero.style.display = 'none';
            if(container) container.style.display = 'none';
            
            detailPages.forEach(page => {
                 page.classList.add('hidden-page');
                 page.style.display = 'none';
            });

            targetPage.classList.remove('hidden-page');
            targetPage.style.display = 'block';
            
            localStorage.setItem('currentPage', pageId);
            window.scrollTo(0, 0);
        } else {
            console.error("Lỗi: Không tìm thấy ID bài viết ->", pageId);
        }
    }
}

/* =======================
   KHỞI TẠO KHI TẢI TRANG
   ======================= */
document.addEventListener('DOMContentLoaded', () => {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    switchPage('home');
    window.scrollTo(0, 0);

});

function closePost() { switchPage('home'); }

/* ===================
   3. HERO SLIDESHOW 
   =================== */
let currentHeroIndex = 0;
const slides = document.querySelectorAll('.hero-item');
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentHeroIndex = index;
}

function currentSlide(index) { showSlide(index); }

setInterval(() => {
    currentHeroIndex = (currentHeroIndex + 1) % slides.length;
    showSlide(currentHeroIndex);
}, 5000);

