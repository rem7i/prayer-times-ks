import { PrayerTime } from "@/types/prayer";
import { z } from "zod";

// Zod schema for validating prayer time data
const PrayerTimeSchema = z.object({
  date: z.string().min(1),
  fajr: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid time format for Fajr"),
  sunrise: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid time format for Sunrise"),
  dhuhr: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid time format for Dhuhr"),
  asr: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid time format for Asr"),
  maghrib: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid time format for Maghrib"),
  isha: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid time format for Isha"),
});

export const parsePrayerTimes = (csv: string): PrayerTime[] => {
  const lines = csv.split("\n");
  const prayerTimes: PrayerTime[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const parts = line.split(",");
      
      // Validate CSV structure
      if (parts.length !== 7) {
        console.warn(`Invalid CSV format at line ${i}: expected 7 columns, got ${parts.length}`);
        continue;
      }

      const [date, fajr, sunrise, dhuhr, asr, maghrib, isha] = parts;
      
      const prayerTimeData = {
        date: date.trim(),
        fajr: fajr.trim(),
        sunrise: sunrise.trim(),
        dhuhr: dhuhr.trim(),
        asr: asr.trim(),
        maghrib: maghrib.trim(),
        isha: isha.trim(),
      };

      // Validate data structure with Zod
      try {
        const validatedData = PrayerTimeSchema.parse(prayerTimeData);
        prayerTimes.push(validatedData);
      } catch (error) {
        console.warn(`Validation error at line ${i}:`, error);
        continue;
      }
    }
  }

  return prayerTimes;
};

export const getCurrentDayPrayerTimes = (prayerTimes: PrayerTime[]): PrayerTime | null => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString('en-US', { month: 'short' });
  
  const formattedCurrentDate = `${currentDay}-${currentMonth}`;
  
  return prayerTimes.find(time => time.date.toLowerCase() === formattedCurrentDate.toLowerCase()) || null;
};

const convertTo24Hour = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  
  // Validate time format
  if (isNaN(hours) || isNaN(minutes)) {
    console.error(`Invalid time format: ${time}`);
    return 0;
  }
  
  return hours * 60 + minutes; // Convert to minutes since midnight
};

export const PRAYER_NAMES = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

export const getNextPrayer = (prayerTime: PrayerTime): string => {
  try {
    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    const prayers = PRAYER_NAMES.map((name) => ({
      name,
      time: prayerTime[name.toLowerCase() as keyof PrayerTime] as string,
    }));

    for (const prayer of prayers) {
      const prayerTimeInMinutes = convertTo24Hour(prayer.time);
      if (prayerTimeInMinutes > currentTimeInMinutes) {
        return prayer.name;
      }
    }

    return "Fajr"; // If all prayers have passed, next prayer is tomorrow's Fajr
  } catch (error) {
    console.error("Error calculating next prayer:", error);
    return "Fajr"; // Default fallback
  }
};
