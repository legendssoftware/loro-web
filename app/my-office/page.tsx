'use client'

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ClaimsModule } from "@/modules/my-office/tabs/claims"
import { OrdersModule } from "@/modules/my-office/tabs/orders"
import { TasksModule } from "@/modules/my-office/tabs/tasks"
import { CheckSquare, HandCoins, ShoppingBag } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
                            value="claims">
                            <HandCoins size={16} strokeWidth={1.5} className="text-=card-foreground" />
                            <p className="text-xs font-normal font-body uppercase">Claims</p>
                        </TabsTrigger>
                        <TabsTrigger
                            className="data-[state=active]:bg-none data-[state=active]:shadow-none data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[150px]"
                            value="orders">
                            <ShoppingBag size={16} strokeWidth={1.5} className="text-=card-foreground" />
                            <p className="text-xs font-normal font-body uppercase">Orders</p>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="tasks" className="mt-4">
                        <Card className="flex flex-col gap-2 bg-card/20 border-0 shadow-none">
                            <TasksModule />
                        </Card>
                    </TabsContent>
                    <TabsContent value="claims" className="mt-4">
                        <Card className="p-6 flex flex-col gap-2">
                            <ClaimsModule />
                        </Card>
                    </TabsContent>
                    <TabsContent value="orders" className="mt-4">
                        <Card className="p-6 flex flex-col gap-2">
                            <OrdersModule />
                        </Card>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </motion.div>
    )
}
