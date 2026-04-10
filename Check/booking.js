let cart = [];
let tempSelection = null;
let isFirstTime = true;
let scale = 1;
let currentMethod = 'EventPay'; // Mặc định
const MAP_TEMPLATES = {
    // SƠ ĐỒ ID 26: BTS (Đã fix cứng tiêu đề BTS)
    26: {
        eventName: "BTS WORLD TOUR",
        hasDiagram: true,
        time: "19:00 - 08/05/2026",
        location: "GILLETTE STADIUM, FOXBOROUGH, MA",
        currency: "COP",
        priceList: [
            { name: 'PAQUETE VIP | SOUND CHECK', price: 2953000 },
            { name: 'VIP GENERAL', price: 1081000 },
            { name: 'SUR / NORTE BAJA', price: 300000 },
            { name: 'SUR / NORTE ALTA', price: 396000 },
            { name: 'ORIENTAL ALTA', price: 588000 },
            { name: 'OCCIDENTAL ALTA', price: 661000 },
            { name: 'ORIENTAL BAJA', price: 961000 },
            { name: 'OCCIDENTAL BAJA', price: 1009000 }
            
        ],
        html: `
            <div class="text-center mb-6">
    <h1 class="text-red-600 font-black text-3xl uppercase tracking-tighter italic">BTS WORLD TOUR - BOGOTÁ</h1>
    <p class="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Sơ đồ sân vận động El Campín</p>
</div>

<div class="stage w-full block bg-zinc-800 text-zinc-400 py-6 mb-8 text-center font-black text-sm rounded-b-3xl shadow-[0_10px_30px_rgba(220,20,60,0.2)] border-b-4 border-red-700 uppercase tracking-[1em] mx-auto">
    MAIN STAGE
</div>

<div class="flex flex-col items-center gap-10 **mx-auto** ">
    
    <div class="flex items-center justify-center gap-12 w-full relative">
        
        <div class="hidden md:block w-1.5 h-64 bg-gradient-to-b from-red-600 via-zinc-800 to-transparent rounded-full opacity-40 shadow-[0_0_20px_rgba(220,20,60,0.4)]"></div>

        <div class="flex flex-col items-center gap-4 border-2 border-zinc-800 p-8 rounded-[3rem] bg-zinc-900/50 backdrop-blur-sm shadow-2xl">
            <div class="block color-soundcheck w-80 text-center py-4 rounded-xl font-black text-xs cursor-pointer transition hover:scale-105 shadow-lg shadow-pink-500/20" 
                 style="background-color: #EC407A; color: #FFFFFF;"
                 onclick="handleBlockClick('PAQUETE VIP | SOUND CHECK', 2953000)">
                PAQUETE VIP | SOUND CHECK
            </div>
            
            <div class="block color-vip-bts w-56 h-56 flex items-center justify-center text-center rounded-full font-black text-sm cursor-pointer transition hover:scale-105 shadow-inner" 
                 style="background-color: #B2EBF2; color: #000000;"
                 onclick="handleBlockClick('VIP (ACCESO GENERAL)', 1081000)">
                VIP GENERAL
            </div>
        </div>

        <div class="hidden md:block w-1.5 h-64 bg-gradient-to-b from-red-600 via-zinc-800 to-transparent rounded-full opacity-40 shadow-[0_0_20px_rgba(220,20,60,0.4)]"></div>
    </div>

    <div class="flex flex-wrap justify-center gap-4 max-w-4xl">
    
    </div>
</div>

<div class="grid grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
    <div class="flex flex-col gap-4">
        <div class="block p-6 text-center rounded-2xl font-bold text-xs h-24 flex items-center justify-center cursor-pointer" 
             style="background-color: #FF69B4; color: white;" 
             onclick="handleBlockClick('OCCIDENTAL BAJA', 1009000)">OCCIDENTAL BAJA</div>
        
        <div class="block p-6 text-center rounded-2xl font-bold text-xs h-24 flex items-center justify-center cursor-pointer" 
             style="background-color: #F08080; color: white;" 
             onclick="handleBlockClick('OCCIDENTAL ALTA', 661000)">OCCIDENTAL ALTA</div>
    </div>

    <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-2">
            <div class="block p-4 text-center rounded-lg font-bold text-[10px] cursor-pointer" 
                 style="background-color: #8B0000; color: white;" 
                 onclick="handleBlockClick('SUR BAJA', 300000)">SUR BAJA</div>
            
            <div class="block p-4 text-center rounded-lg font-bold text-[10px]" 
                 style="background-color: #778899; color: white;" 
                 onclick="handleBlockClick('ORIENTAL NORTE BAJA', 300000)">OR. NORTE BAJA</div>
        </div>
        
        <div class="block p-6 text-center rounded-2xl font-bold text-xs h-20 flex items-center justify-center" 
             style="background-color: #DC143C; color: white;" 
             onclick="handleBlockClick('SUR ALTA', 396000)">SUR ALTA</div>
        
        <div class="w-full h-16 flex items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl bg-zinc-900/30">
            <span class="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Control Tower</span>
        </div>
    </div>

    <div class="flex flex-col gap-4">
        <div class="block p-6 text-center rounded-2xl font-bold text-xs h-24 flex items-center justify-center" 
             style="background-color: #6A5ACD; color: white;" 
             onclick="handleBlockClick('ORIENTAL BAJA', 961000)">ORIENTAL BAJA</div>
        
        <div class="block p-6 text-center rounded-2xl font-bold text-xs h-24 flex items-center justify-center" 
             style="background-color: #3F51B5; color: white;" 
             onclick="handleBlockClick('ORIENTAL ALTA', 588000)">ORIENTAL ALTA</div>
    </div>
</div>

<div class="grid grid-cols-2 gap-6 w-full max-w-2xl pb-10 mx-auto mt-4">
    <div class="flex flex-col gap-3">
        <div class="block py-4 text-center rounded-xl font-bold text-xs" 
             style="background-color: #FF7F50; color: white;" 
             onclick="handleBlockClick('NORTE BAJA', 300000)">NORTE BAJA</div>
        
        <div class="block py-4 text-center rounded-xl font-bold text-xs" 
             style="background-color: #D2691E; color: white;" 
             onclick="handleBlockClick('NORTE ALTA', 396000)">NORTE ALTA</div>
    </div>
    
    <div class="flex flex-col gap-3">
        <div class="block py-4 text-center rounded-xl font-bold text-xs" 
             style="background-color: #483D8B; color: white;" 
             onclick="handleBlockClick('ORIENTAL NORTE ALTA', 396000)">OR. NORTE ALTA</div>
        
        <div class="block py-4 text-center rounded-xl font-bold text-xs" 
             style="background-color: #2F4F4F; color: white;" 
             onclick="handleBlockClick('ORIENTAL SUR ALTA', 396000)">OR. SUR ALTA</div>
    </div>
            </div>`
    },

    // SƠ ĐỒ ID 53: STANDARD 
    53: {
        eventName: "GREENGREEN CORTIS ",
        hasDiagram: true,
        time: "18:00 - 20/04/2026",
        location: "VINCOM CENTER, HÀ NỘI",
        currency: "đ",
        priceList: [
            { name: 'SKY LOUNGE', price: 10000000 },
            { name: 'SVIP A', price: 5000000 },
            { name: 'SVIP B', price: 5000000 },
            { name: 'VIP A', price: 4000000 },
            { name: 'VIP B', price: 4000000 },
            { name: 'FANZONE A', price: 2500000 },
            { name: 'FANZONE B', price: 2500000 },
            { name: 'GA 1A', price: 2000000 },
            { name: 'GA 1B', price: 2000000 },
            { name: 'CAT 1A', price: 1500000 },
            { name: 'CAT 1B', price: 1500000 }
        ],
        html: `
    <div class="text-center mb-6">
        <h1 class="text-green-500 font-black text-3xl uppercase tracking-tighter italic">GREENGREEN CORTIS </h1>
        <p class="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Bấm vào khu vực để chọn vé</p>
    </div>

    <div class="stage w-2/3 bg-zinc-800 text-green-500 py-4 mb-6 text-center font-black text-xs border-2 border-green-500 uppercase tracking-[1em] mx-auto">
        SÂN KHẤU
    </div>

    <div class="flex flex-col items-center gap-4"> <div class="flex items-end gap-3"> <div class="block color-ga" onclick="handleBlockClick('GA 1A', 2000000)">GA 1A</div>
        
        <div class="block color-fan" onclick="handleBlockClick('FANZONE A', 2500000)">FANZONE A</div>
        
        <div class="w-48 h-14 border-2 border-dashed border-zinc-700 flex items-center justify-center bg-zinc-900/30 rounded-full mb-1">
            <span class="text-[10px] text-zinc-500 font-black uppercase">FOH</span>
        </div>
        
        <div class="block color-fan" onclick="handleBlockClick('FANZONE B', 2500000)">FANZONE B</div>
        
        <div class="block color-ga" onclick="handleBlockClick('GA 1B', 2000000)">GA 1B</div>
    </div>

    <div class="flex gap-3">
        <div class="block color-vip" onclick="handleBlockClick('VIP A', 4000000)">VIP A</div>
        <div class="block color-svip" onclick="handleBlockClick('SVIP A', 5000000)">SVIP A</div>
        <div class="block color-sky" onclick="handleBlockClick('SKY LOUNGE', 10000000)">SKY LOUNGE</div>
        <div class="block color-svip" onclick="handleBlockClick('SVIP B', 5000000)">SVIP B</div>
        <div class="block color-vip" onclick="handleBlockClick('VIP B', 4000000)">VIP B</div>
    </div>

    <div class="flex gap-3">
        <div class="block color-cat" onclick="handleBlockClick('CAT 1A', 1500000)">CAT 1A</div>
        <div class="block color-cat" onclick="handleBlockClick('CAT 1B', 1500000)">CAT 1B</div>
    </div>
</div> `
    },

174: {
        eventName: "G-DRAGON WORLD TOUR",
        hasDiagram: true,
        time: "20:00 - 11/08/2026",
        location: "Vinhomes Ocean Park 3, Hà Nội",
        currency: "đ",
        priceList: [
            { name: 'VIP', price: 8000000 },
            { name: 'PREMIUM', price: 6500000 },
            { name: 'CAT 1A, 1B', price: 6000000 },
            { name: 'CAT 2A, 2B', price: 5000000 },
            { name: 'CAT 3A, 3B', price: 4000000 },
            { name: 'CAT 4A, 4B', price: 3800000 },
            { name: 'CAT 5A, 5B', price: 5000000 },
            { name: 'GA 1A, 1B', price: 3300000 },
            { name: 'GA 2A, 2B', price: 3800000 },
            { name: 'GA 3A, 3B', price: 3300000 },
            { name: 'GA 4A, 4B', price: 2200000 }

        ],
        html: `
    <div class="text-center mb-0 text-white">
        <div class="w-64 h-auto mx-auto mb-2">
            <p class="font-serif text-3xl font-light tracking-widest text-[#FFFFFF]">G-DRAGON</p>
            <p class="font-serif text-xl tracking-widest text-[#FFFFFF] opacity-80">WORLD TOUR</p>
            <p class="font-serif text-5xl font-black uppercase tracking-tighter text-[#FFFFFF] mt-1">Übermensch</p>
            <p class="text-xs uppercase tracking-[0.5em] text-[#FFFFFF] mt-2 opacity-70">IN HANOI</p>
        </div>
        <h2 class="text-[#FFFFFF] font-black text-2xl uppercase tracking-[0.2em] mt-2">SƠ ĐỒ KHU VỰC SÂN KHẤU</h2>
        <p class="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-1 font-bold">Bấm vào khu vực để chọn vé</p>
    </div>

    <div class="flex flex-col items-center mb-0 relative z-20 mt-2"> 
        <div class="bg-white text-black py-4 text-center font-black text-sm uppercase tracking-[0.8em] rounded-t-2xl shadow-xl"
             style="width: 200px;">
            SÂN KHẤU
        </div>

        <div class="bg-white w-12 h-[290px] mx-auto shadow-lg rounded-b-lg"></div>

    </div>

    <div class="flex flex-col items-center gap-2 max-w-6xl mx-auto relative px-4 text-white -mt-[280px]">
        </div>

    <div class="flex flex-col items-center gap-2 max-w-6xl mx-auto relative px-4 text-white">
        
        <div class="flex items-start gap-1 justify-center relative w-full h-[280px]" style="z-index: 50;">
            
            <div class="flex items-end gap-1 h-full pt-10 mt-auto">
                <div class="absolute top-0 left-[140px] flex flex-col items-start gap-1 z-30">
    <span class="text-[9px] text-red-500 font-black tracking-[0.2em] uppercase">LIVE CAM</span>
    
    <div class="w-16 h-px" 
         style="background: linear-gradient(to left, #EF4444 20%, transparent 100%); 
                box-shadow: 0 0 10px #EF4444, 0 0 5px #EF4444;">
    </div>
</div>
                <div class="block w-20 h-full flex flex-col items-center justify-center p-2 rounded-md font-bold text-[10px] text-center" style="background-color: #00897B; color: #FFFFFF;" onclick="handleBlockClick('CAT 2A', 5000000)">CAT 2A</div>
                <div class="block w-20 h-full flex flex-col items-center justify-center p-2 rounded-md font-bold text-[10px] text-center" style="background-color: #FBC02D; color: #000000;" onclick="handleBlockClick('CAT 1A', 6000000)">CAT 1A</div>
                <div class="block w-28 h-full flex flex-col items-center justify-center p-2 rounded-md font-bold text-[10px] text-center" style="background-color: #03A9F4; color: #FFFFFF;" onclick="handleBlockClick('GA 1A', 3300000)">GA 1A</div>
            </div>

            <div class="flex items-start justify-center gap-14 h-full"> 
                <div class="block w-20 h-[280px] flex flex-col items-center justify-center p-2 rounded-md font-bold text-[10px] text-center"
                     style="background-color: #EC407A; color: #FFFFFF;"
                     onclick="handleBlockClick('VIP T1', 8000000)">
                    VIP
                </div>
    
                <div class="block w-20 h-[280px] flex flex-col items-center justify-center p-2 rounded-md font-bold text-[10px] text-center"
                     style="background-color: #EC407A; color: #FFFFFF;"
                     onclick="handleBlockClick('VIP T2', 8000000)">
                    VIP
                </div>
            </div>

            <div class="flex items-end gap-1 h-full pt-10 mt-auto">
            <div class="absolute top-0 right-[140px] flex flex-col items-end gap-1 z-30">
    <span class="text-[9px] text-red-500 font-black tracking-[0.2em] uppercase">LIVE CAM</span>
    
    <div class="w-16 h-px" 
         style="background: linear-gradient(to right, #EF4444 20%, transparent 100%); 
                box-shadow: 0 0 10px #EF4444, 0 0 5px #EF4444;">
    </div>
</div>
                <div class="block w-28 h-full flex flex-col items-center justify-center p-2 rounded-md font-bold text-[10px] text-center" style="background-color: #03A9F4; color: #FFFFFF;" onclick="handleBlockClick('GA 1B', 3300000)">GA 1B</div>
                <div class="block w-20 h-full flex flex-col items-center justify-center p-2 rounded-md font-bold text-[10px] text-center" style="background-color: #FBC02D; color: #000000;" onclick="handleBlockClick('CAT 1B', 6000000)">CAT 1B</div>
                <div class="block w-20 h-full flex flex-col items-center justify-center p-2 rounded-md font-bold text-[10px] text-center" style="background-color: #00897B; color: #FFFFFF;" onclick="handleBlockClick('CAT 2B', 5000000)">CAT 2B</div>
            </div>
        </div>

        <div class="flex justify-center gap-10 mt-4 mb-5">
            <div class="block w-20 py-2 border border-zinc-700 rounded-md text-[8px] text-center font-bold uppercase tracking-widest text-zinc-600 bg-zinc-900/40">FOH</div>
            <div class="block w-32 h-10 flex flex-col items-center justify-center rounded-md font-bold text-[10px] text-center" style="background-color: #EF6C00; color: #FFFFFF;" onclick="handleBlockClick('GA 2A', 3800000)">GA 2A</div>
            <div class="block w-20 py-2 border border-zinc-700 rounded-md text-[8px] text-center font-bold uppercase tracking-widest text-zinc-600 bg-zinc-900/40">FOH</div>
            <div class="block w-32 h-10 flex flex-col items-center justify-center rounded-md font-bold text-[10px] text-center" style="background-color: #EF6C00; color: #FFFFFF;" onclick="handleBlockClick('GA 2B', 3800000)">GA 2B</div>
            <div class="block w-20 py-2 border border-zinc-700 rounded-md text-[8px] text-center font-bold uppercase tracking-widest text-zinc-600 bg-zinc-900/40">FOH</div>
        </div>

        <div class="flex items-end justify-center gap-1 h-[200px]">
            <div class="block w-20 h-full flex flex-col items-center justify-center p-2 rounded-md font-bold text-[10px] text-center" style="background-color: #2979FF; color: #FFFFFF;" onclick="handleBlockClick('CAT 4A', 3500000)">CAT 4A</div>
            <div class="block w-20 h-full flex flex-col items-center justify-center p-2 rounded-md font-bold text-[10px] text-center" style="background-color: #F44336; color: #FFFFFF;" onclick="handleBlockClick('CAT 3A', 4000000)">CAT 3A</div>
            <div class="block w-32 h-full flex flex-col items-center justify-center p-2 rounded-md font-bold text-[10px] text-center" style="background-color: #7E57C2; color: #FFFFFF;" onclick="handleBlockClick('GA 4A', 2000000)">GA 4A</div>
            
            <div class="w-20 h-20 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center bg-zinc-900/30 rounded-full mb-1 translate-y-2">
                <span class="text-[9px] text-zinc-500 font-black uppercase">FOH</span>
                <span class="text-[7px] text-zinc-600 uppercase">LIVE CAM</span>
            </div>

            <div class="block w-32 h-full flex flex-col items-center justify-center p-2 rounded-md font-bold text-[10px] text-center" style="background-color: #7E57C2; color: #FFFFFF;" onclick="handleBlockClick('GA 4B', 2000000)">GA 4B</div>
            <div class="block w-20 h-full flex flex-col items-center justify-center p-2 rounded-md font-bold text-[10px] text-center" style="background-color: #F44336; color: #FFFFFF;" onclick="handleBlockClick('CAT 3B', 4000000)">CAT 3B</div>
            <div class="block w-20 h-full flex flex-col items-center justify-center p-2 rounded-md font-bold text-[10px] text-center" style="background-color: #2979FF; color: #FFFFFF;" onclick="handleBlockClick('CAT 4B', 3500000)">CAT 4B</div>
        </div>

        <div class="flex justify-center gap-10 mt-4 mb-4">
    <div class="block w-40 h-12 flex items-center justify-center rounded-md font-bold text-[10px] text-center cursor-pointer" 
         style="background-color: #FFA726; color: #FFFFFF;" 
         onclick="handleBlockClick('GA 3A', 3300000)">
        GA 3A
    </div>
    <div class="block w-40 h-12 flex items-center justify-center rounded-md font-bold text-[10px] text-center cursor-pointer" 
         style="background-color: #FFA726; color: #FFFFFF;" 
         onclick="handleBlockClick('GA 3B', 3300000)">
        GA 3B
    </div>
</div>

        <div class="flex justify-center gap-1 max-w-2xl text-white">
            <div class="flex flex-col gap-1 items-end w-32">
                <div class="block w-full py-4 rounded-md font-bold text-[10px] text-center" style="background-color: #A1887F; color: #FFFFFF;" onclick="handleBlockClick('CAT 5A', 5000000)">CAT 5A</div>
                <div class="block w-full py-4 rounded-md font-bold text-[10px] text-center" style="background-color: #311B92; color: #FFFFFF;" onclick="handleBlockClick('CAT 6A', 4000000)">CAT 6A</div>
            </div>
            
            <div class="flex flex-col gap-1 w-[240px]">
                <div class="block w-full py-4 rounded-md font-bold text-[10px] text-center" style="background-color: #B71C1C; color: #FFFFFF;" onclick="handleBlockClick('PREMIUM', 6500000)">PREMIUM</div>
                <div class="block w-full py-4 rounded-md font-bold text-[10px] text-center" style="background-color: #9C27B0; color: #FFFFFF;" onclick="handleBlockClick('SKY LOUNGE', 6000000)">SKY LOUNGE</div>
            </div>

            <div class="flex flex-col gap-1 items-start w-32">
                <div class="block w-full py-4 rounded-md font-bold text-[10px] text-center" style="background-color: #A1887F; color: #FFFFFF;" onclick="handleBlockClick('CAT 5B', 5000000)">CAT 5B</div>
                <div class="block w-full py-4 rounded-md font-bold text-[10px] text-center" style="background-color: #311B92; color: #FFFFFF;" onclick="handleBlockClick('CAT 6B', 4000000)">CAT 6B</div>
            </div>
        </div>

    </div>
`
    },

   21: {
    eventName: "RAP VIỆT STAR",
    hasDiagram: false,
    time: "19:00 - 28/03/2026",
    location: "SECC, QUẬN 7, TP.HCM",
    currency: "đ",
    priceList: [
        { name: 'VVIP PRESIDENT', price: 8000000 },
        { name: 'SVIP STAR', price: 4500000 },
        { name: 'VIP ZONE', price: 3000000 },
        { name: 'FANZONE', price: 2200000 },
        { name: 'GA STANDARD', price: 1500000 },
        { name: 'CAT 1', price: 1000000 },
        { name: 'CAT 2', price: 700000 }
    ],
},

    52: {
    eventName: "OCEAN WHISPER 2026",
    hasDiagram: true,
    time: "08:00 - 16/04/2026",
    location: "LOTTE MALL TÂY HỒ, HÀ NỘI",
    currency: "đ",
    priceList: [
        { name: 'Trải nghiệm cho cá ăn', price: 150000 },
        { name: 'Vé tham quan cơ bản', price: 300000 },
        { name: 'Tour đường hầm', price: 350000 },
        { name: 'Quầy vé trọn gói', price: 500000 }
      ],
      html: `
    <div id="whale" style="position: absolute; inset: 0; width: 100%; height: 100vh; z-index: 1; pointer-events: none; overflow: hidden; opacity: 0.3;"></div>

    <div style="width: 100%; height: 100vh; position: relative; z-index: 10; overflow: hidden; background: transparent;">
        <div id="map-wrapper" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
            <img src="map.png" 
                 alt="Aquarium Map" 
                 id="map-img" 
                 style="max-width: 100%; max-height: 100%; object-fit: contain; display: block;"
                 onerror="this.src='https://via.placeholder.com/800x600?text=KHONG+TIM+THAY+ANH+MAP.PNG'">
        </div>
    </div>
    `
},

};

