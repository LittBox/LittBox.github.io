"use client";

import { useEffect, useState } from "react";

import { photos, type Photo } from "@/data/photos";

export default function Photography() {
  const categories = ["All", ...new Set(photos.map((photo) => photo.category))];
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<Photo | null>(null);

  const filtered =
    category === "All"
      ? photos
      : photos.filter((photo) => photo.category === category);

  useEffect(() => {
    if (!selected) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelected(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected]);

  return (
    <section
      id="photography"
      className="photography"
      aria-labelledby="photography-title"
    >
      <div className="photo-heading">
        <div>
          <p className="photo-eyebrow">PHOTOGRAPHY / VISUAL JOURNAL</p>
          <h2 id="photography-title">
            Through My Lens<span>.</span>
          </h2>
          <p className="photo-description">
            A collection of moments, places &amp; stories.
          </p>
        </div>

        <span className="photo-count">
          {String(photos.length).padStart(2, "0")} FRAMES
        </span>
      </div>

      <div className="photo-filters" aria-label="Photo categories">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? "photo-filter active" : "photo-filter"}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="photo-masonry">
        {filtered.map((photo) => (
          <button
            key={photo.id}
            className="photo-masonry-item"
            type="button"
            onClick={() => setSelected(photo)}
          >
            <div className="photo-masonry-image">
              <img
                src={photo.src}
                    alt={photo.alt}
                loading="lazy"
              />
            </div>

            <div className="photo-info">
              <div>
                <h3>{photo.title}</h3>
                <p>{photo.location}</p>
              </div>
              <span>{photo.date ?? ""}</span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="photo-empty">No photographs in this collection yet.</p>
      )}

      {selected && (
        <div
          className="photo-lightbox"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <div
            className="photo-lightbox-content"
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="photo-close"
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ×
            </button>

            <img src={selected.fullSrc} alt={selected.title} />

            <div className="photo-lightbox-caption">
              <strong>{selected.title}</strong>
              <span>{selected.location}</span>
              <div className="photo-exif">
                {selected.camera && <span>{selected.camera}</span>}
                {selected.lens && <span>{selected.lens}</span>}
                {selected.focalLength && <span>{selected.focalLength}</span>}
                {selected.aperture && <span>{selected.aperture}</span>}
                {selected.shutter && <span>{selected.shutter}</span>}
                {selected.iso != null && <span>ISO {selected.iso}</span>}
                {selected.date && <span>{selected.date}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
