<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng nhập GitHub - Diệu</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #f0f2f5; }
        .card { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; }
        button { padding: 12px 24px; background: #24292e; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; transition: 0.3s; }
        button:hover { background: #444; }
        #user-info { margin-top: 20px; }
        img { border-radius: 50%; width: 80px; margin-bottom: 10px; }
    </style>
</head>
<body>

    <div class="card">
        <h2>Xin chào Diệu!</h2>
        <p>Bấm nút dưới để thử đăng nhập  nhé:</p>
        <button id="btn-google" style="background: #db4437; margin-bottom: 10px;">Đăng nhập với Google</button>
<br>
<button id="btn-login">Đăng nhập với GitHub</button>
        <div id="user-info"></div>
    </div>

    <script type="module">
        // Import các thư viện cần thiết từ CDN
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getAuth, signInWithPopup, GithubAuthProvider, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

        // THÔNG SỐ CỦA BẠN ĐÂY
        const firebaseConfig = {
  apiKey: "AIzaSyCwlTux_UtiiLF61JZz0HfebWuz50SxSGQ",
  authDomain: "weblogin-1bee9.firebaseapp.com",
  projectId: "weblogin-1bee9",
  storageBucket: "weblogin-1bee9.firebasestorage.app",
  messagingSenderId: "690617421091",
  appId: "1:690617421091:web:b142d933ea3e1efc731096",
  measurementId: "G-9D2C9XMTWS"
};

        // Khởi tạo Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const provider = new GithubAuthProvider();

        // Xử lý sự kiện click
        document.getElementById('btn-login').onclick = async () => {
            try {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
                
                // Hiển thị thông tin sau khi đăng nhập thành công
                document.getElementById('user-info').innerHTML = `
                    <img src="${user.photoURL}" alt="Avatar">
                    <h3>Chào, ${user.displayName}!</h3>
                    <p>Email: ${user.email || 'Không có email công khai'}</p>
                `;
                console.log("Thành công:", user);
            } catch (error) {
                console.error("Lỗi rồi:", error);
                alert("Lỗi: " + error.message);
            }
        };
    
const auth = getAuth(app);
const githubProvider = new GithubAuthProvider();
const googleProvider = new GoogleAuthProvider(); // Thêm dòng này

// 2. Xử lý nút Google (Thêm nút vào HTML nữa nhé)
document.getElementById('btn-google').onclick = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        document.getElementById('user-info').innerHTML = `
            <img src="${user.photoURL}" width="80" style="border-radius:50%">
            <h3>Chào mừng ${user.displayName} (từ Google)!</h3>
        `;
    } catch (error) {
        alert("Lỗi Google: " + error.message);
    }
};
    </script>
</body>
</html>