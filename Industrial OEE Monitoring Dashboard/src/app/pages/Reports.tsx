import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Download, FileText, BarChart2, TrendingUp, Bell } from 'lucide-react';
import { MACHINE_NAMES, getRangeMultiplier, getAlarmReportData, getReportMachineRows } from '../data/staticData';

const machines = ['All Machines', ...MACHINE_NAMES];

const predefinedRanges = [
  { label: 'Last Week', value: 'last_week' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Last 6 Months', value: 'last_6_months' },
];

function getOEEColor(oee: number) {
  if (oee >= 85) return '#10b981';
  if (oee >= 70) return '#f59e0b';
  return '#ef4444';
}

export function Reports() {
  const [reportType, setReportType] = useState<'oee' | 'downtime' | 'alarms'>('downtime');
  const [machine, setMachine] = useState('All Machines');
  const [rangeType, setRangeType] = useState('last_week');
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReturnType<typeof getReportMachineRows>>([]);
  const [alarmData, setAlarmData] = useState<ReturnType<typeof getAlarmReportData>>([]);

  const handleGenerate = () => {
    setLoading(true);
    const multiplier = getRangeMultiplier(rangeType, customRange.startDate, customRange.endDate);
    setTimeout(() => {
      setReportData(getReportMachineRows(multiplier));
      setAlarmData(getAlarmReportData(multiplier, machine));
      setLoading(false);
      setGenerated(true);
    }, 600);
  };

  const filteredRows = machine === 'All Machines'
    ? reportData
    : reportData.filter(r => r.machine === machine);

  const totalProduction = filteredRows.reduce((s, r) => s + r.production, 0);
  const totalScrap = filteredRows.reduce((s, r) => s + r.scrap, 0);
  const totalDowntime = filteredRows.reduce((s, r) => s + r.downtime, 0);
  const avgOEE = filteredRows.length ? (filteredRows.reduce((s, r) => s + r.oee, 0) / filteredRows.length).toFixed(1) : '0';

  const totalAlarmOccurrences = alarmData.reduce((s, r) => s + r.occurrences, 0);
  const totalAlarmDuration = alarmData.reduce((s, r) => s + r.totalDuration, 0);

  const rangeLabel = predefinedRanges.find(r => r.value === rangeType)?.label ?? '';

  return (
    <div className="space-y-6">

      {/* ── Form Card ── */}
      <Card className="p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
        <h3 className="font-semibold text-[var(--primary-color)] mb-5">Generate Report</h3>

        <div className="flex flex-wrap gap-5 items-end mb-5">

          {/* Report Type Toggle */}
          <div>
            <Label className="text-[var(--text-primary)] mb-1.5 block">Report Type</Label>
            <div className="flex border border-[var(--border-color)] rounded-lg overflow-hidden">
              <button
                onClick={() => setReportType('downtime')}
                className={`flex items-center gap-2 py-2 px-4 text-sm transition-colors ${reportType === 'downtime' ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'}`}
              >
                <FileText size={14} /> Downtime
              </button>
              <button
                onClick={() => setReportType('oee')}
                className={`flex items-center gap-2 py-2 px-4 text-sm transition-colors ${reportType === 'oee' ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'}`}
              >
                <TrendingUp size={14} /> OEE
              </button>
              <button
                onClick={() => setReportType('alarms')}
                className={`flex items-center gap-2 py-2 px-4 text-sm transition-colors ${reportType === 'alarms' ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'}`}
              >
                <Bell size={14} /> Alarms
              </button>
            </div>
          </div>

          {/* Machine Dropdown */}
          <div>
            <Label className="text-[var(--text-primary)] mb-1.5 block">Machine</Label>
            <Select value={machine} onValueChange={setMachine}>
              <SelectTrigger className="w-44 bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {machines.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <Label className="text-[var(--text-primary)] mb-1.5 block">Date Range</Label>
            <div className="flex border border-[var(--border-color)] rounded-lg overflow-hidden">
              <button
                onClick={() => setRangeType('last_week')}
                className={`py-2 px-4 text-sm transition-colors ${rangeType !== 'custom' ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'}`}
              >
                Predefined
              </button>
              <button
                onClick={() => setRangeType('custom')}
                className={`py-2 px-4 text-sm transition-colors ${rangeType === 'custom' ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'}`}
              >
                Custom
              </button>
            </div>
          </div>

          {rangeType !== 'custom' && (
            <div>
              <Label className="text-[var(--text-primary)] mb-1.5 block opacity-0 select-none">.</Label>
              <Select value={rangeType} onValueChange={setRangeType}>
                <SelectTrigger className="w-44 bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {predefinedRanges.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {rangeType === 'custom' && (
            <>
              <div>
                <Label htmlFor="startDate" className="text-[var(--text-primary)] mb-1.5 block">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customRange.startDate}
                  onChange={e => setCustomRange(c => ({ ...c, startDate: e.target.value }))}
                  className="w-44 bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-[var(--text-primary)] mb-1.5 block">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customRange.endDate}
                  onChange={e => setCustomRange(c => ({ ...c, endDate: e.target.value }))}
                  className="w-44 bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)]"
                />
              </div>
            </>
          )}

          <div>
            <Label className="text-[var(--text-primary)] mb-1.5 block opacity-0 select-none">.</Label>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2"><FileText size={16} /> Generate Report</span>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Report Output ── */}
      {generated && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--primary-color)]">
                {reportType === 'oee' ? 'OEE Report' : reportType === 'alarms' ? 'Alarms Report' : 'Production Report'} — {machine}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {rangeLabel}{rangeType === 'custom' && customRange.startDate ? `: ${customRange.startDate} → ${customRange.endDate}` : ''}
              </p>
            </div>
            <Button
              variant="outline"
              className="border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
              onClick={() => console.log('Download PDF')}
            >
              <Download size={15} className="mr-2" /> Download PDF
            </Button>
          </div>

          {reportType === 'downtime' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Production', value: totalProduction.toLocaleString(), color: 'var(--primary-color)', suffix: '' },
                { label: 'Total Scrap', value: totalScrap.toString(), color: '#ef4444', suffix: '' },
                { label: 'Total Downtime', value: totalDowntime.toString(), color: '#f59e0b', suffix: ' min' },
                { label: 'Average OEE', value: avgOEE, color: '#10b981', suffix: '%' },
              ].map(({ label, value, color, suffix }) => (
                <Card key={label} className="p-5 bg-[var(--card-bg)] border-[var(--border-color)]">
                  <p className="text-xs text-[var(--text-secondary)] mb-2">{label}</p>
                  <p className="text-2xl font-bold" style={{ color }}>{value}{suffix}</p>
                </Card>
              ))}
            </div>
          )}

          {reportType === 'oee' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Availability', value: '91.2%', color: '#4f6ef7' },
                { label: 'Performance', value: '88.5%', color: '#f59e0b' },
                { label: 'Quality', value: '96.8%', color: '#10b981' },
                { label: 'OEE Score', value: `${avgOEE}%`, color: getOEEColor(parseFloat(avgOEE)) },
              ].map(({ label, value, color }) => (
                <Card key={label} className="p-5 bg-[var(--card-bg)] border-[var(--border-color)]">
                  <p className="text-xs text-[var(--text-secondary)] mb-2">{label}</p>
                  <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                  <div className="mt-3 h-1.5 rounded-full bg-[var(--border-color)]">
                    <div className="h-1.5 rounded-full" style={{ width: value, backgroundColor: color, opacity: 0.8 }} />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {reportType === 'alarms' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Alarms', value: alarmData.length.toString(), color: '#ef4444', suffix: '' },
                { label: 'Total Occurrences', value: totalAlarmOccurrences.toString(), color: '#f59e0b', suffix: '' },
                { label: 'Total Duration', value: totalAlarmDuration.toString(), color: '#4f6ef7', suffix: ' min' },
                { label: 'Machines Affected', value: new Set(alarmData.map(a => a.machine)).size.toString(), color: '#10b981', suffix: '' },
              ].map(({ label, value, color, suffix }) => (
                <Card key={label} className="p-5 bg-[var(--card-bg)] border-[var(--border-color)]">
                  <p className="text-xs text-[var(--text-secondary)] mb-2">{label}</p>
                  <p className="text-2xl font-bold" style={{ color }}>{value}{suffix}</p>
                </Card>
              ))}
            </div>
          )}

          {reportType === 'alarms' ? (
            <Card className="p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
              <h3 className="font-semibold text-[var(--primary-color)] mb-4">Alarm Events</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-color)]">
                      {['Machine', 'Alarm Name', 'Occurrences', 'Total Duration (min)', 'Last Triggered'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alarmData.map((row, i) => (
                      <tr key={i} className="border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-[var(--text-primary)]">{row.machine}</td>
                        <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{row.alarm}</td>
                        <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{row.occurrences}</td>
                        <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{row.totalDuration}</td>
                        <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{row.lastTriggered}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
              <h3 className="font-semibold text-[var(--primary-color)] mb-4">
                {reportType === 'oee' ? 'OEE by Machine' : 'Machine Performance'}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-color)]">
                      <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Machine</th>
                      {reportType === 'downtime' ? (
                        <>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Total Production</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Scrap</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Downtime (min)</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">OEE %</th>
                        </>
                      ) : (
                        <>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Availability</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Performance</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Quality</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">OEE %</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, i) => (
                      <tr key={i} className="border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-[var(--text-primary)]">{row.machine}</td>
                        {reportType === 'downtime' ? (
                          <>
                            <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{row.production.toLocaleString()}</td>
                            <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{row.scrap}</td>
                            <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{row.downtime}</td>
                            <td className="py-3 px-4 text-sm font-semibold" style={{ color: getOEEColor(row.oee) }}>{row.oee}%</td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{(row.oee + 3.8).toFixed(1)}%</td>
                            <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{(row.oee + 1.2).toFixed(1)}%</td>
                            <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{(row.oee + 6.5).toFixed(1)}%</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-[var(--border-color)]">
                                  <div className="h-1.5 rounded-full" style={{ width: `${row.oee}%`, backgroundColor: getOEEColor(row.oee) }} />
                                </div>
                                <span className="text-sm font-semibold" style={{ color: getOEEColor(row.oee) }}>{row.oee}%</span>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {!generated && (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
          <BarChart2 size={40} className="mb-4 opacity-20" />
          <p className="text-sm">Configure the options above and click <span className="font-medium text-[var(--text-primary)]">Generate Report</span> to view results.</p>
        </div>
      )}
    </div>
  );
}
