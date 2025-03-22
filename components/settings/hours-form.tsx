"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "react-hot-toast"
import { Loader2, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

type Weekday = typeof weekdays[number]

// Create a Zod schema for a single day's hours
const dayHoursSchema = z.object({
  isOpen: z.boolean().default(true),
  openTime: z.string(),
  closeTime: z.string(),
  breaks: z.array(
    z.object({
      startTime: z.string(),
      endTime: z.string(),
      label: z.string().optional(),
    })
  ).optional(),
})

// Create a schema with one field for each day of the week
const hoursFormSchema = z.object({
  businessHoursMode: z.enum(["standard", "custom"], {
    required_error: "Please select business hours mode",
  }),
  timezone: z.string(),
  standardHours: z.object({
    weekdayOpenTime: z.string(),
    weekdayCloseTime: z.string(),
    weekendOpenTime: z.string(),
    weekendCloseTime: z.string(),
    isOpenWeekends: z.boolean(),
  }),
  customHours: z.record(dayHoursSchema),
  holidays: z.array(
    z.object({
      date: z.string(),
      name: z.string(),
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    })
  ).default([]),
})

type HoursFormValues = z.infer<typeof hoursFormSchema>

// Generate array of half-hour time slots from 00:00 to 23:30
const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2)
  const minute = index % 2 === 0 ? "00" : "30"
  const formattedHour = hour.toString().padStart(2, "0")

  // 24-hour format
  const value = `${formattedHour}:${minute}`

  // 12-hour format for display
  const period = hour < 12 ? "AM" : "PM"
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  const display = `${displayHour}:${minute} ${period}`

  return { value, display }
})

// Timezone options
const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET) - New York" },
  { value: "America/Chicago", label: "Central Time (CT) - Chicago" },
  { value: "America/Denver", label: "Mountain Time (MT) - Denver" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT) - Los Angeles" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT) - London" },
  { value: "Europe/Paris", label: "Central European Time (CET) - Paris" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST) - Tokyo" },
  { value: "Australia/Sydney", label: "Australian Eastern Standard Time (AEST) - Sydney" },
]

// This would be populated from your API in a real application
const defaultValues: HoursFormValues = {
  businessHoursMode: "standard",
  timezone: "",
  standardHours: {
    weekdayOpenTime: "",
    weekdayCloseTime: "",
    weekendOpenTime: "",
    weekendCloseTime: "",
    isOpenWeekends: false,
  },
  customHours: {
    Monday: { isOpen: true, openTime: "", closeTime: "" },
    Tuesday: { isOpen: true, openTime: "", closeTime: "" },
    Wednesday: { isOpen: true, openTime: "", closeTime: "" },
    Thursday: { isOpen: true, openTime: "", closeTime: "" },
    Friday: { isOpen: true, openTime: "", closeTime: "" },
    Saturday: { isOpen: false, openTime: "", closeTime: "" },
    Sunday: { isOpen: false, openTime: "", closeTime: "" },
  },
  holidays: [],
}

