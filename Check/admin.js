const BASE_TICKETS = 15402;
const BASE_REVENUE = 2840000000;
const BASE_USERS = 8920;
const TOTAL_VISIBLE_ORDERS_LIMIT = 100; 
const MAX_VISIBLE_DUMMY_ORDERS = 50;   

let totalTickets = parseInt(localStorage.getItem('total_tickets'));
let totalRevenue = parseFloat(localStorage.getItem('total_revenue'));
let totalUsers = parseInt(localStorage.getItem('total_users'));
const processedOrderIdsKey = 'admin_processed_order_ids';


if (isNaN(totalTickets) || totalTickets < BASE_TICKETS) totalTickets = BASE_TICKETS;
if (isNaN(totalRevenue) || totalRevenue < BASE_REVENUE) totalRevenue = BASE_REVENUE; 
if (isNaN(totalUsers) || totalUsers < BASE_USERS) totalUsers = BASE_USERS;

function getDashboardStats() {
    return JSON.parse(localStorage.getItem('admin_stats')) || {
        tickets: BASE_TICKETS,
        revenue: BASE_REVENUE,
        users: BASE_USERS
    };
}

function saveDashboardStats(stats) {
    localStorage.setItem('admin_stats', JSON.stringify(stats));
}

function getOrderSortTime(order = {}, isReal = false) {
    if (Number.isFinite(order.createdAt)) return order.createdAt;

    const rawTime = String(order.time || '').trim();
    const rawDate = String(order.date || '').trim();

    if (!isReal && rawDate && rawTime) {
        const isoDate = rawDate.split('/').reverse().join('-');
        const parsedDummy = new Date(`${isoDate} ${rawTime}`).getTime();
        if (Number.isFinite(parsedDummy)) return parsedDummy;
    }

    const timeParts = rawTime.split(' ').filter(Boolean);
    const hms = timeParts[0] || "00:00:00";
    const dmy = rawDate || timeParts[1] || "14/04/2026";
    const isoDate = dmy.split('/').reverse().join('-');
    const parsed = new Date(`${isoDate} ${hms}`).getTime();

    return Number.isFinite(parsed) ? parsed : 0;
}

function getMergedOrdersForAdmin() {
    const real = JSON.parse(localStorage.getItem('eventOrders')) || [];
    const dummy = JSON.parse(localStorage.getItem('admin_orders')) || [];

    const realOrders = real
        .filter(order => !order._isRefund)
        .map(order => {
            const rawTime = String(order.time || '').trim();
            const timeParts = rawTime.split(' ').filter(Boolean);
            const hms = timeParts[0] || "00:00:00";
            const dmy = String(order.date || timeParts[1] || "14/04/2026").trim();

            return {
                ...order,
                id: order.id,
                name: order.customer,
                event: order.event,
                price: Number(String(order.total).replace(/\D/g, '')) || 0,
                time: hms,
                date: dmy,
                _isReal: true,
                sortTime: getOrderSortTime(order, true)
            };
        });

    const dummyOrders = dummy
        .map(order => ({
            ...order,
            _isReal: false,
            sortTime: getOrderSortTime(order, false)
        }))
        .sort((a, b) => b.sortTime - a.sortTime)
        .slice(0, MAX_VISIBLE_DUMMY_ORDERS);

    let allOrders = [...realOrders, ...dummyOrders].sort((a, b) => b.sortTime - a.sortTime);
    
    if (allOrders.length > TOTAL_VISIBLE_ORDERS_LIMIT) {
        allOrders = allOrders.slice(0, TOTAL_VISIBLE_ORDERS_LIMIT);
    }
    
    return allOrders;
}

function syncDashboard() {
    if (!Number.isFinite(totalTickets) || totalTickets < BASE_TICKETS) totalTickets = BASE_TICKETS;
    if (!Number.isFinite(totalRevenue) || totalRevenue < BASE_REVENUE) totalRevenue = BASE_REVENUE;
    if (!Number.isFinite(totalUsers) || totalUsers < BASE_USERS) totalUsers = BASE_USERS;

    const tEl = document.getElementById('stat-tickets');
    const rEl = document.getElementById('stat-revenue');
    const uEl = document.getElementById('stat-users'); 

    if (tEl) tEl.innerText = totalTickets.toLocaleString();
    if (rEl) rEl.innerText = (totalRevenue / 1000000000).toFixed(3) + " tỷ";
    if (uEl) uEl.innerText = totalUsers.toLocaleString(); 
    
    // Lưu lại vào máy
    localStorage.setItem('total_tickets', totalTickets);
    localStorage.setItem('total_revenue', totalRevenue);
    localStorage.setItem('total_users', totalUsers);
    localStorage.setItem('dashboard_stats', JSON.stringify({
        tickets: totalTickets.toLocaleString('vi-VN'),
        revenue: (totalRevenue / 1_000_000_000).toFixed(3) + " tỷ",
        users: totalUsers.toLocaleString('vi-VN')
    }));
}

function loadDashboardStats() {
    const data = JSON.parse(localStorage.getItem('dashboard_stats'));
    if (data?.tickets || data?.revenue || data?.users) {
        const parsedTickets = parseInt(String(data.tickets).replace(/\D/g, ''));
        const parsedUsers = parseInt(String(data.users).replace(/\D/g, ''));
        const revenueText = String(data.revenue);
        const parsedRevenue = revenueText.includes('T')
            ? (parseFloat(revenueText.replace(/[^0-9.]/g, '')) || 0) * 1_000_000_000
            : revenueText.includes('tỷ')
                ? (parseFloat(revenueText.replace(/[^0-9.]/g, '')) || 0) * 1_000_000_000
                : parseInt(revenueText.replace(/\D/g, ''));

        if (!isNaN(parsedTickets) && parsedTickets > 0) totalTickets = Math.max(BASE_TICKETS, parsedTickets);
        if (!isNaN(parsedRevenue) && parsedRevenue > 0) totalRevenue = Math.max(BASE_REVENUE, parsedRevenue);
        if (!isNaN(parsedUsers) && parsedUsers > 0) totalUsers = Math.max(BASE_USERS, parsedUsers);
    }
    syncDashboard();
}

document.addEventListener('DOMContentLoaded', loadDashboardStats);

function getProcessedOrderIds() {
    try {
        return JSON.parse(localStorage.getItem(processedOrderIdsKey)) || [];
    } catch {
        return [];
    }
}

function saveProcessedOrderIds(ids) {
    localStorage.setItem(processedOrderIdsKey, JSON.stringify(ids));
}

function parseOrderAmount(order) {
    return Number(String(order?.total ?? order?.price ?? 0).replace(/\D/g, '')) || 0;
}

function parseOrderQuantity(order) {
    return Number(order?.quantity) || 1;
}

function seedProcessedOrdersFromCurrentData() {
    if (localStorage.getItem(processedOrderIdsKey)) return;

    const existingOrders = (JSON.parse(localStorage.getItem('eventOrders')) || [])
        .filter(order => !order._isRefund)
        .map(order => String(order.id))
        .filter(Boolean);

    saveProcessedOrderIds(existingOrders);
}

function reconcileDashboardFromOrders() {
    const orders = (JSON.parse(localStorage.getItem('eventOrders')) || []).filter(order => !order._isRefund);
    const seenIds = new Set(getProcessedOrderIds());
    let changed = false;

    orders.forEach(order => {
        const orderId = String(order.id || '');
        if (!orderId || seenIds.has(orderId)) return;

        totalTickets += parseOrderQuantity(order);
        totalRevenue += parseOrderAmount(order);
        seenIds.add(orderId);
        changed = true;
    });

    if (!changed) return;

    saveProcessedOrderIds([...seenIds]);
    syncDashboard();
}


function getAdminLogs() {
    try {
        return JSON.parse(localStorage.getItem('admin_activity_logs')) || [];
    } catch {
        return [];
    }
}

function saveAdminLogs(logs) {
    localStorage.setItem('admin_activity_logs', JSON.stringify(logs));
}

function logAdminAction(type, message, extra = {}) {
    const logs = getAdminLogs();

    logs.unshift({
        id: 'log-' + Date.now(),
        type,
        message,
        ...extra,
        time: new Date().toLocaleString()
    });

    if (logs.length > 200) logs.pop();

    saveAdminLogs(logs);
}

function loadAllAdminData() {
    try {
        const grid = document.getElementById('event-grid');
        const userGrid = document.getElementById('user-grid');
        
        // ===== 1. USERS SECTION =====
        if (userGrid && typeof seedUsers === "function") {
            seedUsers();
        }

        // ===== 2. EVENTS  =====
        let realEvents = JSON.parse(localStorage.getItem('ticket_events')) || [];
        let dummyEvents = JSON.parse(localStorage.getItem('admin_dummy_events')) || [];

        const markedReal = realEvents.map(ev => ({ 
            ...ev, 
            _isReal: true, 
            _sortKey: ev.createdAt || parseInt(String(ev.id).replace(/\D/g, '')) || Date.now() 
        }));

        const markedDummy = dummyEvents.map(ev => ({ 
            ...ev, 
            _isReal: false, 
            _sortKey: ev.createdAt || parseInt(String(ev.id).replace(/\D/g, '')) || 0 
        }));

        let allEvents = [...markedReal, ...markedDummy];

        allEvents.sort((a, b) => b._sortKey - a._sortKey);

        if (grid) {
            grid.innerHTML = '';
            if (typeof addEventCardToGrid === "function") {
                allEvents.forEach(ev => addEventCardToGrid(ev, ev._isReal));
            }
        }

        // ===== 3. ORDERS =====
        const body = document.getElementById('live-order-body');
        if (body) {
            body.innerHTML = ''; 
            let real = JSON.parse(localStorage.getItem('eventOrders')) || [];
            let dummy = JSON.parse(localStorage.getItem('admin_orders')) || [];

            let allOrders = [
                // Map dữ liệu
                ...dummy.map(o => ({
                    ...o, 
                    _isReal: false,
                    sortTime: o.createdAt || new Date(`${o.date.split('/').reverse().join('-')} ${o.time}`).getTime()
                })),
                // Map dữ liệu 
                ...real.filter(o => !o._isRefund).map(o => {
                    const timeParts = o.time ? o.time.split(' ') : ["00:00:00", "14/04/2026"];
                    const hms = timeParts[0]; 
                    const dmy = timeParts[1] || "14/04/2026";
                    const isoDate = dmy.split('/').reverse().join('-');
                    const finalSortTime = o.createdAt || new Date(`${isoDate} ${hms}`).getTime();

                    return {
                        ...o,
                        id: o.id,
                        name: o.customer, 
                        event: o.event, 
                        price: Number(String(o.total).replace(/\D/g, '')), 
                        time: hms,
                        date: dmy,
                        _isReal: true,
                        sortTime: finalSortTime 
                    };
                })
            ];

            allOrders.sort((a, b) => b.sortTime - a.sortTime);
            allOrders.forEach(o => renderOrderRow(o));
            body.innerHTML = '';
            getMergedOrdersForAdmin().forEach(o => renderOrderRow(o));
        }

        // ===== 4. SUPPORT  =====
        let supports = JSON.parse(localStorage.getItem('admin_support')) || [];
        if (window.allSupportData !== undefined) {
            window.allSupportData = supports;
            if (typeof renderSupportList === "function") {
                renderSupportList(supports);
            }
        }

        reconcileDashboardFromOrders();

    } catch (err) {
        console.error("Load data lỗi:", err);
    }
}


