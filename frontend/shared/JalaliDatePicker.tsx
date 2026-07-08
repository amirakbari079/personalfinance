'use client'

import { useMemo } from 'react'
import DatePicker from 'react-multi-date-picker'
import DateObject from 'react-date-object'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import { Calendar } from 'lucide-react'

interface Props {
  value: string | null
  onChange: (jalali: string) => void
  placeholder?: string
}

export default function JalaliDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
}: Props) {
  const pickerValue = useMemo(() => {
    if (!value) return undefined
    return new DateObject({
      date: value,
      format: 'YYYY/MM/DD',
      calendar: persian,
      locale: persian_fa,
    })
  }, [value])

  return (
    <div className="jalali-picker-wrap relative">
      <DatePicker
        value={pickerValue}
        onChange={(date) => {
          if (date && !Array.isArray(date)) {
            onChange(date.format('YYYY/MM/DD'))
          }
        }}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        calendarPosition="bottom-right"
        placeholder={placeholder}
        containerClassName="w-full"
        inputClass="jalali-date-input cursor-pointer pr-10"
        arrow={false}
      />
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-accent/70 pointer-events-none" />
    </div>
  )
}
