// ===============================================
// 1. 地圖初始化 & 底圖定義
// ===============================================

// 1.1 定義底圖 URL 模板 (以 NLSC 為例)
// 注意：以下為常見的 NLSC 服務 WMS/WMTS 範例 URL，您可能需要根據實際服務類型調整
// 由於 Leaflet 內建 L.tileLayer 不直接支持所有 WMTS 服務，這裡我們用 L.tileLayer 模擬。

const nlscBaseMaps = {
    // 臺灣通用電子地圖 (灰階) - 您指定的需求
    "臺灣通用電子地圖(灰階)": L.tileLayer('https://wmts.nlsc.gov.tw/wmts/EMAP01/default/GoogleMapsCompatible/{z}/{y}/{x}', {
        attribution: 'NLSC EMAP6'
    }),
    
    // 臺灣通用電子地圖 (標準) - 用於替換原始的 OSM
    "臺灣通用電子地圖(標準)": L.tileLayer('https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}', {
        attribution: 'NLSC EMAP'
    }),
    
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


// 原始程式碼中 L.tileLayer(...).addTo(map) 的部分被上面的 'layers' 參數取代。

// ===============================================
// 2. 樣式定義函式 (滿足自定義上色需求)
// ===============================================


/**
 * 點狀圖層樣式定義 (捷運站點)
 */

const customIcon = L.icon({
    iconUrl: 'images/metro_marker.png', 
    iconSize: [12, 13],                  // 圖片的寬度和高度 
    iconAnchor: [5, 13],                // 標記尖端與地圖座標對齊點的相對位置 (例如：寬度一半, 高度底部)；標記定位點：X = 5 (從水平中心 6 修正至 5，微幅向左調整)；Y = 13 (底部對齊)
    popupAnchor: [0, -13]                // 彈出視窗與標記的相對位置 彈窗錨點：將彈窗向上推 13px
});

/**
 * pointToLayer 函式: 用於將 GeoJSON Point 圖徵轉換為 L.marker 或 L.circleMarker
 */
function stationPointToLayer(feature, latlng) {
    // 將每個點狀圖徵轉換為使用我們自定義 customIcon 的標記
    // ✨ 修正：使用 pane 選項，將標記繪製到與 GeoJSON 相同的層級
    return L.marker(latlng, { 
        icon: customIcon,
        pane: 'overlayPane' // <--- 關鍵修改
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
        
    // 您可以根據需要添加更多路線顏色

    return {
        color: color,
        weight: 2,
        opacity: 0.8
    };
}

/**
 * 面狀圖層樣式定義 (捷運人數網格)
 * 根據人數 (ridership 屬性) 決定顏色 (等級式上色)。
 */
function gridStyle(feature) {
    const metro_ridership = feature.properties.Mv_Act; // 假設 GeoJSON 屬性名為 ridership
    let fillColor = 'transparent'; // 預設顏色：淺灰色

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
        fillOpacity: 0.7,
        weight: 1,
        color: 'white' // 邊框顏色
    };
}

/**
 * 遮罩圖層樣式定義 (taipei_mask)
 * 將非台北市區域顯示為淺灰色半透明。
 */
function maskStyle(feature) {
    // 假設您的 GeoJSON 檔案中，包含所有區域的多邊形，
    // 並且有一個屬性 (例如 is_taipei) 可以判斷是否為台北市。
    // 如果檔案本身就只有一個大的遮罩區塊，則無需條件判斷，直接套用樣式即可。
    
    // 我們假設這個 GeoJSON 是 "非台北市區域" 的遮罩多邊形。

    return {
        fillColor: '#cccccc', // 淺灰色
        fillOpacity: 0.8,     // 半透明度
        weight: 0,            // 邊框設為 0，避免遮罩有邊線
        interactive: false    // 設為不可互動 (點擊時不觸發彈窗，焦點留給底下的圖層)
    };
}

// ===============================================
// 3. 彈窗與互動定義函式
// ===============================================

/**
 * 點擊圖徵時彈出資訊視窗的通用處理函式。
 */
function onEachFeature(feature, layer) {
    if (feature.properties) {
        let popupContent = '<h4>圖徵資訊</h4>';
        
        // 遍歷所有屬性，並將其格式化到彈窗中
        for (const key in feature.properties) {
            // 排除不需要展示的屬性，例如幾何ID
            if (key !== 'OBJECTID' && key !== 'Shape_Leng' && key !== 'Shape_Area') {
                popupContent += `<b>${key}</b>: ${feature.properties[key]}<br>`;
            }
        }
        
        // 實現您的特定需求：點擊到面狀網格id = 1036，展示 id, 座標, 人數
        // 由於 Leaflet Popup 會自動定位到點擊位置，這裡只需組裝文字內容。
        // 這裡以網格 ID 和人數為例：
        if (feature.properties.grid_id && feature.properties.ridership) {
             popupContent = `
                <div class="custom-popup">
                    <b>ID:</b> ${feature.properties.grid_id}<br>
                    <b>人數:</b> ${feature.properties.ridership}
                </div>
            `;
        } else if (feature.properties.station_name) {
            // 捷運站點彈窗範例
             popupContent = `
                <div class="custom-popup">
                    <b>捷運站:</b> ${feature.properties.station_name}
                </div>
            `;
        }


        layer.bindPopup(popupContent);
    }
}

// ===============================================
// 4. 資料載入與圖層創建
// ===============================================

const overlayMaps = {}; // 用於 L.control.layers 的圖層集合物件

/**
 * 載入並處理 GeoJSON 檔案。
 * @param {string} url - GeoJSON 檔案路徑
 * @param {Function} styleFn - 應用於圖層的樣式函式
 * @param {string} layerName - 圖層顯示名稱
 * @param {boolean} addMap - 是否一開始就添加到地圖
 */
async function loadGeoJsonLayer(url, styleFn, layerName, addMap = true, pointToLayerFn = null) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const geoJsonLayer = L.geoJSON(data, {
            style: styleFn,          // 應用自定義樣式
            onEachFeature: onEachFeature, // 應用彈窗功能
            // 對於點狀圖層，還需要使用 pointToLayer 來自定義標記
            // ✨ 新增判斷：如果傳入了 pointToLayer 函式，則應用它
            pointToLayer: pointToLayerFn
            // pointToLayer: (geoJsonPoint, latlng) => { return L.circleMarker(latlng, { radius: 6, fillColor: "red", color: "white", weight: 1, opacity: 1, fillOpacity: 0.8 }); }
        });

        

        // 將圖層存入 control.layers 的集合
        overlayMaps[layerName] = geoJsonLayer;

        if (addMap) {
            geoJsonLayer.addTo(map);

            // 判斷是否需要強制提升 Z-Order
            if (layerName === '非台北市區域遮罩') {
                geoJsonLayer.bringToFront(); 
            }
        }


    } catch (error) {
        console.error(`Error loading GeoJSON from ${url}:`, error);
    }
}


