import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FolderOpen, List, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/helpers/users";
import { StaffCard } from "./staff-card";
import { roles, status } from "@/data/app-data";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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

interface StaffListProps {
  staffData: User[];
  onCreateClick: () => void;
  onUserAction: (user: User, action: "edit" | "deactivate") => void;
}

export const StaffList = ({
  staffData,
  onCreateClick,
  onUserAction,
}: StaffListProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const staffPerPage = 30;

  const filteredStaff = staffData?.filter((user: User) => {
    const matchesStatus =
      statusFilter.toLowerCase() === "all" ||
      user.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesRole =
      roleFilter.toLowerCase() === "all" ||
      user.accessLevel.toLowerCase() === roleFilter.toLowerCase();
    const searchTerms = searchQuery.toLowerCase().split(" ");
    const matchesSearch =
      searchQuery === "" ||
      searchTerms.every(
        (term) =>
          user.name.toLowerCase().includes(term) ||
          user.surname.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.username.toLowerCase().includes(term) ||
          user.phone.toLowerCase().includes(term)
      );
    return matchesStatus && matchesRole && matchesSearch;
  });

  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * staffPerPage;
    const endIndex = startIndex + staffPerPage;
    return filteredStaff.slice(startIndex, endIndex);
  }, [filteredStaff, currentPage]);

  const totalPages = Math.ceil(filteredStaff.length / staffPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const Header = () => {
    return (
      <div className="flex flex-row items-center justify-end gap-2">
        <div className="flex flex-row items-center justify-center gap-2">
          <Input
            placeholder="search..."
            className="w-[300px] shadow-none bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="font-body text-[10px] uppercase"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span>All Statuses</span>
                </div>
              </SelectItem>
              {status?.map((status) => (
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
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="font-body text-[10px] uppercase"
              >
                <div className="flex flex-row items-center gap-2">
                  <List size={17} strokeWidth={1.5} />
                  <span>All Roles</span>
                </div>
              </SelectItem>
              {roles?.map((role) => (
                <SelectItem
                  key={role?.value}
                  value={role?.value}
                  className="text-[10px] font-normal font-body uppercase"
                >
                  <div className="flex items-center gap-2">
                    {role?.icon && <role.icon size={17} strokeWidth={1.5} />}
                    <span>{role?.label?.replace("_", " ")}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="default" size="sm" onClick={onCreateClick}>
            <Plus size={16} strokeWidth={1.5} className="text-white" />
            <p className="text-[10px] font-normal text-white uppercase font-body">
              Add
            </p>
          </Button>
        </div>
      </div>
    );
  };

  if (!filteredStaff?.length) {
    return (
      <div className="space-y-4">
        <Header />
        <div className="flex flex-col items-center justify-center w-full gap-2 h-96">
          <FolderOpen
            className="w-8 h-8 text-muted-foreground"
            strokeWidth={1.5}
          />
          <p className="text-xs font-normal uppercase text-muted-foreground font-body">
            No staff found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <Header />
      <motion.div
        className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {paginatedStaff?.map((user: User) => (
          <motion.div key={user.uid} variants={itemVariants} layout>
            <StaffCard user={user} onAction={onUserAction} />
          </motion.div>
        ))}
      </motion.div>
      {filteredStaff.length > staffPerPage && (
        <div className="fixed flex items-center gap-2 px-4 py-2 transform -translate-x-1/2 border rounded-full shadow-lg bottom-4 left-1/2 bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevPage}
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
            onClick={handleNextPage}
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
