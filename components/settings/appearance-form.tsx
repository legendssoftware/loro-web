"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "react-hot-toast"
import { CheckIcon, Loader2, MoonIcon, SunIcon, LayoutGridIcon, Palette } from "lucide-react"
import { Input } from "@/components/ui/input"

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Please select a theme.",
  }),
  primaryColor: z.string().min(4).default("#0073EA"),
  secondaryColor: z.string().min(4).default("#5856D6"),
  accentColor: z.string().min(4).default("#FF2D55"),
  errorColor: z.string().min(4).default("#FF3B30"),
  successColor: z.string().min(4).default("#34C759"),
  logoUrl: z.string().optional(),
  logoAltText: z.string().optional(),
  fontFamily: z.enum(["default", "system", "mono", "sans"], {
    required_error: "Please select a font family.",
  }),
  radius: z.enum(["default", "subtle", "full"], {
    required_error: "Please select a radius.",
  }),
  fontSize: z.enum(["default", "small", "large"], {
    required_error: "Please select a font size.",
  }),
  layout: z.enum(["default", "compact", "comfortable"], {
    required_error: "Please select a layout.",
  }),
  animations: z.boolean().default(true),
  reducedMotion: z.boolean().default(false),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

// This would be populated from your API or local storage in a real application
const defaultValues: AppearanceFormValues = {
  theme: "system",
  primaryColor: "#0073EA",
  secondaryColor: "#5856D6",
  accentColor: "#FF2D55",
  errorColor: "#FF3B30",
  successColor: "#34C759",
  logoUrl: "",
  logoAltText: "",
  fontFamily: "default",
  radius: "default",
  fontSize: "default",
  layout: "default",
  animations: true,
  reducedMotion: false,
}

