import { memo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Quotation } from '@/lib/types/quotations'
import { cn } from '@/lib/utils'

interface QuotationCardProps {
    quotation: Quotation
    onClick: (quotation: Quotation) => void
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

const QuotationCardComponent = ({ quotation, onClick }: QuotationCardProps) => {
    const amount = Number(quotation?.totalAmount || 0)
    const quotationDate = quotation?.quotationDate ? new Date(quotation.quotationDate) : new Date()

    return (
        <motion.div variants={itemVariants}>
            <Card 
                className="transition-shadow cursor-pointer hover:shadow-md"
                onClick={() => onClick(quotation)}>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs font-body">
                                {quotation?.status || 'N/A'}
                            </Badge>
                            <span className="text-xs font-body">
                                #{quotation?.quotationNumber || 'N/A'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-body text-muted-foreground">
                                {format(quotationDate, 'MMM dd, yyyy')}
                            </span>
                            <span className={cn(
                                "text-xs font-body",
                                amount > 0 ? "text-green-600" : "text-red-600"
                            )}>
                                R{amount.toFixed(2)}
                            </span>
                        </div>
                        <div className="text-xs truncate font-body text-muted-foreground">
                            {quotation?.client?.name || 'Unknown Client'}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export const QuotationCard = memo(QuotationCardComponent) 