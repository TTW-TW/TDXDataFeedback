/** 圖層套疊Z-index順序
 * TileLayer tilePane 200
 * GeoJSON polygons / lines overlayPane 400
 * Marker markerPane 600
 * maskPane 650 // 自定義的台北市遮罩
 * Popup popupPane 700
 */

// ===============================================
// 1. 地圖初始化 & 底圖定義
// ===============================================

// 1.1 定義底圖 URL 模板 (以 NLSC 為例)
// 由於 Leaflet 內建 L.tileLayer 不直接支持所有 WMTS 服務，這裡我們用 L.tileLayer 模擬。

const nlscBaseMaps = {
    // 臺灣通用電子地圖 (灰階) - 您指定的需求
    "臺灣通用電子地圖(灰階)": L.tileLayer('https://wmts.nlsc.gov.tw/wmts/EMAP01/default/GoogleMapsCompatible/{z}/{y}/{x}', {
        attribution: 'NLSC EMAP6'
    }),
    
    // 臺灣通用電子地圖 (標準) - 用於替換原始的 OSM
    //"臺灣通用電子地圖(標準)": L.tileLayer('https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}', {
    //    attribution: 'NLSC EMAP'
    //}),
    
    // 開放街圖 (備用/預設)
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    })
    // 您可以根據 NLSC 提供的其他服務 (如正射影像) 在此處添加更多 L.tileLayer 或 L.tileLayer.wms
};


// 1.2 創建地圖實例，設定中心點和縮放級別
// 預設使用 "臺灣通用電子地圖(灰階)" 作為初始底圖
const map = L.map('map', {
    layers: [nlscBaseMaps["臺灣通用電子地圖(灰階)"]] // 初始載入灰階底圖
}).setView([25.03, 121.55], 13); // [緯度, 經度], 縮放級別


// ===============================================
// 2. 樣式定義函式 (自定義上色、圖例數據定義)
// ===============================================


/**
 * 點狀圖層樣式定義 (捷運站點)
 */

const customIcon = L.icon({
    iconUrl: 'images/metro_marker.png', 
    iconSize: [12, 13],                  // 圖片的寬度和高度 
    iconAnchor: [5, 13],                // 標記尖端與地圖座標對齊點的相對位置 (例如：寬度一半, 高度底部)；標記定位點：X = 5 (從水平中心 6 修正至 5，微幅向左調整)；Y = 13 (底部對齊)
    popupAnchor: [0, -13],                // 彈出視窗與標記的相對位置 彈窗錨點：將彈窗向上推 13px
    // 防止 Leaflet 創建 Marker Shadow，簡化 Z-Order
    // shadowUrl: null, 
    // shadowSize: [0, 0]
});

/**
 * pointToLayer 函式: 用於將 GeoJSON Point 圖徵轉換為 L.marker 或 L.circleMarker
 */
function stationPointToLayer(feature, latlng) {
    // 將每個點狀圖徵轉換為使用我們自定義 customIcon 的標記
    // ✨ 修正：使用 pane 選項，將標記繪製到與 GeoJSON 相同的層級
    return L.marker(latlng, { 
        icon: customIcon,
        pane: 'markerPane', // <--- 關鍵修改 
        shadowPane: 'markerPane'
    });
}

/**
 * 線狀圖層樣式定義 (捷運路線)
 * 根據路線名稱 (line_name 屬性) 決定顏色。
 */
