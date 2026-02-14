// --- 1. CẤU HÌNH KẾT NỐI ---
const supabaseUrl = "https://tcyvwehwadmakcwlieed.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeXZ3ZWh3YWRtYWtjd2xpZWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MTc3MTEsImV4cCI6MjA4NjM5MzcxMX0.wXyvuEls8ZdWF2vXLYK1H3DLMi2cflXOyeBYxqsOvyI";
const { createClient } = window.supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

let myChart = null; 
let lastDeletedId = null;

// --- 2. KHỞI TẠO ---
window.onload = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) showDashboard();
};

async function login(){
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if(error) alert("Login failed: " + error.message);
    else showDashboard();
}

async function logout(){
    await supabaseClient.auth.signOut();
    location.reload();
}

// --- 3. ĐIỀU HƯỚNG GIAO DIỆN (FIX LỖI DÍNH TRANG) ---
function hideAllSections() {
    const sections = ["mainDashboardContent", "settingsSection", "logSection"];
    sections.forEach(s => {
        const el = document.getElementById(s);
        if(el) el.style.display = "none";
    });
}

async function showDashboard() {
    hideAllSections();
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("mainDashboardContent").style.display = "block";
    
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) document.getElementById("adminEmail").innerText = session.user.email;

    updateMenuSelection('dashboard');
    loadMessages();
}

function showSettings() {
    hideAllSections();
    document.getElementById("settingsSection").style.display = "block";
    updateMenuSelection('settings');
    loadCurrentSettings();
}

function showLogs() {
    hideAllSections();
    document.getElementById("logSection").style.display = "block";
    updateMenuSelection('logs');
    loadLogs();
}

function updateMenuSelection(type) {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => link.classList.remove('active'));
    if(type === 'dashboard') navLinks[0]?.classList.add('active');
    if(type === 'settings') navLinks[1]?.classList.add('active');
    if(type === 'logs') navLinks[2]?.classList.add('active');
}

// --- 4. QUẢN LÝ TIN NHẮN ---
async function loadMessages() {
    const [activeRes, deletedRes] = await Promise.all([
        supabaseClient.from("Dieuthao").select("*").eq("is_deleted", false).order("created_at", { ascending: false }),
        supabaseClient.from("Dieuthao").select("*").eq("is_deleted", true).order("created_at", { ascending: false })
    ]);

    if (activeRes.error || deletedRes.error) return;

    document.getElementById("totalCount").innerText = activeRes.data.length;
    const tbody = document.getElementById("messages");
    tbody.innerHTML = "";
    const countByDay = {};

    activeRes.data.forEach(m => {
        const d = m.created_at ? m.created_at.split("T")[0] : "N/A";
        countByDay[d] = (countByDay[d] || 0) + 1;
        tbody.innerHTML += `
        <tr>
            <td><input type="checkbox" class="msg-checkbox" value="${m.id}"></td>
            <td>${m.name}</td>
            <td>${m.email}</td>
            <td>${m.message}</td>
            <td>${d}</td>
            <td><button class="small delete" onclick="deleteMsg('${m.id}')">Delete</button></td>
        </tr>`;
    });

    const trashSection = document.getElementById("trashSection");
    const trashBody = document.getElementById("trashMessages");
    if (deletedRes.data.length > 0) {
        trashSection.style.display = "block";
        trashBody.innerHTML = deletedRes.data.map(m => `
            <tr>
                <td>${m.name}</td><td>${m.email}</td><td>${m.message}</td>
                <td>
                    <button class="btn-restore" onclick="restoreMsg('${m.id}')">Restore ↩️</button>
                    <button class="btn-permanently-delete" onclick="permanentlyDelete('${m.id}')">X</button>
                </td>
            </tr>`).join("");
    } else {
        trashSection.style.display = "none";
    }
    renderChart(countByDay);
}

async function deleteMsg(id) {
    if (!confirm("Chuyển vào thùng rác?")) return;
    const { error } = await supabaseClient.from("Dieuthao").update({ is_deleted: true }).eq("id", id);
    if (!error) {
        lastDeletedId = id; // Gán ID vào đây để Undo có thể dùng
        await saveLog("XÓA TẠM", `Ẩn tin nhắn ID: ${id}`);
        loadMessages();
    }
}

