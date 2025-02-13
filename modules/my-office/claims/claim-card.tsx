import { memo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Claim } from '@/lib/types/claims'
import { cn } from '@/lib/utils'

interface ClaimCardProps {
    claim: Claim
    onClick: (claim: Claim) => void
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

const ClaimCardComponent = ({ claim, onClick }: ClaimCardProps) => {
    const amount = Number(claim?.amount)

    return (
        <motion.div variants={itemVariants}>
            <Card 
                className="transition-shadow cursor-pointer hover:shadow-md"
                onClick={() => onClick(claim)}>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs font-body">
                                {claim.status}
                            </Badge>
                            <Badge variant="secondary" className="text-xs font-body">
                                {claim.category}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-body text-muted-foreground">
                                {format(new Date(claim.createdAt), 'MMM dd, yyyy')}
                            </span>
                            <span className={cn(
                                "text-xs font-body",
                                amount > 0 ? "text-green-600" : "text-red-600"
                            )}>
                                R{amount.toFixed(2)}
                            </span>
                        </div>
                        <div className="text-xs truncate font-body text-muted-foreground">
                            {claim.owner.name} {claim.owner.surname}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export const ClaimCard = memo(ClaimCardComponent) 