function lineStyle(feature) {
    const lineName = feature.properties.MRTCODE; // 假設 GeoJSON 屬性名為 line_name
    let color = '#333333'; // 預設顏色：深灰色

    // 等級式顏色判斷
    if (lineName === '板南線') {
        color = '#0070b3'; // 藍色
    } else if (lineName === '淡水信義線') {
        color = '#cc0000'; // 紅色
    } else if (lineName === '松山新店線') {
        color = '#006a60'; // 綠色
    } else if (lineName === '蘆洲支線') {
        color = '#ff9e17';
    } else if (lineName === '三鶯線') {
        color = '#49c9ea';
    } else if (lineName === '小碧潭線') {
        color = '#a7df72';
    } else if (lineName === '中和新蘆線') {
        color = '#ff9e17';
    } else if (lineName === '文湖線') {
        color = '#cc8528';
    } else if (lineName === '新北投線') {
        color = '#fb9a99';
    } else if (lineName === '機場捷運') {
        color = '#b887e3';
    } else if (lineName === '貓空纜車') {
        color = '#a7df72';
    } else if (lineName === '環狀線') {
        color = '#fff300';
    }
        
    // 可根據需要添加更多路線顏色

    return {
        color: color,
        weight: 1.5,
        opacity: 0.9
    };
}

/**
 * 面狀圖層樣式定義 (捷運人數網格)
 * 根據人數  決定顏色 (等級式上色)。
 */
function gridStyle(feature) {
    const metro_ridership = feature.properties.Mv_Act; 
    let fillColor = 'transparent'; // 預設顏色：透明

    // 等級式顏色判斷
    if (metro_ridership === 0 ) {
        fillColor = 'transparent'; 
    } else if (metro_ridership >= 1 && metro_ridership < 500 ) {
        fillColor = '#bfd6e8'; 
    } else if (metro_ridership >= 500 && metro_ridership < 1000 ) {
        fillColor = '#9cacd2'; 
    }  else if (metro_ridership >= 1000 && metro_ridership < 3000 ) {
        fillColor = '#8a7cba';
    } else if (metro_ridership >= 3000 && metro_ridership < 6000 ) {
        fillColor = '#87489e';
    } else if (metro_ridership > 6000 ) {
       fillColor = '#580954ff';
    } 

    return {
        fillColor: fillColor,
        fillOpacity: 0.8,
        weight: 1,
        color: 'white' // 邊框顏色
    };
}

/**
 * 面狀圖層樣式定義 (公車人數網格)
 * 根據人數決定顏色 (等級式上色)。
 */
function gridStyleBus(feature) {
    const bus_ridership = feature.properties.Bv_Act; 
    let fillColor = 'transparent'; // 預設顏色：透明

    // 等級式顏色判斷
    if (bus_ridership === 0 ) {
        fillColor = 'transparent'; 
    } else if (bus_ridership >= 1 && bus_ridership < 250 ) {
        fillColor = '#d5efcf'; 
    } else if (bus_ridership >= 250 && bus_ridership < 500 ) {
        fillColor = '#9ed798'; 
    }  else if (bus_ridership >= 500 && bus_ridership < 1000 ) {
        fillColor = '#55b567';
    } else if (bus_ridership >= 1000 && bus_ridership < 1500 ) {
        fillColor = '#1d8641';
    } else if (bus_ridership > 1500 ) {
       fillColor = '#00441b';
    } 

    return {
        fillColor: fillColor,
        fillOpacity: 0.8,
        weight: 1,
        color: 'white' // 邊框顏色
    };
}

/**
 * 面狀圖層樣式定義 (公車站數量網格)
 * 根據人數決定顏色 (等級式上色)。
 */
function gridStyleBusNum(feature) {
    const bus_num = feature.properties.Bus_numd; 
    let fillColor = 'transparent'; // 預設顏色：透明

    // 等級式顏色判斷
    if (bus_num === 0 ) {
        fillColor = 'transparent'; 
    } else if (bus_num >= 1 && bus_num < 3 ) {
        fillColor = '#f1eef6'; 
    } else if (bus_num >= 3 && bus_num < 5 ) {
        fillColor = '#adb8d3ff'; 
    }  else if (bus_num >= 5 && bus_num < 8 ) {
        fillColor = '#4faeceff';
    } else if (bus_num >= 8 && bus_num < 10 ) {
        fillColor = '#26608aff';
    } else if (bus_num > 10 ) {
       fillColor = '#062455ff';
    } 

    return {
        fillColor: fillColor,
        fillOpacity: 0.8,
        weight: 1,
        color: 'white' // 邊框顏色
    };
}

