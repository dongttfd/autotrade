import CDP from 'chrome-remote-interface';
async function run() {
  const targets = await (await fetch('http://localhost:9222/json/list')).json();
  const t = targets.find(t => t.url?.includes('tradingview.com'));
  const c = await CDP({ host: 'localhost', port: 9222, target: t.id });
  await c.Runtime.enable();
  
  await c.Runtime.evaluate({ expression: 'window.TradingViewApi.activeChart().setSymbol("BINANCE:ARUSDT");' });
  
  await new Promise(r => setTimeout(r, 5000));
  await c.close();
}
run();
