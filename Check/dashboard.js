 // --- 1. NHẬP LIỆU FIREBASE ---
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
    import { firebaseConfig } from './firebase-config.js';

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // --- 2. KHỞI TẠO DỮ LIỆU VÀ BIẾN TOÀN CỤC ---
    let currentBalance = 4250000; 
    let selectedMethod = '';
    const authZone = document.getElementById('auth-zone');
    const dropdownMenu = document.getElementById('dropdown-menu');

    // Hàm cập nhật thời gian thực (Ngày tháng)
    function updateRealTime() {
        const dateElement = document.getElementById('real-time-date');
        if (dateElement) {
            const now = new Date();
            const days = now.getDate();
            const months = now.getMonth() + 1;
            const years = now.getFullYear();
            dateElement.innerText = `${days} Tháng ${months}, ${years}`;
        }
    }


    function updateTopBarUI() {
        const userLocal = JSON.parse(localStorage.getItem('userLogin'));
        if (userLocal) {
            // Cập nhật tên chào mừng
            const welcomeName = document.getElementById('user-welcome-name');
            if (welcomeName) welcomeName.innerText = (userLocal.name || "Bạn") + " ✨";

            // Cập nhật địa chỉ
            const locationElement = document.getElementById('user-location');
            if (locationElement) {
                locationElement.innerText = userLocal.address || "Việt Nam";
            }
        }
    }

    // Chạy cập nhật ngay khi load trang
    updateRealTime();
    updateTopBarUI();

    // Theo dõi trạng thái đăng nhập
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Lấy dữ liệu cũ nếu có để không ghi đè mất SĐT/Địa chỉ khi login lại
            let existingData = JSON.parse(localStorage.getItem('userLogin')) || {};
            
            const userObj = {
                ...existingData,
                name: existingData.name || user.displayName || "User",
                email: user.email,
                uid: user.uid,
                avatar: existingData.avatar || user.photoURL
            };
            
            localStorage.setItem('userLogin', JSON.stringify(userObj));
            

            updateTopBarUI();

            authZone.innerHTML = `
                <div id="avatar-btn" class="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-1 pr-4 rounded-full border border-pink-100 shadow-sm cursor-pointer">
                    <img src="${userObj.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + user.uid}" 
                         class="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover">
                    <div class="flex flex-col">
                        <span class="text-[10px] text-gray-400 leading-none uppercase">Thành viên</span>
                        <span class="text-xs text-pink-600 truncate max-w-[100px] font-bold">${userObj.name}</span>
                    </div>
                    <button id="logout-btn" class="ml-2 text-gray-400 hover:text-red-500 transition">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            `;

            // Gán sự kiện click cho Avatar mới tạo
            document.getElementById('avatar-btn').onclick = (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('active');
            };

            document.getElementById('logout-btn').onclick = (e) => {
                e.stopPropagation();
                signOut(auth).then(() => {
                    localStorage.removeItem('userLogin');
                    location.reload();
                });
            };
        }
    });

    // --- 3. CÁC HÀM LOGIC  ---

    function updateBalanceUI(newAmount) {
        const walletBalance = document.getElementById('balance-wallet');
        if (!walletBalance) return;

        const start = currentBalance;
        const end = newAmount;
        const duration = 1000; 
        let startTime = null;

        function animation(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const currentDisplay = Math.floor(progress * (end - start) + start);
            const formatted = new Intl.NumberFormat('vi-VN').format(currentDisplay);
            
            walletBalance.innerText = `${formatted}đ`;
            
            if (progress < 1) requestAnimationFrame(animation);
            else currentBalance = end;
        }
        requestAnimationFrame(animation);
    }

    function addHistoryEntry(amount) {
        const historyContainer = document.querySelector('#modal-history .space-y-4');
        if(!historyContainer) return;
        const now = new Date();
        const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
        const formattedAmount = new Intl.NumberFormat('vi-VN').format(amount);
        const newEntry = document.createElement('div');
        newEntry.className = "flex justify-between items-center p-5 bg-green-50 rounded-[2rem] border border-green-100 shadow-sm animate-fadeIn";
        newEntry.innerHTML = `
            <div>
                <p class="font-black text-sm">Nạp tiền hệ thống</p>
                <p class="text-[10px] font-bold text-gray-400">${dateStr}</p>
            </div>
            <div class="flex items-center space-x-4">
                <p class="text-green-500 font-black">+${formattedAmount}đ</p>
                <button onclick="printInvoice('Nạp tiền ví EventPay', '${formattedAmount}')" 
                        class="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-pink-500 hover:text-white transition-all">
                    <i class="fa-solid fa-print text-xs"></i>
                </button>
            </div>
        `;
        historyContainer.prepend(newEntry);
    }

    function processPayment() {
        const amountInput = document.getElementById('nap-tien-input').value;
        const amount = parseInt(amountInput);
        if (!amount || amount < 10000) return alert("Vui lòng nạp tối thiểu 10.000đ!");
        if (!selectedMethod) return alert("Vui lòng chọn phương thức thanh toán!");

        document.getElementById('nap-tien-step-1').classList.add('hidden');
        document.getElementById('nap-tien-step-2').classList.remove('hidden');
        document.getElementById('display-amount').innerText = new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

        const qrImg = document.getElementById('qr-image');
        if (selectedMethod === 'bank') {
            qrImg.src = `https://img.vietqr.io/image/MB-0378217462-qr_only.png?amount=${amount}&addInfo=EHP${amount}NAPVI`;
        } else {
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MOMO_PAYMENT_${amount}&color=A50064`;
        }
    }

    function simulateSuccess(event) {
        const amount = parseInt(document.getElementById('nap-tien-input').value);
        const btn = event.currentTarget;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i> ĐANG XÁC THỰC...';
        btn.disabled = true;

        setTimeout(() => {
            const contentLabel = selectedMethod === 'bank' ? "Nạp tiền qua Ngân hàng" : "Nạp tiền qua Momo";
            sendDepositToAdmin(amount, contentLabel); 
            updateBalanceUI(currentBalance + amount);
            addHistoryEntry(amount);
            closeModal('modal-nap-tien');
            
            btn.innerHTML = 'XÁC NHẬN ĐÃ CHUYỂN'; 
            btn.disabled = false;
            backToStep1();
            alert(`Nạp thành công ${new Intl.NumberFormat('vi-VN').format(amount)}đ!`);
        }, 1500);
    }

    function sendDepositToAdmin(amount, content) {
        let logs = JSON.parse(localStorage.getItem('admin_deposit_logs')) || [];
        const userLocal = JSON.parse(localStorage.getItem('userLogin'));
        
        const newTransaction = {
            id: 'GD' + Math.floor(1000 + Math.random() * 9000),
            user: userLocal ? userLocal.name : "Khách", 
            amount: amount,
            content: content,
            time: new Date().toLocaleString('vi-VN'),
            status: 'completed'
        };
        logs.push(newTransaction);
        localStorage.setItem('admin_deposit_logs', JSON.stringify(logs));
        window.dispatchEvent(new Event('storage_updated'));
    }

    // Các hàm phụ trợ khác
    function openModal(id) { document.getElementById(id).classList.add('active'); }
    function closeModal(id) { document.getElementById(id).classList.remove('active'); }
    function backToStep1() {
        document.getElementById('nap-tien-step-1').classList.remove('hidden');
        document.getElementById('nap-tien-step-2').classList.add('hidden');
    }

    // --- 5. LOGIC CẬP NHẬT HỒ SƠ ---

function handleAvatarChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;

            const previewImg = document.getElementById('profile-avatar-preview');
            if (previewImg) previewImg.src = base64Image;
            
            window.tempAvatar = base64Image;
        };
        reader.readAsDataURL(file);
    }
}


function updateUserProfile() {
    const newName = document.getElementById('edit-fullname').value;
    const newPhone = document.getElementById('edit-phone').value;
    const newAddress = document.getElementById('edit-address').value;

    if (!newName) return alert("Họ và tên không được để trống!");

    // Lấy dữ liệu hiện tại
    let userLocal = JSON.parse(localStorage.getItem('userLogin')) || {};
    
    // Cập nhật thông tin mới
    userLocal.name = newName;
    userLocal.phone = newPhone;
    userLocal.address = newAddress;
    if (window.tempAvatar) {
        userLocal.avatar = window.tempAvatar;
    }

    localStorage.setItem('userLogin', JSON.stringify(userLocal));

    const welcomeName = document.querySelector('h2 span');
    if (welcomeName) welcomeName.innerText = newName + " ✨";
    
    const headerName = document.querySelector('#avatar-btn .text-pink-600');
    const headerImg = document.querySelector('#avatar-btn img');
    if (headerName) headerName.innerText = newName;
    if (headerImg && userLocal.avatar) headerImg.src = userLocal.avatar;

    const profileName = document.getElementById('profile-name-display');
    if (profileName) profileName.innerText = newName;

    alert("Cập nhật hồ sơ thành công!");
}

function changePassword() {
    const oldPass = document.getElementById('old-pass').value;
    const newPass = document.getElementById('new-pass').value;

    if (!oldPass || !newPass) return alert("Vui lòng nhập đầy đủ mật khẩu!");
    if (newPass.length < 6) return alert("Mật khẩu mới phải có ít nhất 6 ký tự!");

    let userLocal = JSON.parse(localStorage.getItem('userLogin')) || {};
    
    userLocal.password = newPass; 
    localStorage.setItem('userLogin', JSON.stringify(userLocal));

    alert("Đổi mật khẩu thành công!");
    document.getElementById('old-pass').value = '';
    document.getElementById('new-pass').value = '';
}

// Hàm đổ dữ liệu từ LocalStorage vào các ô Input khi mở trang Profile
function loadProfileToInputs() {
    const userLocal = JSON.parse(localStorage.getItem('userLogin'));
    if (userLocal) {
        if (document.getElementById('edit-fullname')) document.getElementById('edit-fullname').value = userLocal.name || "";
        if (document.getElementById('edit-phone')) document.getElementById('edit-phone').value = userLocal.phone || "";
        if (document.getElementById('edit-address')) document.getElementById('edit-address').value = userLocal.address || "";
        if (userLocal.avatar && document.getElementById('profile-avatar-preview')) {
            document.getElementById('profile-avatar-preview').src = userLocal.avatar;
        }
    }
}

function renderMyTickets() {
    const container = document.getElementById('my-tickets-container');
    if (!container) return;

    const orders = JSON.parse(localStorage.getItem('eventOrders')) || [];
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="bg-white p-10 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
                <p class="text-gray-400 font-bold uppercase tracking-widest">Bạn chưa có vé nào</p>
                <a href="index.html" class="mt-4 inline-block text-pink-500 font-black uppercase text-xs border-b-2 border-pink-500">Khám phá sự kiện ngay</a>
            </div>`;
        return;
    }

    // Đổ dữ liệu từ localStorage ra giao diện
    container.innerHTML = orders.reverse().map(order => {
        const totalQty = order.tickets.reduce((sum, t) => sum + (t.qty || 1), 0);
        const ticketNames = order.tickets.map(t => t.name).join(', ');

        return `
        <div onclick="viewOrderDetail('${order.id}')" 
             class="relative bg-white group cursor-pointer transition-all duration-300 hover:scale-[1.02] mb-6">
            <div class="flex items-center overflow-hidden rounded-[2rem] border-2 border-gray-100 shadow-sm hover:border-pink-200">
                <div class="w-24 h-32 bg-pink-500 flex flex-col items-center justify-center text-white border-r-2 border-dashed border-gray-200">
                    <i class="fa-solid fa-ticket-alt text-3xl mb-1"></i>
                    <span class="text-[10px] font-bold uppercase rotate-[-90deg] origin-center">EventHub</span>
                </div>
                <div class="flex-1 p-5 relative">
                    <div class="absolute -left-[10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-[#fdfcf0] rounded-full border-r-2 border-gray-100"></div>
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-black text-xl uppercase text-gray-800">${order.event}</h4>
                            <div class="flex items-center gap-4 mt-1 text-gray-500 font-bold text-[11px]">
                                <span><i class="fa-solid fa-calendar-days mr-1"></i> ${order.eventTime || order.time}</span>
                                <span><i class="fa-solid fa-location-dot mr-1"></i> ${order.location || 'Hà Nội'}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Đã thanh toán</span>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mã vé: #${order.id}</p>
                        <span class="font-black text-pink-500 text-lg">${order.total}</span>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function viewOrderDetail(orderId) {
    const orders = JSON.parse(localStorage.getItem('eventOrders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        console.error("Không tìm thấy đơn hàng với ID:", orderId);
        return;
    }

    updateTicketData({
        eventName: order.event,
        seatType: order.tickets.map(t => t.name).join(', '),
        seatNumber: "x" + order.tickets.reduce((sum, t) => sum + (t.qty || 1), 0),
        ownerName: order.customer,
        ticketId: "#" + order.id,
        time: order.eventTime || order.time,
        price: order.total,
        location: order.location || "Xem trong email xác nhận"
    });
    openModal('modal-ticket-detail');
}

function updateTicketData(data) {
    // 1. Đổ dữ liệu text vào các ID tương ứng
    document.getElementById('ticket-event-name').innerText = data.eventName;
    document.getElementById('ticket-seat').innerText = `${data.seatType} • ${data.seatNumber}`;
    document.getElementById('ticket-owner').innerText = data.ownerName;
    document.getElementById('ticket-id').innerText = data.ticketId;
    document.getElementById('ticket-time').innerText = data.time;
    document.getElementById('ticket-price').innerText = typeof data.price === 'number' ? data.price.toLocaleString('vi-VN') + 'đ' : (data.price || "0đ");
    document.getElementById('ticket-location').innerText = data.location;

    // 2. Tạo nội dung cho QR Code 
    const qrContent = `
SỰ KIỆN: ${data.eventName}
VỊ TRÍ: ${data.seatType} - ${data.seatNumber}
CHỦ VÉ: ${data.ownerName}
MÃ VÉ: ${data.ticketId}
THỜI GIAN: ${data.time}
ĐỊA ĐIỂM: ${data.location}
    `.trim();

    // 3. Mã hóa chuỗi nội dung để đưa vào URL API
    const encodedContent = encodeURIComponent(qrContent);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedContent}`;

    // 4. Cập nhật ảnh QR
    document.getElementById('ticket-qr').src = qrUrl;
}

// Ví dụ cách gọi hàm khi người dùng nhấn xem vé:
const myTicket = {
    eventName: "GAI HOME CONCERT",
    seatType: "VIP A12",
    seatNumber: "ROW 01",
    ownerName: "Diệu Thảo",
    ticketId: "#EHB-99201",
    time: "20:00 - 15/05/2026",
    price: 1500000,
    location: "Sân vận động Quốc gia Mỹ Đình, Hà Nội"
};

let selectedTicketId = '';
let selectedPrice = 0;

// 1. Hàm mở Modal hoàn tiền
function openRefundModal(ticketId, price) {
    selectedTicketId = ticketId;
    selectedPrice = price;

    const refundAmount = price * 0.95;
    
    // Cập nhật số tiền vào UI của Modal
    const amountDisplay = document.getElementById('refund-amount');
    if (amountDisplay) {
        amountDisplay.innerText = refundAmount.toLocaleString('vi-VN') + 'đ';
    }

    // Hiển thị Modal
    const modal = document.getElementById('refund-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex'); 
}

// 2. Hàm đóng Modal
function closeRefundModal() {
    const modal = document.getElementById('refund-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// 3. Hàm xử lý khi chọn lý do "Khác..."
function toggleOtherReason() {
    const select = document.getElementById('refund-reason-select');
    const container = document.getElementById('other-reason-container');
    
    if (select.value === 'other') {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

// 4. Hàm xác nhận gửi yêu cầu về Admin
function confirmRefundRequest() {
    const reasonSelect = document.getElementById('refund-reason-select');
    const reasonValue = reasonSelect.value;
    const note = document.getElementById('refund-reason-text').value;
    
    const finalReason = reasonValue === 'other' ? note : reasonValue;

    if (reasonValue === 'other' && !note.trim()) {
        alert("Vui lòng nhập lý do cụ thể!");
        return;
    }

    const finalRefundAmount = selectedPrice * 0.95;

    // --- ĐỒNG BỘ VỚI ADMIN ---
    
    let allOrders = JSON.parse(localStorage.getItem('eventOrders')) || [];
    const orderIdx = allOrders.findIndex(o => o.id === selectedTicketId);

    if (orderIdx !== -1) {
        allOrders[orderIdx]._isRefund = true; 
        allOrders[orderIdx].refundReason = finalReason;
        allOrders[orderIdx].refundStatus = 'pending'; 
        allOrders[orderIdx].amountToRefund = finalRefundAmount;
        
        // Lưu lại vào LocalStorage
        localStorage.setItem('eventOrders', JSON.stringify(allOrders));

        // Đóng modal nhập lý do và thông báo thành công
        closeRefundModal();
        
        const successModal = document.getElementById('refund-success-modal');
        if (successModal) {
            successModal.classList.remove('hidden');
            successModal.classList.add('flex');
        } else {
            alert("Gửi yêu cầu thành công!");
        }

        // Cập nhật lại giao diện Dashboard ngay lập tức
        renderRefundTickets();
        renderMyTickets();

        // Kích hoạt để các tab khác (Admin) cập nhật theo
        window.dispatchEvent(new Event('storage_updated'));
    } else {
        alert("Không tìm thấy đơn hàng!");
    }
}

function markOrderAsRefunding(orderId) {
    let orders = JSON.parse(localStorage.getItem('eventOrders')) || [];
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index !== -1) {
        orders[index].status = 'refunding'; // Chuyển trạng thái từ 'paid' sang 'refunding'
        localStorage.setItem('eventOrders', JSON.stringify(orders));
        
        // Cập nhật lại UI trang hoàn tiền và trang kho vé
        renderRefundTickets();
        renderMyTickets();
    }
}

function renderRefundTickets() {
    const container = document.getElementById('ticket-list-refund');
    if (!container) return;

    const orders = JSON.parse(localStorage.getItem('eventOrders')) || [];

    if (orders.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-gray-400 font-bold py-10">Bạn chưa có đơn hàng nào để hoàn tiền.</p>`;
        return;
    }

    container.innerHTML = orders.reverse().map(order => {
        const totalQty = order.tickets.reduce((sum, t) => sum + (t.qty || 1), 0);
        const seatNames = order.tickets.map(t => t.name).join(', ');
    
        const priceValue = parseInt(order.total.replace(/\D/g, ''));

        return `
        <div class="bg-white p-6 rounded-[2.5rem] border-2 border-gray-50 relative overflow-hidden group hover:shadow-xl transition-all">
            <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 text-xl">
                    <i class="fa-solid fa-ticket"></i>
                </div>
                <div class="text-right">
                    <p class="text-[10px] font-bold text-gray-400 uppercase leading-none">Mã đơn hàng</p>
                    <p class="text-xs font-black text-blue-600 font-mono">#${order.id}</p>
                </div>
            </div>

            <h4 class="font-black uppercase text-sm text-gray-800 mb-1">${order.event}</h4>
            
            <div class="space-y-1 mb-4">
                <p class="text-[10px] text-gray-500 font-bold">
                    <i class="fa-regular fa-clock mr-1"></i> Mua lúc: ${order.time}
                </p>
                <p class="text-[10px] text-gray-500 font-bold">
                    <i class="fa-solid fa-chair mr-1"></i> Chỗ ngồi: ${seatNames}
                </p>
                <p class="text-[10px] text-gray-500 font-bold">
                    <i class="fa-solid fa-layer-group mr-1"></i> Số lượng: ${totalQty} vé
                </p>
                <p class="text-[10px] text-gray-500 font-bold">
                    <i class="fa-solid fa-money-bill-wave mr-1"></i> Tổng thanh toán: <span class="text-red-500">${order.total}</span>
                </p>
            </div>

            <button onclick="openRefundModal('${order.id}', ${priceValue})" 
                    class="w-full bg-gray-900 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-red-600 transition-colors">
                Yêu cầu hoàn tiền
            </button>
        </div>`;
    }).join('');
}

// --- 6. CẬP NHẬT PHƠI HÀM RA WINDOW ---
Object.assign(window, {
    setAmount: (val) => { document.getElementById('nap-tien-input').value = val; },
    selectMethod: (method) => {
        selectedMethod = method;
        document.querySelectorAll('.payment-method').forEach(btn => btn.classList.remove('border-pink-500', 'bg-pink-50', 'border-blue-500', 'bg-blue-50'));
        const activeBtn = document.getElementById(`method-${method}`);
        if (method === 'momo') activeBtn.classList.add('border-pink-500', 'bg-pink-50');
        else activeBtn.classList.add('border-blue-500', 'bg-blue-50');
    },
    openRefundModal,     
    closeRefundModal,     
    toggleOtherReason,    
    confirmRefundRequest, 
    renderRefundTickets,
    viewOrderDetail,
    renderMyTickets,
    processPayment,
    simulateSuccess,
    renderRefundTickets,
    showPage: (pageId, element) => {
        document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        
        // Nếu mở trang profile thì load dữ liệu vào input
        if (pageId === 'profile') {
            loadProfileToInputs();
        }
        
        // Khi chuyển sang trang Kho vé, cập nhật danh sách vé mới nhất
        if (pageId === 'tickets') {
            renderMyTickets();
        }

        if (pageId === 'refund-page') { // ID phải khớp với ID thẻ div trang hoàn tiền của bạn
        renderRefundTickets();
        }

        // Xử lý active menu sidebar
        if (element) {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            element.classList.add('active');
        }
        dropdownMenu.classList.remove('active');
    },
    openModal: (id) => { 
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');

        // KIỂM TRA: Nếu mở modal chi tiết vé thì cập nhật dữ liệu luôn
        if (id === 'modal-ticket-detail') {
            // Lấy thông tin user từ localStorage để đổ vào "Chủ vé"
            const userLocal = JSON.parse(localStorage.getItem('userLogin')) || {};
            
            // Cập nhật lại tên chủ vé trong object myTicket
            myTicket.ownerName = userLocal.name || "Khách hàng";
            
            // Chạy hàm đổ dữ liệu và tạo QR
            updateTicketData(myTicket);
        }
    }
},
    closeModal,
    updateTicketData,
    backToStep1,
    updateUserProfile, 
    changePassword,    
    handleAvatarChange, 
    printInvoice: (type, amount) => { }
});

document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'avatar-upload') {
        handleAvatarChange(e);
    }
});

document.addEventListener('click', () => dropdownMenu.classList.remove('active'));

// Khởi tạo mặc định
renderMyTickets();