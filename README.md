To save time, you can use the following prompt with any LLM (e.g., ChatGPT) to organize schedules:

I have X schedules and Y courses, and Z of them have separate time slots. I will give you the schedules and times, and I want you to organize each course in the following format:

Course Name
Number of separate time slots
Day - Start Time / End Time for each separate time slot

Rules:
1. The rows should be ordered according to the groups: Group 1 always on the first row, Group 2 on the second row, Group 3 on the third row, and so on.
2. If a course has more than one separate time slot, each time slot should be written on a new row below the previous one, keeping the same group order.
3. Do not add any empty lines between courses; each course follows immediately after the previous one.
4. All courses should follow the same format, without any additions.

Example: 

CS412 

1 

Tuesday - 8:00AM / 11:00AM 

Tuesday - 8:00AM / 11:00AM 

Wednesday - 9:00AM / 12:00PM 

CS411 

1 

Thursday - 9:00AM / 12:00PM 

Wednesday - 1:00PM / 4:00PM 

Tuesday - 8:00AM / 11:00AM

I want all courses formatted the same way.

Here are the schedules:
