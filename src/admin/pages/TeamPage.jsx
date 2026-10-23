import { useCallback, useEffect, useState } from 'react'
import { Plus } from '../../components/icons'
import { useToast } from '../../components/Toast'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import SelectField from '../../components/ui/SelectField'
import TextField from '../../components/ui/TextField'
import { useAdminAuth } from '../AdminAuth'
import { inviteStaff, listStaff, removeStaff, ROLES, updateStaffRole } from '../api'
import { dateTime } from '../format'
import { StatusBadge } from '../ui'
import a from '../admin.module.css'

const roleOptions = Object.entries(ROLES).map(([value, r]) => ({ value, label: r.label }))
const AREA_LABELS = { dashboard: 'Dashboard', clients: 'Clients', kyc: 'ID checks', transactions: 'Transactions', tickets: 'Tickets', settings: 'Settings' }

export default function TeamPage() {
  const toast = useToast()
  const { staff: me } = useAdminAuth()
  const [members, setMembers] = useState(null)
  const [inviting, setInviting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'support' })
  const [error, setError] = useState('')

  const load = useCallback(() => {
    listStaff().then(setMembers)
  }, [])
  useEffect(load, [load])

  async function invite(e) {
    e.preventDefault()
    setError('')
    try {
      await inviteStaff(form)
      toast(`Invitation sent to ${form.email}`)
      setInviting(false)
      setForm({ name: '', email: '', role: 'support' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className={a.page}>
      <div className={a.toolbar}>
        <p className={a.muted}>People who can sign in to this back office, and what they can access.</p>
        <Button className={`${a.small} ${a.toolbarEnd}`} icon={<Plus />} onClick={() => setInviting(true)}>
          Invite member
        </Button>
      </div>

      <section className={a.panel}>
        {!members ? (
          <div className={a.skeleton} />
        ) : (
          <div className={a.tableWrap}>
            <table className={a.table}>
              <thead>
                <tr>
                  <th scope="col">Member</th>
                  <th scope="col">Role</th>
                  <th scope="col">Access</th>
                  <th scope="col">Last active</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const isMe = m.email === me.email
                  return (
                    <tr key={m.id}>
                      <td>
                        <span className={a.strong}>{m.name}</span> {isMe && <StatusBadge state="none" label="You" />}
                        <span className={a.sub}>{m.email}</span>
                      </td>
                      <td style={{ minWidth: 160 }}>
                        <SelectField
                          aria-label={`Role for ${m.name}`}
                          options={roleOptions}
                          value={m.role}
                          disabled={isMe}
                          onChange={async (e) => {
                            await updateStaffRole(m.id, e.target.value)
                            toast(`${m.name} is now ${ROLES[e.target.value].label}`)
                            load()
                          }}
                        />
                      </td>
                      <td style={{ whiteSpace: 'normal' }}>{ROLES[m.role].can.map((c) => AREA_LABELS[c]).join(', ')}</td>
                      <td>{m.invited ? <StatusBadge state="pending" label="Invited" /> : dateTime(m.lastActive)}</td>
                      <td className={a.num}>
                        {!isMe && (
                          <Button
                            variant="secondary"
                            className={`${a.small} ${a.danger}`}
                            onClick={async () => {
                              await removeStaff(m.id)
                              toast(`${m.name} removed`)
                              load()
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={inviting}
        onClose={() => setInviting(false)}
        title="Invite a team member"
        subtitle="They'll get an email to set their password."
        width={520}
        showClose
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviting(false)}>
              Cancel
            </Button>
            <Button type="submit" form="invite-form">
              Send invitation
            </Button>
          </>
        }
      >
        <form id="invite-form" onSubmit={invite} className={a.stack} noValidate>
          <TextField label="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} data-autofocus />
          <TextField label="Work email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={error} />
          <SelectField
            label="Role"
            options={roleOptions}
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            hint={`Can access: ${ROLES[form.role].can.map((c) => AREA_LABELS[c]).join(', ')}`}
          />
        </form>
      </Modal>
    </div>
  )
}