/**
 * 遮罩圖層樣式定義 (taipei_mask)
 * 將非台北市區域顯示為淺灰色半透明。
 * 建立一個自訂 pane：z-index 比 markerPane 還高
 */

map.createPane('maskPane');
map.getPane('maskPane').style.zIndex = 650;  // 高於 markerPane(600)
//map.getPane('maskPane').style.pointerEvents = 'none'; // 遮罩不阻擋滑鼠動作（需要的話）


function maskStyle(feature) {

    return {
        fillColor: '#cccccc', // 淺灰色
        fillOpacity: 0.8,     // 半透明度
        weight: 0,            // 邊框設為 0，避免遮罩有邊線
        pane: 'maskPane', // ⭐ 關鍵：運用自定義的pane，讓套疊序放在最高層的 pane
        interactive: false    // 設為不可互動 (點擊時不觸發彈窗，焦點留給底下的圖層)
    };
}

//=====================
// 圖層控制選項中的圖例
//======================

/**
 * 集中定義圖例數據 (LayerName 必須與 loadGeoJsonLayer 的 layerName 嚴格匹配)
 * 鍵 (Key): 必須是 layerName
 * 值 (Value): { title: 圖例標題, items: [{color: 顏色, text: 顯示文字}, ...] }
 */
const LegendDefinitions = {
    // 捷運人潮網格的圖例數據
    '捷運活躍時段平均人流': { // <--- 💡Key 必須匹配 loadGeoJsonLayer 的 layerName
        title: '捷運活躍時段平均人流',
        items: [
            // 顏色必須與 gridStyle 函式中的顏色值一致
            { color: '#580954ff', text: '> 6,000 人 / 時' }, 
            { color: '#87489e', text: '3,000 – 5,999 人 / 時' }, 
            { color: '#8a7cba', text: '1000 – 2,999 人 / 時' },
            { color: '#9cacd2', text: '500 – 999 人 / 時' }, // 注意區間調整為 999
            { color: '#bfd6e8', text: '1 – 499 人 / 時' },
            { color: 'transparent', text: '0 人 / 時 (透明)', border: '1px solid #999' } // 處理透明情況
        ]
    },

    '公車活躍時段平均人流': { // <--- 💡Key 必須匹配 loadGeoJsonLayer 的 layerName
        title: '公車活躍時段平均人流',
        items: [
            // 顏色必須與 gridStyle 函式中的顏色值一致
            { color: '#00441b', text: '> 1,500 人 / 時' }, 
            { color: '#1d8641', text: '1,000 – 1,500 人 / 時' }, 
            { color: '#55b567', text: '500 – 1,000 人 / 時' },
            { color: '#9ed798', text: '250 – 499 人 / 時' }, // 注意區間調整為 999
            { color: '#d5efcf', text: '1 – 249 人 / 時' },
            { color: 'transparent', text: '0 人 / 時 (透明)', border: '1px solid #999' } // 處理透明情況
        ]
    },
        '公車站數量': { // <--- 💡Key 必須匹配 loadGeoJsonLayer 的 layerName
        title: '公車站數量',
        items: [
            // 顏色必須與 gridStyle 函式中的顏色值一致
            { color: '#062455ff', text: '> 10 站' }, 
            { color: '#26608aff', text: '8 – 10 站' }, 
            { color: '#4faeceff', text: '5 – 7 站' },
            { color: '#adb8d3ff', text: '3 – 4 站' }, // 注意區間調整為 999
            { color: '#f1eef6', text: '1 – 2 站' },
            { color: 'transparent', text: '0 站 (透明)', border: '1px solid #999' } // 處理透明情況
        ]
    }
};

/**
 * 根據 LegendDefinitions 物件動態生成圖例 HTML。
 * @param {string} layerName - 圖層名稱 (用於查找 LegendDefinitions)
 * @returns {string} 圖例 HTML 內容
 */
