import { PROFILES } from './companies.ts';

export type Candle = { day: number; open: number; high: number; low: number; close: number };
export type Milestone = { day: number; title: string; detail: string };
export type Company = {
  symbol: string; name: string; sector: string; price: number; initial: number;
  revenue: number; growth: number; debt: number; hype: number; quality: number;
  vol: number; candles: Candle[]; change: number; reason: string;
  milestones: Milestone[];
};
export type Post = {
  day: number; author: string; handle: string; text: string;
  kind: 'report' | 'rumor' | 'macro'; symbol?: string;
};
export type Game = {
  version: 2; seed: number; liveSeed: number; day: number; ticks: number; cash: number;
  companies: Company[]; holdings: Record<string, { shares: number; cost: number }>;
  posts: Post[]; trades: string[]; equity: number[]; regime: number; fees: number;
};
// Keep memory/save size bounded without limiting the campaign's duration.
export const MAX_BARS = 2520;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const price = (n: number) => Math.round(clamp(n, 1, 1e9) * 100) / 100;
function next(seed: number) { return (Math.imul(1664525, seed) + 1013904223) >>> 0; }
function random(g: Game) { g.seed = next(g.seed); return g.seed / 4294967296; }
function liveRandom(g: Game) { g.liveSeed = next(g.liveSeed); return g.liveSeed / 4294967296; }

// Day 1 is Monday 5 January 2026; negative days are the fictional pre-campaign history.
export function dateForDay(day: number): string {
  const offset = day - 1;
  const weeks = Math.floor(offset / 5);
  const weekday = ((offset % 5) + 5) % 5;
  return new Date(Date.UTC(2026, 0, 5 + weeks * 7 + weekday)).toISOString().slice(0, 10);
}

function prehistory(index: number, seed: number): Candle[] {
  const p = PROFILES[index];
  let state = (seed ^ Math.imul(index + 1, 2654435761)) >>> 0;
  const r = () => { state = next(state); return state / 4294967296; };
  let previous = price(p.price * p.anchors[0]);
  return Array.from({ length: 504 }, (_, i) => {
    const t = i / 503 * 4;
    const segment = Math.min(3, Math.floor(t));
    const weight = t - segment;
    const base = p.anchors[segment] * (1 - weight) + p.anchors[segment + 1] * weight;
    const noise = (r() - .5) * p.vol * Math.sin(Math.PI * weight);
    const close = i === 503 ? p.price : price(p.price * (base + noise));
    const open = previous;
    const high = price(Math.max(open, close) * (1 + r() * p.vol * .45));
    const low = price(Math.min(open, close) * (1 - r() * p.vol * .45));
    previous = close;
    return { day: i - 503, open, high, low, close };
  });
}

export const worth = (g: Game) => g.cash + g.companies.reduce((s, c) => s + c.price * (g.holdings[c.symbol]?.shares || 0), 0);
export const benchmark = (g: Game) => 10000 * g.companies.reduce((s, c) => s + c.price / c.initial, 0) / g.companies.length;

export function createGame(seed = Math.floor(Math.random() * 2147483646) + 1): Game {
  seed = seed >>> 0;
  return {
    version: 2, seed, liveSeed: (seed ^ 0xa5a5a5a5) >>> 0, day: 1, ticks: 0, cash: 10000,
    companies: PROFILES.map((p, i) => ({
      symbol: p.symbol, name: p.name, sector: p.sector, price: p.price, initial: p.price,
      revenue: p.revenue, growth: p.growth, debt: p.debt, hype: p.hype, quality: p.quality, vol: p.vol,
      candles: [...prehistory(i, seed), {day: 1, open: p.price, high: p.price, low: p.price, close: p.price}],
      change: 0, reason: p.milestones.at(-1)!.detail, milestones: structuredClone(p.milestones),
    })),
    holdings: {},
    posts: [
      {day:1,author:'The Opening Bell',handle:'openingbell',kind:'macro',text:'The market is open. Six businesses, two years of history, and an unlimited horizon. Live prices drift between sessions; earnings arrive every 10 trading days.'},
      {day:1,author:'Mira Chen',handle:'mira_research',kind:'report',text:'Read the company timeline before chasing the chart. Every business arrives here with a different history.'},
      {day:1,author:'Moon Capital',handle:'definitely_not_a_fund',kind:'rumor',symbol:'VOLT',text:'$VOLT survived a price war. Does that make it a bargain? My extremely scientific group chat says yes. 🚀'},
    ],
    trades: [], equity: [10000], regime: 0, fees: 0,
  };
}

function markPrice(c: Company, value: number) {
  c.price = price(value);
  const candle = c.candles.at(-1)!;
  candle.high = Math.max(candle.high, c.price);
  candle.low = Math.min(candle.low, c.price);
  candle.close = c.price;
  const previousClose = c.candles.at(-2)?.close ?? candle.open;
  c.change = (c.price / previousClose - 1) * 100;
}

