import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface PrayerCardProps {
  name: string;
  time: string;
  isNext?: boolean;
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getNotificationDelay(prayerTime: string, minutesBefore: number): number | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const prayerMinutes = parseTimeToMinutes(prayerTime);
  const target = new Date(today.getTime() + prayerMinutes * 60 * 1000);
  target.setMinutes(target.getMinutes() - minutesBefore);
  const delay = target.getTime() - now.getTime();
  return delay > 0 ? delay : null;
}

function scheduleNotification(name: string, time: string, minutesBefore: number): (() => void) | null {
  const delay = getNotificationDelay(time, minutesBefore);
  if (delay === null) return null;

  const timeoutId = setTimeout(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`🕌 ${name} Prayer`, {
        body: `${name} time is in ${minutesBefore} minutes (${time})`,
        icon: "/favicon.ico",
      });
    }
  }, delay);

  return () => clearTimeout(timeoutId);
}

export const PrayerCard = ({ name, time, isNext = false }: PrayerCardProps) => {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [minutes, setMinutes] = useState([15]);
  const cancelRef = useRef<(() => void) | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled && cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
  }, [enabled]);

  useEffect(() => {
    return () => {
      if (cancelRef.current) cancelRef.current();
    };
  }, []);

  const handleSave = () => {
    setOpen(false);
    if (enabled) {
      if (cancelRef.current) cancelRef.current();
      const cancel = scheduleNotification(name, time, minutes[0]);
      cancelRef.current = cancel ?? null;

      if (!cancel) {
        toast({
          variant: "destructive",
          title: "Cannot set reminder",
          description: `${name} (${time}) has already passed for today`,
        });
        return;
      }

      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }

      toast({
        title: "Reminder set",
        description: `You will be notified ${minutes[0]} minutes before ${name} (${time})`,
      });
    } else {
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
      toast({
        title: "Reminder disabled",
        description: `Notifications for ${name} have been disabled`,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        className={cn(
          "p-4 rounded-lg transition-all duration-300 cursor-pointer",
          isNext
            ? "bg-primary text-primary-foreground shadow-lg scale-105"
            : "bg-accent text-accent-foreground hover:shadow-md"
        )}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{name}</h3>
          <Clock className="w-5 h-5" aria-hidden="true" />
        </div>
        <p className="text-2xl font-bold mt-2">{time}</p>
        {isNext && (
          <span className="inline-block mt-2 text-sm bg-white/20 px-2 py-1 rounded">
            Next Prayer
          </span>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Reminder for {name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <span>Enable notifications</span>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
            {enabled && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Notify me {minutes[0]} minutes before {name} ({time})
                </p>
                <Slider
                  value={minutes}
                  onValueChange={setMinutes}
                  min={0}
                  max={30}
                  step={5}
                />
              </div>
            )}
            <Button onClick={handleSave} className="w-full">
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};