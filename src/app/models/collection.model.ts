export interface Collection {
  id: number;
  name: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  order: number;
  is_active: boolean;
  khassidas?: Khassida[];
  khassidas_count?: number;
}

export interface Khassida {
  id: number;
  collection_id: number;
  title: string;
  filename: string;
  image_url: string;
  cloudinary_public_id?: string;
  width?: number;
  height?: number;
  order: number;
  is_active: boolean;
  collection?: Collection;
}
