import type { Candle } from './engine.ts';

// Combine real OHLC observations, never average away highs or lows.
export function aggregateCandles(candles: Candle[], maxBars = 84): Candle[] {
  const size = Math.max(1, Math.ceil(candles.length / maxBars));
  const result: Candle[] = [];
  for(let i=0;i<candles.length;i+=size){
    const group=candles.slice(i,i+size);
    result.push({day:group.at(-1)!.day,open:group[0].open,close:group.at(-1)!.close,
      high:Math.max(...group.map(c=>c.high)),low:Math.min(...group.map(c=>c.low))});
  }
  return result;
}

