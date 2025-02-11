import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Claim } from "@/lib/types/claims";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ClaimStatus } from "@/lib/enums/finance.enums";

interface ClaimCardProps {
    claim: Claim;
    onEdit?: (claim: Claim) => void;
    onDelete?: (claim: Claim) => void;
}

const getStatusColor = (status: ClaimStatus) => {
    switch (status) {
        case ClaimStatus.PENDING:
            return "bg-yellow-500";
        case ClaimStatus.APPROVED:
            return "bg-green-500";
        case ClaimStatus.DECLINED:
            return "bg-red-500";
        case ClaimStatus.PAID:
            return "bg-blue-500";
        default:
            return "bg-gray-500";
    }
};

export function ClaimCard({ claim, onEdit, onDelete }: ClaimCardProps) {
    return (
        <Card className="w-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-semibold">{claim.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                            {claim.category}
                        </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(claim.status)} text-white`}>
                        {claim.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <p className="text-sm text-gray-600 mb-2">{claim.description}</p>
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-primary">
                        {formatCurrency(claim.amount)}
                    </span>
                    <span className="text-sm text-gray-500">
                        {formatDate(claim.createdAt)}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => onEdit?.(claim)}
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onDelete?.(claim)}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </Button>
            </CardFooter>
        </Card>
    );
} 