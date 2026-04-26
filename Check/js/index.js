const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbx3vQyakJkFfJxkP5XAQ8fQkjmt5lnls2n4N3zjrEUL4JxYIzMumbGmPIZwOTzbjgO-OA/exec';
let allEventsData = [];

function parseEventDate(dateStr) {
    if (!dateStr) return null;
    const match = dateStr.match(/(\d{1,2})\s+tháng\s+(\d{1,2}),\s+(\d{4})/i);
    if (match) return new Date(match[3], match[2] - 1, match[1]);
    const slashMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) return new Date(slashMatch[3], slashMatch[2] - 1, slashMatch[1]);
    return new Date(dateStr);
}

function formatMinPrice(priceStr) {
    if (!priceStr || priceStr.toLowerCase().includes("miễn phí")) return "Miễn phí";
    const prices = priceStr.toString().replace(/\./g, '').match(/\d{4,}/g);
    if (!prices) return "Liên hệ";
    const minPrice = Math.min(...prices.map(Number));
    return `Từ ${new Intl.NumberFormat('vi-VN').format(minPrice)}đ`;
}

function displayUpcomingEvents(events) {
    const grid = document.getElementById('upcoming-events-grid');
    if (!grid) return;
    const top4 = events.slice(0, 4);

    grid.innerHTML = top4.map(event => {
        const isHot = event.hasDiagram === "TRUE" || event.hasDiagram === true;
        return `
            <a href="detail.html?id=${event.id}" class="event-card group block">
                <div class="relative aspect-video overflow-hidden rounded-xl bg-gray-200">
                    <img src="${event.eventImage || 'https://via.placeholder.com/400x225'}" 
                         class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                         onerror="this.src='https://via.placeholder.com/400x225'">
                    <div class="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-lg text-[10px] font-black text-pink-500 uppercase">
                        ${event.category || 'Sự kiện'}
                    </div>
                    ${isHot ? `<div class="absolute top-3 right-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">HOT</div>` : ''}
                </div>
                <div class="p-4 space-y-2">
                    <p class="font-black text-gray-800 text-sm line-clamp-2 group-hover:text-pink-500 transition h-10">
                        ${event.eventName}
                    </p>
                    <div class="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <i class="fa-regular fa-calendar text-pink-400"></i> ${event.time || 'Đang cập nhật'}
                    </div>
                    <div class="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <i class="fa-solid fa-location-dot text-blue-400"></i> 
                        <span class="truncate">${event.location || 'Đang cập nhật'}</span>
                    </div>
                    <div class="flex items-center justify-between pt-1">
                        <span class="text-sm font-black text-[#F33B26]">${formatMinPrice(event.priceList)}</span>
                        <span class="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">Còn vé</span>
                    </div>
                </div>
            </a>`;
    }).join('');
}

// --- LOGIC XỬ LÝ DỮ LIỆU ---
async function loadEvents() {
    try {
        const response = await fetch(SHEET_API_URL);
        const data = await response.json();
        allEventsData = data;
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const specialEvents = data
            .filter(e => (e.hasDiagram === "TRUE" || e.hasDiagram === true))
            .sort((a, b) => b.id - a.id) 
            .slice(0, 4);

        const upcomingEvents = data
            .filter(e => {
                const eventDate = parseEventDate(e.time);
                return eventDate && eventDate >= now;
            })
            .sort((a, b) => {
                const dateA = parseEventDate(a.time);
                const dateB = parseEventDate(b.time);
                if (dateA - dateB !== 0) return dateA - dateB;
                return b.id - a.id;
            });
         
        renderFreeEvents(data);
        renderSpecialEvents(data.filter(e => e.hasDiagram === "TRUE" || e.hasDiagram === true).slice(0,4));
        renderUpcomingGrid(data.filter(e => parseEventDate(e.time) >= now).slice(0, 8));
        updateSearchSuggestions(data.slice(0, 3));

    } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
    }
}

