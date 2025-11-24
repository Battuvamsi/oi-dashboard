import { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  theme: "light" | "dark";
}

function TradingViewWidget({ theme }: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      if (container.current) {
        // Clear existing widget
        container.current.innerHTML = "";
        
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = `
          {
            "allow_symbol_change": true,
            "calendar": false,
            "details": false,
            "hide_side_toolbar": true,
            "hide_top_toolbar": false,
            "hide_legend": false,
            "hide_volume": false,
            "hotlist": false,
            "interval": "D",
            "locale": "en",
            "save_image": true,
            "style": "1",
            "symbol": "BSE:SENSEX",
            "theme": "${theme}",
            "timezone": "Asia/Kolkata",
            "backgroundColor": "${theme === 'dark' ? '#0F0F0F' : '#FFFFFF'}",
            "gridColor": "rgba(242, 242, 242, 0.06)",
            "watchlist": [],
            "withdateranges": false,
            "compareSymbols": [],
            "studies": [],
            "autosize": true
          }`;
        
        // Create the widget structure
        const widgetContainer = document.createElement("div");
        widgetContainer.className = "tradingview-widget-container";
        widgetContainer.style.height = "100%";
        widgetContainer.style.width = "100%";
        
        const widget = document.createElement("div");
        widget.className = "tradingview-widget-container__widget";
        widget.style.height = "calc(100% - 32px)";
        widget.style.width = "100%";
        
        const copyright = document.createElement("div");
        copyright.className = "tradingview-widget-copyright";
        copyright.innerHTML = `<a href="https://www.tradingview.com/symbols/BSE-SENSEX/" rel="noopener nofollow" target="_blank"><span class="blue-text">SENSEX chart</span></a><span class="trademark"> by TradingView</span>`;
        
        widgetContainer.appendChild(widget);
        widgetContainer.appendChild(copyright);
        widgetContainer.appendChild(script);
        
        container.current.appendChild(widgetContainer);
      }
    },
    [theme]
  );

  return (
    <div ref={container} style={{ height: "100%", width: "100%" }} />
  );
}

export default memo(TradingViewWidget);