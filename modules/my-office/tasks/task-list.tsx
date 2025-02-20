import { memo, useState, useCallback, useMemo } from "react";
import { ExistingTask, User } from "@/lib/types/tasks";
import { PageLoader } from "@/components/page-loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewTaskModal } from "./new-task-modal";
import { CreateTaskDTO } from "@/helpers/tasks";
import { useSessionStore } from "@/store/use-session-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/helpers/tasks";
import { RequestConfig } from "@/lib/types/tasks";
import { showToast } from "@/lib/utils/toast";
import { taskStatuses } from "@/data/app-data";
import {
  FolderOpen,
  List,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  PeriodFilter,
  PeriodFilterValue,
} from "@/modules/common/period-filter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TaskCard } from "./task-card";

interface TaskListProps {
  tasks: ExistingTask[];
  onTaskClick: (task: ExistingTask) => void;
  onCreateClick?: () => void;
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const TaskListComponent = ({
  tasks,
  isLoading = false,  
  onTaskClick,
  currentPage,
  totalPages,
  onPageChange,
}: TaskListProps) => {
  const { accessToken } = useSessionStore();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterValue>("all");

  const queryClient = useQueryClient();

  const config: RequestConfig = {
    headers: {
      token: accessToken || "",
    },
  };

  const uniqueAssignees = useMemo(() => {
    const assigneesSet = new Set<number>();
    const assigneesList: User[] = [];

    tasks.forEach((task) => {
      task.assignees?.forEach((assignee) => {
        if (
          !assigneesSet.has(assignee.uid) &&
          "username" in assignee &&
          "name" in assignee &&
          "surname" in assignee &&
          "email" in assignee
        ) {
          assigneesSet.add(assignee?.uid);
          assigneesList.push(assignee as User);
        }
      });
    });

    return assigneesList;
  }, [tasks]);

  const uniqueClients = useMemo(() => {
    const clientsSet = new Set<number>();
    const clientsList: { uid: number; name: string }[] = [];

    tasks.forEach((task) => {
      task.clients?.forEach((client) => {
        if (!clientsSet.has(client?.uid)) {
          clientsSet.add(client?.uid);
          clientsList.push({
            uid: client?.uid,
            name: client?.name || "Unknown Client",
          });
        }
      });
    });

    return clientsList.sort((a, b) => a?.name.localeCompare(b?.name));
  }, [tasks]);

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskDTO) => createTask(data, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showToast.success("Task created successfully", {
        duration: 4000,
        position: "bottom-center",
      });
      setIsNewTaskModalOpen(false);
    },
    onError: (error) => {
      showToast.error("Failed to create task", error, {
        duration: 4000,
        position: "bottom-center",
      });
    },
  });

  const handleCreateTask = useCallback(
    async (data: CreateTaskDTO) => {
      try {
        await createTaskMutation.mutateAsync(data);
      } catch (error) {
        showToast.error("Failed to create task", error as Error, {
          duration: 4000,
          position: "bottom-center",
        });
      }
    },
    [createTaskMutation]
  );

  // Filter tasks based on all criteria
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }

      // Client filter
      if (clientFilter !== "all") {
        const hasClient = task.clients?.some(
          (client) => client.uid.toString() === clientFilter
        );
        if (!hasClient) return false;
      }

      // Assignee filter
      if (assigneeFilter !== "all") {
        const hasAssignee = task.assignees?.some(
          (assignee) => assignee.uid.toString() === assigneeFilter
        );
        if (!hasAssignee) return false;
      }

      // Period filter
      if (periodFilter !== "all") {
        const taskDate = new Date(task.createdAt);
        const now = new Date();
        const daysDiff = Math.floor(
          (now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (periodFilter) {
          case "today":
            if (daysDiff > 0) return false;
            break;
          case "yesterday":
            if (daysDiff !== 1) return false;
            break;
          case "last_week":
            if (daysDiff > 7 || daysDiff <= 0) return false;
            break;
          case "last_month":
            if (daysDiff > 30 || daysDiff <= 0) return false;
            break;
        }
      }

      return true;
    });
  }, [tasks, statusFilter, clientFilter, assigneeFilter, periodFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <PageLoader />
      </div>
    );
  }

  const Header = () => {
    return (
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-2">
          <PeriodFilter value={periodFilter} onValueChange={setPeriodFilter} />
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span>All Clients</span>
                </div>
              </SelectItem>
              {uniqueClients.map((client) => (
                <SelectItem
                  key={client.uid}
                  value={client.uid.toString()}
                  className="text-[10px] font-normal uppercase font-body"
                >
                  <div className="flex flex-row items-center gap-2">
                    <Building2 size={17} strokeWidth={1.5} />
                    <span>{client.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span>All Assignees</span>
                </div>
              </SelectItem>
              {uniqueAssignees.map((assignee) => (
                <SelectItem
                  key={assignee.uid}
                  value={assignee.uid.toString()}
                  className="text-[10px] font-normal uppercase font-body"
                >
                  <div className="flex flex-row items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={assignee.photoURL} />
                      <AvatarFallback>
                        {assignee.name?.charAt(0)}
                        {assignee.surname?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {`${assignee.name} ${assignee.surname}`}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span>All Statuses</span>
                </div>
              </SelectItem>
              {taskStatuses?.map((status) => (
                <SelectItem
                  key={status?.value}
                  value={status?.value}
                  className="text-[10px] font-normal font-body uppercase"
                >
                  <div className="flex items-center gap-2">
                    {status?.icon && (
                      <status.icon size={17} strokeWidth={1.5} />
                    )}
                    <span>{status?.label?.replace("_", " ")}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <NewTaskModal
          isOpen={isNewTaskModalOpen}
          onOpenChange={setIsNewTaskModalOpen}
          onSubmit={handleCreateTask}
          isSubmitting={createTaskMutation.isPending}
        />
      </div>
    );
  };

  if (!filteredTasks.length) {
    return (
      <div className="space-y-4">
        <Header />
        <div className="flex flex-col items-center justify-center w-full gap-2 h-96">
          <FolderOpen
            className="w-8 h-8 text-muted-foreground"
            strokeWidth={1.5}
          />
          <p className="text-xs font-normal uppercase text-muted-foreground font-body">
            No tasks found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <Header />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4"
      >
        {filteredTasks.map((task) => (
          <motion.div key={task?.uid} variants={itemVariants} layout>
            <TaskCard
              task={task as ExistingTask}
              onClick={() => onTaskClick(task as ExistingTask)}
            />
          </motion.div>
        ))}
      </motion.div>
      {totalPages > 1 && (
        <div className="fixed flex items-center gap-2 px-4 py-2 transform -translate-x-1/2 border rounded-full shadow-lg bottom-4 left-1/2 bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-normal font-body">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export const TaskList = memo(TaskListComponent);