function renderSpecialEvents(events) {
    const wrapper = document.getElementById('special-events-wrapper');
    if (!wrapper || events.length === 0) return;

    wrapper.innerHTML = events.map(event => `
        <div class="swiper-slide">
            <a href="detail.html?id=${event.id}" class="group relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-video bg-gray-200 block transition-all">
                <img src="${event.eventImage || 'https://via.placeholder.com/800x450'}" 
                     class="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                     onerror="this.src='https://via.placeholder.com/800x450'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                <div class="absolute bottom-6 left-6 text-white pr-20">
                    <div class="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">
                        <i class="fa-solid fa-star text-yellow-400 mr-1"></i> ${event.time.split(',')[1] || event.time}
                    </div>
                    <h4 class="text-xl md:text-2xl font-black uppercase line-clamp-1 group-hover:text-pink-400 transition">${event.eventName}</h4>
                </div>
                <div class="absolute bottom-6 right-6 scale-90 group-hover:scale-100 transition duration-300">
                    <span class="bg-white/90 px-5 py-2.5 rounded-xl font-black text-xs shadow-xl text-gray-800 uppercase">Xem ngay</span>
                </div>
            </a>
        </div>
    `).join('');

    new Swiper(".specialSwiper", {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: events.length > 2, 
        navigation: {
            nextEl: ".swiper-next-btn",
            prevEl: ".swiper-prev-btn",
        },
        breakpoints: {
            768: {
                slidesPerView: 2, 
            }
        }
    });
}

function renderUpcomingGrid(events) {
    const grid = document.getElementById('upcoming-events-grid');
    if (!grid) return;

    grid.innerHTML = events.map(event => {
        const isHot = event.hasDiagram === "TRUE" || event.hasDiagram === true;
        return `
            <a href="detail.html?id=${event.id}" class="event-card group block bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition duration-300">
                <div class="relative aspect-video overflow-hidden bg-gray-200">
                    <img src="${event.eventImage || 'https://via.placeholder.com/400x225'}" 
                         class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    <div class="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-lg text-[10px] font-black text-pink-500 uppercase">
                        ${event.category || 'Sự kiện'}
                    </div>
                    ${isHot ? `<div class="absolute top-3 right-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-bounce">HOT</div>` : ''}
                </div>
                <div class="p-4 space-y-2">
                    <p class="font-black text-gray-800 text-sm line-clamp-2 group-hover:text-pink-500 transition h-10">
                        ${event.eventName}
                    </p>
                    <div class="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                        <i class="fa-regular fa-calendar text-pink-400"></i> ${event.time}
                    </div>
                    <div class="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                        <i class="fa-solid fa-location-dot text-blue-400"></i> 
                        <span class="truncate">${event.location}</span>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                        <span class="text-sm font-black text-[#F33B26]">${formatMinPrice(event.priceList)}</span>
                        <span class="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">Còn vé</span>
                    </div>
                </div>
            </a>`;
    }).join('');
}

