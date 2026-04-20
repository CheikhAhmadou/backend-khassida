import { Component, OnInit, OnDestroy, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Collection, Khassida } from '../../models/collection.model';
import { ApiService } from '../../services/api';
import { SlideshowComponent } from '../../components/slideshow/slideshow';
import { SidebarComponent } from '../../components/sidebar/sidebar';

export interface KourelPdf { filename: string; label: string; path: string; }
export interface KourelCollection { name: string; pdfs: KourelPdf[]; }

const KOUREL_DATA: KourelCollection[] = [
  {
    name: 'Kourel 4 Diawartoulah Paris',
    pdfs: [
      { filename: '_Bismillahi lezi.pdf',       label: 'Bismillahi Lezi',       path: 'kourel4/_Bismillahi lezi.pdf' },
      { filename: '_Lam-yabdou-ar.pdf',         label: 'Lam Yabdou',            path: 'kourel4/_Lam-yabdou-ar.pdf' },
      { filename: '_Madahtu-nabiyal.pdf',       label: 'Madahtu Nabiyal',       path: 'kourel4/_Madahtu-nabiyal.pdf' },
      { filename: '_Madhu Nabiyil Muntaqa.pdf', label: 'Madhu Nabiyil Muntaqa', path: 'kourel4/_Madhu Nabiyil Muntaqa.pdf' },
      { filename: '_Rafahnaa-ar.pdf',           label: 'Rafahnaa',              path: 'kourel4/_Rafahnaa-ar.pdf' },
      { filename: '_Salaatu-Rahiimin-ar.pdf',   label: 'Salaatu Rahiimin',      path: 'kourel4/_Salaatu-Rahiimin-ar.pdf' },
      { filename: '_Yaqiini.pdf',               label: 'Yaqiini',               path: 'kourel4/_Yaqiini.pdf' },
    ],
  },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SlideshowComponent, SidebarComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  readonly api    = inject(ApiService);
  private  router = inject(Router);

  collections      = signal<Collection[]>([]);
  slides           = signal<Khassida[]>([]);
  activeCollectionId = signal<number | null>(null);
  currentIndex     = signal(0);
  loading          = signal(true);
  newSlidesCount   = signal(0);
  sidebarOpen      = signal(false);

  // ── Browser mode ──
  appMode                  = signal<'browser' | 'slideshow'>('browser');
  browserView              = signal<'folders' | 'files' | 'kourel' | 'kourel-pdfs'>('folders');
  browserOpenCollectionId  = signal<number | null>(null);
  browserKhassidas         = signal<Khassida[]>([]);
  browserKhassidaLoading   = signal(false);
  browserStartIndex        = signal(0);

  // ── Kourel ──
  readonly kourelCollections    = signal(KOUREL_DATA);
  activeKourelCollection        = signal<KourelCollection | null>(null);

  browserOpenCollectionName = computed(() => {
    const id = this.browserOpenCollectionId();
    if (id === null && this.browserView() === 'files') return 'Tous les khassida';
    return this.collections().find(c => c.id === id)?.name ?? '';
  });

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

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  closeSidebar():  void { this.sidebarOpen.set(false); }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024) this.sidebarOpen.set(false);
  }

  // ── Ouvrir un dossier → charger ses khassidas ──
  openFolder(collectionId: number | null): void {
    this.browserOpenCollectionId.set(collectionId);
    this.browserStartIndex.set(0);
    this.browserView.set('files');
    this.browserKhassidaLoading.set(true);
    this.api.getSlideshow(collectionId ?? undefined).subscribe({
      next: slides => {
        this.browserKhassidas.set(slides);
        this.browserKhassidaLoading.set(false);
      },
      error: () => this.browserKhassidaLoading.set(false),
    });
  }

  backToFolders(): void {
    this.browserView.set('folders');
    this.browserKhassidas.set([]);
    this.activeKourelCollection.set(null);
  }

  openKourel(): void {
    this.browserView.set('kourel');
  }

  openKourelCollection(col: KourelCollection): void {
    this.activeKourelCollection.set(col);
    this.browserView.set('kourel-pdfs');
  }

  openKourelPdf(pdf: KourelPdf): void {
    this.router.navigate(['/page'], {
      queryParams: { pdf: pdf.path, name: pdf.label, back: '/' },
    });
  }

  imageUrl(slide: Khassida): string {
    return this.api.imageUrl(slide);
  }

  // ── Lancer le diaporama ──
  launchSlideshow(collectionId: number | null, startIndex = 0): void {
    this.activeCollectionId.set(collectionId);
    this.lastKnownId = 0;
    this.currentIndex.set(startIndex);
    if (this.browserView() === 'files' && this.browserKhassidas().length > 0) {
      this.slides.set(this.browserKhassidas());
      this.loading.set(false);
      this.lastKnownCount = this.browserKhassidas().length;
      this.lastKnownId = this.browserKhassidas()[this.browserKhassidas().length - 1]?.id ?? 0;
    } else {
      this.loadSlideshow(collectionId ?? undefined);
    }
    this.appMode.set('slideshow');
  }

  backToBrowser(): void {
    this.appMode.set('browser');
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
    this.closeSidebar();
  }

  onSlideSelect(index: number): void { this.currentIndex.set(index); }
  onIndexChange(index: number): void { this.currentIndex.set(index); }
}
