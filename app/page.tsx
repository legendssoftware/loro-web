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
import { CalendarClock, HandCoins, ShoppingBag, UserPlus, Zap, BookOpen, CheckSquare, Store } from "lucide-react"
import { Sparkline } from "@/components/ui/sparkline"

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
	claims: { label: 'Claims Report', icon: <HandCoins className="h-4 w-4" /> },
	orders: { label: 'Orders Report', icon: <ShoppingBag className="h-4 w-4" /> },
	leads: { label: 'Leads Report', icon: <UserPlus className="h-4 w-4" /> },
	journals: { label: 'Journals Report', icon: <BookOpen className="h-4 w-4" /> },
	tasks: { label: 'Tasks Report', icon: <CheckSquare className="h-4 w-4" /> }
} as const

const TIME_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Yearly'].map(label => ({
	value: label.toLowerCase(),
	label,
	icon: <CalendarClock className="h-4 w-4" />
}))

const STORE_OPTIONS = ['All Stores', 'Store 1', 'Store 2'].map(label => ({
	value: label.toLowerCase().replace(/\s+/g, ''),
	label,
	icon: <Store className="h-4 w-4" />
}))

const quickReports = [
	{
		title: "Monthly Claims Overview",
		icon: <Zap className="h-4 w-4" />,
		href: "/reports/monthly-claims"
	},
	{
		title: "Weekly Journal Summary",
		icon: <Zap className="h-4 w-4" />,
		href: "/reports/weekly-journals"
	},
	{
		title: "Daily Sales Report",
		icon: <Zap className="h-4 w-4" />,
		href: "/reports/daily-sales"
	},
	{
		title: "Employee Attendance Tracker",
		icon: <Zap className="h-4 w-4" />,
		href: "/reports/attendance"
	}
]

export default function Dashboard() {
	return (
		<div className="flex flex-col gap-3 sm:p-2 md:p-4 h-screen overflow-y-scroll">
			<div className="flex flex-wrap gap-2">
				{STATS_DATA.map((stat, index) => (
					<Card
						key={`${stat.title}-${index}`}
						className="flex-1 min-w-[240px] shadow-sm bg-card border border-border/80 hover:border-primary/40 transition-colors duration-500 cursor-pointer"
					>
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
				))}
			</div>
			<Card className="shadow-sm bg-card border border-border/80 hover:border-primary/40 ease-in-out duration-500 cursor-pointer">
				<CardHeader className="space-y-0">
					<CardTitle className="text-md font-normal font-body uppercase">Generate Custom Report</CardTitle>
					<p className="text-muted-foreground font-body uppercase font-normal text-[10px]">Select date range, report type, and store to generate a custom report</p>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-6">
						<div className="flex-1">
							<label className="text-xs mb-2 block font-body uppercase font-normal">Date Range</label>
							<Select>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select date range..." />
								</SelectTrigger>
								<SelectContent>
									{/* TODO: Add date range picker */}
								</SelectContent>
							</Select>
						</div>
						<div className="flex-1">
							<label className="text-xs mb-2 block font-body uppercase font-normal">Time Period</label>
							<Select>
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
						<div className="flex-1 space-x-0">
							<label className="text-xs mb-2 block font-body uppercase font-normal">Report Type</label>
							<Select>
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
						<div className="flex-1">
							<label className="text-xs mb-2 block font-body uppercase font-normal">Store</label>
							<Select>
								<SelectTrigger>
									<SelectValue placeholder="Select store..." />
								</SelectTrigger>
								<SelectContent>
									{STORE_OPTIONS.map((option) => (
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
					</div>
					<div className="flex justify-center mt-6">
						<Button className="w-full max-w-md bg-indigo-600 hover:bg-indigo-700 text-white font-body uppercase font-normal">
							Generate Report
						</Button>
					</div>
				</CardContent>
			</Card>
			<div className="flex flex-wrap gap-4">
				{quickReports.map((report, index) => (
					<Card
						key={index}
						className="flex-1 min-w-[240px] shadow-sm transition-colors cursor-pointer border border-border/80 hover:border-primary/40 ease-in-out duration-500">
						<CardContent className="p-6">
							<div className="flex items-center gap-3">
								<Zap size={23} strokeWidth={1.5} className="text-card-foreground" />
								<span className="text-[10px] font-body uppercase font-normal text-card-foreground">{report?.title}</span>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
