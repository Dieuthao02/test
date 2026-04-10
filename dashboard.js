// --- 1. KHỞI TẠO DỮ LIỆU GỐC ---
let currentBalance = 4250000; 
let selectedMethod = '';

const avatarBtn = document.getElementById('avatar-btn');
const dropdownMenu = document.getElementById('dropdown-menu');

// --- 2. HÀM CẬP NHẬT GIAO DIỆN SỐ DƯ (CÓ HIỆU ỨNG) ---
function updateBalanceUI(newAmount) {
    const dashBalance = document.getElementById('balance-dashboard');
    const walletBalance = document.getElementById('balance-wallet');
    
    const start = currentBalance;
    const end = newAmount;
    const duration = 1000; 
    let startTime = null;

    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const currentDisplay = Math.floor(progress * (end - start) + start);
        const formatted = new Intl.NumberFormat('vi-VN').format(currentDisplay);
        
        if (dashBalance) dashBalance.innerHTML = `${formatted} <span class="text-sm">VND</span>`;
        if (walletBalance) walletBalance.innerText = `${formatted}đ`;

        if (progress < 1) {
            requestAnimationFrame(animation);
        } else {
            currentBalance = end; 
        }
    }
    requestAnimationFrame(animation);
}

// --- 3. HÀM THÊM LỊCH SỬ GIAO DỊCH MỚI ---
function addHistoryEntry(amount) {
    const historyContainer = document.querySelector('#modal-history .space-y-4');
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
            <!-- Nút in cho riêng giao dịch này -->
            <button onclick="printInvoice('Nạp tiền ví EventPay', '${formattedAmount}')" 
                    class="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-pink-500 hover:text-white transition-all">
                <i class="fa-solid fa-print text-xs"></i>
            </button>
        </div>
    `;
    historyContainer.prepend(newEntry);
}

// --- 4. LOGIC XỬ LÝ THANH TOÁN ---
function setAmount(value) {
    const input = document.getElementById('nap-tien-input');
    input.value = value;
    input.classList.add('ring-2', 'ring-pink-300');
    setTimeout(() => input.classList.remove('ring-2', 'ring-pink-300'), 500);
}

function selectMethod(method) {
    selectedMethod = method;
    document.querySelectorAll('.payment-method').forEach(btn => {
        btn.classList.remove('border-pink-500', 'bg-pink-50', 'border-blue-500', 'bg-blue-50');
        btn.classList.add('bg-gray-50');
    });
    const activeBtn = document.getElementById(`method-${method}`);
    if (method === 'momo') activeBtn.classList.add('border-pink-500', 'bg-pink-50');
    else activeBtn.classList.add('border-blue-500', 'bg-blue-50');
}

function processPayment() {
    const amountInput = document.getElementById('nap-tien-input').value;
    const amount = parseInt(amountInput);
    
    if (!amount || amount < 10000) {
        alert("Vui lòng nạp tối thiểu 10.000đ!");
        return;
    }
    if (!selectedMethod) {
        alert("Vui lòng chọn phương thức thanh toán!");
        return;
    }

    // Hiển thị bước 2
    document.getElementById('nap-tien-step-1').classList.add('hidden');
    document.getElementById('nap-tien-step-2').classList.remove('hidden');
    
    document.getElementById('display-amount').innerText = new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

    const qrImg = document.getElementById('qr-image');
    
    if (selectedMethod === 'bank') {
        // Link VietQR của bạn
        const myBank = "MB";
        const mySTK = "0378217462";
        const description = `EHP${amount}NAPVI`; 
        qrImg.src = `https://img.vietqr.io/image/${myBank}-${mySTK}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(description)}`;
    } else {
        // Link giả lập cho Momo
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MOMO_PAYMENT_${amount}&color=A50064`;
    }
}

function simulateSuccess() {
    const amountInput = document.getElementById('nap-tien-input').value;
    const amount = parseInt(amountInput);
    const fmtAmount = new Intl.NumberFormat('vi-VN').format(amount);
    
    // Lấy nút bấm để tạo hiệu ứng loading
    const btn = event.currentTarget;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i> ĐANG XÁC THỰC...';
    btn.disabled = true;

    setTimeout(() => {
        // --- PHẦN QUAN TRỌNG NHẤT: GỬI SANG ADMIN ---
        const contentLabel = selectedMethod === 'bank' ? "Nạp tiền qua Ngân hàng" : "Nạp tiền qua Momo";
        sendDepositToAdmin(amount, contentLabel); 
        // --------------------------------------------

        updateBalanceUI(currentBalance + amount);
        addHistoryEntry(amount);
        closeModal('modal-nap-tien');
        
        if(confirm(`Nạp thành công ${fmtAmount}đ! Bạn có muốn in hóa đơn không?`)) {
            printInvoice('Nạp tiền ví EventPay', fmtAmount);
        }
        
        btn.innerHTML = 'XÁC NHẬN ĐÃ CHUYỂN'; 
        btn.disabled = false;
        backToStep1();
    }, 1500);
}

// --- 5. ĐIỀU HƯỚNG TRANG ---
function showPage(pageId, element) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.classList.add('active');
    
    if (element) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active', 'text-pink-500');
            item.classList.add('text-gray-500');
        });
        element.classList.add('active');
    }
    dropdownMenu.classList.remove('active');
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function backToStep1() {
    document.getElementById('nap-tien-step-1').classList.remove('hidden');
    document.getElementById('nap-tien-step-2').classList.add('hidden');
}

// Khởi chạy sự kiện Avatar
avatarBtn.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    dropdownMenu.classList.toggle('active'); 
});
document.addEventListener('click', () => dropdownMenu.classList.remove('active'));

function printInvoice(type, amount) {
    const transactionID = 'EVH' + Math.floor(Math.random() * 1000000);
    const dateStr = new Date().toLocaleString('vi-VN');

    // 1. Tạo một thẻ iframe ẩn để in
    let printFrame = document.getElementById('printFrame');
    if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'printFrame';
        printFrame.style.display = 'none';
        document.body.appendChild(printFrame);
    }

    // 2. Nội dung hóa đơn
    const invoiceHTML = `
        <html>
            <head>
                <style>
                    body { font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; }
                    .logo { font-size: 20px; font-weight: bold; }
                    .content { margin-top: 20px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .total { font-size: 18px; font-weight: bold; border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; font-style: italic; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">EVENTHUB PRO - RECEIPT</div>
                    <p>Hà Nội, Việt Nam</p>
                </div>
                <div class="content">
                    <div class="row"><span>Mã GD:</span> <span>${transactionID}</span></div>
                    <div class="row"><span>Thời gian:</span> <span>${dateStr}</span></div>
                    <div class="row"><span>Dịch vụ:</span> <span>${type}</span></div>
                    <div class="row"><span>Khách hàng:</span> <span>Nguyễn Thanh Tùng</span></div>
                    <div class="row total"><span>SỐ TIỀN GIAO DỊCH:</span> <span>${amount} VND</span></div>
                </div>
                <div class="footer">
                    <p>Cảm ơn bạn đã tin tưởng EventHub!</p>
                </div>
            </body>
        </html>
    `;

    // 3. Đưa nội dung vào iframe và ra lệnh in
    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(invoiceHTML);
    doc.close();

    // Đợi nội dung load xong rồi in
    setTimeout(() => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
    }, 500);
}

function sendDepositToAdmin(amount, content) {
    let logs = JSON.parse(localStorage.getItem('admin_deposit_logs')) || [];

    const newTransaction = {
        id: 'GD' + Math.floor(1000 + Math.random() * 9000),
        user: "Diệu Thảo", 
        amount: amount,
        content: content,
        time: new Date().toLocaleString('vi-VN'),
        status: 'completed'
    };

    logs.push(newTransaction);
    localStorage.setItem('admin_deposit_logs', JSON.stringify(logs));

    // THÊM DÒNG NÀY: Để tab hiện tại biết dữ liệu đã thay đổi (nếu dùng chung 1 tab)
    window.dispatchEvent(new Event('storage_updated'));
    
    console.log("Đã gửi dữ liệu nạp tiền sang Admin!");
}