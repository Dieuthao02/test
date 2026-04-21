/* ============================================================
   QUẢN LÝ CHUYỂN TRANG
   ============================================================ */
function switchPage(pageId) {
    const hero = document.querySelector('.hero');
    const container = document.querySelector('.container');
    const detailPages = document.querySelectorAll('[id^="post-detail-"], [id^="offer-"]');

    if (pageId === 'home') {
        // Hiện trang chủ        if(hero) hero.style.display = 'block';
        if(container) container.style.display = 'block';

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
        setTimeout(renderCommentsForCurrentPage, 100);
    }
}

/* ==========================
   LOGIC MỞ VIDEO & TIKTOK 
   ========================== */

function openTikTokModal(videoId) {
    const modal = document.getElementById('tiktok-modal');
    const iframe = modal.querySelector('iframe'); 
    
    if(modal && iframe) {
  
        iframe.src = `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&loop=1&controls=1`;
        
        // Hiện Modal
        modal.style.display = 'flex';
        modal.classList.remove('hidden-page');
        
        console.log("Đang mở video ID:", videoId);
    }
}

/* ================
   HÀM ĐÓNG VIDEO
   ================*/
function closeTikTok() {
    const modal = document.getElementById('tiktok-modal');
    const iframe = modal.querySelector('iframe');
    
    if(modal && iframe) {
        modal.style.display = 'none';
        modal.classList.add('hidden-page');
        
        iframe.src = ""; 
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

    const tiktokCard = document.querySelector('[onclick="openTikTokModal()"]');
    if(tiktokCard) {
        tiktokCard.style.cursor = 'pointer';
    }
});

function closePost() { switchPage('home'); }

/* ======================
   2. HIỆU ỨNG SLIDER 3D 
   ====================== */
const slider = document.querySelector('.slider');
let isDragging = false;
let startX, currentRotateY = 0, tempRotateY = 0;
let autoRotateId; 

function startAutoRotate() {
    autoRotateId = setInterval(() => {
        currentRotateY -= 0.15; // Tốc độ quay 
        slider.style.transform = `rotateX(0deg) rotateY(${currentRotateY}deg)`;
    }, 20); 
}

startAutoRotate();

window.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    slider.style.transition = 'none';
    clearInterval(autoRotateId); 
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let moveX = e.clientX - startX;
    tempRotateY = currentRotateY + (moveX / 5); 
    slider.style.transform = `rotateX(0deg) rotateY(${tempRotateY}deg)`;
});

window.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        currentRotateY = tempRotateY;
        slider.style.transition = 'transform 0.5s ease-out';
        startAutoRotate(); 
    }
});

document.querySelectorAll('.item').forEach((item) => {
    item.addEventListener('click', function(e) {
        if (Math.abs(e.clientX - startX) < 5) {
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
                console.log("Đã bấm vào card!");
            }, 400);
        }
    });
});


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


/* =================
   4. HỆ THỐNG VOTE 
   ================= */
function handleVote(type) {
    const buttons = document.querySelectorAll('.vote-chip');
    buttons.forEach(btn => {
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'white';
        btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    });
    
    const clickedBtn = event.currentTarget;
    const activeColor = type === 'yes' ? 'var(--blue-pastel)' : 'var(--pink-pastel)';
    clickedBtn.style.backgroundColor = activeColor;
    clickedBtn.style.color = 'black';
    clickedBtn.style.borderColor = activeColor;
    
    localStorage.setItem(`vote_page`, type);
}

function loadSavedVote() {
    const savedVote = localStorage.getItem(`vote_page`);
    if (savedVote) {
        const buttons = document.querySelectorAll('.vote-chip');
        const targetText = savedVote === 'yes' ? 'Có' : 'Không';
        buttons.forEach(btn => {
            if (btn.innerText.trim() === targetText) {
                const activeColor = savedVote === 'yes' ? 'var(--blue-pastel)' : 'var(--pink-pastel)';
                btn.style.backgroundColor = activeColor;
                btn.style.color = 'black';
                btn.style.borderColor = activeColor;
            }
        });
    }
}
/* ====================
   HỆ THỐNG BÌNH LUẬN 
   ==================== */

