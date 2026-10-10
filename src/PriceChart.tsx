import { useState } from 'react';
import { aggregateCandles } from './chart-data';
import { dateForDay } from './engine';
import type { Candle } from './engine';

export type ChartMode = 'line' | 'candles';
export type ChartRange = '1M' | '6M' | '2Y' | 'All';
export const rangeDays: Record<ChartRange, number> = {'1M':21,'6M':126,'2Y':504,'All':Infinity};

export default function PriceChart({candles,mode,range}:{candles:Candle[];mode:ChartMode;range:ChartRange}) {
  const [hover,setHover]=useState<number|null>(null);
  const visible=candles.slice(-rangeDays[range]);
  const bars=aggregateCandles(visible);
  const unit=Math.max(1,Math.ceil(visible.length/84));
  const low=Math.min(...bars.map(b=>b.low));
  const high=Math.max(...bars.map(b=>b.high));
  const padding=Math.max((high-low)*.12,high*.003);
  const min=low-padding,max=high+padding;
  const y=(value:number)=>200-(value-min)/(max-min)*175;
  const step=650/bars.length;
  const x=(i:number)=>20+step*(i+.5);
  const active=bars[Math.min(hover??bars.length-1,bars.length-1)];
  const line=bars.map((b,i)=>`${x(i)},${y(b.close)}`).join(' ');
  const fmt=(v:number)=>new Intl.NumberFormat('en-IE',{maximumFractionDigits:2}).format(v);
  return <div className="price-chart">
    <div className="ohlc" aria-live="off"><span>{dateForDay(active.day)}</span>{(['open','high','low','close'] as const).map(k=><span key={k}>{k[0].toUpperCase()} <b>{fmt(active[k])}</b></span>)}</div>
    <svg viewBox="0 0 740 230" className="ohlc-chart" tabIndex={0} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setHover(h=>Math.max(0,Math.min(bars.length-1,(h??bars.length-1)+(e.key==='ArrowLeft'?-1:1))));}}} role="img" aria-label={`${mode==='candles'?'Candlestick':'Line'} chart, ${dateForDay(visible[0].day)} to ${dateForDay(visible.at(-1)!.day)}. Latest close €${active.close.toFixed(2)}`}
      onPointerMove={e=>{const box=e.currentTarget.getBoundingClientRect();const px=(e.clientX-box.left)/box.width*740;setHover(Math.max(0,Math.min(bars.length-1,Math.floor((px-20)/step))));}}
      onPointerLeave={()=>setHover(null)}>
      {[0,.5,1].map(f=>{const value=min+(max-min)*f;return <g key={f}><line x1="20" x2="670" y1={y(value)} y2={y(value)} className="gridline"/><text x="680" y={y(value)+4}>{fmt(value)}</text></g>;})}
      {mode==='line'?<><polygon points={`${x(0)},200 ${line} ${x(bars.length-1)},200`} fill="var(--lime)" opacity=".06"/><polyline points={line} fill="none" stroke="var(--lime)" strokeWidth="2"/></>:bars.map((b,i)=>{const color=b.close>=b.open?'var(--lime)':'#ff9389';return <g key={b.day}><title>{dateForDay(b.day)}: open {fmt(b.open)}, high {fmt(b.high)}, low {fmt(b.low)}, close {fmt(b.close)}</title><line x1={x(i)} x2={x(i)} y1={y(b.high)} y2={y(b.low)} stroke={color}/><rect x={x(i)-step*.28} y={Math.min(y(b.open),y(b.close))} width={Math.max(1,step*.56)} height={Math.max(1.5,Math.abs(y(b.close)-y(b.open)))} fill={color}/></g>;})}
      {hover!==null&&<line x1={x(hover)} x2={x(hover)} y1="20" y2="202" stroke="#889983" strokeDasharray="3 4"/>}
    </svg>
    <div className="chart-label"><span>{dateForDay(visible[0].day)}</span><span>{unit===1?'DAILY':`${unit}-SESSION BARS`} · EUR</span><span>{dateForDay(visible.at(-1)!.day)}</span></div>
    <p className="chart-hint">{mode==='candles'?'Body: open → close. Wick: high / low. Green closes up; red closes down.':'Closing prices across the selected period.'} The last bar updates live.</p>
  </div>;
}
