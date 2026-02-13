
const TAROT_DATA = [
    // --- BỘ ẨN CHÍNH (MAJOR ARCANA) ---
    { name: "The Fool", url: "https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg", meaning: "Khởi đầu mới, tự phát." },
    { name: "The Magician", url: "https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg", meaning: "Kỹ năng, hành động." },
    { name: "The High Priestess", url: "https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg", meaning: "Trực giác, bí ẩn." },
    { name: "The Empress", url: "https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg", meaning: "Trù phú, sáng tạo." },
    { name: "The Emperor", url: "https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg", meaning: "Quyền lực, cấu trúc." },
    { name: "The Hierophant", url: "https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg", meaning: "Truyền thống, niềm tin." },
    { name: "The Lovers", url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/RWS_Tarot_06_Lovers.jpg", meaning: "Tình yêu, lựa chọn." },
    { name: "The Chariot", url: "https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg", meaning: "Ý chí, chiến thắng." },
    { name: "Strength", url: "https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg", meaning: "Sức mạnh nội tâm, can đảm." },
    { name: "The Hermit", url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg", meaning: "Suy ngẫm, cô độc." },
    { name: "Wheel of Fortune", url: "https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg", meaning: "Vận may, thay đổi." },
    { name: "Justice", url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg", meaning: "Công bằng, sự thật." },
    { name: "The Hanged Man", url: "https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg", meaning: "Hy sinh, góc nhìn mới." },
    { name: "Death", url: "https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg", meaning: "Kết thúc, tái sinh." },
    { name: "Temperance", url: "https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg", meaning: "Cân bằng, kiên nhẫn." },
    { name: "The Devil", url: "https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg", meaning: "Cám dỗ, trói buộc." },
    { name: "The Tower", url: "https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg", meaning: "Sụp đổ đột ngột." },
    { name: "The Star", url: "https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg", meaning: "Hy vọng, niềm tin." },
    { name: "The Moon", url: "https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg", meaning: "Ảo tưởng, sợ hãi." },
    { name: "The Sun", url: "https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg", meaning: "Thành công, niềm vui." },
    { name: "Judgement", url: "https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg", meaning: "Phán xét, thức tỉnh." },
    { name: "The World", url: "https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg", meaning: "Hoàn thành, trọn vẹn." },

    // --- BỘ GẬY (WANDS) ---
    { name: "Ace of Wands", url: "https://upload.wikimedia.org/wikipedia/commons/1/11/Wands01.jpg", meaning: "Cảm hứng, khởi đầu mới." },
    { name: "Two of Wands", url: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Wands02.jpg", meaning: "Lên kế hoạch, quyết định." },
    { name: "Three of Wands", url: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Wands03.jpg", meaning: "Tầm nhìn, mở rộng." },
    { name: "Four of Wands", url: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Wands04.jpg", meaning: "Kỷ niệm, hòa hợp." },
    { name: "Five of Wands", url: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Wands05.jpg", meaning: "Xung đột, cạnh tranh." },
    { name: "Six of Wands", url: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Wands06.jpg", meaning: "Chiến thắng, công nhận." },
    { name: "Seven of Wands", url: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Wands07.jpg", meaning: "Phòng thủ, kiên định." },
    { name: "Eight of Wands", url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Wands08.jpg", meaning: "Tốc độ, hành động." },
    { name: "Nine of Wands", url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Wands09.jpg", meaning: "Kiên trì, bảo vệ." },
    { name: "Ten of Wands", url: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Wands10.jpg", meaning: "Gánh nặng, trách nhiệm." },
    { name: "Page of Wands", url: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Wands11.jpg", meaning: "Khám phá, nhiệt huyết." },
    { name: "Knight of Wands", url: "https://upload.wikimedia.org/wikipedia/commons/1/16/Wands12.jpg", meaning: "Năng lượng, đam mê." },
    { name: "Queen of Wands", url: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Wands13.jpg", meaning: "Tự tin, ấm áp." },
    { name: "King of Wands", url: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Wands14.jpg", meaning: "Lãnh đạo, tầm nhìn." },

    // --- BỘ CỐC (CUPS) ---
    { name: "Ace of Cups", url: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Cups01.jpg", meaning: "Tình yêu mới, cảm xúc tràn đầy." },
    { name: "Two of Cups", url: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Cups02.jpg", meaning: "Kết nối, đối tác." },
    { name: "Three of Cups", url: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Cups03.jpg", meaning: "Ăn mừng, bạn bè." },
    { name: "Four of Cups", url: "https://upload.wikimedia.org/wikipedia/commons/3/35/Cups04.jpg", meaning: "Suy tư, thờ ơ." },
    { name: "Five of Cups", url: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Cups05.jpg", meaning: "Hối tiếc, mất mát." },
    { name: "Six of Cups", url: "https://upload.wikimedia.org/wikipedia/commons/1/17/Cups06.jpg", meaning: "Hoài niệm, tuổi thơ." },
    { name: "Seven of Cups", url: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Cups07.jpg", meaning: "Lựa chọn, ảo tưởng." },
    { name: "Eight of Cups", url: "https://upload.wikimedia.org/wikipedia/commons/6/60/Cups08.jpg", meaning: "Rời bỏ, tìm kiếm sự thật." },
    { name: "Nine of Cups", url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Cups09.jpg", meaning: "Mãn nguyện, ước nguyện." },
    { name: "Ten of Cups", url: "https://upload.wikimedia.org/wikipedia/commons/4/44/Cups10.jpg", meaning: "Hạnh phúc gia đình." },
    { name: "Page of Cups", url: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Cups11.jpg", meaning: "Tin tức, sáng tạo." },
    { name: "Knight of Cups", url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Cups12.jpg", meaning: "Lãng mạn, mời gọi." },
    { name: "Queen of Cups", url: "https://upload.wikimedia.org/wikipedia/commons/6/62/Cups13.jpg", meaning: "Thấu cảm, nuôi dưỡng." },
    { name: "King of Cups", url: "https://upload.wikimedia.org/wikipedia/commons/0/04/Cups14.jpg", meaning: "Điềm tĩnh, kiểm soát cảm xúc." },

    // --- BỘ KIẾM (SWORDS) ---
    { name: "Ace of Swords", url: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Swords01.jpg", meaning: "Đột phá, sự thật." },
    { name: "Two of Swords", url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Swords02.jpg", meaning: "Bế tắc, lưỡng lự." },
    { name: "Three of Swords", url: "https://upload.wikimedia.org/wikipedia/commons/0/02/Swords03.jpg", meaning: "Đau lòng, tổn thương." },
    { name: "Four of Swords", url: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Swords04.jpg", meaning: "Nghỉ ngơi, tĩnh dưỡng." },
    { name: "Five of Swords", url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Swords05.jpg", meaning: "Chiến thắng bằng mọi giá, xung đột." },
    { name: "Six of Swords", url: "https://upload.wikimedia.org/wikipedia/commons/2/29/Swords06.jpg", meaning: "Vượt qua khó khăn." },
    { name: "Seven of Swords", url: "https://upload.wikimedia.org/wikipedia/commons/3/34/Swords07.jpg", meaning: "Lén lút, chiến thuật." },
    { name: "Eight of Swords", url: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Swords08.jpg", meaning: "Mắc kẹt, hạn chế." },
    { name: "Nine of Swords", url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Swords09.jpg", meaning: "Lo âu, ác mộng." },
    { name: "Ten of Swords", url: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Swords10.jpg", meaning: "Phản bội, kết thúc đau đớn." },
    { name: "Page of Swords", url: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Swords11.jpg", meaning: "Tò mò, cảnh giác." },
    { name: "Knight of Swords", url: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Swords12.jpg", meaning: "Tham vọng, quyết liệt." },
    { name: "Queen of Swords", url: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Swords13.jpg", meaning: "Sắc bén, độc lập." },
    { name: "King of Swords", url: "https://upload.wikimedia.org/wikipedia/commons/3/33/Swords14.jpg", meaning: "Lý trí, quyền lực trí tuệ." },

    // --- BỘ TIỀN (PENTACLES) ---
    { name: "Ace of Pentacles", url: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Pents01.jpg", meaning: "Cơ hội mới, tài chính." },
    { name: "Two of Pentacles", url: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Pents02.jpg", meaning: "Cân bằng, đa nhiệm." },
    { name: "Three of Pentacles", url: "https://upload.wikimedia.org/wikipedia/commons/4/42/Pents03.jpg", meaning: "Làm việc nhóm, kỹ năng." },
    { name: "Four of Pentacles", url: "https://upload.wikimedia.org/wikipedia/commons/3/35/Pents04.jpg", meaning: "Chiếm hữu, ổn định." },
    { name: "Five of Pentacles", url: "https://upload.wikimedia.org/wikipedia/commons/9/96/Pents05.jpg", meaning: "Nghèo khó, cô lập." },
    { name: "Six of Pentacles", url: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Pents06.jpg", meaning: "Hào phóng, chia sẻ." },
    { name: "Seven of Pentacles", url: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Pents07.jpg", meaning: "Kiên nhẫn, đầu tư." },
    { name: "Eight of Pentacles", url: "https://upload.wikimedia.org/wikipedia/commons/4/49/Pents08.jpg", meaning: "Chăm chỉ, rèn luyện." },
    { name: "Nine of Pentacles", url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Pents09.jpg", meaning: "Sang trọng, tự lập." },
    { name: "Ten of Pentacles", url: "https://upload.wikimedia.org/wikipedia/commons/4/42/Pents10.jpg", meaning: "Thịnh vượng, di sản." },
    { name: "Page of Pentacles", url: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Pents11.jpg", meaning: "Học hỏi, cơ hội thực tế." },
    { name: "Knight of Pentacles", url: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Pents12.jpg", meaning: "Tỉ mỉ, bền bỉ." },
    { name: "Queen of Pentacles", url: "https://upload.wikimedia.org/wikipedia/commons/8/88/Pents13.jpg", meaning: "Thực tế, nuôi dưỡng." },
    { name: "King of Pentacles", url: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Pents14.jpg", meaning: "Thành đạt, vững chãi." }

]

         const CONFIG = {
            cardCount: TAROT_DATA.length, 
            radius: 40, 
            cardWidth: 2.8, cardHeight: 4.2, 
            inspectPos: { x: 0, y: 0, z: 3.8 }, 
            inspectScale: 0.3,    
            storageScale: 0.07,   
            storageZ: 3.5, 
            storeMarginX: 0.1,    
            storeMarginTop: 0.8,  
            storeGapY: 0.15       
        };

        let scene, camera, renderer, cardGroup, textureLoader;
        let raycaster, mouse;
        let starFieldMesh;
        let explosions = [];
        let storedCards = [];
        let inspectingCard = null;
        let isGameActive = true;
        let particleTexture;

        let handX = 0.5; 
        let isPinching = false;
        let cursorPosition = { x: 0, y: 0 };
        let rotationSpeed = 0.002;

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        // --- TẠO HẠT MÀU TRẮNG ---
        function generateParticleTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            
            const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');      // Trắng
            grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)'); 
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');     
            
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 64, 64);
            
            const tex = new THREE.Texture(canvas);
            tex.needsUpdate = true;
            return tex;
        }

        function init() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.02);
    
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6); 
    scene.add(ambient);
    const spotLight = new THREE.SpotLight(0xffffff, 2.0); 
    spotLight.position.set(0, 10, 10); 
    scene.add(spotLight);

    textureLoader = new THREE.TextureLoader();
    particleTexture = generateParticleTexture();
    
    shuffleArray(TAROT_DATA); 
    
    // Sau đó mới tạo các Mesh bài dựa trên thứ tự đã tráo
    createCards(); 
    createBackgroundStars();

    isGameActive = true;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('resize', onResize);

    // Ẩn loading nhanh
    const loading = document.getElementById('loading');
    if(loading) {
        loading.style.opacity = 0;
        setTimeout(() => loading.style.display='none', 500);
    }
}
        

        function createBackgroundStars() {
            const starCount = 800;
            const geo = new THREE.BufferGeometry();
            const positions = [];
            const sizes = [];
            for(let i=0; i<starCount; i++) {
                positions.push((Math.random()-0.5)*60, (Math.random()-0.5)*40, (Math.random()-0.5)*50 - 10);
                sizes.push(Math.random() * 0.5 + 0.1);
            }
            geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
            const sprite = textureLoader.load('sparkle.png', undefined, undefined, (err) => {});
            const mat = new THREE.PointsMaterial({
                size: 0.8, map: sprite, transparent: true, opacity: 0.9,
                depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff
            });
            starFieldMesh = new THREE.Points(geo, mat);
            scene.add(starFieldMesh);
        }

                function createCards() {
            cardGroup = new THREE.Group();
            scene.add(cardGroup);
            const geo = new THREE.BoxGeometry(CONFIG.cardWidth, CONFIG.cardHeight, 0.02);
            const backTex = textureLoader.load('back.png', undefined, undefined, (err) => {});
            const matEdge = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });

            TAROT_DATA.forEach((data, i) => {
                const frontTex = textureLoader.load(data.url);
                const matFront = new THREE.MeshStandardMaterial({ map: frontTex });
                const matBack = new THREE.MeshStandardMaterial({ map: backTex, color: 0xffffff });
                const materials = [matEdge, matEdge, matEdge, matEdge, matBack, matFront];
                const card = new THREE.Mesh(geo, materials);
                const angle = (i / CONFIG.cardCount) * Math.PI * 2;
                card.position.set(Math.sin(angle) * CONFIG.radius, 0, Math.cos(angle) * CONFIG.radius);
                card.lookAt(0, 0, 0);
                card.userData = { id: i, data: data, isPicked: false };
                cardGroup.add(card);
            });
}

        // --- HIỆU ỨNG NỔ HẠT (Bé, Chậm, Trắng) ---
        function createExplosion(position) {
            const particleCount = 150;
            const geo = new THREE.BufferGeometry();
            const positions = [];
            const velocities = [];
            const sizes = [];

            for (let i = 0; i < particleCount; i++) {
                positions.push(position.x, position.y, position.z); 
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                
                const speed = Math.random() * 0.03 + 0.01; 

                velocities.push(
                    speed * Math.sin(phi) * Math.cos(theta),
                    speed * Math.sin(phi) * Math.sin(theta),
                    speed * Math.cos(phi)
                );
                
                sizes.push(Math.random() * 0.15 + 0.05); 
            }

            geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

            const mat = new THREE.PointsMaterial({
                size: 0.2,
                map: particleTexture, 
                transparent: true, 
                opacity: 0.9,
                depthWrite: false, 
                blending: THREE.AdditiveBlending, 
                color: 0xffffff 
            });

            const points = new THREE.Points(geo, mat);
            scene.add(points);
            explosions.push({ mesh: points, velocities: velocities, age: 0 });
        }

        function updateExplosions() {
            for (let i = explosions.length - 1; i >= 0; i--) {
                const ex = explosions[i];
                const positions = ex.mesh.geometry.attributes.position.array;
                ex.age += 1;
                for (let j = 0; j < ex.velocities.length / 3; j++) {
                    positions[j*3] += ex.velocities[j*3];
                    positions[j*3+1] += ex.velocities[j*3+1];
                    positions[j*3+2] += ex.velocities[j*3+2];
                }
                ex.mesh.geometry.attributes.position.needsUpdate = true;
                ex.mesh.material.opacity = 1 - (ex.age / 60); 
                ex.mesh.scale.setScalar(1 + ex.age * 0.01); 
                if (ex.age > 60) {
                    scene.remove(ex.mesh);
                    ex.mesh.geometry.dispose();
                    explosions.splice(i, 1);
                }
            }
        }

        function updateCounter() {
            document.getElementById('counter').innerText = `${storedCards.length} / 5`;
            if (storedCards.length === 5) {
                document.getElementById('guide-text').innerText = "Định mệnh đã an bài...";
                setTimeout(revealReading, 2000);
            }
        }

        function pickCard(card) {
            if (inspectingCard || storedCards.length >= 5 || card.userData.isPicked) return;
            card.userData.isPicked = true; inspectingCard = card;
            scene.attach(card);

            new TWEEN.Tween(card.position).to(CONFIG.inspectPos, 1000).easing(TWEEN.Easing.Cubic.Out).start();
            new TWEEN.Tween(card.rotation).to({ x: 0, y: Math.PI, z: 0 }, 1000).easing(TWEEN.Easing.Back.Out).start();
            
            const targetScale = CONFIG.inspectScale;
            new TWEEN.Tween(card.scale).to({ x: targetScale, y: targetScale, z: targetScale }, 1000)
                .onComplete(() => { 
                    setTimeout(() => {
                        createExplosion(card.position);
                        setTimeout(storeCard, 100); 
                    }, 1500); 
                }).start();
        }

        function getSafeVerticalLeftPosition(index) {
            const dist = camera.position.z - CONFIG.storageZ;
            const vFOV = THREE.MathUtils.degToRad(camera.fov);
            const visibleHeight = 2 * Math.tan(vFOV / 2) * dist;
            const visibleWidth = visibleHeight * camera.aspect;

            const leftEdge = -visibleWidth / 2;
            const topEdge = visibleHeight / 2;

            const x = leftEdge + CONFIG.storeMarginX;
            const y = topEdge - CONFIG.storeMarginTop - (index * CONFIG.storeGapY);

            return { x, y, z: CONFIG.storageZ };
        }

        function storeCard() {
            if (!inspectingCard) return;
            const card = inspectingCard; storedCards.push(card); inspectingCard = null;
            const index = storedCards.length - 1;

            const pos = getSafeVerticalLeftPosition(index);
            const scale = CONFIG.storageScale;

            new TWEEN.Tween(card.position).to({ x: pos.x, y: pos.y, z: pos.z }, 800).easing(TWEEN.Easing.Exponential.Out).start();
            new TWEEN.Tween(card.scale).to({ x: scale, y: scale, z: scale }, 800).start();
                
            updateCounter();
            repositionStoredCards(); 
        }

        function repositionStoredCards() {
            const scale = CONFIG.storageScale;
            storedCards.forEach((c, i) => {
                const pos = getSafeVerticalLeftPosition(i);
                new TWEEN.Tween(c.position).to({ x: pos.x, y: pos.y, z: pos.z }, 500).start();
                new TWEEN.Tween(c.scale).to({ x: scale, y: scale, z: scale }, 500).start();
            });
        }

        function revealReading() {
            isGameActive = false;
            document.getElementById('ui-layer').style.pointerEvents = "auto";
            document.getElementById('guide-text').style.opacity = 0;
            document.getElementById('virtual-cursor').style.display = 'none';
            const content = document.getElementById('final-reading');
            const contexts = ["LÁ SỐ 1", "LÁ SỐ 2", "LÁ SỐ 3", "LÁ SỐ 4", "LÁ SỐ 5"];
            let html = "";
            storedCards.forEach((c, i) => {
                const data = c.userData.data;
                html += `
                <div class="reading-section">
                    <span class="reading-label">✦ ${contexts[i]}</span>
                    <div class="reading-body">
                        <img src="${data.url}" class="reading-img">
                        <div class="reading-content">
                            <h3>${data.name}</h3>
                            <div class="reading-desc">${data.meaning}</div>
                        </div>
                    </div>
                </div>`;
            });
            content.innerHTML = html;
            document.getElementById('result-modal').style.display = 'block';
        }

        function onMouseDown(event) {
            if (!isGameActive || storedCards.length >= 5) return;
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(cardGroup.children);
            if (intersects.length > 0) pickCard(intersects[0].object);
        }

        function onResults(results) {
            const cursor = document.getElementById('virtual-cursor');
            const guide = document.getElementById('guide-text');

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const lm = results.multiHandLandmarks[0];
                if(storedCards.length === 0) guide.innerText = "Chụm ngón cái và trỏ để chọn";
                handX = 1 - lm[9].x; 
                const x = (lm[8].x + lm[4].x) / 2;
                const y = (lm[8].y + lm[4].y) / 2;
                const screenX = (1 - x) * window.innerWidth;
                const screenY = y * window.innerHeight;
                
                cursor.style.display = 'block'; 
                cursor.style.left = `${screenX}px`; 
                cursor.style.top = `${screenY}px`;
                
                cursorPosition.x = (screenX / window.innerWidth) * 2 - 1;
                cursorPosition.y = -(screenY / window.innerHeight) * 2 + 1;

                const distance = Math.hypot(lm[8].x - lm[4].x, lm[8].y - lm[4].y);
                const isPinchingNow = distance < 0.08; 

                if (isPinchingNow && !isPinching) {
                    cursor.classList.add('pinching'); 
                    if (isGameActive) {
                        raycaster.setFromCamera(cursorPosition, camera);
                        const intersects = raycaster.intersectObjects(cardGroup.children);
                        if (intersects.length > 0) {
                            pickCard(intersects[0].object);
                        }
                    }
                } else if (!isPinchingNow) {
                    cursor.classList.remove('pinching');
                }
                isPinching = isPinchingNow;
            } else {
                cursor.style.display = 'none';
            }
        }

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight; 
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            repositionStoredCards();
        }

        function animate(time) {
    requestAnimationFrame(animate); 
    TWEEN.update(time);
    updateExplosions(); 

    if (isGameActive) {
        let targetRotSpeed = 0; // Mặc định là ĐỨNG YÊN

        // Kiểm tra xem có tay trong khung hình không (dựa vào virtual-cursor đang hiển thị)
        const cursor = document.getElementById('virtual-cursor');
        const isHandVisible = cursor && cursor.style.display !== 'none';

        if (!isHandVisible) {
            // NẾU KHÔNG CÓ TAY: Cho bài quay cực chậm để tạo cảm giác lung linh
            targetRotSpeed = 0.001; 
        } else {
            // NẾU CÓ TAY: 
            // 1. Bài sẽ dừng quay tự động (targetRotSpeed đã bằng 0 ở trên)
            // 2. Chỉ quay khi bạn chủ động đưa tay sang rìa trái/phải để "vuốt" bài
            if (handX < 0.3) {
                targetRotSpeed = -0.015; // Vuốt sang trái
            } else if (handX > 0.7) {
                targetRotSpeed = 0.015;  // Vuốt sang phải
            }
        }

        // Làm mượt chuyển động dừng
        // Khi bạn đưa tay vào giữa, rotationSpeed sẽ giảm dần về 0 rất mượt
        rotationSpeed += (targetRotSpeed - rotationSpeed) * 0.1;
        cardGroup.rotation.y += rotationSpeed;

        // Hiệu ứng dập dềnh nhẹ
        cardGroup.children.forEach((c, i) => { 
            if(!c.userData.isPicked) {
                c.position.y = Math.sin(time * 0.001 + i) * 0.1; 
            }
        });
    }

    if(starFieldMesh) {
        starFieldMesh.rotation.y = time * 0.00002;
    }
    renderer.render(scene, camera);
}

        init(); animate();

        const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
        hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        hands.onResults(onResults);
        
        const videoElement = document.getElementById('input-video');
        const cam = new Camera(videoElement, {
            onFrame: async () => { await hands.send({image: videoElement}); },
            width: 640, height: 480
        });
        cam.start();