function addComment() {
    const activePage = document.querySelector('[id^="post-detail-"]:not(.hidden-page), [id^="offer-"]:not(.hidden-page)');
    
    if (!activePage) {
   
        const pages = document.querySelectorAll('[id^="post-detail-"], [id^="offer-"]');
        pages.forEach(p => { if(p.style.display === 'block') activePage = p; });
    }

    if (!activePage) return console.error("Không xác định được trang đang mở");
    const category = activePage.id;

    const nameInput = activePage.querySelector('#user-name-input');
    const textInput = activePage.querySelector('#comment-input');

    if (!textInput || !textInput.value.trim()) return alert("Nhập nội dung đã bạn ơi!");

    const newComment = {
        id: Date.now(),
        category: category,
        name: (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : "Người dùng ẩn danh",
        text: textInput.value.trim(),
        time: new Date().toLocaleString('vi-VN', { hour12: false }).replace(',', '')
    };

    let allComments = JSON.parse(localStorage.getItem('elysium_db')) || [];
    allComments.unshift(newComment);
    localStorage.setItem('elysium_db', JSON.stringify(allComments));

    textInput.value = ''; 
    if(nameInput) nameInput.value = '';
    renderCommentsForCurrentPage();
}


function renderCommentsForCurrentPage() {
    const activePage = document.querySelector('[id^="post-detail-"]:not(.hidden-page), [id^="offer-"]:not(.hidden-page)');
    if (!activePage) return;

    const category = activePage.id;
    const list = activePage.querySelector('#comments-list');
    if (!list) return;

    const allComments = JSON.parse(localStorage.getItem('elysium_db')) || [];
    const filtered = allComments.filter(cmt => cmt.category === category);
    
    list.innerHTML = filtered.map(cmt => `
        <div class="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-4 hover:bg-white/[0.04] transition-all">
            <div class="flex justify-between items-start">
                <p class="text-xs font-black text-[var(--blue-pastel)]">${cmt.name} 
                    <span class="ml-2 font-normal text-gray-500 opacity-70">${cmt.time}</span>
                </p>
                
                <div class="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="toggleEdit(${cmt.id})" class="text-[10px] font-bold text-gray-400 hover:text-[var(--blue-pastel)]">SỬA</button>
                    <button onclick="deleteComment(${cmt.id})" class="text-[10px] font-bold text-gray-400 hover:text-[var(--pink-pastel)]">XÓA</button>
                </div>
            </div>
            
            <p id="text-${cmt.id}" class="text-sm text-gray-300 mt-2 outline-none focus:text-white">${cmt.text}</p>
        </div>
    `).join('');
}

function deleteComment(id) {
    if(confirm("Bạn muốn xóa bình luận này?")) {
        let allComments = JSON.parse(localStorage.getItem('elysium_db')) || [];
        allComments = allComments.filter(c => c.id !== id);
        localStorage.setItem('elysium_db', JSON.stringify(allComments));
        renderCommentsForCurrentPage(); // Vẽ lại giao diện
    }
}

function toggleEdit(id) {
    const textElem = document.getElementById(`text-${id}`);
    const isEditing = textElem.getAttribute('contenteditable') === 'true';

    if (!isEditing) {
        textElem.setAttribute('contenteditable', 'true');
        textElem.classList.add('border-b', 'border-[var(--blue-pastel)]');
        textElem.focus();
        event.target.innerText = 'LƯU';
    } else {
        const newText = textElem.innerText.trim();
        if (!newText) return alert("Không được để trống!");

        let allComments = JSON.parse(localStorage.getItem('elysium_db')) || [];
        const index = allComments.findIndex(c => c.id === id);
        
        if (index !== -1) {
            allComments[index].text = newText;

            if (!allComments[index].time.includes("(đã sửa)")) {
                allComments[index].time += " (đã sửa)";
            }
            localStorage.setItem('elysium_db', JSON.stringify(allComments));
        }

        textElem.setAttribute('contenteditable', 'false');
        textElem.classList.remove('border-b', 'border-[var(--blue-pastel)]');
        event.target.innerText = 'SỬA';
        renderCommentsForCurrentPage();
    }
}

function saveAndRender() {
    localStorage.setItem('elysium_comments', JSON.stringify(comments));
    renderComments();
}

