    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
    import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
    import { firebaseConfig } from './firebase-config.js';
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTarget = urlParams.get('redirect') || 'index.html'; 

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getDatabase(app);

    window.toggleAuth = () => {
        document.getElementById('register-form').classList.toggle('hidden');
        document.getElementById('login-form').classList.toggle('hidden');
    };

    async function saveUserData(uid, name, phone, email) {
        try {
            await set(ref(db, 'users/' + uid), {
                fullName: name || "User",
                phoneNumber: phone || "N/A",
                email: email,
                time: new Date().toLocaleString()
            });

        
            const listUsers = JSON.parse(localStorage.getItem('ticket_users')) || [];
            listUsers.push({ 
                id: uid, 
                name: name, 
                fullName: name, 
                email: email, 
                phone: phone, 
                isReal: true, 
                time: new Date().toLocaleString('vi-VN'),
                createdAt: Date.now()
            });
            localStorage.setItem('ticket_users', JSON.stringify(listUsers));

        } catch (e) { console.error("Lỗi lưu dữ liệu:", e); }
    }

    // 1. XỬ LÝ ĐĂNG KÝ
    document.getElementById('btn-register-submit').onclick = async () => {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const pass = document.getElementById('reg-pass').value;
        const repass = document.getElementById('reg-repass').value;

        if (!name || !email || !pass) return alert("Điền thiếu thông tin kìa!");
        if (pass !== repass) return alert("Mật khẩu xác nhận không khớp!");

        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await saveUserData(res.user.uid, name, phone, email);
            
            alert("Đăng ký thành công! Giờ hãy đăng nhập để tiếp tục.");
            
            if (!document.getElementById('register-form').classList.contains('hidden')) {
                window.toggleAuth();
            }
   
            document.getElementById('login-email').value = email;
            
        } catch (e) { 
            let msg = "Lỗi đăng ký!";
            if(e.code === 'auth/email-already-in-use') msg = "Email này đã được sử dụng rồi!";
            alert(msg); 
        }
    };

    // 2. XỬ LÝ ĐĂNG NHẬP
    document.getElementById('btn-login-submit').onclick = async () => {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        
        if (!email || !pass) return alert("Nhập đủ Email và Mật khẩu nhé!");

        try {
        await signInWithEmailAndPassword(auth, email, pass);
        alert("Đăng nhập thành công!");
  
        window.location.href = redirectTarget; 
    } catch (e) { 
        alert("Sai tài khoản hoặc mật khẩu!"); 
    }
    };

   const loginSocial = async (provider) => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const isNewUser = result._tokenResponse?.isNewUser;

        if (isNewUser) {
            await saveUserData(user.uid, user.displayName, "Social", user.email);
            alert("Đăng ký và Đăng nhập thành công!");
        } else {
            alert("Chào mừng bạn quay trở lại!");
        }

        window.location.href = redirectTarget;
    } catch (e) { 
        console.error(e);
        alert("Lỗi đăng nhập mạng xã hội!"); 
    }
};

const mode = urlParams.get('mode'); 
function setInitialForm() {
    const regForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (mode === 'login') {
        regForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    } else {
  
        regForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

setInitialForm();

    document.getElementById('btn-google').onclick = () => loginSocial(new GoogleAuthProvider());
    document.getElementById('btn-github').onclick = () => loginSocial(new GithubAuthProvider());
    document.getElementById('btn-google-login').onclick = () => loginSocial(new GoogleAuthProvider());
    document.getElementById('btn-github-login').onclick = () => loginSocial(new GithubAuthProvider());