/* --- DỮ LIỆU MẪU --- */

const replyTemplates = {
    "payment": "Chào {name}, chúng tôi đã kiểm tra hệ thống. Giao dịch của bạn đang được ngân hàng xử lý, vui lòng chờ trong 5-10 phút nhé!",
    "location": "Chào {name}, địa điểm tổ chức sự kiện đã được gửi trong phần thông tin vé. Bạn có thể xem bản đồ tại mục 'Lịch trình' nhé.",
    "cancel": "Chào {name}, về yêu cầu hủy vé, bạn vui lòng gửi kèm ảnh chụp hóa đơn để chúng tôi tiến hành hoàn tiền theo quy định.",
    "default": "Chào {name}, AI đã nhận được yêu cầu của bạn và đang chuyển cho bộ phận hỗ trợ. Chúng tôi sẽ phản hồi bạn sớm nhất! "
};

const names = ["Minh Quân", "Huyền My", "Quốc Anh", "Thu Trang", "Hoàng Long", "Bảo Ngọc", "Thành Nam", "Ánh Tuyết", "Diệu Nhi", "Gia Bách"];
const eventNames = ["Những Thành Phố Mơ Màng", "Lululola Show", "Fintech GenZ 2026", "WorkShop Nến thơm", "Đà Lạt Mộng Mơ", "Tech Expo VNU", "Music Festival 2026"];
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

/* --- HÀM CHUYỂN TAB  --- */
function showTab(tabId, el) {
    // 1. Xử lý nội dung các Tab
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('hidden'); 
    });

    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
        targetTab.classList.remove('hidden'); 
    }

    // 2. Xử lý màu sắc Sidebar 
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active', 'text-blue-500', 'bg-white/5'); 
        link.classList.add('text-gray-400');
    });


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
        'refund': 'Lịch sử hoàn tiền',
        'support': 'Hỗ trợ khách hàng',
        'activity': 'Dòng thời gian '
    };
    
    if (document.getElementById('tab-title')) {
        document.getElementById('tab-title').innerText = titles[tabId] || 'Hệ thống';
    }

    if (tabId === 'support') {
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

    if (tabId === 'refund') {
        console.log("Đang mở tab Hoàn tiền...");
        if (typeof loadRefundData === 'function') {
            loadRefundData(); 
        }
    }
}

