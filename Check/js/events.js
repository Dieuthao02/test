const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbx3vQyakJkFfJxkP5XAQ8fQkjmt5lnls2n4N3zjrEUL4JxYIzMumbGmPIZwOTzbjgO-OA/exec';
let allEvents = [];

async function fetchEvents() {
    try {
        const response = await fetch(SHEET_API_URL);
        const data = await response.json();
        
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Đặt về đầu ngày để so sánh chính xác theo ngày

        allEvents = data.sort((a, b) => {
            const dateA = parseDate(a.time);
            const dateB = parseDate(b.time);
            
            // Kiểm tra trạng thái HOT (dựa trên hasDiagram như logic Card của bạn)
            const isHotA = a.hasDiagram === "TRUE" || a.hasDiagram === true;
            const isHotB = b.hasDiagram === "TRUE" || b.hasDiagram === true;

            // Kiểm tra xem sự kiện đã qua chưa
            const isPastA = dateA && dateA < now;
            const isPastB = dateB && dateB < now;

            // --- BẮT ĐẦU LOGIC ƯU TIÊN ---

            // 1. Ưu tiên theo trạng thái "Đã qua": Sự kiện chưa diễn ra luôn đứng trước sự kiện đã qua
            if (isPastA !== isPastB) {
                return isPastA ? 1 : -1;
            }

            // 2. Nếu cả 2 đều CHƯA diễn ra:
            if (!isPastA && !isPastB) {
                // Ưu tiên HOT lên trước
                if (isHotA !== isHotB) {
                    return isHotA ? -1 : 1;
                }
                // Nếu cùng HOT hoặc cùng không HOT: Cái nào gần ngày hiện tại hơn xếp trước
                return dateA - dateB;
            }

            // 3. Nếu cả 2 đều ĐÃ diễn ra:
            // Cái nào mới diễn ra gần đây nhất (mới qua) thì xếp trên các cái đã qua lâu rồi
            return dateB - dateA;
        });

        renderEvents(allEvents);
        document.getElementById('loading').classList.add('hidden');
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        document.getElementById('loading').innerHTML = "Lỗi tải dữ liệu!";
    }
}

