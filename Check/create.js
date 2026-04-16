// --- 0. BIẾN TOÀN CỤC & KHỞI TẠO ---
let isEditing = false;
let currentEditCard = null;

// Khởi chạy khi cửa sổ tải xong
window.onload = () => { 
    const userData = localStorage.getItem('userLogin');
    let loggedInUser = null;

    try {
        loggedInUser = userData ? JSON.parse(userData) : null;
    } catch (e) {
        loggedInUser = null;
    }
    
    // SỬA Ở ĐÂY: Nếu không có user, đá về index ngay lập tức
    if (!loggedInUser || !loggedInUser.name) {
        alert("Bạn cần đăng nhập trước nhé!");
        window.location.href = "index.html"; 
        return;
    }

    // Nếu ok thì chạy tiếp
    syncUserInterface(loggedInUser);
    
    // Kiểm tra thông báo
    if (!sessionStorage.getItem('hasSeenNotice')) {
        openNoticeModal();
    } else {
        showPage('home');
    }

    if (document.getElementById('admin-events-container')) {
        loadEventsAdmin();
    }
};


// --- 1. TIỆN ÍCH HỆ THỐNG (UTILITIES) ---
function getTimeAgo() { return "Vừa xong"; }

const formatNA = (id) => {
    const val = document.getElementById(id)?.value.trim();
    return (val === "" || val === null) ? "N/A" : val;
};

const cleanData = (val) => (val === "N/A" || !val || val === "undefined") ? "" : val;