/* --- QUẢN LÝ KHÁCH HÀNG --- */
function seedUsers() {
    const userContainer = document.getElementById('users');
    if (!userContainer) return;

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
    const getUserSortKey = (u, idx, arrLength) => {
        const createdAt = Number(u.createdAt);
        if (Number.isFinite(createdAt) && createdAt > 0) return createdAt;

        const parsedTime = new Date(u.time || '').getTime();
        if (Number.isFinite(parsedTime) && parsedTime > 0) return parsedTime;

        return arrLength - idx;
    };

    const realUsers = (JSON.parse(localStorage.getItem('ticket_users')) || []).map((u, idx, arr) => ({
        ...u,
        isReal: true,
        name: u.fullName || u.name,
        _sortKey: getUserSortKey(u, idx, arr.length)
    }));

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

    const normalizedDummyUsers = dummyUsers.map((u, idx, arr) => ({
        ...u,
        _sortKey: getUserSortKey(u, idx, arr.length)
    }));

    const allUsers = [...realUsers, ...normalizedDummyUsers].sort((a, b) => b._sortKey - a._sortKey);

    const grid = document.getElementById('user-grid');
    if (grid) {
        grid.innerHTML = "";
        allUsers.forEach(user => {
            if (typeof addUserCardToGrid === 'function') {
                addUserCardToGrid(user, user.isReal, false);
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

function addUserCardToGrid(user, isReal, prepend = true) {
    const grid = document.getElementById('user-grid');
    if (!grid) return;
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
    
    grid.insertAdjacentHTML(prepend ? 'afterbegin' : 'beforeend', html); 
}

/*KHAI BÁO BIẾN TOÀN CỤC & KHỞI TẠO  */
function seedEvents() {
    const eventContainer = document.getElementById('events');
    if (!eventContainer) return;

    eventContainer.innerHTML = `
        <div class="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 px-2">
            <div class="relative w-full md:w-80">
                <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]"></i>
                <input type="text" id="search-events" onkeyup="filterEvents()" placeholder="Tìm tên sự kiện, BTC,địa điểm..." 
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
    loadAllAdminData();
}

/* QUẢN LÝ THẺ SỰ KIỆN  */
function addEventCardToGrid(ev, isReal) {
    const grid = document.getElementById('event-grid');
    if (!grid) return;
    const status = ev.status || 'pending';
   
    let buttonsHTML = '';
    let statusText = 'ĐANG CHỜ DUYỆT';
    let statusClass = 'text-blue-500';
    let cardBorder = 'border-white/5';

    if (status === 'active') {
        statusText = 'ĐÃ PHÊ DUYỆT';
        statusClass = 'text-green-500';
        cardBorder = 'border-green-500/50';
        buttonsHTML = `<button disabled class="text-[9px] font-bold text-gray-500 bg-white/10 px-3 py-1.5 rounded-lg cursor-not-allowed">ĐÃ DUYỆT</button>`;
    } else if (status === 'rejected') {
        statusText = 'BỊ TỪ CHỐI';
        statusClass = 'text-red-500';
        buttonsHTML = `
            <div class="flex items-center gap-2">
                <span class="text-[8px] text-red-400 bg-red-400/10 px-2 py-1 rounded">Lý do: ${ev.rejectReason || 'Từ chối'}</span>
                <button onclick="undoReject('${ev.id}')" class="text-blue-400 hover:text-white"><i class="fa-solid fa-rotate-left"></i></button>
            </div>`;
    } else {
        buttonsHTML = `
            <button onclick="openRejectModal('${ev.id}')" class="text-[9px] font-black text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg hover:bg-red-400 hover:text-white transition">TỪ CHỐI</button>
            <button onclick="approveEvent('${ev.id}', this)" class="text-[9px] font-black text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-500 transition shadow-lg shadow-blue-500/20">DUYỆT</button>
        `;
    }

    const displayLocation = ev.location || ev.city || ev.locname || 'N/A';
    const displayOrganizer = ev.organizer || ev.btcname || 'N/A';
    let minPrice = 0;
    let tickets = [];
    if (typeof ev.tickets === 'string') {
    try { tickets = JSON.parse(ev.tickets); } catch(e) { tickets = []; }
    } else {
    tickets = ev.tickets || [];
    }
    if (tickets.length > 0) {
    minPrice = Math.min(...tickets.map(t => Number(t.price) || 0));
    } else {
    minPrice = Number(ev.price) || 0;
    }

    const formattedPrice = minPrice.toLocaleString();

    const html = `
        <div id="event-card-${ev.id}" class="glass p-5 rounded-3xl group hover:border-blue-500/50 transition-all border ${cardBorder} relative">
            <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500 text-xl">
                    <i class="fa-solid fa-ticket"></i>
                </div>
                <div>
                    <h4 class="font-bold text-sm text-white truncate w-40">${ev.title || ev.name || 'N/A'}</h4>
                    <p class="status-badge text-[8px] ${statusClass} font-bold uppercase tracking-widest">${statusText}</p>
                </div>
            </div>
            <div class="space-y-2 text-[11px] text-gray-400 mb-4">
                <p><i class="fa-solid fa-location-dot w-5 text-blue-500"></i>${displayLocation}</p>
                <div class="flex items-center gap-2">
                    <p><i class="fa-solid fa-user-tie w-5 text-blue-500"></i>${displayOrganizer}</p>
                    <button onclick="viewEventDetails('${ev.id}')" class="w-5 h-5 rounded-full bg-white/5 hover:bg-blue-500/20 flex items-center justify-center transition" title="Xem chi tiết">
                        <i class="fa-solid fa-circle-info text-[10px] text-blue-400"></i>
                    </button>
                </div>
            </div>
            <div class="flex justify-between items-center pt-4 border-t border-white/5 action-area">
                <p class="text-sm font-black text-blue-500">${formattedPrice} đ</p>
                <div class="flex gap-2">
                    ${buttonsHTML} </div>
            </div>
        </div>
    `;
    grid.insertAdjacentHTML('beforeend', html);
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

/* LOGIC DUYỆT, TỪ CHỐI & HOÀN TÁC */
// DUYỆT SỰ KIỆN 
function approveEvent(eventId, btnElement) {
    const card = document.getElementById(`event-card-${eventId}`);
    if (card) {
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
        updateEventStatus(eventId, 'active');

        if (typeof addNotification === 'function') {
            addNotification("Hệ thống", `Sự kiện "${card.querySelector('h4').innerText}" đã được kích hoạt.`);
        }
    }
}

/**
 * HÀM GỘP: CẬP NHẬT TRẠNG THÁI SỰ KIỆN VÀO LOCALSTORAGE
 * @param {string|number} eventId 
 * @param {string} newStatus 
 * @param {string} reason 
 */
function updateEventStatus(eventId, newStatus, reason = "") {

    let realEvents = JSON.parse(localStorage.getItem('ticket_events')) || [];
    let dummyEvents = JSON.parse(localStorage.getItem('admin_dummy_events')) || [];
    let updated = false;

    const updateInArray = (arr) => {
        return arr.map(ev => {
            if (String(ev.id) === String(eventId)) {
                updated = true;
                return { ...ev, status: newStatus, rejectReason: reason };
            }
            return ev;
        });
    };

    const newReal = updateInArray(realEvents);
    const newDummy = updateInArray(dummyEvents);

    localStorage.setItem('ticket_events', JSON.stringify(newReal));
    localStorage.setItem('admin_dummy_events', JSON.stringify(newDummy));

    if (updated) {
        console.log(`✅ Đã chốt: ${eventId} sang ${newStatus}`);
    } else {
        console.error(`❌ Không tìm thấy ID ${eventId} trong bộ nhớ!`);
    }
}

// CÁC HÀM MODAL TỪ CHỐI 
function openRejectModal(eventId) {
    currentRejectingId = eventId;
    const modal = document.getElementById('reject-modal');
    
    if (modal) {
        modal.classList.remove('hidden');
        const content = modal.querySelector('div');
        if (content) content.classList.add('scale-100');
    }
}

function closeRejectModal() {
    const modal = document.getElementById('reject-modal');
    
    if (modal) {
        modal.classList.add('hidden');
        const content = modal.querySelector('div');
        if (content) content.classList.remove('scale-100');
    }
    
    currentRejectingId = null;
}

// --- 3. HÀM XÁC NHẬN TỪ CHỐI ---
function confirmReject(reason) {
    if (!currentRejectingId) return;
    const card = document.getElementById(`event-card-${currentRejectingId}`);
    
    if (card) {
        card.style.opacity = '0.7';
        card.classList.add('border-red-500/30'); 
        
        const badge = card.querySelector('.status-badge');
        if(badge) {
            badge.innerText = "● BỊ TỪ CHỐI";
            badge.classList.remove('text-blue-500', 'text-green-500');
            badge.classList.add('text-red-500');
        }

        const actionArea = card.querySelector('.action-area');
        if (actionArea) {
            const priceText = actionArea.querySelector('p')?.innerText || '0 đ';

            actionArea.innerHTML = `
                <p class="text-sm font-black text-blue-500">${priceText}</p>
                <div class="flex items-center gap-2 animate-fade-in">
                    <span class="text-[8px] text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-400/20 max-w-[120px] truncate">
                        Lý do: ${reason}
                    </span>
                    <button onclick="undoReject('${currentRejectingId}')" 
                        class="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-blue-400 hover:bg-blue-400 hover:text-white transition-all" 
                        title="Hoàn tác">
                        <i class="fa-solid fa-rotate-left text-[10px]"></i>
                    </button>
                </div>
            `;
        }

        updateEventStatus(currentRejectingId, 'rejected', reason);
        if (typeof addNotification === 'function') {
            addNotification("Hệ thống", `Đã từ chối sự kiện với lý do: ${reason}`);
        }
        closeRejectModal();
    }
}

// --- 4. HÀM HOÀN TÁC  ---
function undoReject(eventId) {
    const card = document.getElementById(`event-card-${eventId}`);
    if (card) {
        card.style.opacity = '1';
        card.classList.remove('grayscale', 'border-red-500/30');

        const badge = card.querySelector('.status-badge');
        if(badge) {
            badge.innerText = "● ĐANG CHỜ DUYỆT";
            badge.classList.remove('text-red-500', 'text-green-500');
            badge.classList.add('text-blue-500');
        }

        const actionArea = card.querySelector('.action-area');
        if (actionArea) {
            const priceText = actionArea.querySelector('p')?.innerText || '0 đ';

            actionArea.innerHTML = `
                <p class="text-sm font-black text-blue-500">${priceText}</p>
                <div class="flex gap-2 animate-fade-in">
                    <button onclick="openRejectModal('${eventId}')" 
                        class="text-[9px] font-black text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg hover:bg-red-400 hover:text-white transition">
                        TỪ CHỐI
                    </button>
                    <button onclick="approveEvent('${eventId}', this)" 
                        class="text-[9px] font-black text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-500 transition shadow-lg shadow-blue-500/20">
                        DUYỆT
                    </button>
                </div>
            `;
        }

        updateEventStatus(eventId, 'pending', '');

        if (typeof addNotification === 'function') {
            addNotification("Hệ thống", `Đã đưa sự kiện #${eventId} về trạng thái chờ duyệt`);
        }
    }
}

/* ==========================================================================
   4. MODAL CHI TIẾT
   ========================================================================== */
function viewEventDetails(eventId) {

    const allEvents = JSON.parse(localStorage.getItem('ticket_events')) || [];
    const ev = allEvents.find(item => String(item.id) === String(eventId));

    if (!ev) {
        console.error("Không tìm thấy dữ liệu!");
        return;
    }

    // --- 1. TIÊU ĐỀ & ẢNH ---
    const titleElem = document.getElementById('det-title');
    if (titleElem) titleElem.innerText = ev.title || ev.name || 'Sự kiện';
    
    // Lấy link ảnh an toàn
    const posterImg = ev.img || ev.image || 'https://via.placeholder.com/400x600?text=No+Poster';
    const bannerImg = ev.banner || ev.img || ev.image || 'https://via.placeholder.com/1200x400?text=No+Banner';
    
    const coverElem = document.getElementById('det-cover');
    const thumbElem = document.getElementById('det-thumb');

    if (coverElem) {
        coverElem.src = bannerImg; 
        coverElem.style.cursor = 'zoom-in'; 
        coverElem.style.position = 'relative'; 
        coverElem.style.zIndex = '10';       
        coverElem.onclick = (e) => {
            e.stopPropagation();
            openLightbox(bannerImg);
        };
    }

    if (thumbElem) {
        thumbElem.src = posterImg; 
        thumbElem.style.cursor = 'zoom-in';
        thumbElem.style.position = 'relative';
        thumbElem.style.zIndex = '20';        
        thumbElem.onclick = (e) => {
            e.stopPropagation();
            openLightbox(posterImg);
        };
    }
    
    // --- 2. ĐỊA ĐIỂM CHI TIẾT & THỜI GIAN ---

    const locNameElem = document.getElementById('det-loc-name');
    if (locNameElem) locNameElem.innerText = ev.locname || 'N/A';

    const locDetailElem = document.getElementById('det-loc-detail');
    if (locDetailElem) locDetailElem.innerText = ev.locdetail || 'N/A';


    if (document.getElementById('det-time-full')) {
    const timeSlots = ev.timeSlots || ev.timeslots || [];
    let timeHTML = "";

    if (Array.isArray(timeSlots) && timeSlots.length > 0) {
        timeSlots.forEach((slot, index) => {
            const start = slot.start ? slot.start.replace('T', ' ') : 'N/A';
            const end = slot.end ? slot.end.replace('T', ' ') : 'N/A';
            
            timeHTML += `
                <div class="mb-2 last:mb-0 pb-1 border-b border-white/5 last:border-0">
                    <span class="text-blue-400 font-bold">#${index + 1}:</span> ${start} 
                    <i class="fa-solid fa-arrow-right mx-1 text-[8px] opacity-50"></i> 
                    ${end}
                </div>`;
        });
    } else {
        timeHTML = "N/A";
    }

    document.getElementById('det-time-full').innerHTML = timeHTML;}

    const trailerContainer = document.getElementById('det-trailer-area');

    if (ev.trailer && ev.trailer.trim() !== "") {
    trailerContainer.innerHTML = `
        <h3 class="text-[10px] text-red-500 font-black uppercase mb-3 tracking-widest flex items-center gap-2">
            <i class="fa-brands fa-youtube"></i> Link Trailer
        </h3>
        <a href="${ev.trailer}" target="_blank" 
           class="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-2xl group hover:bg-red-500 transition-all duration-300">
            <div class="flex items-center gap-3">
                <i class="fa-brands fa-youtube text-red-500 text-xl group-hover:text-white"></i>
                <span class="text-white font-bold text-xs uppercase group-hover:text-white">Bấm vào để xem chi tiết</span>
            </div>
            <i class="fa-solid fa-arrow-up-right-from-square text-red-500 group-hover:text-white text-xs"></i>
        </a>`;
    } else {
    trailerContainer.innerHTML = '';
    }

    // --- 3. HỒ SƠ PHÁP LÝ  ---
    const legalTypeElem = document.getElementById('det-legal-type');
    if (legalTypeElem) {
    const orgMap = {
        'organization': 'Doanh nghiệp / Tổ chức',
        'individual': 'Cá nhân đại diện'
    };
    const rawValue = ev.orgType || ev.orgtype || 'organization';
    const finalName = orgMap[rawValue] || rawValue;
    legalTypeElem.innerText = finalName.toUpperCase();
    }

    const modeElem = document.getElementById('event-mode-input');
    if (modeElem) {
    const mVal = ev.mode || ev.eventMode || 'offline';
    const mNames = { 'online': 'SỰ KIỆN ONLINE', 'offline': 'SỰ KIỆN OFFLINE' };
    modeElem.innerText = mNames[mVal] || mVal.toUpperCase();
    }

    // Mã số thuế
    const taxElem = document.getElementById('tax-id-input');
    if (taxElem) {
    taxElem.innerText = ev.taxid || ev.tax_id || ev['tax-id'] || ev.taxId || 'N/A';
    }

    // Số GP/CMND
    const legalElem = document.getElementById('legal-id-input');
    if (legalElem) {
    legalElem.innerText = ev.legalid || ev.legal_id || ev['legal-id'] || ev.legalId || 'N/A';
    }

    // Chính sách hoàn tiền
    const refundElem = document.getElementById('refund-policy');
    if (refundElem) {
    const policyMap = {
        'none': 'Không hỗ trợ hoàn trả',
        'strict': 'Chặt chẽ (Hoàn trước 7 ngày, phí 30%)',
        'flexible': 'Linh hoạt (Hoàn trước 3 ngày, phí 10%)',
        'custom': 'Tùy chỉnh theo thỏa thuận riêng'
    };
    const policyValue = ev.refundPolicy || ev.refund || "none";
    refundElem.innerText = policyMap[policyValue] || policyValue;
    }

    // Trách nhiệm bồi thường
    const compenElem = document.getElementById('det-compensation');
    if (compenElem) {
    const compenMap = {
        'refund_100': 'Hoàn tiền 100% nếu sự kiện bị hủy',
        'reschedule': 'Dời ngày và bảo lưu giá trị vé'
    };
    const compenValue = ev.compensation || "";
    compenElem.innerText = compenMap[compenValue] || compenValue || 'N/A';
    }

    // Tệp đính kèm
    const filesElem = document.getElementById('det-files-list');
    if (filesElem) {
        const legalLink = ev.legalFilesLink || "";
        if (legalLink) {
            filesElem.innerHTML = `
            <div class="flex flex-wrap gap-2 mt-1">
            <a href="${legalLink}" target="_blank" 
                class="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20 transition-all hover:bg-blue-500/20 group">
                    <i class="fa-solid fa-link text-[12px]"></i> 
                    <span class="text-[10px] font-bold uppercase tracking-tight">Truy cập hồ sơ pháp lý</span>
                    <i class="fa-solid fa-arrow-up-right-from-square text-[8px] ml-1"></i>
                </a>
            </div>`;
    } 
    else {
        filesElem.innerHTML = '<span class="text-gray-600 italic text-[10px]">Không có link hồ sơ</span>';
    }
    }

    // Nội quy
    if (document.getElementById('det-rules')) {
    document.getElementById('det-rules').innerText = ev.rules || ev.event_rules || 'Chưa có nội quy cụ thể.';
    }
    
    // --- 3. BAN TỔ CHỨC  ---
  
    if (document.getElementById('det-btc-name')) 
        document.getElementById('det-btc-name').innerText = ev.btcname || ev.organizer || 'Chưa có tên';
    
    if (document.getElementById('det-btc-email')) 
        document.getElementById('det-btc-email').innerText = ev.btcemail || ev.email || 'N/A';
    
    if (document.getElementById('det-btc-phone')) 
        document.getElementById('det-btc-phone').innerText = ev.btcphone || ev.phone || 'N/A';
    
    if (document.getElementById('det-btc-info')) 
        document.getElementById('det-btc-info').innerText = ev.btcinfo || 'Ban tổ chức sự kiện';

    // Ảnh Logo BTC
    const btcLogoElem = document.getElementById('det-btc-logo');
    if (btcLogoElem) {
        btcLogoElem.src = ev.btclogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(ev.btcname || 'BTC')}&background=00d2ff&color=fff`;
    }

    // --- 4. TÀI KHOẢN NGÂN HÀNG ---
    if (document.getElementById('det-bank-name')) 
        document.getElementById('det-bank-name').innerText = ev.bankname || ev.bankName || 'N/A';
    
    if (document.getElementById('det-bank-acc')) 
        document.getElementById('det-bank-acc').innerText = ev.bankacc || ev.accountNumber || 'N/A';
    
    if (document.getElementById('det-bank-user')) 
        document.getElementById('det-bank-user').innerText = ev.bankuser || ev.bankHolder || 'N/A';

    if (document.getElementById('det-bank-branch')) 
        document.getElementById('det-bank-branch').innerText = ev.bankbranch || 'N/A';

    const qrElem = document.getElementById('det-bank-qr'); 
    if (qrElem && ev.bankqr) {
        qrElem.src = ev.bankqr;
        qrElem.classList.remove('hidden');
        qrElem.classList.add('cursor-zoom-in');
        qrElem.onclick = () => openLightbox(ev.bankqr);
    }

    // --- 5. CÁC THÔNG TIN KHÁC ---
    if (document.getElementById('det-mode-text')) 
    document.getElementById('det-mode-text').innerText = ev.mode || 'N/A'; 

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
                <div class="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 mb-3 hover:bg-white/10 transition-all">
                    <div class="flex flex-col">
                        <p class="text-white text-sm font-bold tracking-wide">${t.name}</p>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-[9px] px-2 py-0.5 bg-[#00d2ff]/10 text-[#00d2ff] rounded-full font-bold">SL: ${t.qty || 0}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-[#00d2ff] font-black text-lg">${Number(t.price).toLocaleString()} <span class="text-[10px] ml-0.5">đ</span></p>
                    </div>
                </div>`;
        });
    if (ev.map) {
            ticketContainer.innerHTML += `
                <div class="mt-4">
                    <p class="text-[10px] text-gray-500 uppercase font-black mb-2">Sơ đồ chỗ ngồi (Bấm để xem rõ):</p>
                    <img src="${ev.map}" onclick="openLightbox('${ev.map}')" class="w-full rounded-2xl border border-white/10 shadow-lg cursor-zoom-in hover:opacity-80 transition">
                </div>`;
        }
    }

    const favContainer = document.getElementById('fav-btn-container');
    if (favContainer) favContainer.remove(); 

    // --- 7. HIỆN MODAL  ---
    const modal = document.getElementById('detail-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex'); 
        const modalContent = modal.querySelector('div');
        if (modalContent) {
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }
    }
}

