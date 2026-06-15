import React, { useState, useEffect, useRef } from 'react';
import { getImageUrl } from '../services/api';
import './ProductImageGallery.css';

function ProductImageGallery({ images = [], productName = 'Product', discount }) {
  const sortedImages = [...images].sort((a, b) => {
    if (a.productImage_IsMain && !b.productImage_IsMain) return -1;
    if (!a.productImage_IsMain && b.productImage_IsMain) return 1;
    return (a.productImage_DisplayOrder || 0) - (b.productImage_DisplayOrder || 0);
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const thumbListRef = useRef(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  if (!sortedImages.length) {
    return (
      <div className="gallery">
        <div className="gallery-main gallery-main--empty">
          <span>No Image Available</span>
        </div>
      </div>
    );
  }

  const activeImage = sortedImages[activeIndex];
  const hasMultiple = sortedImages.length > 1;

  const goTo = (index) => {
    if (index < 0 || index >= sortedImages.length) return;
    setActiveIndex(index);
    scrollThumbIntoView(index);
  };

  const scrollThumbIntoView = (index) => {
    const list = thumbListRef.current;
    if (!list) return;
    const thumb = list.children[index];
    if (thumb) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const scrollThumbs = (direction) => {
    const list = thumbListRef.current;
    if (!list) return;
    list.scrollBy({ left: direction * 120, behavior: 'smooth' });
  };

  return (
    <div className="gallery">
      <div className="gallery-main">
        <img
          src={getImageUrl(activeImage.productImage_ImageUrl)}
          alt={`${productName} ${activeIndex + 1}`}
          className="gallery-main-img"
        />

        {discount > 0 && <div className="gallery-discount">-{discount}%</div>}

        {hasMultiple && (
          <>
            <span className="gallery-counter">
              {activeIndex + 1} / {sortedImages.length}
            </span>
            <button
              type="button"
              className="gallery-nav gallery-nav--prev"
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className="gallery-nav gallery-nav--next"
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === sortedImages.length - 1}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="gallery-thumbs-wrap">
          <button
            type="button"
            className="gallery-thumbs-scroll gallery-thumbs-scroll--left"
            onClick={() => scrollThumbs(-1)}
            aria-label="Scroll thumbnails left"
          >
            ‹
          </button>

          <div className="gallery-thumbs" ref={thumbListRef}>
            {sortedImages.map((img, index) => (
              <button
                key={img.productImage_Id}
                type="button"
                className={`gallery-thumb ${index === activeIndex ? 'active' : ''}`}
                onClick={() => goTo(index)}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={getImageUrl(img.productImage_ImageUrl)}
                  alt={`${productName} thumbnail ${index + 1}`}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="gallery-thumbs-scroll gallery-thumbs-scroll--right"
            onClick={() => scrollThumbs(1)}
            aria-label="Scroll thumbnails right"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductImageGallery;
