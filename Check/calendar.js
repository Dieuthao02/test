// --- CẤU HÌNH & DỮ LIỆU TĨNH ---
     const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbx3vQyakJkFfJxkP5XAQ8fQkjmt5lnls2n4N3zjrEUL4JxYIzMumbGmPIZwOTzbjgO-OA/exec';
     const fixedEvents = [
    {
        id: "30", 
        name: "Lễ hội Âm nhạc EventHub 2026",
        date: "2026-03-21",
        time: "19:00",
        loc: "Sân vận động Mỹ Đình, Hà Nội",
        color: "bg-pink-500",
        price: "Từ 500.000 đ"
    }
];

let events = [...fixedEvents]; 
let currentDate = new Date(); 

// --- KHU VỰC QUẢN LÝ GIAO DIỆN  ---

window.toggleUserMenu = () => {
    const dropdown = document.getElementById('user-dropdown');
    if(dropdown) dropdown.classList.toggle('show');
};

window.changeMonth = (step) => {
    currentDate.setMonth(currentDate.getMonth() + step);
    renderCalendar();
};

window.updateClock = () => {
    const now = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const clockEl = document.getElementById('real-time-clock');
    const dateEl = document.getElementById('real-time-date');
    if (clockEl) clockEl.textContent = now.toLocaleTimeString('vi-VN');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('vi-VN', options);
};

async function fetchEventsFromSheet() {
    try {
        const response = await fetch(SHEET_API_URL);
        const rawData = await response.json();
        const orders = JSON.parse(localStorage.getItem('eventOrders')) || [];
        const luxuryColors = ["bg-pink-500", "bg-blue-600", "bg-emerald-500", "bg-purple-600", "bg-orange-500"];
        let allExpandedEvents = [...fixedEvents];

        rawData.forEach((ev, index) => {
            if (!ev.time) return;

            const fullTimeStr = ev.time.trim();
            
            const monthMatch = fullTimeStr.match(/[tT]háng\s+(\d{1,2})/);
            const yearMatch = fullTimeStr.match(/\d{4}/);
            
            const month = monthMatch ? monthMatch[1].padStart(2, '0') : (new Date().getMonth() + 1).toString().padStart(2, '0');
            const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();

            const dateCleaned = fullTimeStr.replace(/\d{1,2}:\d{2}/g, ''); 
            const dayMatches = dateCleaned.match(/(?<![:\d])\d{1,2}(?!\d)/g); 
            
            if (dayMatches) {
                const uniqueDays = [...new Set(dayMatches)].filter(d => d !== monthMatch?.[1]);
                uniqueDays.forEach(day => {
                    const d = day.padStart(2, '0');
                    const formattedDate = `${year}-${month}-${d}`;
                    const timeMatch = fullTimeStr.match(/(\d{1,2}:\d{2})/);
                    const eventTime = timeMatch ? timeMatch[1] : "00:00";
                  
                    const ticketQtyStr = ev.ticketQuantity ? String(ev.ticketQuantity) : "";
                    const quantities = ticketQtyStr ? ticketQtyStr.split(',').map(q => q.trim()) : [];
                    const pricesRaw = ev.priceList ? ev.priceList.split(/,|\n/).filter(p => p.trim() !== "") : [];
                    let isSoldOutAll = false;
                    allExpandedEvents.push({
                        id: ev.id ? `${ev.id}-${d}` : `sheet-${index}-${d}`, 
                        name: ev.eventName || "Sự kiện không tên",
                        date: formattedDate,
                        time: eventTime,
                        loc: ev.location || "Đang cập nhật",
                        color: luxuryColors[index % luxuryColors.length],
                        isSoldOut: isSoldOutAll,
                        price: ev.priceList ? "Đã có giá vé" : "Miễn phí"
                    });
                });
                console.log(`=> Dòng ${index} đã nhận dạng ${uniqueDays.length} ngày.`);
            }
        });

        events = allExpandedEvents;
        renderCalendar(); 
    } catch (error) {
        console.error("Lỗi:", error);
        renderCalendar();
    }
}

