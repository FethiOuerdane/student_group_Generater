import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ScheduleResult } from "@/types/schedule"
import { Calendar, Clock, CheckCircle, Sparkles, Zap } from "lucide-react"

interface ScheduleDisplayProps {
  schedules: ScheduleResult[]
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]
const HOURS = ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

const getCourseColor = (course: string, index: number) => {
  const colors = [
    "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    "from-green-500/20 to-emerald-500/20 border-green-500/30",
    "from-orange-500/20 to-red-500/20 border-orange-500/30",
    "from-indigo-500/20 to-blue-500/20 border-indigo-500/30",
    "from-teal-500/20 to-green-500/20 border-teal-500/30",
  ]
  return colors[index % colors.length]
}

export function ScheduleDisplay({ schedules }: ScheduleDisplayProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="relative">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
            Generated Schedules
          </h2>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 blur-lg opacity-30 animate-pulse"></div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-accent animate-pulse" />
          <p className="text-muted-foreground">
            Found {schedules.length} conflict-free schedule{schedules.length !== 1 ? "s" : ""} using AI optimization
          </p>
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        </div>
      </div>

      <div className="grid gap-8">
        {schedules.map((schedule, index) => {
          const courseEntries = Object.entries(schedule.schedule)

          return (
            <Card
              key={index}
              className="group relative backdrop-blur-xl bg-gradient-to-br from-card/90 to-card/70 border-border/30 shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

              <CardHeader className="relative">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className="relative">
                      <Calendar className="h-6 w-6 text-primary" />
                      <div className="absolute inset-0 bg-primary/20 blur-md animate-pulse"></div>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      Schedule Option {index + 1}
                    </span>
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-accent/30 to-accent/20 border-accent/40 text-accent-foreground shadow-lg hover:shadow-accent/20 transition-shadow duration-300"
                  >
                    <CheckCircle className="h-3 w-3 mr-1 animate-pulse" />
                    Conflict-Free
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="relative space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-accent animate-pulse" />
                      <span className="text-sm font-semibold text-accent-foreground">Off Days:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {schedule.offDays.map((day) => (
                        <Badge
                          key={day}
                          variant="outline"
                          className="bg-gradient-to-r from-accent/20 to-accent/10 border-accent/40 text-accent-foreground shadow-lg hover:shadow-accent/30 transition-all duration-300 hover:scale-105"
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    Course Groups:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {courseEntries.map(([course, group], courseIndex) => (
                      <div
                        key={course}
                        className={`group/course flex items-center justify-between p-3 rounded-xl bg-gradient-to-r ${getCourseColor(course, courseIndex)} backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                      >
                        <span className="text-sm font-medium text-foreground">{course}</span>
                        <Badge
                          variant="secondary"
                          className="bg-background/80 backdrop-blur-sm group-hover/course:bg-background transition-colors duration-300"
                        >
                          {group}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-foreground">Weekly Schedule</span>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-full p-4 rounded-2xl bg-gradient-to-br from-background/50 to-muted/30 backdrop-blur-xl border border-border/30">
                      <div className="grid grid-cols-6 gap-2 text-xs">
                        <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-xl font-semibold text-center backdrop-blur-sm shadow-lg">
                          <Clock className="h-4 w-4 mx-auto mb-2 text-primary animate-pulse" />
                          <span className="text-primary-foreground">Time</span>
                        </div>
                        {DAYS.map((day) => (
                          <div
                            key={day}
                            className={`p-3 border rounded-xl font-semibold text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                              schedule.offDays.includes(day)
                                ? "bg-gradient-to-br from-accent/30 to-accent/20 border-accent/40 text-accent-foreground shadow-lg shadow-accent/20"
                                : "bg-gradient-to-br from-muted/40 to-muted/20 border-border/40 hover:border-primary/30"
                            }`}
                          >
                            {day}
                            {schedule.offDays.includes(day) && (
                              <div className="w-1 h-1 bg-accent rounded-full mx-auto mt-1 animate-pulse"></div>
                            )}
                          </div>
                        ))}

                        {HOURS.map((hour) => (
                          <div key={hour} className="contents">
                            <div className="p-3 bg-gradient-to-br from-muted/30 to-muted/20 border border-border/30 rounded-xl text-center font-mono font-medium backdrop-blur-sm hover:border-primary/30 transition-colors duration-300">
                              {hour}
                            </div>
                            {DAYS.map((day) => {
                              // ✅ FIX: normalize hours
                              const normalizedHour = hour.split(":")[0]
                              const course = schedule.table[day]?.[normalizedHour]
                              const isOffDay = schedule.offDays.includes(day)
                              const courseIndex = courseEntries.findIndex(([c]) => c === course)

                              return (
                                <div
                                  key={`${day}-${hour}`}
                                  className={`group/cell p-3 border rounded-xl text-center min-h-[3rem] flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                                    isOffDay
                                      ? "bg-gradient-to-br from-accent/15 to-accent/10 border-accent/25 hover:border-accent/40"
                                      : course
                                        ? `bg-gradient-to-br ${getCourseColor(course, courseIndex)} hover:shadow-lg hover:shadow-primary/10`
                                        : "bg-gradient-to-br from-background/60 to-background/40 border-border/25 hover:border-primary/20"
                                  }`}
                                >
                                  {course && (
                                    <div className="relative">
                                      <span className="text-xs font-semibold text-foreground group-hover/cell:text-primary transition-colors duration-300 truncate block">
                                        {course}
                                      </span>
                                      <div className="absolute inset-0 bg-primary/10 blur-sm opacity-0 group-hover/cell:opacity-100 transition-opacity duration-300 rounded"></div>
                                    </div>
                                  )}
                                  {isOffDay && !course && (
                                    <div className="w-2 h-2 bg-accent/60 rounded-full animate-pulse"></div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
