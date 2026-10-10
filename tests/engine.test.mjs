import assert from 'node:assert/strict';
import {createGame,trade,advance,tick,worth,benchmark,restoreGame,dateForDay,MAX_BARS} from '../src/engine.ts';
import {aggregateCandles} from '../src/chart-data.ts';
const validBars=g=>g.companies.every(c=>c.candles.every(b=>b.low>0&&b.high>=Math.max(b.open,b.close)&&b.low<=Math.min(b.open,b.close)&&[b.open,b.high,b.low,b.close].every(Number.isFinite))&&c.candles.at(-1).close===c.price);
let a=createGame(123),b=createGame(123);
assert.deepEqual(a,b);
assert.equal(a.companies[0].candles.length,505);
assert.equal(a.companies[0].candles[0].day,-503);
assert.equal(dateForDay(1),'2026-01-05');
assert.equal(dateForDay(0),'2026-01-02');
assert.equal(dateForDay(6),'2026-01-12');
assert(a.companies.every(c=>c.milestones.length===4&&c.candles.at(-2).close===c.initial));
assert(validBars(a));
assert.throws(()=>trade(a,'MHRD',101,'buy'));
assert.throws(()=>trade(a,'MHRD',1,'sell'));
assert.throws(()=>trade(a,'MHRD',1.5,'buy'));
assert.throws(()=>trade(a,'MHRD',Infinity,'buy'));
a=trade(a,'MHRD',5,'buy');
assert.equal(a.cash,9499);assert.equal(a.holdings.MHRD.shares,5);assert.equal(worth(a),9999);
a=trade(a,'MHRD',2,'sell');
assert.equal(a.holdings.MHRD.shares,3);assert(Math.abs(a.holdings.MHRD.cost-300.6)<1e-9);
a=trade(a,'MHRD',3,'sell');assert.equal(a.cash,9997);assert.equal(a.holdings.MHRD.cost,0);
// Live prices only change the current candle and portfolio marks, not cash or past bars.
a=trade(createGame(123),'MHRD',5,'buy');
const original=structuredClone(a);const snapshots=a.companies.map(c=>structuredClone(c.candles.slice(0,-1)));
let moved=false,up=false,down=false;
for(let i=0;i<200;i++){
 const old=a;a=tick(a);
 assert(validBars(a));
 a.companies.forEach((c,j)=>{moved ||= c.price!==old.companies[j].price;up ||= c.price>old.companies[j].price;down ||= c.price<old.companies[j].price;});
}
assert(moved&&up&&down);assert.equal(a.day,1);assert.equal(a.seed,original.seed);assert.equal(a.cash,original.cash);
assert.equal(a.equity.at(-1),worth(a));
a.companies.forEach((c,i)=>assert.deepEqual(c.candles.slice(0,-1),snapshots[i]));
const last=structuredClone(a.companies[0].candles.at(-1));
b=advance(a);assert.deepEqual(b.companies[0].candles.at(-2),last);assert.equal(b.companies[0].candles.at(-1).open,last.close);
assert(validBars(b));
// A seed plus the same pulse/day sequence reproduces the market exactly.
a=createGame(123);b=createGame(123);
for(let i=0;i<100;i++){a=advance(tick(a));b=advance(tick(b));assert.deepEqual(a,b);}
assert.equal(a.day,101);assert.doesNotThrow(()=>trade(a,'MHRD',1,'buy'));
assert(Number.isFinite(benchmark(a)));
// Long campaigns remain open and numerically well formed.
a=createGame(55);
for(let i=0;i<800;i++)a=advance(a);
assert.equal(a.day,801);assert(validBars(a));assert(a.companies.every(c=>c.milestones.length<=36));
a.day=10000;assert.equal(advance(a).day,10001);assert.doesNotThrow(()=>trade(a,'MHRD',1,'buy'));
// Rolling history is bounded independently from campaign duration.
a=createGame(1);a.day=MAX_BARS;
a.companies.forEach(c=>{c.candles=Array.from({length:MAX_BARS},(_,i)=>({...c.candles.at(-1),day:i+1}));});
a.equity=Array(MAX_BARS).fill(10000);
a=advance(a);assert.equal(a.day,MAX_BARS+1);assert.equal(a.equity.length,MAX_BARS);assert(a.companies.every(c=>c.candles.length===MAX_BARS));
// Aggregated candles preserve the full period's extrema and endpoints.
const bars=[{day:1,open:10,high:15,low:8,close:12},{day:2,open:12,high:19,low:9,close:17},{day:3,open:17,high:20,low:15,close:16}];
assert.deepEqual(aggregateCandles(bars,1),[{day:3,open:10,high:20,low:8,close:16}]);
assert.deepEqual(aggregateCandles(bars),bars);
// Current saves round-trip. Original v1 positions migrate without resetting progress.
a=trade(createGame(123),'MHRD',5,'buy');
assert.deepEqual(restoreGame(JSON.parse(JSON.stringify(a))),a);
const legacy={...a,version:1,day:61,companies:a.companies.map(({candles,milestones,...c})=>({...c,history:[c.initial,c.price]}))};
const migrated=restoreGame(legacy);assert(migrated);assert.equal(migrated.day,61);assert.equal(migrated.cash,9499);assert.deepEqual(migrated.holdings,a.holdings);assert(validBars(migrated));
assert.equal(advance(migrated).day,62);assert.equal(restoreGame(null),null);assert.equal(restoreGame({...a,cash:NaN}),null);
console.log('Passed: historical candles, dates, trading, live ticks, OHLC aggregation, deterministic replay, 800-day campaign, rolling retention, and v1/v2 save migration.');
