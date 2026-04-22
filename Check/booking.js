let cart = [];
let tempSelection = null;
let isFirstTime = true;
let scale = 1;
let currentMethod = 'ElysiumPay';
let globalTimeLeft = 15 * 60; 
let globalTimerInterval = null; 
let currentOrderCode = ""; 
let currentEventConfig = null;

const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbx3vQyakJkFfJxkP5XAQ8fQkjmt5lnls2n4N3zjrEUL4JxYIzMumbGmPIZwOTzbjgO-OA/exec';

const MAP_TEMPLATES = {
    // SƠ ĐỒ ID 21
    21: {
        eventName: "CONCERT VÉ VỀ THANH XUÂN",
        hasDiagram: false,
        time: "20:00 - 23:00, 25/04/2026",
        location: "Đường Trần Hữu Dực, Phường Từ Liêm, Thành phố Hà Nội",
        currency: "đ",
        priceList: [
            { name: 'PHỐ XƯA 1', price: 5000000 },
            { name: 'PHỐ XƯA 2', price: 5000000 },
            { name: 'XE ĐẠP ƠI 1', price: 4000000 },
            { name: 'XE ĐẠP ƠI 2', price: 4000000 },
            { name: 'XE ĐẠP ƠI 3', price: 4000000 },
            { name: 'XE ĐẠP ƠI 4', price: 4000000 },
            { name: 'XE ĐẠP ƠI 5', price: 4000000 },
            { name: 'XE ĐẠP ƠI 6', price: 4000000 },
            { name: 'XE ĐẠP ƠI 7', price: 4000000 },
            { name: 'XE ĐẠP ƠI 8', price: 4000000 },
            { name: 'THƯ TÌNH 1', price: 3000000 },
            { name: 'THƯ TÌNH 2', price: 3000000 },
            { name: 'THƯ TÌNH 3', price: 3000000 },
            { name: 'THƯ TÌNH 4', price: 3000000 },
            { name: 'THƯ TÌNH 5', price: 3000000 },
            { name: 'ĐĨA CD 1', price: 2500000 },
            { name: 'ĐĨA CD 2', price: 2500000 },
            { name: 'ĐĨA CD 5', price: 2500000 },
            { name: 'ĐĨA CD 6', price: 2500000 },
            { name: 'ĐĨA CD 7', price: 2500000 },
            { name: 'ĐĨA CD 8', price: 2500000 },
            { name: 'ĐĨA CD 9', price: 2500000 },
            { name: 'ĐĨA CD 10', price: 2500000 },
            { name: 'BƯU HOA 1', price: 2000000 },
            { name: 'BƯU HOA 2', price: 2000000 },
            { name: 'BƯU HOA 3', price: 2000000 },
            { name: 'BƯU HOA 4', price: 2000000 },
            { name: 'BƯU HOA 5', price: 2000000 },
            { name: 'CASSETTE 1', price: 1500000 },
            { name: 'CASSETTE 2', price: 1500000 },
            { name: 'CASSETTE 3', price: 1500000 },
            { name: 'CASSETTE 4', price: 1500000 },
            { name: 'CASSETTE 5', price: 1500000 },
            { name: 'CASSETTE 6', price: 1500000 },
            { name: 'CASSETTE 7', price: 1500000 },
            { name: 'CASSETTE 8', price: 1500000 },
            { name: 'CASSETTE 9', price: 1500000 },
            { name: 'CASSETTE 10', price: 1500000 },
            { name: 'GẤU MISA 1', price: 1000000 },
            { name: 'GẤU MISA 2', price: 1000000 },
            { name: 'GẤU MISA 3', price: 1000000 },
            { name: 'GẤU MISA 4', price: 1000000 },
            { name: 'GẤU MISA 5', price: 1000000 },
            { name: 'GẤU MISA 6', price: 1000000 }
        ],
    },

    // SƠ ĐỒ ID 26
    26: {
    eventName: "BTS WORLD TOUR ARIRANG",
    hasDiagram: true,
    time: "19:00 - 18/05/2026",
    location: "SVĐ QUỐC GIA MỸ ĐÌNH, HÀ NỘI",
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

        <div class="flex flex-col items-center gap-10 mx-auto">
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
        </div>

        <div class="grid grid-cols-3 gap-8 w-full max-w-5xl mx-auto mt-10">
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
                
                <div class="block p-6 text-center rounded-2xl font-bold text-xs h-20 flex items-center justify-center cursor-pointer" 
                     style="background-color: #DC143C; color: white;" 
                     onclick="handleBlockClick('SUR ALTA', 396000)">SUR ALTA</div>
                
                <div class="w-full h-16 flex items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl bg-zinc-900/30">
                    <span class="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Control Tower</span>
                </div>
            </div>

            <div class="flex flex-col gap-4">
                <div class="block p-6 text-center rounded-2xl font-bold text-xs h-24 flex items-center justify-center cursor-pointer" 
                     style="background-color: #6A5ACD; color: white;" 
                     onclick="handleBlockClick('ORIENTAL BAJA', 961000)">ORIENTAL BAJA</div>
                
                <div class="block p-6 text-center rounded-2xl font-bold text-xs h-24 flex items-center justify-center cursor-pointer" 
                     style="background-color: #3F51B5; color: white;" 
                     onclick="handleBlockClick('ORIENTAL ALTA', 588000)">ORIENTAL ALTA</div>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-6 w-full max-w-2xl pb-10 mx-auto mt-4">
            <div class="flex flex-col gap-3">
                <div class="block py-4 text-center rounded-xl font-bold text-xs cursor-pointer" 
                     style="background-color: #FF7F50; color: white;" 
                     onclick="handleBlockClick('NORTE BAJA', 300000)">NORTE BAJA</div>
                
                <div class="block py-4 text-center rounded-xl font-bold text-xs cursor-pointer" 
                     style="background-color: #D2691E; color: white;" 
                     onclick="handleBlockClick('NORTE ALTA', 396000)">NORTE ALTA</div>
            </div>
            
            <div class="flex flex-col gap-3">
                <div class="block py-4 text-center rounded-xl font-bold text-xs cursor-pointer" 
                     style="background-color: #483D8B; color: white;" 
                     onclick="handleBlockClick('ORIENTAL NORTE ALTA', 396000)">OR. NORTE ALTA</div>
                
                <div class="block py-4 text-center rounded-xl font-bold text-xs cursor-pointer" 
                     style="background-color: #2F4F4F; color: white;" 
                     onclick="handleBlockClick('ORIENTAL SUR ALTA', 396000)">OR. SUR ALTA</div>
            </div>
        </div>`
},

    // SƠ ĐỒ ID 48
    48: {
        eventName: "CONCERT QUỐC GIA 30/4-1/5",
        hasDiagram: true,
        time: "20:00 - 22:30, 30/04/2026",
        location: "QUẢNG TRƯỜNG BA ĐÌNH, HÀ NỘI",
        currency: "VND",
        priceList: [
            { name: 'HÀO KHÍ ĐÔNG ĐÔ', price: 3500000 },
            { name: 'TINH HOA', price: 1200000 },
            { name: 'GA KÝ ỨC', price: 800000 },
            { name: 'TRƯỜNG SƠN BAJA', price: 1000000 },
            { name: 'TRƯỜNG SƠN ALTA', price: 700000 },
            { name: 'CỬU LONG BAJA', price: 950000 },
            { name: 'CỬU LONG ALTA', price: 600000 },
            { name: 'PHÙ SA', price: 1800000 },
            { name: 'CHÂN TRỜI', price: 450000 }
        ],
        html: `
<div style="color: #ffffff; font-family: 'Inter', 'Segoe UI', sans-serif; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; min-height: 800px; overflow-x: hidden;">
    
    <div style="margin-bottom: 30px; text-align: center;">
        <div style="background-color: rgba(255, 60, 65, 0.1); border: 1.5px solid #ff3c41; color: #ff3c41; font-size: 18px; font-weight: 800; text-transform: uppercase; padding: 8px 25px; border-radius: 50px; letter-spacing: 3px; box-shadow: 0 0 15px rgba(255, 60, 65, 0.3);">
            CONCERT QUỐC GIA - RẠNG RỠ VIỆT NAM
        </div>
    </div>

    <div style="width: 100%; max-width: 950px; display: flex; flex-direction: column; align-items: center; position: relative; perspective: 2000px;">
        
        <div style="margin-bottom: 10px; transform: rotateX(15deg) translateZ(10px); position: relative; z-index: 10;">
            <div style="width: 340px; height: 90px; background-color: #1a1e26; border-radius: 10px 10px 50% 50%; border: 2px solid #333; display: flex; justify-content: center; align-items: flex-start; padding-top: 12px; box-shadow: 0 15px 35px rgba(0,0,0,0.8);">
                <div style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; color: rgba(255,255,255,0.8); border-bottom: 2px solid #555; padding-bottom: 3px;">SÂN KHẤU CHÍNH</div>
            </div>
        </div>

        <div style="width: 100%; display: flex; flex-direction: column; align-items: center; transform: rotateX(8deg); transform-style: preserve-3d;">
            
            <div style="display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: -10px; position: relative; z-index: 5;">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="width: 55px; height: 30px; background-color: #37474f; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 9px; color: rgba(255,255,255,0.6); border: 1px solid #444;">LỐI RA</div>
                    <div style="width: 55px; height: 30px; background-color: #37474f; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 9px; color: rgba(255,255,255,0.6); border: 1px solid #444;">DỊCH VỤ</div>
                </div>
                
                <div onclick="handleBlockClick('TINH HOA (TRÁI)', 1200000)" style="width: 180px; height: 130px; background: linear-gradient(180deg, #81d4fa, #4fc3f7); border-radius: 60% 0% 0% 60% / 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: pointer; box-shadow: 0 12px 25px rgba(0,0,0,0.5); color: #000;">
                    <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">TINH HOA</div>
                </div>

                <div onclick="handleBlockClick('HÀO KHÍ ĐÔNG ĐÔ', 3500000)" style="width: 220px; height: 110px; background: linear-gradient(180deg, #ec407a, #d81b60); border-radius: 50% / 30%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: pointer; box-shadow: 0 10px 25px rgba(236, 64, 122, 0.4); border: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">HÀO KHÍ ĐÔNG ĐÔ</div>
                </div>

                <div onclick="handleBlockClick('TINH HOA (PHẢI)', 1200000)" style="width: 180px; height: 130px; background: linear-gradient(180deg, #81d4fa, #4fc3f7); border-radius: 0% 60% 60% 0% / 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: pointer; box-shadow: 0 12px 25px rgba(0,0,0,0.5); color: #000;">
                    <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">TINH HOA</div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="width: 55px; height: 30px; background-color: #37474f; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 9px; color: rgba(255,255,255,0.6); border: 1px solid #444;">DỊCH VỤ</div>
                    <div style="width: 55px; height: 30px; background-color: #37474f; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 9px; color: rgba(255,255,255,0.6); border: 1px solid #444;">LỐI RA</div>
                </div>
            </div>

            <div onclick="handleBlockClick('GA KÝ ỨC', 800000)" style="width: 620px; height: 35px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; margin-top: 10px; display: flex; justify-content: center; align-items: center; cursor: pointer;">
                <div style="font-weight: 700; font-size: 9px; letter-spacing: 2px; color: #90a4ae; text-transform: uppercase;">GA KÝ ỨC </div>
            </div>

            <div style="width: 100%; margin-top: 15px; display: flex; justify-content: center; align-items: flex-start; gap: 15px;">
                
                <div style="width: 170px; display: flex; flex-direction: column; gap: 10px; align-items: center;">
                    <div onclick="handleBlockClick('TRƯỜNG SƠN (ALTA)', 700000)" style="width: 100%; height: 110px; background: linear-gradient(180deg, #3f51b5, #303f9f); border-top: 3px solid rgba(255,255,255,0.2); border-radius: 10px 10px 25px 25px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.5);">
                        <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">TRƯỜNG SƠN (ALTA)</div>
                    </div>
                    <div onclick="handleBlockClick('TRƯỜNG SƠN (BAJA)', 1000000)" style="width: 100%; height: 90px; background: linear-gradient(180deg, #ff69b4, #e91e63); border-radius: 25px 25px 10px 10px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.5);">
                        <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">TRƯỜNG SƠN (BAJA)</div>
                    </div>
                </div>

                <div style="width: 480px; display: flex; flex-direction: column; gap: 15px; align-items: center;">
                    <div onclick="handleBlockClick('PHÙ SA (HẠ LƯU)', 1800000)" style="width: 100%; height: 40px; background: linear-gradient(180deg, #92d050, #76b93f); border-radius: 30px; display: flex; justify-content: center; align-items: center; box-shadow: 0 10px 20px rgba(0,0,0,0.5); color: #000; cursor: pointer;">
                        <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">PHÙ SA (HẠ LƯU)</div>
                    </div>
                    <div onclick="handleBlockClick('PHÙ SA (THƯỢNG NGUỒN)', 1800000)" style="width: 100%; height: 40px; background: linear-gradient(180deg, #f08080, #cd5c5c); border-radius: 30px; display: flex; justify-content: center; align-items: center; box-shadow: 0 10px 20px rgba(0,0,0,0.5); cursor: pointer;">
                        <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">PHÙ SA (THƯỢNG NGUỒN)</div>
                    </div>
                    
                    <div style="width: 100%; display: flex; gap: 15px; align-items: center; justify-content: center; margin-top: 5px;">
                        <div style="width: 110px; height: 55px; background-color: rgba(100,212,210,0.05); border: 1.5px dashed rgba(100,212,210,0.3); border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(100,212,210,0.6);">
                            <span style="font-size: 16px;">🎥</span>
                            <div style="font-weight: 800; font-size: 8px; color: white;">LIVE CAM (1)</div>
                        </div>
                        <div style="flex: 1; height: 55px; background-color: rgba(255,255,255,0.02); border: 1.5px dashed rgba(255,255,255,0.2); border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255,255,255,0.3);">
                            <div style="font-weight: 800; font-size: 10px; color: white;">TRẠM ĐIỀU PHỐI</div>
                            <div style="font-size: 7px;">KỸ THUẬT</div>
                        </div>
                        <div style="width: 110px; height: 55px; background-color: rgba(100,212,210,0.05); border: 1.5px dashed rgba(100,212,210,0.3); border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(100,212,210,0.6);">
                            <span style="font-size: 16px;">🎥</span>
                            <div style="font-weight: 800; font-size: 8px; color: white;">LIVE CAM (2)</div>
                        </div>
                    </div>
                </div>

                <div style="width: 170px; display: flex; flex-direction: column; gap: 10px; align-items: center;">
                    <div onclick="handleBlockClick('CỬU LONG (ALTA)', 600000)" style="width: 100%; height: 110px; background: linear-gradient(180deg, #6a5acd, #5c6bc0); border-top: 3px solid rgba(255,255,255,0.2); border-radius: 10px 10px 25px 25px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.5);">
                        <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">CỬU LONG (ALTA)</div>
                    </div>
                    <div onclick="handleBlockClick('CỬU LONG (BAJA)', 950000)" style="width: 100%; height: 90px; background: linear-gradient(180deg, #9c27b0, #7b1fa2); border-radius: 25px 25px 10px 10px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.5);">
                        <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">CỬU LONG (BAJA)</div>
                    </div>
                </div>
            </div>

            <div onclick="handleBlockClick('KHÁN ĐÀI CHÂN TRỜI', 450000)" style="width: 420px; height: 60px; background: linear-gradient(180deg, #ff9900, #e68a00); border-radius: 40px; margin-top: -20px; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: pointer; box-shadow: 0 8px 30px rgba(230, 138, 0, 0.4);">
                <div style="font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">KHÁN ĐÀI CHÂN TRỜI</div>
               
            </div>
        </div>
    </div>
</div>
`
    },

    // SƠ ĐỒ ID 53
    53: {
        eventName: "GREENGREEN CORTIS ",
        hasDiagram: true,
        time: "20:00 - 20/04/2026",
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

    // SƠ ĐỒ ID 174
    174: {
        eventName: "G-DRAGON WORLD TOUR",
        hasDiagram: true,
        time: "20:00 - 11/08/2026",
        location: "Vinhomes Ocean Park 3, Hưng Yên",
        currency: "đ",
        priceList: [
            { name: 'VIP', price: 8000000 },
            { name: 'PREMIUM', price: 6500000 },
            { name: 'SKY LOUNGE', price: 6000000 },
            { name: 'CAT 1A, 1B', price: 6000000 },
            { name: 'CAT 2A, 2B', price: 5000000 },
            { name: 'CAT 3A, 3B', price: 4000000 },
            { name: 'CAT 4A, 4B', price: 3800000 },
            { name: 'CAT 5A, 5B', price: 5000000 },
            { name: 'CAT 6A, 6B', price: 4000000 },
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


    52: {
    eventName: "OCEAN WHISPER 2026",
    hasDiagram: true,
    time: "08:00 - 16/05/2026",
    location: "LOTTE WORLD AQUARIUM HÀ NỘI",
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

// 1. DỮ LIỆU THÔ (RAW DATA)
const allEventsData = [
    { 
        id: 21, 
        title: "RAP VIỆT STAR", 
        prices: [
            { name: 'VVIP PRESIDENT', price: 8000000 }, 
            { name: 'CAT 1', price: 1000000 }
        ] 
    }
];

// 2. HÀM ĐÚC KHUÔN CẤU HÌNH 
function createEventConfig(sourceData) {
    return {
        eventName: sourceData.title || sourceData.eventName,
        hasDiagram: false,
        time: sourceData.time || "19:00 - 28/03/2026",
        location: sourceData.location || "",
        currency: "đ",
        priceList: (sourceData.prices || []).map(p => ({
            name: p.name,
            price: p.price,
            desc: p.desc || ""
        }))
    };
}

// 3. KHỞI TẠO ĐỐI TƯỢNG CONFIG
const eventConfigs = {};
allEventsData.forEach(item => {
    eventConfigs[item.id] = createEventConfig(item);
});

// 4. HÀM TẠO GIAO DIỆN DANH SÁCH VÉ
function generateTicketListHTML(config) {
    if (!config || !config.priceList || config.priceList.length === 0) {
        return `<div class="text-gray-400 text-center mt-10">Hiện chưa có thông tin giá vé.</div>`;
    }

    const theme = config.themeColor || "#26bc4e";
    const accent = config.accentColor || theme;

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
            min-height: 120px;      
            height: auto;
            display: flex;
            align-items: center; 
            background: rgba(24, 24, 27, 0.4); 
            border: 1px solid rgba(63, 63, 70, 0.4); 
            border-left: 6px solid ${theme} !important; 
            border-radius: 2px;
            padding: 0 20px;
            box-sizing: border-box;
        }

        .ticket-divider-container {
            margin-top: 64px;
            width: 100%;
            height: 1px;
            display: flex;
            align-items: center;
            overflow: hidden;
            opacity: 0.2; 
        }

        .dash-line {
            width: 100%;
            border-top: 2px dashed #ffffff; 
            height: 0;
        }

        .ticket-row, .ticket-row * {
            transition: none !important;
            transform: none !important;
        }

        .ticket-accent-text { color: ${accent}; }
        .ticket-theme-text { color: ${theme}; }
    </style>
    
    <div class="w-full flex flex-col bg-[#0a0a0a] text-white">
        <div class="sticky top-0 z-20 bg-[#0a0a0a] py-8 border-b border-zinc-800/30 px-[30px] flex justify-center">
            <div class="font-bold text-xl uppercase tracking-[0.4em]" style="color: ${theme}">Chọn vé</div>
        </div>

        <div class="ticket-scroll-container">
            <div class="ticket-content-wrapper p-8 space-y-12">
                ${config.priceList.map(t => {
                    const safeId = t.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
                    const currentQty = (typeof cart !== 'undefined') ? (cart.find(i => i.name === t.name)?.qty || 0) : 0;
                    
                    return `
                    <div class="ticket-row w-full">
                        <div class="flex justify-between items-center mb-6">
                            <div class="flex-1">
                                <h3 class="font-black text-white text-[20px] uppercase">${t.name}</h3>
                                <div class="font-black mt-1 text-[18px]" style="color: ${accent}">
                                    ${t.price.toLocaleString()} đ
                                </div>
                            </div>
                            
                            <div class="flex items-center bg-white rounded-full shrink-0 overflow-hidden">
                                <button class="w-10 h-10 flex items-center justify-center text-zinc-400 border-r border-zinc-100" 
                                        onclick="updateCart('${t.name}', -1)">－</button>
                                <span id="qty-${safeId}" class="w-10 h-10 flex items-center justify-center text-black font-bold">
                                    ${currentQty}
                                </span>
                                <button class="w-10 h-10 flex items-center justify-center" style="color: ${theme}" 
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

// ==========================================
// 1. KHỞI TẠO VÀ CẤU HÌNH CHÍNH
// ==========================================
async function initMap() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = (urlParams.get('id') || '21').toString();
    const selectedDate = urlParams.get('date');
    
    let config = null;

    // --- BƯỚC 1 & 2: LẤY CONFIG ---
    if (typeof MAP_TEMPLATES !== 'undefined' && MAP_TEMPLATES[eventId]) {
        config = MAP_TEMPLATES[eventId];
    } 

    if (!config) {
        try {
            const response = await fetch(SHEET_API_URL);
            const allEvents = await response.json();
            const sheetRow = allEvents.find(item => (item.id || item.ID || "").toString() === eventId);

            if (sheetRow) {
                config = {
                    eventName: sheetRow.title || sheetRow.eventName || "Sự kiện mới",
                    time: selectedDate || sheetRow.time || "Đang cập nhật",
                    location: sheetRow.location || "Đang cập nhật",
                    currency: "đ",
                    hasDiagram: false,
                    priceList: parsePriceList(sheetRow.priceList || "", sheetRow.ticketQuantity || "", sheetRow.ticketDetail || ""),
                    themeColor: "#26bc4e",
                    accentColor: "#26bc4e"
                };
            }
        } catch (error) { console.error("Lỗi Fetch:", error); }
    }

    if (!config) config = (typeof MAP_TEMPLATES !== 'undefined') ? MAP_TEMPLATES['21'] : null;
    if (!config) return; 

    currentEventConfig = config;

    // --- BƯỚC 3: KHAI BÁO CÁC PHẦN TỬ GIAO DIỆN ---
    const sidebarTitle = document.querySelector('.right-panel h2') || document.querySelector('aside h2');
    const sideTime = document.getElementById('side-time') || document.querySelector('.fa-calendar-days')?.parentElement;
    const sideLoc = document.getElementById('side-loc') || document.querySelector('.fa-location-dot')?.parentElement;
    const totalDisplay = document.querySelector('.total-price-class') || document.getElementById('total-price');

    // --- BƯỚC 4: ĐỔI MÀU THEO THEME ---
    const theme = config.themeColor || "#26bc4e";
    const accent = config.accentColor || theme;
    
    setTimeout(() => {
        document.querySelectorAll('.fa-calendar-days, .fa-location-dot').forEach(icon => {
            icon.style.setProperty('color', theme, 'important');
        });
        const textSelectors = '#side-time, .right-panel p, .fa-calendar-days + span, .fa-location-dot + span';
        document.querySelectorAll(textSelectors).forEach(el => {
            el.style.setProperty('color', theme, 'important');
        });
    }, 100);

    const totalLabel = document.querySelector('.total-label-class');
    if (totalLabel) totalLabel.style.color = theme;

    if (sidebarTitle) {
        sidebarTitle.innerText = config.eventName;
        sidebarTitle.style.color = theme; 
    }

    if (totalDisplay) totalDisplay.style.color = accent; 

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

    // --- BƯỚC 6: CẬP NHẬT BẢNG GIÁ ---
    renderPriceListSidebar(config);
}

// ==========================================
// 2. HÀM HỖ TRỢ XỬ LÝ DỮ LIỆU
// ==========================================
function parsePriceList(priceData, quantityData, detailData) {
    if (!priceData) return [];
    if (Array.isArray(priceData)) return priceData;

    try {
        const orders = JSON.parse(localStorage.getItem('eventOrders')) || [];
        const quantities = quantityData ? quantityData.split(',').map(q => q.trim()) : [];
        const details = detailData ? detailData.split('|').map(d => d.trim()) : [];
        const pricesRaw = priceData.split(/,|\n/).filter(p => p.trim() !== "");

        return pricesRaw.map((item, index) => {
            const parts = item.split(':');
            if (parts.length < 2) return null;

            const name = parts[0].trim();
            const priceRaw = parts[1].toString().replace(/\D/g, '');
            const price = parseInt(priceRaw) || 0;

            // --- XỬ LÝ SỐ VÉ TỔNG ---
            let totalStock = (quantities[index] === undefined || quantities[index] === "") ? 1000 : parseInt(quantities[index]);
            
            // --- TÍNH SỐ VÉ ĐÃ BÁN ---
            const soldCount = orders
                .filter(order => order.event === currentEventConfig?.eventName)
                .reduce((sum, order) => {
                    const ticket = order.tickets.find(t => t.name === name);
                    return sum + (ticket ? ticket.qty : 0);
                }, 0);

            let finalStock = totalStock - soldCount;

            return {
                name: name,
                price: price,
                stock: finalStock, 
                desc: details[index] || ""
            };
        }).filter(item => item !== null);

    } catch (e) {
        console.error("Lỗi parse giá vé:", e);
        return [];
    }
}

// ==========================================
// 3. GIAO DIỆN VÀ LOGIC HIỂN THỊ (UI & ZOOM)
// ==========================================
function renderPriceListSidebar(config) {
    const theme = config.themeColor || "#26bc4e"; 
    const accent = config.accentColor || theme;
    const priceListDiv = document.querySelector('#price-list-default .space-y-4') || document.getElementById('ticket-list-container');
    
    if (!priceListDiv) return;

    if (config.priceList && config.priceList.length > 0) {
        priceListDiv.innerHTML = config.priceList.map(item => {
            const safeName = item.name.replace(/'/g, "\\'"); 
            return `
                <div class="flex justify-between items-center group cursor-pointer p-2 hover:bg-white/5 rounded-lg" 
                     onclick="handleBlockClick('${safeName}', ${item.price})">
                    <span class="text-[11px] font-bold text-gray-300 transition uppercase flex-1"
                          onmouseover="this.style.color='${theme}'" 
                          onmouseout="this.style.color=''">
                        ${item.name}
                    </span>
                    <span class="text-[11px] font-bold ml-2" style="color: ${accent}">
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
    let isDragging = false;
    let startX, startY;

    container.style.transformOrigin = "center center";
    container.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;

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

    viewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        viewport.style.cursor = 'grabbing'; 
        startX = e.clientX - pointX;
        startY = e.clientY - pointY;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        pointX = e.clientX - startX;
        pointY = e.clientY - startY;
        container.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        viewport.style.cursor = 'grab'; 
    });

    viewport.style.cursor = 'grab';
}

// ==========================================
// 4. LOGIC THANH TOÁN VÀ HÓA ĐƠN 
// ==========================================
function showInvoice() {
    const qrModal = document.getElementById('qr-modal');
    if (qrModal) {
        qrModal.classList.add('hidden');
        qrModal.style.display = 'none';
    }

    const invModal = document.getElementById('invoice-modal');
    if (!invModal) return;
    invModal.classList.remove('hidden');
    invModal.style.display = 'flex';

    document.getElementById('inv-user-name').innerText = document.getElementById('checkout-name')?.value || "KHÁCH HÀNG";
    document.getElementById('inv-user-email').innerText = document.getElementById('checkout-email')?.value || "---";
    document.getElementById('inv-user-phone').innerText = document.getElementById('checkout-phone')?.value || "---";

    const eventId = new URLSearchParams(window.location.search).get('id') || '21';
    const config = currentEventConfig || (typeof MAP_TEMPLATES !== 'undefined' ? MAP_TEMPLATES[eventId] : null);
    
    if (config) {
        document.getElementById('inv-event-name').innerText = config.eventName;
        document.getElementById('inv-event-time').innerText = config.time;
        document.getElementById('inv-event-loc').innerText = config.location;
    }

    const seatNames = cart.map(item => item.name).join(', ');
    document.getElementById('inv-seats').innerText = seatNames || "Chưa chọn vị trí";

    const totalQty = cart.reduce((a, b) => a + (Number(b.qty) || 1), 0);
    document.getElementById('inv-qty').innerText = 'x' + totalQty;

    const finalTotal = document.getElementById('pay-total')?.innerText || "0 đ";
    document.getElementById('inv-total').innerText = finalTotal;

    const now = new Date();
    document.getElementById('inv-order-time').innerText = now.toLocaleString('vi-VN');
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
            location: config.location,
            eventTime: config.time,
            tickets: [...cart], 
            total: document.getElementById('pay-total') ? document.getElementById('pay-total').innerText : "0đ",
            time: now.toLocaleString('vi-VN'),
            status: "Thành công"
            ,createdAt: now.getTime()
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

// Khởi chạy khi trang tải xong
window.onload = function() {
    initMap();
};


// --- HÀM THÔNG BÁO LỖI  ---
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
    if (cart.length > 0) {
        const currentArea = cart[0].name;
        if (currentArea !== name) {
            showError(`Bà đang chọn vé ở khu ${currentArea}. Vui lòng thanh toán hoặc xóa vé cũ trước khi chọn khu vực khác nhé!`);
            return;
        }
    }

    tempSelection = { name, price, qty: 1 };
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
    // 1. Kiểm tra giới hạn
    const currentTotalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (currentTotalQty + tempSelection.qty > 10) {
        showError("Mỗi người chỉ được mua tối đa 10 vé thôi bà ơi!");
        return;
    }
    // 2. Kiểm tra tồn kho
    const ticketInConfig = currentEventConfig.priceList.find(p => p.name === tempSelection.name);
    if (ticketInConfig && tempSelection.qty > ticketInConfig.stock) {
        showError(`Rất tiếc, hạng vé này chỉ còn lại ${ticketInConfig.stock} vé thôi!`);
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
    const theme = currentEventConfig?.themeColor || "#26bc4e";

    if (cart.length === 0) {
        list.innerHTML = `<p class="text-gray-700 text-xs italic text-center py-20 uppercase font-bold">Chưa có vé nào</p>`;
        list.classList.add('hidden');
        priceListDefault.classList.remove('hidden');
        
        const btnNext = document.getElementById('btn-next');
        if(btnNext) btnNext.classList.add('hidden');
        
        if(totalQtyDisplay) totalQtyDisplay.classList.add('hidden');
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
                    <p class="text-xs font-bold" style="color: ${theme}">${i.price.toLocaleString()} đ</p>
                </div>
                <div class="flex items-center gap-4 bg-black p-2 rounded-lg border border-white/10 font-bold text-white">
                    <button onclick="updateCart('${i.name}', -1)" class="hover:text-gray-400">-</button>
                    <span>${i.qty}</span>
                    <button onclick="updateCart('${i.name}', 1)" class="hover:text-gray-400" style="color: ${theme}">+</button>
                </div>
            </div>`;
        }).join('');
        
        const btnNext = document.getElementById('btn-next');
        if(btnNext) {
            btnNext.classList.remove('hidden');
            btnNext.style.backgroundColor = theme;
        }

        const btnTotalVal = document.getElementById('btn-total-val');
        if(btnTotalVal) btnTotalVal.innerText = total.toLocaleString();

        if(totalQtyDisplay) {
            totalQtyDisplay.classList.remove('hidden');
            const qtyCount = document.getElementById('qty-count');
            if(qtyCount) qtyCount.innerText = "x" + cart.reduce((a, b) => a + b.qty, 0);
        }
    }
    
    const totalElem = document.getElementById('total-price');
    if(totalElem) {
        totalElem.innerText = total.toLocaleString() + " đ";
        totalElem.style.color = theme;
    }

    document.querySelectorAll('[id^="qty-left-"]').forEach(el => {
        el.innerText = "0";
    });

    cart.forEach(item => {
        const leftId = "qty-left-" + item.name.replace(/\s+/g, '-');
        const leftQtyDisplay = document.getElementById(leftId);
        if (leftQtyDisplay) {
            leftQtyDisplay.innerText = item.qty;
        }
    });
}

// --- CHUYỂN STEP ---
function goToStep2() {
    const eventId = new URLSearchParams(window.location.search).get('id') || '21';
    const config = currentEventConfig || (typeof MAP_TEMPLATES !== 'undefined' ? MAP_TEMPLATES[eventId] : null);

    if (!config) {
        console.error("Không tìm thấy config để hiện tên sự kiện!");
        return;
    }

    const step2Title = document.querySelector('#step-2 h2') || document.querySelector('.step-2-header');
    if(step2Title) {
        step2Title.innerText = config.eventName; 
    }

    // Chuyển màn hình
    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
    
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
    
    startGlobalTimer();
}


function backToStep1() {
    const cancelModal = document.getElementById('cancel-modal');
    if(cancelModal) {
        closeModals();
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
    // Xóa active cũ
    document.querySelectorAll('.pay-method').forEach(el => {
        el.classList.remove('active');
        const check = el.querySelector('.fa-circle-check');
        if (check) check.remove();
    });

    element.classList.add('active');
    const checkIcon = document.createElement('i');
    checkIcon.className = 'fa-solid fa-circle-check ml-auto text-green-500';
    element.appendChild(checkIcon);

    currentMethod = element.getAttribute('data-method') || element.querySelector('span').innerText.trim();
    console.log("Phương thức đã chọn:", currentMethod);
}

function handleFinalCheckout() {
    if (!validateStep2()) return;

    closeModals();
    const method = currentMethod.toUpperCase();

    console.log("Đang xử lý thanh toán cho:", method);

    if (method.includes("ELYSIUMPAY")) {
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
    const inputs = document.querySelectorAll('#step-2 .q-input');
    const fullName = inputs[0].value.trim();
    const phone = inputs[1].value.trim();
    const email = inputs[2].value.trim();
    const isAgreed = document.getElementById('c').checked;

    if (!fullName) {
        showError("Nhập Họ và tên để tụi tui in lên vé nhé!");
        return false;
    }
    if (!phone || phone.length < 10) {
        showError("Số điện thoại không hợp lệ nè, kiểm tra lại nha.");
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError("Email có vẻ sai sai, nhập lại chính xác để nhận vé điện tử nhé!");
        return false;
    }
    if (!isAgreed) {
        showError("Cần tích chọn đồng ý với điều khoản tham gia để tiếp tục thanh toán.");
        return false;
    }

    return true;
}

function setupQRModal(method) {
    const modal = document.getElementById('qr-modal');
    const qrImg = document.getElementById('qr-image-main');
    const amountDisplay = document.getElementById('qr-amount-display');
    const title = document.getElementById('qr-title');
    const vietqrTabs = document.getElementById('vietqr-tabs');
    const bankContent = document.getElementById('bank-content');
    
    if(modal) {
        closeModals();
        modal.classList.remove('hidden');
        modal.style.setProperty('display', 'flex', 'important');
        
        // 1. Lấy số tiền
        const rawAmount = document.getElementById('pay-total').innerText.replace(/\D/g, '');
        const amount = parseInt(rawAmount) || 0;
        amountDisplay.innerText = amount.toLocaleString() + " đ";
        
        // 2. Tạo nội dung chuyển khoản ngẫu nhiên
        const orderInfo = "TKB" + Math.floor(100000 + Math.random() * 899999);
        if(bankContent) bankContent.innerText = orderInfo;

        const isZalo = method.toUpperCase().includes("ZALO");

        if (isZalo) {
            title.innerText = "Thanh toán bằng ZaloPay";
            qrImg.src = "zalo.png";
            vietqrTabs.classList.add('hidden'); 
            switchTab('qr'); 
            renderInstructions('zalo');
        } else {
            title.innerText = "Thanh toán bằng VietQR";
            vietqrTabs.classList.remove('hidden'); 
            switchTab('qr');
            
            const bankId = "MB"; 
            const accountNo = "0378217462"; 
            qrImg.src = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(orderInfo)}`;
            renderInstructions('vietqr'); 
        }

        const modalTimer = document.getElementById('qr-countdown');
    if (modalTimer) modalTimer.innerText = formatTime(globalTimeLeft);
    }
}

function renderInstructions(mode) {
    const list = document.getElementById('instr-list');
    if(!list) return;

    const steps = mode === 'zalo' ? [
        "Mở ứng dụng <strong>ZaloPay</strong> trên điện thoại",
        "Chọn biểu tượng <strong>Quét mã</strong>",
        "Quét mã QR ở trang này",
        "Xác nhận thanh toán trên ứng dụng"
    ] : [
        "Mở ứng dụng <strong>Ngân hàng</strong> trên điện thoại",
        "Chọn tính năng <strong>Quét mã QR</strong> hoặc <strong>Chuyển tiền</strong>",
        "Quét mã hoặc nhập đúng thông tin bên cạnh",
        "Thực hiện thanh toán và chờ kết quả"
    ];

    list.innerHTML = steps.map((s, i) => `
        <li class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">${i+1}</span>
            <p class="text-sm text-gray-600">${s}</p>
        </li>
    `).join('');
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Đã sao chép: " + text);
    });
}

// Hàm đổi Tab
function switchTab(type) {
    const tabQr = document.getElementById('tab-qr');
    const tabBank = document.getElementById('tab-bank');
    const viewQr = document.getElementById('view-qr');
    const viewBank = document.getElementById('view-bank');
    const instrTitle = document.getElementById('instr-title');

    if (type === 'qr') {
        tabQr.className = "flex-1 py-3 text-sm font-bold border-b-2 border-green-500 text-green-600";
        tabBank.className = "flex-1 py-3 text-sm font-bold border-b-2 border-transparent text-gray-500";
        viewQr.classList.remove('hidden');
        viewBank.classList.add('hidden');
        instrTitle.innerText = "Quét mã QR để thanh toán";
    } else {
        tabQr.className = "flex-1 py-3 text-sm font-bold border-b-2 border-transparent text-gray-500";
        tabBank.className = "flex-1 py-3 text-sm font-bold border-b-2 border-green-500 text-green-600";
        viewQr.classList.add('hidden');
        viewBank.classList.remove('hidden');
        instrTitle.innerText = "Chuyển khoản ngân hàng";
    }
}


function redirectToDashboard() {
    window.location.href = "dashboard.html";
}

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

function startGlobalTimer() {

    if (globalTimerInterval) clearInterval(globalTimerInterval);

    globalTimerInterval = setInterval(() => {
        if (globalTimeLeft <= 0) {
            clearInterval(globalTimerInterval);
            alert("Hết thời gian giữ vé!");
            location.reload();
            return;
        }

        globalTimeLeft--;

        const mainTimer = document.getElementById('timer');
        if (mainTimer) mainTimer.innerText = formatTime(globalTimeLeft);

        const modalTimer = document.getElementById('qr-countdown');
        if (modalTimer) modalTimer.innerText = formatTime(globalTimeLeft);

    }, 1000);
}

function formatTime(seconds) {
    let m = Math.floor(seconds / 60);
    let s = seconds % 60;
    return `${m} : ${s < 10 ? '0' + s : s}`;
}