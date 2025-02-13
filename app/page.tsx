'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { 
	BarChart, 
	Bar,
	AreaChart,
	Area,
	XAxis,
	CartesianGrid
} from 'recharts'
import { motion } from "framer-motion"
import { format } from "date-fns"
import { 
	Calendar as CalendarIcon, 
	TrendingUp, 
	TrendingDown, 
	CalendarClock, 
	ClipboardCheck,
	FileText,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import React from "react"
import { useReports, ReportPeriod } from "@/hooks/use-reports"
import { Loader2 } from "lucide-react"
import { ReportType } from "@/lib/types/reports"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart"

// Animation variants
const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.3,
		},
	},
}

const itemVariants = {
	hidden: {
		opacity: 0,
		y: 20,
	},
	show: {
		opacity: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 300,
			damping: 24,
		}
	},
}

const sectionVariants = {
	hidden: {
		opacity: 0,
		y: 40,
	},
	show: {
		opacity: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 300,
			damping: 24,
			delay: 0.4,
		}
	},
}

const REPORT_OPTIONS = {
	[ReportType.QUOTATION]: { label: 'Quotations Report', icon: <FileText className="w-4 h-4" /> },
	[ReportType.TASK]: { label: 'Tasks Report', icon: <ClipboardCheck className="w-4 h-4" /> }
} as const

const TIME_OPTIONS = [
	{ value: ReportPeriod.DAILY, label: 'Daily', icon: <CalendarClock className="w-4 h-4" /> },
	{ value: ReportPeriod.WEEKLY, label: 'Weekly', icon: <CalendarClock className="w-4 h-4" /> },
	{ value: ReportPeriod.MONTHLY, label: 'Monthly', icon: <CalendarClock className="w-4 h-4" /> },
	{ value: ReportPeriod.QUARTERLY, label: 'Quarterly', icon: <CalendarClock className="w-4 h-4" /> },
	{ value: ReportPeriod.YEARLY, label: 'Yearly', icon: <CalendarClock className="w-4 h-4" /> }
];

// Sample data - In a real app, this would come from your API
const quotationData = [
	{ date: '2024-06-01', total: 20, accepted: 15, pending: 5 },
	{ date: '2024-06-02', total: 25, accepted: 18, pending: 7 },
	{ date: '2024-06-03', total: 30, accepted: 22, pending: 8 },
	{ date: '2024-06-04', total: 22, accepted: 16, pending: 6 },
	{ date: '2024-06-05', total: 28, accepted: 20, pending: 8 },
	{ date: '2024-06-06', total: 15, accepted: 10, pending: 5 },
	{ date: '2024-06-07', total: 18, accepted: 12, pending: 6 },
	{ date: '2024-06-08', total: 20, accepted: 15, pending: 5 },
	{ date: '2024-06-09', total: 25, accepted: 18, pending: 7 },
	{ date: '2024-06-10', total: 30, accepted: 22, pending: 8 },
	{ date: '2024-06-11', total: 22, accepted: 16, pending: 6 },
	{ date: '2024-06-12', total: 28, accepted: 20, pending: 8 },
	{ date: '2024-06-13', total: 15, accepted: 10, pending: 5 },
	{ date: '2024-06-14', total: 18, accepted: 12, pending: 6 },
	{ date: '2024-06-15', total: 20, accepted: 15, pending: 5 },
	{ date: '2024-06-16', total: 25, accepted: 18, pending: 7 },
	{ date: '2024-06-17', total: 30, accepted: 22, pending: 8 },
	{ date: '2024-06-18', total: 22, accepted: 16, pending: 6 },
	{ date: '2024-06-19', total: 28, accepted: 20, pending: 8 },
	{ date: '2024-06-20', total: 15, accepted: 10, pending: 5 },
	{ date: '2024-06-21', total: 18, accepted: 12, pending: 6 },
	{ date: '2024-06-22', total: 20, accepted: 15, pending: 5 },
	{ date: '2024-06-23', total: 25, accepted: 18, pending: 7 },
	{ date: '2024-06-24', total: 30, accepted: 22, pending: 8 },
	{ date: '2024-06-25', total: 22, accepted: 16, pending: 6 },
	{ date: '2024-06-26', total: 28, accepted: 20, pending: 8 },
	{ date: '2024-06-27', total: 15, accepted: 10, pending: 5 },
	{ date: '2024-06-28', total: 18, accepted: 12, pending: 6 }
]

