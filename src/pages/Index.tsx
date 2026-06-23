import { useEffect, useState } from "react";
import { PrayerTime } from "@/types/prayer";
import {
  parsePrayerTimes,
  getCurrentDayPrayerTimes,
  getNextPrayer,
} from "@/utils/prayerTimes";
import { Calendar, Moon } from "lucide-react";
import { PrayerTimesGrid } from "@/components/PrayerTimesGrid";
import { PrayerCalendar } from "@/components/PrayerCalendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { sampleData } from "@/data/prayerTimesData";

const allPrayerTimes = parsePrayerTimes(sampleData);

const Index = () => {
  const [currentDay, setCurrentDay] = useState<PrayerTime | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const today = getCurrentDayPrayerTimes(allPrayerTimes);
    if (today) {
      setCurrentDay(today);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not find prayer times for today",
      });
    }
  }, []);

  useEffect(() => {
    if (currentDay) {
      setNextPrayer(getNextPrayer(currentDay));
    }
  }, [currentDay]);

  if (!currentDay) return null;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Moon className="w-8 h-8 text-secondary mr-2" aria-hidden="true" />
            <h1 className="text-3xl font-bold text-foreground">Prayer Times</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        <PrayerTimesGrid currentDay={currentDay} nextPrayer={nextPrayer} />

        <div className="mt-8 text-center">
          <Button
            variant="secondary"
            onClick={() => setCalendarOpen(true)}
            className="inline-flex items-center"
          >
            <Calendar className="w-5 h-5 mr-2" aria-hidden="true" />
            View Calendar
          </Button>
        </div>

        <PrayerCalendar
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
          prayerTimes={allPrayerTimes}
        />
      </div>
    </div>
  );
};

export default Index;
