    const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbx3vQyakJkFfJxkP5XAQ8fQkjmt5lnls2n4N3zjrEUL4JxYIzMumbGmPIZwOTzbjgO-OA/exec';
        let currentEventId = ''; 

    async function initEventDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    currentEventId = urlParams.get('id');

    const videoMap = {
        '157': 'video157.mp4',
        '52': 'video52.mp4',
        '30': 'videos/loading_30.mp4'
    };

    const specialLoader = document.getElementById('special-loader');
    const videoPlayer = document.getElementById('loading-video-player');
    const loaderIcon = document.getElementById('loader-icon');

    specialLoader.style.display = 'flex';
    const customVideoPath = videoMap[currentEventId];

    if (customVideoPath) {
        videoPlayer.src = customVideoPath;
        videoPlayer.load(); 
        
        // Bắt đầu bằng việc bỏ mute
        videoPlayer.muted = false; 

        videoPlayer.play().then(() => {
            // FIX ÂM LƯỢNG Ở ĐÂY
            videoPlayer.volume = 0.3; 
            
            console.log("Phát video với âm lượng 0.3");
            
            // Ẩn các icon và chữ loading như đã làm
            if (loaderIcon) loaderIcon.classList.add('hidden');
            const loaderTexts = specialLoader.querySelectorAll('h2, p, .loading-text');
            loaderTexts.forEach(el => {
                el.style.opacity = '0';
                el.style.visibility = 'hidden';
            });
        }).catch(error => {
            console.log("Trình duyệt chặn tiếng, buộc phải im lặng.");
            videoPlayer.muted = true;
            videoPlayer.play();
        });

        videoPlayer.onended = () => {
            specialLoader.style.opacity = '0';
            setTimeout(() => { specialLoader.style.display = 'none'; }, 700);
        };
    }
    
    else {
        setTimeout(() => { specialLoader.style.display = 'none'; }, 2000);
    }

    try {
        const response = await fetch(SHEET_API_URL);
        const allEvents = await response.json();
        const event = allEvents.find(item => item.id == currentEventId);

        if (event) {
            renderPage(event);
        }
    } catch (error) {
        console.error("Lỗi tải Sheet:", error);
        videoPlayer.onended = () => { specialLoader.style.display = 'none'; };
    }

}

    function renderPage(ev) {
    const now = new Date();
    let isAllPast = false;
    let minPrice = Infinity;

    // --- 1. HÀM PARSE DATE---
    const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    try {
        let cleanStr = dateStr.toLowerCase()
            .replace(/tháng/g, '/')
            .split('[')[0]
            .replace(/[^\d:/]/g, ' ')
            .trim();

        const numbers = cleanStr.match(/\d+/g);
        if (!numbers || numbers.length < 3) return new Date(0);

        let hour = 0, minute = 0, day, month, year;
        const len = numbers.length;
        year = parseInt(numbers[len - 1], 10);
        month = parseInt(numbers[len - 2], 10) - 1;
        day = parseInt(numbers[len - 3], 10);

        if (cleanStr.includes(':')) {
            hour = parseInt(numbers[0], 10);
            minute = parseInt(numbers[1], 10);
        }

        if (year < 100) year += 2000;
        
        const finalDate = new Date(year, month, day, hour, minute, 0);
        return finalDate;
    } catch (e) { 
        return new Date(0); 
    }
};

    // --- 2. XỬ LÝ THỜI GIAN ---
    let timeArray = [];
    if (ev.time) {
        timeArray = ev.time.split(/\r?\n/).map(t => t.trim()).filter(t => t !== "");
        timeArray.sort((a, b) => parseDate(a) - parseDate(b));
        
        const maxTime = Math.max(...timeArray.map(t => parseDate(t).getTime()));
        isAllPast = maxTime < now.getTime();
    }

    // --- 3. HIỂN THỊ THÔNG TIN CHUNG ---
    document.getElementById('event-title').innerHTML = `${ev.eventName}<br><span class="text-pink-400 italic text-xl">${ev.category || ''}</span>`;
    const bannerImg = ev.eventImage || ev.mapImage;
    document.getElementById('event-banner').src = (bannerImg && bannerImg !== "No") ? bannerImg : "https://via.placeholder.com/800x400?text=No+Image";
    document.getElementById('event-location').innerHTML = `<i class="fa-solid fa-location-dot mr-2 text-pink-400"></i> ${ev.location}`;

    if (ev.description) {
        const descElement = document.getElementById('event-description');
        descElement.innerHTML = ev.description; 
        descElement.classList.add('description-html-content');
    }

    // --- 4. RENDER SUẤT DIỄN ---
    const timeContainer = document.getElementById('event-time');
    if (timeArray.length > 0) {
        const renderDateLink = (dateText, isMain = false) => {
            const d = parseDate(dateText);
            const isPast = d.getTime() < now.getTime();
            const isoDate = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            
            if (isPast) {
                return `<div class="flex items-center gap-2 opacity-50">
                            <i class="fa-solid fa-calendar text-gray-500 text-xs"></i>
                            <span class="${isMain ? 'text-[11px]' : 'text-[10px]'} font-medium text-gray-500 line-through">${dateText}</span>
                            <span class="text-[8px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded uppercase font-bold">Hết hạn</span>
                        </div>`;
            } else {
                return `<a href="calendar.html?date=${isoDate}" class="flex items-center gap-2 hover:text-pink-400 transition-all">
                            <i class="fa-solid fa-calendar ${isMain ? 'text-green-400' : 'text-gray-600'} text-xs"></i>
                            <span class="${isMain ? 'text-[11px]' : 'text-[10px]'} font-medium ${isMain ? 'text-white' : 'text-gray-400'}">${dateText}</span>
                        </a>`;
            }
        };

        const upcoming = timeArray.filter(t => parseDate(t) >= now);
        const mainTime = upcoming.length > 0 ? upcoming[0] : timeArray[timeArray.length - 1];
        const extraTimes = timeArray.filter(t => t !== mainTime);

        let timeHTML = `<div class="flex flex-col gap-2"><div class="flex flex-wrap items-center gap-2">${renderDateLink(mainTime, true)}`;
        if (extraTimes.length > 0) {
            timeHTML += `<span onclick="document.getElementById('extra-dates').classList.toggle('hidden')" class="cursor-pointer bg-pink-500/10 text-pink-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-pink-400/20 uppercase">+${extraTimes.length} khác</span></div>
                         <div id="extra-dates" class="hidden flex flex-col gap-2 pl-5 border-l border-dashed border-gray-700 mt-1">
                            ${extraTimes.map(date => renderDateLink(date)).join('')}
                         </div>`;
        } else { timeHTML += `</div>`; }
        timeContainer.innerHTML = timeHTML + `</div>`;
    }
    
    // --- 5. RENDER VÉ  ---
    const ticketContainer = document.getElementById('ticket-list-container');
    const orders = JSON.parse(localStorage.getItem('eventOrders')) || [];

    if (ev.priceList && timeArray.length > 0) {
        let accordionHTML = '';
        const pricesRaw = ev.priceList.split(/,|\n/).filter(p => p.trim() !== "");
        const detailsRaw = ev.ticketDetail ? ev.ticketDetail.split('|').map(d => d.trim()) : [];
        const quantitiesByTime = ev.ticketQuantity ? ev.ticketQuantity.split('|').map(q => q.trim()) : [];

        timeArray.forEach((timeStr, timeIdx) => {
            const isPast = parseDate(timeStr).getTime() < now.getTime();
            let ticketsHTML = ''; 

            const currentBatchStr = quantitiesByTime[timeIdx] || quantitiesByTime[0] || "";
            const quantitiesRaw = currentBatchStr.split(',').map(q => q.trim());

            pricesRaw.forEach((p, pIdx) => {
                if (p.includes(':')) {
                    const [name, priceRawValue] = p.split(':').map(s => s.trim());
                    const priceValue = parseInt(priceRawValue.replace(/\D/g, '')) || 0; 
                    
                    if (!isNaN(priceValue)) {
                        if (priceValue < minPrice) minPrice = priceValue;

                        let qVal = quantitiesRaw[pIdx];
                        let totalQty = (!qVal || qVal.toLowerCase() === "sold out" || qVal === "0") ? 0 : parseInt(qVal);
                        if (qVal === undefined || qVal === "") totalQty = 1000;

                        const soldCount = orders
                            .filter(order => (order.event === ev.eventName || order.event === ev.title) && order.showtime === timeStr) 
                            .reduce((sum, order) => {
                                const ticket = order.tickets.find(t => t.name === name);
                                return sum + (ticket ? ticket.qty : 0);
                            }, 0);

                        let remainingQty = totalQty - soldCount;
                        const isSoldOut = remainingQty <= 0;
                        const isFree = priceValue === 0;

                        ticketsHTML += `
                            <div class="flex items-center justify-between p-4 border-t border-white/5">
                                <div class="flex flex-col">
                                    <span class="text-xs font-bold text-gray-300 uppercase">
                                        ${name} ${isSoldOut ? '<span class="text-red-500 ml-2">[HẾT VÉ]</span>' : ''}
                                    </span>
                                    <span class="text-[10px] text-gray-500">${detailsRaw[pIdx] || 'Vé chính thức'}</span>
                                </div>
                                <div class="text-right">
                                    <span class="text-sm font-black ${isFree ? 'text-pink-400' : 'text-green-400'}">
                                        ${isFree ? 'MIỄN PHÍ' : priceValue.toLocaleString() + 'đ'}
                                    </span>
                                </div>
                            </div>`;
                    }
                }
            });

            accordionHTML += `
                <div class="showtime-item ${timeIdx === 0 && !isPast ? 'active' : ''} mb-4 bg-white/[0.03] rounded-2xl overflow-hidden border border-white/5">
                    <div class="p-4 flex justify-between items-center">
                        <div class="flex items-center gap-4 cursor-pointer" onclick="this.closest('.showtime-item').classList.toggle('active')">
                            <div class="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                                <i class="fa-solid fa-calendar-day text-pink-400"></i>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-white">${timeStr}</p>
                                <span class="text-[9px] ${isPast ? 'text-red-400' : 'text-green-400'} uppercase font-bold">
                                    ${isPast ? 'Đã diễn ra' : 'Sắp diễn ra'}
                                </span>
                            </div>
                            <i class="fa-solid fa-chevron-down text-[10px] text-gray-500"></i>
                        </div>
                        ${!isPast ? `<button onclick="goToBooking('${timeStr}')" class="px-6 py-2 bg-[#2ecc71] text-white rounded-xl text-[10px] font-black uppercase">Mua vé ngay</button>` : ''}
                    </div>
                    <div class="ticket-rows-container bg-black/20">${ticketsHTML}</div>
                </div>`;
        });
        ticketContainer.innerHTML = accordionHTML;
    }


    // --- 6. NÚT BOOKING ---
    const bookingBtn = document.getElementById('main-booking-btn');
    const priceDisplay = document.getElementById('event-min-price');
    const finalMinDisplay = (minPrice === Infinity) ? "0 đ" : (minPrice === 0 ? "MIỄN PHÍ" : minPrice.toLocaleString() + " đ");

    if (isAllPast) {
        if (bookingBtn) {
            bookingBtn.innerHTML = "SỰ KIỆN ĐÃ KẾT THÚC";
            bookingBtn.className = "w-full py-2.5 bg-gray-800 text-gray-500 rounded-[1.5rem] font-black uppercase text-[10px] cursor-not-allowed opacity-70";
            bookingBtn.onclick = null;
        }
        if (priceDisplay) priceDisplay.innerHTML = `<span class="line-through opacity-50">${finalMinDisplay} đ</span>`;
    } else {
        if (bookingBtn) {
            // KIỂM TRA SỐ LƯỢNG LỊCH DIỄN
            if (timeArray.length === 1) {
                bookingBtn.innerHTML = "Mua vé ngay";
                bookingBtn.onclick = () => goToBooking(timeArray[0]);
            } else {
                bookingBtn.innerHTML = "Chọn suất diễn";
                bookingBtn.onclick = () => {
                    if (!window.currentUser) { goToBooking(); return; }
                    document.getElementById('ticket-list-container').scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
  
                    const container = document.getElementById('ticket-list-container');
                    container.style.transition = "all 0.5s";
                    container.style.transform = "scale(1.02)";
                    setTimeout(() => container.style.transform = "scale(1)", 500);
                };
            }
            bookingBtn.className = "w-full py-2.5 bg-[#2ecc71] text-white rounded-[1.5rem] font-black uppercase text-[10px] shadow-lg transition-all active:scale-95";
        }
        if (priceDisplay) priceDisplay.innerHTML = `${finalMinDisplay} `;
    }

    // --- 7. TỔ CHỨC ---
    document.getElementById('org-name').innerText = ev.organizerName || "EventHub Partner";
    document.getElementById('org-desc').innerText = ev.organizerDesc || "Đơn vị tổ chức chuyên nghiệp.";
    const orgLogoContainer = document.getElementById('org-logo');
    if (ev.organizerLogo && ev.organizerLogo !== "No") {
        orgLogoContainer.innerHTML = `<img src="${ev.organizerLogo}" class="w-full h-full object-cover rounded-full">`;
    } else {
        orgLogoContainer.innerText = ev.organizerName ? ev.organizerName.substring(0, 2).toUpperCase() : "EH";
    }
}

        function toggleTicket(el) {
            const item = el.parentElement;
            item.classList.toggle('active');
        }

        function toggleIntro() {
            const content = document.getElementById('intro-content');
            const icon = document.getElementById('toggle-icon');
            content.classList.toggle('content-expanded');
            icon.classList.toggle('fa-chevron-up');
            icon.classList.toggle('fa-chevron-down');
        }

    function goToBooking(selectedDate) {

    if (!window.currentUser) {
  
        const authBtn = document.getElementById('auth-buttons');
        
        authBtn.classList.remove('hidden'); 
        authBtn.style.transition = "all 0.3s";
        authBtn.style.transform = "scale(1.2)";
        authBtn.style.filter = "drop-shadow(0 0 10px #ec4899)";
        
        setTimeout(() => {
            authBtn.style.transform = "scale(1)";
            authBtn.style.filter = "none";
        }, 500);

        alert("🔒 Vui lòng Đăng nhập/Đăng ký để tiếp tục đặt vé!");
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    if (!currentEventId) return;
    
    const btn = event?.target;
    if (btn && btn.tagName === 'BUTTON') {
        btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> ĐANG CHUYỂN...';
        btn.style.opacity = "0.7";
        btn.style.pointerEvents = "none";
    }

    let url = `booking.html?id=${currentEventId}`;
    if (selectedDate) {
        url += `&date=${encodeURIComponent(selectedDate)}`;
    }
    
    // Chuyển trang
    window.location.href = url;
}

        window.onload = initEventDetail;