// 1. Dữ liệu thô (Ông chỉ cần thêm show mới vào đây)
const allEventsData = [
    { id: 21, title: "RAP VIỆT STAR", prices: [{name: 'VVIP PRESIDENT', price: 8000000}, {name: 'CAT 1', price: 1000000}] },
    { id: 22, title: "SHOW CỦA ĐEN", prices: [{name: 'GA STANDING', price: 1500000}] }
];

// 2. Hàm đúc khuôn (Converter)
function createEventConfig(sourceData) {
    return {
        eventName: sourceData.title || sourceData.eventName,
        hasDiagram: false,
        time: sourceData.time || "19:00 - 28/03/2026",
        location: sourceData.location || "SECC, QUẬN 7, TP.HCM",
        currency: "đ",
        priceList: (sourceData.prices || []).map(p => ({
            name: p.name,
            price: p.price,
            desc: p.desc || "Hạng vé tiêu chuẩn bao gồm đầy đủ quyền lợi tham gia sự kiện."
        }))
    };
}

// Khởi tạo đối tượng chứa cấu trúc config
const eventConfigs = {};

// Chạy vòng lặp để tự động tạo 100 cái
allEventsData.forEach(item => {
    eventConfigs[item.id] = createEventConfig(item);
});

function generateTicketListHTML(config) {
    if (!config || !config.priceList || config.priceList.length === 0) {
        console.error("Dữ liệu priceList trống:", config);
        return `<div class="text-gray-400 text-center mt-10">Hiện chưa có thông tin giá vé.</div>`;
    }
    return `
    <style>
        .ticket-scroll-container { 
            height: calc(100vh - 100px); 
            overflow-y: auto !important; 
            overflow-x: hidden;
            scrollbar-width: none; 
            -ms-overflow-style: none; 
        }
        .ticket-scroll-container::-webkit-scrollbar { display: none; }

        .ticket-content-wrapper {
            max-width: 100%; 
            padding: 40px 30px; 
        }

        .fixed-desc-box {
            width: 100%;       
            max-width: 600px;  
            height: 90px;      
            display: flex;
            align-items: center; 
            background: rgba(24, 24, 27, 0.4); 
            border: 1px solid rgba(63, 63, 70, 0.4); 
            border-left: 6px solid #26bc4e; 
            border-radius: 2px;
            padding: 0 20px;
            box-sizing: border-box;
        }

        /* FIX ĐƯỜNG GẠCH NGANG KHÔNG BỊ TRÀN */
        .ticket-divider-container {
            margin-top: 64px;
            width: 100%;
            height: 1px;
            display: flex;
            align-items: center;
            overflow: hidden;
            opacity: 0.2; /* Độ mờ cho giống Ticketbox */
        }

        .dash-line {
            width: 100%;
            border-top: 2px dashed #ffffff; /* Dùng border dashed để tạo dấu gạch ngang */
            height: 0;
        }

        .ticket-row, .ticket-row * {
            transition: none !important;
            transform: none !important;
        }
    </style>
    
 <div class="w-full flex flex-col bg-[#0a0a0a] text-white">
        <div class="sticky top-0 z-20 bg-[#0a0a0a] py-8 border-b border-zinc-800/30 px-[30px] flex justify-center">
            <div class="text-[#26bc4e] font-bold text-xl uppercase tracking-[0.4em]">Chọn vé</div>
        </div>

        <div class="ticket-scroll-container">
            <div class="ticket-content-wrapper p-8 space-y-12">
                ${config.priceList.map(t => {
                    // Tạo ID an toàn: Loại bỏ dấu tiếng Việt và khoảng trắng
                    const safeId = t.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
                    const currentQty = cart.find(i => i.name === t.name)?.qty || 0;
                    
                    return `
                    <div class="ticket-row w-full">
                        <div class="flex justify-between items-center mb-6">
                            <div class="flex-1">
                                <h3 class="font-black text-white text-[20px] uppercase">${t.name}</h3>
                                <div class="text-[#26bc4e] font-black mt-1 text-[18px]">${t.price.toLocaleString()} đ</div>
                            </div>
                            
                            <div class="flex items-center bg-white rounded-full shrink-0 overflow-hidden">
                                <button class="w-10 h-10 flex items-center justify-center text-zinc-400 border-r border-zinc-100" 
                                        onclick="updateCart('${t.name}', -1)">－</button>
                                <span id="qty-${safeId}" class="w-10 h-10 flex items-center justify-center text-black font-bold">
                                    ${currentQty}
                                </span>
                                <button class="w-10 h-10 flex items-center justify-center text-[#26bc4e]" 
                                        onclick="handleBlockClick('${t.name}', ${t.price})">＋</button>
                            </div>
                        </div>
                        
                        <div class="fixed-desc-box p-4 rounded">
                            <p class="text-zinc-400 text-sm">
                                ${t.desc || 'Vé chính thức bao gồm đầy đủ quyền lợi check-in và quà tặng kèm (nếu có).'}
                            </p>
                        </div>
                        <div class="border-b border-dashed border-zinc-800 my-8 opacity-30"></div>
                    </div>`;
                }).join('')}
            </div>
        </div>
    </div>`;
}

