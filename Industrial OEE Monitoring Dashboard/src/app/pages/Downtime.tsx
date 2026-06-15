import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MACHINE_NAMES } from '../data/staticData';

// ── Helpers ───────────────────────────────────────────────────────────────────

function minsToHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} hr`;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const machines = [...MACHINE_NAMES];

const summaryByMachine: Record<string, { shiftTime: number; breakTime: number; availableTime: number; unplannedTime: number }> = {
  'All Machines': { shiftTime: 480, breakTime: 60, availableTime: 360, unplannedTime: 60 },
  'Machine 1': { shiftTime: 480, breakTime: 45, availableTime: 375, unplannedTime: 60 },
  'Machine 2': { shiftTime: 480, breakTime: 60, availableTime: 350, unplannedTime: 70 },
  'Machine 3': { shiftTime: 480, breakTime: 50, availableTime: 380, unplannedTime: 50 },
  'Machine 4': { shiftTime: 480, breakTime: 55, availableTime: 365, unplannedTime: 60 },
  'Machine 5': { shiftTime: 480, breakTime: 40, availableTime: 390, unplannedTime: 50 },
};

interface OccurrenceDetail {
  from: string;
  to: string;
  duration: number;
}

interface DowntimeItem {
  error: string;
  duration: number;
  occurrences: number;
  details: OccurrenceDetail[];
}

const downtimeByMachine: Record<string, DowntimeItem[]> = {
  'All Machines': [
    {
      error: 'Material Shortage', duration: 45, occurrences: 3,
      details: [
        { from: '07:10', to: '07:25', duration: 15 },
        { from: '10:30', to: '10:45', duration: 15 },
        { from: '13:05', to: '13:20', duration: 15 },
      ],
    },
    {
      error: 'Tool Wear', duration: 28, occurrences: 2,
      details: [
        { from: '08:00', to: '08:14', duration: 14 },
        { from: '14:20', to: '14:34', duration: 14 },
      ],
    },
    {
      error: 'Machine Breakdown', duration: 67, occurrences: 1,
      details: [
        { from: '11:00', to: '12:07', duration: 67 },
      ],
    },
    {
      error: 'Changeover', duration: 35, occurrences: 4,
      details: [
        { from: '06:30', to: '06:39', duration: 9 },
        { from: '09:15', to: '09:24', duration: 9 },
        { from: '12:45', to: '12:53', duration: 8 },
        { from: '15:10', to: '15:19', duration: 9 },
      ],
    },
    {
      error: 'Quality Issue', duration: 22, occurrences: 2,
      details: [
        { from: '09:50', to: '10:01', duration: 11 },
        { from: '15:30', to: '15:41', duration: 11 },
      ],
    },
  ],
  'Machine 1': [
    { error: 'Tool Wear', duration: 20, occurrences: 1, details: [{ from: '08:00', to: '08:20', duration: 20 }] },
    { error: 'Changeover', duration: 15, occurrences: 2, details: [{ from: '10:00', to: '10:08', duration: 8 }, { from: '14:00', to: '14:07', duration: 7 }] },
    { error: 'Quality Issue', duration: 10, occurrences: 1, details: [{ from: '12:30', to: '12:40', duration: 10 }] },
  ],
  'Machine 2': [
    { error: 'Material Shortage', duration: 25, occurrences: 2, details: [{ from: '07:00', to: '07:12', duration: 12 }, { from: '13:00', to: '13:13', duration: 13 }] },
    { error: 'Machine Breakdown', duration: 40, occurrences: 1, details: [{ from: '11:00', to: '11:40', duration: 40 }] },
  ],
  'Machine 3': [
    { error: 'Over Temperature', duration: 30, occurrences: 2, details: [{ from: '09:15', to: '09:30', duration: 15 }, { from: '13:20', to: '13:35', duration: 15 }] },
    { error: 'Door Open', duration: 12, occurrences: 3, details: [{ from: '10:00', to: '10:04', duration: 4 }, { from: '11:30', to: '11:34', duration: 4 }, { from: '14:10', to: '14:14', duration: 4 }] },
  ],
  'Machine 4': [
    { error: 'Servo Fault', duration: 55, occurrences: 1, details: [{ from: '10:30', to: '11:25', duration: 55 }] },
    { error: 'Electrical Fault', duration: 22, occurrences: 1, details: [{ from: '13:00', to: '13:22', duration: 22 }] },
  ],
  'Machine 5': [
    { error: 'Changeover', duration: 18, occurrences: 2, details: [{ from: '08:30', to: '08:39', duration: 9 }, { from: '14:30', to: '14:39', duration: 9 }] },
    { error: 'Coolant Low', duration: 12, occurrences: 1, details: [{ from: '11:15', to: '11:27', duration: 12 }] },
  ],
};

const CHART_COLORS = ['#4f6ef7', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

// ── Component ─────────────────────────────────────────────────────────────────

export function Downtime() {
  const [machine, setMachine] = useState(MACHINE_NAMES[0]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const summary = summaryByMachine[machine];
  const data = downtimeByMachine[machine];

  const summaryCards = [
    { label: 'Shift Time', value: summary.shiftTime, color: '#4f6ef7' },
    { label: 'Break Time', value: summary.breakTime, color: '#f59e0b' },
    { label: 'Available Time', value: summary.availableTime, color: '#10b981' },
    { label: 'Unplanned Time', value: summary.unplannedTime, color: '#ef4444' },
  ];

  const toggleRow = (error: string) => setExpandedRow(prev => prev === error ? null : error);

  const categories = data.map(d => d.error);
  const durations = data.map(d => d.duration);
  const occurrences = data.map(d => d.occurrences);

  const baseChartOptions = {
    chart: {
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: { enabled: true, easing: 'easeinout' as const, speed: 500 },
      background: 'transparent',
    },
    grid: {
      borderColor: 'rgba(100,116,139,0.15)',
      strokeDashArray: 5,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { left: 4, right: 8 },
    },
    tooltip: {
      theme: 'dark' as const,
      style: { fontSize: '13px' },
    },
    states: {
      hover: { filter: { type: 'lighten' as const, value: 0.08 } },
      active: { filter: { type: 'darken' as const, value: 0.1 } },
    },
  };

  const barOptions = (unit: string) => ({
    ...baseChartOptions,
    plotOptions: {
      bar: {
        borderRadius: 7,
        borderRadiusApplication: 'end' as const,
        columnWidth: '48%',
        distributed: true,
      },
    },
    colors: CHART_COLORS,
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories,
      labels: {
        rotate: -30,
        style: { fontSize: '11px', colors: categories.map(() => 'var(--text-secondary)') },
        trim: true,
        maxHeight: 60,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: ['var(--text-secondary)'], fontSize: '11px' },
        formatter: (v: number) => unit === 'min' ? `${v}m` : `${v}`,
      },
    },
    fill: {
      type: 'gradient' as const,
      gradient: {
        shade: 'light' as const,
        type: 'vertical' as const,
        shadeIntensity: 0.25,
        opacityFrom: 0.95,
        opacityTo: 0.55,
        stops: [0, 100],
      },
    },
    tooltip: {
      ...baseChartOptions.tooltip,
      y: { formatter: (v: number) => unit === 'min' ? `${v} min` : `${v} times` },
    },
  });

  const donutOptions = {
    ...baseChartOptions,
    labels: categories,
    colors: CHART_COLORS,
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '62%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              formatter: (w: any) => `${w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)} min`,
            },
            value: {
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              formatter: (v: string) => `${v}m`,
            },
          },
        },
      },
    },
    stroke: { width: 0 },
    legend: {
      position: 'bottom' as const,
      fontSize: '12px',
      labels: { colors: 'var(--text-secondary)' },
      markers: { width: 8, height: 8, radius: 8 },
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    tooltip: {
      ...baseChartOptions.tooltip,
      y: { formatter: (v: number) => `${v} min` },
    },
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--primary-color)]">Downtime Analysis</h2>
        <Select value={machine} onValueChange={setMachine}>
          <SelectTrigger className="w-full sm:w-44 bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {machines.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {summaryCards.map(({ label, value, color }) => (
          <Card key={label} className="p-3 sm:p-5 bg-[var(--card-bg)] border-[var(--border-color)]">
            <p className="text-xs text-[var(--text-secondary)] mb-1.5 sm:mb-2">{label}</p>
            <p className="text-base sm:text-xl font-bold" style={{ color }}>{minsToHHMM(value)}</p>
            <div className="mt-2 sm:mt-3 h-1.5 rounded-full bg-[var(--border-color)]">
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((value / summary.shiftTime) * 100, 100)}%`, backgroundColor: color, opacity: 0.8 }}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Duration Bar Chart */}
        <Card className="p-4 sm:p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
          <h3 className="font-semibold text-sm sm:text-base text-[var(--primary-color)] mb-0.5">Downtime Duration</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-3">Total minutes per error type</p>
          <div className="w-full overflow-hidden">
            <ReactApexChart
              type="bar"
              height={240}
              series={[{ name: 'Duration', data: durations }]}
              options={barOptions('min')}
            />
          </div>
        </Card>

        {/* Donut Chart */}
        <Card className="p-4 sm:p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
          <h3 className="font-semibold text-sm sm:text-base text-[var(--primary-color)] mb-0.5">Downtime Distribution</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-3">Share of total downtime by reason</p>
          <div className="w-full overflow-hidden">
            <ReactApexChart
              type="donut"
              height={240}
              series={durations}
              options={donutOptions}
            />
          </div>
        </Card>
      </div>

      {/* ── Downtime Events Table ── */}
      <Card className="bg-[var(--card-bg)] border-[var(--border-color)] overflow-hidden">
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-2">
          <h3 className="font-semibold text-sm sm:text-base text-[var(--primary-color)]">Downtime Events</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Click a row to expand occurrence details</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="w-8 sm:w-10 py-2.5 sm:py-3 px-2 sm:px-4" />
                <th className="text-left py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Error Name</th>
                <th className="text-left py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Total Duration</th>
                <th className="text-left py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Occurrences</th>
                <th className="text-left py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const isExpanded = expandedRow === item.error;
                const avgMins = item.duration / item.occurrences;
                const avgH = Math.floor(avgMins / 60);
                const avgM = Math.round(avgMins % 60);
                const avgStr = avgH > 0 ? `${avgH}h ${avgM}m` : `${avgM} min`;

                return (
                  <React.Fragment key={item.error}>
                    <tr
                      className="border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors cursor-pointer select-none"
                      onClick={() => toggleRow(item.error)}
                    >
                      <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-[var(--text-secondary)]">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </td>
                      <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[var(--text-primary)]">{item.error}</td>
                      <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-[var(--text-primary)]">{minsToHHMM(item.duration)}</td>
                      <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-[var(--text-primary)]">{item.occurrences}</td>
                      <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-[var(--text-primary)]">{avgStr}</td>
                    </tr>

                    {isExpanded && (
                      <tr className="border-b border-[var(--border-color)]">
                        <td colSpan={5} className="px-3 sm:px-6 py-0">
                          <div className="bg-[var(--hover-bg)] rounded-lg my-2 sm:my-3 overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[320px]">
                                <thead>
                                  <tr className="border-b border-[var(--border-color)]">
                                    <th className="text-left py-2 px-3 sm:px-4 text-xs font-medium text-[var(--text-secondary)]">#</th>
                                    <th className="text-left py-2 px-3 sm:px-4 text-xs font-medium text-[var(--text-secondary)]">From</th>
                                    <th className="text-left py-2 px-3 sm:px-4 text-xs font-medium text-[var(--text-secondary)]">To</th>
                                    <th className="text-left py-2 px-3 sm:px-4 text-xs font-medium text-[var(--text-secondary)]">Duration</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.details.map((d, idx) => (
                                    <tr key={idx} className={idx < item.details.length - 1 ? 'border-b border-[var(--border-color)]' : ''}>
                                      <td className="py-2 px-3 sm:px-4 text-xs text-[var(--text-secondary)]">{idx + 1}</td>
                                      <td className="py-2 px-3 sm:px-4 text-xs font-medium text-[var(--text-primary)]">{d.from}</td>
                                      <td className="py-2 px-3 sm:px-4 text-xs font-medium text-[var(--text-primary)]">{d.to}</td>
                                      <td className="py-2 px-3 sm:px-4 text-xs text-[var(--text-primary)]">{minsToHHMM(d.duration)}</td>
                                    </tr>
                                  ))}
                                  <tr className="border-t border-[var(--border-color)] bg-[var(--card-bg)]">
                                    <td colSpan={3} className="py-2 px-3 sm:px-4 text-xs font-semibold text-[var(--text-secondary)]">Total</td>
                                    <td className="py-2 px-3 sm:px-4 text-xs font-semibold text-[var(--primary-color)]">{minsToHHMM(item.duration)}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Occurrences Chart ── */}
      <Card className="p-4 sm:p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
        <h3 className="font-semibold text-sm sm:text-base text-[var(--primary-color)] mb-0.5">Occurrences by Reason</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-3">Number of times each error occurred</p>
        <div className="w-full overflow-hidden">
          <ReactApexChart
            type="bar"
            height={220}
            series={[{ name: 'Occurrences', data: occurrences }]}
            options={barOptions('count')}
          />
        </div>
      </Card>

    </div>
  );
}