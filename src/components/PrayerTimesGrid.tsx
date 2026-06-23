import { PrayerTime } from "@/types/prayer";
import { PRAYER_NAMES } from "@/utils/prayerTimes";
import { PrayerCard } from "./PrayerCard";

interface PrayerTimesGridProps {
  currentDay: PrayerTime;
  nextPrayer: string;
}

export const PrayerTimesGrid = ({ currentDay, nextPrayer }: PrayerTimesGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {PRAYER_NAMES.map((name) => (
        <PrayerCard
          key={name}
          name={name}
          time={currentDay[name.toLowerCase() as keyof PrayerTime] as string}
          isNext={nextPrayer === name}
        />
      ))}
    </div>
  );
};