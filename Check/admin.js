
// Khởi tạo hoặc lấy số liệu cũ từ localStorage
let totalTickets = parseInt(localStorage.getItem('total_tickets')) || 1250;
let totalRevenue = parseFloat(localStorage.getItem('total_revenue')) || 45.500;
let totalUsers = parseInt(localStorage.getItem('total_users')) || 850; // Thêm dòng này

function syncDashboard() {
    const tEl = document.getElementById('stat-tickets');
    const rEl = document.getElementById('stat-revenue');
    const uEl = document.getElementById('stat-users'); // Giả sử ID của số người dùng là stat-users

    if (tEl) tEl.innerText = totalTickets.toLocaleString();
    if (rEl) rEl.innerText = totalRevenue.toFixed(3) + "M";
    if (uEl) uEl.innerText = totalUsers.toLocaleString(); // Cập nhật hiển thị số người dùng
    
    // Lưu lại vào máy
    localStorage.setItem('total_tickets', totalTickets);
    localStorage.setItem('total_revenue', totalRevenue);
    localStorage.setItem('total_users', totalUsers);
}

/* --- DỮ LIỆU MẪU (DUMMY DATA) --- */
const names = ["Minh Quân", "Huyền My", "Quốc Anh", "Thu Trang", "Hoàng Long", "Bảo Ngọc", "Thành Nam", "Ánh Tuyết", "Diệu Nhi", "Gia Bách"];
const eventNames = ["Những Thành Phố Mơ Màng", "Lululola Show", "Fintech GenZ 2026", "Rap Việt Concert", "Đà Lạt Mộng Mơ", "Tech Expo VNU", "Music Festival 2026"];
const locations = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];
const supportSubjects = ["Lỗi thanh toán vé", "Hỗ trợ đổi thông tin", "Hợp tác tài trợ", "Tư vấn mua vé Group", "Khiếu nại dịch vụ", "Yêu cầu hoàn tiền"];
const supportMessages = [
    "Mình đã chuyển khoản thành công qua ngân hàng nhưng chưa nhận được mã QR.",
    "Cho mình hỏi vé Early Bird còn suất không ạ? Mình muốn mua cho nhóm 10 người.",
    "Hệ thống báo lỗi 'Mã giao dịch không hợp lệ' khi mình quét QR chuyển khoản.",
    "Mình lỡ nhập sai địa chỉ Gmail, Admin hỗ trợ sửa lại giúp mình với.",
    "Muốn đăng ký làm nhà tài trợ kim cương cho Music Fest thì liên hệ đầu mối nào?",
    "Sự kiện có cho phép mang trẻ em dưới 6 tuổi vào không Admin ơi?" ]

let mainChart;

/* --- HÀM CHUYỂN TAB  --- */
function showTab(tabId, el) {
    // 1. Xử lý nội dung các Tab
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('hidden'); // Đảm bảo tất cả đều bị ẩn bằng class Tailwind
    });

    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
        targetTab.classList.remove('hidden'); // Gỡ bỏ hidden để nội dung hiện ra
    }

    // 2. Xử lý màu sắc Sidebar 
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active', 'text-blue-500', 'bg-white/5'); // Thêm bg-white/5 cho đẹp
        link.classList.add('text-gray-400');
    });

    // Fix lỗi event.currentTarget có thể bị null nếu bấm vào icon bên trong
    if (el) {
        el.classList.add('active', 'text-blue-500', 'bg-white/5');
        el.classList.remove('text-gray-400');
    }

    // 3. Cập nhật Tiêu đề 
    const titles = {
        'dashboard': 'Tổng quan hệ thống',
        'events': 'Trung tâm Sự kiện',
        'users': 'Cộng đồng khách hàng',
        'deposits': 'Quản lý nạp tiền',
        'orders': 'Lịch sử giao dịch',
        'support': 'Hỗ trợ khách hàng',
        'activity': 'Dòng thời gian '
    };
    
    if (document.getElementById('tab-title')) {
        document.getElementById('tab-title').innerText = titles[tabId] || 'Hệ thống';
    }

    // 4. Chạy hàm Hỗ trợ nếu là tab support
    if (tabId === 'support') {
        // Kiểm tra xem hàm có tồn tại không trước khi gọi để tránh crash code
        if (typeof seedSupportTickets === 'function') {
            seedSupportTickets();
        }
    }
    if (tabId === 'activity') {
    if (typeof initLiveFeed === 'function') {
        initLiveFeed();
    }
}
if (tabId === 'deposits') {
        console.log("Đang mở tab Nạp tiền - Tiến hành load dữ liệu...");
        loadDeposits(); 
    }
}
/* --- QUẢN LÝ KHÁCH HÀNG (Gộp 2 trong 1) --- */
function seedUsers() {
    const userContainer = document.getElementById('users');
    if (!userContainer) return;

    // CHỈ VẼ KHUNG NẾU CHƯA CÓ (Để không bị mất thanh search khi nhấn refresh)
    if (!document.getElementById('user-grid')) {
        userContainer.innerHTML = `
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 px-2">
            <div class="relative w-full md:w-96">
                <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 text-xs"></i>
                <input type="text" id="search-users" onkeyup="filterUsers()" placeholder="Tìm tên, email khách hàng..." 
                    class="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs outline-none focus:border-blue-500 transition text-white">
            </div>
            
            <div class="flex gap-3 w-full md:w-auto">
                <button onclick="exportToExcel()" class="flex-1 md:flex-none bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-file-excel text-blue-500"></i> XUẤT FILE EXCEL
                </button>
                <button onclick="seedUsers()" class="w-11 h-11 glass rounded-xl flex items-center justify-center hover:text-blue-500 transition">
                    <i class="fa-solid fa-rotate text-xs"></i>
                </button>
            </div>
        </div>
        <div id="user-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10"></div>
        `;
    }

    // LẤY DỮ LIỆU
    const realUsers = JSON.parse(localStorage.getItem('ticket_users')) || [];
    realUsers.forEach(u => {
        u.isReal = true;
        u.name = u.fullName || u.name; // Ưu tiên fullName từ Firebase
    });

    let dummyUsers = JSON.parse(localStorage.getItem('admin_dummy_users'));
    if (!dummyUsers) {
        dummyUsers = Array.from({length: 50}, (_, i) => ({
            id: 'dummy-' + (i+1),
            name: "Khách hàng mẫu " + (i+1),
            email: `user${i+1}@gmail.com`,
            phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
            avatar: `https://i.pravatar.cc/150?u=${i + 101}`,
            spend: (Math.random() * 15).toFixed(1),
            isReal: false
        }));
        localStorage.setItem('admin_dummy_users', JSON.stringify(dummyUsers));
    }

    const allUsers = [...dummyUsers, ...realUsers];

    // CHỈ ĐỔ DỮ LIỆU VÀO GRID
    const grid = document.getElementById('user-grid');
    if (grid) {
        grid.innerHTML = ""; // Xóa cũ vẽ mới
        allUsers.forEach(user => {
            if (typeof addUserCardToGrid === 'function') {
                addUserCardToGrid(user, user.isReal);
            }
        });
    }
}