function renderEvents(events) {
    const grid = document.getElementById('eventGrid');
    if (!grid) return;
    grid.innerHTML = ''; 
   

    events.forEach(event => {
        const id = event.id;
        const name = event.eventName || "Tên sự kiện";
        const img = event.eventImage || "https://via.placeholder.com/400x250";
        const time = event.time || "Đang cập nhật";
        const loc = event.location || "Đang cập nhật";
        const isHot = event.hasDiagram === "TRUE" || event.hasDiagram === true;

        const rawPrice = getMinPrice(event.priceList);
        let displayPrice = "";
        if (typeof rawPrice === 'number') {
    
            displayPrice = "Từ " + formatCurrency(rawPrice);
        } else {
            displayPrice = rawPrice;
        }

        const card = `
            <div onclick="goToDetail('${event.id}')" class="bg-white rounded-2xl overflow-hidden shadow-sm card-hover transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col">
                <div class="relative h-48 overflow-hidden">
                    <img src="${img}" class="w-full h-full object-cover" alt="${name}" onerror="this.src='https://via.placeholder.com/400x250'">
                    ${isHot ? '<span class="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">HOT</span>' : ''}
                </div>
                <div class="p-5 flex-grow flex flex-col">
                    <h3 class="font-bold text-gray-900 text-lg mb-2 line-clamp-2 h-14">${name}</h3>
                    <div class="text-sm text-gray-500 space-y-2 mb-4">
                        <p class="flex items-start"><i class="fa-regular fa-calendar-check mt-1 mr-2"></i><span>${time}</span></p>
                        <p class="flex items-start"><i class="fa-solid fa-location-dot mt-1 mr-2"></i><span>${loc}</span></p>
                    </div>
                    <div class="mt-auto flex justify-between items-center border-t pt-4">
                        <span class="text-red-500 font-bold text-lg">${displayPrice}</span>
                        <button onclick="event.stopPropagation(); goToDetail('${event.id}')" 
                        class="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-600 hover:text-white transition-colors">
                    Mua vé
                </button>
                    </div>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', card);
    });
}

function goToDetail(id) {
    if (!id) {
        console.error("Không tìm thấy ID của sự kiện này!");
        return;
    }
    window.location.href = `detail.html?id=${id}`;
}

function getMinPrice(priceString) {
    if (!priceString || priceString.toString().toLowerCase().includes("miễn phí")) return "Miễn phí";
    const prices = priceString.toString().replace(/\./g, '').match(/\d{4,}/g);

    if (!prices || prices.length === 0) {
        const zeros = priceString.toString().match(/\b0\b/);
        return zeros ? "Miễn phí" : "Liên hệ";
    }

    const minPrice = Math.min(...prices.map(Number));

    return minPrice;
}

function filterCategory(category) {
    document.getElementById('categoryTitle').innerText = category === 'all' ? 'Tất cả sự kiện' : category;
    
    if (category === 'all') {
        renderEvents(allEvents);
    } else {
        const filtered = allEvents.filter(e => {
            if (!e.category) return false;
            
            const sheetCat = e.category.toString().trim().toLowerCase();
            const targetCat = category.toString().trim().toLowerCase();
            
            return sheetCat === targetCat;
        });
        renderEvents(filtered);
    }
}

function formatCurrency(value) {
    if (isNaN(value)) return value;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace('₫', 'đ');
}

fetchEvents();

function toggleDropdown(id) {
    const target = document.getElementById(id);
    const isShowing = !target.classList.contains('hidden');
    
    document.getElementById('dropdownDate').classList.add('hidden');
    document.getElementById('dropdownMain').classList.add('hidden');
    
    if (!isShowing) target.classList.remove('hidden');
}

function setDateFilter(type) {
    const labels = { 'today': 'Hôm nay', 'weekend': 'Cuối tuần này', 'month': 'Tháng này', 'all': 'Tất cả các ngày' };
    document.getElementById('dateLabel').innerText = labels[type];
    applyTicketboxFilters();
    document.getElementById('dropdownDate').classList.add('hidden');
}

function applyTicketboxFilters() {
    const locValue = document.querySelector('input[name="loc"]:checked').value;
    const isFreeOnly = document.getElementById('checkFree').checked;

    let filtered = allEvents;

    if (locValue !== 'all') {
        filtered = filtered.filter(e => e.location?.includes(locValue));
    }

    if (isFreeOnly) {
        filtered = filtered.filter(e => getMinPrice(e.priceList) === "Miễn phí");
    }

    renderEvents(filtered);
    document.getElementById('dropdownMain').classList.add('hidden');
}

function resetAllFilters() {
    document.querySelector('input[name="loc"][value="all"]').checked = true;
    document.getElementById('checkFree').checked = false;
    document.getElementById('dateLabel').innerText = 'Tất cả các ngày';
    renderEvents(allEvents);
    document.getElementById('dropdownMain').classList.add('hidden');
}

window.addEventListener('click', function(e) {
    if (!e.target.closest('.relative')) {
        document.getElementById('dropdownDate').classList.add('hidden');
        document.getElementById('dropdownMain').classList.add('hidden');
    }
});

let datePicker;
let selectedDates = [];

function initCalendar() {
    const container = document.getElementById('calendarContainer');
    if (!container) return; 

    datePicker = flatpickr("#dateRangeInput", {
        mode: "range",
        inline: true,
        dateFormat: "d/m/Y",
        appendTo: container,
        onChange: function(dates) {
            selectedDates = dates;
            applyDateFilter();
        }
    });
}

window.onload = initCalendar;

function applyDateFilter() {
    if (!selectedDates || selectedDates.length === 0) {
        renderEvents(allEvents);
        document.getElementById('dateLabel').innerText = 'Tất cả các ngày';
        return;
    }

    const startDate = new Date(selectedDates[0]);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = selectedDates[1] ? new Date(selectedDates[1]) : new Date(selectedDates[0]);
    endDate.setHours(23, 59, 59, 999);

    const filtered = allEvents.filter(event => {
        const eventDate = parseDate(event.time); 
        if (!eventDate) return false;
        return eventDate >= startDate && eventDate <= endDate;
    });

    renderEvents(filtered);
    const label = selectedDates.length === 2 
        ? `${flatpickr.formatDate(startDate, "d/m")} - ${flatpickr.formatDate(endDate, "d/m")}`
        : flatpickr.formatDate(startDate, "d/m/Y");
    document.getElementById('dateLabel').innerText = label;
}

function parseDate(dateStr) {
    if (!dateStr) return null;

    const monthTextMatch = dateStr.match(/(\d{1,2})\s+tháng\s+(\d{1,2}),\s+(\d{4})/i);
    if (monthTextMatch) {
        const day = parseInt(monthTextMatch[1]);
        const month = parseInt(monthTextMatch[2]) - 1; 
        const year = parseInt(monthTextMatch[3]);
        return new Date(year, month, day);
    }

    const slashMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
        return new Date(slashMatch[3], slashMatch[2] - 1, slashMatch[1]);
    }

    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) {
        return isoDate;
    }

    return null;
}

function toggleHeaderMenu() {
    const menu = document.getElementById('header-user-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

document.addEventListener('click', (e) => {
    const wrap = document.getElementById('header-avatar-wrap');
    const menu = document.getElementById('header-user-menu');
    if (wrap && !wrap.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

function renderSearchSuggestions() {
    const hotItems = eventsData.filter(e => e.hot).slice(0, 3);
    const grid = document.getElementById('search-suggestions-grid');
    if (!grid) return;
    grid.innerHTML = hotItems.map(e => `
        <div class="flex gap-3 group cursor-pointer" onclick="openTicketModal('${e.title.replace(/'/g,"\\'")}')">
            <img src="${e.img || 'https://via.placeholder.com/72x48/FFDEE9/555?text=E'}"
                 class="w-18 h-12 rounded-lg object-cover flex-shrink-0"
                 style="width:72px;height:48px"
                 onerror="this.src='https://via.placeholder.com/72x48/FFDEE9/555?text=E'">
            <div class="min-w-0">
                <p class="text-xs font-bold text-gray-200 group-hover:text-white transition line-clamp-2 leading-tight">${e.title}</p>
                <p class="text-[10px] text-pink-400 font-bold mt-1">Từ ${e.price}</p>
                <p class="text-[10px] text-gray-500">${e.date}</p>
            </div>
        </div>
    `).join('');
}

// ===== SEARCH TABS =====
function switchSearchTab(tab) {
    const isGenre = tab === 'genre';
    document.getElementById('tab-genre').className = `pb-2 text-sm font-black border-b-2 transition ${isGenre ? 'text-white border-white' : 'text-gray-400 border-transparent hover:text-white'}`;
    document.getElementById('tab-city').className  = `pb-2 text-sm font-black border-b-2 transition ${!isGenre ? 'text-white border-white' : 'text-gray-400 border-transparent hover:text-white'}`;
    document.getElementById('panel-genre').classList.toggle('hidden', !isGenre);
    document.getElementById('panel-city').classList.toggle('hidden', isGenre);
}

// ===== SEARCH SUGGESTIONS =====
const searchInput = document.getElementById('search-input');
const suggestions = document.getElementById('search-suggestions');
searchInput.addEventListener('focus', () => { suggestions.classList.remove('hidden'); });
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.classList.add('hidden');
    }
});

// ===== LOCATION DROPDOWN =====
const locationBtn = document.getElementById('location-btn');
const locationDropdown = document.getElementById('location-dropdown');
const locationText = document.getElementById('location-text');
locationBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    locationDropdown.classList.toggle('hidden');
});
document.querySelectorAll('.location-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
        e.stopPropagation();
        locationText.textContent = opt.dataset.city;
        document.querySelectorAll('.location-option i').forEach(i => i.className = 'fa-solid fa-circle text-[6px] text-gray-300');
        opt.querySelector('i').className = 'fa-solid fa-circle text-[6px] text-pink-400';
        locationDropdown.classList.add('hidden');
    });
});
document.addEventListener('click', () => locationDropdown.classList.add('hidden'));

// ===== LIVE SEARCH =====
searchInput.addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    const trendingSection = document.getElementById('trending-list').parentElement;
    const liveResults = document.getElementById('live-results');
    if (q.length > 0) {
        trendingSection.classList.add('hidden');
        const matches = eventsData.filter(e => e.title.toLowerCase().includes(q));
        liveResults.classList.remove('hidden');
        if (matches.length > 0) {
            liveResults.innerHTML = '<div class="text-gray-400 text-[10px] font-black mb-2 uppercase tracking-widest">Kết quả tìm kiếm</div>' +
                matches.slice(0,6).map(e => `
                    <div class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition group"
                         onclick="document.getElementById('search-input').value='${e.title.replace(/'/g,"\\'")}';document.getElementById('search-suggestions').classList.add('hidden');openTicketModal('${e.title.replace(/'/g,"\\'")}')">
                        <i class="fa-solid fa-magnifying-glass text-gray-400 text-sm w-4"></i>
                        <span class="text-sm text-gray-200 group-hover:text-white">${e.title.replace(new RegExp(q,'gi'), m => `<mark style="background:transparent;color:#f472b6;font-weight:900">${m}</mark>`)}</span>
                        <span class="ml-auto text-pink-400 text-xs font-bold">${e.price}</span>
                    </div>`).join('');
        } else {
            liveResults.innerHTML = '<div class="text-gray-400 text-sm text-center py-3">Không tìm thấy kết quả nào</div>';
        }
    } else {
        trendingSection.classList.remove('hidden');
        liveResults.classList.add('hidden');
    }
});
document.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
        searchInput.value = item.dataset.value;
        suggestions.classList.add('hidden');
    });
});