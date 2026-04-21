import { Component, Input, Output, EventEmitter, signal, computed, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-viewer.html',
  styleUrl: './image-viewer.scss',
})
export class ImageViewerComponent implements OnInit {
  @Input() pages: string[] = [];
  @Input() name = '';
  @Output() backClicked = new EventEmitter<void>();

  currentPair = signal(0);

  leftPage  = computed(() => this.pages[this.currentPair()] ?? null);
  rightPage = computed(() => this.pages[this.currentPair() + 1] ?? null);
  canPrev   = computed(() => this.currentPair() > 0);
  canNext   = computed(() => this.currentPair() + 2 < this.pages.length);

  pageLabel = computed(() => {
    const p     = this.currentPair();
    const total = this.pages.length;
    const left  = p + 1;
    const right = Math.min(p + 2, total);
    return left === right ? `Page ${left} / ${total}` : `Pages ${left}–${right} / ${total}`;
  });

  ngOnInit(): void { this.currentPair.set(0); }

  prev(): void { if (this.canPrev()) this.currentPair.update(p => p - 2); }
  next(): void { if (this.canNext()) this.currentPair.update(p => p + 2); }
  goBack(): void { this.backClicked.emit(); }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft')  this.prev();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'Escape')     this.goBack();
  }
}
