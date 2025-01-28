'use client'

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ClaimsModule } from "@/modules/my-office/tabs/claims"
import { OrdersModule } from "@/modules/my-office/tabs/orders"
import { TasksModule } from "@/modules/my-office/tabs/tasks"
import { CheckSquare, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StaffModule } from "@/modules/my-office/tabs/staff"
import { LeadsModule } from "@/modules/my-office/tabs/leads"
import { JournalsModule } from "@/modules/my-office/tabs/journals"

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
                    <TabsList className="w-full justify-start h-12 bg-background">
                        <TabsTrigger
                            className="data-[state=active]:bg-none data-[state=active]:shadow-none data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[150px]"
                            value="tasks">
                            <CheckSquare size={16} strokeWidth={1.5} className="text-=card-foreground" />
                            <p className="text-xs font-normal font-body uppercase">Tasks</p>
                        </TabsTrigger>
                        <TabsTrigger
                            className="data-[state=active]:bg-none data-[state=active]:shadow-none data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[150px]"
                            value="staff">
                            <Users size={16} strokeWidth={1.5} className="text-=card-foreground" />
                            <p className="text-xs font-normal font-body uppercase">Staff</p>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="tasks" className="mt-4">
                        <Card className="flex flex-col gap-2 bg-card/20 border-0 shadow-none">
                            <TasksModule />
                        </Card>
                    </TabsContent>
                    <TabsContent value="claims" className="mt-4">
                        <Card className="flex flex-col gap-2 bg-card/20 border-0 shadow-none">
                            <ClaimsModule />
                        </Card>
                    </TabsContent>
                    <TabsContent value="orders" className="mt-4">
                        <Card className="flex flex-col gap-2 bg-card/20 border-0 shadow-none">
                            <OrdersModule />
                        </Card>
                    </TabsContent>
                    <TabsContent value="staff" className="mt-4">
                        <Card className="flex flex-col gap-2 bg-card/20 border-0 shadow-none">
                            <StaffModule />
                        </Card>
                    </TabsContent>
                    <TabsContent value="leads" className="mt-4">
                        <Card className="flex flex-col gap-2 bg-card/20 border-0 shadow-none">
                            <LeadsModule />
                        </Card>
                    </TabsContent>
                    <TabsContent value="journals" className="mt-4">
                        <Card className="flex flex-col gap-2 bg-card/20 border-0 shadow-none">
                            <JournalsModule />
                        </Card>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </motion.div>
    )
}
