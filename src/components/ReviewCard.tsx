import { Star, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Review } from '@/lib/reviews';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ReviewCardProps {
  review: Review;
  compact?: boolean;
}

const ReviewCard = ({ review, compact = false }: ReviewCardProps) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-primary text-primary'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Card className="p-4 sm:p-6 hover:shadow-medium transition-smooth">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {renderStars(review.rating)}
            <h3 className="font-semibold text-base sm:text-lg mt-2 line-clamp-1">
              {review.title}
            </h3>
          </div>
          <Badge variant="secondary" className="text-xs whitespace-nowrap">
            {review.platform}
          </Badge>
        </div>

        <p className={`text-sm text-muted-foreground leading-relaxed ${compact ? 'line-clamp-2' : ''}`}>
          {review.text}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border">
          <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
            <div className="font-medium">{review.author}</div>
            <div>{formatDate(review.date)}</div>
          </div>

          {review.screenshotUrl && !compact && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs transition-smooth w-full sm:w-auto">
                  <ExternalLink className="mr-2 h-3 w-3" />
                  Vedi originale (screenshot)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <img
                  src={review.screenshotUrl}
                  alt={`Screenshot recensione di ${review.author}`}
                  className="w-full h-auto rounded-lg"
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ReviewCard;
