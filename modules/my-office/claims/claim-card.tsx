import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Claim } from '@/lib/types/claims';
import { cn } from '@/lib/utils';

interface ClaimCardProps {
    claim: Claim;
    onClick: (claim: Claim) => void;
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

const ClaimCardComponent = ({ claim, onClick }: ClaimCardProps) => {
    return (
        <motion.div variants={itemVariants}>
            <Card className='transition-shadow cursor-pointer hover:shadow-md' onClick={() => onClick(claim)}>
                <CardContent className='p-4'>
                    <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-between'>
                            <Badge variant='outline' className='text-[9px] font-normal uppercase font-body'>
                                {claim.status}
                            </Badge>
                            <Badge variant='secondary' className='text-[9px] font-normal uppercase font-body'>
                                {claim.category}
                            </Badge>
                        </div>
                        <div className='flex items-center justify-between'>
                            <span className='text-[10px] font-body text-muted-foreground uppercase'>
                                {format(new Date(claim.createdAt), 'MMM dd, yyyy')}
                            </span>
                            <span className={cn('text-xs font-body font-normal uppercase')}>{claim?.amount}</span>
                        </div>
                        <div className='text-[10px] truncate font-body text-muted-foreground uppercase font-normal'>
                            {claim.owner.name} {claim.owner.surname}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export const ClaimCard = memo(ClaimCardComponent);
