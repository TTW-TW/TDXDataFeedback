# 運輸資料加值應用展示平台

這是一個基於 Leaflet.js 開發的 GIS 網頁應用，用於視覺化台北市捷運與公車的人流分布情況。

## 📋 專案簡介

本系統整合多種交通資料來源，透過互動式地圖展示：
- 捷運活躍時段平均人流分布
- 公車活躍時段平均人流分布
- 公車站數量分布
- 捷運站位置與路線

使用者可透過圖層控制面板自由切換不同資料圖層、調整透明度，並點擊地圖元素查看詳細資訊。

## 🗂️ 專案結構
```
project/
├── css/
│   └── style.css           # 網站整體樣式
├── data/                   # GeoJSON 資料檔案
│   ├── metro_population_grids.geojson
│   ├── bus_population_grids.geojson
│   ├── bus_num_grids.geojson
│   ├── metro_lines.geojson
│   ├── metro_stations.geojson
│   └── taipei_mask.geojson
├── images/
│   └── metro_marker.png    # 捷運站點圖示
├── js/
│   └── main.js             # 主要程式邏輯
├── index.html              # 網頁入口
└── README.md
```

## 🚀 快速開始

### 1. 環境需求
- 現代瀏覽器（Chrome、Firefox、Safari、Edge）
- 本地端伺服器（建議使用 Live Server 或 Python HTTP Server）

### 2. 安裝步驟
```bash
# 複製專案
git clone [your-repo-url]

# 進入專案目錄
cd project-folder

# 啟動本地伺服器（方法一：使用 Python）
python -m http.server 8000

# 或（方法二：使用 VS Code Live Server 擴充功能）
# 右鍵點擊 index.html → "Open with Live Server"
```

### 3. 開啟瀏覽器
訪問 `http://localhost:8000`

## 🎯 功能特色

### 1. 多圖層資料展示
- **捷運人流網格**：等級式上色，顯示活躍時段捷運平均人流
- **公車人流網格**：等級式上色，顯示活躍時段捷運平均人流
- **公車站數量網格**：展示各區域公車站數量
- **捷運路線**：展示臺北捷運路線
- **捷運站點**：顯示捷運站位置
- **台北市遮罩**：淡化非臺北市區域，聚焦研究範圍

### 2. 互動式圖層控制
- ✅ 點擊右上角按鈕開啟圖層控制面板
- ✅ 勾選/取消圖層顯示
- ✅ 拖動滑桿調整圖層透明度
- ✅ 切換底圖（灰階/標準/OSM）
- ✅ 內建圖例說明

### 3. 資訊彈窗
點擊地圖上的任意圖徵，即可查看該位置的詳細資訊（如人流數據、站點名稱等）。

### 4. 資料來源說明視窗
點擊頁面右上角的「資料說明」連結，可查看完整的資料來源與使用說明。

### 5. 函式架構圖

[開啟 mermaidchar檢視](https://tinyurl.com/432n92zy)

## 📊 資料來源

1. **交通部 TDX 運輸資料流通服務**
   - 公共運輸-公車
   - 臺北市市區公車分時上下車人次資料
   - 臺北捷運每日各站分時OD資料

2. **內政部國土測繪圖資e商城**
   - 捷運車站
   - 捷運路線

## 🛠️ 技術架構

### 前端框架
- **Leaflet.js 1.9.4**：互動式地圖框架
- **SweetAlert2**：資料說明彈窗
- **JavaScript (ES6+)**：無額外框架依賴

### 地圖服務
- **NLSC 臺灣通用電子地圖（灰階）** （預設底圖）
- **NLSC 臺灣通用電子地圖（標準）**
- **OpenStreetMap**

### 資料格式
- **GeoJSON**：所有空間資料採用 GeoJSON 格式

## 📐 核心邏輯說明

### 圖層套疊順序 (Z-index)
```
10   - 地圖基礎
200  - TileLayer (底圖)
400  - GeoJSON Polygons/Lines (面狀/線狀圖層)
600  - Marker (捷運站點)
650  - MaskPane (台北市遮罩)
700  - Popup (彈出視窗)
1000 - App Header (網站標題)
2000 - Loading Spinner
20000- SweetAlert Modal
```

### 樣式定義函式
- `lineStyleMrt()` - 捷運路線樣式（依路線名稱上色）
- `gridStyleMrt()` - 捷運人流網格樣式（等級式上色）
- `gridStyleBus()` - 公車人流網格樣式（等級式上色）
- `gridStyleBusNum()` - 公車站數量網格樣式（等級式上色）
- `maskStyleTaipei()` - 台北市遮罩樣式

### 資料載入流程
1. 使用 `Promise.all()` 非同步載入所有 GeoJSON
2. 載入完成後隱藏 Loading Spinner
3. 建立圖層控制面板
4. 注入圖例與透明度滑桿

## 🎨 自訂樣式

### 修改圖層顏色
在 `main.js` 中找到對應的樣式函式（如 `gridStyleMrt`），修改顏色值：
```javascript
if (metro_ridership > 6000) {
    fillColor = '#580954ff'; // 修改此處的顏色值
}
```

### 修改圖例文字、顏色
在 `LegendDefinitions` 物件中修改對應圖層的圖例項目：
```javascript
const LegendDefinitions = {
    '捷運活躍時段平均人流': {
        title: '捷運活躍時段平均人流',
        items: [
            { color: '#580954ff', text: '> 6,000 人 / 時' },
            // 新增或修改項目...
        ]
    }
};
```
### 修改圖層控制面板資料順序

在 `OVERLAY_ORDER` 陣列中調整順序：

```JavaScript
const OVERLAY_ORDER = [
    '捷運活躍時段平均人流',
    '公車活躍時段平均人流', 
    '公車站數量',           
    '捷運站位置',
    '捷運路線',
    '非台北市區域遮罩'
];
```

## 🐛 常見問題

### Q1: 地圖無法載入？
**A:** 確認是否使用本地伺服器開啟（不能直接用瀏覽器開啟 HTML 檔案）。

### Q2: GeoJSON 資料無法顯示？
**A:** 檢查 `data/` 資料夾中的檔案路徑是否正確，以及檔案格式是否為有效的 GeoJSON。

### Q3: 圖層控制面板無法開啟？
**A:** 確認 JavaScript 主控台是否有錯誤訊息，檢查 Leaflet.js 是否正確載入。

## 📝 維護與更新

### 新增圖層
1. 準備 GeoJSON 資料檔案，放入 `data/` 資料夾
2. 在 `main.js` 中定義樣式函式
3. 在 `LegendDefinitions` 中新增圖例定義
4. 在 `Promise.all()` 中加入 `loadGeoJsonLayer()` 呼叫
5. 更新 `OVERLAY_ORDER` 陣列以調整圖層順序

### 更新資料
直接替換 `data/` 資料夾中的 GeoJSON 檔案即可，無需修改程式碼。

## 📄 聲明

本站台資料為個人研究成果交流展示，不提供做為學術/商業/法律上之引用或佐證依據。

## 🙏 致謝

感謝交通部 TDX 運輸資料流通服務與 內政部國土測繪圖資e商城提供開放資料。

---


