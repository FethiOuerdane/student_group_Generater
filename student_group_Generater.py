import pandas as pd
from itertools import product
import re

DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]

def time_to_minutes(t):
    h, m = map(int, t[:-2].split(":"))
    if t[-2:] == "PM" and h != 12:
        h += 12
    if t[-2:] == "AM" and h == 12:
        h = 0
    return h * 60 + m

def has_conflict(times):
    daily = {}
    for t in times:
        if t.strip() == "-":
            continue
        day, period = t.split(" - ")
        start_str, end_str = period.strip().split(" / ")
        start = time_to_minutes(start_str)
        end = time_to_minutes(end_str)
        if day not in daily:
            daily[day] = []
        for s, e in daily[day]:
            if not (end <= s or start >= e):
                return True
        daily[day].append((start, end))
    return False

def count_off_days(times):
    used_days = set()
    for t in times:
        if t.strip() == "-":
            continue
        day = t.split(" - ")[0]
        used_days.add(day)
    return len(DAYS) - len(used_days)

def build_schedules(courses, course_list, desired_off_days, schedule=[], result={}):
    if not course_list:
        if count_off_days(schedule) == desired_off_days:
            return [(schedule, result)]
        return []
    
    course = course_list[0]
    all_solutions = []

    for group, times in courses[course].items():
        if "-" in times:
            continue
        if not has_conflict(schedule + times):
            new_schedule = schedule + times
            new_result = result.copy()
            new_result[course] = group
            solutions = build_schedules(courses, course_list[1:], desired_off_days, new_schedule, new_result)
            all_solutions.extend(solutions)

    return all_solutions

def create_schedule_table(selected_groups, courses):
    min_hour = 8
    max_hour = 17
    hours = [f"{h}:00-{h+1}:00" for h in range(min_hour, max_hour)]
    
    df = pd.DataFrame("-", index=DAYS, columns=hours)

    for course, group in selected_groups.items():
        lab_flag = " L" if "Lab" in course else ""
        course_name = course.split()[0]
        group_times = courses[course][group]  
        
        for t in group_times:
            if t.strip() == "-":
                continue
            day, period = t.split(" - ")
            if day not in DAYS:
                continue
            start_str, end_str = period.strip().split(" / ")
            start_hour = time_to_minutes(start_str) // 60
            end_hour = time_to_minutes(end_str) // 60

            for h in range(start_hour, end_hour):
                col_label = f"{h}:00-{h+1}:00"
                if col_label in df.columns:
                    df.at[day, col_label] = f"{course_name}{lab_flag} {group}"

    # Force pandas to print full table in terminal
    pd.set_option("display.max_rows", None)
    pd.set_option("display.max_columns", None)
    pd.set_option("display.width", None)
    pd.set_option("display.max_colwidth", None)

    return df


def validate_and_format_time(entry):
    entry = entry.strip()
    pattern = r"^(Sunday|Monday|Tuesday|Wednesday|Thursday)\s*-\s*(\d{1,2}:\d{2}[AP]M)\s*/\s*(\d{1,2}:\d{2}[AP]M)$"
    match = re.match(pattern, entry, re.IGNORECASE)
    if not match:
        return None
    day, start, end = match.groups()
    day = day.capitalize()
    start = start.upper()
    end = end.upper()
    return f"{day} - {start} / {end}"

def input_courses():
    courses = {}
    num_courses = int(input("Number of courses: "))
    num_groups = int(input("Number of groups per course: "))

    print("\nEnter times in format: Day - StartTime / EndTime (e.g., Monday - 8:00AM / 10:00AM)\n")

    for _ in range(num_courses):
        course_name = input("Course name: ").strip()
        num_lectures = int(input(f"Number of separate lectures/labs for {course_name}: "))
        courses[course_name] = {}

        for g in range(1, num_groups + 1):
            group_name = f"G{g}"
            courses[course_name][group_name] = []
            print(f"\nTimes for Group {g}:")
            for l in range(1, num_lectures + 1):
                while True:
                    raw_entry = input(f"  Lecture/Lab {l}: ")
                    formatted = validate_and_format_time(raw_entry)
                    if formatted:
                        courses[course_name][group_name].append(formatted)
                        break
                    else:
                        print("Invalid format! Please enter as: Day - StartTime / EndTime (e.g., Monday - 8:00AM / 10:00AM)")
        print()
    
    return courses

def main():
    courses = input_courses()  

    while True:
        try:
            desired_off_days = int(input("Number of OFF days desired: "))
        except ValueError:
            print("Please enter a valid number for OFF days.")
            continue

        course_list = list(courses.keys())
        all_solutions = build_schedules(courses, course_list, desired_off_days)

        if all_solutions:
            print(f"\nFound {len(all_solutions)} schedule(s) matching criteria:\n")
            for idx, (sched, selected_groups) in enumerate(all_solutions, 1):
                used_days = set()
                for t in sched:
                    day = t.split(" - ")[0]
                    if day in DAYS:
                        used_days.add(day)
                off_days = [d for d in DAYS if d not in used_days]

                print(f"--- Schedule {idx} | OFF Days: {', '.join(off_days) if off_days else '-'} ---")
                table = create_schedule_table(selected_groups, courses)  # نمرّر dict الصحيح مع الكورس times
                print(table, "\n")
        else:
            print("\nNo schedule found matching the exact OFF days and without conflicts.\n")

        cont = input("Press Enter to try another number of OFF days, or Q to quit: ").strip().upper()
        if cont == "Q":
            break

if __name__ == "__main__":
    main()