function createLegendHtml(layerName) {
    const definition = LegendDefinitions[layerName];
    if (!definition) {
        return ''; // 如果該圖層沒有定義圖例，則返回空字串
    }

    const labels = [];
    
    // 標題 (從定義中讀取)，如果有需要額外顯示標題的話
    // labels.push(`<div style="font-weight: bold; margin-top: 5px; margin-bottom: 5px;">${definition.title}</div>`);

    // 遍歷圖例項目
    definition.items.forEach(item => {
        const borderStyle = item.border || '1px solid #999'; // 如果有定義邊框則使用，否則使用預設
        
        labels.push(
            // 給<i>添加寬度、高度和浮動內聯樣式
            `<i style="background:${item.color}; border: ${borderStyle}; width: 12px; height: 12px; float: left; margin-left: 20px; margin-right: 5px; opacity: 0.7;"></i> ${item.text}<br style="clear: both;">`
        );
    });

    return labels.join('');
}


// ===============================================
// 3. 彈窗與互動定義函式
// ===============================================

/**
 * 點擊圖徵時彈出資訊視窗的通用處理函式。
 */

// 將原始欄位名稱調整為自定義名稱 (欄位名 : 顯示名稱)
const fieldMappings = {
    // 捷運人潮網格 (假設 layer_type: '捷運人潮')
    '捷運活躍時段平均人流': { // 💡必須與載入時給定的圖層名稱相同
        'id': '網格 ID',
        'X_co': 'X坐標',
        'y_co': 'Y坐標',
        'Mv_Act': '捷運分時人流(人次/小時)' 
    },
     // 公車人潮網格
    '公車活躍時段平均人流': { // 💡必須與載入時給定的圖層名稱相同
        'id': '網格 ID',
        'X_co': 'X坐標',
        'y_co': 'Y坐標',
        'Bv_Act': '公車分時人流(人次/小時)' 
    },
    // 捷運站點 (假設 layer_type: '捷運站點')
    '捷運站位置': {
        'FID CODE': '站點代碼',
        'NAME': '捷運站名'
    },
    // 捷運路線 (假設 layer_type: '捷運路線')
    '捷運路線': {
        'MRTID': '捷運代碼',
        'MRTSYS' : '捷運路線',
        'MRTCODE': '路線名稱'
    },
    '公車站數量': {
        'id': '網格 ID',
        'X_co': 'X坐標',
        'y_co': 'Y坐標',
        'Bus_numd': '站數' 
    },

};


function onEachFeature(feature, layer) {
    if (feature.properties) {
        const layerType = feature.properties.layer_type || '圖徵資訊'; // 預設值
        
        // ✨ 問題 1 修正點：根據 layerType 設定 H4 標題
        let popupContent = `<h4>${layerType}</h4>`; 
        
        const currentMappings = fieldMappings[layerType] || {}; // 獲取當前圖層的名稱對應表
        
        // 排除列表，無論哪個圖層都排除
        const excludedKeys = ['OBJECTID', 'Shape_Leng', 'Shape_Area', 'layer_type', 'X_co', 'y_co' ];

        // 遍歷所有屬性，並將其格式化到彈窗中
        for (const key in feature.properties) {
            // 排除不需要展示的屬性
            if (!excludedKeys.includes(key)) {
                // 獲取顯示名稱，如果對應表裡沒有，就使用原始 key
                const displayName = currentMappings[key] || key; 
                
                popupContent += `<b>${displayName}</b>: ${feature.properties[key]}<br>`;
            }
        }
        
        // --- 舊有的特定條件判斷區塊已移除或簡化 ---
        // 由於我們改用屬性遍歷，舊有的 if (feature.properties.grid_id) 區塊可以簡化或移除。

        layer.bindPopup(popupContent);
    }
}