export default function AppearanceForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues,
  })

  async function onSubmit(data: AppearanceFormValues) {
    setIsLoading(true)
    try {
      // In a real app, this would save to your API or local storage
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('Appearance settings saved successfully')
    } catch (error) {
      console.error('Error saving appearance settings:', error)
      toast.error('Failed to save appearance settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className='flex items-center px-2 overflow-x-auto border-b border-border/10'>
          <div className='relative flex items-center justify-center gap-1 mr-8 cursor-pointer'>
            <div
              className='mb-3 font-body px-0 font-normal cursor-pointer flex items-center gap-2 text-primary dark:text-primary'
            >
              <span className='text-xs font-normal uppercase font-body'>THEME</span>
            </div>
            <div className='absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary' />
          </div>
          <div className='relative flex items-center justify-center gap-1 mr-8 cursor-pointer'>
            <div
              className='mb-3 font-body px-0 font-normal cursor-pointer flex items-center gap-2 text-muted-foreground hover:text-foreground'
            >
              <span className='text-xs font-normal uppercase font-body'>COLORS</span>
            </div>
          </div>
          <div className='relative flex items-center justify-center gap-1 mr-8 cursor-pointer'>
            <div
              className='mb-3 font-body px-0 font-normal cursor-pointer flex items-center gap-2 text-muted-foreground hover:text-foreground'
            >
              <span className='text-xs font-normal uppercase font-body'>TYPOGRAPHY & LAYOUT</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-6">
          <h3 className="text-sm font-normal uppercase font-body mt-8">THEME</h3>
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-normal uppercase font-body">
                  SELECT THEME
                </FormLabel>
                <FormDescription className="text-[10px] uppercase text-muted-foreground">
                  SELECT A THEME FOR YOUR DASHBOARD
                </FormDescription>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-3 gap-4"
                >
                  <FormItem>
                    <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                      <FormControl>
                        <RadioGroupItem value="light" className="sr-only" />
                      </FormControl>
                      <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent cursor-pointer">
                        <div className="space-y-2 rounded-sm bg-[#FAFAFA] p-2">
                          <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-2 w-[60%] rounded-lg bg-[#EAEAEA]" />
                            <div className="h-2 w-[80%] rounded-lg bg-[#EAEAEA]" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-[#EAEAEA]" />
                            <div className="h-2 w-[80%] rounded-lg bg-[#EAEAEA]" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-[#EAEAEA]" />
                            <div className="h-2 w-[80%] rounded-lg bg-[#EAEAEA]" />
                          </div>
                        </div>
                      </div>
                      <span className="block w-full p-2 text-center text-xs font-normal font-body uppercase">
                        LIGHT
                      </span>
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                      <FormControl>
                        <RadioGroupItem value="dark" className="sr-only" />
                      </FormControl>
                      <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent cursor-pointer">
                        <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                          <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-2 w-[60%] rounded-lg bg-slate-700" />
                            <div className="h-2 w-[80%] rounded-lg bg-slate-700" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-slate-700" />
                            <div className="h-2 w-[80%] rounded-lg bg-slate-700" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-slate-700" />
                            <div className="h-2 w-[80%] rounded-lg bg-slate-700" />
                          </div>
                        </div>
                      </div>
                      <span className="block w-full p-2 text-center text-xs font-normal font-body uppercase">
                        DARK
                      </span>
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                      <FormControl>
                        <RadioGroupItem value="system" className="sr-only" />
                      </FormControl>
                      <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent cursor-pointer">
                        <div className="space-y-2 rounded-sm bg-gradient-to-r from-[#FAFAFA] to-slate-950 p-2">
                          <div className="space-y-2 rounded-md bg-gradient-to-r from-white to-slate-800 p-2 shadow-sm">
                            <div className="h-2 w-[60%] rounded-lg bg-gradient-to-r from-[#EAEAEA] to-slate-700" />
                            <div className="h-2 w-[80%] rounded-lg bg-gradient-to-r from-[#EAEAEA] to-slate-700" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-gradient-to-r from-white to-slate-800 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-[#EAEAEA] to-slate-700" />
                            <div className="h-2 w-[80%] rounded-lg bg-gradient-to-r from-[#EAEAEA] to-slate-700" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-gradient-to-r from-white to-slate-800 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-[#EAEAEA] to-slate-700" />
                            <div className="h-2 w-[80%] rounded-lg bg-gradient-to-r from-[#EAEAEA] to-slate-700" />
                          </div>
                        </div>
                      </div>
                      <span className="block w-full p-2 text-center text-xs font-normal font-body uppercase">
                        SYSTEM
                      </span>
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormItem>
            )}
          />

          <h3 className="text-sm font-normal uppercase font-body mt-8">COLORS</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal uppercase font-body">PRIMARY COLOR</FormLabel>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-md border border-border" 
                      style={{ backgroundColor: field.value }}
                    />
                    <FormControl>
                      <Input 
                        type="text" 
                        {...field} 
                        className="font-light bg-card border-border h-10 placeholder:text-[10px] placeholder:font-body"
                      />
                    </FormControl>
                  </div>
                  <div className="mt-1.5">
                    <FormControl>
                      <Input 
                        type="color" 
                        {...field} 
                        className="h-8 w-full"
                      />
                    </FormControl>
                  </div>
                  <FormDescription className="text-[10px] uppercase text-muted-foreground">
                    USED FOR PRIMARY BUTTONS AND LINKS
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="secondaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal uppercase font-body">SECONDARY COLOR</FormLabel>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-md border border-border" 
                      style={{ backgroundColor: field.value }}
                    />
                    <FormControl>
                      <Input 
                        type="text" 
                        {...field} 
                        className="font-light bg-card border-border h-10 placeholder:text-[10px] placeholder:font-body"
                      />
                    </FormControl>
                  </div>
                  <div className="mt-1.5">
                    <FormControl>
                      <Input 
                        type="color" 
                        {...field} 
                        className="h-8 w-full"
                      />
                    </FormControl>
                  </div>
                  <FormDescription className="text-[10px] uppercase text-muted-foreground">
                    USED FOR SECONDARY UI ELEMENTS
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accentColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal uppercase font-body">ACCENT COLOR</FormLabel>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-md border border-border" 
                      style={{ backgroundColor: field.value }}
                    />
                    <FormControl>
                      <Input 
                        type="text" 
                        {...field} 
                        className="font-light bg-card border-border h-10 placeholder:text-[10px] placeholder:font-body"
                      />
                    </FormControl>
                  </div>
                  <div className="mt-1.5">
                    <FormControl>
                      <Input 
                        type="color" 
                        {...field} 
                        className="h-8 w-full"
                      />
                    </FormControl>
                  </div>
                  <FormDescription className="text-[10px] uppercase text-muted-foreground">
                    USED FOR HIGHLIGHTS AND ACCENTS
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="errorColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal uppercase font-body">ERROR COLOR</FormLabel>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-md border border-border" 
                      style={{ backgroundColor: field.value }}
                    />
                    <FormControl>
                      <Input 
                        type="text" 
                        {...field} 
                        className="font-light bg-card border-border h-10 placeholder:text-[10px] placeholder:font-body"
                      />
                    </FormControl>
                  </div>
                  <div className="mt-1.5">
                    <FormControl>
                      <Input 
                        type="color" 
                        {...field} 
                        className="h-8 w-full"
                      />
                    </FormControl>
                  </div>
                  <FormDescription className="text-[10px] uppercase text-muted-foreground">
                    USED FOR ERROR MESSAGES AND ALERTS
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="successColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal uppercase font-body">SUCCESS COLOR</FormLabel>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-md border border-border" 
                      style={{ backgroundColor: field.value }}
                    />
                    <FormControl>
                      <Input 
                        type="text" 
                        {...field} 
                        className="font-light bg-card border-border h-10 placeholder:text-[10px] placeholder:font-body"
                      />
                    </FormControl>
                  </div>
                  <div className="mt-1.5">
                    <FormControl>
                      <Input 
                        type="color" 
                        {...field} 
                        className="h-8 w-full"
                      />
                    </FormControl>
                  </div>
                  <FormDescription className="text-[10px] uppercase text-muted-foreground">
                    USED FOR SUCCESS MESSAGES AND CONFIRMATIONS
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <h3 className="text-sm font-normal uppercase font-body mt-8">LOGO</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal uppercase font-body">LOGO URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/logo.png" 
                      {...field} 
                      className="font-light bg-card border-border h-10 placeholder:text-[10px] placeholder:font-body"
                    />
                  </FormControl>
                  <FormDescription className="text-[10px] uppercase text-muted-foreground">
                    URL TO YOUR ORGANIZATION'S LOGO IMAGE
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="logoAltText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-normal uppercase font-body">LOGO ALT TEXT</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Company name logo" 
                        {...field} 
                        className="font-light bg-card border-border h-10 placeholder:text-[10px] placeholder:font-body"
                      />
                    </FormControl>
                    <FormDescription className="text-[10px] uppercase text-muted-foreground">
                      ALTERNATIVE TEXT FOR THE LOGO
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel className="text-xs font-normal uppercase font-body">UPLOAD LOGO</FormLabel>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-10 border-2 border-dashed rounded-md cursor-pointer bg-card border-border hover:bg-background/50">
                    <div className="flex items-center justify-center pt-1">
                      <p className="text-[10px] font-body text-muted-foreground">CLICK TO UPLOAD</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      // This would normally handle the file upload
                      const file = e.target.files?.[0];
                      if (file) {
                        // A real implementation would upload the file and update the logoUrl field
                        console.log('File selected:', file.name);
                      }
                    }} />
                  </label>
                </div>
                <FormDescription className="text-[10px] uppercase text-muted-foreground">
                  UPLOAD A NEW LOGO IMAGE FILE
                </FormDescription>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-normal uppercase font-body mt-8">TYPOGRAPHY & LAYOUT</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="fontFamily"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal uppercase font-body">FONT FAMILY</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full font-light bg-card border-border h-10">
                        <SelectValue placeholder="Select a font family" className="text-[10px] font-thin font-body" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="default" className="text-[10px] font-thin font-body">DEFAULT (INTER)</SelectItem>
                      <SelectItem value="system" className="text-[10px] font-thin font-body">SYSTEM</SelectItem>
                      <SelectItem value="mono" className="text-[10px] font-thin font-body">MONOSPACE</SelectItem>
                      <SelectItem value="sans" className="text-[10px] font-thin font-body">SANS SERIF</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[10px] uppercase text-muted-foreground">
                    CHOOSE A FONT FAMILY FOR ALL TEXT
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fontSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal uppercase font-body">FONT SIZE</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full font-light bg-card border-border h-10">
                        <SelectValue placeholder="Select a font size" className="text-[10px] font-thin font-body" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="default" className="text-[10px] font-thin font-body">DEFAULT</SelectItem>
                      <SelectItem value="small" className="text-[10px] font-thin font-body">SMALL</SelectItem>
                      <SelectItem value="large" className="text-[10px] font-thin font-body">LARGE</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[10px] uppercase text-muted-foreground">
                    ADJUST THE BASE FONT SIZE FOR ALL UI ELEMENTS
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="radius"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal uppercase font-body">BORDER RADIUS</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full font-light bg-card border-border h-10">
                        <SelectValue placeholder="Select border radius style" className="text-[10px] font-thin font-body" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="default" className="text-[10px] font-thin font-body">DEFAULT (4PX)</SelectItem>
                      <SelectItem value="subtle" className="text-[10px] font-thin font-body">SUBTLE (2PX)</SelectItem>
                      <SelectItem value="full" className="text-[10px] font-thin font-body">FULL (9999PX)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[10px] uppercase text-muted-foreground">
                    ADJUST THE ROUNDNESS OF UI ELEMENTS
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="layout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal uppercase font-body">LAYOUT DENSITY</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full font-light bg-card border-border h-10">
                        <SelectValue placeholder="Select a layout density" className="text-[10px] font-thin font-body" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="default" className="text-[10px] font-thin font-body">DEFAULT</SelectItem>
                      <SelectItem value="compact" className="text-[10px] font-thin font-body">COMPACT</SelectItem>
                      <SelectItem value="comfortable" className="text-[10px] font-thin font-body">COMFORTABLE</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[10px] uppercase text-muted-foreground">
                    ADJUST THE SPACING BETWEEN UI ELEMENTS
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <h3 className="text-sm font-normal uppercase font-body mt-8">ANIMATIONS</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="animations"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card border-border">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs font-normal uppercase font-body">ANIMATIONS</FormLabel>
                    <FormDescription className="text-[10px] uppercase text-muted-foreground">
                      ENABLE ANIMATIONS THROUGHOUT THE INTERFACE
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

            <FormField
              control={form.control}
              name="reducedMotion"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card border-border">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs font-normal uppercase font-body">REDUCED MOTION</FormLabel>
                    <FormDescription className="text-[10px] uppercase text-muted-foreground">
                      RESPECT SYSTEM SETTING FOR REDUCED MOTION
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
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-4 mt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-9 text-[10px] font-normal uppercase font-body bg-primary hover:bg-primary/90 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" strokeWidth={1.5} />
                SAVING...
              </>
            ) : (
              "SAVE CHANGES"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
