"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Calendar, Clock, Sparkles, Zap, Bot } from "lucide-react"
import type { Courses, ScheduleResult } from "@/types/schedule"
import { ScheduleDisplay } from "@/components/schedule-display"


const formatTime = (time: string) => {
  // Convert "HH:MM" 24h to "H:MMAM/PM"
  const [hourStr, minute] = time.split(":")
  let hour = parseInt(hourStr, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  hour = hour % 12
  if (hour === 0) hour = 12
  return `${hour}:${minute}${ampm}`
}

interface CourseData {
  name: string
  groups: {
    name: string
    timeSlots: string[]
  }[]
}

export default function ScheduleBuilder() {
  const [courses, setCourses] = useState<CourseData[]>([
    {
      name: "",
      groups: [{ name: "Group 1", timeSlots: [""] }],
    },
  ])
  const [desiredOffDays, setDesiredOffDays] = useState<number>(2)
  const [schedules, setSchedules] = useState<ScheduleResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const addCourse = () => {
    setCourses([
      ...courses,
      {
        name: "",
        groups: [{ name: "Group 1", timeSlots: [""] }],
      },
    ])
  }

  const removeCourse = (courseIndex: number) => {
    setCourses(courses.filter((_, index) => index !== courseIndex))
  }

  const updateCourseName = (courseIndex: number, name: string) => {
    const updated = [...courses]
    updated[courseIndex].name = name
    setCourses(updated)
  }

  const addGroup = (courseIndex: number) => {
    const updated = [...courses]
    const groupNumber = updated[courseIndex].groups.length + 1
    updated[courseIndex].groups.push({
      name: `Group ${groupNumber}`,
      timeSlots: [""],
    })
    setCourses(updated)
  }

  const removeGroup = (courseIndex: number, groupIndex: number) => {
    const updated = [...courses]
    updated[courseIndex].groups = updated[courseIndex].groups.filter((_, index) => index !== groupIndex)
    setCourses(updated)
  }

  const updateGroupName = (courseIndex: number, groupIndex: number, name: string) => {
    const updated = [...courses]
    updated[courseIndex].groups[groupIndex].name = name
    setCourses(updated)
  }

  const addTimeSlot = (courseIndex: number, groupIndex: number) => {
    const updated = [...courses]
    updated[courseIndex].groups[groupIndex].timeSlots.push("")
    setCourses(updated)
  }

  const removeTimeSlot = (courseIndex: number, groupIndex: number, timeSlotIndex: number) => {
    const updated = [...courses]
    updated[courseIndex].groups[groupIndex].timeSlots = updated[courseIndex].groups[groupIndex].timeSlots.filter(
      (_, index) => index !== timeSlotIndex,
    )
    setCourses(updated)
  }

  const updateTimeSlot = (courseIndex: number, groupIndex: number, timeSlotIndex: number, value: string) => {
    const updated = [...courses]
    updated[courseIndex].groups[groupIndex].timeSlots[timeSlotIndex] = value
    setCourses(updated)
  }

  const validateForm = (): boolean => {
    setError("")

    // Check if all courses have names
    for (const course of courses) {
      if (!course.name.trim()) {
        setError("All courses must have names")
        return false
      }

      // Check if all groups have at least one valid time slot
      for (const group of course.groups) {
        const validTimeSlots = group.timeSlots.filter((slot) => slot.trim())
        if (validTimeSlots.length === 0) {
          setError(`Course "${course.name}" must have at least one time slot per group`)
          return false
        }

        // Validate time slot format
        for (const slot of validTimeSlots) {
          const timeSlotRegex =
            /^(Sunday|Monday|Tuesday|Wednesday|Thursday) - \d{1,2}:\d{2}(AM|PM) \/ \d{1,2}:\d{2}(AM|PM)$/
          if (!timeSlotRegex.test(slot.trim())) {
            setError(`Invalid time slot format: "${slot}". Use format: "Monday - 8:00AM / 10:00AM"`)
            return false
          }
        }
      }
    }

    return true
  }

  const generateSchedules = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      // Convert courses to API format
      const coursesData: Courses = {}
      courses.forEach((course) => {
        if (course.name.trim()) {
          coursesData[course.name] = {}
          course.groups.forEach((group) => {
            const validTimeSlots = group.timeSlots.filter((slot) => slot.trim())
            if (validTimeSlots.length > 0) {
              coursesData[course.name][group.name] = validTimeSlots
            }
          })
        }
      })
      console.log("Sending courses to API:", coursesData, "Desired off days:", desiredOffDays)

      const response = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courses: coursesData,
          desiredOffDays,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate schedules")
      }

      const data = await response.json()
      setSchedules(data.schedules || [])

      if (data.schedules.length === 0) {
        setError("No valid schedules found with the given constraints. Try reducing the number of desired off-days.")
      }
    } catch (err) {
      setError("Failed to generate schedules. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  const generateFakeData = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]
    const fakeCourses: CourseData[] = [
      {
        name: "Course 1",
        groups: [
          { name: "Group 1", timeSlots: [`Monday - 08:00AM / 10:00AM`] },
          { name: "Group 2", timeSlots: [`Tuesday - 10:00AM / 12:00PM`] },
        ],
      },
      {
        name: "Course 2",
        groups: [
          { name: "Group 1", timeSlots: [`Wednesday - 09:00AM / 11:00AM`] },
          { name: "Group 2", timeSlots: [`Thursday - 11:00AM / 01:00PM`] },
        ],
      },
    ]
    setCourses(fakeCourses)
    setSchedules([])
    setError("")
  }
const generateFakeData2 = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]
  const HOURS = [8, 9, 10, 11, 12, 13, 14, 15] // start hours only

  // Format 24h → AM/PM
  const formatTime = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM"
    const hour12 = h % 12 === 0 ? 12 : h % 12
    return `${hour12}:00${ampm}`
  }

  const fakeCourses: CourseData[] = Array.from({ length: 2 }, (_, i) => {
    // Pick a random day and hour for each group without overlap
    const day1 = days[i % days.length]
    const start1 = HOURS[i % HOURS.length]
    const day2 = days[(i + 1) % days.length]
    const start2 = HOURS[(i + 2) % HOURS.length]

    return {
      name: `Course ${i + 1}`,
      groups: [
        { name: "Group 1", timeSlots: [`${day1} - ${formatTime(start1)} / ${formatTime(start1 + 1)}`] },
        { name: "Group 2", timeSlots: [`${day2} - ${formatTime(start2)} / ${formatTime(start2 + 1)}`] },
      ],
    }
  })

  setCourses(fakeCourses)
  setDesiredOffDays(2)
  setSchedules([])
  setError("")
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30 p-2 sm:p-4 lg:p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="relative">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
              Schedule Builder
            </h1>
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-accent/10 blur-2xl opacity-50 animate-pulse"></div>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Bot className="h-5 w-5 text-primary animate-bounce" />
            <p className="text-muted-foreground text-base sm:text-lg lg:text-xl text-balance">
 
  inspired by original scheduling logic from <span className="font-semibold">Joud Alshehri</span>.