// 1. URL API của Google Sheet
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwU6IlGKSnqlc9xtBsBrH_aT5ttJJvbIkgXChprCgiEV9JLRQN4yj9GSDaXnCrOqzh1YQ/exec';

let currentEventConfig = null;

async function initMap() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = (urlParams.get('id') || '21').toString();
    
    let config = null;

    // --- BƯỚC 1: KIỂM TRA TRONG CODE TRƯỚC ---
    if (typeof MAP_TEMPLATES !== 'undefined' && MAP_TEMPLATES[eventId]) {
        config = MAP_TEMPLATES[eventId];
        console.log("Dùng data trong MAP_TEMPLATES");
    } 

    // --- BƯỚC 2: NẾU CHƯA CÓ THÌ LOAD TỪ SHEET ---
    if (!config) {
        try {
            const response = await fetch(SHEET_API_URL);
            const allEvents = await response.json();
            
            const sheetRow = allEvents.find(item => {
                const rowId = (item.id || item.ID || item.Id || "").toString();
                return rowId === eventId;
            });

            if (sheetRow) {
                // Dò tìm tên cột (phòng trường hợp ông đặt Title hay title)
                const rawName = sheetRow.title || sheetRow.Title || sheetRow.eventName || "Sự kiện mới";
                const rawTime = sheetRow.time || sheetRow.Time || "Đang cập nhật";
                const rawLoc = sheetRow.location || sheetRow.Location || "Đang cập nhật";
                const rawPriceData = sheetRow.priceList || sheetRow.prices || sheetRow.Prices || sheetRow.price || "";

                console.log("Dữ liệu thô lấy được từ cột priceList:", rawPriceData);

                config = {
                    eventName: rawName,
                    time: rawTime,
                    location: rawLoc,
                    currency: "đ",
                    hasDiagram: false,
                    priceList: parsePriceList(rawPriceData)
                };
                console.log("Đã lấy data từ Sheet:", config);
            }
        } catch (error) {
            console.error("Lỗi Fetch Sheet:", error);
        }
    }

    // --- BƯỚC 3: DỰ PHÒNG CUỐI CÙNG ---
    if (!config) {
        config = (typeof MAP_TEMPLATES !== 'undefined') ? MAP_TEMPLATES['21'] : null;
    }

    if (!config) return; 

    currentEventConfig = config;

    // --- BƯỚC 4: ĐỔ DỮ LIỆU LÊN GIAO DIỆN ---
    const sidebarTitle = document.querySelector('.right-panel h2') || document.querySelector('aside h2');
    if (sidebarTitle) sidebarTitle.innerText = config.eventName;

    const sideTime = document.getElementById('side-time') || document.querySelector('.fa-calendar-days')?.parentElement;
    const sideLoc = document.getElementById('side-loc') || document.querySelector('.fa-location-dot')?.parentElement;
    if (sideTime) sideTime.innerHTML = `<i class="fa-solid fa-calendar-days mr-2"></i> ${config.time}`;
    if (sideLoc) sideLoc.innerHTML = `<i class="fa-solid fa-location-dot mr-2"></i> ${config.location}`;

    // --- BƯỚC 5: RENDER SƠ ĐỒ HOẶC LIST VÉ CHÍNH ---
    const mapContainer = document.getElementById('map-container');
    const viewport = document.getElementById('viewport');

    if (mapContainer && viewport) {
        mapContainer.innerHTML = config.hasDiagram ? config.html : generateTicketListHTML(config); 
        mapContainer.style.opacity = "1";
        mapContainer.style.visibility = "visible";

        if (config.hasDiagram) {
            viewport.style.display = "flex";
            if (typeof activateZoomLogic === "function") activateZoomLogic();
        } else {
            viewport.style.display = "block";
            viewport.style.overflowY = "auto";
            mapContainer.style.maxWidth = "700px";
            mapContainer.style.margin = "0 auto";
        }
    }

    // --- BƯỚC 6: CẬP NHẬT BẢNG GIÁ BÊN PHẢI ---
    renderPriceListSidebar(config);
}