// 會依序載入個圖層

// 3. 面狀 (捷運人潮網格) - 預設關閉 
// 更改路徑：'data/metro_population_grids.geojsonl.json' -> 'data/metro_population_grids.geojson'
loadGeoJsonLayer('data/metro_population_grids.geojson', gridStyle, '捷運人潮', true);

// 1. 線狀 (捷運路線) - 預設開啟
// 更改路徑：'data/metro_lines.geojsonl.json' -> 'data/metro_lines.geojson'
loadGeoJsonLayer('data/metro_lines.geojson', lineStyle, '捷運路線', true);

// 2. 點狀 (捷運站點) - 預設開啟
// 更改路徑：'data/metro_stations.geojsonl.json' -> 'data/metro_stations.geojson'
loadGeoJsonLayer('data/metro_stations.geojson', null, '捷運站點', true, stationPointToLayer);


// 4. 面狀 (台北市遮罩) - 預設開啟 (在控制面板中)
// 由於我們將它納入 overlayMaps，Leaflet 會自動處理其疊加順序
loadGeoJsonLayer('data/taipei_mask.geojson', maskStyle, '非台北市區域遮罩', true);


// ===============================================
// 5. 圖層控制面板實作 (可收合/展開)
// ===============================================

// 延遲執行，確保所有圖層都已載入到 overlayMaps 中
setTimeout(() => {
    // Leaflet 預設的圖層控制元件 (Control)
    L.control.layers(
        // 第一個參數：Base Layers (底圖，使用 radio button 單選)
        nlscBaseMaps,        
        
        // 第二個參數：Overlay Layers (疊加圖層，checkbox 多選)
        overlayMaps, 
        { 
            collapsed: true, 
            position: 'topright' 
        }
    ).addTo(map);

    // 調整地圖視角，確保所有載入的圖層都在視野範圍內 (選用)
    // 這裡我們只是初始化，如果需要FitBounds，需要先確保所有GeoJSON都已載入
}, 1000); // 給予 1 秒延遲，確保異步載入的 GeoJSON 處理完畢

// ===============================================
// 6. 點擊座標和縮放等級調整
// ===============================================

// 增加一個簡單的座標顯示 (選用)
map.on('mousemove', function(e) {
    // 可以在這裡顯示滑鼠當前位置的經緯度
    // console.log(`Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`);
});