function closeDetailModal() {
    const modal = document.getElementById('detail-modal');
    modal.querySelector('div').classList.replace('scale-100', 'scale-95');
    setTimeout(() => modal.classList.add('hidden'), 200);
}

/* CẤU TRÚC HTML MODAL  */

document.body.insertAdjacentHTML('beforeend', `
   <div id="reject-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] hidden flex items-center justify-center p-4">
        <div class="bg-[#1a1a1a] border border-white/10 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl scale-95 transition-all">
            <h3 class="text-white font-bold text-lg mb-2">Lý do từ chối</h3>
            <p class="text-gray-400 text-xs mb-6">Vui lòng chọn lý do để phản hồi cho đối tác tạo sự kiện.</p>
            <div class="space-y-3 mb-8 max-h-[320px] overflow-y-auto pr-2 custom-scroll">
                <button onclick="confirmReject('Sản phẩm vi phạm pháp luật')" class="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/50 hover:bg-red-500/5 text-gray-300 text-xs transition">🚫 Sản phẩm vi phạm pháp luật</button>
                <button onclick="confirmReject('Nội dung chưa đầy đủ')" class="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-yellow-500/50 hover:bg-yellow-500/5 text-gray-300 text-xs transition">📝 Nội dung chưa đầy đủ</button>
                <button onclick="confirmReject('Tiêu chuẩn hình ảnh không đạt')" class="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 text-gray-300 text-xs transition">🖼️ Tiêu chuẩn kiểm duyệt hình ảnh</button>
                <button onclick="confirmReject('Thông tin liên hệ BTC không hợp lệ')" class="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/50 hover:bg-orange-500/5 text-gray-300 text-xs transition">📞 Thông tin liên hệ BTC không hợp lệ</button>
                <button onclick="confirmReject('Sai lệch thông tin địa điểm')" class="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 text-gray-300 text-xs transition">📍 Sai lệch thông tin địa điểm</button>
                <button onclick="confirmReject('Giá vé không hợp lệ hoặc quá cao')" class="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/50 hover:bg-pink-500/5 text-gray-300 text-xs transition">💰 Giá vé không hợp lệ</button>
                <button onclick="confirmReject('Sự kiện có dấu hiệu lừa đảo')" class="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-red-700/50 hover:bg-red-700/5 text-gray-300 text-xs transition">⚠️ Sự kiện có dấu hiệu lừa đảo</button>
                <button onclick="confirmReject('Thiếu giấy phép tổ chức')" class="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-gray-300 text-xs transition">📜 Thiếu giấy phép tổ chức (theo yêu cầu)</button>
                <button onclick="confirmReject('Nội dung mang tính chất spam')" class="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-gray-500/50 hover:bg-gray-500/5 text-gray-300 text-xs transition">🧹 Nội dung mang tính chất spam</button>
            </div>
            <button onclick="closeRejectModal()" class="w-full py-3 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition">Hủy bỏ</button>
        </div>
    </div>

  
 <div id="detail-modal" class="fixed inset-0 bg-black/90 backdrop-blur-md z-[1000] hidden flex items-center justify-center p-4">
    <div class="bg-[#121212] border border-white/10 w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl scale-95 transition-all">
      
   <div class="relative h-48 w-full flex-shrink-0">
    <img id="det-cover" src="" class="w-full h-full object-cover opacity-50 relative z-0">
    
    <div class="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent z-10 pointer-events-none"></div>

    <button onclick="closeDetailModal()" class="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition">
        <i class="fa-solid fa-xmark"></i>
    </button>

    <div class="absolute bottom-4 left-8 flex items-end gap-6 z-20">
        <img id="det-thumb" src="" class="w-24 h-24 rounded-2xl object-cover border-4 border-[#121212] shadow-xl bg-gray-800 cursor-zoom-in">
        
        <div class="mb-2">
            <div class="flex gap-2 mb-1.5">
                <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider shadow-sm">
                    <i class="fa-solid fa-circle text-[5px] animate-pulse"></i>
                    <span id="event-mode-input">N/A</span>
                </span>

                <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-wider shadow-sm">
                    <i class="fa-solid fa-shield-halved text-[8px]"></i>
                    <span id="det-legal-type">N/A</span>
                </span>
            </div>

            <div class="flex items-center gap-3">
                <h2 id="det-title" class="text-3xl font-black text-white uppercase tracking-tighter truncate drop-shadow-md">
                    CONCERT
                </h2>
                <span id="det-category" class="text-[11px] bg-blue-600 text-white px-3 py-1 rounded-lg font-black uppercase whitespace-nowrap shadow-md">
                    MUSIC
                </span>
            </div>
        </div>
    </div>
</div>

        <div class="p-8 overflow-y-auto custom-scroll space-y-8">
            <div class="grid grid-cols-2 gap-4">
                <div class="glass p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p class="text-[10px] text-gray-500 uppercase font-black mb-1">Thời gian tổ chức</p>
                    <p class="text-[11px] text-gray-200"><i class="fa-regular fa-clock mr-2 text-blue-500"></i><span id="det-time-full">N/A</span></p>
                </div>
                <div class="glass p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p class="text-[10px] text-gray-500 uppercase font-black mb-1">Địa điểm</p>
                    <p class="text-[11px] text-gray-200"><i class="fa-solid fa-location-dot mr-2 text-blue-500"></i><span id="det-loc-name">N/A</span></p>
                    <p class="text-[10px] text-gray-400 mt-1 italic"><i class="fa-solid fa-map-pin mr-2 text-blue-400"></i><span id="det-loc-detail">N/A</span></p>
                </div>
            </div>

            <div id="det-trailer-area"></div>

            <div>
                <h3 class="text-sm font-bold text-white mb-2 uppercase tracking-widest text-blue-500">Thông tin sự kiện</h3>
                <p id="det-desc" class="text-xs text-gray-400 leading-relaxed whitespace-pre-line bg-white/[0.02] p-4 rounded-2xl border border-white/5">N/A</p>
            </div>

            <div class="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                <h3 class="text-[10px] text-blue-500 font-black uppercase mb-3 tracking-widest flex items-center gap-2">
                    <i class="fa-solid fa-shield-halved"></i> Hồ sơ pháp lý & Quy định
                </h3>
                <div class="grid grid-cols-2 gap-4 text-[10px] border-b border-white/5 pb-3">
                    <div><span class="text-gray-500 block">Mã số thuế:</span> <span id="tax-id-input" class="text-gray-200 font-bold font-mono">N/A</span></div>
                    <div><span class="text-gray-500 block">Số GP/CMND:</span> <span id="legal-id-input" class="text-gray-200 font-bold font-mono">N/A</span></div>
                </div>
                <div class="mt-3 space-y-2 text-[10px]">
                    <div class="flex justify-between italic"><span class="text-gray-500">Chinh sách hoàn tiền:</span> <span id="refund-policy" class="text-blue-400 font-bold">N/A</span></div>
                    <div class="flex justify-between italic"><span class="text-gray-500">Trách nhiệm bồi thường:</span> <span id="det-compensation" class="text-blue-400 font-bold">N/A</span></div>
                    <div class="flex justify-between items-center italic"><span class="text-gray-500">Liên kết hồ sơ:</span> <span id="det-files-list">N/A</span></div>
                </div>
                <div class="mt-4 p-3 bg-white/5 rounded-xl">
                    <p class="text-[9px] text-gray-500 uppercase font-bold mb-1">Nội quy sự kiện:</p>
                    <p id="det-rules" class="text-[10px] text-gray-400 whitespace-pre-line leading-relaxed italic">N/A</p>
                </div>
            </div>

            <div>
                <h3 class="text-sm font-bold text-white mb-3 uppercase tracking-widest text-blue-500">Hạng vé</h3>
                <div id="det-tickets" class="space-y-2"></div>
            </div>

            <div class="border-t border-white/5 pt-6">
                <h3 class="text-sm font-bold text-white mb-4 uppercase tracking-widest text-blue-500">Ban tổ chức</h3>
                <div class="flex items-start gap-4 mb-4">
                    <img id="det-btc-logo" src="" class="w-14 h-14 rounded-full object-cover border-2 border-blue-500/20">
                    <div class="flex-1">
                        <h4 id="det-btc-name" class="font-bold text-white text-base">N/A</h4>
                        <p id="det-btc-info" class="text-[11px] text-gray-500 mt-1 italic leading-tight">N/A</p>
                        
                        <div class="flex flex-wrap gap-4 mt-3">
                            <span class="text-[10px] text-gray-400"><i class="fa-solid fa-envelope text-blue-500 mr-1"></i> <span id="det-btc-email">N/A</span></span>
                            <span class="text-[10px] text-gray-400"><i class="fa-solid fa-phone text-blue-500 mr-1"></i> <span id="det-btc-phone">N/A</span></span>
                        </div>
                    </div>
                </div>

                <div class="bg-blue-500/5 border border-blue-500/10 p-5 rounded-3xl mt-4 flex justify-between items-center gap-4">
                    <div class="flex-1 min-w-0">
                        <p class="text-[10px] text-blue-500 font-black uppercase mb-2">Tài khoản nhận tiền</p>
                        <div class="space-y-1">
                            <p class="text-[10px] text-gray-400">Ngân hàng: <span id="det-bank-name" class="text-white font-bold">N/A</span></p>
                            <p class="text-[10px] text-gray-400 truncate">Chi nhánh: <span id="det-bank-branch" class="text-white font-bold">N/A</span></p>
                            <p class="text-lg text-[#00d2ff] font-black font-mono tracking-wider leading-none my-2" id="det-bank-acc">0000000000</p>
                            <p class="text-[10px] text-gray-500 uppercase tracking-tighter">Chủ TK: <span id="det-bank-user" class="text-white">N/A</span></p>
                        </div>
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <div class="flex-shrink-0 bg-white p-1.5 rounded-xl shadow-lg">
                            <img id="det-bank-qr" src="" alt="QR Code" class="w-20 h-20 object-contain">
                        </div>
                         <span class="text-[7px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded uppercase font-bold whitespace-nowrap">Giao dịch an toàn</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="image-lightbox" class="fixed inset-0 bg-black/95 backdrop-blur-xl z-[2000] hidden flex items-center justify-center p-4 cursor-zoom-out" onclick="closeLightbox()">
        <button class="absolute top-10 right-10 text-white text-4xl hover:text-red-500 transition-all">&times;</button>
        <img id="lightbox-img" src="" class="max-w-full max-h-full rounded-lg shadow-2xl scale-90 transition-transform duration-300">
    </div>

    <style>
        #image-lightbox.active { display: flex; }
        #image-lightbox.active img { scale: 1; }
        .cursor-zoom-in { cursor: zoom-in; }
    </style>
`);

