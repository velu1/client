"use client";

import * as React from "react";
import { ClockIcon } from "@radix-ui/react-icons";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import calender from "../../assets/newIcons/inverdSystem/calender.svg";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface DateTimeRange {
  from?: {
    date: Date;
    time?: {
      hours: number;
      minutes: number;
      ampm: "AM" | "PM";
    };
  };
  to?: {
    date: Date;
    time?: {
      hours: number;
      minutes: number;
      ampm: "AM" | "PM";
    };
  };
}

export function DateTimePickerWithRange({
  className,
  disableFutureDates,
}: React.HTMLAttributes<HTMLDivElement> & { disableFutureDates?: boolean }) {
  const today = React.useMemo(() => new Date(), []);
  const thirtyDaysAgo = React.useMemo(() => subDays(today, 30), [today]);

  // Initial date range - last 30 days
  const initialDateRange = {
    from: thirtyDaysAgo,
    to: today,
  };

  const initialFullDateTimeRange: DateTimeRange = {
    from: {
      date: thirtyDaysAgo,
      time: {
        hours: 0,
        minutes: 0,
        ampm: "AM",
      },
    },
    to: {
      date: today,
      time: {
        hours: 23,
        minutes: 55,
        ampm: "PM",
      },
    },
  };

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    initialDateRange
  );

  const [activeTab, setActiveTab] = React.useState<"from" | "to">("from");
  const [isOpen, setIsOpen] = React.useState(false);

  // Initialize the full date-time objects
  const [fullDateTimeRange, setFullDateTimeRange] =
    React.useState<DateTimeRange>(initialFullDateTimeRange);

  // Update the full date-time when date range changes
  React.useEffect(() => {
    if (dateRange?.from) {
      // @ts-expect-error - dateRange.from is not undefined
      setFullDateTimeRange((prev) => ({
        ...prev,
        from: {
          ...prev.from,
          date: dateRange.from,
        },
      }));
    }

    if (dateRange?.to) {
      // @ts-expect-error - dateRange.to is not undefined
      setFullDateTimeRange((prev) => ({
        ...prev,
        to: {
          ...prev.to,
          date: dateRange.to,
        },
      }));
    }
  }, [dateRange]);

  // Listen for reset events
  React.useEffect(() => {
    const handleResetDateTimeRange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.dateRange) {
        const resetDateRange = customEvent.detail.dateRange;
        // Reset both date range and full date time range
        setDateRange({
          from: resetDateRange.from.date,
          to: resetDateRange.to.date,
        });
        setFullDateTimeRange(resetDateRange);
      }
    };

    // Add event listener
    document.addEventListener("resetdatetimerange", handleResetDateTimeRange);

    // Clean up
    return () => {
      document.removeEventListener(
        "resetdatetimerange",
        handleResetDateTimeRange
      );
    };
  }, []);

  // Dispatch initial date range on component mount
  React.useEffect(() => {
    // Small delay to ensure parent component is ready
    const timer = setTimeout(() => {
      const initEvent = new CustomEvent("datetimerangeapplied", {
        detail: {
          from: thirtyDaysAgo,
          to: today,
          fullRange: {
            from: {
              date: thirtyDaysAgo,
              time: {
                hours: 0,
                minutes: 0,
                ampm: "AM",
              },
            },
            to: {
              date: today,
              time: {
                hours: 23,
                minutes: 55,
                ampm: "PM",
              },
            },
          },
        },
        bubbles: true,
      });
      document.dispatchEvent(initEvent);
    }, 100);

    return () => clearTimeout(timer);
  }, [thirtyDaysAgo, today]);

  // Handle time changes
  const handleTimeChange = (
    target: "from" | "to",
    type: "hours" | "minutes" | "ampm",
    value: number | string
  ) => {
    setFullDateTimeRange((prev) => ({
      ...prev,
      [target]: {
        ...prev[target],
        time: {
          ...prev[target]?.time,
          [type]: type === "ampm" ? value : Number(value),
        },
      },
    }));
  };

  // Format the display date with both date and time
  const formatDateTime = (target: "from" | "to") => {
    const dateTimeObj = fullDateTimeRange[target];
    if (!dateTimeObj?.date) return "";

    const { date } = dateTimeObj;
    const { hours, minutes, ampm } = dateTimeObj.time || {
      hours: 12,
      minutes: 0,
      ampm: "AM",
    };

    const timeString = `${hours}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;
    return `${format(date, "LLL dd, y")} at ${timeString}`;
  };

  // Get the combined date and time as Date objects
  const getFullDateTime = (target: "from" | "to"): Date | undefined => {
    const dateTimeObj = fullDateTimeRange[target];
    if (!dateTimeObj?.date || !dateTimeObj?.time) return undefined;

    const { date } = dateTimeObj;
    const { hours, minutes, ampm } = dateTimeObj.time;

    const result = new Date(date);
    result.setHours(
      ampm === "PM" ? (hours % 12) + 12 : hours % 12,
      minutes,
      0,
      0
    );

    return result;
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className={cn("relative grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between text-[8px] md:text-xs text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {formatDateTime("from")} - {formatDateTime("to")}
                </>
              ) : (
                formatDateTime("from")
              )
            ) : (
              <span>Pick a date and time range</span>
            )}
            <img src={calender} alt="image" className="h-5 w-5 mr-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="md:w-auto p-0" align="start">
          <div className="p-3 border-b">
            <Tabs
              defaultValue="from"
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "from" | "to")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="from">Start Date & Time</TabsTrigger>
                <TabsTrigger value="to">End Date & Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col">
            <div className="p-2">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                disabled={
                  disableFutureDates ? { after: new Date() } : undefined
                }
              />
            </div>

            <div className="border-t p-3">
              <div className="flex items-center mb-2">
                <ClockIcon className="mr-2 h-4 w-4" />
                <span>
                  Select Time ({activeTab === "from" ? "Start" : "End"})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={fullDateTimeRange[activeTab]?.time?.hours.toString()}
                  onValueChange={(value) =>
                    handleTimeChange(activeTab, "hours", value)
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-slate-500">:</span>

                <Select
                  value={fullDateTimeRange[activeTab]?.time?.minutes.toString()}
                  onValueChange={(value) =>
                    handleTimeChange(activeTab, "minutes", value)
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((minute) => (
                      <SelectItem key={minute} value={minute.toString()}>
                        {minute.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={fullDateTimeRange[activeTab]?.time?.ampm}
                  onValueChange={(value) =>
                    handleTimeChange(activeTab, "ampm", value)
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="AM/PM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 border-t flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Explicitly trigger any side effects that should happen when dates are applied
                  const fromDate = getFullDateTime("from");
                  const toDate = getFullDateTime("to");

                  // Update the dateRange with the calculated full date time
                  if (fromDate) {
                    if (toDate) {
                      setDateRange({ from: fromDate, to: toDate });
                    } else {
                      setDateRange({ from: fromDate });
                    }
                  }

                  // Close the popover
                  setIsOpen(false);

                  // Dispatch a custom event to notify listeners that dates were applied
                  const applyEvent = new CustomEvent("datetimerangeapplied", {
                    detail: {
                      from: fromDate,
                      to: toDate,
                      fullRange: fullDateTimeRange,
                    },
                    bubbles: true,
                  });
                  document.dispatchEvent(applyEvent);
                }}
                size="sm"
                className="bg-primary text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
