import { memo, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { TaskCard } from "./task-card";
import { ExistingTask } from "@/lib/types/tasks";
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
import { List, LucideIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const { accessToken, profileData } = useSessionStore();
  const queryClient = useQueryClient();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleStatusChange = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  const handleClientChange = useCallback((client: string) => {
    setClientFilter(client);
  }, []);

  const handleAssigneeChange = useCallback((assignee: string) => {
    setAssigneeFilter(assignee);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const config: RequestConfig = {
    headers: {
      token: `${accessToken}`,
    },
  };

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskDTO) => createTask(data, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully", {
        style: {
          borderRadius: "5px",
          background: "#333",
          color: "#fff",
          fontFamily: "var(--font-unbounded)",
          fontSize: "12px",
          textTransform: "uppercase",
          fontWeight: "300",
          padding: "16px",
        },
        duration: 2000,
        position: "bottom-center",
        icon: "✅",
      });
      setIsNewTaskModalOpen(false);
    },
    onError: (error: Error) => {
      const errorMessage =
        error.message === "item(s) not found"
          ? "Unable to create task. Please try again."
          : `Failed to create task: ${error.message}`;

      toast.error(errorMessage, {
        style: {
          borderRadius: "5px",
          background: "#333",
          color: "#fff",
          fontFamily: "var(--font-unbounded)",
          fontSize: "12px",
          textTransform: "uppercase",
          fontWeight: "300",
          padding: "16px",
        },
        duration: 5000,
        position: "bottom-center",
        icon: "❌",
      });
    },
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;
      const matchesClient =
        clientFilter === "all" || task.client?.uid.toString() === clientFilter;
      const matchesAssignee =
        assigneeFilter === "all" ||
        task.assignees?.some((a) => a.uid.toString() === assigneeFilter);
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesStatus && matchesClient && matchesAssignee && matchesSearch;
    });
  }, [tasks, statusFilter, clientFilter, assigneeFilter, searchQuery]);

  const handleCreateTask = useCallback(
    async (data: CreateTaskDTO) => {
      try {
        const newTask = {
          ...data,
          owner: {
            uid: Number(profileData?.uid) || 0,
            username: profileData?.username || "",
            name: profileData?.name || "",
            surname: profileData?.surname || "",
            email: profileData?.email || "",
            phone: profileData?.phone || "",
            photoURL: profileData?.photoURL || "",
            accessLevel: profileData?.accessLevel || "",
            userref: profileData?.userref || "",
            organisationRef: Number(profileData?.organisationRef) || 0,
            status: "active",
          },
        };

        await createTaskMutation.mutateAsync(newTask);
      } catch (error) {
        console.error("Error creating task:", error);
      }
    },
    [createTaskMutation, profileData]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <div className="flex flex-row items-center justify-end gap-2">
        <div className="flex flex-row items-center justify-center gap-2">
          <Input
            placeholder="search..."
            className="w-[300px] shadow-none bg-card"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Select value={clientFilter} onValueChange={handleClientChange}>
            <SelectTrigger className="w-[200px] shadow-none bg-card outline-none">
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
                .filter((task) => task.client)
                .filter(
                  (task, index, self) =>
                    index ===
                    self.findIndex((t) => t.client?.uid === task.client?.uid)
                )
                .map((task) => (
                  <SelectItem
                    key={task.client?.uid}
                    value={task.client?.uid.toString() || ""}
                    className="text-[10px] font-normal uppercase font-body"
                  >
                    {task.client?.name || "Unknown"}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={handleAssigneeChange}>
            <SelectTrigger className="w-[200px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span>All Sales Agents</span>
                </div>
              </SelectItem>
              {tasks
                .flatMap((task) => task.assignees || [])
                .filter(
                  (assignee, index, self) =>
                    index === self.findIndex((a) => a.uid === assignee.uid)
                )
                .map((assignee) => (
                  <SelectItem
                    key={assignee.uid}
                    value={assignee.uid.toString()}
                    className="text-[10px] font-normal uppercase font-body"
                  >
                    <div className="flex flex-row items-center gap-2">
                      <Avatar
                        className={`${
                          assignee.uid === Number(assigneeFilter)
                            ? "h-5 w-5"
                            : "h-8 w-8"
                        }`}
                      >
                        <AvatarImage src={assignee?.photoURL} />
                        <AvatarFallback>
                          {assignee?.name?.charAt(0)}
                          {assignee?.surname?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {`${assignee.name} ${assignee.surname}`}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[200px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-normal uppercase font-body flex items-center gap-2 flex-row"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span>All Statuses</span>
                </div>
              </SelectItem>
              {taskStatuses?.map(
                (status: {
                  value: string;
                  label: string;
                  icon: LucideIcon;
                }) => (
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
                )
              )}
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
