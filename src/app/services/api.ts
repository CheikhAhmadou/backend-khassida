import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Collection, Khassida } from '../models/collection.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.base}/collections`);
  }

  getCollection(id: number): Observable<Collection> {
    return this.http.get<Collection>(`${this.base}/collections/${id}`);
  }

  getSlideshow(collectionId?: number): Observable<Khassida[]> {
    const params = collectionId ? `?collection_id=${collectionId}` : '';
    return this.http.get<Khassida[]>(`${this.base}/slideshow${params}`);
  }

  // Admin
  createCollection(data: Partial<Collection>): Observable<Collection> {
    return this.http.post<Collection>(`${this.base}/admin/collections`, data);
  }

  uploadKhassida(formData: FormData): Observable<Khassida> {
    return this.http.post<Khassida>(`${this.base}/admin/khassidas`, formData);
  }

  deleteKhassida(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/khassidas/${id}`);
  }

  updateKhassida(id: number, data: Partial<Khassida>): Observable<Khassida> {
    return this.http.patch<Khassida>(`${this.base}/admin/khassidas/${id}`, data);
  }

  reorderKhassidas(order: number[]): Observable<void> {
    return this.http.post<void>(`${this.base}/admin/khassidas/reorder`, { order });
  }

  syncCheck(collectionId?: number): Observable<{ count: number; last_id: number }> {
    const params = collectionId ? `?collection_id=${collectionId}` : '';
    return this.http.get<{ count: number; last_id: number }>(`${this.base}/sync-check${params}`);
  }

  imageUrl(khassida: Khassida): string {
    if (khassida.image_url.startsWith('http')) return khassida.image_url;
    return `${environment.apiUrl.replace('/api', '')}${khassida.image_url}`;
  }
}