// HÀM HỖ TRỢ 1: Parse giá vé
function parsePriceList(priceData) {
    if (!priceData) return [];
    
    // Nếu là mảng từ code fix cứng thì trả về luôn
    if (Array.isArray(priceData)) return priceData;

    try {
        // Tách theo dấu phẩy hoặc xuống dòng
        return priceData.split(/,|\n/).map(item => {
            // Tách Tên và Giá bằng dấu :
            const parts = item.split(':');
            if (parts.length < 2) return null;

            const name = parts[0].trim();
            
            // XỬ LÝ GIÁ: Loại bỏ tất cả ký tự không phải số (dấu chấm, phẩy, chữ đ)
            const priceRaw = parts[1].toString().replace(/\D/g, '');
            const price = parseInt(priceRaw) || 0;

            return {
                name: name,
                price: price,
                desc: "Vé chính thức từ ban tổ chức."
            };
        }).filter(item => item !== null && item.price > 0); // Loại bỏ dòng lỗi hoặc giá = 0
    } catch (e) {
        console.error("Lỗi parse giá vé:", e);
        return [];
    }
}

// HÀM HỖ TRỢ 2: Render bảng giá nhanh
function renderPriceListSidebar(config) {
    const priceListDiv = document.querySelector('#price-list-default .space-y-4') || document.getElementById('ticket-list-container');
    if (!priceListDiv) return;

    if (config.priceList && config.priceList.length > 0) {
        priceListDiv.innerHTML = config.priceList.map(item => {
            const safeName = item.name.replace(/'/g, "\\'"); 
            return `
                <div class="flex justify-between items-center group cursor-pointer p-2 hover:bg-white/5 rounded-lg" 
                     onclick="handleBlockClick('${safeName}', ${item.price})">
                    <span class="text-[11px] font-bold text-gray-300 group-hover:text-green-400 transition uppercase flex-1">
                        ${item.name}
                    </span>
                    <span class="text-[11px] font-bold text-green-500 ml-2">
                        ${item.price.toLocaleString()} đ
                    </span>
                </div>`;
        }).join('');
    } else {
        priceListDiv.innerHTML = "<p class='text-xs text-gray-500'>Không có dữ liệu vé</p>";
    }
}


function activateZoomLogic() {
    const container = document.getElementById('map-container');
    const viewport = document.getElementById('viewport');
    if (!container || !viewport) return;

    let scale = 0.6;
    let pointX = 0;
    let pointY = 0;
    
    // Biến phục vụ việc kéo (Drag)
    let isDragging = false;
    let startX, startY;

    container.style.transformOrigin = "center center";
    container.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;

    // --- LOGIC ZOOM (Giữ nguyên của ông) ---
    viewport.onwheel = function(e) {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const oldScale = scale;
        scale = Math.min(Math.max(0.3, scale + delta), 3);

        const rect = viewport.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        pointX -= (x / oldScale - x / scale) * scale;
        pointY -= (y / oldScale - y / scale) * scale;

        container.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    };

    // --- LOGIC KÉO (DRAG) ---
    viewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        viewport.style.cursor = 'grabbing'; // Đổi icon chuột khi cầm
        // Lưu vị trí chuột ban đầu trừ đi tọa độ hiện tại của map
        startX = e.clientX - pointX;
        startY = e.clientY - pointY;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        // Tính toán tọa độ mới dựa trên khoảng cách chuột di chuyển
        pointX = e.clientX - startX;
        pointY = e.clientY - startY;

        container.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        viewport.style.cursor = 'grab'; // Trả lại icon chuột ban đầu
    });

    // Thiết lập icon chuột mặc định cho vùng viewport
    viewport.style.cursor = 'grab';
}

