interface TimeSlot {
  day: string;
  time: string;
  startTime: string;
  endTime: string;
}

interface Friend {
  name: string;
  courses: Array<{ course: string; section: string }>;
}

interface CourseData {
  course_name: string;
  section: string;
  schedule: Array<{
    day: string;
    start_time: string;
    end_time: string;
    room: string;
  }>;
}

export class NewScheduleAnalyzer {
  private readonly days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // All possible time slots in the day
  private readonly timeSlots = [
    { start: '8:00 AM', end: '9:20 AM' },
    { start: '9:30 AM', end: '10:50 AM' },
    { start: '11:00 AM', end: '12:20 PM' },
    { start: '12:30 PM', end: '1:50 PM' },
    { start: '2:00 PM', end: '3:20 PM' },
    { start: '3:30 PM', end: '4:50 PM' },
    { start: '5:00 PM', end: '6:20 PM' },
  ];

  /**
   * Load classes data from JSON file
   */
  private async loadClassesData(): Promise<CourseData[]> {
    try {
      const response = await fetch('/classes.json');
      if (!response.ok) {
        throw new Error('Failed to load classes data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading classes.json:', error);
      throw error;
    }
  }

  /**
   * Find a specific course section in the classes data
   */
  private findCourseSection(classesData: CourseData[], courseName: string, section: string): CourseData | null {
    return classesData.find(
      c => c.course_name.toUpperCase() === courseName.toUpperCase() && c.section === section
    ) || null;
  }

  /**
   * Convert time string to minutes for comparison
   */
  private timeToMinutes(time: string): number {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  }

  /**
   * Check if two time ranges overlap
   */
  private timesOverlap(
    start1: string, end1: string,
    start2: string, end2: string
  ): boolean {
    const start1Min = this.timeToMinutes(start1);
    const end1Min = this.timeToMinutes(end1);
    const start2Min = this.timeToMinutes(start2);
    const end2Min = this.timeToMinutes(end2);

    return start1Min < end2Min && end1Min > start2Min;
  }

  /**
   * Format time range for display
   */
  private formatTimeRange(startTime: string, endTime: string): string {
    return `${startTime} - ${endTime}`;
  }

  /**
   * Analyze schedules and find common free times
   */
  async analyzeFriendSchedules(friends: Friend[]): Promise<{
    freeSlots: Array<{ day: string; time: string; startTime: string; endTime: string }>;
    busySlots: Array<{ day: string; time: string; friends: string[] }>;
    weeklyGrid: Record<string, Record<string, { isBusy: boolean; friendNames: string[] }>>;
    friendSchedules: Array<{ name: string; busySlots: TimeSlot[] }>;
  }> {
    console.log('\n🔍 === ANALYZING FRIEND SCHEDULES ===');
    console.log(`Number of friends: ${friends.length}`);
    
    // Load classes data
    const classesData = await this.loadClassesData();
    console.log(`✅ Loaded ${classesData.length} course sections`);

    // Build busy slots for each friend
    const friendSchedules: Array<{ name: string; busySlots: TimeSlot[] }> = [];

    for (const friend of friends) {
      console.log(`\n👤 Processing ${friend.name}...`);
      const busySlots: TimeSlot[] = [];

      for (const enrollment of friend.courses) {
        const courseSection = this.findCourseSection(classesData, enrollment.course, enrollment.section);
        
        if (!courseSection) {
          console.warn(`  ⚠️ Course not found: ${enrollment.course}-${enrollment.section}`);
          continue;
        }

        console.log(`  ✅ Found ${enrollment.course}-${enrollment.section}`);
        
        for (const scheduleEntry of courseSection.schedule) {
          busySlots.push({
            day: scheduleEntry.day,
            time: this.formatTimeRange(scheduleEntry.start_time, scheduleEntry.end_time),
            startTime: scheduleEntry.start_time,
            endTime: scheduleEntry.end_time,
          });
          console.log(`    📅 ${scheduleEntry.day} ${scheduleEntry.start_time} - ${scheduleEntry.end_time}`);
        }
      }

      friendSchedules.push({
        name: friend.name,
        busySlots
      });
      
      console.log(`  Total slots for ${friend.name}: ${busySlots.length}`);
    }

    // Create weekly grid
    console.log('\n📊 Creating weekly schedule grid...');
    const weeklyGrid: Record<string, Record<string, { isBusy: boolean; friendNames: string[] }>> = {};

    for (const day of this.days) {
      weeklyGrid[day] = {};
      for (const slot of this.timeSlots) {
        const timeRange = this.formatTimeRange(slot.start, slot.end);
        
        // Check which friends are busy during this slot
        const busyFriends: string[] = [];
        
        for (const friendSchedule of friendSchedules) {
          const isBusy = friendSchedule.busySlots.some(
            busySlot => 
              busySlot.day === day &&
              this.timesOverlap(slot.start, slot.end, busySlot.startTime, busySlot.endTime)
          );
          
          if (isBusy) {
            busyFriends.push(friendSchedule.name);
          }
        }

        weeklyGrid[day][timeRange] = {
          isBusy: busyFriends.length > 0,
          friendNames: busyFriends
        };
      }
    }

    // Find completely free slots (when ALL friends are free)
    const freeSlots: Array<{ day: string; time: string; startTime: string; endTime: string }> = [];
    const busySlots: Array<{ day: string; time: string; friends: string[] }> = [];

    for (const day of this.days) {
      for (const slot of this.timeSlots) {
        const timeRange = this.formatTimeRange(slot.start, slot.end);
        const gridSlot = weeklyGrid[day][timeRange];

        if (gridSlot.friendNames.length === 0) {
          // All friends are free!
          freeSlots.push({
            day,
            time: timeRange,
            startTime: slot.start,
            endTime: slot.end
          });
        } else if (gridSlot.friendNames.length < friends.length) {
          // Some friends are busy
          busySlots.push({
            day,
            time: timeRange,
            friends: gridSlot.friendNames
          });
        }
      }
    }

    console.log(`\n✅ Analysis complete!`);
    console.log(`   Free slots: ${freeSlots.length}`);
    console.log(`   Partially busy slots: ${busySlots.length}`);

    return {
      freeSlots,
      busySlots,
      weeklyGrid,
      friendSchedules: friendSchedules.map(fs => ({
        name: fs.name,
        busySlots: fs.busySlots
      }))
    };
  }
}

export const scheduleAnalyzer = new NewScheduleAnalyzer();
