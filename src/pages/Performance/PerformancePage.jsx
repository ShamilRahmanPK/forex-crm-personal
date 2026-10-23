import { useEffect, useState } from 'react'
import BarChart from '../../components/charts/BarChart'
import Dropdown from '../../components/ui/Dropdown'
import InfoTip from '../../components/ui/InfoTip'
import Segmented from '../../components/ui/Segmented'
import SelectField from '../../components/ui/SelectField'
import { accountLabel, useAccounts } from '../../hooks/useAccounts'
import { getPerformance } from '../../services/api'
import page from '../../styles/page.module.css'
import styles from './Performance.module.css'

const PERIODS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 365, label: 'Last 365 days' },
]

const CHARTS = [
  { value: 'netProfit', label: 'Net profit', tooltip: 'Profit', money: true },
  { value: 'closedOrders', label: 'Closed orders', tooltip: 'Orders', money: false },
  { value: 'volume', label: 'Trading volume', tooltip: 'Volume', money: true },
  { value: 'equity', label: 'Equity', tooltip: 'Equity', money: true },
]

const money = (v) => `${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
const compact = (v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k` : String(Math.round(v * 100) / 100))
const tone = (v) => (v > 0 ? page.positive : v < 0 ? page.negative : undefined)

function Kpi({ label, info, value, children }) {
  return (
    <div className={styles.kpi}>
      <p className={styles.kpiLabel}>
        {label} <InfoTip text={info} />
      </p>
      <p className={styles.kpiValue}>{value}</p>
      <dl className={styles.kpiDetails}>{children}</dl>
    </div>
  )
}

const Detail = ({ label, value, info, className }) => (
  <div>
    <dt>{label}</dt>
    <dd className={className}>{value}</dd>
    {info && <InfoTip text={info} />}
  </div>
)

export default function PerformancePage() {
  const { accounts } = useAccounts()
  const [accountId, setAccountId] = useState('all')
  const [days, setDays] = useState(365)
  const [chart, setChart] = useState('netProfit')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let active = true
    getPerformance({ accountId, days }).then((s) => active && setStats(s))
    return () => {
      active = false
    }
  }, [accountId, days])

  const chartDef = CHARTS.find((c) => c.value === chart)
  const accountOptions = [{ value: 'all', label: 'All real accounts' }, ...(accounts ?? []).map((a) => ({ value: a.id, label: accountLabel(a) }))]

  return (
    <div className={page.page}>
      <h1 className={page.title}>Summary</h1>

      <div className={`${page.toolbar} ${styles.filters}`}>
        <SelectField
          label="Account"
          className={styles.accountSelect}
          options={accountOptions}
          value={accountId}
          onChange={(e) => {
            setStats(null)
            setAccountId(e.target.value)
          }}
        />
        <Dropdown
          label="Period"
          options={PERIODS}
          value={days}
          onChange={(d) => {
            setStats(null)
            setDays(d)
          }}
        />
      </div>

      {!stats ? (
        <div className={styles.skeleton} aria-busy="true" />
      ) : (
        <>
          <div className={styles.kpis}>
            <Kpi label="Net profit" info="Profit minus losses and trading costs for closed orders in the period" value={money(stats.netProfit)}>
              <Detail label="Profit" value={money(stats.profit)} />
              <Detail label="Loss" value={money(stats.loss)} />
              <Detail label="Trading cost" value={money(stats.tradingCost)} info="Commissions and swaps" />
              <Detail label="Unrealised P/L" value={money(stats.unrealisedPL)} className={tone(stats.unrealisedPL)} info="Floating profit or loss on open orders" />
            </Kpi>
            <Kpi label="Closed orders" info="Orders closed in the selected period" value={stats.closedOrders}>
              <Detail label="Profitable" value={stats.profitableOrders} />
              <Detail label="Unprofitable" value={stats.unprofitableOrders} />
            </Kpi>
            <Kpi label="Trading volume" info="Notional value of closed orders in USD" value={money(stats.volume)}>
              <Detail label="Lifetime" value={money(stats.lifetimeVolume)} />
            </Kpi>
            <Kpi label="Equity" info="Balance plus floating profit or loss" value={money(stats.equity)}>
              <Detail label="Current" value={money(stats.equity)} />
            </Kpi>
          </div>

          <section className={styles.charts}>
            <h2 className={page.sectionTitle}>Charts</h2>
            <div className={styles.chartTabs}>
              <Segmented label="Chart" options={CHARTS} value={chart} onChange={setChart} />
            </div>
            <BarChart
              title={`${chartDef.label} by period`}
              tooltipLabel={chartDef.tooltip}
              data={stats.buckets.map((b) => ({ label: b.label, value: b[chart] }))}
              format={(v) => (chartDef.money ? `${compact(v)} USD` : String(v))}
            />
          </section>
        </>
      )}
    </div>
  )
}