// ===============================================
// 4. 資料載入與圖層創建
// ===============================================
const OVERLAY_ORDER = [
    '捷運活躍時段平均人流',
    '公車活躍時段平均人流', 
    '公車站數量',           
    '捷運站位置',
    '捷運路線',
    '非台北市區域遮罩'
];

const overlayMaps = {}; // 用於 L.control.layers 的圖層集合物件

/**
 * 載入並處理 GeoJSON 檔案。
 * @param {string} url - GeoJSON 檔案路徑
 * @param {Function} styleFn - 應用於圖層的樣式函式
 * @param {string} layerName - 圖層顯示名稱
 * @param {boolean} addMap - 是否一開始就添加到地圖
 */
function loadGeoJsonLayer(url, styleFn, layerName, addMap = true, pointToLayerFn = null) {
    return fetch(url)   // ⭐ 重要：回傳 Promise
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // 解析 JSON
        })
        .then(data => {

            // 給所有圖徵添加一個識別屬性
            if (data.features) {
                data.features.forEach(feature => {
                    if (!feature.properties) {
                        feature.properties = {};
                    }
                    feature.properties.layer_type = layerName; // 使用 layerName 作為識別碼
                });
            }

            const geoJsonLayer = L.geoJSON(data, {
                style: styleFn,                   // 應用自定義樣式
                onEachFeature: onEachFeature,     // 應用彈窗功能

                // 對於點狀圖層，如果傳入 pointToLayer 函式則使用它
                pointToLayer: pointToLayerFn
            });

            // 將圖層存入 control.layers 的集合
            overlayMaps[layerName] = geoJsonLayer;

            // 圖層套疊順序將依照 "後開啟在頂層" 的邏輯
            // 除了 marker、maskPane（自定義順序）以外
            if (addMap) {
                geoJsonLayer.addTo(map);
            }

            // ⭐ 最終回傳生成的圖層，讓外部需要時可使用
            return geoJsonLayer;
        })
        .catch(error => {
            console.error(`Error loading GeoJSON from ${url}:`, error);
        });
}


// // 會依序載入個圖層

// // 面狀 (捷運人潮網格) 💡此處的圖層名稱需要匹配其定義title
// loadGeoJsonLayer('data/metro_population_grids.geojson', gridStyle, '捷運活躍時段平均人流', true);

// // 面狀 (公車人潮網格) 💡此處的圖層名稱需要匹配其定義title
// loadGeoJsonLayer('data/bus_population_grids.geojson', gridStyleBus, '公車活躍時段平均人流', false);

// // 面狀 (公車人潮網格) 💡此處的圖層名稱需要匹配其定義title
// loadGeoJsonLayer('data/bus_num_grids.geojson', gridStyleBusNum, '公車站數量', false);

// // 線狀 (捷運路線) 
// loadGeoJsonLayer('data/metro_lines.geojson', lineStyle, '捷運路線', true);

// // 點狀 (捷運站點)
// loadGeoJsonLayer('data/metro_stations.geojson', null, '捷運站位置', false, stationPointToLayer);

// // 99. 面狀 (台北市遮罩) - 預設開啟 (在控制面板中)
// // 由於我們將它納入 overlayMaps，Leaflet 會自動處理其疊加順序
// loadGeoJsonLayer('data/taipei_mask.geojson', maskStyle, '非台北市區域遮罩', true);


// ===============================================
// 5. 圖層控制面板實作 (可收合/展開、調整透明度) (等全部 GeoJSON 載入後再建立控制台 + 關閉 loading spinner)
// ===============================================

