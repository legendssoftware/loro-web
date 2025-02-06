'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { CalendarClock, HandCoins, ShoppingBag, UserPlus, Zap, CheckSquare } from "lucide-react"
import { Sparkline } from "@/components/ui/sparkline"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import React from "react"
import { useReports, ReportType, ReportPeriod } from "@/hooks/use-reports"
import { Loader2 } from "lucide-react"

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

// Move static data to constants
const STATS_DATA = [
	{
		title: "Claims Made",
		value: "R100,611",
		change: "-2%",
		trend: "down",
		sparkline: [89, 100, 85, 98, 92, 78, 89],
	},
	{
		title: "Orders Made",
		value: "R89,021",
		change: "-15%",
		trend: "down",
		sparkline: [92, 75, 85, 78, 82, 88, 80],
	},
	{
		title: "Total Leads",
		value: "18172",
		change: "-15%",
		trend: "down",
		sparkline: [78, 88, 92, 75, 85, 78, 82],
	},
	{
		title: "Journals Created",
		value: "70138",
		change: "+17%",
		trend: "up",
		sparkline: [85, 78, 82, 88, 92, 75, 85],
	},
	{
		title: "Tasks Completed",
		value: "32826",
		change: "-7%",
		trend: "down",
		sparkline: [82, 88, 80, 92, 75, 85, 78],
	}
] as const

const REPORT_OPTIONS = {
	[ReportType.CLAIM]: { label: 'Claims Report', icon: <HandCoins className="w-4 h-4" /> },
	[ReportType.QUOTATION]: { label: 'Quotations Report', icon: <ShoppingBag className="w-4 h-4" /> },
	[ReportType.LEAD]: { label: 'Leads Report', icon: <UserPlus className="w-4 h-4" /> },
	[ReportType.TASK]: { label: 'Tasks Report', icon: <CheckSquare className="w-4 h-4" /> }
} as const

const TIME_OPTIONS = [
	{ value: ReportPeriod.DAILY, label: 'Daily', icon: <CalendarClock className="w-4 h-4" /> },
	{ value: ReportPeriod.WEEKLY, label: 'Weekly', icon: <CalendarClock className="w-4 h-4" /> },
	{ value: ReportPeriod.MONTHLY, label: 'Monthly', icon: <CalendarClock className="w-4 h-4" /> }
];

const quickReports = [
	{
		title: "Monthly Claims Overview",
		icon: <Zap className="w-4 h-4" />,
		href: "/reports/monthly-claims"
	},
	{
		title: "Weekly Journal Summary",
		icon: <Zap className="w-4 h-4" />,
		href: "/reports/weekly-journals"
	},
	{
		title: "Daily Sales Report",
		icon: <Zap className="w-4 h-4" />,
		href: "/reports/daily-sales"
	},
	{
		title: "Employee Attendance Tracker",
		icon: <Zap className="w-4 h-4" />,
		href: "/reports/attendance"
	}
]

export default function Dashboard() {
	const {
		dateRange,
		setDateRange,
		period,
		setPeriod,
		reportType,
		setReportType,
		dailyReport,
		isGenerating,
		handleGenerateReport
	} = useReports();

	// Update STATS_DATA to use dailyReport data
	const statsData = React.useMemo(() => {
		if (!dailyReport) return STATS_DATA;

		return [
			{
				title: "Claims Made",
				value: dailyReport.claims?.totalValue || "R0",
				change: dailyReport.claims?.metrics?.valueGrowth || "0%",
				trend: dailyReport.claims?.metrics?.valueGrowth?.startsWith('+') ? "up" : "down",
				sparkline: [89, 100, 85, 98, 92, 78, 89], // TODO: Add real data
			},
			{
				title: "Orders Made",
				value: dailyReport.orders?.metrics?.grossQuotationValue || "R0",
				change: dailyReport.orders?.metrics?.quotationTrends?.growth || "0%",
				trend: dailyReport.orders?.metrics?.quotationTrends?.growth?.startsWith('+') ? "up" : "down",
				sparkline: [92, 75, 85, 78, 82, 88, 80],
			},
			{
				title: "Total Leads",
				value: dailyReport.leads?.total?.toString() || "0",
				change: dailyReport.leads?.metrics?.leadTrends?.growth || "0%",
				trend: dailyReport.leads?.metrics?.leadTrends?.growth?.startsWith('+') ? "up" : "down",
				sparkline: [78, 88, 92, 75, 85, 78, 82],
			},
			{
				title: "Tasks Completed",
				value: dailyReport.tasks?.completed?.toString() || "0",
				change: dailyReport.tasks?.metrics?.taskTrends?.growth || "0%",
				trend: dailyReport.tasks?.metrics?.taskTrends?.growth?.startsWith('+') ? "up" : "down",
				sparkline: [82, 88, 80, 92, 75, 85, 78],
			}
		];
	}, [dailyReport]);

	return (
		<motion.div
			initial="hidden"
			animate="show"
			variants={containerVariants}
			className="flex flex-col h-screen gap-3 overflow-y-scroll sm:p-2 md:p-4">
			<motion.div
				variants={containerVariants}
				className="flex flex-wrap gap-2">
				{statsData.map((stat, index) => (
					<motion.div
						key={`${stat.title}-${index}`}
						variants={itemVariants}
						className="flex-1 min-w-[240px]">
						<Card className="transition-all duration-500 border shadow-sm cursor-pointer bg-card border-border/80 :border-primary/40">
							<CardContent className="p-6">
								<div className="flex flex-col gap-4">
									<p className="text-[10px] font-body text-muted-foreground font-normal uppercase">
										{stat.title}
									</p>
									<div className="flex flex-col gap-2">
										<h2 className="text-2xl font-semibold font-body">
											{stat.value}
										</h2>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<span className={`text-xs font-body ${stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
													{stat.change}
												</span>
												<span className="text-[8px] font-body text-muted-foreground font-normal uppercase">
													vs previous month
												</span>
											</div>
											<Sparkline
												data={stat.sparkline}
												color={stat.trend === 'up' ? '#10b981' : '#f43f5e'}
											/>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</motion.div>
			<motion.div
				variants={sectionVariants}>
				<Card className="transition-all duration-500 border shadow-sm cursor-pointer bg-card border-border/80 hover:border-primary/40">
					<CardHeader className="space-y-0">
						<CardTitle className="font-normal uppercase text-md font-body">Generate Custom Report</CardTitle>
						<p className="text-muted-foreground font-body uppercase font-normal text-[10px]">Select date range, report type, and store to generate a custom report</p>
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
											<SelectItem key={key} value={key.toUpperCase() as ReportType}>
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
			<motion.div
				variants={containerVariants}
				className="flex flex-wrap gap-4">
				{quickReports.map((report, index) => (
					<motion.div
						key={index}
						variants={itemVariants}
						className="flex-1 min-w-[240px]">
						<Card className="transition-all duration-500 border shadow-sm cursor-pointer border-border/80 hover:border-primary/40">
							<CardContent className="p-6">
								<div className="flex items-center gap-3">
									<Zap size={23} strokeWidth={1.5} className="text-card-foreground" />
									<span className="text-[10px] font-body uppercase font-normal text-card-foreground">{report?.title}</span>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</motion.div>
		</motion.div>
	)
}
