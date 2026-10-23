import { useState } from 'react'
import { AlertTriangle } from '../../components/icons'
import Button from '../../components/ui/Button'
import ChoiceList from '../../components/ui/ChoiceList'
import Modal from '../../components/ui/Modal'
import SelectField from '../../components/ui/SelectField'
import { fillCopy } from '../../config/brand'
import { useBrand } from '../../context/BrandContext'
import { linkify } from '../../utils/format'
import styles from './Verification.module.css'

const emptyAnswer = (q) => (q.type === 'single' ? { value: '' } : { values: [] })

function validate(q, answer) {
  if (q.type === 'single') {
    if (!answer.value) return 'Please select an option'
    const opt = q.options.find((o) => o.value === answer.value)
    if (opt?.followUp && !answer.followUp) return `Please select your ${opt.followUp.label.toLowerCase()}`
    return ''
  }
  if (q.type === 'multi') return answer.values.length ? '' : 'Please select at least one option'
  return answer.values.length === q.options.length ? '' : q.error ?? 'Please tick all boxes to continue'
}

/**
 * One question of the questionnaire. Answers are owned by the parent so they
 * survive Back/Continue and closing the dialog.
 */
export default function QuestionStep({ question, index, total, answer, onAnswer, onBack, onNext, onClose, submitting }) {
  const brand = useBrand()
  const [error, setError] = useState('')
  const value = answer ?? emptyAnswer(question)
  const isLast = index === total - 1
  const text = (s) => fillCopy(s, brand)

  const selected = question.type === 'single' ? question.options.find((o) => o.value === value.value) : null

  function update(patch) {
    setError('')
    onAnswer({ ...value, ...patch })
  }

  function handleContinue() {
    const message = validate(question, value)
    if (message) return setError(message)
    onNext()
  }

  const renderLabel = (opt) =>
    linkify(text(opt.label)).map((part, i) =>
      typeof part === 'string' ? (
        part
      ) : (
        <a key={i} href={part.href} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          {part.text}
        </a>
      ),
    )

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={`Question ${index + 1} of ${total}`}
      title={text(question.title)}
      subtitle={question.subtitle && text(question.subtitle)}
      showClose
      footer={
        <>
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleContinue} disabled={submitting}>
            {isLast ? (submitting ? 'Submitting…' : 'Submit') : 'Continue'}
          </Button>
        </>
      }
    >
      <ChoiceList
        name={question.id}
        label={text(question.title)}
        type={question.type === 'single' ? 'radio' : 'checkbox'}
        options={question.options}
        value={question.type === 'single' ? value.value : value.values}
        onChange={(v) => (question.type === 'single' ? update({ value: v, followUp: '' }) : update({ values: v }))}
        invalid={Boolean(error)}
        renderLabel={renderLabel}
        renderExtra={(opt) =>
          opt.followUp && (
            <div className={styles.followUp}>
              <SelectField
                label={opt.followUp.label}
                placeholder=""
                options={opt.followUp.options}
                value={value.followUp ?? ''}
                onChange={(e) => update({ followUp: e.target.value })}
              />
            </div>
          )
        }
      />

      {error && (
        <p className={styles.fieldError} role="alert">
          {error}
        </p>
      )}

      {selected?.warning && (
        <div className={styles.warning} role="status">
          <AlertTriangle size={24} />
          <p>{selected.warning}</p>
        </div>
      )}
    </Modal>
  )
}