// SỬA Ở ĐÂY: Thay vì gọi initMap() trực tiếp, hãy đợi trang load xong hoàn toàn
window.onload = function() {
    initMap();
};

function showInvoice() {
    closeModals();
    const invoice = document.getElementById('invoice-modal');
    if(!invoice) return;

    invoice.classList.remove('hidden');
    invoice.style.display = 'flex';

    // ƯU TIÊN: Lấy từ currentEventConfig trước (Data từ Sheet/Map đã load)
    const eventId = new URLSearchParams(window.location.search).get('id') || '21';
    const config = currentEventConfig || (typeof MAP_TEMPLATES !== 'undefined' ? MAP_TEMPLATES[eventId] : null);

    if (!config) return;

    // 1. Ép tên sự kiện
    const elName = document.getElementById('inv-event-name');
    if(elName) elName.innerText = config.eventName;

    // 2. Ép thời gian
    const elTime = document.getElementById('inv-time');
    if(elTime) elTime.innerText = config.time;

    // 3. Đổ các thông tin vé
    const seats = cart.map(i => `${i.name} (x${i.qty})`).join(', ');
    const invSeats = document.getElementById('inv-seats');
    if(invSeats) {
        const spanValue = invSeats.querySelector('span:last-child');
        if(spanValue) spanValue.innerText = seats;
    }
    
    const invQty = document.getElementById('inv-qty');
    if(invQty) {
        const spanValue = invQty.querySelector('span:last-child');
        if(spanValue) spanValue.innerText = 'x' + cart.reduce((a, b) => a + b.qty, 0);
    }
    
    const invTotal = document.getElementById('inv-total');
    if(invTotal) {
        const currentTotal = document.getElementById('pay-total') ? document.getElementById('pay-total').innerText : "0 đ";
        const spanValue = invTotal.querySelector('span:last-child');
        if(spanValue) spanValue.innerText = currentTotal;
    }
}

