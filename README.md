# MCP Taiwan Zoning

> MCP Server：台灣都市計畫與土地使用分區

提供台灣都市計畫分區、土地使用分類、公共設施用地、都市更新等資料查詢功能。

## 工具清單

| 工具名稱 | 說明 |
|----------|------|
| `query_zoning_by_location` | 查詢指定座標的都市計畫使用分區（住宅/商業/工業等） |
| `list_urban_zones` | 列出城市內所有都市計畫分區類型與統計資料 |
| `query_public_facilities` | 查詢附近公共設施用地（公園/學校/道路等） |
| `query_urban_renewal_areas` | 查詢都市更新與重劃區資訊 |
| `query_land_use_classification` | 查詢國土利用現況分類（103 種分類） |

## 安全徽章

- **資料敏感度**: public
- **權限**: readonly
- **外部 API**: historygis.udd.taipei.gov.tw, maps.nlsc.gov.tw, datacenter.taichung.gov.tw
- **開源**: 是

## 安裝

```bash
npm install
```

## 使用方式

### Cloudflare Workers 部署

```bash
npx wrangler deploy
```

### MCP 協定

標準 MCP 協定流程：

1. **initialize** → 取得 server 資訊與能力宣告
2. **tools/list** → 列出所有可用工具
3. **tools/call** → 呼叫指定工具

### 工具參數範例

#### query_zoning_by_location
```json
{
  "latitude": 25.0330,
  "longitude": 121.5654,
  "city": "台北市"
}
```

#### list_urban_zones
```json
{
  "city": "台北市",
  "zone_type": "residential"
}
```

#### query_public_facilities
```json
{
  "latitude": 25.0330,
  "longitude": 121.5654,
  "radius_meters": 500,
  "facility_type": "park"
}
```

#### query_urban_renewal_areas
```json
{
  "city": "台北市",
  "status": "approved"
}
```

#### query_land_use_classification
```json
{
  "latitude": 25.0330,
  "longitude": 121.5654
}
```

## 技術棧

- **框架**: Hono + Cloudflare Workers
- **語言**: TypeScript (strict mode)
- **測試**: Vitest (102 tests, 100% pass rate)
- **協定**: MCP 2024-11-05

## 開發

### 本地測試

```bash
npm test
```

### 型別檢查

```bash
npx tsc --noEmit
```

### 本地開發

```bash
npm run dev
```

## License

MIT
