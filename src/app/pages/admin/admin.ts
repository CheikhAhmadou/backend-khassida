import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { Collection, Khassida } from '../../models/collection.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  private api = inject(ApiService);

  collections = signal<Collection[]>([]);
  slides = signal<Khassida[]>([]);
  selectedCollectionId = signal<number | null>(null);
  uploading = signal(false);
  uploadProgress = signal('');
  uploadDone = signal(0);
  uploadTotal = signal(0);
  dragOver = signal(false);
  newCollectionName = signal('');
  showNewCollection = signal(false);

  ngOnInit(): void {
    this.loadCollections();
    this.loadAllSlides();
  }

  loadCollections(): void {
    this.api.getCollections().subscribe(cols => this.collections.set(cols));
  }

  loadAllSlides(): void {
    this.api.getSlideshow().subscribe(slides => this.slides.set(slides));
  }

  loadSlides(collectionId?: number): void {
    this.api.getSlideshow(collectionId).subscribe(slides => this.slides.set(slides));
  }

  selectCollection(id: number | null): void {
    this.selectedCollectionId.set(id);
    this.loadSlides(id ?? undefined);
  }

  uploadFiles(files: File[]): void {
    if (!files.length || !this.selectedCollectionId()) return;

    this.uploading.set(true);
    this.uploadProgress.set(`0 / ${files.length}`);
    this.uploadTotal.set(files.length);
    this.uploadDone.set(0);

    let done = 0;
    files.forEach(file => {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('collection_id', String(this.selectedCollectionId()));
      fd.append('title', file.name.replace(/\.[^.]+$/, ''));

      this.api.uploadKhassida(fd).subscribe({
        next: khassida => {
          done++;
          this.uploadDone.set(done);
          this.uploadProgress.set(`${done} / ${files.length}`);
          this.slides.update(s => [...s, khassida]);
          if (done === files.length) {
            this.uploading.set(false);
            this.loadCollections();
          }
        },
        error: () => {
          done++;
          this.uploadDone.set(done);
          if (done === files.length) {
            this.uploading.set(false);
          }
        },
      });
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploadFiles(Array.from(input.files));
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const files = Array.from(event.dataTransfer?.files ?? [])
      .filter(f => f.type.startsWith('image/'));
    this.uploadFiles(files);
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); this.dragOver.set(true); }
  onDragLeave(): void { this.dragOver.set(false); }

  deleteSlide(id: number): void {
    if (!confirm('Supprimer cette image ?')) return;
    this.api.deleteKhassida(id).subscribe(() => {
      this.slides.update(s => s.filter(x => x.id !== id));
    });
  }

  createCollection(): void {
    const name = this.newCollectionName().trim();
    if (!name) return;
    this.api.createCollection({ name }).subscribe(col => {
      this.collections.update(c => [...c, col]);
      this.newCollectionName.set('');
      this.showNewCollection.set(false);
    });
  }

  imageUrl(slide: Khassida): string {
    return this.api.imageUrl(slide);
  }
}
