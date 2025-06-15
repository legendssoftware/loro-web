import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    onChange: (rating: number) => void;
    size?: number;
}

export const StarRating: React.FunctionComponent<StarRatingProps> = ({
    rating,
    onChange,
    size = 20
}) => {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className="focus:outline-none"
                >
                    <Star
                        size={size}
                        className={`${
                            star <= rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                        } transition-colors cursor-pointer`}
                        strokeWidth={1.5}
                    />
                </button>
            ))}
        </div>
    );
};
