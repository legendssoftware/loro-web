"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  CheckSquare,
  FileText,
  HandCoins,
  UserPlusIcon,
  Users,
  Package,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClaimsModule } from "@/modules/my-office/claims/claims";
import { QuotationsModule } from "@/modules/my-office/quotations/quotations";
import { TasksModule } from "@/modules/my-office/tasks/tasks";
import { StaffModule } from "@/modules/my-office/staff/staff";
import LeadsModule from "@/modules/my-office/leads/leads";
import { InventoryModule } from "@/modules/my-office/inventory/inventory";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

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
    },
  },
};

export default function MyOfficePage() {
  return (
    <motion.div
      className="flex flex-col gap-3 p-4"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="justify-start w-full h-12 bg-background">
            <TabsTrigger
              className="data-[state=active]:bg-none data-[state=active]:shadow-none ease-in-out duration-300 data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[170px]"
              value="tasks"
            >
              <CheckSquare
                size={16}
                strokeWidth={1.5}
                className="text-=card-foreground"
              />
              <p className="text-xs font-normal uppercase font-body">Tasks</p>
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-none data-[state=active]:shadow-none data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[170px]"
              value="staff"
            >
              <Users
                size={16}
                strokeWidth={1.5}
                className="text-=card-foreground"
              />
              <p className="text-xs font-normal uppercase font-body">Staff</p>
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-none data-[state=active]:shadow-none data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[170px]"
              value="quotations"
            >
              <FileText
                size={16}
                strokeWidth={1.5}
                className="text-=card-foreground"
              />
              <p className="text-xs font-normal uppercase font-body">
                Quotations
              </p>
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-none data-[state=active]:shadow-none data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[170px]"
              value="claims"
            >
              <HandCoins
                size={16}
                strokeWidth={1.5}
                className="text-=card-foreground"
              />
              <p className="text-xs font-normal uppercase font-body">Claims</p>
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-none data-[state=active]:shadow-none data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[170px]"
              value="leads"
            >
              <UserPlusIcon
                size={16}
                strokeWidth={1.5}
                className="text-=card-foreground"
              />
              <p className="text-xs font-normal uppercase font-body">Leads</p>
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-none data-[state=active]:shadow-none data-[state=active]:border-b pb-2 data-[state=active]:border-b-primary data-[state=active]:rounded-none gap-2 font-normal font-body uppercase w-[170px]"
              value="inventory"
            >
              <Package
                size={16}
                strokeWidth={1.5}
                className="text-=card-foreground"
              />
              <p className="text-xs font-normal uppercase font-body">Inventory</p>
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
          <TabsContent value="claims" className="mt-4">
            <Card className="flex flex-col gap-2 border-0 shadow-none bg-card/20">
              <ClaimsModule />
            </Card>
          </TabsContent>
          <TabsContent value="leads" className="mt-4">
            <Card className="flex flex-col gap-2 border-0 shadow-none bg-card/20">
              <LeadsModule />
            </Card>
          </TabsContent>
          <TabsContent value="inventory" className="mt-4">
            <Card className="flex flex-col gap-2 border-0 shadow-none bg-card/20">
              <InventoryModule />
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
