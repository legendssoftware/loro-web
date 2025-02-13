import { memo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Lead } from "@/lib/types/leads";
import { cn } from "@/lib/utils";

interface LeadCardProps {
    lead: Lead;
    onClick: (lead: Lead) => void;
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
};

const LeadCard = ({ lead, onClick }: LeadCardProps) => {
    return (
        <motion.div
            variants={itemVariants}
            layout
        >
            <Card
                className="transition-colors shadow-none cursor-pointer bg-card hover:border-primary/40 border-border"
                onClick={() => onClick(lead)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onClick(lead)}
                aria-label={`Lead: ${lead?.name}`}
            >
                <CardContent className="flex flex-col justify-between h-full gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <Badge
                            variant="outline"
                            className={cn(
                                "font-body text-[10px] uppercase",
                                lead?.status === "APPROVED" && "bg-green-100 text-green-600 border-green-200",
                                lead?.status === "REVIEW" && "bg-yellow-100 text-yellow-600 border-yellow-200",
                                lead?.status === "DECLINED" && "bg-red-100 text-red-600 border-red-200",
                                lead?.status === "PENDING" && "bg-blue-100 text-blue-600 border-blue-200"
                            )}
                        >
                            {lead?.status}
                        </Badge>
                        <span className="text-[10px] font-body text-muted-foreground uppercase">
                            {lead?.createdAt && format(new Date(lead.createdAt), "MMM dd, yyyy")}
                        </span>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-normal leading-tight uppercase font-body text-card-foreground">
                            {lead?.name?.length > 20 ? lead?.name?.slice(0, 20) + "..." : lead?.name}
                        </h3>
                        <div className="flex flex-col gap-1">
                            <p className="text-xs font-normal uppercase font-body text-muted-foreground">
                                {lead?.email}
                            </p>
                            <p className="text-xs font-normal uppercase font-body text-muted-foreground">
                                {lead?.phone}
                            </p>
                        </div>
                    </div>
                    {lead?.notes && (
                        <p className="text-xs font-normal uppercase font-body text-muted-foreground line-clamp-2">
                            {lead.notes}
                        </p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                            {lead?.owner?.photoURL ? (
                                <Avatar className="w-6 h-6 ring-2 ring-primary">
                                    <AvatarImage
                                        src={lead.owner.photoURL}
                                        alt={`${lead.owner.name}`}
                                    />
                                </Avatar>
                            ) : (
                                <span className="text-[10px] font-body text-muted-foreground uppercase">
                                    {lead?.owner?.name} {lead?.owner?.surname}
                                </span>
                            )}
                        </div>
                        {lead?.branch && (
                            <Badge variant="secondary" className="text-[10px] font-body uppercase">
                                {lead.branch.name}
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

LeadCard.displayName = 'LeadCard';

export default memo(LeadCard); 