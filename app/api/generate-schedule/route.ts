// app/api/generate-schedule/route.ts
import { NextResponse } from "next/server"

interface CoursesInput {
  [course: string]: {
    [group: string]: string[]
  }
}

interface ScheduleResult {
  schedule: Record<string, string> // course → selected group
  offDays: string[]
  table: Record<string, Record<string, string>> // day → hour → course
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]

// Convert "8:00AM" → minutes
function timeToMinutes(t: string): number {
  const [h, m] = t.slice(0, -2).split(":").map(Number)
  const ampm = t.slice(-2)
  let hour = h
  if (ampm === "PM" && h !== 12) hour += 12
  if (ampm === "AM" && h === 12) hour = 0
  return hour * 60 + m
}

// Check if any time slots conflict
function hasConflict(times: string[]): boolean {
  const daily: Record<string, [number, number][]> = {}
  for (const t of times) {
    if (t.trim() === "-") continue
    const [day, period] = t.split(" - ")
    const [startStr, endStr] = period.split(" / ")
    const start = timeToMinutes(startStr)
    const end = timeToMinutes(endStr)
    if (!daily[day]) daily[day] = []
    for (const [s, e] of daily[day]) {
      if (!(end <= s || start >= e)) return true
    }
    daily[day].push([start, end])
  }
  return false
}

// Count off days
function countOffDays(times: string[]): number {
  const usedDays = new Set<string>()
  for (const t of times) {
    if (t.trim() === "-") continue
    const day = t.split(" - ")[0]
    usedDays.add(day)
  }
  return DAYS.length - usedDays.size
}

// Recursive schedule builder
function buildSchedules(
  courses: CoursesInput,
  courseList: string[],
  desiredOffDays: number,
  schedule: string[] = [],
  result: Record<string, string> = {}
): ScheduleResult[] {
  if (!courseList.length) {
    if (countOffDays(schedule) >= desiredOffDays) {
      return [
        {
          schedule: { ...result },
          offDays: DAYS.filter(d => !schedule.some(s => s.startsWith(d))),
          table: {}, // will fill later
        },
      ]
    }
    return []
  }

  const course = courseList[0]
  let allSolutions: ScheduleResult[] = []

  for (const [group, times] of Object.entries(courses[course])) {
    const groupTimes = times.filter(t => t.trim() !== "-")
    if (!hasConflict([...schedule, ...groupTimes])) {
      const newSchedule = [...schedule, ...groupTimes]
      const newResult = { ...result, [course]: group }
      const solutions = buildSchedules(
        courses,
        courseList.slice(1),
        desiredOffDays,
        newSchedule,
        newResult
      )
      allSolutions = allSolutions.concat(solutions)
    }
  }

  return allSolutions
}

// Build table: day → hour → course
function createScheduleTable1(selectedGroups: Record<string, string>, courses: CoursesInput) {
  const table: Record<string, Record<string, string>> = {}
  const HOURS = Array.from({ length: 10 }, (_, i) => (i + 8).toString()) // 8 → 17

  for (const day of DAYS) table[day] = {}

  for (const course of Object.keys(selectedGroups)) {
    const group = selectedGroups[course]
    const times = courses[course][group]
    for (const t of times) {
      if (t.trim() === "-") continue
      const [dayStr, period] = t.split(" - ")
      const [startStr, endStr] = period.split(" / ")
      const startHour = Math.floor(timeToMinutes(startStr) / 60)
      const endHour = Math.floor(timeToMinutes(endStr) / 60)
      for (let h = startHour; h < endHour; h++) {
        const hourKey = h.toString()
        if (table[dayStr]) table[dayStr][hourKey] = course
      }
    }
  }

  return table
}
function createScheduleTable(
  selectedGroups: Record<string, string>,
  courses: CoursesInput
) {
  const table: Record<string, Record<string, string>> = {}
  const HOURS = Array.from({ length: 10 }, (_, i) => (i + 8).toString()) // 8 → 17

  // Pre-fill all days with empty slots
  for (const day of DAYS) {
    table[day] = {}
    for (const h of HOURS) {
      table[day][h] = "" // empty cell
    }
  }

  // Fill in selected courses
  for (const course of Object.keys(selectedGroups)) {
    const group = selectedGroups[course]
    const times = courses[course][group]

    for (const t of times) {
      if (t.trim() === "-") continue
      const [dayStr, period] = t.split(" - ")
      const [startStr, endStr] = period.split(" / ")

      const startHour = Math.floor(timeToMinutes(startStr) / 60)
      const endHour = Math.floor(timeToMinutes(endStr) / 60)

      for (let h = startHour; h < endHour; h++) {
        const hourKey = h.toString()
        if (table[dayStr]) {
          table[dayStr][hourKey] = course // course name appears in grid
        }
      }
    }
  }
  console.log("Generated schedule table:", JSON.stringify(table, null, 2))

  return table
}

// API route
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { courses, desiredOffDays } = body as { courses: CoursesInput; desiredOffDays: number }

    console.log("Received courses:", courses, "Desired off days:", desiredOffDays)

    const courseList = Object.keys(courses)
    let schedules = buildSchedules(courses, courseList, desiredOffDays)

    // Fill table
    schedules = schedules.map(s => ({
      ...s,
      table: createScheduleTable(s.schedule, courses),
    }))

    console.log("Generated schedules:", schedules)

    return NextResponse.json({ schedules })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ schedules: [], error: "Failed to generate schedules" })
  }
}