// --- RENDER LỊCH ---

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthDisplay = document.getElementById('month-year-display');
    if (!grid || !monthDisplay) return;

    grid.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    monthDisplay.textContent = `Tháng ${String(month + 1).padStart(2, '0')}, ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < startingDay; i++) {
        grid.innerHTML += `<div class="day-cell bg-gray-50/50 rounded-2xl opacity-50"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        const isToday = isCurrentMonth && day === today.getDate();
        const specialClass = isToday ? 'border-2 border-pink-500 shadow-lg' : 'border-gray-100';

        grid.innerHTML += `
            <div onclick="window.showEvents('${dateStr}')" id="day-${dateStr}" 
                 class="day-cell p-3 rounded-2xl border ${specialClass} bg-white cursor-pointer hover:bg-gray-50 transition-all">
                <span class="text-sm font-black ${isToday ? 'text-pink-600' : 'text-gray-700'}">${day}</span>
                <div class="flex flex-wrap gap-1 mt-2">
                    ${dayEvents.slice(0, 4).map(e => `<div class="w-2 h-2 rounded-full ${e.color} shadow-sm"></div>`).join('')}
                </div>
            </div>`;
    }

    const defaultDay = isCurrentMonth ? today.getDate() : 1;
    const defaultDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(defaultDay).padStart(2, '0')}`;
    window.showEvents(defaultDateStr);
    const selectedCell = document.getElementById(`day-${defaultDateStr}`);
    if (selectedCell && window.location.search.includes('date')) {
        selectedCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

window.showEvents = (dateStr) => {
  
    document.querySelectorAll('.day-cell').forEach(el => el.classList.remove('active-day'));
    const selectedCell = document.getElementById(`day-${dateStr}`);
    if (selectedCell) selectedCell.classList.add('active-day');

    const container = document.getElementById('event-list-container');
    const title = document.getElementById('selected-date-title');
    
    if (title) title.textContent = dateStr.split('-').reverse().join('/');

    const dayEvents = events.filter(e => e.date === dateStr);
    const now = new Date();

    if (dayEvents.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10">
                <i class="fa-solid fa-calendar-day text-4xl text-gray-200 mb-3"></i>
                <p class="text-gray-400 font-bold text-sm">Không có sự kiện nào trong ngày này.</p>
            </div>`;
        return;
    }

    container.innerHTML = dayEvents.map(e => {
        const eventDateTime = new Date(`${e.date}T${e.time}`);
        const isPast = eventDateTime < now;
        
        let statusBadge = `<span class="text-[10px] font-black text-white px-3 py-1.5 rounded-xl ${e.color} uppercase tracking-widest shadow-md">${e.time}</span>`;
        let btnText = "CHI TIẾT & ĐẶT VÉ";
        let btnClass = "bg-gray-900 hover:scale-[1.02] active:scale-95";

        if (isPast) {
            statusBadge = `<span class="text-[10px] font-black text-white px-3 py-1.5 rounded-xl bg-gray-400 uppercase tracking-widest">ĐÃ KẾT THÚC</span>`;
            btnText = "XEM LẠI SỰ KIỆN";
            btnClass = "bg-gray-400 opacity-70 cursor-not-allowed";
        } else if (e.isSoldOut) {
            statusBadge = `<span class="text-[10px] font-black text-white px-3 py-1.5 rounded-xl bg-red-600 uppercase tracking-widest">HẾT VÉ</span>`;
            btnText = "HẾT VÉ";
            btnClass = "bg-red-900 cursor-not-allowed";
        }

        return `
            <div class="event-card group p-5 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-300 cursor-pointer class="event-card group p-5 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden relative mb-4 ${isPast ? 'grayscale-[0.5]' : ''}">
                <div class="flex justify-between items-start mb-4">
                    ${statusBadge}
                    <span class="text-xs font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">${e.price}</span>
                </div>
                <h4 class="text-lg font-black text-gray-800 group-hover:text-blue-500 transition-colors line-clamp-2 leading-tight">${e.name}</h4>
                <p class="text-xs text-gray-500 mt-3 flex items-center font-bold">
                    <i class="fa-solid fa-location-dot mr-2 text-blue-500"></i> ${e.loc}
                </p>
                <button onclick="${isPast ? '' : `handleBooking('${e.id}')`}" 
                    class="w-full mt-6 py-4 ${btnClass} text-white rounded-2xl text-xs font-black tracking-widest uppercase transform transition-all shadow-xl">
                    ${btnText}
                </button>
            </div>
        `;
    }).join('');
};


window.handleBooking = (eventId) => {
       window.location.href = `detail.html?id=${eventId}`;   
};

window.handleCreateEventClick = () => {
    const user = auth.currentUser;
    if (user) {
        window.location.href = 'create.html';
    } else {
        alert("Vui lòng đăng nhập để thực hiện chức năng tạo sự kiện!");
    }
};

// --- AUTHENTICATION ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    const btnCreate = document.getElementById('btn-create-event');
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const userNameDisplay = document.getElementById('user-display-name');
    const userAvatar = document.querySelector('#user-profile img');

    if (user) {
        if (btnCreate) { btnCreate.style.opacity = "1"; btnCreate.style.cursor = "pointer";}
        if (authButtons) authButtons.classList.add('hidden');
        if (userProfile) userProfile.classList.remove('hidden');
        if (userNameDisplay) userNameDisplay.textContent = user.displayName || "Thành viên";
        if (userAvatar) userAvatar.src = user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`;
    } else {
        if (authButtons) authButtons.classList.remove('hidden');
        if (userProfile) userProfile.classList.add('hidden');
        if (btnCreate) { btnCreate.style.opacity = "0.6"; btnCreate.style.cursor = "not-allowed";}
    }
});

window.logout = async () => {
    try {
        await signOut(auth);
        console.log("Đã đăng xuất thành công");
        window.location.reload(); 
    } catch (error) {
        console.error("Lỗi đăng xuất:", error);
    }
};

window.onload = async () => {
    window.updateClock();
    setInterval(window.updateClock, 1000);

    const urlParams = new URLSearchParams(window.location.search);
    const targetDateStr = urlParams.get('date'); 

    if (targetDateStr) {
        const parts = targetDateStr.split('-'); 
        if (parts.length === 3) {
            const y = parseInt(parts[0]);
            const m = parseInt(parts[1]) - 1; 
            const d = parseInt(parts[2]);
            currentDate = new Date(y, m, d);
        }
    }

    await fetchEventsFromSheet();
    renderCalendar(); 
    
    if (targetDateStr) {
        setTimeout(() => {
            window.showEvents(targetDateStr);
            const selectedCell = document.getElementById(`day-${targetDateStr}`);
            if (selectedCell) {
                selectedCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
                selectedCell.classList.add('active-day');
                selectedCell.style.border = "2px solid #ec4899"; 
            }
        }, 200);
    }
};