// Tìm kiếm Khách hàng
function filterUsers() {
    const query = document.getElementById('search-users').value.toLowerCase();
    const cards = document.querySelectorAll('.user-card-item');

    cards.forEach(card => {
        const name = card.querySelector('h4').innerText.toLowerCase();
        const email = card.querySelector('.fa-envelope').parentElement.innerText.toLowerCase();
        
        if (name.includes(query) || email.includes(query)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

function addUserCardToGrid(user, isReal) {
    const grid = document.getElementById('user-grid');
    if (!grid) return;

    // Thay vì return (ngừng), hãy kiểm tra nếu đã có card đó thì XÓA CŨ đi để VẼ MỚI
    const existingCard = document.getElementById(`user-card-${user.id}`);
    if (existingCard) {
        existingCard.remove(); 
    }

    const html = `
        <div id="user-card-${user.id}" class="glass p-5 rounded-[2rem] hover:border-blue-500/50 transition-all duration-300 group user-card-item ${isReal ? 'border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/5'}">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <img src="${user.avatar || 'https://i.pravatar.cc/150'}" class="w-12 h-12 rounded-2xl object-cover border-2 border-white/5">
                    <div>
                        <h4 class="font-bold text-sm text-white">${user.name} ${isReal ? '<span class="text-[8px] bg-blue-500 text-black px-1 rounded ml-1 animate-pulse">REAL</span>' : ''}</h4>
                        <p class="text-[9px] text-gray-500 uppercase font-black tracking-widest">${isReal ? 'Thành viên mới' : 'Thành viên hạng bạc'}</p>
                    </div>
                </div>
            </div>
            <div class="space-y-2 mb-4 text-[11px] text-gray-400">
                <p><i class="fa-regular fa-envelope w-5 text-blue-500"></i>${user.email}</p>
                <p><i class="fa-solid fa-phone w-5 text-blue-500"></i>${user.phone || 'N/A'}</p>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-white/5">
                <p class="text-sm font-black text-blue-500">
                    ${new Intl.NumberFormat('vi-VN').format((user.spend || 0) * 1000000)}đ
                </p>
                <span class="text-[9px] ${isReal ? 'text-green-400 bg-green-400/10' : 'text-blue-400 bg-blue-400/10'} px-2 py-0.5 rounded-lg">Hoạt động</span>
            </div>
        </div>
    `;
    
    // Dùng appendChild hoặc insertAdjacentHTML tùy mục đích
    grid.insertAdjacentHTML('afterbegin', html); 
}

/* ==========================================================================
   1. KHAI BÁO BIẾN TOÀN CỤC & KHỞI TẠO (SEED DATA)
   ========================================================================== */

function seedEvents() {
    const eventContainer = document.getElementById('events');
    if (!eventContainer) return;

    eventContainer.innerHTML = `
        <div class="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 px-2">
            <div class="relative w-full md:w-80">
                <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]"></i>
                <input type="text" id="search-events" onkeyup="filterEvents()" placeholder="Tìm tên sự kiện, địa điểm..." 
                    class="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-xs outline-none focus:border-blue-500 transition-all placeholder:text-gray-600 shadow-inner">
            </div>
            <div class="flex gap-3 w-full md:w-auto">
                <button onclick="exportToExcel()" class="flex-1 md:flex-none bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-file-excel text-blue-500"></i> XUẤT FILE EXCEL
                </button>
                <button onclick="location.reload()" class="w-11 h-11 glass rounded-xl flex items-center justify-center hover:text-blue-500 transition">
                    <i class="fa-solid fa-rotate text-xs"></i>
                </button>
            </div>
        </div>
        <div id="event-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    `;


    const grid = document.getElementById('event-grid');
    const realEvents = JSON.parse(localStorage.getItem('ticket_events')) || [];
    realEvents.reverse().forEach(ev => addEventCardToGrid(ev, true));

    for (let i = 1; i <= 50; i++) {
        const dummyEv = {
            id: 'ev-' + i,
            title: (typeof eventNames !== 'undefined' ? eventNames[Math.floor(Math.random() * eventNames.length)] : "Sự kiện") + " #" + i,
            location: (typeof locations !== 'undefined' ? locations[Math.floor(Math.random() * locations.length)] : "Địa điểm"),
            organizer: "Ban Tổ Chức " + i,
            bankAccount: "999-000-" + (100 + i),
            price: Math.floor(Math.random() * 2000000) + 500000
        };
        addEventCardToGrid(dummyEv, false);
    }
}

/* ==========================================================================
   2. QUẢN LÝ THẺ SỰ KIỆN (RENDER & SEARCH)
   ========================================================================== */

function addEventCardToGrid(ev, isReal) {
    const grid = document.getElementById('event-grid');
    if (!grid) return;

    const html = `
        <div id="event-card-${ev.id}" class="glass p-5 rounded-3xl group hover:border-blue-500/50 transition-all border border-white/5 relative">
            <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500 text-xl">
                    <i class="fa-solid fa-ticket"></i>
                </div>
                <div>
                    <h4 class="font-bold text-sm text-white truncate w-40">${ev.title || 'N/A'}</h4>
                    <p class="status-badge text-[8px] text-blue-500 font-bold uppercase tracking-widest">${isReal ? 'Dữ liệu thực' : 'Đang chờ duyệt'}</p>
                </div>
            </div>
            <div class="space-y-2 text-[11px] text-gray-400 mb-4">
                <p><i class="fa-solid fa-location-dot w-5 text-blue-500"></i>${ev.location || 'N/A'}</p>
                <div class="flex items-center gap-2">
                    <p><i class="fa-solid fa-user-tie w-5 text-blue-500"></i>${ev.organizer || 'N/A'}</p>
                    <button onclick="viewEventDetails('${ev.id}')" class="w-5 h-5 rounded-full bg-white/5 hover:bg-blue-500/20 flex items-center justify-center transition" title="Xem chi tiết">
                        <i class="fa-solid fa-circle-info text-[10px] text-blue-400"></i>
                    </button>
                </div>
            </div>
            <div class="flex justify-between items-center pt-4 border-t border-white/5 action-area">
                <p class="text-sm font-black text-blue-500">${parseInt(ev.price || 0).toLocaleString()} đ</p>
                <div class="flex gap-2">
                    <button onclick="openRejectModal('${ev.id}')" class="text-[9px] font-black text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg hover:bg-red-400 hover:text-white transition">TỪ CHỐI</button>
                    <button onclick="approveEvent('${ev.id}', this)" class="text-[9px] font-black text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-500 transition shadow-lg shadow-blue-500/20">DUYỆT</button>
                </div>
            </div>
        </div>
    `;
    grid.insertAdjacentHTML('afterbegin', html);
}


function filterEvents() {
    const query = document.getElementById('search-events').value.toLowerCase();
    const cards = document.querySelectorAll('#event-grid > div');
    cards.forEach(card => {
        const title = card.querySelector('h4').innerText.toLowerCase();
        const location = card.querySelector('.fa-location-dot').parentElement.innerText.toLowerCase();
        card.style.display = (title.includes(query) || location.includes(query)) ? "block" : "none";
    });
}

/* ==========================================================================
   3. LOGIC DUYỆT, TỪ CHỐI & HOÀN TÁC
   ========================================================================== */


// --- 1. HÀM DUYỆT SỰ KIỆN ---
function approveEvent(eventId, btnElement) {
    const card = document.getElementById(`event-card-${eventId}`);
    if (card) {
        // Cập nhật giao diện Admin ngay lập tức
        card.style.borderColor = '#10b981';
        const badge = card.querySelector('.status-badge') || card.querySelector('p.text-blue-500');
        if(badge) {
            badge.innerText = "ĐÃ PHÊ DUYỆT";
            badge.classList.replace('text-blue-500', 'text-green-500');
        }
        
        const iconContainer = card.querySelector('.text-blue-500');
        if(iconContainer) {
            iconContainer.classList.replace('text-blue-500', 'text-green-500');
            if(iconContainer.parentElement) iconContainer.parentElement.classList.replace('bg-blue-500/10', 'bg-green-500/10');
        }

        btnElement.innerText = "ĐÃ DUYỆT";
        btnElement.disabled = true;
        btnElement.style.opacity = "0.5";
        btnElement.className = "text-[10px] font-bold text-gray-400 bg-white/10 px-3 py-1 rounded-lg cursor-not-allowed";

        // --- BỔ SUNG: LƯU TRẠNG THÁI VÀO DATABASE (LOCALSTORAGE) ---
        updateEventStatus(eventId, 'active');

        if (typeof addNotification === 'function') {
            addNotification("Hệ thống", `Sự kiện "${card.querySelector('h4').innerText}" đã được kích hoạt.`);
        }
    }
}
/**
 * HÀM GỘP: CẬP NHẬT TRẠNG THÁI SỰ KIỆN VÀO LOCALSTORAGE
 * @param {string|number} eventId - ID của sự kiện cần sửa
 * @param {string} newStatus - Trạng thái mới ('active', 'pending', 'rejected')
 * @param {string} reason - Lý do (thường dùng khi từ chối)
 */
function updateEventStatus(eventId, newStatus, reason = "") {
    // 1. Lấy toàn bộ danh sách sự kiện từ LocalStorage (cả ảo lẫn thật)
    let allEvents = JSON.parse(localStorage.getItem('ticket_events')) || [];

    // 2. Kiểm tra xem sự kiện có tồn tại không
    const eventIndex = allEvents.findIndex(ev => String(ev.id) === String(eventId));

    if (eventIndex !== -1) {
        // 3. Cập nhật trạng thái
        allEvents[eventIndex].status = newStatus;

        // 4. Nếu có lý do (thường là từ chối), lưu thêm vào object
        if (reason) {
            allEvents[eventIndex].rejectReason = reason;
        } else {
            // Nếu duyệt lại thì xóa lý do cũ đi cho sạch dữ liệu
            delete allEvents[eventIndex].rejectReason;
        }

        // 5. Lưu đè lại vào LocalStorage để "đọng" dữ liệu vĩnh viễn
        localStorage.setItem('ticket_events', JSON.stringify(allEvents));

        // 6. Log để bà kiểm tra trong Console (F12)
        console.log(`✅ Hệ thống: Sự kiện ${eventId} -> ${newStatus.toUpperCase()}${reason ? ' (Lý do: ' + reason + ')' : ''}`);
        
        return true; // Trả về true để hàm gọi biết là đã update thành công
    } else {
        console.error(`❌ Không tìm thấy sự kiện ID: ${eventId} để cập nhật.`);
        return false;
    }
}

// --- 2. CÁC HÀM MODAL TỪ CHỐI ---
function openRejectModal(eventId) {
    currentRejectingId = eventId;
    const modal = document.getElementById('reject-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeRejectModal() {
    const modal = document.getElementById('reject-modal');
    if (modal) modal.classList.add('hidden');
}

// --- 3. HÀM XÁC NHẬN TỪ CHỐI ---
function confirmReject(reason) {
    if (!currentRejectingId) return;
    const card = document.getElementById(`event-card-${currentRejectingId}`);
    
    if (card) {
        const actionArea = card.querySelector('.action-area');
        const innerDiv = (actionArea && actionArea.querySelector('div')) ? actionArea.querySelector('div') : actionArea;
        
        if (actionArea) {
            card.dataset.oldButtons = innerDiv.innerHTML; 
            card.style.opacity = '0.6';
            card.classList.add('grayscale');
            
            const badge = card.querySelector('.status-badge');
            if(badge) {
                badge.innerText = "BỊ TỪ CHỐI";
                badge.classList.replace('text-blue-500', 'text-red-500');
            }

            innerDiv.innerHTML = `
                <div class="flex flex-col items-end gap-1">
                    <span class="text-[8px] font-black text-red-500 uppercase bg-red-500/10 px-2 py-1 rounded">Lý do: ${reason}</span>
                    <button onclick="undoReject('${currentRejectingId}')" class="text-[9px] font-bold text-blue-400 hover:underline mt-1">
                        <i class="fa-solid fa-rotate-left"></i> Hoàn tác
                    </button>
                </div>
            `;

            // --- BỔ SUNG: LƯU TRẠNG THÁI TỪ CHỐI VÀ LÝ DO ---
            updateEventStatus(currentRejectingId, 'rejected', reason);

            if (typeof addNotification === 'function') addNotification("Hệ thống", `Đã từ chối sự kiện #${currentRejectingId}`);
            closeRejectModal();
        }
    }
}

// --- 4. HÀM HOÀN TÁC (QUAY LẠI CHỜ DUYỆT) ---
function undoReject(eventId) {
    const card = document.getElementById(`event-card-${eventId}`);
    if (card) {
        card.style.opacity = '1';
        card.classList.remove('grayscale');
        
        const badge = card.querySelector('.status-badge');
        if(badge) {
            badge.innerText = "ĐANG CHỜ DUYỆT";
            badge.classList.replace('text-red-500', 'text-blue-500');
        }

        const actionArea = card.querySelector('.action-area');
        const innerDiv = (actionArea && actionArea.querySelector('div')) ? actionArea.querySelector('div') : actionArea;
        
        if (card.dataset.oldButtons) {
            innerDiv.innerHTML = card.dataset.oldButtons;
        }

        // --- BỔ SUNG: ĐƯA TRẠNG THÁI VỀ CHỜ DUYỆT ---
        updateEventStatus(eventId, 'pending');

        if (typeof addNotification === 'function') addNotification("Hệ thống", `Đã hoàn tác trạng thái sự kiện #${eventId}`);
    }
}


/* ==========================================================================
   4. MODAL CHI TIẾT & LOGIC YÊU THÍCH
   ========================================================================== */
function viewEventDetails(eventId) {
    const allEvents = JSON.parse(localStorage.getItem('ticket_events')) || [];
    const ev = allEvents.find(item => String(item.id) === String(eventId));

    if (!ev) {
        console.error("Không tìm thấy dữ liệu!");
        return;
    }

    // --- 1. TIÊU ĐỀ & ẢNH ---
    document.getElementById('det-title').innerText = ev.title || ev.name || 'Sự kiện';
    const finalImg = ev.img || ev.image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070';
    document.getElementById('det-cover').src = finalImg;
    document.getElementById('det-thumb').src = finalImg;

    // --- 2. ĐỊA ĐIỂM CHI TIẾT (Fix lỗi chưa hiện) ---
    // Trong ảnh xác nhận của cậu, nó nằm ở phần "Địa điểm" phía dưới tên tỉnh
    const addrElem = document.getElementById('det-address');
    if (addrElem) {
        // Thử lấy locdetail hoặc locationDetail
        addrElem.innerText = ev.locdetail || ev.locationDetail || ev.address || 'N/A';
    }

    // --- 3. BAN TỔ CHỨC (Fix lỗi hiện N/A) ---
    // Khớp với tên "Diệu thảo" và Gmail trong ảnh của cậu
    if (document.getElementById('det-btc-name')) 
        document.getElementById('det-btc-name').innerText = ev.btcname || ev.organizer || 'Chưa có tên';
    
    if (document.getElementById('det-btc-email')) 
        document.getElementById('det-btc-email').innerText = ev.btcemail || ev.email || 'N/A';
    
    if (document.getElementById('det-btc-phone')) 
        document.getElementById('det-btc-phone').innerText = ev.btcphone || ev.phone || 'N/A';
    
    if (document.getElementById('det-btc-info')) 
        document.getElementById('det-btc-info').innerText = ev.btcInfo || 'Ban tổ chức sự kiện';

    // Ảnh Logo BTC
    const btcLogoElem = document.getElementById('det-btc-logo');
    if (btcLogoElem) {
        // Nếu cậu có upload logo thì dùng btcLogo, không thì dùng avatar tự động
        btcLogoElem.src = ev.btcLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(ev.btcname || 'BTC')}&background=00d2ff&color=fff`;
    }

    // --- 4. TÀI KHOẢN NGÂN HÀNG (Fix lỗi N/A) ---
    // Khớp với MB và STK 03478789 trong ảnh của cậu
    if (document.getElementById('det-bank-name')) 
        document.getElementById('det-bank-name').innerText = ev.bankname || ev.bankName || 'N/A';
    
    if (document.getElementById('det-bank-acc')) 
        document.getElementById('det-bank-acc').innerText = ev.bankacc || ev.accountNumber || 'N/A';
    
    if (document.getElementById('det-bank-user')) 
        document.getElementById('det-bank-user').innerText = ev.bankuser || ev.bankHolder || 'N/A';

    // --- 5. CÁC THÔNG TIN KHÁC ---
    if (document.getElementById('det-category'))
        document.getElementById('det-category').innerText = ev.type || 'MUSIC';
    
    if (document.getElementById('det-time'))
        document.getElementById('det-time').innerText = ev.start || 'N/A';
    
    if (document.getElementById('det-desc'))
        document.getElementById('det-desc').innerText = ev.desc || 'Chưa có mô tả chi tiết.';

    // --- 6. DANH SÁCH VÉ ---
    const ticketContainer = document.getElementById('det-tickets');
    if (ticketContainer) {
        ticketContainer.innerHTML = '';
        let tickets = (typeof ev.tickets === 'string') ? JSON.parse(ev.tickets) : (ev.tickets || []);
        tickets.forEach(t => {
            ticketContainer.innerHTML += `
                <div class="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 mb-2">
                    <div>
                        <p class="text-white text-xs font-bold">${t.name}</p>
                        <p class="text-[9px] text-gray-400">SL: ${t.qty || 0}</p>
                    </div>
                    <p class="text-[#00d2ff] font-black text-sm">${Number(t.price).toLocaleString()} đ</p>
                </div>`;
        });
    }

    // --- 7. NÚT YÊU THÍCH (Giữ nguyên) ---
    if (typeof updateFavoriteButtonUI === 'function') updateFavoriteButtonUI(eventId);

    // --- 8. HIỆN MODAL ---
    const modal = document.getElementById('detail-modal');
    modal.classList.remove('hidden');
}

function toggleFavorite(eventId) {
    let favorites = JSON.parse(localStorage.getItem('favorite_events')) || [];
    const index = favorites.findIndex(f => f.id == eventId);

    if (index !== -1) {
        favorites.splice(index, 1);
        if (typeof addNotification === 'function') addNotification("Hệ thống", "Đã gỡ ưu tiên.");
    } else {
        const favItem = {
            id: eventId,
            title: document.getElementById('det-title').innerText,
            location: document.getElementById('det-address').innerText,
            thumb: document.getElementById('det-thumb').src
        };
        favorites.push(favItem);
        if (typeof addNotification === 'function') addNotification("Hệ thống", "Đã thêm vào ưu tiên!");
    }
    localStorage.setItem('favorite_events', JSON.stringify(favorites));
    updateFavoriteButtonUI(eventId);
}

function updateFavoriteButtonUI(eventId) {
    const favorites = JSON.parse(localStorage.getItem('favorite_events')) || [];
    const isFav = favorites.some(f => f.id == eventId);
    let favContainer = document.getElementById('fav-btn-container');
    if (!favContainer) {
        favContainer = document.createElement('div');
        favContainer.id = 'fav-btn-container';
        favContainer.className = 'mt-6 pt-6 border-t border-white/5';
        document.getElementById('det-tickets').after(favContainer);
    }
    favContainer.innerHTML = `
        <button onclick="toggleFavorite('${eventId}')" id="btn-fav-${eventId}" 
            class="w-full py-4 rounded-2xl font-black text-[11px] uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${isFav ? 'bg-pink-600 text-white shadow-pink-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart ${isFav ? 'text-white' : 'text-pink-500'}"></i> 
            ${isFav ? 'ĐÃ ĐƯA VÀO ƯU TIÊN' : 'ĐẨY LÊN SỰ KIỆN ƯU TIÊN'}
        </button>
    `;
}

function closeDetailModal() {
    const modal = document.getElementById('detail-modal');
    modal.querySelector('div').classList.replace('scale-100', 'scale-95');
    setTimeout(() => modal.classList.add('hidden'), 200);
}

/* ==========================================================================
   5. CẤU TRÚC HTML MODAL (INSERT VÀO CUỐI BODY)
   ========================================================================== */

document.body.insertAdjacentHTML('beforeend', `
    <div id="reject-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] hidden flex items-center justify-center p-4">
        <div class="bg-[#1a1a1a] border border-white/10 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl scale-95 transition-all">
            <h3 class="text-white font-bold text-lg mb-2">Lý do từ chối</h3>
            <p class="text-gray-400 text-xs mb-6">Vui lòng chọn lý do để phản hồi cho đối tác tạo sự kiện.</p>
            <div class="space-y-3 mb-8">
                <button onclick="confirmReject('Sản phẩm vi phạm pháp luật')" class="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/50 hover:bg-red-500/5 text-gray-300 text-xs transition">🚫 Sản phẩm vi phạm pháp luật</button>
                <button onclick="confirmReject('Nội dung chưa đầy đủ')" class="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-yellow-500/50 hover:bg-yellow-500/5 text-gray-300 text-xs transition">📝 Nội dung chưa đầy đủ</button>
                <button onclick="confirmReject('Tiêu chuẩn hình ảnh không đạt')" class="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 text-gray-300 text-xs transition">🖼️ Tiêu chuẩn kiểm duyệt hình ảnh</button>
            </div>
            <button onclick="closeRejectModal()" class="w-full py-3 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition">Hủy bỏ</button>
        </div>
    </div>

   <div id="detail-modal" class="fixed inset-0 bg-black/90 backdrop-blur-md z-[1000] hidden flex items-center justify-center p-4">
    <div class="bg-[#121212] border border-white/10 w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl scale-95 transition-all">
        <div class="relative h-48 w-full flex-shrink-0">
            <img id="det-cover" src="" class="w-full h-full object-cover opacity-50">
            <div class="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent"></div>
            <button onclick="closeDetailModal()" class="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition"><i class="fa-solid fa-xmark"></i></button>
            <div class="absolute bottom-4 left-8 flex items-end gap-6">
                <img id="det-thumb" src="" class="w-24 h-24 rounded-2xl object-cover border-4 border-[#121212] shadow-xl bg-gray-800">
                <div class="mb-2">
                    <span id="det-category" class="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-md font-black uppercase">N/A</span>
                    <h2 id="det-title" class="text-2xl font-black text-white mt-1 uppercase">N/A</h2>
                </div>
            </div>
        </div>

        <div class="p-8 overflow-y-auto custom-scroll space-y-8">
            <div class="grid grid-cols-2 gap-4">
                <div class="glass p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p class="text-[10px] text-gray-500 uppercase font-black mb-1">Thời gian</p>
                    <p class="text-xs text-gray-200"><i class="fa-regular fa-calendar-check mr-2 text-blue-500"></i><span id="det-time">N/A</span></p>
                </div>
                <div class="glass p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p class="text-[10px] text-gray-500 uppercase font-black mb-1">Địa điểm chi tiết</p>
                    <p class="text-xs text-gray-200"><i class="fa-solid fa-location-arrow mr-2 text-blue-500"></i><span id="det-address">N/A</span></p>
                </div>
            </div>

            <div>
                <h3 class="text-sm font-bold text-white mb-2 uppercase tracking-widest text-blue-500">Thông tin sự kiện</h3>
                <p id="det-desc" class="text-xs text-gray-400 leading-relaxed whitespace-pre-line">N/A</p>
            </div>

            <div>
                <h3 class="text-sm font-bold text-white mb-3 uppercase tracking-widest text-blue-500">Loại vé</h3>
                <div id="det-tickets" class="space-y-2"></div>
            </div>

            <div class="border-t border-white/5 pt-6">
                <h3 class="text-sm font-bold text-white mb-4 uppercase tracking-widest text-blue-500">Ban tổ chức</h3>
                <div class="flex items-start gap-4 mb-4">
                    <img id="det-btc-logo" src="" class="w-14 h-14 rounded-full object-cover border-2 border-blue-500/20">
                    <div class="flex-1">
                        <h4 id="det-btc-name" class="font-bold text-white text-base">N/A</h4>
                        <p id="det-btc-info" class="text-[11px] text-gray-500 mt-1 italic">N/A</p>
                        
                        <div class="flex flex-wrap gap-4 mt-3">
                            <span class="text-[10px] text-gray-400"><i class="fa-solid fa-envelope text-blue-500 mr-1"></i> <span id="det-btc-email">N/A</span></span>
                            <span class="text-[10px] text-gray-400"><i class="fa-solid fa-phone text-blue-500 mr-1"></i> <span id="det-btc-phone">N/A</span></span>
                        </div>
                    </div>
                </div>

                <div class="bg-blue-500/5 border border-blue-500/10 p-5 rounded-3xl mt-4 flex justify-between items-center">
                    <div>
                        <p class="text-[10px] text-blue-500 font-black uppercase mb-2">Tài khoản nhận tiền</p>
                        <div class="space-y-1">
                            <p class="text-xs text-gray-400">Ngân hàng: <span id="det-bank-name" class="text-white font-bold">N/A</span></p>
                            <p class="text-lg text-[#00d2ff] font-black font-mono tracking-wider" id="det-bank-acc">0000000000</p>
                            <p class="text-[10px] text-gray-500 uppercase tracking-tighter">Chủ TK: <span id="det-bank-user" class="text-white">N/A</span></p>
                        </div>
                    </div>
                    <div class="text-right flex flex-col items-end gap-2">
                        <i class="fa-solid fa-building-columns text-blue-500/20 text-3xl"></i>
                        <span class="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded uppercase font-bold">Giao dịch an toàn</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`);


/* --- QUẢN LÝ ĐƠN HÀNG (ORDERS) --- */
function seedOrders() {
    const ordersTab = document.getElementById('orders');
    if (!ordersTab) return;

    // Giữ nguyên phần HTML khung của bà
    ordersTab.innerHTML = `
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 px-2">
            <div class="relative w-full md:w-96">
                <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 text-xs"></i>
                <input type="text" id="search-orders" onkeyup="filterOrders()" placeholder="Tìm mã đơn, khách hàng..." 
                    class="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs outline-none focus:border-blue-500 transition text-white">
            </div>
            <button onclick="exportToExcel()" class="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2">
                <i class="fa-solid fa-file-excel text-blue-500"></i> Xuất dữ liệu đơn hàng
            </button>
        </div>
        <div class="glass rounded-3xl overflow-hidden shadow-2xl">
            <table class="w-full text-left text-sm" id="live-order-table">
                <thead class="text-gray-500 border-b border-white/5 bg-white/[0.01]">
                    <tr>
                        <th class="p-6 font-bold uppercase text-[10px] tracking-wider">Mã đơn</th>
                        <th class="p-6 font-bold uppercase text-[10px] tracking-wider">Thời gian</th>
                        <th class="p-6 font-bold uppercase text-[10px] tracking-wider">Khách hàng</th>
                        <th class="p-6 font-bold uppercase text-[10px] tracking-wider">Sự kiện</th>
                        <th class="p-6 font-bold uppercase text-[10px] tracking-wider text-center">Số vé</th>
                        <th class="p-6 font-bold uppercase text-[10px] tracking-wider">Số tiền</th>
                        <th class="p-6 font-bold uppercase text-[10px] tracking-wider text-right">Trạng thái</th>
                    </tr>
                </thead>
                <tbody id="live-order-body"></tbody>
            </table>
        </div>`;

    const body = document.getElementById('live-order-body');
    if (!body) return;

    // Tạo 20 dòng ảo nhưng phải ĐỦ 7 CỘT
    for (let i = 1; i <= 20; i++) {
        const row = `
            <tr class="border-b border-white/5 hover:bg-white/[0.02] transition order-row">
                <td class="p-6 font-mono text-green-500 text-xs font-bold">#TK-${10000 + i}</td>
                <td class="p-6 text-gray-400 text-xs">10:00:00<br>31/03/2026</td>
                <td class="p-6">
                    <p class="font-bold text-white text-sm">${names[Math.floor(Math.random() * names.length)]}</p>
                    <p class="text-[10px] text-gray-500">customer${i}@gmail.com</p>
                </td>
                <td class="p-6 text-xs text-gray-400 italic">${eventNames[Math.floor(Math.random() * eventNames.length)]}</td>
                <td class="p-6 text-center"><span class="bg-white/5 px-3 py-1 rounded-md text-xs font-bold">01</span></td>
                <td class="p-6 font-black text-green-500 text-sm">${(Math.random() * 2 + 0.5).toFixed(3)}.000đ</td>
                <td class="p-6 text-right">
                    <span class="text-[9px] bg-green-500/10 text-green-500 px-2 py-1 rounded font-black uppercase">Hoàn tất</span>
                </td>
            </tr>`;
        body.insertAdjacentHTML('beforeend', row);
    }
    
    // Sau khi tạo xong đồ ảo, gọi tiếp hàm render đồ thật để nó đè lên đầu
    if (typeof renderAdminTable === "function") {
        renderAdminTable();
    }
}


function filterOrders() {
    const query = document.getElementById('search-orders').value.toLowerCase();
    const rows = document.querySelectorAll('.order-row');

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
    });
}
function addLiveOrder(name, event, price = 0) {
    const body = document.getElementById('live-order-body');
    if (!body) return;

    // 1. Chuyển đổi giá tiền sang định dạng VNĐ (Ví dụ: 1.500.000)
    // Nếu price là số nhỏ (ví dụ 0.5 - 2.0), tui nhân với 1.000.000 để ra tiền triệu thực tế
    let actualPrice = price > 0 ? price * 1000000 : (Math.random() * 1500000 + 500000);
    
    // Định dạng số có dấu chấm phân cách hàng nghìn
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(Math.floor(actualPrice));

    const rowId = `order-${Date.now()}`;
    const now = new Date();
    const currentTime = now.getHours() + ":" + String(now.getMinutes()).padStart(2, '0') + ":" + String(now.getSeconds()).padStart(2, '0');
    const currentDate = now.toLocaleDateString('vi-VN');
    
    const row = `
        <tr id="${rowId}" class="border-b border-white/5 bg-blue-500/5 animate-pulse order-row">
            <td class="p-6 font-mono text-[11px] text-blue-500 font-bold">#TK-${Math.floor(20000 + Math.random() * 70000)}</td>
            
            <td class="p-6 text-gray-400 text-xs">
                <p>${currentTime}</p>
                <p class="text-[10px] opacity-50">${currentDate}</p>
            </td>

            <td class="p-6">
                <p class="font-black text-white text-sm">${name}</p>
                <p class="text-[10px] text-gray-500">${name.toLowerCase().replace(/\s/g, '')}@gmail.com</p>
            </td>

            <td class="p-6 text-xs text-gray-300 italic">${event}</td>

            <td class="p-6 text-center">
                <span class="bg-white/5 px-3 py-1 rounded-md text-xs font-bold">01</span>
            </td>

            <td class="p-6 font-bold text-green-500 text-sm">${formattedPrice}đ</td>

            <td class="p-6 text-right">
                <span class="text-[9px] bg-blue-500 text-white font-black px-2 py-1 rounded animate-bounce">MỚI</span>
            </td>
        </tr>`;
        
    body.insertAdjacentHTML('afterbegin', row);

    setTimeout(() => {
        const el = document.getElementById(rowId);
        if (el) el.classList.remove('bg-blue-500/5', 'animate-pulse');
    }, 3000);
}

/* --- BIỂU ĐỒ (CHART.JS) --- */
function initChart() {
    const ctx = document.getElementById('mainChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['01/03', '05/03', '10/03', '15/03', '20/03', '25/03', '30/03'],
            datasets: [{
                label: 'Doanh thu (M)',
                data: [120, 190, 150, 280, 220, 350, 480],
                borderColor: '#3b82f6',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280' } },
                x: { grid: { display: false }, ticks: { color: '#6b7280' } }
            }
        }
    });
}

/* --- TỰ ĐỘNG CẬP NHẬT ĐA NHIỆM (ẢO) --- */
function startAutomation() {
    setInterval(() => {
        const randomAction = Math.random();
        const buyer = names[Math.floor(Math.random() * names.length)];
        const event = eventNames[Math.floor(Math.random() * eventNames.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];

        // KỊCH BẢN 1: Bán vé ảo (40%)
        if (randomAction > 0.6) {
            const price = (Math.random() * 1.5 + 0.5);
            updateDashboardStats(1, price);
            addLiveOrder(buyer, event, price);
            pushNotification("Giao dịch", `${buyer} vừa mua vé "${event}"`);
            if (mainChart) {
                mainChart.data.datasets[0].data[6] += price;
                mainChart.update('none');
            }
        } 
        // KỊCH BẢN 2: Khách hàng mới ảo (30%)
else if (randomAction > 0.3) {
    // 1. Phải tạo tên mới cho khách hàng này
    const newGuestName = names[Math.floor(Math.random() * names.length)];
    
    const dummyUser = {
        id: 'dummy-' + Date.now(),
        name: newGuestName,
        email: `${newGuestName.toLowerCase().replace(/\s/g, '')}@gmail.com`,
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
        spend: "0" // Người mới nên chi tiêu bằng 0
    };

    // 2. Cập nhật Dashboard: 0 vé, 0 tiền, cộng 1 User
    // (Dựa trên hàm updateDashboardStats mình vừa sửa ở trên)
    updateDashboardStats(0, 0, 1);

    // 3. Hiển thị lên giao diện
    if (typeof addUserCardToGrid === "function") {
        addUserCardToGrid(dummyUser, false); 
    }

    addNotification("Thành viên", `Khách hàng mới: ${newGuestName} vừa gia nhập.`);
}
        // KỊCH BẢN 3: SỰ KIỆN MỚI ẢO (30%) - Phần Thảo đang thiếu
        else {
            const dummyEv = {
                id: 'ev-' + Date.now(),
                title: event,
                location: location,
                organizer: "Ban Tổ Chức " + buyer,
                price: Math.floor(Math.random() * 1000000) + 200000
            };
            addEventCardToGrid(dummyEv, false);
addNotification("Sự kiện", `Sự kiện mới "${event}" đang chờ duyệt.`, dummyEv.id);
        }
    }, 12000); 
}// --- HÀM TỰ ĐỘNG HÓA (CHẠY MỖI 12 GIÂY) ---
function startAutomation() {
    setInterval(() => {
        const randomAction = Math.random();
        
        // 0. Tạo dữ liệu ngẫu nhiên cho mỗi vòng lặp
        const buyer = names[Math.floor(Math.random() * names.length)];
        const event = eventNames[Math.floor(Math.random() * eventNames.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];

       // KỊCH BẢN 1: Bán vé ảo (30%) - Tăng Vé & Tiền
        if (randomAction > 0.7) {
            const price = (Math.random() * 1.5 + 0.5); 
            updateDashboardStats(1, price, 0); 
            addLiveOrder(buyer, event, price);
            addNotification("Giao dịch", `${buyer} vừa mua vé "${event}"`);

            if (window.mainChart) {
                const lastIdx = mainChart.data.datasets[0].data.length - 1;
                mainChart.data.datasets[0].data[lastIdx] += price;
                mainChart.update('none');
            }
        } 

        // KỊCH BẢN 2: Khách hàng mới (25%) - Tăng User
        else if (randomAction > 0.45) {
            const dummyUser = {
                id: 'dummy-' + Date.now(),
                name: buyer,
                email: `${buyer.toLowerCase().replace(/\s/g, '')}${Math.floor(Math.random()*99)}@gmail.com`,
                avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
                spend: "0"
            };

            updateDashboardStats(0, 0, 1);
            if (typeof addUserCardToGrid === "function") {
                addUserCardToGrid(dummyUser, false); 
            }
            addNotification("Thành viên", `Khách hàng mới: ${buyer} vừa gia nhập.`);
        }

        // KỊCH BẢN 3: Sự kiện mới ảo (25%) - Chờ duyệt
        else if (randomAction > 0.2) {
            const dummyEv = {
                id: 'ev-' + Date.now(),
                title: event,
                location: location,
                organizer: "BTC " + buyer,
                price: (Math.floor(Math.random() * 8) + 2) * 100000 
            };

            if (typeof addEventCardToGrid === "function") {
                addEventCardToGrid(dummyEv, false);
            }
            addNotification("Sự kiện", `Sự kiện mới "${event}" đang chờ duyệt.`, dummyEv.id);
        }

        // KỊCH BẢN 4: Tin nhắn hỗ trợ mới (20%) - Cập nhật trực tiếp vào Support List
        else {
            const newTicket = {
                id: 'TK-' + Date.now(),
                name: buyer,
                email: `${buyer.toLowerCase().replace(/\s/g, '')}@gmail.com`,
                subject: supportSubjects[Math.floor(Math.random() * supportSubjects.length)],
                message: supportMessages[Math.floor(Math.random() * supportMessages.length)],
                time: "Vừa xong",
                priority: Math.random() > 0.5 ? "Cao" : "Trung bình"
            };

            // Cập nhật dữ liệu vào mảng toàn cục và vẽ lại giao diện Support
            if (window.allSupportData) {
                window.allSupportData.unshift(newTicket); // Đưa lên đầu
                renderSupportList(window.allSupportData);
            }
            
            addNotification("Hỗ trợ", `Yêu cầu mới từ ${buyer}: "${newTicket.subject}"`);
        }

    }, 12000); 
}

/* --- TIỆN ÍCH (NOTIF, SEARCH, STATS) --- */
function addNotification(type, message, dataId = null) {
    console.log(`[Hệ thống]: ${type} - ${message}`);
}


function updateDashboardStats(ticketIncr, revenueIncr, userIncr = 0) {
    const tEl = document.getElementById('stat-tickets');
    const rEl = document.getElementById('stat-revenue');
    const uEl = document.getElementById('stat-users');

    // 1. Cập nhật Số vé
    if (tEl && ticketIncr > 0) {
        let currentTickets = parseInt(tEl.innerText.replace(/[^0-9]/g, '')) || 0;
        tEl.innerText = (currentTickets + ticketIncr).toLocaleString('vi-VN');
    }
// 2. Cập nhật Doanh thu (Xử lý hàng Tỷ)
if (rEl && revenueIncr > 0) {
    let text = rEl.innerText;
    
    if (text.includes('T')) {
        let currentBillions = parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
        
        // Tính toán số tỷ cộng thêm
        let addedBillions = revenueIncr < 1000 ? (revenueIncr / 1000) : (revenueIncr / 1000000000);
        let totalBillions = currentBillions + addedBillions;
        
        // CHỖ NÀY: Dùng Math.round để bỏ sạch phần thập phân ,001
        rEl.innerText = Math.round(totalBillions).toLocaleString('vi-VN') + "T";
    } else {
        // Logic tiền Việt bình thường
        let currentRevenue = parseInt(text.replace(/[^0-9]/g, '')) || 0;
        let addedRevenue = revenueIncr < 1000 ? revenueIncr * 1000000 : revenueIncr;
        rEl.innerText = new Intl.NumberFormat('vi-VN').format(currentRevenue + addedRevenue) + "đ";
    }
}
    
    // 3. Cập nhật Số người dùng
    if (uEl && userIncr > 0) {
        let currentUsers = parseInt(uEl.innerText.replace(/[^0-9]/g, '')) || 0;
        uEl.innerText = (currentUsers + userIncr).toLocaleString('vi-VN');
    }
}

function exportToCSV() {
    addNotification("Hệ thống", "Đang xuất file CSV...");
    setTimeout(() => {
        alert("Tính năng xuất dữ liệu đang được xử lý.");
    }, 1000);
}

/* --- LẮNG NGHE DỮ LIỆU THỰC TỪ STORAGE --- */

window.addEventListener('storage', (e) => {
    // 1. Nếu có yêu cầu nạp tiền/đăng ký mới từ tab User
    if (e.key === 'new_registrations' && e.newValue) {
        try {
            const newLogs = JSON.parse(e.newValue);
            // Lấy kho lưu trữ gốc của Admin
            let currentLogs = JSON.parse(localStorage.getItem('admin_deposit_logs')) || [];
            
            // Nối dữ liệu mới vào ĐẦU mảng
            const updatedLogs = [...newLogs, ...currentLogs];
            
            // Lưu lại vào kho gốc
            localStorage.setItem('admin_deposit_logs', JSON.stringify(updatedLogs));
            
            // CẬP NHẬT GIAO DIỆN
            if (typeof loadDeposits === 'function') {
                loadDeposits(); // Hàm này phải đọc dữ liệu từ 'admin_deposit_logs'
            }
            
            // Thông báo
            if (typeof addNotification === 'function') {
                addNotification("Hệ thống", `Có thông báo mới từ ${newLogs[0].user}!`);
            }

            // MẸO: Đừng dùng removeItem ngay lập tức ở đây nếu không cần thiết
            // Để nó tự ghi đè ở lần sau cũng được
        } catch (err) {
            console.error("Lỗi xử lý dữ liệu Admin:", err);
        }
    }

    // 2. Nếu có đơn mua vé (eventOrders)
    if (e.key === 'eventOrders' && e.newValue) {
        if (typeof renderAdminTable === "function") renderAdminTable();
        addNotification("Đơn hàng", "Hệ thống vừa ghi nhận một đơn mua vé mới!");
    }

    // 3. Nếu có khách hàng mới (ticket_users)
    if (e.key === 'ticket_users' && e.newValue) {
        const users = JSON.parse(e.newValue);
        const lastUser = users[users.length - 1];
        addNotification("Thành viên", `Chào mừng ${lastUser.fullName || lastUser.name} gia nhập!`);
        // Cập nhật số lượng user trên dashboard nếu có
        const userStat = document.getElementById('stat-users');
        if(userStat) {
            let count = parseInt(userStat.innerText.replace(/[^0-9]/g, '')) || 0;
            userStat.innerText = (count + 1).toLocaleString('vi-VN');
        }
    }
});

function exportToExcel() {
    const activeTab = document.querySelector('.tab-content.active').id;
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    let fileName = "";
    let rows = [];

    // --- CASE 1: KHÁCH HÀNG ---
    if (activeTab === 'users') {
        fileName = "Danh_Sach_Nguoi_Dung.csv";
        rows.push(["Tên Khách Hàng", "Email", "Số Điện Thoại", "Chi Tiêu"]);
        
        const userCards = document.querySelectorAll('.user-card-item');
        userCards.forEach(card => {
            if (card.style.display !== 'none') {
                const name = card.querySelector('h4').innerText.replace('REAL', '').trim();
                const email = card.querySelector('.fa-envelope').parentElement.innerText.trim();
                const phone = card.querySelector('.fa-phone').parentElement.innerText.trim();
                const spend = card.querySelector('.text-blue-500').innerText.trim();
                rows.push([name, email, phone, spend]);
            }
        });
    } 

    // --- CASE 2: SỰ KIỆN (FIXED) ---
    else if (activeTab === 'events') {
        fileName = "Danh_Sach_Su_Kien.csv";
        rows.push(["Tên Sự Kiện", "Địa Điểm", "Ban Tổ Chức", "Giá Vé"]);
        
        const eventCards = document.querySelectorAll('#event-grid > div');
        eventCards.forEach(card => {
            if (card.style.display !== 'none') {
                const title = card.querySelector('h4').innerText.trim();
                const loc = card.querySelector('.fa-location-dot').parentElement.innerText.trim();
                const org = card.querySelector('.fa-user-tie').parentElement.innerText.trim();
                const price = card.querySelector('.text-blue-500').innerText.trim();
                rows.push([title, loc, org, price]);
            }
        });
    }

    // --- CASE 3: ĐƠN HÀNG (FIXED) ---
    else if (activeTab === 'orders') {
        fileName = "Lich_Su_Giao_Dich.csv";
        rows.push(["Mã Đơn","Thời Gian", "Khách Hàng", "Sự Kiện", "Số Vé","Số Tiền", "Trạng Thái"]);
        
        const orderRows = document.querySelectorAll('.order-row');
        orderRows.forEach(row => {
            if (row.style.display !== 'none') {
                const cells = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
                rows.push(cells);
            }
        });
    }

    // 1. Lắng nghe tin nhắn thực từ trang Liên hệ (Contact)
window.addEventListener('storage', (e) => {
    if (e.key === 'contact_messages') {
        const updatedMessages = JSON.parse(e.newValue);
        const latestMsg = updatedMessages[updatedMessages.length - 1];

        // Tạo đối tượng ticket theo chuẩn giao diện admin
        const newTicket = {
            id: 'TK-REAL-' + Date.now(),
            name: latestMsg.name,
            email: latestMsg.email,
            subject: "Yêu cầu từ Form Liên hệ",
            message: latestMsg.message,
            time: "Vừa xong",
            priority: "Cao"
        };

        // Đưa vào mảng dữ liệu chung và vẽ lại
        if (window.allSupportData) {
            window.allSupportData.unshift(newTicket);
            renderSupportList(window.allSupportData);
        }

        // Bắn thông báo và cập nhật Badge trên Dashboard
        addNotification("Hỗ trợ thực", `Khách ${latestMsg.name} vừa gửi yêu cầu hỗ trợ!`);
        
        // Cập nhật con số "Đang chờ xử lý" ở cột phải
        const pendingEl = document.querySelector('.text-yellow-500.font-bold');
        if (pendingEl) {
            let count = parseInt(pendingEl.innerText);
            pendingEl.innerText = count + 1;
        }
    }
});


    // Chuyển mảng thành định dạng CSV
    const csvString = rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    csvContent += csvString;

    // Tải file
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification("Hệ thống", `Đã xuất ${rows.length - 1} dòng dữ liệu.`);
}


// Quản lý trạng thái panel thông báo

function addNotification(title, message, type = 'EVENT') {
    const now = new Date();
    const timeOnly = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const fullDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const fullDateTime = `${timeOnly} - ${fullDate}`;

    console.log(`[NOTIF - ${type}]: ${title} | ${message}`);
    if (typeof pushToFeed === 'function') {
        pushToFeed(type, title, fullDateTime, message, true);
    }
}

let currentRejectingId = null;

// Mở Modal
function openRejectModal(eventId) {
    currentRejectingId = eventId;
    const modal = document.getElementById('reject-modal');
    modal.classList.remove('hidden');
    modal.querySelector('div').classList.add('scale-100');
}

// Đóng Modal
function closeRejectModal() {
    const modal = document.getElementById('reject-modal');
    modal.classList.add('hidden');
    modal.querySelector('div').classList.remove('scale-100');
    currentRejectingId = null;
}

//ai vừa đăng ký thật
function checkRealRegistrations() {
    const newRegs = JSON.parse(localStorage.getItem('new_registrations')) || [];
    
    if (newRegs.length > 0) {
        newRegs.forEach(reg => {
            // Cộng dồn số liệu thực
            totalTickets += 1; // Mỗi người đăng ký tính 1 vé
            totalRevenue += parseFloat(reg.price || 0.5); // Lấy giá vé từ form đăng ký
            
            // Thêm một dòng vào bảng Orders với nhãn "THỰC"
            addLiveOrder(reg.fullName, reg.eventName, reg.price, true);
            
            addNotification("Giao dịch thực", `${reg.fullName} vừa mua vé thành công!`);
        });
        
        // Sau khi xử lý xong thì xóa danh sách chờ để không bị cộng lặp
        localStorage.removeItem('new_registrations');
        syncDashboard();
    }
}

// Cho Admin kiểm tra mỗi 5 giây xem có đơn hàng thực nào không
setInterval(checkRealRegistrations, 5000);



/* --- HÀM QUẢN LÝ HỖ TRỢ (FIXED & OPTIMIZED) --- */

// 1. Hàm render danh sách (Giữ nguyên style của Thảo, thêm ID để AI nhận diện)
function renderSupportList(data) {
    const container = document.getElementById('support-list');
    if (!container) return;
    
    container.innerHTML = data.map(tk => {
        const firstLetter = tk.name ? tk.name.charAt(0) : 'K';
        const subject = tk.subject || "Yêu cầu hỗ trợ";

        return `
        <div id="card-${tk.id}" class="glass p-6 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all group support-card-animate">
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black shadow-inner">
                        ${firstLetter}
                    </div>
                    <div>
                        <h4 class="text-white font-bold text-sm tracking-tight">${subject}</h4>
                        <div class="flex flex-col mt-1">
                            <p class="text-[10px] text-gray-500">Từ: <span class="text-white/80">${tk.name || 'Ẩn danh'}</span></p>
                            <p class="text-[10px] text-blue-400/80 italic flex items-center gap-1">
                                <i class="fa-regular fa-envelope text-[9px]"></i> ${tk.email || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
                <span class="text-[9px] font-black px-3 py-1 rounded-lg bg-${tk.priority === 'Cao' ? 'red' : 'blue'}-500/10 text-${tk.priority === 'Cao' ? 'red' : 'blue'}-500 border border-${tk.priority === 'Cao' ? 'red' : 'blue'}-500/20 uppercase">
                    ${tk.priority || 'Thường'}
                </span>
            </div>
            <div class="bg-white/[0.03] p-4 rounded-2xl mb-4 border border-white/5 support-message-box">
                <p class="text-gray-400 text-[11px] italic leading-relaxed">"${tk.message || 'Không có nội dung'}"</p>
            </div>
            <div class="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                <button onclick="askAIHelp('${tk.id}')" class="text-[10px] font-black text-white bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 rounded-xl hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2">
                    <i class="fa-solid fa-robot text-[9px]"></i> AI REPLY
                </button>
                <button onclick="resolveTicket(this)" class="text-[10px] font-black text-green-500 bg-green-500/10 px-4 py-2 rounded-xl hover:bg-green-500 hover:text-white transition-all">ĐÃ XỬ LÝ</button>
                <a href="mailto:${tk.email}?subject=Re: ${subject}" class="text-[10px] font-black text-white/50 bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10 transition-all border border-white/5">GMAIL</a>
            </div>
        </div>
    `}).join('');
}

// 2. Hàm AI Reply (Kích hoạt nhảy số Dashboard)
function askAIHelp(id) {
    const card = document.getElementById(`card-${id}`);
    if (!card) return;

    if (typeof addNotification === 'function') {
        addNotification("AI System", "Đang tự động soạn phản hồi tối ưu...");
    }

    // Hiệu ứng card
    card.style.opacity = '0.5';
    const btn = card.querySelector('button[onclick^="askAIHelp"]');
    if (btn) btn.innerText = "SENDING...";

    setTimeout(() => {
        if (typeof addNotification === 'function') {
            addNotification("Thành công", "AI đã gửi phản hồi thành công.");
        }
        
        // NHẢY SỐ TRÊN DASHBOARD
        const pendingEl = document.querySelector('.text-yellow-500.font-bold');
        const resolvedEl = document.querySelector('.text-green-500.font-bold');
        if (pendingEl && resolvedEl) {
            let p = parseInt(pendingEl.innerText) || 0;
            let r = parseInt(resolvedEl.innerText) || 0;
            pendingEl.innerText = Math.max(0, p - 1);
            resolvedEl.innerText = r + 1;
        }

        card.style.filter = 'grayscale(1)';
        if (btn) btn.innerText = "AI DONE";
    }, 1500);
}

// 3. Khởi tạo dữ liệu gộp (Đảm bảo số liệu bay vào window.allSupportData)
function initDummySupport() {
    // 1. Lấy dữ liệu THẬT từ khách hàng gửi qua Contact Form
    const realTickets = JSON.parse(localStorage.getItem('contact_messages')) || [];
    
    // 2. Tạo dữ liệu ẢO (Giữ nguyên logic của Thảo)
    const dummyTickets = Array.from({ length: 15 }).map((_, i) => ({
        id: `TK-${200 + i}`,
        name: (typeof names !== 'undefined') ? names[Math.floor(Math.random() * names.length)] : "Khách hàng mẫu",
        email: `customer${200+i}@gmail.com`,
        subject: "Yêu cầu hệ thống",
        message: "Tôi cần hỗ trợ về việc thanh toán vé sự kiện.",
        time: `${Math.floor(Math.random() * 23) + 1} giờ trước`,
        priority: Math.random() > 0.7 ? "Cao" : "Trung bình"
    }));

    // 3. Gộp lại: Đưa dữ liệu THẬT lên trước, sau đó mới tới dữ liệu ẢO
    window.allSupportData = [...realTickets.reverse(), ...dummyTickets];
    
    // 4. Hiển thị ra màn hình
    renderSupportList(window.allSupportData);
}

// 4. Hàm Đã xử lý (Cũng kích hoạt nhảy số luôn cho đồng bộ)
function resolveTicket(btn) {
    const card = btn.closest('.glass');
    if (!card) return;

    // 1. HIỆN THÔNG BÁO (Dòng này Thảo đang thiếu nè)
    if (typeof addNotification === 'function') {
        // Lấy tên khách từ card để thông báo cho xịn
        const customerName = card.querySelector('.text-white\\/80')?.innerText || "Khách hàng";
        addNotification("Thành công", `Đã xử lý xong yêu cầu của ${customerName}`, "SUPPORT");
    }

    // 2. Hiệu ứng làm mờ card
    card.style.opacity = '0.4';
    card.style.filter = 'grayscale(1)';
    btn.innerText = "HOÀN TẤT";
    btn.disabled = true;

    // 3. Cập nhật con số trên Dashboard
    const pendingEl = document.querySelector('.text-yellow-500.font-bold');
    const resolvedEl = document.querySelector('.text-green-500.font-bold');
    if (pendingEl && resolvedEl) {
        let p = parseInt(pendingEl.innerText) || 0;
        let r = parseInt(resolvedEl.innerText) || 0;
        pendingEl.innerText = Math.max(0, p - 1);
        resolvedEl.innerText = r + 1;
    }
}

/* --- 5. HÀM TÌM KIẾM HỖ TRỢ (SEARCH SUPPORT) --- */
function setupSupportSearch() {
    // Tớ dùng selector rộng hơn để chắc chắn bắt được ô input của Thảo
    const searchInput = document.querySelector('input[placeholder*="Tìm kiếm"]') || 
                        document.querySelector('#support input') || 
                        document.querySelector('.support-search-input');

    if (searchInput) {
        console.log("Đã kết nối thanh Tìm kiếm thành công!"); // Kiểm tra trong Console (F12)
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            // Lấy tất cả các thẻ Card đang hiển thị trong list
            const allCards = document.querySelectorAll('#support-list > div');

            allCards.forEach(card => {
                // Lấy text của Tên, Subject và Message trong card để đối chiếu
                const cardText = card.innerText.toLowerCase();
                
                if (cardText.includes(searchTerm)) {
                    card.style.display = 'block'; // Hiện nếu khớp
                    card.style.animation = 'fadeIn 0.3s ease'; 
                } else {
                    card.style.display = 'none'; // Ẩn nếu không khớp
                }
            });

            // Log số lượng tìm thấy để Thảo check
            const found = Array.from(allCards).filter(c => c.style.display !== 'none').length;
            console.log(`Tìm thấy: ${found} yêu cầu khớp với "${searchTerm}"`);
        });
    } else {
        console.error("Không tìm thấy ô Input nào có placeholder 'Tìm kiếm'. Thảo kiểm tra lại HTML nhé!");
    }
}

/* --- HỆ THỐNG ACTIVITY FEED THỜI GIAN THỰC --- */

// 1. Cấu hình các loại thông báo
const feedTypes = {
    USER: { icon: 'fa-user-plus', color: 'blue', label: 'Khách hàng mới' },
    TICKET: { icon: 'fa-ticket', color: 'green', label: 'Mua vé thành công' },
    EVENT: { icon: 'fa-calendar-check', color: 'purple', label: 'Sự kiện mới' },
    SUPPORT: { icon: 'fa-comment-dots', color: 'yellow', label: 'Tin nhắn hỗ trợ' }
};

function addActivity(type, title, content) {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    
    // Gọi hàm pushToFeed bạn đã viết sẵn
    pushToFeed(type, title, timeStr, content);
}

// Sửa lại hàm sync để không bị lặp thông báo cũ
function syncRealActivity() {
    const realUsers = JSON.parse(localStorage.getItem('ticket_users')) || [];
    if (realUsers.length === 0) return;

    const lastUser = realUsers[realUsers.length - 1];
    
    // Kiểm tra xem ID người dùng này đã được thông báo trong phiên làm việc này chưa
    const lastNotifiedUserId = sessionStorage.getItem('last_notified_user');

    if (lastUser && lastUser.id !== lastNotifiedUserId) {
        addNotification(lastUser.name, `Khách hàng vừa đăng ký tài khoản.`, 'USER');
        // Lưu lại để lần sau F5 không hiện lại nữa
        sessionStorage.setItem('last_notified_user', lastUser.id);
    }
}

// 2. Hàm thêm một dòng thông báo vào Feed
function pushToFeed(type, title, time, content, isReal = false) {
    const container = document.getElementById('live-feed-container');
    if (!container) return;

    const config = feedTypes[type] || feedTypes['EVENT'];
    const [displayTime, displayDate] = time.split(' - ');

    const html = `
        <div class="relative pl-14 animate-slide-in-right mb-8">
            <div class="absolute left-3 top-2 w-6 h-6 rounded-full bg-gray-900 border-2 border-${config.color}-500 flex items-center justify-center z-10">
                <i class="fa-solid ${config.icon} text-[8px] text-${config.color}-400"></i>
            </div>
            <div class="glass p-6 rounded-[2rem] border border-white/5 bg-white/[0.01]">
                <div class="flex justify-between items-center mb-3">
                    <div class="flex items-center gap-3">
                        <span class="px-2 py-1 bg-${config.color}-500/10 text-${config.color}-500 text-[9px] font-black rounded uppercase">${config.label}</span>
                        <h4 class="text-white text-sm font-bold">${title}</h4>
                    </div>
                    <div class="text-right">
                        <p class="text-white text-[11px] font-black">${displayTime}</p>
                        <p class="text-[9px] text-gray-500">${displayDate}</p>
                    </div>
                </div>
                <p class="text-[12px] text-gray-400 italic">${content}</p>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('afterbegin', html);
}

// 3. Hàm lấy dữ liệu THỰC từ LocalStorage
function syncRealDataToFeed() {
    const messages = JSON.parse(localStorage.getItem('contact_messages')) || [];
    const events = JSON.parse(localStorage.getItem('ticket_events')) || [];
    
    if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        pushToFeed('SUPPORT', lastMsg.name, "Vừa xong", lastMsg.message, true);
    }
}


// 5. Khởi chạy
function initLiveFeed() {
    const container = document.getElementById('live-feed-container');
    if (!container) return;

    // Chỉ hiện tin nhắn chào mừng hệ thống khi mới mở
    if (container.children.length === 0) {
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()} - ${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
        pushToFeed('EVENT', 'Hệ thống', timeStr, 'Admin đã kết nối và sẵn sàng.');
    }
    

}
function clearFeed() {
    document.getElementById('live-feed-container').innerHTML = '';
    pushToFeed('EVENT', 'Hệ thống', 'Vừa xong', 'Đã dọn dẹp dòng thời gian.');
}

// Thêm vào DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initLiveFeed();
});


function loadEventsAdmin() {
    const container = document.getElementById('admin-events-list'); // Tên ID container của cậu
    const allEvents = JSON.parse(localStorage.getItem('ticket_events')) || [];
    
    if (!container) return;
    container.innerHTML = "";

    allEvents.forEach(ev => {
        // Xử lý hiển thị danh sách vé (nếu có)
        let ticketsHTML = "";
        if (ev.tickets) {
            const tickets = typeof ev.tickets === 'string' ? JSON.parse(ev.tickets) : ev.tickets;
            ticketsHTML = tickets.map(t => 
                `<div class="text-[10px] bg-white/5 border border-white/10 p-1 px-2 rounded">
                    ${t.name}: ${Number(t.price).toLocaleString()}đ (SL: ${t.qty})
                </div>`
            ).join('');
        }

      
        const card = `
            <div id="event-card-${ev.id}" class="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6 animate-fade-in transition-all">
                <div class="flex flex-col md:flex-row gap-6">
                    <div class="w-full md:w-48 h-48 shrink-0">
                        <img src="${ev.img || 'https://via.placeholder.com/200'}" class="w-full h-full object-cover rounded-2xl border border-white/10">
                    </div>

                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="status-badge text-[10px] font-bold ${ev.status === 'active' ? 'text-green-500' : 'text-blue-500'} uppercase tracking-widest">
                                    ${ev.status === 'active' ? '● Đã phê duyệt' : '● Đang chờ duyệt'}
                                </span>
                                <h4 class="text-xl font-black text-white mt-1 uppercase">${ev.title || ev.name}</h4>
                            </div>
                            <span class="text-[10px] text-gray-500 font-mono">ID: ${ev.id}</span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                            <div class="space-y-2">
                                <p class="text-gray-400"><i class="fa-solid fa-tag w-5"></i> Loại: <span class="text-white">${ev.type || 'N/A'}</span></p>
                                <p class="text-gray-400"><i class="fa-solid fa-location-dot w-5"></i> Địa điểm: <span class="text-white">${ev.locname} (${ev.locdetail})</span></p>
                                <p class="text-gray-400"><i class="fa-solid fa-calendar w-5"></i> Thời gian: <span class="text-white">${ev.start} - ${ev.end}</span></p>
                            </div>
                            <div class="space-y-2 border-l border-white/5 pl-4">
                                <p class="text-gray-400"><i class="fa-solid fa-user-tie w-5"></i> BTC: <span class="text-white">${ev.btcname}</span></p>
                                <p class="text-gray-400"><i class="fa-solid fa-envelope w-5"></i> Email: <span class="text-white">${ev.btcemail}</span></p>
                                <p class="text-gray-400"><i class="fa-solid fa-phone w-5"></i> SĐT: <span class="text-white">${ev.btcphone}</span></p>
                            </div>
                        </div>

                        <div class="mt-4 p-4 bg-black/20 rounded-xl">
                            <p class="text-xs text-gray-500 uppercase font-bold mb-2">Mô tả sự kiện:</p>
                            <p class="text-gray-300 text-sm line-clamp-3">${ev.desc || 'Không có mô tả'}</p>
                            
                            <p class="text-xs text-gray-500 uppercase font-bold mt-4 mb-2">Phân loại vé:</p>
                            <div class="flex flex-wrap gap-2">
                                ${ticketsHTML || '<span class="text-gray-600">Chưa tạo vé</span>'}
                            </div>
                        </div>

                        <div class="action-area mt-6 flex justify-end gap-3 pt-4 border-t border-white/5">
                            <button onclick="approveEvent('${ev.id}', this)" 
                                class="px-6 py-2 bg-[#00d2ff] text-black text-[10px] font-black rounded-xl hover:scale-105 transition-all uppercase">
                                Duyệt ngay
                            </button>
                            <button onclick="openRejectModal('${ev.id}')" 
                                class="px-6 py-2 bg-red-500/10 text-red-500 text-[10px] font-black rounded-xl hover:bg-red-500 hover:text-white transition-all uppercase">
                                Từ chối
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
    });
}

function renderAdminTable() {
    const tableBody = document.getElementById('live-order-body');
    if (!tableBody) return;

    const data = localStorage.getItem('eventOrders');
    const savedOrders = data ? JSON.parse(data) : [];

    if (savedOrders.length === 0) return;
    const newOrdersHTML = savedOrders.reverse().map(order => {
        const totalQty = order.tickets ? order.tickets.reduce((sum, t) => sum + t.qty, 0) : 0;
        const parts = order.time ? order.time.split(' ') : ["--", "--"];
 return `
            <tr class="border-b border-white/5 bg-blue-500/5 transition order-row-real">
                <td class="p-6 font-mono text-green-500 text-xs font-bold">#${order.id}</td>
                <td class="p-6 text-gray-400 text-xs">${parts[0]}<br>${parts[1]}</td>
                <td class="p-6">
                    <p class="font-bold text-white text-sm">${order.customer}</p>
                    <p class="text-[10px] text-gray-500">${order.email || order.phone}</p>
                </td>
                <td class="p-6 text-gray-300 italic text-xs">${order.event}</td>
                <td class="p-6 text-center"><span class="bg-white/5 px-3 py-1 rounded-md text-xs font-bold">${String(totalQty).padStart(2, '0')}</span></td>
                <td class="p-6 font-black text-green-500 text-sm">${order.total}</td>
                <td class="p-6 text-right">
                    <span class="text-[9px] bg-green-500/10 text-green-500 px-2 py-1 rounded font-black uppercase">Mới</span>
                </td>
            </tr>
        `;
    }).join('');

    // CHÈN VÀO ĐẦU BẢNG (afterbegin) thay vì thay thế toàn bộ
    tableBody.insertAdjacentHTML('afterbegin', newOrdersHTML);
}

window.onfocus = function() {
    if (document.getElementById('deposits') && !document.getElementById('deposits').classList.contains('hidden')) {
        loadDeposits();
    }
};

// Đảm bảo hàm loadDeposits có kiểm tra sự tồn tại của ID
function loadDeposits() {
    const listContainer = document.getElementById('admin-deposit-list');
    if (!listContainer) {
        console.error("Không tìm thấy ID 'admin-deposit-list' trong HTML!");
        return;
    }
    const logs = JSON.parse(localStorage.getItem('admin_deposit_logs')) || [];
    
    if (logs.length === 0) {
        listContainer.innerHTML = `
            <tr>
                <td colspan="5" class="p-10 text-center text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                    Chưa có lịch sử giao dịch nào
                </td>
            </tr>`;
        return;
    }
// Hiển thị từ mới nhất đến cũ nhất
    listContainer.innerHTML = logs.slice().reverse().map((log) => `
        <tr class="border-b border-white/5 hover:bg-white/[0.01] transition">
            <td class="p-6 text-center w-[10%]">
                <span class="font-mono text-gray-500 text-xs">#${log.id || 'GD' + Math.floor(Math.random()*1000)}</span>
            </td>
            <td class="p-6 text-center w-[20%]">
                <p class="text-white font-bold text-sm truncate mx-auto max-w-[150px]">
                    ${log.user}
                </p>
            </td>
            <td class="p-6 text-center w-[15%] font-black text-green-400 whitespace-nowrap">
                +${Number(log.amount).toLocaleString()}đ
            </td>
            <td class="p-6 text-center w-[30%]">
                <div class="flex justify-center">
                    <span class="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded italic border border-white/5 truncate max-w-[250px]">
                        ${log.content || 'Nạp tiền vào tài khoản'}
                    </span>
                </div>
            </td>
            <td class="p-6 text-center w-[15%] text-gray-500 text-xs whitespace-nowrap">
                ${log.time}
            </td>
            <td class="p-6 text-center w-[10%]">
                <div class="flex justify-center">
                    <span class="text-[9px] font-black uppercase px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 whitespace-nowrap">
                        Hoàn tất
                    </span>
                </div>
            </td>
        </tr>
    `).join('');
}


// Lắng nghe từ tab khác (User nạp ở tab khác)
window.addEventListener('storage', (event) => {
    // 1. Khi có tin nhắn hỗ trợ mới
    if (event.key === 'contact_messages') {
        const messages = JSON.parse(event.newValue) || [];
        const lastMsg = messages[messages.length - 1];
        if (lastMsg) {
            addActivity('SUPPORT', lastMsg.name, `Gửi tin nhắn: "${lastMsg.message}"`);
        }
    }

    // 2. Khi có yêu cầu nạp tiền mới (Dựa trên key bạn dùng ở các câu trước)
    if (event.key === 'admin_deposit_logs') {
        const logs = JSON.parse(event.newValue) || [];
        const lastLog = logs[logs.length - 1];
        if (lastLog) {
            addActivity('TICKET', lastLog.user, `Vừa thực hiện nạp ${Number(lastLog.amount).toLocaleString()}đ`);
        }
    }

    // 3. Khi có khách đăng ký mới
    if (event.key === 'ticket_users') {
        const users = JSON.parse(event.newValue) || [];
        const lastUser = users[users.length - 1];
        if (lastUser) {
            addActivity('USER', lastUser.fullname, `Đã đăng ký tài khoản mới trên hệ thống.`);
        }
    }
});

// Lắng nghe nội bộ (Dành cho việc test hoặc dùng chung tab)
window.addEventListener('storage_updated', () => {
    loadDeposits();
});

document.addEventListener('DOMContentLoaded', () => {
    if (typeof loadDeposits === 'function') loadDeposits();
    if (typeof renderAdminTable === 'function') renderAdminTable();
});

/* --- 10. KHỞI CHẠY --- */
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    seedUsers();
    seedEvents();
    seedOrders();
    initDummySupport(); 
    startAutomation();
    startStatusAutomation();
    setupSupportSearch();
});