// --- 2. ĐIỀU HƯỚNG & GIAO DIỆN CHÍNH (NAVIGATION) ---
function showPage(pageId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(sec => sec.classList.add('hidden'));

    const target = document.getElementById('page-' + pageId);
    if (target) {
        target.classList.remove('hidden');

        if (pageId === 'my-events') loadMyEvents(); 
        
        if (pageId === 'create-event') {
    if (!isEditing) {
        cancelCreate();
    }
}

        // Hiệu ứng FadeIn
        target.style.animation = 'none';
        target.offsetHeight; 
        target.style.animation = 'fadeIn 0.4s ease-in-out';
    }
    
    // Cập nhật Sidebar
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active', 'text-[#00d2ff]'));
    const activeBtn = document.getElementById('btn-' + pageId);
    if (activeBtn) activeBtn.classList.add('active', 'text-[#00d2ff]');

    // Cập nhật Header
    const titles = {
        'index': 'Trang chủ',
        'my-events': 'Sự kiện của tôi',
        'create-event': 'Tạo sự kiện mới',
        'legal': 'Điều khoản đối tác'
    };
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.innerText = titles[pageId] || 'Trang chủ';
}

function goToStep(stepNumber) {
    document.querySelectorAll('.step-content').forEach(content => content.classList.add('hidden'));
    const targetStep = document.getElementById(`create-step-${stepNumber}`);
    if (targetStep) targetStep.classList.remove('hidden');

    document.querySelectorAll('.step-item').forEach((tab, index) => {
        const stepIdx = index + 1;
        const isActive = stepIdx === stepNumber;
        tab.classList.toggle('active', isActive);
        tab.classList.toggle('font-bold', isActive);
        tab.classList.toggle('border-b-2', isActive);
        tab.classList.toggle('border-black', isActive);
        tab.classList.toggle('text-black', isActive);
        tab.classList.toggle('text-gray-400', !isActive);
    });
}

// --- 3. QUẢN LÝ MEDIA & PREVIEW ---
function previewImg(input, prevId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById(prevId);
            img.src = e.target.result;
            img.style.display = 'block';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover'; 
            img.style.objectPosition = 'center';
            
            const wrap = document.getElementById(prevId.replace('-prev', '-wrap'));
            const ui = document.getElementById(prevId.replace('-prev', '-prev-ui'));
            if (wrap) wrap.classList.remove('hidden');
            if (ui) ui.classList.add('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function removeImg(inputId, previewId, wrapId, uiId) {
    const input = document.getElementById(inputId);
    if(input) input.value = "";
    const wrap = document.getElementById(wrapId);
    const ui = document.getElementById(uiId);
    if (wrap) wrap.classList.add('hidden');
    if (ui) ui.classList.remove('hidden');
}

// --- 4. LOGIC NGHIỆP VỤ VÉ (TICKET LOGIC) ---
function addTicketRow() {
    const list = document.getElementById('ticket-list');
    if (!list) return;

    const div = document.createElement('div');
div.className = "grid grid-cols-1 md:grid-cols-[2fr_2fr_1.5fr_0.5fr] gap-4 p-4 bg-white/5 border border-white/10 rounded-xl relative group mb-3 animate-fade-in items-center mx-auto max-w-4xl";

div.innerHTML = `
    <input type="text" placeholder="Tên vé" 
        class="ticket-name-input w-full bg-transparent border border-gray-500 rounded p-2 text-white focus:border-[#00d2ff] outline-none transition-all">
    
    <input type="number" placeholder="Giá (VNĐ)" 
        class="ticket-price-input w-full bg-transparent border border-gray-500 rounded p-2 text-white focus:border-[#00d2ff] outline-none transition-all">
    
    <input type="number" placeholder="Số lượng" 
        class="ticket-qty-input w-full bg-transparent border border-gray-500 rounded p-2 text-white focus:border-[#00d2ff] outline-none transition-all text-center">
    
    <button onclick="this.parentElement.remove()" 
        class="text-red-500 hover:text-red-400 p-2 flex justify-center items-center transition-transform hover:scale-110">
        <i class="fa-solid fa-trash-can"></i>
    </button>`; 

    list.appendChild(div);
}

// --- 5. LƯU TRỮ & XỬ LÝ DỮ LIỆU (STORAGE & CRUD) ---
function finishCreateEvent(isDraft = false) {
    const rawName = document.getElementById('event-name-input')?.value.trim() || "";
    
    if (!isDraft && (rawName === "" || rawName === "Diệu Thảo")) { 
        alert("Tên sự kiện không được để trống nhé!");
        return;
    }
    const getFinalImg = (id) => {
        const imgEl = document.getElementById(id);
        if (imgEl && imgEl.src && imgEl.src.startsWith('data:image')) {
            return imgEl.src;
        }
        return "";
    };

    const posterImg = document.getElementById('poster-prev');
    let imgPath = (posterImg && posterImg.src && posterImg.src.includes('data:image')) ? posterImg.src : "";

    const btcLogoImg = document.getElementById('logo-prev');
    let btcLogoPath = (btcLogoImg && btcLogoImg.src && btcLogoImg.src.includes('data:image')) ? btcLogoImg.src : "";
    
    const mapImg = document.getElementById('map-prev');
    let mapPath = (mapImg && mapImg.src && mapImg.src.includes('data:image')) ? mapImg.src : "";


    const qrImg = document.getElementById('qr-prev');
    let qrPath = (qrImg && qrImg.src && qrImg.src.includes('data:image')) ? qrImg.src : "";
    
    const newEvent = {
    id: isEditing && currentEditCard ? currentEditCard.dataset.id : 'ev-' + Date.now(),
    title: rawName || "Sự kiện chưa đặt tên",
    name: rawName || "Sự kiện chưa đặt tên", 
    type: formatNA('event-type-input'),
    locname: formatNA('event-location-name'),
    locdetail: formatNA('event-location-detail'),
    start: formatNA('start-time'),
    end: formatNA('end-time'),
    desc: formatNA('event-description'),
    btcname: formatNA('btc-name'),         
    btcemail: formatNA('btc-email'),
    btcphone: formatNA('btc-phone'),          
    btcinfo: formatNA('btc-info'),
    bankname: formatNA('bank-name'),
    bankuser: formatNA('bank-user'),
    bankacc: formatNA('bank-acc'),
    img: imgPath,
    btclogo: btcLogoPath,
    map: mapPath, 
    bankqr: qrPath,
    status: isDraft ? 'draft' : 'pending',
    timeCreate: new Date().toLocaleString(),
    tickets: Array.from(document.querySelectorAll('#ticket-list > div')).map(row => ({
        name: row.querySelector('.ticket-name-input')?.value.trim() || "Vé thường",
        price: row.querySelector('.ticket-price-input')?.value.trim() || "0",
        qty: row.querySelector('.ticket-qty-input')?.value.trim() || "0"
    }))
};

    let allData = JSON.parse(localStorage.getItem('ticket_events')) || [];
    if (isEditing && currentEditCard) {
        const index = allData.findIndex(ev => ev.id === newEvent.id);
        if (index !== -1) allData[index] = newEvent;
    } else {
        allData.unshift(newEvent);
    }

    localStorage.setItem('ticket_events', JSON.stringify(allData));
    if (typeof closeConfirmModal === "function") closeConfirmModal();

    if (isDraft) {
    alert("Đã lưu bản nháp thành công!");

    } else {
        openSuccessModal();
    }
    
    isEditing = false;
    cancelCreate(); 
    showPage('my-events'); 
}

function cancelCreate() {
    isEditing = false;
    currentEditCard = null;
    const createPage = document.getElementById('page-create-event');
    if (!createPage) return;

    // 1. Reset tất cả input text, date, textarea
    createPage.querySelectorAll('input, textarea, select').forEach(field => {
        field.value = ''; 
        if (field.type === 'checkbox' || field.type === 'radio') field.checked = false;
    });

    // 2. Danh sách các ID preview ảnh cần dọn dẹp
    const imageIds = ['poster-prev', 'map-prev', 'qr-prev', 'logo-prev', 'seating-prev', 'qr-prev'];
    
    imageIds.forEach(id => {
        // Xóa nội dung ảnh
        const img = document.getElementById(id);
        if (img) {
            img.src = "";
            img.style.display = 'none'; // Ẩn hẳn thẻ img
        }

        // Hiện lại khung dấu cộng (+), ẩn khung chứa ảnh (wrap)
        const wrapId = id.replace('-prev', '-wrap');
        const uiId = id.replace('-prev', '-prev-ui');
        const wrap = document.getElementById(wrapId);
        const ui = document.getElementById(uiId);
        
        if (wrap) wrap.classList.add('hidden');
        if (ui) ui.classList.remove('hidden');

        // 3. QUAN TRỌNG: Xóa luôn dữ liệu tạm trong LocalStorage (nếu có lưu)
        localStorage.removeItem('temp_img_' + id);
    });

    // 4. Reset danh sách vé về mặc định (1 hàng trống)
    const list = document.getElementById('ticket-list');
    if (list) { 
        list.innerHTML = ''; 
        addTicketRow(); 
    }

    // 5. Đưa nút bấm về trạng thái ban đầu
    const mainFinishBtn = document.querySelector('button[onclick="showConfirmModal()"]');
    if (mainFinishBtn) mainFinishBtn.innerText = "TẠO SỰ KIỆN";

    // 6. Quay về bước 1
    goToStep(1);
}

function openSuccessModal() {
    const modal = document.getElementById('success-notice-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('success-notice-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    // Sau khi đóng modal mới chuyển trang
    showPage('my-events');
}

function editEvent(btn) {
    isEditing = true;
    // 1. Lấy ID từ card
    currentEditCard = btn.closest('.event-item-card');
    const eventId = currentEditCard.dataset.id; 

    // 2. Tìm dữ liệu gốc trong localStorage thay vì dùng dataset
    let allData = JSON.parse(localStorage.getItem('ticket_events')) || [];
    const ev = allData.find(item => item.id === eventId);

    if (!ev) {
        alert("Không tìm thấy dữ liệu sự kiện!");
        return;
    }

    // 3. Chuyển trang
    showPage('create-event');
    goToStep(1);

    // 4. Đổ dữ liệu vào Form (Dùng chính xác tên biến bạn đã lưu ở hàm finishCreateEvent)
    document.getElementById('event-name-input').value = cleanData(ev.name || ev.title);
    document.getElementById('event-type-input').value = cleanData(ev.type);
    document.getElementById('event-location-name').value = cleanData(ev.locname);
    document.getElementById('event-location-detail').value = cleanData(ev.locdetail);
    document.getElementById('start-time').value = cleanData(ev.start);
    document.getElementById('end-time').value = cleanData(ev.end);
    document.getElementById('event-description').value = cleanData(ev.desc);
    document.getElementById('btc-name').value = cleanData(ev.btcname);
    document.getElementById('btc-email').value = cleanData(ev.btcemail);
    document.getElementById('btc-phone').value = cleanData(ev.btcphone);
    document.getElementById('btc-info').value = cleanData(ev.btcinfo); 
    document.getElementById('bank-name').value = cleanData(ev.bankname);
    document.getElementById('bank-user').value = cleanData(ev.bankuser);
    document.getElementById('bank-acc').value = cleanData(ev.bankacc);

    // --- 5. HIỂN THỊ LẠI CÁC LOẠI ẢNH ---
    const renderImagePreview = (data, prevId, wrapId, uiId) => {
    const prev = document.getElementById(prevId);
    const wrap = document.getElementById(wrapId);
    const ui = document.getElementById(uiId);

    if (data && data.length > 10 && data.includes('data:image')) {
        if (prev) {
            prev.src = data; // Hiển thị ảnh cũ lên
            prev.style.display = 'block';
            prev.style.width = '100%';
            prev.style.height = '100%';
            prev.style.objectFit = 'cover';
        }
        if (wrap) wrap.classList.remove('hidden');
        if (ui) ui.classList.add('hidden');
        
        // QUAN TRỌNG: Lưu lại vào localStorage tạm để hàm finishCreateEvent có cái mà lấy
        localStorage.setItem('temp_img_' + prevId, data); 
    } else {
        if (wrap) wrap.classList.add('hidden');
        if (ui) ui.classList.remove('hidden');
        if (prev) prev.src = "";
        localStorage.removeItem('temp_img_' + prevId);
    }
};

renderImagePreview(ev.img, 'poster-prev', 'poster-wrap', 'poster-prev-ui');
renderImagePreview(ev.map, 'map-prev', 'map-wrap', 'map-prev-ui');
renderImagePreview(ev.bankqr, 'qr-prev', 'qr-wrap', 'qr-prev-ui');
renderImagePreview(ev.btclogo, 'logo-prev', 'logo-wrap', 'logo-prev-ui');

    const mainFinishBtn = document.querySelector('button[onclick="showConfirmModal()"]');
    if(mainFinishBtn) mainFinishBtn.innerText = "CẬP NHẬT SỰ KIỆN";

    // Đổ lại danh sách vé
const list = document.getElementById('ticket-list');
if (list && ev.tickets) {
    list.innerHTML = ''; // Xóa trắng
    ev.tickets.forEach(t => {
        addTicketRow(); // Tạo row mới
        const lastRow = list.lastElementChild;
        lastRow.querySelector('.ticket-name-input').value = t.name;
        lastRow.querySelector('.ticket-price-input').value = t.price;
        lastRow.querySelector('.ticket-qty-input').value = t.qty;
    });
}
}

// --- 6. MODAL XÁC NHẬN (CONFIRMATION) ---
function showConfirmModal() {
    try {
        const getVal = (id) => {
            const el = document.getElementById(id);
            const val = el ? el.value.trim() : "";
            return val !== "" ? val : '<span class="text-gray-400 italic font-normal">Chưa nhập</span>';
        };

        const getImgSrc = (id) => {
            const img = document.getElementById(id);
            return (img && img.src && img.src.includes('data:image')) ? img.src : null;
        };

        const posterSrc = getImgSrc('poster-prev') || 'https://via.placeholder.com/400x600?text=No+Poster';
        const seatingSrc = getImgSrc('map-prev');
        const qrSrc = getImgSrc('qr-prev');           
        const btcLogoSrc = getImgSrc('logo-prev');     

        let ticketInfo = "";
        document.querySelectorAll('#ticket-list > div').forEach((row, index) => {
            const tName = row.querySelector('.ticket-name-input')?.value.trim();
            const tPrice = row.querySelector('.ticket-price-input')?.value.trim();
            const tQty = row.querySelector('.ticket-qty-input')?.value.trim();
            if (tName || tPrice) {
                ticketInfo += `
                    <div class="flex justify-between items-center text-[11px] border-b border-gray-50 py-2">
                        <div class="flex flex-col min-w-0 pr-2">
                            <span class="font-bold text-gray-900 truncate">${tName || 'Vé ' + (index + 1)}</span>
                            <span class="text-[9px] text-gray-500">Số lượng: ${tQty || '0'}</span>
                        </div>
                        <b class="text-[#ff007a] whitespace-nowrap">${tPrice ? Number(tPrice).toLocaleString() : '0'}đ</b>
                    </div>`;
            }
        });

        const content = `
    <div class="space-y-6 pb-4 text-left w-full">
        <div class="relative w-full h-32 rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-gray-200">
            <img src="${posterSrc}" class="w-full h-full object-cover blur-[2px] opacity-40">
            <div class="absolute inset-0 flex items-center p-4 gap-4 bg-gradient-to-r from-white via-white/80 to-transparent">
                <img src="${posterSrc}" class="w-20 h-28 object-cover rounded-xl shadow-lg border-2 border-white shrink-0">
                <div class="flex-1 min-w-0">
                    <p class="text-[9px] text-gray-500 uppercase font-black tracking-widest">Xem trước sự kiện</p>
                    <h4 class="font-black text-lg text-gray-900 uppercase truncate leading-tight">${getVal('event-name-input')}</h4>
                    <span class="inline-block mt-1 px-3 py-0.5 bg-blue-50 text-[#00d2ff] text-[9px] font-bold rounded-full border border-blue-100 uppercase">${getVal('event-type-input')}</span>
                </div>
            </div>
        </div>

        <div class="w-full">
            <p class="text-[10px] text-gray-400 uppercase font-black mb-2 tracking-widest"><i class="fa-solid fa-align-left"></i> Mô tả chi tiết</p>
            <div class="bg-gray-50 border border-gray-100 rounded-2xl p-3 text-[11px] text-gray-600 leading-relaxed max-h-32 overflow-y-auto">
                ${getVal('event-description').replace(/\n/g, '<br>')}
            </div>
        </div>

        <div class="grid grid-cols-1 gap-3 bg-gray-50 p-4 rounded-3xl border border-gray-100 w-full">
            <div class="flex items-center gap-3 w-full">
                <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm shrink-0"><i class="fa-regular fa-calendar"></i></div>
                <div class="flex-1">
                    <p class="text-[9px] text-gray-400 uppercase font-bold leading-none">Thời gian</p>
                    <p class="text-[11px] font-bold text-gray-800 mt-1">${getVal('start-time').replace('T', ' ')} → ${getVal('end-time').replace('T', ' ')}</p>
                </div>
            </div>
            <div class="flex items-center gap-3 w-full">
                <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm shrink-0"><i class="fa-solid fa-location-dot"></i></div>
                <div class="flex-1">
                    <p class="text-[9px] text-gray-400 uppercase font-bold leading-none">Địa điểm</p>
                    <p class="text-[11px] font-bold text-gray-800 mt-1">${getVal('event-location-name')}</p>
                    <p class="text-[9px] text-gray-500 italic">${getVal('event-location-detail')}</p>
                </div>
            </div>
        </div>

        <div class="w-full">
            <p class="text-[10px] text-gray-400 uppercase font-black mb-2 tracking-widest"><i class="fa-solid fa-ticket"></i> Thông tin vé</p>
            <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm w-full">
                <div class="grid grid-cols-1 gap-1 mb-3">
                    ${ticketInfo || '<span class="text-gray-400 text-xs italic text-center">Chưa có thông tin vé</span>'}
                </div>
                ${seatingSrc ? `<p class="text-[9px] text-gray-400 mb-1 uppercase font-bold">Sơ đồ:</p><img src="${seatingSrc}" class="w-full rounded-lg border border-gray-100">` : ''}
            </div>
        </div>

        <div class="space-y-3 w-full">
            <div class="p-3 bg-purple-50 rounded-2xl border border-purple-100 w-full flex gap-3 items-center">
                ${btcLogoSrc ? `<img src="${btcLogoSrc}" class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm">` : '<div class="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center text-purple-500"><i class="fa-solid fa-user-tie"></i></div>'}
                <div class="flex-1 min-w-0">
                    <p class="text-[9px] text-purple-400 uppercase font-black mb-1">Ban tổ chức</p>
                    <p class="text-[11px] font-bold text-purple-900 truncate">${getVal('btc-name')}</p>
                    <p class="text-[10px] text-purple-700 font-medium truncate">${getVal('btc-email')} | ${getVal('btc-phone')}</p>
                    <p class="text-[10px] text-purple-600 mt-1 italic leading-tight">${getVal('btc-info').replace(/\n/g, '<br>')}</p>
                </div>
            </div>
            
            <div class="p-3 bg-green-50 rounded-2xl border border-green-100 w-full">
                <p class="text-[9px] text-green-600 uppercase font-black mb-1">Tài khoản nhận tiền</p>
                <div class="flex justify-between items-center w-full gap-4">
                    <div class="flex-1">
                        <p class="text-[11px] font-bold text-green-900 uppercase">${getVal('bank-name')}</p>
                        <p class="text-[10px] text-green-700 font-medium">Chủ TK: ${getVal('bank-user')}</p>
                        <p class="text-[14px] text-green-600 font-black tracking-tight mt-1">${getVal('bank-acc')}</p>
                    </div>
                    ${qrSrc ? `<img src="${qrSrc}" class="w-16 h-16 bg-white p-1 rounded border border-green-200 object-contain">` : ''}
                </div>
            </div>
        </div>

        <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200 mt-4">
            <p class="text-[10px] text-amber-600 font-black uppercase mb-1 flex items-center gap-2">
                <i class="fa-solid fa-circle-exclamation"></i> Quy trình xét duyệt
            </p>
            <ul class="text-[11px] text-amber-800 space-y-1 font-bold leading-tight">
                <li>• Thời gian chờ duyệt: 5 - 7 ngày làm việc.</li>
                <li>• Thời gian hiển thị: Cần thêm 5 - 7 ngày để lên trang chủ.</li>
            </ul>
        </div>
    </div>`;

        const modalContent = document.getElementById('confirm-content');
        const modal = document.getElementById('confirm-modal');
        if (modalContent && modal) {
            modalContent.innerHTML = content;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    } catch (e) { console.error(e); }
}

function closeConfirmModal() {
    document.getElementById('confirm-modal')?.classList.add('hidden');
}


// --- 7. HIỂN THỊ DANH SÁCH ---
function loadMyEvents() {
    const container = document.getElementById('events-container');
    if (!container) return;

    const allEvents = JSON.parse(localStorage.getItem('ticket_events')) || [];

    if (allEvents.length === 0) {
        container.innerHTML = `
            <div id="empty-state" class="flex flex-col items-center justify-center py-20 animate-fade-in">
                <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <i class="fa-solid fa-calendar-plus text-2xl text-[#00d2ff]"></i>
                </div>
                <p class="text-gray-400 italic mb-6">Bạn chưa tạo sự kiện nào đâu!</p>
                <button onclick="showPage('create-event')" class="px-8 py-3 bg-black text-white rounded-xl border border-white/10 hover:bg-[#00d2ff] hover:text-black transition-all font-bold uppercase tracking-widest text-xs">
                    Tạo sự kiện ngay
                </button>
            </div>`;
        return;
    }

    container.innerHTML = ""; 
    allEvents.forEach(ev => {
        // --- LOGIC BADGE TRẠNG THÁI MỚI ---
        let statusBadge = "";
        if (ev.status === 'active') {
            statusBadge = '<span class="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 font-bold uppercase">✅ Đã được duyệt</span>';
        } else if (ev.status === 'rejected') {
            statusBadge = '<span class="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 font-bold uppercase">❌ Bị từ chối</span>';
        } else if (ev.status === 'draft') {
            statusBadge = '<span class="text-[10px] text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded border border-gray-500/20 font-bold uppercase">📝 Bản nháp</span>';
        } else {
            statusBadge = '<span class="text-[10px] text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 font-bold uppercase italic">⏳ Đang chờ duyệt</span>';
        }

        const card = `
<div class="event-item-card w-full flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl mb-4 animate-fade-in" 
    data-id="${ev.id}"
    data-name="${ev.name || ev.title}"
    data-type="${ev.type}"
    data-locname="${ev.locname || ev.location}"
    data-locdetail="${ev.locdetail}"
    data-start="${ev.start}"
    data-end="${ev.end}"
    data-desc="${ev.desc}"
    data-btcname="${ev.btcname || ev.organizer}"
    data-btcemail="${ev.btcemail}"
    data-btcphone="${ev.btcphone}"
    data-btcinfo="${ev.btcinfo}"
    data-bankname="${ev.bankname}"
    data-bankuser="${ev.bankuser}"
    data-bankacc="${ev.bankacc}"
    data-img="${ev.img}"
    data-tickets='${JSON.stringify(ev.tickets || [])}'
>

    <div class="flex items-center gap-4">
        <img src="${ev.img || 'https://via.placeholder.com/50'}" 
             class="w-14 h-14 rounded-xl object-cover bg-gray-800 border border-white/5">

        <div>
            <h4 class="font-bold text-white mb-1">${ev.title}</h4>
            ${statusBadge}
        </div>
    </div>

    <div class="flex gap-4">
        <button onclick="editEvent(this)" class="text-gray-400 hover:text-[#00d2ff] text-[10px] font-black uppercase">Sửa</button>
        <button onclick="deleteEvent(this)" class="text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase">Xóa</button>
    </div>

</div>`;
        container.insertAdjacentHTML('beforeend', card);
    });
}

function deleteEvent(btn) {
    const card = btn.closest('.event-item-card');
    const eventId = card.dataset.id;
    if(confirm("Xác nhận xóa vĩnh viễn sự kiện này nhé?")) {
        let allData = JSON.parse(localStorage.getItem('ticket_events')) || [];
        allData = allData.filter(ev => ev.id !== eventId);
        localStorage.setItem('ticket_events', JSON.stringify(allData));
if (isEditing && currentEditCard && currentEditCard.dataset.id === eventId) {
            cancelCreate(); 
        }
        loadMyEvents();
        alert("Đã xoá sự kiện thành công!");
    }
}

function deleteAllEvents() {
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tất cả sự kiện?")) {
        return;
    }
    localStorage.removeItem('events'); 
    const container = document.getElementById('events-container');
    if (container) {
        container.innerHTML = `
            <div id="empty-state" class="flex flex-col items-center justify-center py-24 w-full bg-white/[0.02] rounded-[30px] border border-dashed border-white/10">
                <i class="fa-solid fa-box-open text-4xl text-gray-700 mb-4"></i>
                <h3 class="text-gray-400 text-lg font-bold uppercase">Đã xóa sạch sự kiện</h3>
                <p class="text-gray-500 text-xs">F5 lần nữa nhé!</p>
            </div>
        `;
    }
    
    alert("Đã xóa xong danh sách sự kiện!");
}


function loadEventsForUser() {
    const grid = document.getElementById('event-grid'); 
    if (!grid) return;

    grid.innerHTML = ""; 

    const realEvents = JSON.parse(localStorage.getItem('ticket_events')) || [];

    if (realEvents.length === 0) {
        grid.innerHTML = "<p>Chưa có sự kiện nào được tạo.</p>";
        return;
    }

    realEvents.forEach(ev => {
        addEventCardToGrid(ev, true);
    });
}

document.addEventListener('DOMContentLoaded', loadEventsForUser);

// --- 8. ADMIN RENDER LOGIC (Trang 1.html) ---
function loadEventsAdmin() {
    const container = document.getElementById('admin-events-container');
    if (!container) return;

    const allEvents = JSON.parse(localStorage.getItem('ticket_events')) || [];
    if (allEvents.length === 0) {
        container.innerHTML = `<div class="text-center py-20 bg-white/5 rounded-3xl border border-white/10"><p class="text-gray-500 italic">Chưa có sự kiện nào được tạo, bạn ơi!</p></div>`;
        return;
    }

    container.innerHTML = ""; 
    const displayEvents = [...allEvents].reverse();

    displayEvents.forEach(ev => {
        let statusBadge = ev.status === 'active' 
            ? '<span class="bg-green-500/20 text-green-400 px-2 py-1 rounded text-[10px] font-bold border border-green-500/30 uppercase">✅ Đã duyệt</span>'
            : (ev.status === 'draft' 
                ? '<span class="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-[10px] font-bold border border-gray-500/30 uppercase">📝 Bản nháp</span>'
                : '<span class="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-[10px] font-bold border border-yellow-500/30 uppercase italic">⏳ Chờ duyệt</span>');

        let ticketHtml = (ev.tickets || []).map(t => `
            <div class="flex justify-between items-center bg-black/20 p-2 rounded-lg mb-1 border border-white/5">
                <span class="text-[11px] text-white font-medium">${t.name}</span>
                <span class="text-[11px] text-[#00d2ff] font-bold">${Number(t.price).toLocaleString()}đ</span>
                <span class="text-[10px] text-gray-500">SL: ${t.qty}</span>
            </div>`).join('');

        const card = `
            <div class="bg-[#121212] border border-white/10 rounded-[32px] p-6 mb-6 hover:border-[#00d2ff]/40 transition-all group animate-fade-in">
                <div class="flex flex-col lg:flex-row gap-8">
                    <div class="w-full lg:w-56 h-72 shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-gray-900">
                        <img src="${ev.img || 'https://via.placeholder.com/200x300?text=No+Poster'}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div class="flex-1 space-y-5">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">${ev.title}</h3>
                                <div class="flex items-center gap-3">${statusBadge}<span class="text-[#00d2ff] text-[10px] font-black uppercase tracking-widest">${ev.type}</span></div>
                            </div>
                            <div class="text-right text-[10px] text-gray-500 font-mono"><p>ID: ${ev.id}</p><p>${ev.timeCreate}</p></div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-5 rounded-[24px] border border-white/5">
                            <div class="space-y-3">
                                <p class="text-[10px] text-gray-500 font-black uppercase tracking-widest border-b border-white/10 pb-1">📍 Địa điểm & Thời gian</p>
                                <p class="text-xs text-gray-200"><b>Lịch:</b> ${ev.start} → ${ev.end}</p>
                                <p class="text-xs text-gray-200"><b>Nơi:</b> ${ev.locname}</p>
                            </div>
                            <div class="space-y-3">
                                <p class="text-[10px] text-gray-500 font-black uppercase tracking-widest border-b border-white/10 pb-1">🎫 Thông tin vé</p>
                                ${ticketHtml || '<p class="text-[10px] text-gray-600">Chưa cấu hình vé</p>'}
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div class="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                <p class="text-[9px] text-blue-400 font-black uppercase mb-2">BTC: ${ev.btcname}</p>
                                <p class="text-[11px] text-gray-400">${ev.btcemail} | ${ev.btcphone}</p>
                            </div>
                            <div class="p-4 bg-green-500/5 rounded-2xl border border-green-500/10">
                                <p class="text-[9px] text-green-400 font-black uppercase mb-2">BANK: ${ev.bankname}</p>
                                <p class="text-[12px] text-white font-mono">STK: ${ev.bankacc}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end gap-4 mt-8 border-t border-white/5 pt-5">
                    ${ev.status !== 'active' ? `<button onclick="approveEvent('${ev.id}')" class="px-8 py-2.5 bg-[#00d2ff] text-black text-[11px] font-black rounded-xl hover:bg-white transition-all uppercase">Duyệt sự kiện</button>` : ''}
                    <button onclick="deleteEventAdmin('${ev.id}')" class="px-8 py-2.5 bg-red-500/10 text-red-500 text-[11px] font-black rounded-xl hover:bg-red-500 hover:text-white transition-all uppercase">Xóa vĩnh viễn</button>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', card);
    });
}

function deleteEventAdmin(id) {
    if(confirm("Bạn có chắc muốn xóa sự kiện này không?")) {
        let data = JSON.parse(localStorage.getItem('ticket_events')) || [];
        localStorage.setItem('ticket_events', JSON.stringify(data.filter(ev => ev.id !== id)));
        loadEventsAdmin();
    }
}

function approveEvent(id) {
    let data = JSON.parse(localStorage.getItem('ticket_events')) || [];
    const idx = data.findIndex(ev => ev.id === id);
    if(idx !== -1) {
        data[idx].status = 'active';
        localStorage.setItem('ticket_events', JSON.stringify(data));
        alert("Đã duyệt sự kiện lên sàn!");
        loadEventsAdmin();
    }
}

// --- 9. MODAL LƯU Ý (NOTICE MODAL) ---
function openNoticeModal() {
    const modal = document.getElementById('notice-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex'); 
    }
}

function closeNoticeModal() {
    const modal = document.getElementById('notice-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        showPage('home'); 
    }
}

function syncUserInterface(user) {
    const userNameEl = document.getElementById('user-name-sidebar');
    const userAvatarEl = document.getElementById('user-avatar');
    const userNameWelcome = document.getElementById('user-name-welcome');

    if (user && userNameEl && userAvatarEl) {
        // Hiển thị tên
        userNameEl.textContent = user.name;
        if (userNameWelcome) userNameWelcome.textContent = user.name;
        if (user.avatar) {
            userAvatarEl.innerHTML = `<img src="${user.avatar}" class="w-full h-full rounded-full object-cover border-2 border-white/20">`;
            userAvatarEl.classList.remove('bg-gradient-to-br', 'from-[#00d2ff]', 'to-[#3a7bd5]'); // Bỏ nền gradient nếu có ảnh
        } else {
            const initials = user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(-2);
            userAvatarEl.textContent = initials;
        }
    }
}

function handleLogout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
        localStorage.removeItem('userLogin'); 
        sessionStorage.removeItem('hasSeenNotice');
        window.location.href = "index.html"; 
    }
} 

