import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PrayerTime } from "@/types/prayer";
import { format } from "date-fns";
import { PrayerTimesGrid } from "./PrayerTimesGrid";

interface PrayerCalendarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prayerTimes: PrayerTime[];
}

export const PrayerCalendar = ({
  open,
  onOpenChange,
  prayerTimes,
}: PrayerCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPrayerTime, setSelectedPrayerTime] = useState<PrayerTime | null>(
    null
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const formattedDate = format(date, "d-MMM");
    const prayerTime = prayerTimes.find(
      (time) => time.date.toLowerCase() === formattedDate.toLowerCase()
    );
    
    setSelectedDate(date);
    setSelectedPrayerTime(prayerTime || null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Prayer Times Calendar</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-8 py-4">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
            />
          </div>
          <div className="flex-1">
            {selectedPrayerTime ? (
              <>
                <h3 className="text-lg font-semibold mb-4">
                  Prayer Times for {selectedPrayerTime.date}
                </h3>
                <PrayerTimesGrid
                  currentDay={selectedPrayerTime}
                  nextPrayer=""
                />
              </>
            ) : (
              <p className="text-muted-foreground">
                Select a date to view prayer times
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