// 取代 setTimeout()：
Promise.all([
    // 面狀 (捷運人潮網格) 💡此處的圖層名稱需要匹配其定義title
    loadGeoJsonLayer('data/metro_population_grids.geojson', gridStyle, '捷運活躍時段平均人流', true),
    // 面狀 (公車人潮網格) 💡此處的圖層名稱需要匹配其定義title
    loadGeoJsonLayer('data/bus_population_grids.geojson', gridStyleBus, '公車活躍時段平均人流', false),
    // 面狀 (公車人潮網格) 💡此處的圖層名稱需要匹配其定義title
    loadGeoJsonLayer('data/bus_num_grids.geojson', gridStyleBusNum, '公車站數量', false),

    // 線狀 (捷運路線) ,
    loadGeoJsonLayer('data/metro_lines.geojson', lineStyle, '捷運路線', true),
    // 點狀 (捷運站點)
    loadGeoJsonLayer('data/metro_stations.geojson', null, '捷運站位置', false, stationPointToLayer),
    // 99. 面狀 (台北市遮罩) - 預設開啟 (在控制面板中)
    // 由於我們將它納入 overlayMaps，Leaflet 會自動處理其疊加順序
    loadGeoJsonLayer('data/taipei_mask.geojson', maskStyle, '非台北市區域遮罩', true)
]).then(() => {

        // 隱藏 loading spinner
        document.getElementById("loading-spinner").style.display = "none";

        // 依照指定排序建立 orderedOverlayMaps
        const orderedOverlayMaps = {};
        OVERLAY_ORDER.forEach(name => {
            if (overlayMaps[name]) orderedOverlayMaps[name] = overlayMaps[name];
        });

        // 建立控制台
        const layerControl = L.control.layers(
            nlscBaseMaps,
            orderedOverlayMaps,
            { collapsed: true, position:'topright' }
        ).addTo(map);

        function setupLegendsAndSliders(layerControl) {

            const controlContainer = layerControl.getContainer();
            const overlayList = controlContainer.querySelector('.leaflet-control-layers-overlays');

            // ======================
            // 1. 圖例注入
            // ======================
            const layerNames = Object.keys(LegendDefinitions);
            const totalLayersWithLegend = layerNames.length;

            for (let i = 0; i < totalLayersWithLegend; i++) {
                const layerName = layerNames[i];

                // 找控制台中該 layerName 的 <label>
                const labels = overlayList.querySelectorAll('label');
                let targetElement = null;

                labels.forEach(label => {
                    if (label.textContent.includes(layerName)) {
                        targetElement = label;
                    }
                });

                if (targetElement) {
                    const legendContainer = L.DomUtil.create('div', 'legend-container');
                    legendContainer.innerHTML = createLegendHtml(layerName);

                    targetElement.after(legendContainer);
                    legendContainer.style.paddingTop = '5px';
                    legendContainer.style.marginTop = '5px';

                    // 兩組圖例之間的分隔線
                    if (i < totalLayersWithLegend - 1) {
                        const separator = L.DomUtil.create('div', 'leaflet-control-layers-separator');
                        separator.style.height = '0';
                        separator.style.margin = '6px 0';
                        separator.style.borderTop = '1px solid #ddd';
                        legendContainer.after(separator);
                    }
                }
            }

            // ======================
            // 2. 圖層透明度 slider
            // ======================
            for (const [layerName, layerInstance] of Object.entries(overlayMaps)) {

                const label = Array.from(overlayList.querySelectorAll('label')).find(
                    l => l.textContent.includes(layerName)
                );

                if (label) {
                    const slider = document.createElement('input');
                    slider.type = 'range';
                    slider.min = '0';
                    slider.max = '1';
                    slider.step = '0.05';
                    slider.value = 1.0;
                    slider.style.width = '70px';
                    slider.style.marginLeft = '10px';

                    slider.addEventListener('input', (e) => {
                        const newOpacity = parseFloat(e.target.value);

                        // 若是 tileLayer / setOpacity 圖層
                        if (layerInstance.setOpacity) {
                            layerInstance.setOpacity(newOpacity);
                        }

                        // 若是 GeoJSON 類型（eachLayer 遍歷）
                        if (layerInstance.eachLayer) {
                            layerInstance.eachLayer(function (subLayer) {
                                if (subLayer.setStyle) {
                                    subLayer.setStyle({
                                        opacity: newOpacity,
                                        fillOpacity: newOpacity
                                    });
                                }
                            });
                        }
                    });

                    label.appendChild(slider);
                    label.style.display = 'flex';
                    label.style.justifyContent = 'space-between';
                }
            }
        }


        // 重新套用你的圖例 & Slider
        setupLegendsAndSliders(layerControl);

        map.invalidateSize();
});