async function undoDelete() {
    if (!lastDeletedId) {
        alert("Không có mục nào để hoàn tác!");
        return;
    }

    const { error } = await supabaseClient
        .from("Dieuthao")
        .update({ is_deleted: false })
        .eq("id", lastDeletedId);

    if (!error) {
        await saveLog("HOÀN TÁC", `Khôi phục tin nhắn ID: ${lastDeletedId}`);
        lastDeletedId = null; // Xóa sạch dấu vết sau khi khôi phục xong
        loadMessages();
        alert("Đã khôi phục tin nhắn thành công!");
    } else {
        alert("Lỗi hoàn tác: " + error.message);
    }
}

async function permanentlyDelete(id) {
    if (!confirm("Xóa vĩnh viễn không thể khôi phục!")) return;
    const { error } = await supabaseClient.from("Dieuthao").delete().eq("id", id);
    if (!error) {
        await saveLog("XÓA VĨNH VIỄN", `Xóa vĩnh viễn ID: ${id}`);
        loadMessages();
    }
}

async function restoreMsg(id) {
    const { error } = await supabaseClient
        .from("Dieuthao")
        .update({ is_deleted: false })
        .eq("id", id);

    if (!error) {
        await saveLog("KHÔI PHỤC", `Khôi phục tin nhắn ID: ${id}`);
        loadMessages(); // Tải lại bảng để tin nhắn quay lại Dashboard
        alert("Đã khôi phục tin nhắn thành công! 🎉");
    } else {
        alert("Lỗi khôi phục: " + error.message);
    }
}
// --- 4.1 BỔ SUNG: XỬ LÝ CHỌN NHIỀU (SELECT ALL) ---

// Hàm chọn/bỏ chọn tất cả checkbox
function toggleAll(source) {
    const checkboxes = document.querySelectorAll('.msg-checkbox');
    checkboxes.forEach(cb => cb.checked = source.checked);
}

// Hàm xóa các mục đã chọn vào thùng rác
async function deleteSelected() {
    const selected = document.querySelectorAll('.msg-checkbox:checked');
    const ids = Array.from(selected).map(cb => cb.value);

    if (ids.length === 0) {
        alert("Bạn chưa chọn tin nhắn nào để xóa!");
        return;
    }

    if (!confirm(`Bạn có chắc muốn chuyển ${ids.length} mục vào thùng rác không?`)) return;

    try {
        const { error } = await supabaseClient
            .from("Dieuthao")
            .update({ is_deleted: true })
            .in("id", ids); // Sử dụng .in() để xử lý mảng ID

        if (error) throw error;

        // Lưu vào Nhật ký
        await saveLog("XÓA NHIỀU", `Đã ẩn ${ids.length} tin nhắn`);
        
        // Reset checkbox "Chọn tất cả" và tải lại dữ liệu
        const selectAllCb = document.getElementById("selectAll");
        if (selectAllCb) selectAllCb.checked = false;
        
        loadMessages();
        alert(`Đã chuyển ${ids.length} mục vào thùng rác!`);
    } catch (err) {
        alert("Lỗi khi xóa nhiều mục: " + err.message);
    }
}
// --- 5. CẤU HÌNH WEBSITE ---
async function loadCurrentSettings() {
    const { data } = await supabaseClient.from("Settings").select("*");
    if (data) {
        data.forEach(item => {
            if (item.key === 'phone') document.getElementById("set_phone").value = item.value;
            if (item.key === 'email') document.getElementById("set_email").value = item.value;
        });
    }
}

async function saveSettings() {
    const phone = document.getElementById("set_phone").value;
    const email = document.getElementById("set_email").value;
    const { error } = await supabaseClient.from("Settings").upsert([{ key: 'phone', value: phone }, { key: 'email', value: email }]); 

    if (error) alert("Lỗi: " + error.message);
    else {
        await saveLog("CẬP NHẬT", "Thay đổi cấu hình SĐT/Email");
        alert("Lưu cấu hình thành công! 🎉");
    }
}

// --- 6. NHẬT KÝ HOẠT ĐỘNG ---
async function saveLog(action, details) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;
    
    const { error } = await supabaseClient
        .from("Logs")
        .insert([{ 
            user_email: session.user.email, 
            action: action, 
            details: details 
        }]);

    if (!error) {
        // Gọi loadLogs để cập nhật bảng ngay lập tức trên máy mình
        loadLogs(); 
    } else {
        console.error("Lỗi lưu log:", error.message);
    }
}