function finishPayment() {
    console.log("Đang bắt đầu quá trình lưu đơn hàng...");
    
    try {
        const eventId = new URLSearchParams(window.location.search).get('id') || '21';
        const config = currentEventConfig || (typeof MAP_TEMPLATES !== 'undefined' ? MAP_TEMPLATES[eventId] : null);

        if (!config) throw new Error("Không tìm thấy thông tin sự kiện để lưu đơn!");

        const inputs = document.querySelectorAll('#step-2 .q-input');
        const now = new Date();
        const orderId = "TK-" + Math.floor(Math.random() * 90000 + 10000);

        const newOrder = {
            id: orderId,
            customer: inputs[0] ? inputs[0].value : "Khách ẩn danh",
            phone: inputs[1] ? inputs[1].value : "",
            email: inputs[2] ? inputs[2].value : "",
            event: config.eventName, 
            tickets: [...cart], 
            total: document.getElementById('pay-total') ? document.getElementById('pay-total').innerText : "0đ",
            time: now.toLocaleString('vi-VN'),
            status: "Thành công"
        };

        let orders = JSON.parse(localStorage.getItem('eventOrders')) || [];
        orders.push(newOrder);
        localStorage.setItem('eventOrders', JSON.stringify(orders));

        console.log("Đã lưu đơn thành công:", newOrder);

        closeModals();
        const successModal = document.getElementById('success-modal');
        if(successModal) {
            successModal.classList.remove('hidden');
            successModal.style.display = 'flex';
        }
    } catch (error) {
        console.error("Lỗi khi lưu đơn hàng:", error);
        showError("Có lỗi xảy ra khi lưu đơn: " + error.message);
    }
}


let zoomHandler = null;

