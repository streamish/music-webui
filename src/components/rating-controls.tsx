import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import api from '@/lib/api';

type Track = {
  id: number;
  rating: number;
};

type Album = {
  id: number;
  rating: number;
};

export function RatingControls({ track, album }: { track: Track; album?: Album }) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (rating: number) => {
    if (album) {
      const newValue = album.rating === rating ? 0 : rating;
      const a = album;
      a.rating = newValue;
      try {
        const result = await api.put('/api/user/set-album-rating', {
          params: {
            query: {
              id: album.id,
            },
          },
          body: {
            rating,
          },
        });
        if (result.data?.success) {
          return;
        }
        if (result.error) {
          throw new Error(result.error.error, {
            cause: result.error.message,
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Unexpected error occurred while updating roles:', error);
        toast.error('An internal server error occurred. Please try again later.');
      }
    } else {
      const newValue = track.rating === rating ? 0 : rating;
      const t = track;
      t.rating = newValue;
      try {
        const result = await api.put('/api/user/set-track-rating', {
          params: {
            query: {
              id: track.id,
            },
          },
          body: {
            rating,
          },
        });
        if (result.data?.success) {
          return;
        }
        if (result.error) {
          throw new Error(result.error.error, {
            cause: result.error.message,
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Unexpected error occurred while updating roles:', error);
        toast.error('An internal server error occurred. Please try again later.');
      }
    }
  };

  return (
    <ul className={`flex ml-4 lg:ml-0 ${album ? 'mt-1 pl-4' : ''}`}>
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        const isFilled = (album?.rating ?? track.rating) >= rating;
        const isHovered = rating <= hoveredRating;
        return (
          <li key={rating} className="p-1 lg:p-0">
            <button
              aria-label={`Rate this ${album ? 'album' : 'track'} with ${rating} star${rating > 1 ? 's' : ''}`}
              className="p-1 m-0"
              onClick={() => handleSubmit(rating)}
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              <Star
                className={[
                  'h-6 w-6 lg:h-5 lg:w-5 cursor-pointer stroke-none',
                  'fill-background/25 dark:fill-foreground/25',
                  isFilled && !isHovered ? 'fill-background/50! dark:fill-foreground/50!' : '',
                  isHovered ? 'fill-background! dark:fill-foreground!' : '',
                ].join(' ')}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
