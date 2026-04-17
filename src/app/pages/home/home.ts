import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Collection, Khassida } from '../../models/collection.model';
import { ApiService } from '../../services/api';
import { SlideshowComponent } from '../../components/slideshow/slideshow';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SlideshowComponent, SidebarComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private api = inject(ApiService);

  collections = signal<Collection[]>([]);
  slides = signal<Khassida[]>([]);
  activeCollectionId = signal<number | null>(null);
  currentIndex = signal(0);
  loading = signal(true);
  newSlidesCount = signal(0);

  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private lastKnownCount = 0;
  private lastKnownId = 0;

  ngOnInit(): void {
    this.api.getCollections().subscribe(cols => this.collections.set(cols));
    this.loadSlideshow();
    this.startSync();
  }

  ngOnDestroy(): void {
    if (this.syncTimer) clearInterval(this.syncTimer);
  }

  private startSync(): void {
    this.syncTimer = setInterval(() => {
      const colId = this.activeCollectionId() ?? undefined;
      this.api.syncCheck(colId).subscribe(({ count, last_id }) => {
        if (this.lastKnownId > 0 && (count !== this.lastKnownCount || last_id !== this.lastKnownId)) {
          this.newSlidesCount.set(count - this.lastKnownCount);
          this.loadSlideshow(colId, false);
        }
        this.lastKnownCount = count;
        this.lastKnownId = last_id;
      });
    }, 30000);
  }

  loadSlideshow(collectionId?: number, showLoader = true): void {
    if (showLoader) this.loading.set(true);
    this.api.getSlideshow(collectionId).subscribe({
      next: slides => {
        this.slides.set(slides);
        if (showLoader) this.currentIndex.set(0);
        this.loading.set(false);
        this.lastKnownCount = slides.length;
        this.lastKnownId = slides[slides.length - 1]?.id ?? 0;
        setTimeout(() => this.newSlidesCount.set(0), 3000);
      },
      error: () => this.loading.set(false),
    });
  }

  onCollectionSelect(id: number | null): void {
    this.activeCollectionId.set(id);
    this.lastKnownId = 0;
    this.loadSlideshow(id ?? undefined);
  }

  onSlideSelect(index: number): void { this.currentIndex.set(index); }
  onIndexChange(index: number): void { this.currentIndex.set(index); }
}