// // 延遲執行，確保所有圖層都已載入到 overlayMaps 中
// setTimeout(() => {

//     // ⭐ 關鍵修正：依照 OVERLAY_ORDER 重新排序 overlayMaps 屬性
//     const orderedOverlayMaps = {};
//     OVERLAY_ORDER.forEach(layerName => {
//         // 只有當 overlayMaps 中存在該圖層時，才將其添加到有序集合中
//         if (overlayMaps[layerName]) {
//             orderedOverlayMaps[layerName] = overlayMaps[layerName];
//         }
//     });

//     // Leaflet 預設的圖層控制元件 (Control)
//     const layerControl = L.control.layers(
//         // 第一個參數：Base Layers (底圖，使用 radio button 單選)
//         nlscBaseMaps,        
        
//         // 第二個參數：Overlay Layers (疊加圖層，checkbox 多選)
//         // 傳入已經透過 OVERLAY_ORDER 定義好的排序
//         orderedOverlayMaps, 
//         { 
//             collapsed: true, 
//             position: 'topright' 
//         }
//     ).addTo(map);

//     const controlContainer = layerControl.getContainer();

//     const layerList = controlContainer.querySelector('.leaflet-control-layers-overlays');
//     const overlayList = controlContainer.querySelector('.leaflet-control-layers-overlays');

//     // 1. 條件式圖例注入 (單一、正確的迴圈邏輯)
//     const layerNames = Object.keys(LegendDefinitions);
//     const totalLayersWithLegend = layerNames.length;
    
//     // 遍歷所有需要圖例的圖層定義
//     for (let i = 0; i < totalLayersWithLegend; i++) {
//         const layerName = layerNames[i];

//         // 確保該圖層在控制面板中存在
//         const labels = overlayList.querySelectorAll('label');
//         let targetElement = null;
        
//         labels.forEach(label => {
//             // 找到包含圖層名稱的 <label> 元素
//             if (label.textContent.includes(layerName)) {
//                 targetElement = label;
//             }
//         });

//         if (targetElement) {
//             // 創建並生成圖例 HTML
//             const legendContainer = L.DomUtil.create('div', 'legend-container');
//             legendContainer.innerHTML = createLegendHtml(layerName);
            
//             // 將圖例容器插入到目標標籤之後
//             targetElement.after(legendContainer);
            
//             // 設置圖例容器的樣式
//             // 移除 borderTop，讓圖例直接接續標籤
//             // legendContainer.style.borderTop = '1px solid #ddd'; // 刪除或註解
//             legendContainer.style.paddingTop = '5px';
//             legendContainer.style.marginTop = '5px';
            
            
//             // ⭐ 關鍵：在圖例結束後，如果後面還有其他圖例組，則添加分隔線
//             if (i < totalLayersWithLegend - 1) {
//                 const separator = L.DomUtil.create('div', 'leaflet-control-layers-separator');
                
//                 // 設置分隔線的標準 Leaflet 樣式
//                 separator.style.height = '0';
//                 separator.style.margin = '6px 0'; // Leaflet 標準的垂直間距
//                 separator.style.borderTop = '1px solid #ddd'; // Leaflet 標準的灰色線

//                 // 將分隔線放在圖例容器之後
//                 legendContainer.after(separator);
//             }
//         }
//     }

//     // 2. 疊加圖層透明度滑動條
//     for (const [layerName, layerInstance] of Object.entries(overlayMaps)) {
//         // 找到控制面板中對應的 <label> 元素
//         const label = Array.from(layerList.querySelectorAll('label')).find(
//             l => l.textContent.includes(layerName)
//         );