function openLightbox(src) {
    const lb = document.getElementById('image-lightbox');
    const lbImg = document.getElementById('lightbox-img');
    if (!lb || !lbImg || !src) return;

    lbImg.src = src;
    lb.classList.remove('hidden');
    lb.classList.add('flex');
    setTimeout(() => {
        lb.classList.add('active');
    }, 10);
}

function closeLightbox() {
    const lb = document.getElementById('image-lightbox');
    if (!lb) return;

    lb.classList.remove('active');
    setTimeout(() => {
        lb.classList.add('hidden');
        lb.classList.remove('flex');
    }, 300);
}

/* QUẢN LÝ ĐƠN HÀNG */
function seedOrders() {
    const ordersTab = document.getElementById('orders');
    if (!ordersTab) return;

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
            <div class="overflow-x-auto"> 
                <table class="w-full text-left border-collapse" id="live-order-table">
                    <thead class="text-gray-500 border-b border-white/5 bg-white/[0.02]">
                        <tr>
                            <th class="p-5 font-bold uppercase text-[10px] tracking-wider w-[12%]">Mã đơn</th>
                            <th class="p-5 font-bold uppercase text-[10px] tracking-wider w-[15%]">Thời gian</th>
                            <th class="p-5 font-bold uppercase text-[10px] tracking-wider w-[23%]">Khách hàng</th>
                            <th class="p-5 font-bold uppercase text-[10px] tracking-wider w-[20%]">Sự kiện</th>
                            <th class="p-5 font-bold uppercase text-[10px] tracking-wider text-center w-[8%]">Số vé</th>
                            <th class="p-5 font-bold uppercase text-[10px] tracking-wider w-[12%]">Số tiền</th>
                            <th class="p-5 font-bold uppercase text-[10px] tracking-wider text-right w-[10%]">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody id="live-order-body"></tbody> </table>
            </div>
        </div>`;
}

function loadSavedOrders() {
    seedOrders();       // 1. Tạo khung bảng
    loadAllAdminData(); // 2. Nạp dữ liệu 
}

function filterOrders() {
    const query = document.getElementById('search-orders').value.toLowerCase();
    const rows = document.querySelectorAll('.order-row');

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
    });
}

function addLiveOrder(name, event, price = 0, isReplay = false, orderObj = {}) {
    if (orderObj._isRefund) return;
    const body = document.getElementById('live-order-body');
    if (!body) return;

    const finalPrice = price || orderObj.price || 0;
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(finalPrice);
    const timeDisplay = orderObj.time || new Date().toLocaleTimeString('vi-VN');
    const dateDisplay = orderObj.date || new Date().toLocaleDateString('vi-VN');
    const orderId = orderObj.id || `TK-${Math.floor(20000 + Math.random() * 70000)}`;
    const status = orderObj._isReal ? "HOÀN TẤT" : "MỚI";
    const statusClass = orderObj._isReal ? "bg-green-500/10 text-green-500" : "bg-blue-500 text-white animate-bounce";

    const row = `
        <tr class="border-b border-white/5 ${orderObj._isReal ? '' : 'bg-blue-500/5'} transition order-row">
            <td class="p-6 font-mono text-[11px] text-blue-500 font-bold">${orderId}</td>
            <td class="p-6 text-gray-400 text-xs">
                <p>${timeDisplay}</p>
                <p class="text-[10px] opacity-50">${dateDisplay}</p>
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
                <span class="text-[9px] ${statusClass} font-black px-2 py-1 rounded uppercase">${status}</span>
            </td>
        </tr>`;
        
    body.insertAdjacentHTML('afterbegin', row);
    if (!isReplay && !orderObj._isReal) {
        try {
            let orders = JSON.parse(localStorage.getItem('admin_orders')) || [];
            orders.unshift({
                id: orderId,
                name: name,
                event: event,
                price: actualPrice,
                time: timeDisplay,
                date: dateDisplay,
                _isReal: false
            });
            if (orders.length > 50) orders.pop();
            localStorage.setItem('admin_orders', JSON.stringify(orders));
        } catch (e) { console.log(e); }
    }
}


function renderOrderRow(orderObj) {
    const body = document.getElementById('live-order-body');
    if (!body || orderObj._isRefund) return;

    const formattedPrice = new Intl.NumberFormat('vi-VN').format(orderObj.price || 0);
    const status = orderObj._isReal ? "HOÀN TẤT" : "MỚI";
    const statusClass = orderObj._isReal ? "bg-green-500/10 text-green-500" : "bg-blue-500 text-white";

    let rawId = String(orderObj.id).replace('TK-', ''); 
    if (rawId.length > 10) {
        rawId = rawId.slice(-10);
    }
    const displayId = `TK-${rawId}`; 

    const row = `
        <tr class="border-b border-white/5 ${orderObj._isReal ? '' : 'bg-blue-500/5'} transition order-row">
            <td class="p-6 font-mono text-[11px] text-blue-500 font-bold">${displayId}</td>
            <td class="p-6 text-gray-400 text-xs">
                <p>${orderObj.time || '00:00:00'}</p>
                <p class="text-[10px] opacity-50">${orderObj.date || '14/04/2026'}</p>
            </td>
            <td class="p-6">
                <p class="font-black text-white text-sm">${orderObj.name || orderObj.customer}</p>
                <p class="text-[10px] text-gray-500">${(orderObj.name || "khach").toLowerCase().replace(/\s/g, '')}@gmail.com</p>
            </td>
            <td class="p-6 text-xs text-gray-300 italic">${orderObj.event}</td>
            <td class="p-6 text-center"><span class="bg-white/5 px-3 py-1 rounded-md text-xs font-bold">01</span></td>
            <td class="p-6 font-bold text-green-500 text-sm">${formattedPrice}đ</td>
            <td class="p-6 text-right">
                <span class="text-[9px] ${statusClass} font-black px-2 py-1 rounded uppercase">${status}</span>
            </td>
        </tr>`;
        
    body.insertAdjacentHTML('beforeend', row);
}

/* --- HÀM TỰ ĐỘNG HÓA ĐA NHIỆM TỔNG HỢP --- */
function startAutomation() {

    setInterval(() => {
       const randomAction = Math.random();
        const buyer = names[Math.floor(Math.random() * names.length)];
        const event = eventNames[Math.floor(Math.random() * eventNames.length)];
        const timestamp = new Date().toLocaleString('vi-VN');
        const now = Date.now();
        const orderId = 'TK-' + now;

        /// KỊCH BẢN 1: Bán vé ảo 
        if (randomAction > 0.7) {
            // Check if we can add dummy: get current merged visible count
            const currentMerged = getMergedOrdersForAdmin();
            if (currentMerged.length >= TOTAL_VISIBLE_ORDERS_LIMIT) {
                console.log("Dummy order skipped: visible limit reached (", currentMerged.length, ")");
            } else {
                const originalPrice = (Math.floor(Math.random() * 10) + 5) * 100000; 
                const salesOrder = { 
                    id: orderId, 
                    name: buyer, 
                    event: event, 
                    price: originalPrice, 
                    time: new Date().toLocaleTimeString('vi-VN'),
                    date: new Date().toLocaleDateString('vi-VN'),
                    createdAt: now, 
                    _isReal: false 
                };

                try {
                    let adminOrders = JSON.parse(localStorage.getItem('admin_orders')) || [];
                    adminOrders.unshift(salesOrder);
                    if (adminOrders.length > MAX_VISIBLE_DUMMY_ORDERS) adminOrders.pop();
                    localStorage.setItem('admin_orders', JSON.stringify(adminOrders));
                } catch (e) { console.error("Lưu đơn ảo lỗi:", e); }
                
                addLiveOrder(buyer, event, originalPrice, true, salesOrder);
                updateDashboardStats(1, originalPrice, 0);

                logAdminAction('ORDER', `Đơn hàng ảo mới: ${buyer} mua vé ${event} (limit OK)`);
            }

            logAdminAction('ORDER', `Đơn hàng mới: ${buyer} mua vé ${event}`);
            addNotification("Giao dịch", `Khách hàng ${buyer} vừa đặt vé thành công.`);
        }


        // KỊCH BẢN 2: Khách hàng mới 
        else if (randomAction > 0.45) {
            const dummyUser = {
                id: 'dummy-' + timestamp,
                name: buyer,
                email: `${buyer.toLowerCase().replace(/\s/g, '')}${Math.floor(Math.random()*99)}@gmail.com`,
                avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
                spend: "0",
                createdAt: Date.now()
            };

            updateDashboardStats(0, 0, 1);
            
            if (typeof addUserCardToGrid === "function") {
                addUserCardToGrid(dummyUser, false); 
            }

            try {
                let users = JSON.parse(localStorage.getItem('admin_dummy_users')) || [];
                users.unshift(dummyUser);
                localStorage.setItem('admin_dummy_users', JSON.stringify(users));
            } catch {}

            logAdminAction('USER', `${dummyUser.name} đăng ký`, {
                userId: dummyUser.id
            });
            addNotification("Thành viên", `Khách hàng mới: ${buyer} vừa gia nhập.`);
        }

        // KỊCH BẢN 3: Sự kiện mới ảo
        else if (randomAction > 0.2) {
            const now = Date.now(); 
            const dummyEv = {
                id: 'ev-' + now, 
                title: event,
                location: locations[Math.floor(Math.random() * locations.length)],
                organizer: "BTC " + buyer,
                price: (Math.floor(Math.random() * 8) + 2) * 100000,
                createdAt: now 
            };

            try {
                let dummyList = JSON.parse(localStorage.getItem('admin_dummy_events')) || [];
                dummyList.push(dummyEv);
                if(dummyList.length > 50) dummyList.shift(); 
                localStorage.setItem('admin_dummy_events', JSON.stringify(dummyList));
            } 
            catch(err) {}
            loadAllAdminData(); 
            logAdminAction('EVENT', `Event "${event}" đang chờ duyệt`);
            addNotification("Sự kiện", `Sự kiện mới "${event}" đang chờ duyệt.`);
        }

        // KỊCH BẢN 4: Tin nhắn hỗ trợ mới 
        else {
            const newTicket = {
                id: 'TK-' + timestamp,
                name: buyer,
                email: `${buyer.toLowerCase().replace(/\s/g, '')}@gmail.com`,
                subject: supportSubjects[Math.floor(Math.random() * supportSubjects.length)],
                message: supportMessages[Math.floor(Math.random() * supportMessages.length)],
                time: "Vừa xong",
                priority: Math.random() > 0.5 ? "Cao" : "Trung bình"
            };

            if (window.allSupportData) {
                window.allSupportData.unshift(newTicket); 
                if (typeof renderSupportList === "function") {
                    renderSupportList(window.allSupportData);
                }
            }
   
            try {
                let supports = JSON.parse(localStorage.getItem('admin_support')) || [];
                supports.unshift(newTicket);
                localStorage.setItem('admin_support', JSON.stringify(supports));
            } catch {}

            logAdminAction('SUPPORT', `Yêu cầu từ ${buyer}: "${newTicket.subject}"`);
            addNotification("Hỗ trợ", `Yêu cầu mới từ ${buyer}: "${newTicket.subject}"`);
            addActivity(
                'SUPPORT',
                buyer,
                newTicket.message
            );
        }
    }, 12000); 
}

/* --- TIỆN ÍCH  --- */
function updateDashboardStats(ticketIncr, revenueIncr, userIncr = 0) {
    if (ticketIncr > 0) totalTickets += ticketIncr;
    if (revenueIncr > 0) totalRevenue += revenueIncr;
    if (userIncr > 0) totalUsers += userIncr;

    syncDashboard();

    localStorage.setItem('dashboard_stats', JSON.stringify({
        tickets: totalTickets.toLocaleString('vi-VN'),
        revenue: (totalRevenue / 1_000_000_000).toFixed(3) + " tỷ",
        users: totalUsers.toLocaleString('vi-VN')
    }));
}


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
let currentRefundData = null;


function checkRealRegistrations() {
    const newRegs = JSON.parse(localStorage.getItem('new_registrations')) || [];
    
    if (newRegs.length > 0) {
        newRegs.forEach(reg => {
            addNotification("Giao dịch thực", `${reg.fullName} vừa mua vé thành công!`);
        });
   
        localStorage.removeItem('new_registrations');
    }
}

setInterval(checkRealRegistrations, 5000);

/* --- HÀM QUẢN LÝ HỖ TRỢ --- */

// 1. Hàm render danh sách 
function renderSupportList(data) {
    const container = document.getElementById('support-list');
    if (!container) return;
    
    container.innerHTML = data.map(tk => {
        const firstLetter = tk.name ? tk.name.charAt(0) : 'K';
        const subject = tk.subject || "Yêu cầu hỗ trợ";
        const isResolved = tk.status === 'resolved';
        const isReplied = tk.status === 'replied';
        const cardOpacity = (isResolved || isReplied) ? 'opacity-50 grayscale' : '';
        const btnAiText = isReplied ? "AI DONE" : "AI REPLY";
        const btnResolveText = isResolved ? "HOÀN TẤT" : "ĐÃ XỬ LÝ";

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
                <button onclick="askAIHelp('${tk.id}')" 
                ${tk.status === 'replied' || tk.status === 'resolved' ? 'disabled' : ''} 
                class="text-[10px] font-black text-white bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 rounded-xl hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2">
                <i class="fa-solid fa-robot text-[9px]"></i> 
                ${tk.status === 'replied' ? 'AI DONE' : 'AI REPLY'}
                </button>
                <button onclick="resolveTicket(this, '${tk.id}')" 
                ${tk.status === 'resolved' ? 'disabled' : ''} 
                class="text-[10px] font-black text-green-500 bg-green-500/10 px-4 py-2 rounded-xl hover:bg-green-500 hover:text-white transition-all">
                ${tk.status === 'resolved' ? 'HOÀN TẤT' : 'ĐÃ XỬ LÝ'}
                </button>
                <a href="mailto:${tk.email}?subject=Re: ${subject}" class="text-[10px] font-black text-white/50 bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10 transition-all border border-white/5">GMAIL</a>
            </div>
        </div>
    `}).join('');
}

