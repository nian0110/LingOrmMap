// 初始化地圖
const map = L.map('map').setView([25.058707, 121.539112], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// 將每條公車路線分組的變數
let routes = {};

// 公車路線顏色設定（使用顏色號和顏色名稱）
const busRoutes = [
    { number: '281', color_number: '#007BFF', lingorm: 'LingOrm' }, // 藍色
    { number: '306', color_number: '#28A745', lingorm: 'LingOrm' },  // 紅色
    { number: '265', color_number: '#FF4136', lingorm: 'Ling' },  // 紅色
    { number: '645', color_number: '#FF851B', lingorm: 'Ling' }, // 黃色
    { number: '270', color_number: '#6F42C1', lingorm: 'Orm' }, // 黃色
    { number: '12', color_number: '#17A2B8', lingorm: 'Orm' } // 藍色
];

// 儲存每條路線的控制和 marker
const routeLayers = {};

// 動態生成 checkbox
const routeOptionsDiv = document.getElementById('route-options');
busRoutes.forEach(route => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `route${route.number}`;
    checkbox.checked = true;

    // 創建一個顏色顯示的 span
    const colorDisplay = document.createElement('span');
    colorDisplay.style.display = 'inline-block';
    colorDisplay.style.width = '15px'; // 設定寬度
    colorDisplay.style.height = '15px'; // 設定高度
    colorDisplay.style.backgroundColor = route.color_number; // 設定背景色
    colorDisplay.style.marginRight = '3px'; // 右邊距
    colorDisplay.style.borderRadius = '3px'; // 圓角邊框

    label.appendChild(checkbox);
    label.appendChild(colorDisplay);
    label.append(`${route.number}--${route.lingorm}`);
    routeOptionsDiv.appendChild(label);
    routeOptionsDiv.appendChild(document.createElement('br'));
});

// 添加「所有站牌」的 checkbox
const allStopsLabel = document.createElement('label');
const allStopsCheckbox = document.createElement('input');
allStopsCheckbox.type = 'checkbox';
allStopsCheckbox.id = 'all-stops';
allStopsCheckbox.checked = false; // 預設為顯示站牌

allStopsLabel.appendChild(allStopsCheckbox);
allStopsLabel.append(' 顯示所有站牌');
routeOptionsDiv.appendChild(allStopsLabel);
routeOptionsDiv.appendChild(document.createElement('br'));

// 繪製路線和站點的函數
function drawRoute(routeNumber, color) {
    if (routeLayers[routeNumber]) return;

    const waypoints = routes[routeNumber].map(stop => L.latLng(stop.lat, stop.lon));
    
    // 使用 L.Routing 進行路線規劃
    const routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        createMarker: function() { return null; }, // 不創建預設的標記
        lineOptions: {
            styles: [{ color: color, opacity: 0.8, weight: 5 }] // 設定路線顏色
        },
        addWaypoints: false, // 不允許用戶添加站點
        draggableWaypoints: false, // 不允許拖動站點
        fitSelectedRoutes: false, // 自動調整地圖視角
        routeWhileDragging: false, // 不在路徑拖動時重繪
        show: false // 不顯示導航介面
    }).addTo(map);

    // 根據 checkbox 狀態決定是否顯示標記
    const showMarkers = document.getElementById('all-stops').checked;
    const markers = routes[routeNumber].map(stop => {
        const marker = L.marker([stop.lat, stop.lon]);
        marker.bindPopup(`路線：${stop.busNumber}，站牌：${stop.stopName}`);
        return showMarkers ? marker.addTo(map) : null; // 如果選中則添加標記
    }).filter(marker => marker); // 過濾掉 null 值

    routeLayers[routeNumber] = { routingControl, markers };
}

// 移除路線和站點的函數
function removeRoute(routeNumber) {
    if (routeLayers[routeNumber]) {
        map.removeControl(routeLayers[routeNumber].routingControl);
        routeLayers[routeNumber].markers.forEach(marker => map.removeLayer(marker));
        delete routeLayers[routeNumber];
    }
}

// 讀取 CSV 資料
fetch('data.csv')
    .then(response => {
        if (!response.ok) {
            throw new Error('網絡錯誤：' + response.statusText);
        }
        return response.text(); // 將響應轉換為文本
    })
    .then(csvData => {
        // 解析 CSV 資料
        const linesData = csvData.trim().split('\n').slice(1).map(line => {
            const [busNumber, stopName, lat, lon] = line.split(',');
            return { busNumber, stopName, lat: parseFloat(lat), lon: parseFloat(lon) };
        });

        // 將每條公車路線分組
        routes = linesData.reduce((acc, stop) => {
            if (!acc[stop.busNumber]) acc[stop.busNumber] = [];
            acc[stop.busNumber].push(stop);
            return acc;
        }, {});

        // 為每條路線的 checkbox 添加事件監聽
        busRoutes.forEach(route => {
            document.getElementById(`route${route.number}`).addEventListener('change', function() {
                if (this.checked) {
                    drawRoute(route.number, route.color_number); // 使用 color_number
                } else {
                    removeRoute(route.number);
                }
            });

            // 初始繪製
            drawRoute(route.number, route.color_number); // 使用 color_number
        });

        // 為所有站牌 checkbox 添加事件監聽
        allStopsCheckbox.addEventListener('change', function() {
            busRoutes.forEach(route => {
                if (document.getElementById(`route${route.number}`).checked) {
                    removeRoute(route.number); // 移除路線和標記
                    drawRoute(route.number, route.color_number); // 重新繪製路線
                }
            });
        });
    })
    .catch(error => {
        console.error('發生錯誤:', error);
    });
