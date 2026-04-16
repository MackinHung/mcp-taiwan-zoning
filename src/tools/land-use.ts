import type { Env, ToolResult } from '../types.js';
import {
  isWithinTaiwan,
  detectCityFromCoords,
  fetchNlscWfs,
} from '../client.js';

/**
 * query_land_use_classification: 查詢國土利用現況分類
 */
export async function queryLandUseClassification(
  _env: Env,
  args: Record<string, unknown>
): Promise<ToolResult> {
  try {
    const latitude = args.latitude as number;
    const longitude = args.longitude as number;

    const validationError = validateLandUseInput(latitude, longitude);
    if (validationError) return validationError;

    const city = detectCityFromCoords(latitude, longitude);
    const params = buildLandUseQueryParams(latitude, longitude);
    const data = await fetchNlscWfs('LUIMAP', params);

    if (!data.features || data.features.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `查無國土利用分類資料\n座標：${latitude}, ${longitude}${city ? `\n偵測城市：${city}` : ''}\n可能原因：該座標尚未進行國土利用調查`,
        }],
      };
    }

    return formatLandUseResults(data.features, latitude, longitude, city);
  } catch (err) {
    return {
      content: [{ type: 'text', text: `查詢國土利用分類失敗: ${(err as Error).message}` }],
      isError: true,
    };
  }
}

function validateLandUseInput(latitude: number, longitude: number): ToolResult | null {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return { content: [{ type: 'text', text: '錯誤：請提供有效的經緯度座標（latitude, longitude）' }], isError: true };
  }
  if (!isWithinTaiwan(latitude, longitude)) {
    return { content: [{ type: 'text', text: '錯誤：座標不在台灣範圍內（緯度 21.5-26.5, 經度 119.0-122.5）' }], isError: true };
  }
  return null;
}

function buildLandUseQueryParams(latitude: number, longitude: number): Record<string, string> {
  const bbox = `${longitude - 0.001},${latitude - 0.001},${longitude + 0.001},${latitude + 0.001}`;
  return {
    BBOX: bbox,
    SRSNAME: 'EPSG:4326',
    MAXFEATURES: '10',
  };
}

function formatLandUseResults(features: any[], latitude: number, longitude: number, city: string): ToolResult {
  const lines = features.map((f, i) => {
    const props = f.properties;
    const className = (props.LU_NAME ?? props.CLASS_NAME ?? '未知') as string;
    const classCode = (props.LU_CODE ?? props.CLASS_CODE ?? '') as string;
    const category = (props.CATEGORY ?? props.LU_CATEGORY ?? '') as string;
    const surveyDate = (props.SURVEY_DATE ?? props.UPDATE_DATE ?? '') as string;

    const parts = [`${i + 1}. 現況分類：${className}`];
    if (classCode) parts.push(`   類別代碼：${classCode}`);
    if (category) parts.push(`   大類：${category}`);
    if (surveyDate) parts.push(`   最近調查日期：${surveyDate}`);
    return parts.join('\n');
  });

  const header = [
    '國土利用現況分類查詢結果',
    `座標：${latitude}, ${longitude}`,
    city ? `城市：${city}` : null,
    `共 ${features.length} 筆資料`,
    '─'.repeat(30),
  ].filter(Boolean).join('\n');

  return { content: [{ type: 'text', text: `${header}\n${lines.join('\n\n')}` }] };
}