function updateSupportStatus(id, newStatus) {
    try {

        let supports = JSON.parse(localStorage.getItem('admin_support')) || [];
        let contacts = JSON.parse(localStorage.getItem('contact_messages')) || [];

        supports = supports.map(tk => tk.id == id ? { ...tk, status: newStatus } : tk);
        contacts = contacts.map(tk => tk.id == id ? { ...tk, status: newStatus } : tk);

        localStorage.setItem('admin_support', JSON.stringify(supports));
        localStorage.setItem('contact_messages', JSON.stringify(contacts));
        
        if (window.allSupportData) {
            window.allSupportData = window.allSupportData.map(tk => tk.id == id ? { ...tk, status: newStatus } : tk);
        }
        
        console.log(`Đã lưu trạng thái ${newStatus} cho ID: ${id}`);
    } catch (e) { 
        console.error("Lưu trạng thái lỗi:", e); 
    }
}

function updateDashboardNumbers() {
    const data = window.allSupportData || [];
    const pendingCount = data.filter(tk => tk.status === 'pending' || !tk.status).length;
    const resolvedCount = data.filter(tk => tk.status === 'resolved' || tk.status === 'replied').length;

    const pendingEl = document.getElementById('support-pending-count');
    const resolvedEl = document.getElementById('support-resolved-count');

    if (pendingEl) pendingEl.innerText = pendingCount;
    if (resolvedEl) resolvedEl.innerText = 85 + resolvedCount; 
}

