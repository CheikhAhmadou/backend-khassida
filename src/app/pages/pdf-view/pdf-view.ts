import {
  Component, AfterViewInit, OnDestroy, Input, Output, EventEmitter,
  ElementRef, ViewChild, signal, computed, HostListener, NgZone, inject, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

@Component({
  selector: 'app-pdf-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pdf-view.html',
  styleUrl:    './pdf-view.scss',
})
export class PdfViewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasLeft')  canvasLeft!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasRight') canvasRight!: ElementRef<HTMLCanvasElement>;

  // Mode embarqué : inputs fournis par le parent
  @Input() embeddedPdf  = '';
  @Input() embeddedName = '';
  @Input() embedded     = false;
  @Output() backClicked = new EventEmitter<void>();

  private zone  = inject(NgZone);
  private cdr   = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private pdf: pdfjsLib.PDFDocumentProxy | null = null;

  totalPages   = signal(0);
  currentPair  = signal(0);
  loading      = signal(true);
  rendering    = signal(false);
  isFullscreen = signal(false);
  error        = signal('');

  totalPairs = computed(() => Math.ceil(this.totalPages() / 2));
  leftPage   = computed(() => this.currentPair() * 2 + 1);
  rightPage  = computed(() => this.currentPair() * 2 + 2);

  pdfUrl    = signal('madahtu-nabiyal.pdf');
  pdfName   = signal('مَدَحْتُ نَبِيَّالْ');
  pdfNameFr = signal('Madahtu Nabiyal');
  backUrl   = signal('/');

  ngAfterViewInit(): void {
    if (this.embedded && this.embeddedPdf) {
      this.pdfUrl.set(this.embeddedPdf);
      this.pdfNameFr.set(this.embeddedName);
      this.pdfName.set(this.embeddedName);
    } else {
      const paramPdf  = this.route.snapshot.queryParamMap.get('pdf');
      const paramName = this.route.snapshot.queryParamMap.get('name');
      const paramBack = this.route.snapshot.queryParamMap.get('back');
      if (paramPdf) {
        this.pdfUrl.set(paramPdf);
        if (paramName) { this.pdfNameFr.set(paramName); this.pdfName.set(paramName); }
        if (paramBack) this.backUrl.set(paramBack);
      }
    }
    this.loadPdf();
  }

  ngOnDestroy(): void { this.pdf?.destroy(); }

  private async loadPdf(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    this.currentPair.set(0);
    this.totalPages.set(0);
    try {
      this.pdf?.destroy();
      const task = pdfjsLib.getDocument(this.pdfUrl());
      this.pdf = await task.promise;
      this.zone.run(() => {
        this.totalPages.set(this.pdf!.numPages);
        this.loading.set(false);
        this.cdr.detectChanges();
      });
      await new Promise(r => setTimeout(r, 50));
      await this.renderPair(0);
    } catch (e: any) {
      this.zone.run(() => {
        this.error.set('Impossible de charger le PDF : ' + (e?.message ?? e));
        this.loading.set(false);
      });
    }
  }

  private async renderPair(pairIndex: number): Promise<void> {
    if (!this.pdf || !this.canvasLeft || !this.canvasRight) return;
    this.zone.run(() => this.rendering.set(true));
    await this.renderPage(pairIndex * 2 + 1, this.canvasLeft.nativeElement);
    if (pairIndex * 2 + 2 <= this.totalPages()) {
      await this.renderPage(pairIndex * 2 + 2, this.canvasRight.nativeElement);
    } else {
      this.clearCanvas(this.canvasRight.nativeElement);
    }
    this.zone.run(() => this.rendering.set(false));
  }

  private async renderPage(pageNum: number, canvas: HTMLCanvasElement): Promise<void> {
    if (!this.pdf) return;
    const page     = await this.pdf.getPage(pageNum);
    const body     = canvas.closest('.pdf-body') as HTMLElement | null;
    const vw       = window.innerWidth;
    const navH     = 42;
    const ctrlH    = 42;
    const spineW   = 28;
    const framePad = 8;
    const titleH   = vw < 640 ? 60 : 80;
    const sideW    = vw < 640 ? 0 : vw < 1024 ? 60 : vw >= 2560 ? 140 : vw >= 1920 ? 110 : 88;
    const bodyW    = body ? body.clientWidth  : vw;
    const bodyH    = body ? body.clientHeight : window.innerHeight - navH - ctrlH;
    const availW   = (bodyW - spineW - framePad * 2 - sideW * 2) / 2;
    const availH   = bodyH - framePad * 2 - titleH;
    const dpr      = window.devicePixelRatio || 1;

    const vp0   = page.getViewport({ scale: 1 });
    const scale = Math.min(availW / vp0.width, availH / vp0.height) * dpr;
    const vp    = page.getViewport({ scale });

    canvas.width  = vp.width;
    canvas.height = vp.height;
    canvas.style.width  = `${vp.width  / dpr}px`;
    canvas.style.height = `${vp.height / dpr}px`;

    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx as any, canvas, viewport: vp }).promise;
  }

  private clearCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 10; canvas.height = 10;
  }

  async goTo(pair: number): Promise<void> {
    if (this.rendering() || pair < 0 || pair >= this.totalPairs()) return;
    this.currentPair.set(pair);
    await this.renderPair(pair);
  }

  async prev(): Promise<void> { await this.goTo(this.currentPair() - 1); }
  async next(): Promise<void> { await this.goTo(this.currentPair() + 1); }

  goBack(): void {
    if (this.embedded) this.backClicked.emit();
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreen.set(!!document.fullscreenElement);
    setTimeout(() => this.renderPair(this.currentPair()), 150);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') this.next();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   this.prev();
    if (e.key === 'f' || e.key === 'F') this.toggleFullscreen();
    if (e.key === 'Escape' && this.embedded) this.backClicked.emit();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.rendering()) setTimeout(() => this.renderPair(this.currentPair()), 100);
  }
}