function enableZoom() {
    const viewport = document.getElementById('viewport');
    const container = document.getElementById('map-container');
    let scale = 0.6;

    // Reset lại style cho container về dạng sơ đồ
    container.style.transform = `scale(${scale})`;
    container.style.transformOrigin = "center top";
    container.style.transition = "transform 0.1s ease-out";
    
    // Định nghĩa hàm xử lý wheel
    zoomHandler = function(e) {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        scale = Math.min(Math.max(0.3, scale + delta), 3);
        
        const rect = viewport.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        container.style.transformOrigin = `${x}px ${y}px`;
        container.style.transform = `scale(${scale})`;
    };

    viewport.addEventListener('wheel', zoomHandler, { passive: false });
    console.log("Zoom enabled for diagram");
}

function disableZoom() {
    const viewport = document.getElementById('viewport');
    const container = document.getElementById('map-container');

    // Gỡ bỏ sự kiện zoom nếu có
    if (zoomHandler) {
        viewport.removeEventListener('wheel', zoomHandler);
        zoomHandler = null;
    }

    // Trả container về trạng thái bình thường để lướt (Scroll)
    container.style.transform = "none";
    container.style.transformOrigin = "unset";
    container.style.transition = "none";
    console.log("Zoom disabled for ticket list");
}

