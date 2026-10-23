import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Dropdown from '../../components/ui/Dropdown'
import { COUNTRIES } from '../../services/api'
import { listClients } from '../api'
import { dateOnly, usd } from '../format'
import { Country, Pagination, SearchInput, StatusBadge } from '../ui'
import a from '../admin.module.css'

const PAGE_SIZE = 12
const KYC = [
  { value: 'all', label: 'All verification' },
  { value: 'approved', label: 'Verified' },
  { value: 'pending', label: 'Pending review' },
  { value: 'none', label: 'Not started' },
  { value: 'rejected', label: 'Rejected' },
]
const STATUS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
]

export default function ClientsPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ query: '', kyc: 'all', status: 'all', country: 'all' })
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)

  useEffect(() => {
    let active = true
    const t = setTimeout(() => {
      listClients({ ...filters, page, pageSize: PAGE_SIZE }).then((r) => active && setResult(r))
    }, 150) // debounce typing in the search box
    return () => {
      active = false
      clearTimeout(t)
    }
  }, [filters, page])

  const set = (key) => (value) => {
    setPage(1)
    setFilters((f) => ({ ...f, [key]: value }))
  }

  return (
    <div className={a.page}>
      <div className={a.toolbar}>
        <SearchInput value={filters.query} onChange={set('query')} placeholder="Name, email, client ID or account number" label="Search clients" />
        <Dropdown variant="pill" active={filters.kyc !== 'all'} label="Verification" options={KYC} value={filters.kyc} onChange={set('kyc')} />
        <Dropdown variant="pill" active={filters.status !== 'all'} label="Status" options={STATUS} value={filters.status} onChange={set('status')} />
        <Dropdown
          variant="pill"
          active={filters.country !== 'all'}
          label="Country"
          options={[{ value: 'all', label: 'All countries' }, ...COUNTRIES.map((c) => ({ value: c.code, label: c.name }))]}
          value={filters.country}
          onChange={set('country')}
        />
      </div>

      <section className={a.panel}>
        {!result ? (
          <div className={a.skeleton} />
        ) : result.rows.length === 0 ? (
          <p className={a.empty}>No clients match these filters.</p>
        ) : (
          <div className={a.tableWrap}>
            <table className={a.table}>
              <thead>
                <tr>
                  <th scope="col">Client</th>
                  <th scope="col">Country</th>
                  <th scope="col">Verification</th>
                  <th scope="col">Status</th>
                  <th scope="col" className={a.num}>Accounts</th>
                  <th scope="col" className={a.num}>Live balance</th>
                  <th scope="col">Manager</th>
                  <th scope="col">Registered</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((c) => (
                  <tr key={c.id} className={a.rowLink} onClick={() => navigate(`/admin/clients/${c.id}`)}>
                    <td>
                      <a
                        href={`/admin/clients/${c.id}`}
                        className={a.strong}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        onClick={(e) => {
                          e.preventDefault()
                          navigate(`/admin/clients/${c.id}`)
                        }}
                      >
                        {c.name}
                      </a>
                      {c.live && <> <StatusBadge state="open" label="Demo user" /></>}
                      <span className={a.sub}>
                        {c.id} · {c.email}
                      </span>
                    </td>
                    <td>
                      <Country code={c.country} />
                    </td>
                    <td>
                      <StatusBadge state={c.kyc} />
                    </td>
                    <td>
                      <StatusBadge state={c.status} />
                    </td>
                    <td className={a.num}>{c.accounts.length}</td>
                    <td className={a.num}>{usd(c.balance)}</td>
                    <td>{c.manager}</td>
                    <td>{dateOnly(c.registeredAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {result && <Pagination page={page} pageSize={PAGE_SIZE} total={result.total} onPage={setPage} />}
      </section>
    </div>
  )
}
