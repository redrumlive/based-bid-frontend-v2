"use client";

import React from "react";
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineStyle,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

export type LightweightTerminalCandle = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type LightweightCreatorMarker = {
  index: number;
  side: "buy" | "sell";
  nativeAmount: number;
  quoteSymbol: string;
  time: string;
  usdValue: number;
};

type MainSeries = ISeriesApi<"Candlestick"> | ISeriesApi<"Area">;

type ChartPoint = LightweightTerminalCandle & {
  time: UTCTimestamp;
};

type CreatorOverlayPoint = LightweightCreatorMarker & {
  id: string;
  x: number;
  y: number;
  price: number;
  candleY: number;
  tooltipX: number;
  tooltipY: number;
};

const INTERVAL_SECONDS: Record<string, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3_600,
  "4h": 14_400,
  "1d": 86_400,
};

function formatUsd(value: number) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(value >= 10_000_000_000 ? 1 : 2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value >= 10_000_000 ? 1 : 2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(value >= 10_000 ? 1 : 2)}K`;
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function formatPrice(value: number) {
  if (value === 0) return "$0";
  if (value >= 1) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(6)}`;
}

export default function LightweightTerminalChart({
  tokenKey,
  ticker,
  candles,
  factor,
  basis,
  mode,
  timeframe,
  creatorMarkers = [],
  creatorMarkersVisible = true,
  compact = false,
}: {
  tokenKey: string;
  ticker: string;
  candles: LightweightTerminalCandle[];
  factor: number;
  basis: "marketCap" | "price";
  mode: "candles" | "line";
  timeframe: string;
  creatorMarkers?: LightweightCreatorMarker[];
  creatorMarkersVisible?: boolean;
  compact?: boolean;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const mainSeriesRef = React.useRef<MainSeries | null>(null);
  const volumeSeriesRef = React.useRef<ISeriesApi<"Histogram"> | null>(null);
  const pointLookupRef = React.useRef<Map<number, ChartPoint>>(new Map());
  const fitKeyRef = React.useRef("");
  const [cursorCandle, setCursorCandle] = React.useState<ChartPoint | null>(null);
  const [creatorOverlay, setCreatorOverlay] = React.useState<CreatorOverlayPoint[]>([]);
  const [hoveredCreatorId, setHoveredCreatorId] = React.useState<string | null>(null);

  const interval = INTERVAL_SECONDS[timeframe] ?? INTERVAL_SECONDS["15m"];
  const endTime = Math.floor(1_782_140_400 / interval) * interval;
  const points = React.useMemo<ChartPoint[]>(() => candles.map((candle, index) => ({
    ...candle,
    open: candle.open * factor,
    high: candle.high * factor,
    low: candle.low * factor,
    close: candle.close * factor,
    time: (endTime - (candles.length - index - 1) * interval) as UTCTimestamp,
  })), [candles, endTime, factor, interval]);
  const latestCandle = points[points.length - 1] ?? null;
  const valueFormatter = React.useCallback(
    (value: number) => basis === "marketCap" ? formatUsd(value) : formatPrice(value),
    [basis],
  );

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: compact ? "#0b0e0d" : "#0d100f" },
        textColor: "rgba(206,218,213,0.46)",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: compact ? 9 : 10,
        attributionLogo: true,
        panes: {
          enableResize: false,
          separatorColor: "rgba(255,255,255,0.055)",
          separatorHoverColor: "rgba(24,201,142,0.18)",
        },
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.055)", style: LineStyle.Solid },
        horzLines: { color: "rgba(255,255,255,0.065)", style: LineStyle.Solid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(167,181,175,0.38)", labelBackgroundColor: "#1a211e", style: LineStyle.Dashed },
        horzLine: { color: "rgba(167,181,175,0.34)", labelBackgroundColor: "#1a211e", style: LineStyle.Dashed },
      },
      rightPriceScale: {
        visible: true,
        borderVisible: true,
        borderColor: "rgba(255,255,255,0.09)",
        minimumWidth: compact ? 52 : 68,
        entireTextOnly: true,
        scaleMargins: { top: compact ? 0.1 : 0.12, bottom: compact ? 0.24 : 0.2 },
      },
      leftPriceScale: { visible: false },
      timeScale: {
        borderVisible: true,
        borderColor: "rgba(255,255,255,0.09)",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: compact ? 1.5 : 2.5,
        barSpacing: compact ? 4.5 : 6.5,
        minBarSpacing: 2,
        lockVisibleTimeRangeOnResize: true,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
      kineticScroll: { mouse: true, touch: true },
    });

    const priceFormat = { type: "custom" as const, formatter: valueFormatter, minMove: basis === "marketCap" ? 1 : 0.000001 };
    const mainSeries: MainSeries = mode === "candles"
      ? chart.addSeries(CandlestickSeries, {
        upColor: "#18c98e",
        downColor: "#ff3771",
        borderUpColor: "#18c98e",
        borderDownColor: "#ff3771",
        wickUpColor: "#18c98e",
        wickDownColor: "#ff3771",
        priceLineColor: "rgba(24,201,142,0.58)",
        priceLineStyle: LineStyle.Dashed,
        priceLineWidth: 1,
        lastValueVisible: true,
        priceLineVisible: true,
        priceFormat,
      })
      : chart.addSeries(AreaSeries, {
        lineColor: "#18c98e",
        lineWidth: 2,
        topColor: "rgba(24,201,142,0.22)",
        bottomColor: "rgba(24,201,142,0.006)",
        crosshairMarkerBackgroundColor: "#18c98e",
        crosshairMarkerBorderColor: "#0d100f",
        priceLineColor: "rgba(24,201,142,0.58)",
        priceLineStyle: LineStyle.Dashed,
        priceLineWidth: 1,
        lastValueVisible: true,
        priceLineVisible: true,
        priceFormat,
      });

    mainSeries.priceScale().applyOptions({
      scaleMargins: { top: compact ? 0.1 : 0.12, bottom: compact ? 0.25 : 0.21 },
    });
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "",
      priceFormat: { type: "volume" },
      priceLineVisible: false,
      lastValueVisible: false,
    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: compact ? 0.9 : 0.89, bottom: 0 } });
    chart.subscribeCrosshairMove((event) => {
      const candle = event.time ? pointLookupRef.current.get(Number(event.time)) : undefined;
      setCursorCandle(candle ?? null);
    });

    chartRef.current = chart;
    mainSeriesRef.current = mainSeries;
    volumeSeriesRef.current = volumeSeries;
    fitKeyRef.current = "";

    return () => {
      chart.remove();
      chartRef.current = null;
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [basis, compact, mode, tokenKey, valueFormatter]);

  const updateCreatorOverlay = React.useCallback(() => {
    const container = containerRef.current;
    const chart = chartRef.current;
    const mainSeries = mainSeriesRef.current;
    if (!container || !chart || !mainSeries || !creatorMarkersVisible || compact) {
      setCreatorOverlay([]);
      return;
    }

    const tooltipWidth = 172;
    const tooltipHeight = 52;
    const nextOverlay = creatorMarkers.flatMap<CreatorOverlayPoint>((creator, markerIndex) => {
      const point = points[Math.max(0, Math.min(points.length - 1, creator.index))];
      if (!point) return [];
      const x = chart.timeScale().timeToCoordinate(point.time);
      const candleY = mainSeries.priceToCoordinate(point.high);
      if (x === null || candleY === null) return [];
      const markerY = Math.max(13, Number(candleY) - 20);
      return [{
        ...creator,
        id: `creator-${creator.side}-${markerIndex}`,
        price: point.close,
        x: Number(x),
        y: markerY,
        candleY: Number(candleY),
        tooltipX: Number(x) + tooltipWidth + 12 > container.clientWidth ? Number(x) - tooltipWidth - 12 : Number(x) + 12,
        tooltipY: markerY < 76 ? markerY + 15 : markerY - tooltipHeight - 13,
      }];
    });
    setCreatorOverlay(nextOverlay);
  }, [compact, creatorMarkers, creatorMarkersVisible, points]);

  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    let frame = 0;
    const refresh = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateCreatorOverlay);
    };
    chart.timeScale().subscribeVisibleLogicalRangeChange(refresh);
    chart.timeScale().subscribeSizeChange(refresh);
    refresh();
    return () => {
      window.cancelAnimationFrame(frame);
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(refresh);
      chart.timeScale().unsubscribeSizeChange(refresh);
    };
  }, [updateCreatorOverlay]);

  React.useEffect(() => {
    const mainSeries = mainSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    if (!mainSeries || !volumeSeries || !points.length) return;

    pointLookupRef.current = new Map(points.map((point) => [Number(point.time), point]));
    if (mode === "candles") {
      (mainSeries as ISeriesApi<"Candlestick">).setData(points.map((point) => ({
        time: point.time,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
      })));
    } else {
      (mainSeries as ISeriesApi<"Area">).setData(points.map((point) => ({ time: point.time, value: point.close })));
    }
    volumeSeries.setData(points.map((point) => ({
      time: point.time,
      value: point.volume,
      color: point.close >= point.open ? "rgba(24,201,142,0.6)" : "rgba(255,55,113,0.6)",
    })));

    const fitKey = `${tokenKey}:${timeframe}:${points.length}:${mode}:${basis}:${compact}`;
    if (fitKeyRef.current !== fitKey) {
      chartRef.current?.timeScale().fitContent();
      fitKeyRef.current = fitKey;
    }
    window.requestAnimationFrame(updateCreatorOverlay);
  }, [basis, compact, mode, points, timeframe, tokenKey, updateCreatorOverlay]);

  const displayedCandle = cursorCandle ?? latestCandle;
  const creatorTooltip = creatorOverlay.find((creator) => creator.id === hoveredCreatorId) ?? null;

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#0d100f]">
      {!compact && displayedCandle ? (
        <div className="pointer-events-none absolute left-4 top-2 z-20 flex max-w-[calc(100%-88px)] items-center gap-2 overflow-hidden whitespace-nowrap font-mono text-[9.5px] text-white/43">
          <strong className="font-sans font-semibold text-white/82">{ticker}</strong>
          <span>·</span>
          <span>{timeframe}</span>
          <span>{basis === "marketCap" ? "Market cap" : "Price"}</span>
          <span>O {valueFormatter(displayedCandle.open)}</span>
          <span>H {valueFormatter(displayedCandle.high)}</span>
          <span>L {valueFormatter(displayedCandle.low)}</span>
          <span>C {valueFormatter(displayedCandle.close)}</span>
        </div>
      ) : null}
      <div ref={containerRef} className="absolute inset-0" aria-label={`${ticker} ${basis === "marketCap" ? "market cap" : "price"} chart`} />
      {creatorOverlay.length ? (
        <>
          <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden="true">
            {creatorOverlay.map((creator) => {
              const sideColor = creator.side === "buy" ? "#18c98e" : "#ff3771";
              const hovered = creator.id === hoveredCreatorId;
              return <line key={`${creator.id}-stem`} x1={creator.x} x2={creator.x} y1={creator.y + 7} y2={creator.candleY - 2} stroke={sideColor} strokeWidth={hovered ? 1.35 : 0.9} strokeDasharray="2 2" opacity={hovered ? 0.9 : 0.48} />;
            })}
          </svg>
          {creatorOverlay.map((creator) => {
            const sideColor = creator.side === "buy" ? "#18c98e" : "#ff3771";
            const hovered = creator.id === hoveredCreatorId;
            return (
              <button
                key={creator.id}
                type="button"
                aria-label={`Creator ${creator.side}. ${creator.nativeAmount.toFixed(2)} ${creator.quoteSymbol}, ${formatUsd(creator.usdValue)}, at ${creator.time}.`}
                onMouseEnter={() => setHoveredCreatorId(creator.id)}
                onMouseLeave={() => setHoveredCreatorId(null)}
                onFocus={() => setHoveredCreatorId(creator.id)}
                onBlur={() => setHoveredCreatorId(null)}
                className="absolute z-30 grid cursor-pointer place-items-center rounded-full outline-none transition-[width,height,filter] duration-150"
                style={{
                  left: creator.x,
                  top: creator.y,
                  width: hovered ? 19.5 : 16.5,
                  height: hovered ? 19.5 : 16.5,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: sideColor,
                  border: `${hovered ? 1.5 : 0.85}px solid rgba(255,255,255,0.48)`,
                  filter: hovered ? `drop-shadow(0 0 7px ${creator.side === "buy" ? "rgba(24,201,142,0.28)" : "rgba(255,55,113,0.26)"})` : "none",
                }}
              >
                <svg viewBox="0 0 24 24" className="h-[11px] w-[11px]" fill="none" aria-hidden="true">
                  <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7M5 20h14" stroke="#fff1b8" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            );
          })}
        </>
      ) : null}
      {creatorTooltip ? (
        <div
          className="pointer-events-none absolute z-40 h-[52px] w-[172px] rounded-[7px] border border-white/[0.13] bg-[#0b0e0d]/[0.985] px-[11px] pt-[7px] shadow-[0_18px_38px_rgba(0,0,0,0.52)]"
          style={{ left: creatorTooltip.tooltipX, top: creatorTooltip.tooltipY }}
        >
          <span className="absolute bottom-0 left-0 top-0 w-0.5 rounded-l-[7px]" style={{ backgroundColor: creatorTooltip.side === "buy" ? "#18c98e" : "#ff3771" }} />
          <div className="text-[8px] font-bold uppercase tracking-[0.0875em]" style={{ color: creatorTooltip.side === "buy" ? "#18c98e" : "#ff3771" }}>
            Creator {creatorTooltip.side}
          </div>
          <div className="mt-[3px] font-mono text-[9px] font-semibold text-white/90">{creatorTooltip.nativeAmount.toFixed(2)} {creatorTooltip.quoteSymbol}&nbsp;&nbsp;·&nbsp;&nbsp;{formatUsd(creatorTooltip.usdValue)}</div>
          <div className="mt-[3px] font-mono text-[8px] text-white/42">{creatorTooltip.time}&nbsp;&nbsp;·&nbsp;&nbsp;{valueFormatter(creatorTooltip.price)}</div>
        </div>
      ) : null}
      <span className="sr-only">Interactive chart powered by TradingView Lightweight Charts.</span>
    </div>
  );
}
