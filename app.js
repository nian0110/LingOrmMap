// 初始化地圖
const map = L.map('map').setView([25.058707, 121.539112], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// 將每條公車路線分組的變數
let routes = {};

// 公車路線顏色設定
const busRoutes = [
    { number: '281', color_number: '#007BFF', lingorm: 'LingOrm' }, // 藍色
    { number: '306', color_number: '#28A745', lingorm: 'LingOrm' },  // 綠色
    { number: '265', color_number: '#FF4136', lingorm: 'Ling' },  // 紅色
    { number: '645', color_number: '#FF851B', lingorm: 'Ling' }, // 橙色
    { number: '270', color_number: '#6F42C1', lingorm: 'Orm' }, // 紫色
    { number: '12', color_number: '#17A2B8', lingorm: 'Orm' } // 青色
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

    // 顯示顏色的 span
    const colorDisplay = document.createElement('span');
    colorDisplay.style.display = 'inline-block';
    colorDisplay.style.width = '15px';
    colorDisplay.style.height = '15px';
    colorDisplay.style.backgroundColor = route.color_number;
    colorDisplay.style.marginRight = '3px';
    colorDisplay.style.borderRadius = '3px';

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
allStopsCheckbox.checked = false;

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
        createMarker: () => null, // 不創建預設標記
        lineOptions: {
            styles: [{ color: color, opacity: 0.8, weight: 5 }]
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        show: false
    }).addTo(map);

    // 根據 checkbox 狀態決定是否顯示標記
    const showMarkers = document.getElementById('all-stops').checked;
    const markers = routes[routeNumber].map(stop => {
        const marker = L.marker([stop.lat, stop.lon]);
        marker.bindPopup(`路線：${stop.busNumber}，站牌：${stop.stopName}`);
        return showMarkers ? marker.addTo(map) : null;
    }).filter(marker => marker);

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

// 添加標記的函數
function addMarkers(stops) {
    stops.forEach(stop => {
        const marker = L.marker([stop.lat, stop.lon])
            .addTo(map)
            .bindPopup(`${stop.LingOrm}${stop.type}<br>地點：${stop.stopName}`);
    });
}

// 定義站點資料
const stopsData = [
    { lat: 25.036456657891122, lon: 121.56780476783925, stopName: '信義威秀2F', LingOrm: 'Orm', type:'電視牆'},
    { lat: 25.0389480897111, lon: 121.56660203337223, stopName: '新光三越A8', LingOrm: 'LingOrm', type:'電視牆'},
    { lat: 25.03304315273338, lon: 121.55985755132421, stopName: '基隆路/信義路口', LingOrm: 'Ling', type:'電視牆'},
    { lat: 25.052974564023664, lon: 121.60675038741421, stopName: '捷運南港站B1大廳', LingOrm: 'LingOrm', type:'電視牆'},
    { lat: 25.04216738766774, lon: 121.54531438657679, stopName: '忠孝SOGO', LingOrm: 'Ling', type:'電視牆'},
    { lat: 25.044210574121113, lon: 121.50732030736353, stopName: '西門徒步區(漢中武昌交叉口)', LingOrm: 'Ling', type:'電視牆'},
    { lat: 25.04296026124686, lon: 121.50729424203418, stopName: '西門町真善美', LingOrm: 'LingOrm, Orm', type:'電視牆'},
    { lat: 25.045566662127758, lon: 121.5170958173358, stopName: '北車M8出口', LingOrm: 'Ling', type:'電視牆'},
    { lat: 25.045696655149857, lon: 121.51626253413437, stopName: '南陽街/許昌街(新光三越前)', LingOrm: 'Ling', type:'電視牆'},
    { lat: 25.049371283999594, lon: 121.51856583115223, stopName: '京站威秀6F', LingOrm: 'LingOrm, Orm', type:'電視牆'},
    { lat: 25.021576329467788, lon: 121.53196265879741, stopName: '自彈自唱Dolce far Niente', LingOrm: 'LingOrm', type:'咖啡廳'},
    { lat: 25.05089653864081, lon: 121.59340710326795, stopName: '大山昆陽咖啡', LingOrm: 'Orm', type:'易拉展'},
    { lat: 25.052207448934162, lon: 121.59815831658337, stopName: 'W9T酒等了', LingOrm: 'LingOrm', type:'場外應援布置'},
];
// 添加標記到地圖
addMarkers(stopsData);

// 讀取 CSV 資料
fetch('data.csv')
    .then(response => {
        if (!response.ok) {
            throw new Error('網絡錯誤：' + response.statusText);
        }
        return response.text();
    })
    .then(csvData => {
        const linesData = csvData.trim().split('\n').slice(1).map(line => {
            const [busNumber, stopName, lat, lon] = line.split(',');
            return { busNumber, stopName, lat: parseFloat(lat), lon: parseFloat(lon) };
        });

        routes = linesData.reduce((acc, stop) => {
            if (!acc[stop.busNumber]) acc[stop.busNumber] = [];
            acc[stop.busNumber].push(stop);
            return acc;
        }, {});

        busRoutes.forEach(route => {
            document.getElementById(`route${route.number}`).addEventListener('change', function() {
                if (this.checked) {
                    drawRoute(route.number, route.color_number);
                } else {
                    removeRoute(route.number);
                }
            });

            drawRoute(route.number, route.color_number);
        });

        allStopsCheckbox.addEventListener('change', function() {
            busRoutes.forEach(route => {
                if (document.getElementById(`route${route.number}`).checked) {
                    removeRoute(route.number);
                    drawRoute(route.number, route.color_number);
                }
            });
        });
    })
    .catch(error => {
        console.error('發生錯誤:', error);
    });
