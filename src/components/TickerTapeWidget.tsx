import { useEffect, useRef, memo } from 'react';

function TickerTapeWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      if (container.current) {
        // Clear existing widget
        container.current.innerHTML = "";
        
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = `
          {
            "symbols": [
              {
                "proName": "FOREXCOM:SPXUSD",
                "title": "S&P 500 Index"
              },
              {
                "proName": "FOREXCOM:NSXUSD",
                "title": "US 100 Cash CFD"
              },
              {
                "proName": "FX_IDC:EURUSD",
                "title": "EUR to USD"
              },
              {
                "proName": "BITSTAMP:BTCUSD",
                "title": "Bitcoin"
              },
              {
                "proName": "BITSTAMP:ETHUSD",
                "title": "Ethereum"
              },
              {
                "proName": "CAPITALCOM:DXY",
                "title": "DXY"
              }
            ],
            "colorTheme": "dark",
            "locale": "en",
            "largeChartUrl": "",
            "isTransparent": false,
            "showSymbolLogo": true,
            "displayMode": "adaptive"
          }`;
        
        // Create the widget structure
        const widgetContainer = document.createElement("div");
        widgetContainer.className = "tradingview-widget-container";
        
        const widget = document.createElement("div");
        widget.className = "tradingview-widget-container__widget";
        
        const copyright = document.createElement("div");
        copyright.className = "tradingview-widget-copyright";
        copyright.innerHTML = `<a href="https://www.tradingview.com/markets/" rel="noopener nofollow" target="_blank"><span class="blue-text">Ticker tape</span></a><span class="trademark"> by TradingView</span>`;
        
        widgetContainer.appendChild(widget);
        widgetContainer.appendChild(copyright);
        widgetContainer.appendChild(script);
        
        container.current.appendChild(widgetContainer);
      }
    },
    []
  );

  return (
    <div className="w-full h-[72px] overflow-hidden border-b border-border">
      <div ref={container} className="tradingview-widget-container" />
    </div>
  );
}

export default memo(TickerTapeWidget);
