import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Claim } from '@/lib/types/claims';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ClaimCardProps {
    claim: Claim;
    onClick: () => void;
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

const ClaimCardComponent = ({ claim, onClick }: ClaimCardProps) => {
    return (
        <motion.div variants={itemVariants}>
            <Card
                className='overflow-hidden transition-all duration-200 cursor-pointer hover:border-[#8B5CF6] hover:shadow-md'
                onClick={onClick}
            >
                <CardHeader className='flex flex-row items-center justify-between p-4 space-y-0 border-b'>
                    <div className='flex items-center justify-between w-full gap-2'>
                        <div className='flex flex-row gap-2'>
                            <Badge
                                variant={
                                    claim.status === 'APPROVED'
                                        ? 'success'
                                        : claim.status === 'REJECTED'
                                        ? 'destructive'
                                        : claim.status === 'IN_REVIEW'
                                        ? 'warning'
                                        : claim.status === 'VERIFIED'
                                        ? 'success'
                                        : 'outline'
                                }
                                className='text-[10px] font-normal uppercase font-body'
                            >
                                {claim.status}
                            </Badge>
                            <Badge variant='outline' className='text-[10px] font-normal uppercase font-body'>
                                {claim.category}
                            </Badge>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <p className='font-medium text-md font-heading'>{claim.amount}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className='p-4'>
                    <div className='flex flex-row justify-between gap-4'>
                        <div className='flex flex-row items-center gap-2'>
                            <Avatar className='w-6 h-6 ring-2 ring-primary'>
                                {claim.owner.photoURL ? (
                                    <AvatarImage src={claim.owner.photoURL} alt={`${claim.owner.name}`} />
                                ) : (
                                    <AvatarFallback className='text-[10px] font-body uppercase'>
                                        {claim.owner.name.charAt(0)}
                                        {claim.owner.surname.charAt(0)}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className='flex flex-col'>
                                <p className='text-[10px] font-normal uppercase font-body'>
                                    {claim.owner.name} {claim.owner.surname}
                                </p>
                                <p className='text-[9px] font-normal text-muted-foreground font-body'>
                                    {claim.comments}
                                </p>
                            </div>
                        </div>
                        <div className='flex flex-col items-end gap-1'>
                            <h4 className='text-[10px] font-normal uppercase text-muted-foreground font-body'>
                                Created
                            </h4>
                            <p className='text-xs font-normal uppercase font-body'>
                                {format(new Date(claim.createdAt), 'MMM dd, yyyy')}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export const ClaimCard = memo(ClaimCardComponent);
