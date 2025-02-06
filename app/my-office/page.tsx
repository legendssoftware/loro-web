'use client'

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { TasksModule } from "@/modules/my-office/tabs/tasks"
import { CheckSquare, FileText, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StaffModule } from "@/modules/my-office/tabs/staff"
import { QuotationsModule } from "@/modules/my-office/tabs/quotations"

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

export default function MyOfficePage() {
    return (
        <motion.div
            className="flex flex-col gap-3 p-4"
            initial="hidden"
            animate="show"
            variants={containerVariants}>
            <motion.div variants={itemVariants}>
                <Tabs defaultValue="tasks" className="w-full">
                    <TabsList className="justify-start w-full h-12 bg-background">
                        <TabsTrigger
                            className="data-[state=active]:bg-none data-[state=active]:shadow-none ease-in-out duration-300 data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[150px]"
                            value="tasks">
                            <CheckSquare size={16} strokeWidth={1.5} className="text-=card-foreground" />
                            <p className="text-xs font-normal uppercase font-body">Tasks</p>
                        </TabsTrigger>
                        <TabsTrigger
                            className="data-[state=active]:bg-none data-[state=active]:shadow-none data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[150px]"
                            value="staff">
                            <Users size={16} strokeWidth={1.5} className="text-=card-foreground" />
                            <p className="text-xs font-normal uppercase font-body">Staff</p>
                        </TabsTrigger>
                        <TabsTrigger
                            className="data-[state=active]:bg-none data-[state=active]:shadow-none data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[150px]"
                            value="quotations">
                            <FileText size={16} strokeWidth={1.5} className="text-=card-foreground" />
                            <p className="text-xs font-normal uppercase font-body">Quotations</p>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="tasks" className="mt-4">
                        <Card className="flex flex-col gap-2 border-0 shadow-none bg-card/20">
                            <TasksModule />
                        </Card>
                    </TabsContent>
                    <TabsContent value="staff" className="mt-4">
                        <Card className="flex flex-col gap-2 border-0 shadow-none bg-card/20">
                            <StaffModule />
                        </Card>
                    </TabsContent>
                    <TabsContent value="quotations" className="mt-4">
                        <Card className="flex flex-col gap-2 border-0 shadow-none bg-card/20">
                            <QuotationsModule /> 
                        </Card>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </motion.div>
    )
}