// Update the task data to match the new format
const taskComparisonData = [
	{ month: "January", completed: 186, pending: 80 },
	{ month: "February", completed: 305, pending: 200 },
	{ month: "March", completed: 237, pending: 120 },
	{ month: "April", completed: 73, pending: 190 },
	{ month: "May", completed: 209, pending: 130 },
	{ month: "June", completed: 214, pending: 140 },
]

const taskChartConfig = {
	completed: {
		label: "Completed",
		color: "hsl(var(--chart-1))",
	},
	pending: {
		label: "Pending",
		color: "hsl(var(--chart-2))",
	},
} satisfies ChartConfig

const taskPriorityData = [
	{ name: 'High', total: 45, completed: 30 },
	{ name: 'Medium', total: 65, completed: 50 },
	{ name: 'Low', total: 40, completed: 35 }
]

const revenueData = [
	{ name: 'Week 1', value: 25000 },
	{ name: 'Week 2', value: 32000 },
	{ name: 'Week 3', value: 28000 },
	{ name: 'Week 4', value: 35000 }
]

const taskPriorityConfig = {
	total: {
		label: "Total Tasks",
		color: "hsl(var(--chart-1))",
	},
	completed: {
		label: "Completed",
		color: "hsl(var(--chart-2))",
	},
} satisfies ChartConfig

const revenueConfig = {
	value: {
		label: "Revenue",
		color: "hsl(var(--chart-1))",
	},
} satisfies ChartConfig

const quotationChartConfig = {
	quotations: {
		label: "Quotations",
	},
	total: {
		label: "Total",
		color: "hsl(var(--chart-1))",
	},
	accepted: {
		label: "Accepted",
		color: "hsl(var(--chart-2))",
	},
	pending: {
		label: "Pending",
		color: "hsl(var(--chart-3))",
	},
} satisfies ChartConfig

