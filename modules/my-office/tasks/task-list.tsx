import { memo, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { TaskCard } from "./task-card";
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
import toast from "react-hot-toast";
import { taskStatuses } from "@/data/app-data";
import { FolderOpen, List, Building2 } from "lucide-react";
import { PeriodFilter, PeriodFilterValue, getDateRangeFromPeriod } from "@/modules/common/period-filter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

interface TaskListProps {
  tasks: ExistingTask[];
  onTaskClick: (task: ExistingTask) => void;
  isLoading: boolean;
}

const TaskListComponent = ({
  tasks,
  onTaskClick,
  isLoading,
}: TaskListProps) => {
  const { accessToken } = useSessionStore();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();

  const config: RequestConfig = {
    headers: {
      token: `${accessToken}`,
    },
  };

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskDTO) => createTask(data, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
      setIsNewTaskModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });

  const handleCreateTask = useCallback(
    async (data: CreateTaskDTO) => {
      try {
        await createTaskMutation.mutateAsync(data);
      } catch (error) {
        console.error("Failed to create task:", error);
      }
    },
    [createTaskMutation]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;
      const matchesClient =
        clientFilter === "all" || task.client?.uid.toString() === clientFilter;
      const matchesAssignee =
        assigneeFilter === "all" || task.assignees?.some(assignee => assignee.uid.toString() === assigneeFilter);
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPeriod = (() => {
        if (periodFilter === "all") return true;
        const { from, to } = getDateRangeFromPeriod(periodFilter);
        const taskDate = new Date(task.createdAt);
        return taskDate >= from && taskDate <= to;
      })();

      return matchesStatus && matchesClient && matchesAssignee && matchesSearch && matchesPeriod;
    });
  }, [tasks, statusFilter, clientFilter, assigneeFilter, searchQuery, periodFilter]);

  const Header = () => {
    const uniqueAssignees = useMemo(() => {
      const assigneesSet = new Set<number>();
      const assigneesList: User[] = [];
      
      tasks.forEach(task => {
        task.assignees?.forEach(assignee => {
          if (!assigneesSet.has(assignee.uid)) {
            assigneesSet.add(assignee.uid);
            assigneesList.push(assignee);
          }
        });
      });
      
      return assigneesList;
    }, [tasks]);

    return (
      <div className="flex items-center justify-end gap-2">
        <Input
          placeholder="search..."
          className="w-[300px] bg-card"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <PeriodFilter 
            value={periodFilter}
            onValueChange={setPeriodFilter}
          />
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
              {tasks
                .filter(
                  (task, index, self) =>
                    task.client && index === self.findIndex((t) => t.client?.uid === task.client?.uid)
                )
                .map((task) => task.client && (
                  <SelectItem
                    key={task.client.uid}
                    value={task.client.uid.toString()}
                    className="text-[10px] font-normal uppercase font-body"
                  >
                    <div className="flex flex-row items-center gap-2">
                      <Building2 size={17} strokeWidth={1.5} />
                      {task.client.name}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <PageLoader />
      </div>
    );
  }

  if (!filteredTasks?.length) {
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
        {filteredTasks?.map((task: ExistingTask) => (
          <TaskCard
            key={task?.uid}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export const TaskList = memo(TaskListComponent);
