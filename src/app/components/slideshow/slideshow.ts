import {
  Component, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter,
  signal, computed, inject, ChangeDetectionStrategy, HostListener, ElementRef, NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Khassida } from '../../models/collection.model';
import { ApiService } from '../../services/api';

export type TransitionType = 'fade-zoom' | 'slide-up' | 'slide-right' | 'dissolve';

@Component({
  selector: 'app-slideshow',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './slideshow.html',
  styleUrl: './slideshow.scss',
})
export class SlideshowComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() set slides(val: Khassida[]) {
    this._slides.set(val);
    this.currentIndex.set(0);
    this.prevIndex.set(null);
    this.restartAutoplay();
  }
  @Input() intervalMs = 5000;
  @Output() indexChange = new EventEmitter<number>();

  private readonly speedOptions = [3000, 5000, 8000, 10000, 15000, 30000];
  intervalMs_signal = signal(5000);

  cycleSpeed(): void {
    const idx = this.speedOptions.indexOf(this.intervalMs_signal());
    const next = this.speedOptions[(idx + 1) % this.speedOptions.length];
    this.intervalMs_signal.set(next);
    this.intervalMs = next;
    this.restartAutoplay();
  }

  speedLabel = computed(() => {
    const s = this.intervalMs_signal() / 1000;
    return s < 60 ? `${s}s` : `${s / 60}m`;
  });

  api    = inject(ApiService);
  private el   = inject(ElementRef);
  private zone = inject(NgZone);

  _slides    = signal<Khassida[]>([]);
  isFullscreen = signal(false);
  currentIndex = signal(0);
  prevIndex    = signal<number | null>(null);
  isPlaying    = signal(true);
  progress     = signal(0);
  animating    = signal(false);
  transition   = signal<TransitionType>('fade-zoom');

  private transitions: TransitionType[] = ['fade-zoom', 'slide-up', 'slide-right', 'dissolve'];
  private transitionIdx = 0;
  private ANIM_MS = 700;

  current  = computed(() => this._slides()[this.currentIndex()] ?? null);
  previous = computed(() => this.prevIndex() !== null ? (this._slides()[this.prevIndex()!] ?? null) : null);
  total    = computed(() => this._slides().length);

  isSleeping = signal(false);
  chapeletCount = computed(() => Math.min(this.total(), 30));

  private timer: ReturnType<typeof setInterval> | null = null;
  private progressTimer: ReturnType<typeof setInterval> | null = null;
  private sleepTimer: ReturnType<typeof setTimeout> | null = null;
  private particleInterval: ReturnType<typeof setInterval> | null = null;
  private startedAt = 0;
  private readonly SLEEP_MS = 30000;

  ngOnInit(): void { this.restartAutoplay(); }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      // Lancer 20 particules initiales
      for (let i = 0; i < 20; i++) {
        setTimeout(() => this.spawnParticle(), i * 350);
      }
      this.particleInterval = setInterval(() => this.spawnParticle(), 1800);
    });
    this.resetSleep();
  }

  ngOnDestroy(): void {
    this.clearTimers();
    if (this.sleepTimer) clearTimeout(this.sleepTimer);
    if (this.particleInterval) clearInterval(this.particleInterval);
  }

  resetSleep(): void {
    if (this.sleepTimer) clearTimeout(this.sleepTimer);
    this.isSleeping.set(false);
    this.sleepTimer = setTimeout(() => this.zone.run(() => this.isSleeping.set(true)), this.SLEEP_MS);
  }

  private spawnParticle(): void {
    const container = this.el.nativeElement.querySelector('.particles');
    if (!container) return;
    const p = document.createElement('div');
    p.className = 'particle';
    const dur  = 7 + Math.random() * 9;
    const dx   = (Math.random() - 0.5) * 70;
    const size = 0.8 + Math.random() * 1.8;
    p.style.cssText = `left:${8 + Math.random() * 84}%;bottom:${Math.random() * 70}%;--dx:${dx}px;animation-duration:${dur}s;animation-delay:${Math.random() * 2}s;width:${size}px;height:${size}px;`;
    container.appendChild(p);
    setTimeout(() => p.remove(), (dur + 4) * 1000);
  }

  @HostListener('mousemove') @HostListener('click') onActivity(): void { this.resetSleep(); }

  restartAutoplay(): void {
    this.clearTimers();
    if (!this.isPlaying() || this.total() === 0) return;
    this.startedAt = Date.now();
    this.progress.set(0);
    this.progressTimer = setInterval(() => {
      this.progress.set(Math.min(((Date.now() - this.startedAt) / this.intervalMs) * 100, 100));
    }, 50);
    this.timer = setInterval(() => this.advance(1), this.intervalMs);
  }

  private clearTimers(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.progressTimer) clearInterval(this.progressTimer);
    this.timer = null;
    this.progressTimer = null;
  }

  private nextTransition(): void {
    this.transitionIdx = (this.transitionIdx + 1) % this.transitions.length;
    this.transition.set(this.transitions[this.transitionIdx]);
  }

  advance(dir: number): void {
    if (this.animating()) return;
    const next = (this.currentIndex() + dir + this.total()) % this.total();
    this.nextTransition();
    this.prevIndex.set(this.currentIndex());
    this.animating.set(true);
    this.currentIndex.set(next);
    this.indexChange.emit(next);
    this.startedAt = Date.now();
    this.progress.set(0);
    setTimeout(() => {
      this.prevIndex.set(null);
      this.animating.set(false);
    }, this.ANIM_MS);
  }

  goTo(index: number): void {
    if (index === this.currentIndex() || this.animating()) return;
    this.nextTransition();
    this.prevIndex.set(this.currentIndex());
    this.animating.set(true);
    this.currentIndex.set(index);
    this.indexChange.emit(index);
    this.startedAt = Date.now();
    this.progress.set(0);
    setTimeout(() => {
      this.prevIndex.set(null);
      this.animating.set(false);
    }, this.ANIM_MS);
  }

  togglePlay(): void {
    this.isPlaying.update(v => !v);
    this.isPlaying() ? this.restartAutoplay() : this.clearTimers();
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.el.nativeElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreen.set(!!document.fullscreenElement);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === 'f' || e.key === 'F') this.toggleFullscreen();
    if (e.key === 'ArrowRight') this.advance(1);
    if (e.key === 'ArrowLeft') this.advance(-1);
    if (e.key === ' ') { e.preventDefault(); this.togglePlay(); }
  }

  imageUrl(slide: Khassida): string {
    return this.api.imageUrl(slide);
  }
}
