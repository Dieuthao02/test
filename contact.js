/* ==========================================================================
   TỆP SCRIPT CHÍNH (Xử lý tương tác cho toàn bộ website)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================================
    // 1. XỬ LÝ MODAL TUYỂN DỤNG & PORTFOLIO (Trang About)
    // ==========================================================================
    const btnOpenJobs = document.getElementById('btnOpenJobs');
    const jobsModal = document.getElementById('jobsModal');
    const applyModal = document.getElementById('applyModal');
    const recruitmentForm = document.getElementById('recruitmentForm');
    const applySuccessModal = document.getElementById('applySuccessModal');
    
    if (jobsModal && applyModal) {
        const closeJobsBtn = document.getElementById('closeJobsBtn');
        const closeApplyBtn = document.getElementById('closeApplyBtn');
        const backToJobsBtn = document.getElementById('backToJobsBtn');
        const applyButtons = document.querySelectorAll('.btn-open-apply');
        const closeApplySuccessBtn = document.getElementById('closeApplySuccessBtn');
        
        // Element để thay đổi thông tin Job động
        const modalJobTitle = document.getElementById('modalJobTitle');
        const modalJobSalary = document.getElementById('modalJobSalary');

        if (btnOpenJobs) {
            btnOpenJobs.addEventListener('click', function(e) {
                e.preventDefault();
                jobsModal.classList.add('active');
            });
        }

        applyButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Lấy dữ liệu từ thẻ Job người dùng vừa bấm
                const jobCard = this.closest('.job-card-modal');
                const jobName = jobCard.querySelector('h3').innerText;
                const jobSalary = jobCard.querySelector('.salary').innerText;

                // Gắn dữ liệu vào form Apply
                if (modalJobTitle) modalJobTitle.innerText = jobName;
                if (modalJobSalary) modalJobSalary.innerText = jobSalary + ' | FULL-TIME';

                // Chuyển Modal
                jobsModal.classList.remove('active');
                applyModal.classList.add('active');
            });
        });

        if (backToJobsBtn) {
            backToJobsBtn.addEventListener('click', function() {
                applyModal.classList.remove('active');
                jobsModal.classList.add('active');
            });
        }

        if (recruitmentForm) {
            recruitmentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                applyModal.classList.remove('active');
                if (applySuccessModal) applySuccessModal.classList.add('active');
                recruitmentForm.reset();
                const uploadText = document.querySelector('.upload-box p');
                if(uploadText) {
                    uploadText.textContent = 'NHẤP ĐỂ TẢI LÊN CV (PDF/DOCX)';
                    uploadText.style.color = '#4b5563';
                }
            });
        }

        if (closeApplySuccessBtn) closeApplySuccessBtn.addEventListener('click', () => applySuccessModal.classList.remove('active'));
        if (closeJobsBtn) closeJobsBtn.addEventListener('click', () => jobsModal.classList.remove('active'));
        if (closeApplyBtn) closeApplyBtn.addEventListener('click', () => applyModal.classList.remove('active'));
        
        // Upload CV File Name
        const uploadBox = document.querySelector('.upload-box');
        const cvUpload = document.getElementById('cvUpload');
        if(uploadBox && cvUpload) {
            uploadBox.addEventListener('click', () => cvUpload.click());
            cvUpload.addEventListener('change', function() {
                if(this.files && this.files.length > 0) {
                    uploadBox.querySelector('p').textContent = `ĐÃ CHỌN: ${this.files[0].name}`;
                    uploadBox.querySelector('p').style.color = '#10b981'; 
                }
            });
        }
    }


    // ==========================================================================
    // 2. XỬ LÝ FORM LIÊN HỆ (Trang Contact)
    // ==========================================================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

// TRONG FILE contact.js
contactForm.addEventListener('submit', function(e) {
    e.preventDefault(); 

    const formData = {
        id: `TK-${Date.now()}`, // Format ID giống Admin (TK-...)
        name: document.getElementById('fullName').value,
        email: document.getElementById('emailAddress').value,
        subject: document.getElementById('subject').options[document.getElementById('subject').selectedIndex].text,
        message: document.getElementById('message').value,
        time: "Vừa xong", // Admin của bạn dùng thuộc tính 'time'
        priority: "Cao"   // Mặc định hoặc Thảo có thể thêm logic chọn
    };

    // Lấy danh sách cũ với key 'contact_messages'
    let contactList = JSON.parse(localStorage.getItem('contact_messages')) || [];
    contactList.push(formData);
    localStorage.setItem('contact_messages', JSON.stringify(contactList));

    if (successModal) successModal.classList.add('active');
    contactForm.reset();
});

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => successModal.classList.remove('active'));
    }
}


    // ==========================================================================
    // 3. XỬ LÝ CHATBOT TRỢ LÝ ẢO (Trang Contact)
    // ==========================================================================
    const chatbotToggler = document.getElementById('chatbotToggler');
    const chatbotWindow = document.getElementById('chatbotWindow');
    if (chatbotToggler && chatbotWindow) {
        const closeChatBtn = document.getElementById('closeChatBtn');
        const chatBody = document.getElementById('chatBody');
        const chatInput = document.getElementById('chatInput');
        const sendChatBtn = document.getElementById('sendChatBtn');
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        
        chatbotToggler.addEventListener('click', () => chatbotWindow.classList.toggle('active'));
        if(closeChatBtn) closeChatBtn.addEventListener('click', () => chatbotWindow.classList.remove('active'));

        const createChatLi = (message, className) => {
            const chatDiv = document.createElement("div");
            chatDiv.classList.add("chat-message", className);
            chatDiv.innerHTML = `<p>${message}</p>`;
            return chatDiv;
        }

        const generateBotResponse = (userText) => {
            const text = userText.toLowerCase();
            if (text.includes('mua vé') || text.includes('đặt vé') || text.includes('mua')) {
                return "🎫 Để mua vé, bạn vui lòng truy cập menu <strong>Sự kiện</strong>, chọn sự kiện yêu thích và bấm <strong>'Đặt vé ngay'</strong>.";
            } else if (text.includes('lỗi') || text.includes('thanh toán') || text.includes('hoàn tiền')) {
                return "💳 Nếu bạn gặp sự cố thanh toán hoặc muốn hoàn tiền, vui lòng cung cấp Mã Đơn Hàng vào Form Liên Hệ bên cạnh nhé.";
            } else if (text.includes('lịch') || text.includes('thời gian') || text.includes('khi nào')) {
                return "📅 Bạn có thể xem toàn bộ lịch trình các sự kiện sắp diễn ra trong tháng tại trang <strong>Lịch Sự Kiện</strong>.";
            } else if (text.includes('hợp tác') || text.includes('tổ chức') || text.includes('tài trợ')) {
                return "🤝 Rất vui được kết nối với bạn! Vui lòng chọn chủ đề <strong>'Hợp tác tổ chức sự kiện'</strong> ở Form Liên Hệ nhé.";
            } else if (text.includes('khuyến mãi') || text.includes('ưu đãi') || text.includes('giảm giá')) {
                return "🎁 Hiện tại EventHub đang có chương trình giảm 10% cho sinh viên. Nhanh tay săn vé bạn nhé!";
            } else if (text.includes('hướng dẫn') || text.includes('cách dùng') || text.includes('tạo tài khoản')) {
                return "🛠️ Để bắt đầu, bạn hãy bấm vào nút <strong>'Đăng nhập'</strong> ở góc phải phía trên màn hình để tạo tài khoản.";
            } else if (text.includes('chào') || text.includes('hello') || text.includes('hi')) {
                return "👋 Chào bạn! Mình là Trợ lý ảo của EventHub. Bạn đang cần tìm vé sự kiện hay cần hỗ trợ kỹ thuật ạ?";
            } else {
                return "🤖 Xin lỗi, mình chưa hiểu rõ ý này của bạn. Bạn có thể sử dụng các từ khóa như: <em>mua vé, thanh toán, lịch sự kiện, khuyến mãi...</em> nhé!";
            }
        };

        const handleChat = (messageText) => {
            const userMessage = messageText || chatInput.value.trim();
            if (!userMessage) return;

            if(chatInput) chatInput.value = "";
            if(chatBody) {
                chatBody.appendChild(createChatLi(userMessage, "user-message"));
                chatBody.scrollTo(0, chatBody.scrollHeight);

                const typingLi = createChatLi("...", "bot-message");
                chatBody.appendChild(typingLi);
                chatBody.scrollTo(0, chatBody.scrollHeight);

                setTimeout(() => {
                    chatBody.removeChild(typingLi); 
                    const botResponse = generateBotResponse(userMessage); 
                    chatBody.appendChild(createChatLi(botResponse, "bot-message"));
                    chatBody.scrollTo(0, chatBody.scrollHeight);
                }, 1000);
            }
        }

        if(sendChatBtn) sendChatBtn.addEventListener('click', () => handleChat());
        if(chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleChat();
            });
        }
        if(quickActionBtns) {
            quickActionBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const text = btn.textContent.trim(); 
                    handleChat(text); 
                });
            });
        }
    }


    // ==========================================================================
    // 4. ĐÓNG MODAL KHI CLICK RA NGOÀI (Chung)
    // ==========================================================================
    window.addEventListener('click', function(e) {
        const jobsModal = document.getElementById('jobsModal');
        const applyModal = document.getElementById('applyModal');
        const successModal = document.getElementById('successModal');
        const applySuccessModal = document.getElementById('applySuccessModal');

        if (jobsModal && e.target === jobsModal) jobsModal.classList.remove('active');
        if (applyModal && e.target === applyModal) applyModal.classList.remove('active');
        if (successModal && e.target === successModal) successModal.classList.remove('active');
        if (applySuccessModal && e.target === applySuccessModal) applySuccessModal.classList.remove('active');
    });

});