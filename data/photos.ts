import generatedPhotos from "./photos.generated.json";

export type Photo = {
  id: string;
  src: string;
  fullSrc: string;
  alt: string;
  title: string;
  location: string;
  category: string;
  width: number;
  height: number;
  camera: string | null;
  lens: string | null;
  aperture: string | null;
  shutter: string | null;
  iso: number | null;
  focalLength: string | null;
  date: string | null;
};

export const photos: Photo[] = generatedPhotos.map((photo) => ({
  ...photo,
  alt: `${photo.title}${photo.location ? ` — ${photo.location}` : ""}`,
}));
