"use client";

import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  maxRating?: number;
  allowHover?: boolean;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  maxRating = 5, 
  allowHover = true,
  readOnly = false,
  size = 'md'
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleStarHover = (event: React.MouseEvent<HTMLSpanElement>, hoveredRating: number) => {
    if (readOnly || !allowHover) return;
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - left;
    const isHalfStar = x < width / 2;
    setHoverRating(isHalfStar ? hoveredRating - 0.5 : hoveredRating);
  };

  const handleStarClick = (event: React.MouseEvent<HTMLSpanElement>, clickedRating: number) => {
    if (readOnly || !onRatingChange) return;
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - left;
    const isHalfStar = x < width / 2;
    onRatingChange(isHalfStar ? clickedRating - 0.5 : clickedRating);
  };

  const handleMouseLeave = () => {
    if (readOnly || !allowHover) return;
    setHoverRating(null);
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const sizeClasses = {
    sm: { fontSize: '1rem', width: '1rem', height: '1rem' },
    md: { fontSize: '1.5rem', width: '1.5rem', height: '1.5rem' },
    lg: { fontSize: '2rem', width: '2rem', height: '2rem' }
  };

  const stars = Array.from({ length: maxRating }, (_, index) => {
    const starValue = index + 1;
    const isFilled = starValue <= displayRating;
    const isHalfFilled = !isFilled && starValue - 0.5 === displayRating;

    return (
      <span
        key={index}
        className="star"
        tabIndex={0}
        onMouseMove={(e) => handleStarHover(e, starValue)}
        onClick={(e) => handleStarClick(e, starValue)}
        style={{ 
          cursor: (readOnly || !allowHover) ? 'default' : 'pointer', 
          position: 'relative', 
          display: 'inline-block',
          ...sizeClasses[size]
        }}
      >
        <span
          className="star-full"
          style={{ 
            color: isFilled ? '#ffd700' : '#ddd', 
            width: '100%', 
            display: 'inline-block',
            fontSize: 'inherit'
          }}
        >
          &#9733;
        </span>
        {isHalfFilled && (
          <span
            className="star-half"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              color: '#ffd700',
              overflow: 'hidden',
              fontSize: 'inherit'
            }}
          >
            &#9733;
          </span>
        )}
      </span>
    );
  });

  return (
    <div className="star-rating" onMouseLeave={handleMouseLeave}>
      {stars}

      <style>{`
        .star-rating {
          display: flex;
          align-items: center;
          user-select: none;
        }
        .star {
          position: relative;
          display: inline-block;
          margin-right: 0;
          line-height: 1;
          vertical-align: middle;
        }
        .star-full {
          display: inline-block;
          width: 100%;
          line-height: 1;
        }
      `}</style>
    </div>
  );
};

export default StarRating;