// AI REPLY
function askAIHelp(id) {
    const data = window.allSupportData.find(tk => tk.id == id);
    if (!data) return;

    let message = data.message.toLowerCase();
    let template = replyTemplates.default;
    if (/hủy|huỷ|trả vé|hoàn tiền/.test(message)) {
        template = replyTemplates.cancel;
    } 
    else if (/tiền|thanh toán|chuyển khoản|bank/.test(message)) {
        template = replyTemplates.payment;
    } 
    else if (/ở đâu|địa chỉ|vị trí|map|đường/.test(message)) {
        template = replyTemplates.location;
    }

    // 2. Điền tên khách 
    const finalContent = template.replace(/{name}/g, data.name); 

    // 3. Mở Gmail
    const subject = encodeURIComponent(`Phản hồi hỗ trợ: ${data.subject}`);
    const body = encodeURIComponent(finalContent);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${data.email}&su=${subject}&body=${body}`;

    // 4. Lưu trạng thái & Mở tab
    updateSupportStatus(id, 'replied');
    window.open(gmailUrl, '_blank');

    // 5. Vẽ lại giao diện
    renderSupportList(window.allSupportData);
}

// 3. Khởi tạo dữ liệu gộp 
function resolveTicket(btn, id) {
    const card = btn.closest('.glass');
    if (!card) return;

    // --- BƯỚC 1: LƯU VÀO MÁY  ---
    updateSupportStatus(id, 'resolved');

    // --- BƯỚC 2: HIỆN THÔNG BÁO ---
    if (typeof addNotification === 'function') {
        const customerName = card.querySelector('.text-white\\/80')?.innerText || "Khách hàng";
        addNotification("Thành công", `Đã xử lý xong yêu cầu của ${customerName}`, "SUPPORT");
    }

    // --- BƯỚC 3: HIỆU ỨNG GIAO DIỆN ---
    card.classList.add('opacity-50', 'grayscale');
    btn.innerText = "HOÀN TẤT";
    btn.disabled = true;

    // --- BƯỚC 4: NHẢY SỐ DASHBOARD ---
    const pendingEl = document.getElementById('support-pending-count');
    const resolvedEl = document.getElementById('support-resolved-count');
    if (pendingEl && resolvedEl) {
        let p = parseInt(pendingEl.innerText) || 0;
        let r = parseInt(resolvedEl.innerText) || 0;
        pendingEl.innerText = Math.max(0, p - 1);
        resolvedEl.innerText = r + 1;
    }
}

// 3. Khởi tạo dữ liệu 
function initDummySupport() {
    let savedSupports = JSON.parse(localStorage.getItem('admin_support'));
    if (!savedSupports || savedSupports.length === 0) {
        const dummyTickets = Array.from({ length: 15 }).map((_, i) => ({
            id: `TK-SEED-${200 + i}`, // Thêm chữ SEED để phân biệt
            name: (typeof names !== 'undefined') ? names[Math.floor(Math.random() * names.length)] : "Khách hàng mẫu",
            email: `customer${200+i}@gmail.com`,
            subject: "Yêu cầu hệ thống",
            message: "Tôi cần hỗ trợ về việc thanh toán vé sự kiện.",
            time: `${Math.floor(Math.random() * 23) + 1} giờ trước`,
            priority: Math.random() > 0.7 ? "Cao" : "Trung bình",
            status: 'pending' 
        }));
        
        localStorage.setItem('admin_support', JSON.stringify(dummyTickets));
        savedSupports = dummyTickets;
    }

    const realTickets = JSON.parse(localStorage.getItem('contact_messages')) || [];
    const markedReal = realTickets.map(t => ({
        ...t,
        id: t.id || 'TK-REAL-' + Date.now(),
        status: t.status || 'pending' 
    }));

    window.allSupportData = [...markedReal, ...savedSupports];
  
    renderSupportList(window.allSupportData);
    updateDashboardNumbers();
}

/* --- 5. HÀM TÌM KIẾM HỖ TRỢ  --- */
function setupSupportSearch() {
    const searchInput = document.querySelector('input[placeholder*="Tìm kiếm"]') || 
                        document.querySelector('.support-search-input');

    const listContainer = document.getElementById('support-list');

    if (!searchInput) {
        console.error("Lỗi: Không tìm thấy ô nhập tìm kiếm!");
        return;
    }
    if (!listContainer) {
        console.error("Lỗi: Không tìm thấy vùng chứa danh sách (#support-list)!");
        return;
    }

    console.log("Đã kết nối thanh Tìm kiếm thành công!"); 

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const allCards = listContainer.children;

        Array.from(allCards).forEach(card => {
            const cardText = card.innerText.toLowerCase();
            
            if (cardText.includes(searchTerm)) {
                card.style.display = ''; 
                card.style.animation = 'fadeIn 0.3s ease'; 
            } else {
                card.style.display = 'none'; 
            }
        });
    });
}


/* --- HỆ THỐNG ACTIVITY FEED --- */

const feedTypes = {
    USER: { icon: 'fa-user-plus', color: 'blue', label: 'Khách hàng mới' },
    TICKET: { icon: 'fa-ticket', color: 'green', label: 'Mua vé thành công' },
    EVENT: { icon: 'fa-calendar-check', color: 'purple', label: 'Sự kiện mới' },
    SUPPORT: { icon: 'fa-comment-dots', color: 'yellow', label: 'Tin nhắn hỗ trợ' }
};

function addActivity(type, title, content) {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

    pushToFeed(type, title, timeStr, content);
}

function syncRealActivity() {
    const realUsers = JSON.parse(localStorage.getItem('ticket_users')) || [];
    if (realUsers.length === 0) return;

    const lastUser = realUsers[realUsers.length - 1];
    
    const lastNotifiedUserId = sessionStorage.getItem('last_notified_user');

    if (lastUser && lastUser.id !== lastNotifiedUserId) {
        addNotification(lastUser.name, `Khách hàng vừa đăng ký tài khoản.`, 'USER');

        sessionStorage.setItem('last_notified_user', lastUser.id);
    }
}

function pushToFeed(type, title, time, content, isReal = false) {
    const container = document.getElementById('live-feed-container');
    if (!container) return;

    const config = feedTypes[type] || feedTypes['EVENT'];
    
    if (!isReal) {
        let logs = JSON.parse(localStorage.getItem('admin_logs')) || [];
        logs.unshift({ type, title, time, message: content });
        localStorage.setItem('admin_logs', JSON.stringify(logs.slice(0, 50)));
    }

    let displayTime = time;
    let displayDate = "";
    if (time.includes(' - ')) {
        [displayTime, displayDate] = time.split(' - ');
    }

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

function syncRealDataToFeed() {
    const messages = JSON.parse(localStorage.getItem('contact_messages')) || [];
    const container = document.getElementById('live-feed-container');
    if (!container || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
   
    const msgId = lastMsg.id || lastMsg.time || lastMsg.message;
    if (sessionStorage.getItem('last_feed_msg') === msgId) return;

    const timeDisplay = lastMsg.time || new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});

    pushToFeed('SUPPORT', lastMsg.name, timeDisplay, lastMsg.message, true);
    
    sessionStorage.setItem('last_feed_msg', msgId);
}

function initLiveFeed() {
    const container = document.getElementById('live-feed-container');
    if (!container) return;

    if (container.children.length === 0) {
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()} - ${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
        pushToFeed('EVENT', 'Hệ thống', timeStr, 'Admin đã kết nối và sẵn sàng.');
    }
    syncRealDataToFeed();

}
function clearFeed() {
    document.getElementById('live-feed-container').innerHTML = '';
    pushToFeed('EVENT', 'Hệ thống', 'Vừa xong', 'Đã dọn dẹp dòng thời gian.');
}

window.onfocus = function() {
    if (document.getElementById('deposits') && !document.getElementById('deposits').classList.contains('hidden')) {
        loadDeposits();
    }
};


function loadDeposits() {
    const listContainer = document.getElementById('admin-deposit-list');
    if (!listContainer) {
        console.error("Không tìm thấy ID 'admin-deposit-list' trong HTML!");
        return;
    }
    const rawLogs = JSON.parse(localStorage.getItem('admin_deposit_logs')) || [];
    const logs = rawLogs.filter(log => Number(log?.amount) > 0);
    if (logs.length !== rawLogs.length) {
        localStorage.setItem('admin_deposit_logs', JSON.stringify(logs));
    }
    
    if (logs.length === 0) {
        listContainer.innerHTML = `
            <tr>
                <td colspan="5" class="p-10 text-center text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                    Chưa có lịch sử giao dịch nào
                </td>
            </tr>`;
        return;
    }

    
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


/* --- HỆ THỐNG LẮNG NGHE DỮ LIỆU --- */
window.addEventListener('storage', (e) => {
    if (!e.newValue) return;

    try {
        const data = JSON.parse(e.newValue);

        /*1. NẠP TIỀN / ĐĂNG KÝ  */
        if (e.key === 'new_registrations') {
            const validDepositLogs = data.filter(item => Number(item?.amount) > 0);
            if (validDepositLogs.length > 0) {
                let currentLogs = JSON.parse(localStorage.getItem('admin_deposit_logs')) || [];
                const updatedLogs = [...validDepositLogs, ...currentLogs];
                localStorage.setItem('admin_deposit_logs', JSON.stringify(updatedLogs));
            }

            loadDeposits?.();

            if (validDepositLogs.length > 0) {
                addNotification("Hệ thống", `Có yêu cầu nạp tiền từ ${validDepositLogs[0]?.user || 'Khách'}!`, 'TICKET');
            }
        }

        if (e.key === 'admin_deposit_logs') {
            const lastLog = data[data.length - 1];

            if (lastLog) {
                addActivity?.('TICKET', lastLog.user, `Nạp ${Number(lastLog.amount).toLocaleString()}đ`);
            }

            loadDeposits?.();
        }

        /* 2. ĐƠN HÀNG */
        if (e.key === 'eventOrders') {
            loadAllAdminData();
            reconcileDashboardFromOrders();
            
            const lastOrder = data[data.length - 1];
            if (lastOrder) {
                if (!lastOrder._isRefund) {
                    updateDashboardStats(Number(lastOrder.quantity) || 1, Number(String(lastOrder.total || 0).replace(/\D/g, '')) || 0, 0);
                }
                addActivity?.(
                    'TICKET',
                    lastOrder.customer || "Khách",
                    `Mua ${lastOrder.event} (${lastOrder.total})`
                );
            }
            addNotification("Đơn hàng", "Có đơn mua vé mới!", 'TICKET');
        }

        /*  3. USER MỚI */
        if (e.key === 'ticket_users') {
            const lastUser = data[data.length - 1];
            if (!lastUser) return;

            const userName = lastUser.fullName || lastUser.fullname || lastUser.name || "User";

            addNotification("Thành viên", `Chào mừng ${userName}!`, 'USER');
            addActivity?.('USER', userName, "Đã đăng ký tài khoản");

            totalUsers += 1;
            syncDashboard();

            if (typeof addUserCardToGrid === 'function') {
                addUserCardToGrid({
                    ...lastUser,
                    name: userName,
                    avatar: lastUser.avatar || `https://i.pravatar.cc/150?u=${lastUser.email || userName}`,
                    spend: lastUser.spend || 0,
                    createdAt: lastUser.createdAt || Date.now(),
                    isReal: true
                }, true, true);
            }
        }

        /* 4. SUPPORT */
        if (e.key === 'contact_messages') {
            const latestMsg = data[data.length - 1];
            if (!latestMsg) return;

            const newTicket = {
                id: 'TK-' + Date.now(),
                name: latestMsg.name,
                email: latestMsg.email,
                subject: latestMsg.subject || "Yêu cầu hỗ trợ",
                message: latestMsg.message,
                time: "Vừa xong",
                priority: Math.random() > 0.5 ? "Cao" : "Trung bình"
            };

            let supports = JSON.parse(localStorage.getItem('admin_support')) || [];
            supports.unshift(newTicket);
            localStorage.setItem('admin_support', JSON.stringify(supports));

            if (window.allSupportData) {
                window.allSupportData.unshift(newTicket);
                renderSupportList?.(window.allSupportData);
            }

            addNotification("Hỗ trợ", `${latestMsg.name} gửi yêu cầu`, 'SUPPORT');
            addActivity?.('SUPPORT', latestMsg.name, latestMsg.message);


            const pendingEl = document.querySelector('.text-yellow-500.font-bold');
            if (pendingEl) {
                let count = parseInt(pendingEl.innerText) || 0;
                pendingEl.innerText = count + 1;
            }
        }
        
        if (e.key === 'ticket_events') {
            console.log("Dữ liệu sự kiện đã thay đổi, đang cập nhật lại...");
            
            if (typeof loadEventsForUser === "function") {
                loadEventsForUser();
            } else {
            location.reload();
            }
        }
    
    } catch (err) {
        console.error("Lỗi storage:", err);
    }
});