function renderFreeEvents(events) {
    const freeListContainer = document.querySelector('section.space-y-6.mb-16 .space-y-3');
    if (!freeListContainer) return;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const freeEvents = events.filter(e => 
        e.priceList && e.priceList.toLowerCase().includes("miễn phí")
    );

    freeEvents.sort((a, b) => {
        const dateA = parseEventDate(a.time);
        const dateB = parseEventDate(b.time);
        
        const isPastA = dateA < now;
        const isPastB = dateB < now;

        if (isPastA !== isPastB) return isPastA ? 1 : -1; 
        return dateA - dateB; 
    });

    const top3Free = freeEvents.slice(0, 3);

    if (top3Free.length === 0) {
        freeListContainer.innerHTML = '<p class="text-gray-400 text-center py-4">Hiện chưa có sự kiện miễn phí mới.</p>';
        return;
    }

    freeListContainer.innerHTML = top3Free.map(event => `
        <a href="detail.html?id=${event.id}" class="group flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all">
            <div class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img src="${event.eventImage || 'https://via.placeholder.com/100'}" 
                     class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/100'">
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-black text-gray-800 text-sm group-hover:text-pink-500 transition truncate">
                    ${event.eventName}
                </p>
                <p class="text-xs text-gray-400 mt-0.5">
                    📅 ${event.time.split(',')[1] || event.time} · 📍 ${event.location || 'Đang cập nhật'}
                </p>
            </div>
            <span class="text-xs font-black text-green-500 bg-green-50 px-3 py-1 rounded-full flex-shrink-0">Miễn phí</span>
        </a>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

function switchSearchTab(tab) {
    const isGenre = tab === 'genre';
    const activeTab = document.getElementById(isGenre ? 'tab-genre' : 'tab-city');
    const inactiveTab = document.getElementById(isGenre ? 'tab-city' : 'tab-genre');

    activeTab.classList.remove('text-white/60', 'text-gray-400', 'border-transparent');
    activeTab.classList.add('text-white', 'border-white');

    inactiveTab.classList.remove('text-white', 'border-white');
    inactiveTab.classList.add('text-white/60', 'border-transparent');

    document.getElementById('panel-genre').classList.toggle('hidden', !isGenre);
    document.getElementById('panel-city').classList.toggle('hidden', isGenre);
}

function searchBy(v){document.getElementById('search-input').value=v;document.getElementById('search-suggestions').classList.add('hidden')}

const si = document.getElementById('search-input');
const sg = document.getElementById('search-suggestions');

si.addEventListener('focus', () => {
    sg.classList.remove('hidden');
});

document.addEventListener('click', (e) => {
    if (!si.contains(e.target) && !sg.contains(e.target)) {
        sg.classList.add('hidden');
    }
});

si.addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    const lr = document.getElementById('live-results');
    const tb = document.getElementById('trending-list');

    if (q.length > 0) {
        tb.classList.add('hidden');
        lr.classList.remove('hidden');

        const matches = allEventsData.filter(e => 
            e.eventName.toLowerCase().includes(q) || 
            (e.category && e.category.toLowerCase().includes(q))
        );

        if (matches.length > 0) {
            lr.innerHTML = `
                <div class="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">KẾT QUẢ TÌM KIẾM</div>
                ${matches.slice(0, 5).map(e => {
                    const regex = new RegExp(`(${q})`, 'gi');
                    const highlight = e.eventName.replace(regex, '<span class="text-pink-500 font-black">$1</span>');
                    return `
                        <a href="detail.html?id=${e.id}" class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 transition group">
                            <i class="fa-solid fa-magnifying-glass text-gray-500 text-sm w-4"></i>
                            <span class="text-sm text-gray-200 group-hover:text-white">${highlight}</span>
                        </a>
                    `;
                }).join('')}
            `;
        } else {
            lr.innerHTML = '<div class="text-gray-500 text-sm text-center py-4 italic">Không tìm thấy sự kiện nào...</div>';
        }
    } else {
        tb.classList.remove('hidden');
        lr.classList.add('hidden');
    }
});

document.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        si.value = value;
        doSearch(); 
    });
});

function doSearch() {
    const v = si.value.trim().toLowerCase();
    if (!v) return;

    const sections = {
        "miễn phí": "free-events-section", 
        "dac biet": "special-events-section",
        "đặc biệt": "special-events-section",
        "sap dien ra": "upcoming-events-grid",
        "sắp diễn ra": "upcoming-events-grid"
    };

    if (sections[v]) {
        const targetElement = document.getElementById(sections[v]);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return; 
        }
    }

    window.location.href = `events.html?search=${encodeURIComponent(v)}`;
}

si.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doSearch();
});

function updateSearchSuggestions(events) {
    const grid = document.getElementById('search-suggestions-grid');
    if (!grid) return;

    grid.innerHTML = events.map(e => `
        <a href="detail.html?id=${e.id}" class="group block">
            <div class="aspect-video rounded-lg overflow-hidden mb-2 bg-gray-800">
                <img src="${e.eventImage}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
            </div>
            <p class="text-[11px] text-white font-bold line-clamp-1 group-hover:text-pink-500">${e.eventName}</p>
        </a>
    `).join('');
}

const locationBtn = document.getElementById('location-btn');
const locationDropdown = document.getElementById('location-dropdown');
const locationText = document.getElementById('location-text');

locationBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    locationDropdown.classList.toggle('hidden');
});


document.querySelectorAll('.location-option').forEach(option => {
    option.addEventListener('click', function(e) {
        e.stopPropagation();
        const city = this.getAttribute('data-city');
        
        locationText.textContent = city;
        
        document.querySelectorAll('.location-option i').forEach(icon => {
            icon.classList.remove('text-pink-400');
            icon.classList.add('text-gray-300');
        });
        this.querySelector('i').classList.remove('text-gray-300');
        this.querySelector('i').classList.add('text-pink-400');

        locationDropdown.classList.add('hidden');

        if (city === "Toàn quốc") {
            window.location.href = "events.html";
        } else {
            window.location.href = `events.html?location=${encodeURIComponent(city)}`;
        }
    });
});

document.addEventListener('click', () => {
    locationDropdown.classList.add('hidden');
});


document.addEventListener('click',e=>{if(!si.contains(e.target)&&!sg.contains(e.target))sg.classList.add('hidden')});
document.querySelectorAll('.suggestion-tag').forEach(t=>t.addEventListener('click',()=>{si.value=t.textContent.replace('#','');sg.classList.add('hidden')}));