async function loadLogs() {
    const { data, error } = await supabaseClient
        .from("Logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        console.error("Lỗi tải log:", error.message);
        return;
    }

    const logTableBody = document.getElementById("logListFull");
    
    // Nếu phần tử logListFull tồn tại trên HTML thì mới chèn dữ liệu
    if (logTableBody) {
        logTableBody.innerHTML = data.map(log => {
            const time = new Date(log.created_at).toLocaleString('vi-VN');
            return `<tr>
                <td style="color: #8b949e;">${time}</td>
                <td><b style="color: #00ff88;">${log.user_email.split('@')[0]}</b></td>
                <td><span class="status-tag">${log.action}</span></td>
                <td>${log.details}</td>
            </tr>`;
        }).join("");
    }
}

// --- 7. XUẤT EXCEL ---
async function exportToExcel() {
    const btn = document.querySelector(".btn-excel") || document.querySelector("button[onclick='exportToExcel()']");
    btn.disabled = true;
    const { data } = await supabaseClient.from("Dieuthao").select("*").eq("is_deleted", false);
    
    if (data && data.length > 0) {
        const formatted = data.map(item => ({ "Tên": item.name, "Email": item.email, "Tin nhắn": item.message, "Ngày": item.created_at?.split("T")[0] }));
        const ws = XLSX.utils.json_to_sheet(formatted);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, `Export_${new Date().getTime()}.xlsx`);
        await saveLog("XUẤT EXCEL", "Tải danh sách tin nhắn");
    } else alert("Không có dữ liệu!");
    btn.disabled = false;
}

// --- 8. BIỂU ĐỒ ---
function renderChart(countByDay) {
    const canvas = document.getElementById("chart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(countByDay),
            datasets: [{ label: "Tin nhắn/Ngày", data: Object.values(countByDay), backgroundColor: "#00ff88" }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Realtime
supabaseClient.channel('any').on('postgres_changes', { event: '*', schema: 'public', table: 'Dieuthao' }, () => loadMessages()).subscribe();
// Nhật ký hoạt động ---
supabaseClient.channel('logs-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Logs' }, () => {
        // Nếu người dùng đang ở trang Nhật ký thì mới load lại để tránh tốn tài nguyên
        const logSection = document.getElementById("logSection");
        if (logSection && logSection.style.display !== "none") {
            loadLogs();
        }
    })
    .subscribe();

    supabaseClient
  .channel('nhat-ky-realtime')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Logs' }, (payload) => {
      console.log("Phát hiện log mới:", payload);
      loadLogs(); // Tự động load lại bảng nhật ký
  })
  .subscribe((status) => {
      console.log("Trạng thái Realtime Logs:", status);
  });
// --- 9. LOGIC CHUỘT MƯỢT MÀ ---
const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");
let mouseX = 0, mouseY = 0, outlineX = 0, outlineY = 0;

if (cursorDot && cursorOutline) {
    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // Chấm nhỏ đi theo chuột 1:1
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    function animateCursor() {
        // Vòng tròn to đuổi theo chậm hơn (tạo hiệu ứng mượt)
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hiệu ứng click (thu nhỏ vòng tròn)
    window.addEventListener("mousedown", () => {
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%) scale(0.8)`;
    });
    window.addEventListener("mouseup", () => {
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%) scale(1)`;
    });

    // Hiệu ứng khi hover vào các nút bấm hoặc link
    document.addEventListener("mouseover", (e) => {
        if (e.target.closest("button, a, .nav-item, input, .msg-checkbox")) {
            cursorOutline.classList.add("cursor-hover");
        }
    });
    document.addEventListener("mouseout", (e) => {
        if (e.target.closest("button, a, .nav-item, input, .msg-checkbox")) {
            cursorOutline.classList.remove("cursor-hover");
        }
    });
}


const observeLogs = supabaseClient
  .channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'Logs' },
    (payload) => {
      console.log('LOG MOI NE!', payload);
      loadLogs(); 
    }
  )
  .subscribe((status) => {
    console.log("Trạng thái kết nối Logs:", status);
  });