/** One live pulse: most quotes stay still; occasional orders move them slightly. */
export function tick(old: Game): Game {
  const g = structuredClone(old);
  g.ticks++;
  const r = () => liveRandom(g);
  for (const c of g.companies) {
    if (r() > .35) continue;
    const unusual = r() < .012;
    const move = (r() - .5) * (unusual ? .007 : .0012) * (c.vol / .024);
    markPrice(c, c.price * (1 + move));
  }
  g.equity[g.equity.length - 1] = worth(g);
  return g;
}

/** Close the existing candle and open the next trading day. No campaign end date. */
export function advance(old: Game): Game {
  const g = structuredClone(old);
  g.day++;
  g.ticks = 0;
  const r = () => random(g);
  if (g.day % 7 === 0) {
    g.regime = Math.floor(r() * 3) - 1;
    g.posts.unshift({day:g.day,author:'The Opening Bell',handle:'openingbell',kind:'macro',text:[
      'Risk-off week: financing worries weigh on highly indebted businesses.',
      'Markets settle into a mixed week. Company results take center stage.',
      'Risk-on week: traders return to growth stocks. Expectations are rising.',
    ][g.regime + 1]});
  }
  const target = Math.floor(r() * g.companies.length);
  const positive = r() > .48;
  const rumor = r() > .5;
  g.companies.forEach((c, i) => {
    const p = PROFILES[i];
    let shock = 0;
    // Growth drifts toward a sustainable company-specific baseline over long campaigns.
    c.growth = clamp(c.growth + (p.growth - c.growth) * .025 + (r() - .5) * 1.2, -25, 65);
    c.hype = clamp(c.hype * .96 + .02 + (r() - .5) * .055, 0, 1);
    let reason = 'Ordinary trading and changing expectations.';
    if (i === target) {
      shock = (positive ? 1 : -1) * (rumor ? .012 : .028);
      c.hype = clamp(c.hype + shock * 3, 0, 1);
      reason = rumor ? 'Unverified social chatter moves sentiment.' : `${c.name} ${positive ? p.goodNews : p.badNews}`;
      g.posts.unshift({day:g.day,author:rumor?'Moon Capital':'Mira Chen',handle:rumor?'definitely_not_a_fund':'mira_research',kind:rumor?'rumor':'report',symbol:c.symbol,
        text:rumor?`$${c.symbol}: ${positive?'Hearing whispers of a major deal. No documents yet; the crowd is waking up.':'Traders are nervous about the next update. Unconfirmed chatter, not a company statement.'}`:reason});
      if (!rumor) {
        c.growth = clamp(c.growth + (positive ? 1.5 : -1.5), -25, 65);
        c.milestones.push({day:g.day,title:positive?'Business momentum':'A new headwind',detail:reason});
      }
    }
    if (g.day % 10 === 0) {
      const surprise = (r() - .46) * .12;
      // Ten trading days of annualized growth, rather than the old accelerated seasonal model.
      c.revenue = clamp(c.revenue * (1 + c.growth / 100 * 10 / 252), 1, 1e12);
      c.debt = clamp(c.debt * (1 + (r() - .55) * .025), 0, 1e12);
      shock += surprise;
      reason = `Earnings ${surprise >= 0 ? 'beat' : 'miss'} expectations; revenue now €${Math.round(c.revenue)}m.`;
      c.milestones.push({day:g.day,title:surprise>=0?'Earnings beat':'Earnings miss',detail:reason});
      g.posts.unshift({day:g.day,author:'Earnings Wire',handle:'earningswire',kind:'report',symbol:c.symbol,text:`${c.name}: revenue €${Math.round(c.revenue)}m, growth ${c.growth.toFixed(1)}%, debt €${Math.round(c.debt)}m. Results ${surprise>=0?'beat':'miss'} expectations.`});
    }
    const fair = c.initial * (c.revenue / p.revenue) * (.85 + c.quality * .2);
    const reversion = clamp((fair / c.price - 1) * .008, -.006, .006);
    const debtDrag = g.regime < 0 ? -clamp(c.debt / c.revenue, 0, 5) * .002 : 0;
    const move = clamp((r()+r()+r()-1.5)*c.vol + g.regime*.003 + c.growth/100/252 + reversion + (c.hype-.5)*.003 + debtDrag + shock, -.24, .24);
    c.candles.push({day:g.day,open:c.price,high:c.price,low:c.price,close:c.price});
    markPrice(c, c.price * (1 + move));
    c.candles = c.candles.slice(-MAX_BARS);
    c.reason = reason;
    // Preserve the original company story plus the latest 32 campaign milestones.
    c.milestones = [...c.milestones.filter(m=>m.day<=0), ...c.milestones.filter(m=>m.day>0).slice(-32)];
  });
  g.posts = g.posts.slice(0, 70);
  g.equity = [...g.equity, worth(g)].slice(-MAX_BARS);
  return g;
}

