import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Collection, Khassida } from '../../models/collection.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  @Input() collections: Collection[] = [];
  @Input() slides: Khassida[] = [];
  @Input() currentIndex = 0;
  @Input() activeCollectionId: number | null = null;
  @Output() collectionSelect = new EventEmitter<number | null>();
  @Output() slideSelect = new EventEmitter<number>();
}
