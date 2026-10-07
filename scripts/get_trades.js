import CDP from 'chrome-remote-interface';
import { writeFileSync } from 'fs';

async function run() {
  const targets = await (await fetch('http://localhost:9222/json/list')).json();
  const t = targets.find(t => t.url?.includes('tradingview.com'));
  if (!t) { console.error('No TradingView target'); process.exit(1); }
  const c = await CDP({ host: 'localhost', port: 9222, target: t.id });
  await c.Runtime.enable();

  const code = `
    (function() {
      try {
        var chart = window.TradingViewApi._activeChartWidgetWV.value()._chartWidget;
        var sources = chart.model().model().dataSources();
        var strat = null;
        for (var i = 0; i < sources.length; i++) {
          var s = sources[i];
          if (s.metaInfo && s.reportData) { strat = s; break; }
        }
        if (!strat) return {error: 'No strategy found'};
        var metrics = {};
        if (strat.reportData) {
          var rd = typeof strat.reportData === 'function' ? strat.reportData() : strat.reportData;
          if (rd && typeof rd === 'object') {
            if (typeof rd.value === 'function') rd = rd.value();
            if (rd) { var keys = Object.keys(rd); for (var k = 0; k < keys.length; k++) { var val = rd[keys[k]]; if (val !== null && val !== undefined && typeof val !== 'function') metrics[keys[k]] = val; } }
          }
        }
        
        var orders = null;
        if (strat.ordersData) { orders = typeof strat.ordersData === 'function' ? strat.ordersData() : strat.ordersData; if (orders && typeof orders.value === 'function') orders = orders.value(); }
        if (!orders || !Array.isArray(orders)) {
          if (strat._orders) orders = strat._orders;
          else if (strat.tradesData) { orders = typeof strat.tradesData === 'function' ? strat.tradesData() : strat.tradesData; if (orders && typeof orders.value === 'function') orders = orders.value(); }
        }
        var result = [];
        if (orders && Array.isArray(orders)) {
            for (var t = 0; t < Math.min(orders.length, 20); t++) {
              var o = orders[t];
              if (typeof o === 'object' && o !== null) {
                var trade = {};
                var okeys = Object.keys(o);
                for (var k = 0; k < okeys.length; k++) { var v = o[okeys[k]]; if (v !== null && v !== undefined && typeof v !== 'function' && typeof v !== 'object') trade[okeys[k]] = v; }
                result.push(trade);
              }
            }
        }
        return {metrics: metrics, trades: result};
      } catch(e) { return {error: e.message}; }
    })()
  `;

  const { result } = await c.Runtime.evaluate({ expression: code, returnByValue: true });
  console.log(JSON.stringify(result.value, null, 2));
  await c.close();
}
run();