export function trade(old: Game, symbol: string, quantity: number, side: 'buy' | 'sell'): Game {
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw Error('Enter a whole number of shares.');
  const c = old.companies.find(c => c.symbol === symbol);
  if (!c) throw Error('Unknown company.');
  const total = c.price * quantity;
  if (!Number.isFinite(total) || total > Number.MAX_SAFE_INTEGER) throw Error('Order is too large.');
  const fee = Math.max(1, total * .001);
  const g = structuredClone(old);
  const h = g.holdings[symbol] || {shares:0,cost:0};
  if (side === 'buy') {
    if (total + fee > g.cash) throw Error('Not enough cash, including the trading fee.');
    if (!Number.isSafeInteger(h.shares + quantity)) throw Error('Position is too large.');
    h.cost += total + fee; h.shares += quantity; g.cash -= total + fee;
  } else {
    if (quantity > h.shares) throw Error('You cannot sell more shares than you own.');
    h.cost *= 1 - quantity / h.shares; h.shares -= quantity; g.cash += total - fee;
  }
  g.holdings[symbol] = h;
  g.fees += fee;
  g.trades.unshift(`Day ${g.day} · ${side==='buy'?'Bought':'Sold'} ${quantity} ${symbol} at €${c.price.toFixed(2)} · fee €${fee.toFixed(2)}`);
  g.trades = g.trades.slice(0, 1000);
  g.equity[g.equity.length - 1] = worth(g);
  return g;
}

/** Upgrade the original save without discarding cash, positions or the current day. */
export function restoreGame(value: unknown): Game | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if ((v.version !== 1 && v.version !== 2) || !Array.isArray(v.companies) || v.companies.length !== 6
    || !Number.isSafeInteger(v.day) || (v.day as number) < 1 || !Number.isFinite(v.cash) || (v.cash as number)<0
    || !Number.isFinite(v.seed) || !v.holdings || typeof v.holdings !== 'object'
    || !Array.isArray(v.posts) || !Array.isArray(v.trades) || !Array.isArray(v.equity) || !v.equity.length) return null;
  const saved = structuredClone(v) as unknown as Game;
  if (!saved.companies.every((c,i)=>c?.symbol===PROFILES[i].symbol && ['price','initial','revenue','growth','debt','hype','quality','vol'].every(k=>Number.isFinite((c as unknown as Record<string,unknown>)[k])) && c.price>=1 && c.initial>0)) return null;
  if (!Object.entries(saved.holdings).every(([symbol,h])=>PROFILES.some(p=>p.symbol===symbol)&&h&&Number.isSafeInteger(h.shares)&&h.shares>=0&&Number.isFinite(h.cost)&&h.cost>=0)) return null;
  if (v.version === 1) {
    const fresh = createGame(saved.seed);
    saved.companies = saved.companies.map((c,i)=>{
      const legacy = c as Company & {history?:number[]};
      const history = legacy.history?.length ? legacy.history : [c.price];
      if (!history.every(n=>Number.isFinite(n)&&n>0)) throw Error('Invalid legacy price history.');
      const candles = history.map((close,j)=>{
        const open = j ? history[j-1] : c.initial;
        return {day:j+1,open,high:Math.max(open,close),low:Math.min(open,close),close};
      });
      candles[candles.length-1].day=saved.day;
      const last=candles[candles.length-1];
      last.close=c.price;last.high=Math.max(last.high,c.price);last.low=Math.min(last.low,c.price);
      const {history: _history, ...rest}=legacy;
      return {...rest,candles:[...fresh.companies[i].candles.slice(0,504),...candles].slice(-MAX_BARS),milestones:fresh.companies[i].milestones};
    });
    saved.version=2;saved.liveSeed=(saved.seed^0xa5a5a5a5)>>>0;saved.ticks=0;
  }
  if (!Number.isFinite(saved.liveSeed)||!Number.isFinite(saved.ticks)||![-1,0,1].includes(saved.regime)||!Number.isFinite(saved.fees)) return null;
  if (!saved.companies.every(c=>Array.isArray(c.milestones)&&Array.isArray(c.candles)&&c.candles.length>0&&c.candles.every(b=>[b.day,b.open,b.high,b.low,b.close].every(Number.isFinite)&&b.low>0&&b.high>=Math.max(b.open,b.close)&&b.low<=Math.min(b.open,b.close))&&c.candles.at(-1)!.close===c.price)) return null;
  saved.companies.forEach((c,i)=>{
    c.candles=c.candles.slice(-MAX_BARS);
    if(c.reason === 'Opening price. The first session is yours.') c.reason=PROFILES[i].milestones.at(-1)!.detail;
  });
  saved.posts=saved.posts.map(p=>p.text.includes('Sixty sessions to beat')?{...p,text:'The market is open. Six businesses, €10,000, and an unlimited horizon. Earnings arrive every 10 trading days.'}:p);
  saved.equity=saved.equity.slice(-MAX_BARS);saved.trades=saved.trades.slice(0,1000);saved.posts=saved.posts.slice(0,70);
  return saved;
}
