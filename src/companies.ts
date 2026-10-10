export type CompanyProfile = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  revenue: number;
  growth: number;
  debt: number;
  hype: number;
  quality: number;
  vol: number;
  founded: number;
  story: string;
  bullCase: string;
  bearCase: string;
  // Historical price anchors, relative to the campaign's opening price.
  anchors: number[];
  milestones: { day: number; title: string; detail: string }[];
  goodNews: string;
  badNews: string;
};

export const PROFILES: CompanyProfile[] = [
  {
    symbol: 'MHRD', name: 'MacroHard', sector: 'Technology', price: 100,
    revenue: 4200, growth: 12, debt: 800, hype: .75, quality: .8, vol: .024,
    founded: 1987,
    story: 'An office-software veteran rebuilding itself around cloud subscriptions. Recurring contracts fund a costly expansion into enterprise AI, while its original desktop business slowly matures.',
    bullCase: 'Cloud renewals and AI tools turn a mature software business into a recurring-growth engine.',
    bearCase: 'Data-center spending outruns demand; cheaper competitors pressure margins.',
    anchors: [.61, .76, .93, .85, 1],
    milestones: [
      {day:-503,title:'The cloud pivot',detail:'Management shifts investment from desktop licenses to recurring enterprise subscriptions.'},
      {day:-335,title:'Renewals accelerate',detail:'Large employers renew multi-year contracts. The market rewards more predictable revenue.'},
      {day:-168,title:'An expensive AI bet',detail:'New data centers push costs higher. Shares retreat as investors question the payback.'},
      {day:0,title:'Back to execution',detail:'A stronger renewal cycle restores confidence, but spending remains under scrutiny.'},
    ],
    goodNews: 'wins a multi-year cloud contract with a major logistics group.',
    badNews: 'reports rising data-center costs as enterprise customers delay upgrades.',
  },
  {
    symbol:'PEAR',name:'Pear',sector:'Consumer tech',price:180,revenue:6500,growth:8,debt:300,hype:.9,quality:.85,vol:.021,
    founded:1996,
    story:'A premium device maker whose loyal customers also pay for music, storage, and services. Its ecosystem is formidable, but each new phone must persuade people to replace a perfectly good old one.',
    bullCase:'A growing services business earns more from every installed device.',
    bearCase:'Longer replacement cycles and regulatory pressure erode ecosystem profits.',
    anchors:[.82,.72,.9,1.09,1],
    milestones:[
      {day:-503,title:'A mature franchise',detail:'Device sales flatten after a successful upgrade cycle.'},
      {day:-335,title:'Supply-chain reset',detail:'A factory disruption and softer demand force a difficult production reset.'},
      {day:-168,title:'Services take the lead',detail:'Storage and subscription revenue lift profits and drive a share-price recovery.'},
      {day:0,title:'High expectations',detail:'A celebrated product launch raises the bar for the next earnings report.'},
    ],goodNews:'reports stronger paid-service subscriptions across its device ecosystem.',badNews:'cuts device production targets as customers postpone upgrades.',
  },
  {
    symbol:'VOLT',name:'Volt Motors',sector:'Electric vehicles',price:65,revenue:1800,growth:26,debt:2100,hype:.85,quality:.55,vol:.045,
    founded:2011,
    story:'An ambitious electric-car challenger racing to scale its second factory. Deliveries are growing fast, but factories consume cash and rivals keep cutting prices. Its enthusiastic fan base amplifies every headline.',
    bullCase:'Higher production volumes spread factory costs across more cars.',
    bearCase:'Price wars and heavy borrowing overwhelm delivery growth.',
    anchors:[.55,1.3,.8,.64,1],
    milestones:[
      {day:-503,title:'The challenger arrives',detail:'Early deliveries establish a foothold in the premium electric-car market.'},
      {day:-335,title:'Factory fever',detail:'A second-factory announcement sends expectations soaring.'},
      {day:-168,title:'The price war',detail:'Rival discounts force margin cuts while construction debt grows.'},
      {day:0,title:'Production catches up',detail:'Factory output improves. Investors return, but the balance sheet remains stretched.'},
    ],goodNews:'raises deliveries as its new production line clears a bottleneck.',badNews:'cuts vehicle prices again while factory financing costs climb.',
  },
  {
    symbol:'NOVA',name:'Nova Labs',sector:'Biotech',price:32,revenue:320,growth:35,debt:420,hype:.6,quality:.4,vol:.06,
    founded:2015,
    story:'A small biotech funding an experimental therapy with licensing revenue. Clinical milestones can transform its outlook, but promising science still has to survive trials and expensive commercialization.',
    bullCase:'A successful trial unlocks a licensing partner and a much larger market.',
    bearCase:'Trial delays consume cash before the next funding round.',
    anchors:[1.15,.7,1.45,.82,1],
    milestones:[
      {day:-503,title:'Promising early data',detail:'Initial research attracts investors and a small licensing agreement.'},
      {day:-335,title:'Recruitment setback',detail:'Slow trial enrollment delays results and increases cash needs.'},
      {day:-168,title:'A volatile readout',detail:'Encouraging interim results trigger a rally, followed by profit-taking and funding concerns.'},
      {day:0,title:'Waiting on evidence',detail:'A new licensing payment extends the runway. The next trial remains the key uncertainty.'},
    ],goodNews:'signs a research licensing agreement that extends its cash runway.',badNews:'delays trial enrollment and increases its research budget.',
  },
  {
    symbol:'GRID',name:'Gridline Energy',sector:'Utilities',price:48,revenue:3100,growth:5,debt:1200,hype:.25,quality:.8,vol:.014,
    founded:1968,
    story:'A regulated electricity-network operator modernizing aging infrastructure. Demand is dependable and price moves are usually quieter, but new cables, substations, and refinancing all require patient capital.',
    bullCase:'Approved infrastructure investment increases the regulated earnings base.',
    bearCase:'Higher financing costs arrive before regulators approve higher tariffs.',
    anchors:[.91,.94,.88,.96,1],
    milestones:[
      {day:-503,title:'A dependable network',detail:'Steady electricity demand supports a predictable operating business.'},
      {day:-335,title:'Rates bite',detail:'Refinancing costs rise as the network begins a large modernization program.'},
      {day:-168,title:'Regulatory approval',detail:'An approved investment plan gives management a clearer path to recover costs.'},
      {day:0,title:'Building for demand',detail:'New industrial connections support modest growth without the excitement of technology stocks.'},
    ],goodNews:'receives approval to recover network-upgrade costs through future tariffs.',badNews:'faces higher refinancing costs on its infrastructure program.',
  },
  {
    symbol:'BLOOM',name:'Bloom Foods',sector:'Consumer staples',price:76,revenue:2600,growth:7,debt:350,hype:.35,quality:.85,vol:.016,
    founded:1979,
    story:'A pantry-brand owner selling everyday food through supermarkets. Familiar products support steady demand. Management is expanding healthier ranges while protecting margins against crop and packaging costs.',
    bullCase:'Brand loyalty and distribution gains support steady margins.',
    bearCase:'Shoppers trade down while ingredient costs squeeze profits.',
    anchors:[.79,.9,.83,.94,1],
    milestones:[
      {day:-503,title:'The pantry incumbent',detail:'Established supermarket relationships keep sales steady.'},
      {day:-335,title:'Ingredient inflation',detail:'Crop and packaging costs squeeze margins despite price increases.'},
      {day:-168,title:'A leaner operation',detail:'Factory efficiencies and calmer input prices rebuild profitability.'},
      {day:0,title:'New shelves',detail:'A healthier product range wins new distribution without a major increase in debt.'},
    ],goodNews:'wins supermarket shelf space for its higher-margin product range.',badNews:'reports higher crop costs as shoppers shift toward cheaper store brands.',
  },
];