/* --- BIỂU ĐỒ --- */
function initChart() {
    const canvas = document.getElementById('mainChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)'); 
    gradient.addColorStop(0.6, 'rgba(59, 130, 246, 0.1)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    const smoothData = [350, 420, 380, 520, 480, 650, 890]; 
    if (window.mainChart instanceof Chart) {
        window.mainChart.destroy();
    }

    window.mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['01/04', '05/04', '10/04', '15/04', '20/04', '25/04', '30/04'],
            datasets: [{
                label: 'Doanh thu',
                data: smoothData,
                borderColor: '#3b82f6',
                borderWidth: 4, 
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: 'rgba(255,255,255,0.5)',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                backgroundColor: gradient,
                tension: 0.45, 
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { top: 20, bottom: 10, left: 10, right: 10 }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleFont: { size: 13 },
                    bodyFont: { size: 13 },
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return ' ' + context.parsed.y.toLocaleString() + ' VNĐ';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false, 
                    grid: {
                        color: 'rgba(255, 255, 255, 0.03)', 
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748b',
                        font: { size: 11 },
                        callback: value => value >= 1000 ? (value/1000) + 'k' : value
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#64748b',
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

/* --- XUẤT DỮ LIỆU --- */
function exportToExcel() {
    const activeTab = document.querySelector('.tab-content.active').id;
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    let fileName = "";
    let rows = [];

    if (activeTab === 'users') {
        fileName = "Danh_Sach_Nguoi_Dung.csv";
        rows.push(["Tên Khách Hàng", "Email", "Số Điện Thoại", "Chi Tiêu"]);
        document.querySelectorAll('.user-card-item').forEach(card => {
            if (card.style.display !== 'none') {
                const name = card.querySelector('h4').innerText.replace('REAL', '').trim();
                const email = card.querySelector('.fa-envelope').parentElement.innerText.trim();
                const phone = card.querySelector('.fa-phone').parentElement.innerText.trim();
                const spend = card.querySelector('.text-blue-500').innerText.trim();
                rows.push([name, email, phone, spend]);
            }
        });
    } 
    else if (activeTab === 'events') {
        fileName = "Danh_Sach_Su_Kien.csv";
        rows.push(["Tên Sự Kiện", "Địa Điểm", "Ban Tổ Chức", "Giá Vé"]);
        document.querySelectorAll('#event-grid > div').forEach(card => {
            if (card.style.display !== 'none') {
                const title = card.querySelector('h4').innerText.trim();
                const loc = card.querySelector('.fa-location-dot').parentElement.innerText.trim();
                const org = card.querySelector('.fa-user-tie').parentElement.innerText.trim();
                const price = card.querySelector('.text-blue-500').innerText.trim();
                rows.push([title, loc, org, price]);
            }
        });
    }
    else if (activeTab === 'orders') {
        fileName = "Lich_Su_Giao_Dich.csv";
        rows.push(["Mã Đơn","Thời Gian", "Khách Hàng", "Sự Kiện", "Số Vé","Số Tiền", "Trạng Thái"]);
        document.querySelectorAll('.order-row').forEach(row => {
            if (row.style.display !== 'none') {
                const cells = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
                rows.push(cells);
            }
        });
    }

    if (rows.length > 0) {
        const csvString = rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
        csvContent += csvString;
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addNotification("Hệ thống", `Đã xuất ${rows.length - 1} dòng dữ liệu.`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof loadDeposits === 'function') loadDeposits();
    if (typeof renderAdminTable === 'function') renderAdminTable();
});

function replayAdminLogs() {
    const logs = getAdminLogs();

    logs.slice(0, 20).reverse().forEach(log => {
        if (typeof pushToFeed === 'function') {
            pushToFeed(
                log.type,
                log.type,
                log.time,
                log.message,
                false
            );
        }
    });
}

function getPendingRefundOrders() {
    const allOrders = JSON.parse(localStorage.getItem('eventOrders')) || [];
    const refundHistory = JSON.parse(localStorage.getItem('admin_refunds')) || [];
    
    // Tạo danh sách các ID đã được hoàn tiền xong rồi để loại bỏ
    const completedIds = new Set(refundHistory.map(item => String(item.orderId)));

    // Lọc: Phải có dấu _isRefund là true VÀ chưa nằm trong lịch sử đã hoàn
    return allOrders.filter(order => order._isRefund === true && !completedIds.has(String(order.id)));
}

function renderPendingRefundList() {
    const listEl = document.getElementById('pending-refund-list');
    if (!listEl) return;

    const pendingOrders = getPendingRefundOrders();

    if (pendingOrders.length === 0) {
        listEl.innerHTML = `<div class="p-8 text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">Không có yêu cầu chờ duyệt</div>`;
        return;
    }

    listEl.innerHTML = pendingOrders.map(order => {
        const customerName = order.customer || 'Khách hàng';
        const amount = Number(String(order.total || 0).replace(/\D/g, '')) || 0;
        
        // Lấy thông tin chi tiết từ đơn hàng
        const seats = order.tickets ? order.tickets.map(t => t.name).join(', ') : 'N/A';
        const quantity = order.tickets ? order.tickets.reduce((sum, t) => sum + (t.qty || 1), 0) : 1;
        const reason = order.refundReason || "Không có lý do";

        return `
            <div class="p-5 rounded-[2rem] bg-white/[0.03] border border-white/5 mb-4">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 font-black text-xs">
                            ${customerName[0].toUpperCase()}
                        </div>
                        <div>
                            <div class="text-white text-[11px] font-black">${customerName}</div>
                            <div class="text-[9px] text-gray-500">Đơn: #${order.id}</div>
                        </div>
                    </div>
                    <div class="text-right text-red-400 text-[11px] font-black">${amount.toLocaleString()}đ</div>
                </div>

                <div class="bg-black/20 p-3 rounded-2xl text-[10px] space-y-1 mb-3 border border-white/5">
                    <p class="text-gray-400">🎫 Sự kiện: <span class="text-white">${order.event}</span></p>
                    <p class="text-gray-400">💺 Ghế: <span class="text-blue-400">${seats} (x${quantity})</span></p>
                    <p class="text-gray-400">💬 Lý do: <span class="text-red-300 italic">"${reason}"</span></p>
                </div>
            </div>
        `;
    }).join('');
}

function updatePendingRefundUI() {
    const badge = document.getElementById('pending-count-badge');
    const pendingOrders = getPendingRefundOrders();

    if (badge) {
        badge.innerText = pendingOrders.length.toString();
        // Ẩn badge nếu không có yêu cầu nào
        badge.style.display = pendingOrders.length === 0 ? 'none' : 'inline-block';
    }

    // Nếu Modal đang mở thì render lại luôn
    const modal = document.getElementById('pending-refund-modal');
    if (modal && !modal.classList.contains('hidden')) {
        renderPendingRefundList();
    }
}

function loadRefundData() {
    const tbody = document.getElementById('refund-table-body');
    const adminDisplay = document.getElementById('admin-balance-display');
    if (!tbody) return;

    const adminBalance = parseInt(localStorage.getItem('admin_source_money')) || 0;
    if (adminDisplay) adminDisplay.innerText = adminBalance.toLocaleString();

    let allOrders = JSON.parse(localStorage.getItem('eventOrders')) || [];
    const refundHistory = JSON.parse(localStorage.getItem('admin_refunds')) || [];
    
    const displayOrders = [...allOrders].reverse();

    tbody.innerHTML = displayOrders.map(order => {
        const rawTotal = String(order.total || '0').replace(/\D/g, '');
        let originalPrice = parseInt(rawTotal) || 0;
        let refundAmount = 0;
        if (order.amountToRefund) {
            refundAmount = order.amountToRefund;
        } else {
            refundAmount = Math.floor(originalPrice * 0.95);
        }
        const isRefunded = refundHistory.some(r => String(r.orderId) === String(order.id));
        const refundReason = (order.refundReason || "Khách yêu cầu hủy vé").replace(/'/g, "\\'");
        const customerSafe = (order.customer || 'Khách').replace(/'/g, "\\'");
         return `
            <tr class="hover:bg-white/[0.02] border-b border-white/5 transition-all">
                <td class="p-6 text-xs font-bold text-white">#${order.id}</td>
                <td class="p-6 text-xs text-gray-400">${order.customer || 'N/A'}</td>
                <td class="p-6 text-xs text-gray-400">
                    ${order.event || 'Sự kiện'} 
                    <span class="text-blue-500 ml-2">(x${order.quantity || 1})</span>
                </td>
                <td class="p-6 text-xs font-bold text-gray-500">${originalPrice.toLocaleString()}đ</td>
                <td class="p-6 text-xs font-black text-red-400">${refundAmount.toLocaleString()}đ</td>
                <td class="p-6">
                ${isRefunded 
                    ? '<span class="text-[10px] font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20">ĐÃ HOÀN TIỀN</span>' 
                    : `<button onclick="openRefundModal('${order.id}', '${customerSafe}', ${refundAmount}, '${refundReason}')" 
                        class="text-[10px] font-black text-white bg-red-500 px-4 py-2 rounded-xl hover:bg-red-600 transition-all">
                        XÁC NHẬN HOÀN
                       </button>`
                    }
                </td>
            </tr>
        `;
    }).join('');

    updatePendingRefundUI();
}

function rechargeAdminMoney() {
    const inputModal = document.getElementById('recharge-input-modal');
    if (inputModal) {
        inputModal.classList.remove('hidden');
        document.getElementById('recharge-amount-input').focus();
    }
}

function closeRechargeInput() {
    const modal = document.getElementById('recharge-input-modal');
    if (modal) modal.classList.add('hidden');
}

function confirmRecharge() {
    const amountInput = document.getElementById('recharge-amount-input');
    const amount = parseInt(amountInput.value);

    if (!amount || amount <= 0) {
        alert("Vui lòng nhập số tiền hợp lệ!");
        return;
    }

    try {
        // A. Cập nhật số dư 
        let current = parseInt(localStorage.getItem('admin_source_money')) || 1000000000;
        let newBalance = current + amount;
        localStorage.setItem('admin_source_money', newBalance.toString());

        // B. Đổ dữ liệu vào các thẻ 
        if (document.getElementById('invoice-id')) {
            document.getElementById('invoice-id').innerText = '#RCG-' + Math.floor(Math.random() * 90000 + 10000);
        }
        if (document.getElementById('invoice-date')) {
            document.getElementById('invoice-date').innerText = new Date().toLocaleString('vi-VN');
        }
        if (document.getElementById('invoice-amount')) {
            document.getElementById('invoice-amount').innerText = "+" + amount.toLocaleString() + "đ";
        }

        // C. ĐIỀU KIỂN MODAL 
        const inputModal = document.getElementById('recharge-input-modal');
        if (inputModal) inputModal.classList.add('hidden');
        const receiptModal = document.getElementById('recharge-modal');
        if (receiptModal) {
            receiptModal.classList.remove('hidden');
        } else {
            console.error("Không tìm thấy id='recharge-modal' trong HTML của Thảo");
        }
        
        // D. Reset input và cập nhật con số ngoài màn hình chính
        amountInput.value = '';
        loadRefundData(); 

    } catch (e) {
        console.error("Lỗi nạp tiền:", e);
        alert("Có lỗi xảy ra, kiểm tra lại Console (F12)");
    }
}

// 3. Đóng biên lai
function closeRechargeModal() {
    const receiptModal = document.getElementById('recharge-modal');
    if (receiptModal) receiptModal.classList.add('hidden');
}


// Hàm mở Modal
function openRefundModal(orderId, customerName, amount, reason) {

    currentRefundData = { orderId, customerName, amount, reason };
    
    document.getElementById('modal-order-id').innerText = '#' + orderId;
    document.getElementById('modal-customer-name').innerText = customerName;
    document.getElementById('modal-refund-amount').innerText = amount.toLocaleString() + 'đ';
    
    const reasonInput = document.getElementById('modal-refund-reason');
    if (reasonInput) {
        reasonInput.value = reason || "Khách yêu cầu hủy vé";
    }

    const modal = document.getElementById('refund-modal');
    modal.classList.remove('hidden');
    
    document.getElementById('modal-confirm-btn').onclick = function() {

        const finalReason = document.getElementById('modal-refund-reason').value;
        executeRefund(finalReason);
    };
}

// Hàm đóng Modal
function closeRefundModal() {
    document.getElementById('refund-modal').classList.add('hidden');
}

// Hàm thực thi hoàn tiền 
function executeRefund(reason) {
    if (!currentRefundData) return;
    const { orderId, customerName, amount } = currentRefundData;

    let refundHistory = JSON.parse(localStorage.getItem('admin_refunds')) || [];
    
    if (refundHistory.some(r => String(r.orderId) === String(orderId))) {
        alert("Đơn hàng này đã được xử lý hoàn tiền!");
        closeRefundModal();
        return;
    }

    let adminBalance = parseInt(localStorage.getItem('admin_source_money')) || 0;
    if (adminBalance < amount) {
        alert("Nguồn tiền hệ thống không đủ để thực hiện hoàn trả!");
        return;
    }

    // A. Khấu trừ tiền Admin và cộng tiền User
    adminBalance -= amount;
    localStorage.setItem('admin_source_money', adminBalance.toString());

    let userBalances = JSON.parse(localStorage.getItem('user_balances')) || {};
    userBalances[customerName] = (userBalances[customerName] || 0) + amount;
    localStorage.setItem('user_balances', JSON.stringify(userBalances));

    // B. Lưu lịch sử hoàn tiền
    refundHistory.push({
        orderId: String(orderId), 
        customer: customerName, 
        amount, 
        reason, 
        date: new Date().toLocaleString('vi-VN'),
        status: 'COMPLETED'
    });
    localStorage.setItem('admin_refunds', JSON.stringify(refundHistory));

    // C. Cập nhật lại thuộc tính 
    let allOrders = JSON.parse(localStorage.getItem('eventOrders')) || [];
    const orderIdx = allOrders.findIndex(o => String(o.id) === String(orderId));
    if (orderIdx !== -1) {
        allOrders[orderIdx]._isRefunded = true; 
        localStorage.setItem('eventOrders', JSON.stringify(allOrders));
    }

    // D. Làm mới toàn bộ UI
    closeRefundModal();
    loadRefundData(); 
    updatePendingRefundUI(); 
    
    if (typeof addNotification === 'function') {
        addNotification("Thành công", `Đã hoàn ${amount.toLocaleString()}đ cho ${customerName}`, "SUCCESS");
    }
}

// 1. Hàm đóng/mở Modal chờ duyệt
function openPendingRefundsModal() {
    const modal = document.getElementById('pending-refund-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    renderPendingRefundList();
}

function closePendingRefundsModal() {
    const modal = document.getElementById('pending-refund-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// 2. Logic tìm kiếm
document.getElementById('refund-search')?.addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#refund-table-body tr');
    
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
});

/* --- 10. KHỞI CHẠY --- */
document.addEventListener('DOMContentLoaded', () => {
    seedProcessedOrdersFromCurrentData();
    reconcileDashboardFromOrders();
    updatePendingRefundUI();
    initChart();
    seedUsers();
    seedEvents();
    loadSavedOrders(); 
    initDummySupport(); 
    initLiveFeed();
    loadAllAdminData();   
    replayAdminLogs();
    startAutomation();
    startStatusAutomation();
    setupSupportSearch();
});