//         if (label) {
//             // 創建滑動條元素
//             const slider = document.createElement('input');
//             slider.type = 'range';
//             slider.min = '0';
//             slider.max = '1';
//             slider.step = '0.05';
//             // 根據圖層當前狀態設定初始值 (GeoJSON 預設為 1.0)
//             slider.value = layerInstance.options.opacity !== undefined ? layerInstance.options.opacity : 0.9; 
//             slider.style.width = '70px'; // 調整滑動條寬度
//             slider.style.marginLeft = '10px';

//             // 監聽滑動條事件
//             slider.addEventListener('input', (e) => {
//                 const newOpacity = parseFloat(e.target.value);
                
//                 // 檢查圖層類型並調整透明度
//                 if (layerInstance.setOpacity) {
//                     // 對 GeoJSON 或 TileLayer 適用
//                     layerInstance.setOpacity(newOpacity);
//                 } else if (layerInstance.eachLayer) {
//                     // 對於 L.geoJSON (它是一個 L.layerGroup)，遍歷其下的所有圖元
//                     layerInstance.eachLayer(function(subLayer) {
//                         if (subLayer.setStyle) {
//                             subLayer.setStyle({ opacity: newOpacity, fillOpacity: newOpacity * 1.0 });
//                         }
//                     });
//                 }
//             });

//             // 將滑動條添加到標籤後
//             label.appendChild(slider);

//             // 調整 label 樣式以更好地容納滑動條
//             label.style.display = 'flex';
//             label.style.justifyContent = 'space-between';
//         }
//     }
//     // 調整地圖視角，確保所有載入的圖層都在視野範圍內 (選用)
//     // 這裡我們只是初始化，如果需要FitBounds，需要先確保所有GeoJSON都已載入

//     // ⭐ 關鍵修正：確保在地圖容器完全可見並有高度後，通知 Leaflet 重新計算尺寸
//     map.invalidateSize();

// }, 1000); // 給予 1 秒延遲，確保異步載入的 GeoJSON 處理完畢


// ===============================================
// 99. 點擊座標和縮放等級調整
// ===============================================

// 增加一個簡單的座標顯示 (選用)
//map.on('mousemove', function(e) {
    // 可以在這裡顯示滑鼠當前位置的經緯度
    // console.log(`Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`);
//});


function showInfoModal() {
  const html = `
    <p style=";text-align: left; font-size:1em">資料來源：123</p>
    <ul>
      <li style=";text-align: left; font-size:0.9em">資料集</li>
      <li style=";text-align: left;  font-size:0.9em">資料集</li>
      <li style=";text-align: left;  font-size:0.9em">資料集</li>
    </ul>
  `;

  Swal.fire({
    title: '標題',
    html,
    confirmButtonText: '關閉',
    allowOutsideClick: true,   // 允許點背景關閉（可依需求）
    allowEscapeKey: true,
    backdrop:false,
    //backdrop: 'rgba(0,0,0,0.9)', // 或 false 完全不加遮罩

    didOpen: () => {
      // 開啟彈窗可能改變布局，對 Leaflet 進行重算
      if (map && map.invalidateSize) {
        setTimeout(() => map.invalidateSize(), 50);
      }
    },
    didClose: () => {
      if (map && map.invalidateSize) {
        setTimeout(() => map.invalidateSize(), 50);
      }
    }
  });
}

// 例如在頁首右上角的「資料說明」按鈕綁定
document.getElementById('demo1')?.addEventListener('click', showInfoModal);

// 若你想在載入後自動顯示一次
// window.addEventListener('load', showInfoModal);

// const dataDescription = '<p>資料來源：123</p><ul><li>資料集</li><li>資料集</li><li>資料集</li></ul>'

// document.getElementById("demo1").addEventListener("click",function(){
//     Swal.fire({
//         title: '標題',
//         html:  '<p>資料來源：123</p><ul><li>資料集</li><li>資料集</li><li>資料集</li></ul>',
//         confirmButtonText:"確定",
//     });
// });