// --- HÀM THÔNG BÁO LỖI (Dùng cho error-modal trong HTML) ---
function showError(msg) {
    const modal = document.getElementById('error-modal');
    const message = document.getElementById('error-message');
    if(modal && message) {
        message.innerText = msg;
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

function closeErrorModal() {
    const modal = document.getElementById('error-modal');
    if(modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

// --- XỬ LÝ CLICK SƠ ĐỒ ---
function handleBlockClick(name, price) {
    // LUẬT: Chỉ được chọn 1 khu vực duy nhất
    if (cart.length > 0) {
        const currentArea = cart[0].name;
        if (currentArea !== name) {
            showError(`Bà đang chọn vé ở khu ${currentArea}. Vui lòng thanh toán hoặc xóa vé cũ trước khi chọn khu vực khác nhé!`);
            return;
        }
    }

    tempSelection = { name, price, qty: 1 };

    // Nếu đã chọn khu này rồi, bấm vào chỉ để chọn thêm số lượng
    if (cart.find(i => i.name === name)) {
        showQtySelection();
        return;
    }

    if (isFirstTime) {
        document.getElementById('warn-title').innerText = "KHU " + name;
        document.getElementById('warning-modal').style.display = 'flex';
        document.getElementById('warning-modal').classList.remove('hidden');
        isFirstTime = false;
    } else {
        showQtySelection();
    }
}

function showQtySelection() {
    closeModals();
    const qtyModal = document.getElementById('qty-modal');
    if(qtyModal) {
        qtyModal.style.display = 'flex';
        qtyModal.classList.remove('hidden');
        document.getElementById('qty-title').innerText = "CHỌN SỐ LƯỢNG: " + tempSelection.name;
        document.getElementById('qty-val').innerText = "1";
        tempSelection.qty = 1;
    }
}

function changeModalQty(delta) {
    tempSelection.qty = Math.max(1, tempSelection.qty + delta);
    document.getElementById('qty-val').innerText = tempSelection.qty;
}

function addTicketToCart() {
    // LUẬT: Tổng tối đa 10 vé
    const currentTotalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (currentTotalQty + tempSelection.qty > 10) {
        showError("Mỗi người chỉ được mua tối đa 10 vé thôi bà ơi!");
        return;
    }

    const existingItem = cart.find(i => i.name === tempSelection.name);
    if (existingItem) {
        existingItem.qty += tempSelection.qty;
    } else {
        cart.push({...tempSelection});
    }

    renderCart();
    closeModals();
}

function updateCart(name, delta) {
    let item = cart.find(i => i.name === name);
    if(item) {
        // Kiểm tra nếu tăng lên có quá 10 vé không
        const currentTotal = cart.reduce((sum, i) => sum + i.qty, 0);
        if (delta > 0 && currentTotal >= 10) {
            showError("Tối đa 10 vé thôi nhé!");
            return;
        }
        
        item.qty += delta;
        if(item.qty <= 0) cart = cart.filter(i => i.name !== name);
    }
    renderCart();
}

function renderCart() {
    const list = document.getElementById('cart-list');
    const priceListDefault = document.getElementById('price-list-default');
    const totalQtyDisplay = document.getElementById('total-qty-display');
    let total = 0;

    // --- PHẦN 1: CẬP NHẬT GIAO DIỆN BÊN PHẢI (CART) ---
    if (cart.length === 0) {
        list.innerHTML = `<p class="text-gray-700 text-xs italic text-center py-20 uppercase font-bold">Chưa có vé nào</p>`;
        list.classList.add('hidden');
        priceListDefault.classList.remove('hidden');
        document.getElementById('btn-next').classList.add('hidden');
        totalQtyDisplay.classList.add('hidden');
        isFirstTime = true;
    } else {
        priceListDefault.classList.add('hidden');
        list.classList.remove('hidden');
        list.innerHTML = cart.map(i => {
            total += i.price * i.qty;
            return `
            <div class="bg-white/5 p-5 rounded-xl flex justify-between items-center border border-white/5 mb-4">
                <div>
                    <p class="font-black text-sm uppercase text-white">${i.name}</p>
                    <p class="text-green-400 text-xs font-bold">${i.price.toLocaleString()} đ</p>
                </div>
                <div class="flex items-center gap-4 bg-black p-2 rounded-lg border border-white/10 font-bold text-white">
                    <button onclick="updateCart('${i.name}',-1)">-</button>
                    <span>${i.qty}</span>
                    <button onclick="updateCart('${i.name}',1)">+</button>
                </div>
            </div>`;
        }).join('');
        
        document.getElementById('btn-next').classList.remove('hidden');
        document.getElementById('btn-total-val').innerText = total.toLocaleString();
        totalQtyDisplay.classList.remove('hidden');
        document.getElementById('qty-count').innerText = "x" + cart.reduce((a, b) => a + b.qty, 0);
    }
    
    // Cập nhật text tổng tiền ở sidebar
    const totalElem = document.getElementById('total-price');
    if(totalElem) totalElem.innerText = total.toLocaleString() + " đ";

    // --- PHẦN 2: ÉP SỐ LIỆU SANG BÊN TRÁI (TICKET LIST) ---
    // Bước A: Reset tất cả các số hiển thị bên trái về 0 trước
    document.querySelectorAll('[id^="qty-left-"]').forEach(el => {
        el.innerText = "0";
    });

    // Bước B: Duyệt qua giỏ hàng, khu nào có vé thì ghi đè số lượng lên bên trái
    cart.forEach(item => {
        // Chuyển tên khu thành ID chuẩn (Ví dụ: "VIP ZONE" thành "qty-left-VIP-ZONE")
        const leftId = "qty-left-" + item.name.replace(/\s+/g, '-');
        const leftQtyDisplay = document.getElementById(leftId);
        if (leftQtyDisplay) {
            leftQtyDisplay.innerText = item.qty;
        }
    });
}

// --- CHUYỂN STEP ---
function goToStep2() {
    // ƯU TIÊN 1: Lấy từ biến toàn cục đã load từ Sheet thành công ở initMap
    // ƯU TIÊN 2: Nếu chưa có thì mới tìm trong MAP_TEMPLATES hoặc mặc định ID 21
    const eventId = new URLSearchParams(window.location.search).get('id') || '21';
    const config = currentEventConfig || (typeof MAP_TEMPLATES !== 'undefined' ? MAP_TEMPLATES[eventId] : null);

    if (!config) {
        console.error("Không tìm thấy config để hiện tên sự kiện!");
        return;
    }

    // Gán tên sự kiện vào tiêu đề của Step 2 (Chỗ 'Đơn hàng của bạn')
    const step2Title = document.querySelector('#step-2 h2') || document.querySelector('.step-2-header');
    if(step2Title) {
        step2Title.innerText = config.eventName; // Ăn tên từ Sheet ở đây nè
    }

    // Chuyển màn hình
    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
    
    // Render danh sách vé đã chọn vào bảng thanh toán
    let totalAll = 0;
    const paymentItems = document.getElementById('payment-items');
    if (paymentItems) {
        paymentItems.innerHTML = cart.map(i => {
            totalAll += i.price * i.qty;
            return `
                <div class="flex justify-between font-black uppercase text-[11px] mb-2 text-green">
                    <span>${i.name} x ${i.qty}</span>
                    <span class="text-green-500">${(i.price * i.qty).toLocaleString()} đ</span>
                </div>`;
        }).join('');
    }

    const payTotal = document.getElementById('pay-total');
    if (payTotal) payTotal.innerText = totalAll.toLocaleString() + " đ";
    
    startTimer();
}

// Sửa lại hàm này để khớp với nút quay lại ở Step 2 trong HTML của bà
function backToStep1() {
    const cancelModal = document.getElementById('cancel-modal');
    if(cancelModal) {
        closeModals(); // Đóng các modal khác nếu đang mở
        cancelModal.classList.remove('hidden');
        cancelModal.style.setProperty('display', 'flex', 'important');
    }
}

function confirmCancelOrder() {
    cart = [];
    renderCart(); 
    isFirstTime = true;
    closeModals();
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-1').classList.remove('hidden');
}

// --- THANH TOÁN ---
function selectPay(element) {
    document.querySelectorAll('.pay-method').forEach(el => {
        el.classList.remove('active');
        const check = el.querySelector('.fa-circle-check');
        if (check) check.remove();
    });

    element.classList.add('active');
    const checkIcon = document.createElement('i');
    checkIcon.className = 'fa-solid fa-circle-check ml-auto text-green-500';
    element.appendChild(checkIcon);

    currentMethod = element.querySelector('span').innerText.trim();
}

function handleFinalCheckout() {
    // PHẢI ĐIỀN ĐỦ THÔNG TIN MỚI CHO ĐI TIẾP
    if (!validateStep2()) return;

    closeModals();
    const method = currentMethod.toUpperCase();

    if (method.includes("EVENTPAY")) {
        showInvoice();
    } 
    else if (method.includes("VISA") || method.includes("THẺ")) {
        const visaModal = document.getElementById('visa-modal');
        if(visaModal) {
            visaModal.classList.remove('hidden');
            visaModal.style.setProperty('display', 'flex', 'important');
        }
    } 
    else {
        setupQRModal(currentMethod);
    }
}

function validateStep2() {
    // Lấy các input từ bảng câu hỏi
    const inputs = document.querySelectorAll('#step-2 .q-input');
    const fullName = inputs[0].value.trim();
    const phone = inputs[1].value.trim();
    const email = inputs[2].value.trim();
    const isAgreed = document.getElementById('c').checked;

    // Kiểm tra từng trường một
    if (!fullName) {
        showError("Bà ơi, nhập Họ và tên để tụi tui in lên vé nhé!");
        return false;
    }
    if (!phone || phone.length < 10) {
        showError("Số điện thoại không hợp lệ nè, bà kiểm tra lại nha.");
        return false;
    }
    // Regex kiểm tra email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError("Email có vẻ sai sai, bà nhập lại chính xác để nhận vé điện tử nhé!");
        return false;
    }
    if (!isAgreed) {
        showError("Bà cần tích chọn đồng ý với điều khoản tham gia để tiếp tục thanh toán.");
        return false;
    }

    return true;
}

function setupQRModal(method) {
    const modal = document.getElementById('qr-modal');
    const title = document.getElementById('qr-title');
    const instructions = document.getElementById('qr-instructions');
    
    if(modal) {
        closeModals();
        modal.classList.remove('hidden');
        modal.style.setProperty('display', 'flex', 'important');
        
        if (method.toUpperCase().includes("ZALO")) {
            title.innerText = "THANH TOÁN ZALOPAY";
            instructions.innerHTML = `<p>1. Mở ứng dụng Zalopay</p><p>2. Quét mã QR để thanh toán</p>`;
        } else {
            title.innerText = "VIETQR NGÂN HÀNG";
            instructions.innerHTML = `<p>Quét mã VietQR để thanh toán: <strong>${document.getElementById('pay-total').innerText}</strong></p>`;
        }
    }
}

// Hàm này để nhảy về dashboard khi bấm nút OK trên modal
function redirectToDashboard() {
    window.location.href = "dashboard.html";
}

// Cập nhật lại hàm closeModals để nó biết đóng cả cái success-modal nếu cần
function closeModals() {
    const modalIds = ['visa-modal', 'qr-modal', 'invoice-modal', 'warning-modal', 'qty-modal', 'cancel-modal', 'error-modal', 'success-modal'];
    modalIds.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.classList.add('hidden');
            el.style.display = 'none';
        }
    });
}

function closeVisaModal() { closeModals(); }
function closeQRModal() { closeModals(); }
function closeCancelModal() { closeModals(); }

function startTimer() {
    let time = 15 * 60;
    const t = setInterval(() => {
        let m = Math.floor(time / 60), s = time % 60;
        const timerEl = document.getElementById('timer');
        if(timerEl) timerEl.innerText = `${m} : ${s < 10 ? '0'+s : s}`;
        if(time <= 0) { clearInterval(t); location.reload(); }
        time--;
    }, 1000);
}