</p>
            <Sparkles className="h-5 w-5 text-accent animate-bounce delay-300" />
          </div>
        </div>

        <Card className="group relative backdrop-blur-xl bg-gradient-to-br from-card/90 to-card/70 border-border/30 shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-accent/10 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="relative">
                <Calendar className="h-6 w-6 text-primary" />
                <div className="absolute inset-0 bg-primary/20 blur-md animate-pulse"></div>
              </div>
              Course Configuration
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Add your courses, groups, and time slots. Use format: "Monday - 8:00AM / 10:00AM"
            </CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-4 sm:space-y-6">
            {courses.map((course, courseIndex) => (
              <Card
                key={courseIndex}
                className="group/course backdrop-blur-lg bg-gradient-to-br from-muted/40 to-muted/20 border-border/40 hover:border-primary/30 transition-all duration-300 hover:scale-[1.01] shadow-lg"
              >
                <CardContent className="p-3 sm:p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 w-full">
                      <Label htmlFor={`course-${courseIndex}`} className="text-sm font-semibold text-foreground">
                        Course Name
                      </Label>
                      <Input
                        id={`course-${courseIndex}`}
                        placeholder="e.g., Computer Science 101"
                        value={course.name}
                        onChange={(e) => updateCourseName(courseIndex, e.target.value)}
                        className="mt-1 bg-gradient-to-r from-input/90 to-input/70 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeCourse(courseIndex)}
                      disabled={courses.length === 1}
                      className="sm:mt-6 bg-background/80 backdrop-blur-sm hover:bg-destructive/10 hover:border-destructive/30 transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                      Groups
                    </Label>
                    {course.groups.map((group, groupIndex) => (
                      <Card
                        key={groupIndex}
                        className="backdrop-blur-md bg-gradient-to-br from-background/70 to-background/50 border-border/30 hover:border-accent/30 transition-all duration-300"
                      >
                        <CardContent className="p-3 space-y-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <Input
                              placeholder="Group name"
                              value={group.name}
                              onChange={(e) => updateGroupName(courseIndex, groupIndex, e.target.value)}
                              className="flex-1 bg-gradient-to-r from-input/80 to-input/60 backdrop-blur-sm border-border/40 focus:border-accent/50 transition-all duration-300"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeGroup(courseIndex, groupIndex)}
                              disabled={course.groups.length === 1}
                              className="bg-background/80 backdrop-blur-sm hover:bg-destructive/10 hover:border-destructive/30 transition-all duration-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                              <Clock className="h-3 w-3 text-accent animate-pulse" />
                              Time Slots
                            </Label>
                           
                         {group.timeSlots.map((timeSlot, timeSlotIndex) => {
  // Parse existing string into day/start/end if already exists
 const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]

  // Default values for empty slots
  let dayPart = ""
  let startTimeStr = "08:00"
  let endTimeStr = "09:00"

  if (timeSlot) {
    const [dayRaw, timeRaw] = timeSlot.split(" - ")
    dayPart = dayRaw || ""

    if (timeRaw) {
      const [startRaw, endRaw] = timeRaw.split(" / ")

      const parseTo24Hour = (time: string) => {
        if (!time) return "08:00"
        const match = time.match(/(\d+):(\d+)(AM|PM)/)
        if (!match) return "08:00"
        let [_, h, m, ampm] = match
        let hour = parseInt(h)
        if (ampm === "PM" && hour !== 12) hour += 12
        if (ampm === "AM" && hour === 12) hour = 0
        return `${hour.toString().padStart(2, "0")}:${m}`
      }

      startTimeStr = parseTo24Hour(startRaw)
      endTimeStr = parseTo24Hour(endRaw)
    }
  }
  return (
    <div key={timeSlotIndex} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      {/* Day Selector */}
      <select
        className="bg-gradient-to-r from-input/70 to-input/50 backdrop-blur-sm border-border/40 focus:border-primary/50 transition-all duration-300 text-sm p-2 rounded-md"
        value={dayPart || ""}
        onChange={(e) => {
          const newDay = e.target.value
          const start = startTimeStr || "08:00"
          const end = endTimeStr || "09:00"
          const formatted = `${newDay} - ${formatTime(start)} / ${formatTime(end)}`
          updateTimeSlot(courseIndex, groupIndex, timeSlotIndex, formatted)
        }}
      >
        <option value="" disabled>
          Select Day
        </option>
        {days.map((day) => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>

      {/* Start Time Picker */}
      <input
        type="time"
        className="bg-gradient-to-r from-input/70 to-input/50 backdrop-blur-sm border-border/40 focus:border-primary/50 transition-all duration-300 text-sm p-2 rounded-md"
        value={startTimeStr || "08:00"}
        onChange={(e) => {
          const start = e.target.value
          const end = endTimeStr || "09:00"
          const day = dayPart || "Monday"
          const formatted = `${day} - ${formatTime(start)} / ${formatTime(end)}`
          updateTimeSlot(courseIndex, groupIndex, timeSlotIndex, formatted)
        }}
      />

      {/* End Time Picker */}
      <input
        type="time"
        className="bg-gradient-to-r from-input/70 to-input/50 backdrop-blur-sm border-border/40 focus:border-primary/50 transition-all duration-300 text-sm p-2 rounded-md"
        value={endTimeStr || "09:00"}
        onChange={(e) => {
          const start = startTimeStr || "08:00"
          const end = e.target.value
          const day = dayPart || "Monday"
          const formatted = `${day} - ${formatTime(start)} / ${formatTime(end)}`
          updateTimeSlot(courseIndex, groupIndex, timeSlotIndex, formatted)
        }}
      />

      {/* Remove Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => removeTimeSlot(courseIndex, groupIndex, timeSlotIndex)}
        disabled={group.timeSlots.length === 1}
        className="bg-background/80 backdrop-blur-sm hover:bg-destructive/10 hover:border-destructive/30 transition-all duration-300 flex-shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
})}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addTimeSlot(courseIndex, groupIndex)}
                              className="w-full bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm hover:from-accent/10 hover:to-accent/5 hover:border-accent/30 transition-all duration-300"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Time Slot
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => addGroup(courseIndex)}
                      className="w-full bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={addCourse}
              variant="outline"
              className="w-full bg-gradient-to-r from-background/90 to-background/70 backdrop-blur-sm hover:from-primary/10 hover:to-primary/5 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>

            <Card className="backdrop-blur-lg bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 shadow-lg">
              <CardContent className="p-4">
                <Label
                  htmlFor="off-days"
                  className="text-sm font-semibold text-accent-foreground flex items-center gap-2"
                >
                  <Zap className="h-4 w-4 text-accent animate-pulse" />
                  Desired Off Days
                </Label>
                <Input
                  id="off-days"
                  type="number"
                  min="0"
                  max="5"
                  value={desiredOffDays}
                  onChange={(e) => setDesiredOffDays(Number.parseInt(e.target.value) || 0)}
                  className="bg-gradient-to-r from-input/90 to-input/70 backdrop-blur-sm border-accent/30 focus:border-accent/50 focus:ring-accent/20 mt-2 transition-all duration-300"
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Number of days you want free from classes (0-5)
                </p>
              </CardContent>
            </Card>

            {error && (
              <div className="p-4 bg-gradient-to-r from-destructive/15 to-destructive/10 border border-destructive/30 rounded-xl backdrop-blur-sm shadow-lg">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </div>
            )}

            <Button
              onClick={generateSchedules}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 shadow-xl hover:shadow-primary/20 transition-all duration-500 hover:scale-[1.02] text-base sm:text-lg py-3 sm:py-4 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating Schedules...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 animate-pulse" />
                    Generate Schedules
                    <Bot className="h-5 w-5 animate-pulse" />
                  </>
                )}
              </div>
            </Button>
            <Button
  onClick={generateFakeData}
  variant="outline"
  className="mb-4 w-full sm:w-auto bg-gradient-to-r from-accent/30 to-primary/30 backdrop-blur-sm hover:from-accent/50 hover:to-primary/50 transition-all duration-300"
>
  <Sparkles className="h-4 w-4 mr-2" />
  Generate Fake Schedule Data
</Button>


          </CardContent>
        </Card>

        {/* Schedule Results */}
        {schedules.length > 0 && <ScheduleDisplay schedules={schedules} />}
      </div>
    </div>
  )
}