export default function HoursForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState("general")

  const form = useForm<HoursFormValues>({
    resolver: zodResolver(hoursFormSchema),
    defaultValues,
  })

  // Get the current business hours mode value from the form
  const businessHoursMode = form.watch("businessHoursMode")

  async function onSubmit(data: HoursFormValues) {
    setIsLoading(true)
    try {
      // In a real app, this would call your API
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('Business hours saved successfully')
      console.log(data)
    } catch (error) {
      console.error('Error saving business hours:', error)
      toast.error('Failed to save business hours')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className='flex items-center px-2 overflow-x-auto border-b border-border/10'>
          <div 
            className='relative flex items-center justify-center gap-1 mr-8 cursor-pointer'
            onClick={() => setActiveSubTab("general")}
          >
            <div
              className={`mb-3 font-body px-0 font-normal cursor-pointer flex items-center gap-2 ${
                activeSubTab === "general" ? "text-primary dark:text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className='text-xs font-normal uppercase font-body'>GENERAL</span>
            </div>
            {activeSubTab === "general" && (
              <div className='absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary' />
            )}
          </div>
          <div 
            className='relative flex items-center justify-center gap-1 mr-8 cursor-pointer'
            onClick={() => setActiveSubTab("schedule")}
          >
            <div
              className={`mb-3 font-body px-0 font-normal cursor-pointer flex items-center gap-2 ${
                activeSubTab === "schedule" ? "text-primary dark:text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className='text-xs font-normal uppercase font-body'>SCHEDULE</span>
            </div>
            {activeSubTab === "schedule" && (
              <div className='absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary' />
            )}
          </div>
          <div 
            className='relative flex items-center justify-center gap-1 mr-8 cursor-pointer'
            onClick={() => setActiveSubTab("holidays")}
          >
            <div
              className={`mb-3 font-body px-0 font-normal cursor-pointer flex items-center gap-2 ${
                activeSubTab === "holidays" ? "text-primary dark:text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className='text-xs font-normal uppercase font-body'>HOLIDAYS</span>
            </div>
            {activeSubTab === "holidays" && (
              <div className='absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary' />
            )}
          </div>
        </div>

        {activeSubTab === "general" && (
          <div className="space-y-6 mt-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-normal uppercase font-body">TIMEZONE</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-light bg-card border-border h-10">
                          <SelectValue placeholder="Select timezone" className="text-[10px] font-thin font-body" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timezones.map((timezone) => (
                          <SelectItem key={timezone.value} value={timezone.value} className="text-[10px] font-thin font-body">
                            {timezone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-[10px] uppercase text-muted-foreground">
                      YOUR BUSINESS TIMEZONE AFFECTS HOW BUSINESS HOURS ARE DISPLAYED
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessHoursMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-normal uppercase font-body">BUSINESS HOURS MODE</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-light bg-card border-border h-10">
                          <SelectValue placeholder="Select mode" className="text-[10px] font-thin font-body" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard" className="text-[10px] font-thin font-body">STANDARD (SAME HOURS WEEKDAY/WEEKEND)</SelectItem>
                        <SelectItem value="custom" className="text-[10px] font-thin font-body">CUSTOM (DIFFERENT HOURS PER DAY)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-[10px] uppercase text-muted-foreground">
                      CHOOSE HOW TO CONFIGURE YOUR BUSINESS HOURS
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {activeSubTab === "schedule" && (
          <div className="space-y-6 mt-6">
            {businessHoursMode === "standard" ? (
              <div className="p-4 space-y-6 border rounded-md bg-card/50">
                <div className="space-y-4">
                  <h3 className="text-sm font-normal uppercase font-body">WEEKDAY HOURS (MONDAY - FRIDAY)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="standardHours.weekdayOpenTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-normal uppercase font-body">OPENING TIME</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="font-light bg-card border-border h-10">
                                <SelectValue placeholder="Select opening time" className="text-[10px] font-thin font-body" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time.value} value={time.value} className="text-[10px] font-thin font-body">
                                  {time.display}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="standardHours.weekdayCloseTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-normal uppercase font-body">CLOSING TIME</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="font-light bg-card border-border h-10">
                                <SelectValue placeholder="Select closing time" className="text-[10px] font-thin font-body" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time.value} value={time.value} className="text-[10px] font-thin font-body">
                                  {time.display}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-normal uppercase font-body">WEEKEND HOURS (SATURDAY - SUNDAY)</h3>
                  <FormField
                    control={form.control}
                    name="standardHours.isOpenWeekends"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card border-border">
                        <div className="space-y-0.5">
                          <FormLabel className="text-xs font-normal uppercase font-body">OPEN ON WEEKENDS</FormLabel>
                          <FormDescription className="text-[10px] uppercase text-muted-foreground">
                            TOGGLE WHETHER YOUR BUSINESS IS OPEN ON WEEKENDS
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("standardHours.isOpenWeekends") && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="standardHours.weekendOpenTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-normal uppercase font-body">WEEKEND OPENING TIME</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="font-light bg-card border-border h-10">
                                  <SelectValue placeholder="Select opening time" className="text-[10px] font-thin font-body" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map((time) => (
                                  <SelectItem key={time.value} value={time.value} className="text-[10px] font-thin font-body">
                                    {time.display}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="standardHours.weekendCloseTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-normal uppercase font-body">WEEKEND CLOSING TIME</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="font-light bg-card border-border h-10">
                                  <SelectValue placeholder="Select closing time" className="text-[10px] font-thin font-body" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map((time) => (
                                  <SelectItem key={time.value} value={time.value} className="text-[10px] font-thin font-body">
                                    {time.display}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {weekdays.map((day) => (
                  <div key={day} className="p-4 border rounded-md bg-card/50">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-normal uppercase font-body">{day}</h3>
                        <FormField
                          control={form.control}
                          name={`customHours.${day}.isOpen` as any}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormLabel className="text-xs font-normal uppercase font-body">OPEN</FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {form.watch(`customHours.${day}.isOpen` as any) && (
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`customHours.${day}.openTime` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-normal uppercase font-body">OPENING TIME</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="font-light bg-card border-border h-10">
                                      <SelectValue placeholder="Select opening time" className="text-[10px] font-thin font-body" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {timeOptions.map((time) => (
                                      <SelectItem key={time.value} value={time.value} className="text-[10px] font-thin font-body">
                                        {time.display}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`customHours.${day}.closeTime` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-normal uppercase font-body">CLOSING TIME</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="font-light bg-card border-border h-10">
                                      <SelectValue placeholder="Select closing time" className="text-[10px] font-thin font-body" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {timeOptions.map((time) => (
                                      <SelectItem key={time.value} value={time.value} className="text-[10px] font-thin font-body">
                                        {time.display}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === "holidays" && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-normal uppercase font-body">HOLIDAYS & SPECIAL DAYS</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-[10px] font-normal uppercase font-body h-8"
                onClick={() => {
                  const holidays = form.getValues("holidays") || [];
                  form.setValue("holidays", [
                    ...holidays,
                    {
                      date: "",
                      name: "",
                      isOpen: false,
                      openTime: undefined,
                      closeTime: undefined,
                    }
                  ]);
                }}
              >
                ADD HOLIDAY
              </Button>
            </div>
            
            <div className="space-y-4">
              {form.watch("holidays").map((_, index) => (
                <div key={index} className="p-4 border rounded-md bg-card/50 space-y-4">
                  <div className="flex justify-between">
                    <h4 className="text-xs font-normal uppercase font-body">HOLIDAY {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive h-6 text-[10px]"
                      onClick={() => {
                        const holidays = form.getValues("holidays");
                        form.setValue("holidays", 
                          holidays.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      REMOVE
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`holidays.${index}.date` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-normal uppercase font-body">DATE</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="font-light bg-card border-border h-10"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`holidays.${index}.name` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-normal uppercase font-body">HOLIDAY NAME</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. Christmas Day"
                              className="font-light bg-card border-border h-10 placeholder:text-[10px] placeholder:font-body"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`holidays.${index}.isOpen` as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card border-border">
                        <div className="space-y-0.5">
                          <FormLabel className="text-xs font-normal uppercase font-body">OPEN ON THIS HOLIDAY</FormLabel>
                          <FormDescription className="text-[10px] uppercase text-muted-foreground">
                            TOGGLE WHETHER YOUR BUSINESS IS OPEN ON THIS DAY
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch(`holidays.${index}.isOpen` as any) && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`holidays.${index}.openTime` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-normal uppercase font-body">OPENING TIME</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="font-light bg-card border-border h-10">
                                  <SelectValue placeholder="Select opening time" className="text-[10px] font-thin font-body" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map((time) => (
                                  <SelectItem key={time.value} value={time.value} className="text-[10px] font-thin font-body">
                                    {time.display}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`holidays.${index}.closeTime` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-normal uppercase font-body">CLOSING TIME</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="font-light bg-card border-border h-10">
                                  <SelectValue placeholder="Select closing time" className="text-[10px] font-thin font-body" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map((time) => (
                                  <SelectItem key={time.value} value={time.value} className="text-[10px] font-thin font-body">
                                    {time.display}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 mt-6 border-t border-border">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-9 text-[10px] font-normal uppercase font-body bg-primary hover:bg-primary/90 text-white"
          >
            {isLoading ? (
              <>
                <Loader2
                  className="w-4 h-4 mr-2 animate-spin"
                  strokeWidth={1.5}
                />
                SAVING...
              </>
            ) : (
              'SAVE CHANGES'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