export default function Dashboard() {
	const {
		dateRange,
		setDateRange,
		period,
		setPeriod,
		reportType,
		setReportType,
		isGenerating,
		error,
		handleGenerateReport
	} = useReports();

	React.useEffect(() => {
		if (error) {
			//use react hot toast
		}
	}, [error]);

	return (
		<motion.div
			initial="hidden"
			animate="show"
			variants={containerVariants}
			className="flex flex-col h-screen gap-6 p-6 overflow-y-scroll">
			
			{/* Key Metrics Cards */}
			<motion.div variants={containerVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<motion.div variants={itemVariants}>
					<Card>
						<CardContent className="p-6">
							<div className="flex flex-col gap-4">
								<p className="text-xs font-normal uppercase text-muted-foreground font-body">Total Quotations</p>
								<div className="flex items-center justify-between">
									<h2 className="text-2xl font-bold font-body text-card-foreground">158</h2>
									<span className="flex items-center text-xs font-normal text-emerald-500 font-body">
										<TrendingUp className="w-4 h-4 mr-1" />
										12.5%
									</span>
								</div>
								<p className="text-xs font-normal uppercase text-muted-foreground font-body">vs last month</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card>
						<CardContent className="p-6">
							<div className="flex flex-col gap-4">
								<p className="text-xs font-normal uppercase text-muted-foreground font-body">Task Completion Rate</p>
								<div className="flex items-center justify-between">
									<h2 className="text-2xl font-bold font-body text-card-foreground">85%</h2>
									<span className="flex items-center text-xs font-normal text-emerald-500 font-body">
										<TrendingUp className="w-4 h-4 mr-1" />
										5.2%
									</span>
								</div>
								<p className="text-xs font-normal uppercase text-muted-foreground font-body">vs last week</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card>
						<CardContent className="p-6">
							<div className="flex flex-col gap-4">
								<p className="text-xs font-normal uppercase text-muted-foreground font-body">Average Quote Value</p>
								<div className="flex items-center justify-between">
									<h2 className="text-2xl font-bold font-body text-card-foreground">$2,850</h2>
									<span className="flex items-center text-xs font-normal text-rose-500 font-body">
										<TrendingDown className="w-4 h-4 mr-1" />
										2.1%
									</span>
								</div>
								<p className="text-xs font-normal uppercase text-muted-foreground font-body">vs last month</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card>
						<CardContent className="p-6">
							<div className="flex flex-col gap-4">
								<p className="text-xs font-normal uppercase text-muted-foreground font-body">Conversion Rate</p>
								<div className="flex items-center justify-between">
									<h2 className="text-2xl font-bold font-body text-card-foreground">72%</h2>
									<span className="flex items-center text-xs font-normal text-emerald-500 font-body">
										<TrendingUp className="w-4 h-4 mr-1" />
										8.4%
									</span>
								</div>
								<p className="text-xs font-normal uppercase text-muted-foreground font-body">vs last month</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>

			{/* Charts Section */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader className="flex items-center gap-2 py-5 space-y-0 border-b sm:flex-row">
						<div className="grid flex-1 gap-1 text-center sm:text-left">
							<CardTitle>Quotation Trends</CardTitle>
							<CardDescription>
								Showing quotation statistics for the selected period
							</CardDescription>
						</div>
						<Select defaultValue="7d">
							<SelectTrigger
								className="w-[160px] rounded-lg sm:ml-auto"
								aria-label="Select time range"
							>
								<SelectValue placeholder="Last 7 days" />
							</SelectTrigger>
							<SelectContent className="rounded-xl">
								<SelectItem value="90d" className="rounded-lg">
									Last 3 months
								</SelectItem>
								<SelectItem value="30d" className="rounded-lg">
									Last 30 days
								</SelectItem>
								<SelectItem value="7d" className="rounded-lg">
									Last 7 days
								</SelectItem>
							</SelectContent>
						</Select>
					</CardHeader>
					<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
						<ChartContainer
							config={quotationChartConfig}
							className="aspect-auto h-[250px] w-full"
						>
							<AreaChart data={quotationData}>
								<defs>
									<linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
										<stop
											offset="5%"
											stopColor="var(--color-total)"
											stopOpacity={0.8}
										/>
										<stop
											offset="95%"
											stopColor="var(--color-total)"
											stopOpacity={0.1}
										/>
									</linearGradient>
									<linearGradient id="fillAccepted" x1="0" y1="0" x2="0" y2="1">
										<stop
											offset="5%"
											stopColor="var(--color-accepted)"
											stopOpacity={0.8}
										/>
										<stop
											offset="95%"
											stopColor="var(--color-accepted)"
											stopOpacity={0.1}
										/>
									</linearGradient>
									<linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
										<stop
											offset="5%"
											stopColor="var(--color-pending)"
											stopOpacity={0.8}
										/>
										<stop
											offset="95%"
											stopColor="var(--color-pending)"
											stopOpacity={0.1}
										/>
									</linearGradient>
								</defs>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="date"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									minTickGap={32}
									tickFormatter={(value) => {
										const date = new Date(value)
										return date.toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
										})
									}}
								/>
								<ChartTooltip
									cursor={false}
									content={
										<ChartTooltipContent
											labelFormatter={(value) => {
												return new Date(value).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
												})
											}}
											indicator="dot"
										/>
									}
								/>
								<Area
									dataKey="pending"
									type="natural"
									fill="url(#fillPending)"
									stroke="var(--color-pending)"
									stackId="a"
								/>
								<Area
									dataKey="accepted"
									type="natural"
									fill="url(#fillAccepted)"
									stroke="var(--color-accepted)"
									stackId="a"
								/>
								<Area
									dataKey="total"
									type="natural"
									fill="url(#fillTotal)"
									stroke="var(--color-total)"
									stackId="a"
								/>
								<ChartLegend content={<ChartLegendContent />} />
							</AreaChart>
						</ChartContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium uppercase font-body text-card-foreground">Task Completion Trends</CardTitle>
						<CardDescription className="text-xs font-normal uppercase font-body text-muted-foreground">This Week</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer config={taskChartConfig}>
							<BarChart data={taskComparisonData} height={300}>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="month"
									tickLine={false}
									tickMargin={10}
									axisLine={false}
									tickFormatter={(value) => value.slice(0, 3)}
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent indicator="dashed" />}
								/>
								<Bar dataKey="completed" fill="var(--color-completed)" radius={5} />
								<Bar dataKey="pending" fill="var(--color-pending)" radius={5} />
							</BarChart>
						</ChartContainer>
					</CardContent>
				<CardFooter className="flex-col items-center justify-center gap-2 text-sm">
							<div className="flex gap-2 text-xs font-normal leading-none uppercase text-card-foreground font-body">
							Task completion up by 5.2% this month <TrendingUp className="w-4 h-4" />
						</div>
						<div className="flex gap-2 font-normal leading-none uppercase text-card-foreground font-body text-[10px]">
							Showing task completion trends for the last 6 months
						</div>
					</CardFooter>
				</Card>
			</div>

			{/* Bottom Section */}
			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium uppercase font-body text-card-foreground">Task Completion by Priority</CardTitle>
						<CardDescription className="text-xs font-normal uppercase font-body text-muted-foreground">This Week</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer config={taskPriorityConfig}>
							<BarChart data={taskPriorityData} height={300}>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="name"
									tickLine={false}
									tickMargin={10}
									axisLine={false}
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent indicator="dashed" />}
								/>
								<Bar dataKey="total" fill="var(--color-total)" radius={5} barSize={50} />
								<Bar dataKey="completed" fill="var(--color-completed)" radius={5} barSize={50} />
							</BarChart>
						</ChartContainer>
					</CardContent>
					<CardFooter className="flex-col items-center justify-center gap-2 text-sm">
						<div className="flex gap-2 text-xs font-normal leading-none uppercase text-card-foreground font-body">
							High priority completion rate increased by 8.4% <TrendingUp className="w-4 h-4" />
						</div>
						<div className="flex gap-2 font-normal leading-none uppercase text-card-foreground font-body text-[10px]">
							Showing task completion rates across different priority levels
						</div>
					</CardFooter>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium uppercase font-body text-card-foreground">Weekly Revenue</CardTitle>
						<CardDescription className="text-xs font-normal uppercase font-body text-muted-foreground">Last 4 Weeks</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer config={revenueConfig}>
							<BarChart data={revenueData} height={300}>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="name"
									tickLine={false}
									tickMargin={10}
									axisLine={false}
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent indicator="dashed" />}
								/>
								<Bar dataKey="value" fill="var(--color-value)" radius={5} barSize={50} />
							</BarChart>
						</ChartContainer>
					</CardContent>
						<CardFooter className="flex-col items-center justify-center gap-2 text-sm">
						<div className="flex gap-2 text-xs font-normal leading-none uppercase text-card-foreground font-body">
							Revenue up by 12.5% from last week <TrendingUp className="w-4 h-4" />
						</div>
						<div className="flex gap-2 font-normal leading-none uppercase text-card-foreground font-body text-[10px]">
							Showing weekly revenue trends for the past month
						</div>
					</CardFooter>
				</Card>
			</div>

			{/* Report Generator Section */}
			<motion.div variants={sectionVariants}>
				<Card className="transition-all duration-500 border shadow-sm cursor-pointer bg-card border-border/80 hover:border-primary/40">
					<CardHeader className="space-y-0">
						<CardTitle className="font-normal uppercase text-md font-body text-card-foreground">Generate Detailed Report</CardTitle>
						<p className="text-muted-foreground font-body uppercase font-normal text-[10px]">Select date range and report type to generate a comprehensive analysis</p>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-6 md:flex-row">
							<div className="flex-1">
								<label className="block mb-2 text-xs font-normal uppercase font-body">Date Range</label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
											<CalendarIcon className="w-4 h-4 mr-2" />
											{dateRange?.from ? (
												dateRange.to ? (
													<>
														{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
													</>
												) : (
													format(dateRange.from, "LLL dd, y")
												)
											) : (
												<span className="text-[10px] font-body uppercase font-normal">Pick a date range</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											initialFocus
											mode="range"
											defaultMonth={dateRange?.from}
											selected={dateRange}
											onSelect={setDateRange}
											numberOfMonths={2}
											className="border rounded-md"
										/>
									</PopoverContent>
								</Popover>
							</div>
							<div className="flex-1">
								<label className="block mb-2 text-xs font-normal uppercase font-body">Time Period</label>
								<Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select time period..." />
									</SelectTrigger>
									<SelectContent>
										{TIME_OPTIONS.map((option) => (
											<SelectItem key={option?.value} value={option?.value}>
												<div className="flex items-center gap-2">
													{option?.icon}
													<p className="text-[10px] font-body uppercase font-normal">{option?.label}</p>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex-1">
								<label className="block mb-2 text-xs font-normal uppercase font-body">Report Type</label>
								<Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
									<SelectTrigger>
										<SelectValue placeholder="Select report type..." />
									</SelectTrigger>
									<SelectContent>
										{Object.entries(REPORT_OPTIONS).map(([key, option]) => (
											<SelectItem key={key} value={key}>
												<div className="flex items-center gap-2">
													{option.icon}
													<p className="text-[10px] font-body uppercase font-normal">{option.label}</p>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="flex justify-center mt-6">
							<Button 
								onClick={handleGenerateReport}
								disabled={isGenerating || !dateRange?.from || !dateRange?.to}
								className="w-full max-w-md font-normal text-white uppercase bg-indigo-600 hover:bg-indigo-700 font-body">
								{isGenerating ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Generating Report...
									</>
								) : (
									'Generate Report'
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	)
}
