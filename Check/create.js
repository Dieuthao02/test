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
    
    if (!loggedInUser || !loggedInUser.name) {
        alert("Bạn cần đăng nhập trước nhé!");
        window.location.href = "index.html"; 
        return;
    }

    syncUserInterface(loggedInUser);
 
    if (!sessionStorage.getItem('hasSeenNotice')) {
        openNoticeModal();
    } else {
        showPage('home');
    }

    if (document.getElementById('admin-events-container')) {
        loadEventsAdmin();
    }
};


// --- 1. TIỆN ÍCH HỆ THỐNG ---
function getTimeAgo() { return "Vừa xong"; }

const formatNA = (id) => {
    const val = document.getElementById(id)?.value.trim();
    return (val === "" || val === null) ? "N/A" : val;
};

const cleanData = (val) => (val === "N/A" || !val || val === "undefined") ? "" : val;

// --- 2. ĐIỀU HƯỚNG & GIAO DIỆN CHÍNH ---
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
    const currentStep = document.querySelector('.step-content:not(.hidden)');
    const currentStepNum = currentStep ? parseInt(currentStep.id.replace('create-step-', '')) : 1;

    if (stepNumber > currentStepNum) {
        let firstInvalidField = null;
        let isValid = true;

        // 1. Quét các ô bắt buộc (Text, Email, Checkbox...)
        const requiredFields = currentStep.querySelectorAll('input[required], select[required], textarea[required]');
        
        requiredFields.forEach(field => {
            field.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
            field.parentElement.classList.remove('ring-1', 'ring-red-500');

            let isFieldInvalid = false;

            if (field.type === 'checkbox') {
                if (!field.checked) {
                    isFieldInvalid = true;
                    field.parentElement.classList.add('ring-1', 'ring-red-500', 'rounded-lg');
                }
            } else {
                // Với input file hoặc text, kiểm tra giá trị rỗng
                if (!field.value || !field.value.trim()) {
                    isFieldInvalid = true;
                    // Nếu là input file bị ẩn (Mã QR), mình highlight cái khung Upload
                    if (field.type === 'file') {
                        const uploadBox = field.closest('.upload-box');
                        if (uploadBox) uploadBox.classList.add('border-red-500', 'ring-1', 'ring-red-500');
                    } else {
                        field.classList.add('border-red-500', 'ring-1', 'ring-red-500');
                    }
                }
            }

            if (isFieldInvalid) {
                isValid = false;
                if (!firstInvalidField) firstInvalidField = field;
            }
        });

        if (!isValid) {
            if (firstInvalidField) {
                // Nếu là input ẩn, mình focus vào cái khung chứa nó
                if (firstInvalidField.classList.contains('hidden')) {
                    firstInvalidField.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    firstInvalidField.focus();
                    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            return; 
        }
    }

    // --- PHẦN CHUYỂN BƯỚC (Giữ nguyên giao diện của Thảo) ---
    document.querySelectorAll('.step-content').forEach(content => content.classList.add('hidden'));
    const targetStep = document.getElementById(`create-step-${stepNumber}`);
    if (targetStep) targetStep.classList.remove('hidden');

    document.querySelectorAll('.step-item').forEach((tab, index) => {
        const stepIdx = index + 1;
        const isActive = stepIdx === stepNumber;
        tab.classList.toggle('border-[#00d2ff]', isActive);
        tab.classList.toggle('text-[#00d2ff]', isActive);
        tab.classList.toggle('text-gray-500', !isActive);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
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

function renderImagePreview(base64, prevId, wrapId, uiId) {
    if (!base64 || base64 === "") return;
    const img = document.getElementById(prevId);
    const wrap = document.getElementById(wrapId);
    const ui = document.getElementById(uiId);

    if (img) {
        img.src = base64;
        img.style.display = 'block';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        if (wrap) wrap.classList.remove('hidden');
        if (ui) ui.classList.add('hidden');
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

// --- 4. LOGIC NGHIỆP VỤ VÉ  ---

function addTimeSlot() {
    const list = document.getElementById('timeslot-list');
    const newSlot = document.createElement('div');
    newSlot.className = 'timeslot-item grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/5 relative group animate-fade-in';
    newSlot.innerHTML = `
        <div class="absolute -right-2 -top-2 hidden group-hover:flex w-6 h-6 bg-red-500 text-white rounded-full items-center justify-center cursor-pointer z-10" onclick="this.parentElement.remove()">
            <i class="fa-solid fa-xmark text-[10px]"></i>
        </div>
        <div>
            <label class="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Bắt đầu</label>
            <input type="datetime-local" class="start-time-input w-full bg-white/10 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-[#00d2ff]" required>
        </div>
        <div>
            <label class="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Kết thúc</label>
            <input type="datetime-local" class="end-time-input w-full bg-white/10 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-[#00d2ff]" required>
        </div>
    `;
    list.appendChild(newSlot);
}

function addTicketRow() {
    const list = document.getElementById('ticket-list');
    if (!list) return;

    const div = document.createElement('div');
div.className = "grid grid-cols-1 md:grid-cols-[2fr_2fr_1.5fr_0.5fr] gap-4 p-4 bg-white/5 border border-white/10 rounded-xl relative group mb-3 animate-fade-in items-center mx-auto max-w-4xl";

div.innerHTML = `
    <input type="text" placeholder="Tên vé" 
        class="ticket-name-input w-full bg-transparent border border-gray-500 rounded p-2 text-white focus:border-[#00d2ff] outline-none transition-all" required>
    
    <input type="number" placeholder="Giá (VNĐ)" 
        class="ticket-price-input w-full bg-transparent border border-gray-500 rounded p-2 text-white focus:border-[#00d2ff] outline-none transition-all" required>
    
    <input type="number" placeholder="Số lượng" 
        class="ticket-qty-input w-full bg-transparent border border-gray-500 rounded p-2 text-white focus:border-[#00d2ff] outline-none transition-all text-center" required>
    
    <button onclick="this.parentElement.remove()" 
        class="text-red-500 hover:text-red-400 p-2 flex justify-center items-center transition-transform hover:scale-110">
        <i class="fa-solid fa-trash-can"></i>
    </button>`; 

    list.appendChild(div);
}

// --- 5. LƯU TRỮ & XỬ LÝ DỮ LIỆU (STORAGE & CRUD) ---
async function finishCreateEvent(isDraft = false) {
    try {
        const rawName = document.getElementById('event-name-input')?.value.trim() || "";
        
        if (!isDraft && (rawName === "" || rawName === "Diệu Thảo")) { 
            alert("Tên sự kiện không được để trống nhé!");
            return;
        }
        
        const legalFilesLink = document.getElementById('legal-files-link')?.value.trim() || "";
        
        const getBase64FromImg = (id) => {
            const imgEl = document.getElementById(id);
            return (imgEl && imgEl.src && imgEl.src.startsWith('data:image')) ? imgEl.src : "";
        };

        // Gom dữ liệu sự kiện
        const newEvent = {
            id: (isEditing && currentEditCard) ? currentEditCard.dataset.id : 'ev-' + Date.now(),
            title: rawName,
            // Bước 1 & 2: Media
            img: getBase64FromImg('poster-prev'),       
            banner: getBase64FromImg('cover-prev'),     
            type: document.getElementById('event-type-input')?.value || "",
            mode: document.getElementById('event-mode-input')?.value || "Online",
            trailer: document.getElementById('event-trailer')?.value || "",
            locname: document.getElementById('event-location-name')?.value || "",
            locdetail: document.getElementById('event-location-detail')?.value || "",
            desc: document.getElementById('event-description')?.value || "",
            
            // Ban tổ chức
            btclogo: getBase64FromImg('logo-prev'),
            btcname: document.getElementById('btc-name')?.value.trim() || "", 
            btcemail: document.getElementById('btc-email')?.value.trim() || "",
            btcphone: document.getElementById('btc-phone')?.value.trim() || "",
            btcinfo: document.getElementById('btc-info')?.value.trim() || "",

            // Thời gian
            timeSlots: Array.from(document.querySelectorAll('#timeslot-list .timeslot-item')).map(slot => ({
                start: slot.querySelector('.start-time-input')?.value,
                end: slot.querySelector('.end-time-input')?.value
            })),

            // Vé 
            tickets: Array.from(document.querySelectorAll('#ticket-list > div')).map(row => ({
                name: row.querySelector('.ticket-name-input')?.value || "",
                price: row.querySelector('.ticket-price-input')?.value || "0",
                qty: row.querySelector('.ticket-qty-input')?.value || "0"
            })),
            
            map: getBase64FromImg('map-prev'), 

            // Bước 3: Pháp lý
            orgType: document.querySelector('input[name="org-type"]:checked')?.value || "", 
            taxId: document.getElementById('tax-id-input')?.value.trim() || "",
            legalId: document.getElementById('legal-id-input')?.value.trim() || "",
            rules: document.getElementById('event-rules')?.value.trim() || "",
            refundPolicy: document.getElementById('refund-policy')?.value || "none",
            compensation: document.getElementById('det-compensation')?.value || "",
            legalFilesLink: legalFilesLink,
        
            // Bước 4: Tài khoản
            bankname: document.getElementById('bank-name')?.value.trim() || "",
            bankuser: document.getElementById('bank-user')?.value.trim() || "",
            bankacc: document.getElementById('bank-acc')?.value.trim() || "",
            bankbranch: document.getElementById('bank-branch')?.value.trim() || "", 
            billingEmail: document.getElementById('billing-email')?.value.trim() || "",
            bankqr: getBase64FromImg('qr-prev'),
            
            status: isDraft ? 'draft' : 'pending',
            timeCreate: new Date().toLocaleString()
        };

        // Lưu vào LocalStorage
        let allData = JSON.parse(localStorage.getItem('ticket_events')) || [];
        if (isEditing && currentEditCard) {
            const index = allData.findIndex(ev => ev.id === newEvent.id);
            if (index !== -1) allData[index] = newEvent;
            else allData.unshift(newEvent);
        } else {
            allData.unshift(newEvent);
        }

        localStorage.setItem('ticket_events', JSON.stringify(allData));

        // Xử lý hậu kỳ
        if (typeof closeConfirmModal === "function") closeConfirmModal();

        if (isDraft) {
            alert("Đã lưu bản nháp thành công!");
        } else {
            openSuccessModal();
        }
        
        alert(isDraft ? "Đã lưu nháp!" : "Lưu thành công!");
        isEditing = false;
        currentEditCard = null;
        selectedFiles = [];
        cancelCreate(); 
        showPage('my-events'); 
        if(typeof loadMyEvents === "function") loadMyEvents(); 

    } catch (error) {
        console.error("Lỗi khi lưu sự kiện:", error);
    }
}

function cancelCreate() {

    isEditing = false;
    currentEditCard = null;
    if (typeof selectedFiles !== 'undefined') selectedFiles = []; 

    const createPage = document.getElementById('page-create-event');
    if (!createPage) return;

    createPage.querySelectorAll('input, textarea, select').forEach(field => {
        field.value = ''; 
        if (field.type === 'checkbox' || field.type === 'radio') field.checked = false;
    });

    const timeslotList = document.getElementById('timeslot-list');
    if (timeslotList) timeslotList.innerHTML = ''; 
    
    const ticketList = document.getElementById('ticket-list');
    if (ticketList) {
        ticketList.innerHTML = '';
        addTicketRow(); 
    }

    const imagePreviewConfigs = [
        { id: 'poster-prev', wrap: 'poster-wrap', ui: 'poster-prev-ui' },
        { id: 'cover-prev', wrap: 'cover-wrap', ui: 'cover-prev-ui' },
        { id: 'map-prev', wrap: 'map-wrap', ui: 'map-prev-ui' },
        { id: 'logo-prev', wrap: 'logo-wrap', ui: 'logo-prev-ui' },
        { id: 'qr-prev', wrap: 'qr-wrap', ui: 'qr-prev-ui' }
    ];

    imagePreviewConfigs.forEach(config => {
        const img = document.getElementById(config.id);
        const wrap = document.getElementById(config.wrap);
        const ui = document.getElementById(config.ui);
        
        if (img) img.src = "";
        if (wrap) wrap.classList.add('hidden');
        if (ui) ui.classList.remove('hidden');
    });

    const mainFinishBtn = document.querySelector('button[onclick="showConfirmModal()"]');
    if (mainFinishBtn) mainFinishBtn.innerText = "TẠO SỰ KIỆN";

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

    showPage('my-events');
}

function editEvent(btn) {
    isEditing = true;
    currentEditCard = btn.closest('.event-item-card');
    const eventId = currentEditCard.dataset.id; 

    let allData = JSON.parse(localStorage.getItem('ticket_events')) || [];
    const ev = allData.find(item => item.id === eventId);

    if (!ev) {
        alert("Không tìm thấy dữ liệu!"); 
        return;
    }

    showPage('create-event');
    if (typeof goToStep === "function") goToStep(1);

    const setVal = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value || "";
    };

    // --- BƯỚC 1: THÔNG TIN CHUNG ---
    setVal('event-name-input', ev.title || ev.name);
    setVal('event-type-input', ev.type);
    setVal('event-mode-input', ev.mode);
    setVal('event-location-name', ev.locname || ev.locationName);
    setVal('event-location-detail', ev.locdetail || ev.locationDetail);
    setVal('event-description', ev.desc || ev.description);
    setVal('event-trailer', ev.trailer);

    // --- BƯỚC 2: THỜI GIAN & GIÁ VÉ ---
    const timeslotList = document.getElementById('timeslot-list');
    const slots = ev.timeSlots || ev.timeslots; 
    if (timeslotList && slots) {
        timeslotList.innerHTML = ''; 
        slots.forEach(slot => {
            addTimeSlot(); 
            const lastRow = timeslotList.lastElementChild;
            if (lastRow) {
                lastRow.querySelector('.start-time-input').value = slot.start || "";
                lastRow.querySelector('.end-time-input').value = slot.end || "";
            }
        });
    }

    const ticketList = document.getElementById('ticket-list');
    if (ticketList && ev.tickets) {
        ticketList.innerHTML = ''; 
        ev.tickets.forEach(t => {
            addTicketRow();
            const lastRow = ticketList.lastElementChild;
            if (lastRow) {
                lastRow.querySelector('.ticket-name-input').value = t.name || "";
                lastRow.querySelector('.ticket-price-input').value = t.price || "";
                lastRow.querySelector('.ticket-qty-input').value = t.qty || "";
            }
        });
    }

    // --- BƯỚC 3: PHÁP LÝ & FILE ---
    // 1. Loại hình tổ chức 
    const orgRadios = document.querySelectorAll('input[name="org-type"]');
    if (orgRadios.length > 0 && ev.orgType) {
        orgRadios.forEach(radio => { 
            radio.checked = (radio.value === ev.orgType); 
        });
    }

    setVal('legal-id-input', ev.legalId || ev.legalid);
    setVal('tax-id-input', ev.taxId || ev.taxid);
    setVal('event-rules', ev.rules);
    
    // 2. Chính sách & Bồi thường 
    const refundEl = document.getElementById('refund-policy');
    if (refundEl) refundEl.value = ev.refundPolicy || ev.refundpolicy || "none";
    
    const compEl = document.getElementById('det-compensation') || document.getElementById('compensation-policy');
    if (compEl) compEl.value = ev.compensation || "";
 
    // 2. Xử lý Link hồ sơ pháp lý 
    const legalLink = ev.legalFilesLink || "";
    setVal('legal-files-link', legalLink); 
    
    const fileListContainer = document.getElementById('file-list');
    if (fileListContainer) {
        if (legalLink) {
            fileListContainer.innerHTML = `
            <div class="flex items-center gap-2 bg-[#00d2ff]/10 px-3 py-2 rounded-xl border border-[#00d2ff]/20 animate-fade-in">
                <i class="fa-solid fa-link text-[#00d2ff] text-[10px]"></i>
                <span class="text-[10px] text-gray-200">Đã khôi phục đường dẫn hồ sơ</span>
                <button type="button" class="ml-1 text-gray-500 hover:text-red-400" onclick="clearLinkLabel()">
                    <i class="fa-solid fa-xmark text-[10px]"></i>
                </button>
            </div>
        `;
    } else {
        fileListContainer.innerHTML = '';
    }
}

    // --- BƯỚC 4: BAN TỔ CHỨC & TÀI KHOẢN ---
    setVal('btc-name', ev.btcname || ev.btcName);
    setVal('btc-email', ev.btcemail || ev.btcEmail);
    setVal('btc-phone', ev.btcphone || ev.btcPhone);
    setVal('btc-info', ev.btcinfo || ev.btcInfo);
    
    setVal('bank-name', ev.bankname || ev.bankName);
    setVal('bank-user', ev.bankuser || ev.bankUser);
    setVal('bank-acc', ev.bankacc || ev.bankAcc);
    setVal('bank-branch', ev.bankbranch || ev.bankBranch); 
    setVal('billing-email', ev.billingEmail || ev.billingemail);

    // --- HIỂN THỊ LẠI TẤT CẢ ẢNH  ---
    if (typeof renderImagePreview === "function") {
        // Poster & Banner
        renderImagePreview(ev.img || ev.poster, 'poster-prev', 'poster-wrap', 'poster-prev-ui');
        renderImagePreview(ev.banner || ev.cover, 'cover-prev', 'cover-wrap', 'cover-prev-ui');
        // Sơ đồ chỗ ngồi
        renderImagePreview(ev.map, 'map-prev', 'map-wrap', 'map-prev-ui');
        // Logo BTC
        renderImagePreview(ev.btclogo || ev.logo, 'logo-prev', 'logo-wrap', 'logo-prev-ui');
        // Mã QR Ngân hàng
        renderImagePreview(ev.bankqr || ev.qr, 'qr-prev', 'qr-wrap', 'qr-prev-ui');
    }

    // Đổi tên nút xác nhận
    const mainFinishBtn = document.querySelector('button[onclick="showConfirmModal()"]');
    if (mainFinishBtn) mainFinishBtn.innerText = "CẬP NHẬT SỰ KIỆN";
}

// --- 6. MODAL XÁC NHẬN  ---
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
        const bannerSrc = getImgSrc('cover-prev') || posterSrc;
        const seatingSrc = getImgSrc('map-prev');
        const qrSrc = getImgSrc('qr-prev');           
        const btcLogoSrc = getImgSrc('logo-prev');     
        const selectedRadio = document.querySelector('input[name="org-type"]:checked');
        let legalTypeVal = 'N/A';
        if (selectedRadio) {legalTypeVal = selectedRadio.nextElementSibling.innerText.trim(); }
        let timeSlotsHTML = "";
        document.querySelectorAll('#timeslot-list .timeslot-item').forEach((row, index) => {
            const start = row.querySelector('.start-time-input')?.value.replace('T', ' ') || '...';
            const end = row.querySelector('.end-time-input')?.value.replace('T', ' ') || '...';
            timeSlotsHTML += `
                <div class="flex justify-between items-center text-[10px] border-b border-gray-50 py-2">
                    <span class="font-bold text-gray-700">Khung giờ ${index + 1}</span>
                    <span class="text-gray-500">${start} <i class="fa-solid fa-arrow-right mx-1 text-[8px]"></i> ${end}</span>
                </div>`;
        });

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

        const trailerLink = document.getElementById('event-trailer')?.value.trim();
        const trailerHTML = trailerLink ? `
            <div class="p-4 bg-red-50 rounded-2xl border border-red-100 mb-4">
                <p class="text-[9px] text-red-600 uppercase font-black mb-2 tracking-widest"><i class="fa-brands fa-youtube"></i> Trailer Sự kiện</p>
                <a href="${trailerLink}" target="_blank" class="text-[11px] text-blue-600 font-bold underline break-all inline-block">
                    <i class="fa-solid fa-link mr-1"></i> ${trailerLink}
                </a>
            </div>` : `
            <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4 italic text-gray-400 text-[10px]">
                <i class="fa-solid fa-video-slash mr-1"></i> Chưa có link video trailer
            </div>`;

        const eventRules = getVal('event-rules'); 
        const rulesHTML = `
            <div class="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p class="text-[9px] text-gray-400 uppercase font-bold mb-2"><i class="fa-solid fa-gavel"></i> Nội quy sự kiện</p>
                <div class="relative overflow-hidden" style="max-height: 80px;" id="rules-container">
                    <p class="text-[10px] text-gray-600 whitespace-pre-line leading-relaxed">${eventRules}</p>
                    <div class="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-gray-50 to-transparent" id="rules-fade"></div>
                </div>
                <button onclick="this.parentElement.querySelector('#rules-container').style.maxHeight='none'; this.style.display='none'; this.parentElement.querySelector('#rules-fade').style.display='none';" 
                        class="mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-800">
                    Xem thêm...
                </button>
            </div>`;

        const legalLinkVal = document.getElementById('legal-files-link')?.value.trim();
        
        let filesHTML = "";
        
        if (legalLinkVal) {
    filesHTML = `
        <a href="${legalLinkVal}" target="_blank" 
           class="flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-black text-[9px]">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            XEM HỒ SƠ ĐÃ DÁN
        </a>`;
} else {
    filesHTML = '<span class="text-gray-400 italic font-normal">Chưa cung cấp đường dẫn</span>';
}

        // --- TỔNG HỢP NỘI DUNG ---
        const content = `
    <div class="space-y-6 pb-4 text-left w-full overflow-x-hidden animate-fade-in">
        <div class="w-full rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-gray-900 p-2 space-y-3">
          
        <div class="grid grid-cols-1 md:grid-cols-[1.8fr_1fr] gap-4 items-start"> 
    <div class="flex flex-col w-full">
        <p class="mb-2 font-medium text-[10px] text-gray-400 uppercase tracking-widest w-full text-left ml-2">* Ảnh nền (Gốc)</p>
        <div class="w-full rounded-2xl border border-dashed border-white/20 bg-white/5 min-h-[150px] flex items-center justify-center">
            <img src="${bannerSrc}" class="w-full h-auto block rounded-2xl shadow-2xl" style="display: block; width: 100%; height: auto;">
        </div>
    </div>
    
    <div class="flex flex-col w-full">
        <p class="mb-2 font-medium text-[10px] text-gray-400 uppercase tracking-widest w-full text-left ml-2">* Ảnh sự kiện</p>
        <div class="w-full rounded-2xl border border-dashed border-white/20 bg-white/5 min-h-[150px] flex items-center justify-center">
            <img src="${posterSrc}" class="w-full h-auto block rounded-2xl shadow-2xl" style="display: block; width: 100%; height: auto;">
        </div>
    </div>
</div>

            <div class="bg-gray-800 p-4 rounded-xl border border-white/5 space-y-2">
                <p class="text-[9px] text-[#00d2ff] uppercase font-black tracking-widest">Xem trước bản đăng ký</p>
                
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-white/5">
                    <h4 class="flex-1 font-black text-xl md:text-2xl text-white uppercase truncate">${getVal('event-name-input')}</h4>
                    
                    <div class="shrink-0 flex flex-wrap gap-2">
                        <span class="px-2.5 py-1.5 bg-white/10 text-white text-[9px] font-bold rounded-lg uppercase border border-white/10 whitespace-nowrap">
                            <i class="fa-solid fa-tag mr-1 text-[#00d2ff]"></i> ${getVal('event-type-input')}
                        </span>
                        <span class="px-2.5 py-1.5 bg-[#00d2ff] text-black text-[9px] font-bold rounded-lg uppercase whitespace-nowrap">
                            <i class="fa-solid fa-bolt mr-1"></i> ${getVal('event-mode-input')}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p class="text-[9px] text-gray-400 uppercase font-bold mb-2"><i class="fa-solid fa-align-left"></i> Mô tả sự kiện</p>
                <div class="text-[10px] text-gray-700 leading-relaxed line-clamp-6 whitespace-pre-line font-medium">
                    ${getVal('event-description')}
                </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p class="text-[9px] text-gray-400 uppercase font-bold mb-2"><i class="fa-solid fa-location-dot"></i> Địa điểm tổ chức</p>
                <p class="text-[11px] font-bold text-gray-800 uppercase">${getVal('event-location-name')}</p>
                <p class="text-[10px] text-gray-500 mt-1 leading-tight italic">${getVal('event-location-detail')}</p>
            </div>
        </div>

        ${trailerHTML}

        <div class="w-full">
            <p class="text-[10px] text-gray-400 uppercase font-black mb-2 tracking-widest"><i class="fa-solid fa-calendar-check"></i> Lịch diễn & Cơ cấu vé</p>
            <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
                <div>
                    <p class="text-[9px] text-gray-400 uppercase font-bold mb-2">Thời gian:</p>
                    ${timeSlotsHTML || '<p class="text-[10px] text-gray-400 italic">Chưa thiết lập</p>'}
                </div>
                <div>
                    <p class="text-[9px] text-gray-400 uppercase font-bold mb-2">Hạng vé:</p>
                    ${ticketInfo || '<span class="text-gray-400 text-xs italic">Chưa có vé</span>'}
                </div>
                ${seatingSrc ? `<img src="${seatingSrc}" class="w-full rounded-xl border border-gray-50 mt-2 bg-gray-50">` : ''}
            </div>
        </div>

        <div class="p-5 bg-gray-50 rounded-2xl border border-gray-200">
            <p class="text-[9px] text-gray-400 uppercase font-bold mb-3 tracking-widest"><i class="fa-solid fa-id-card"></i> Chi tiết Ban Tổ Chức</p>
            <div class="flex items-start gap-4">
                ${btcLogoSrc ? `<img src="${btcLogoSrc}" class="w-16 h-16 rounded-2xl object-contain bg-white border border-gray-200 p-1 shadow-sm">` : ''}
                <div class="flex-1 min-w-0">
                    <p class="text-[12px] font-black text-gray-900 uppercase">${getVal('btc-name')}</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-4 mt-2 text-[10px] text-gray-600 italic">
                        <p><i class="fa-solid fa-envelope w-4 text-blue-400"></i> ${getVal('btc-email')}</p>
                        <p><i class="fa-solid fa-phone w-4 text-green-400"></i> ${getVal('btc-phone')}</p>
                        <p class="col-span-2"><i class="fa-solid fa-globe w-4 text-amber-400"></i> Thông tin thêm: ${getVal('btc-info') || 'Chưa cập nhật'}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
            <p class="text-[10px] text-blue-600 uppercase font-black mb-3 tracking-widest flex justify-between">
                <span><i class="fa-solid fa-shield-halved"></i> Hồ sơ pháp lý & Quy định</span>
                <span><i class="fa-solid fa-shield-halved text-[7px]"></i><span>${legalTypeVal}</span></span>
            </p>
            <div class="grid grid-cols-2 gap-4 text-[10px] mb-2 border-b border-blue-100 pb-3 font-bold">
                <div><span class="text-gray-500 block font-normal">Mã số thuế:</span> <span class="text-gray-800">${getVal('tax-id-input')}</span></div>
                <div><span class="text-gray-500 block font-normal">Số GP/CMND:</span> <span class="text-gray-800">${getVal('legal-id-input')}</span></div>
            </div>
            <div class="flex justify-between text-[10px] mt-2 italic">
                <span class="text-gray-600 font-medium">Chính sách hoàn tiền:</span>
                <b class="text-gray-800">${document.getElementById('refund-policy')?.options[document.getElementById('refund-policy').selectedIndex]?.text || 'N/A'}</b>
            </div>
            <div class="flex justify-between text-[10px] mt-2 italic">
                <span class="text-gray-600 font-medium">Trách nhiệm bồi thường:</span>
                <b class="text-gray-800">${document.getElementById('det-compensation')?.options[document.getElementById('det-compensation').selectedIndex]?.text || 'N/A'}</b>
            </div>
            <div class="flex justify-between items-center text-[10px] mt-1 italic border-b border-blue-100 pb-2">
                <span class="text-gray-600 font-medium">Tệp hồ sơ:</span>
                <div class="flex items-center">${filesHTML}</div>
            </div>
            ${rulesHTML}
        </div>

        <div class="p-5 bg-green-50 rounded-2xl border border-green-100">
            <p class="text-[10px] text-green-600 uppercase font-black mb-3 tracking-widest"><i class="fa-solid fa-wallet"></i> Tài khoản nhận doanh thu</p>
            <div class="flex justify-between items-center gap-4">
                <div class="flex-1 min-w-0">
                    <p class="text-[10px] text-green-700 font-bold uppercase">Chủ TK: ${getVal('bank-user')}</p>
                    <p class="text-[10px] text-green-700 font-bold uppercase">STK: ${getVal('bank-acc')}</p>
                    <p class="text-[10px] text-green-700 font-bold uppercase">Tên ngân hàng: ${getVal('bank-name')}</p>
                    <p class="text-[10px] text-green-700 font-bold uppercase">Chi nhánh: ${getVal('bank-branch')}</p>
                    <p class="text-[9px] text-green-500 mt-1 italic leading-tight">Mọi báo cáo đối soát sẽ gửi về: <br> ${getVal('billing-email')}</p>
                </div>
                ${qrSrc ? `<img src="${qrSrc}" class="w-20 h-20 bg-white p-1.5 rounded-xl border border-green-200 shadow-sm">` : ''}
            </div>
        </div>

    <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <p class="text-[10px] text-amber-600 font-black uppercase mb-1 flex items-center gap-2">
                <i class="fa-solid fa-circle-exclamation"></i> Lưu ý quan trọng
            </p>
            <ul class="text-[10px] text-amber-800/80 space-y-1 font-medium leading-tight">
                <li>• Sự kiện sẽ được kiểm duyệt trong vòng 5-7 ngày làm việc.</li>
                <li>• Doanh thu được chuyển từ 3-5 ngày sau khi sự kiện kết thúc thành công.</li>
                <li>• Vui lòng kiểm tra kỹ STK, chúng tôi không hỗ trợ sai sót thông tin ngân hàng.</li>
            </ul>
        </div>
    </div>`;

        const modalContent = document.getElementById('confirm-content');
        const modal = document.getElementById('confirm-modal');
        if (modalContent && modal) {
            modalContent.innerHTML = content;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            modalContent.scrollTop = 0;
        }
    } catch (e) { 
        console.error("Lỗi showConfirmModal:", e); 
    }
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
            <div id="empty-state" class="flex flex-col items-center justify-center py-20 animate-fade-in text-center">
                <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                    <i class="fa-solid fa-calendar-plus text-2xl text-[#00d2ff]"></i>
                </div>
                <p class="text-gray-400 italic mb-6 px-10 leading-relaxed">Bạn chưa có sự kiện nào. Hãy bắt đầu tạo sự kiện đầu tiên của mình!</p>
                <button onclick="showPage('create-event')" class="px-8 py-3 bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5] text-white rounded-xl hover:shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all font-bold uppercase tracking-widest text-xs">
                    Tạo sự kiện ngay
                </button>
            </div>`;
        return;
    }
    container.innerHTML = ""; 
    allEvents.forEach(ev => {

        let statusBadge = "";
        switch(ev.status) {
            case 'active':
                statusBadge = '<span class="text-[9px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 font-bold uppercase tracking-tighter">✅ Đã duyệt</span>';
                break;
            case 'rejected':
                statusBadge = `<button onclick="showRejectReason('${ev.id}')" class="text-[9px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 font-bold uppercase tracking-tighter hover:bg-red-500 hover:text-white transition flex items-center gap-1"> ❌ Từ chối </button>`;
                break;
            case 'draft':
                statusBadge = '<span class="text-[9px] text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-bold uppercase tracking-tighter">📝 Bản nháp</span>';
                break;
            default:
                statusBadge = '<span class="text-[9px] text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 font-bold uppercase tracking-tighter italic">⏳ Chờ duyệt</span>';
        }

        const card = `
<div class="event-item-card w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-3xl mb-4 hover:bg-white/[0.08] transition-all group animate-fade-in" 
    data-id="${ev.id}">

    <div class="flex items-center gap-4 min-w-0">
        <div class="relative w-14 h-14 shrink-0">
            <img src="${ev.img || 'https://via.placeholder.com/50'}" 
                 class="w-full h-full rounded-xl object-cover bg-gray-800 border border-white/10 shadow-lg">
            ${ev.status === 'draft' ? '<div class="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center"><i class="fa-solid fa-pen-nib text-[10px] text-white"></i></div>' : ''}
        </div>

        <div class="min-w-0">
            <h4 class="font-bold text-white mb-1 truncate text-sm leading-tight pr-4">${ev.title || ev.name}</h4>
            <div class="flex items-center gap-2">
                ${statusBadge}
                <span class="text-[10px] text-gray-500 font-medium">• ${ev.timeCreate?.split(',')[0] || ''}</span>
            </div>
        </div>
    </div>

    <div class="flex gap-3 shrink-0 ml-2">
        <button onclick="editEvent(this)" 
            class="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-[#00d2ff] hover:bg-[#00d2ff]/10 transition-all">
            <i class="fa-solid fa-pen-to-square text-xs"></i>
        </button>
        <button onclick="deleteEvent(this)" 
            class="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
            <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
    </div>

</div>`;
        container.insertAdjacentHTML('beforeend', card);
    });
}

function showRejectReason(eventId) {
    const allEvents = JSON.parse(localStorage.getItem('ticket_events')) || [];
    const ev = allEvents.find(item => item.id === eventId);

    if (ev && ev.rejectReason) {
        document.getElementById('reject-reason-text').innerText = ev.rejectReason;
        const modal = document.getElementById('reject-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        document.getElementById('btn-fix-event').onclick = function() {
            closeRejectModal();
            const card = document.querySelector(`.event-item-card[data-id="${eventId}"]`);
            const editBtn = card.querySelector('button[onclick="editEvent(this)"]');
            editEvent(editBtn);
        };
    } else {
        alert("Không tìm thấy thông tin từ chối!");
    }
}

function closeRejectModal() {
    document.getElementById('reject-modal').classList.add('hidden');
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


// --- 8. ADMIN RENDER ---
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

        let filesHtml = "";
        if (ev.legalFilesLink) {
            filesHtml = `
            <a href="${ev.legalFilesLink}" target="_blank" 
            class="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 text-[10px] font-bold hover:bg-blue-500 hover:text-white transition-all uppercase">
            <i class="fa-solid fa-arrow-up-right-from-square text-[8px]"></i> Xem hồ sơ pháp lý
        </a>`;
    } else {
        filesHtml = '<span class="text-gray-600 italic text-[10px]">Không có link hồ sơ</span>';
    }

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

// --- 9. MODAL LƯU Ý  ---
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