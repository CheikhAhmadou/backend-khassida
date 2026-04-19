import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Collection, Khassida } from '../../models/collection.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  @Input() set collections(val: Collection[]) {
    this._allCollections = [...val].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    this.buildGroups();
  }
  @Input() slides: Khassida[] = [];
  @Input() currentIndex = 0;
  @Input() activeCollectionId: number | null = null;
  @Output() collectionSelect = new EventEmitter<number | null>();
  @Output() slideSelect = new EventEmitter<number>();

  searchQuery = '';
  sortedCollections: Collection[] = [];
  groupedCollections: { letter: string; items: Collection[] }[] = [];

  private _allCollections: Collection[] = [];

  onSearch(): void {
    this.buildGroups();
  }

  private buildGroups(): void {
    const q = this.searchQuery.trim().toLowerCase();
    const filtered = q
      ? this._allCollections.filter(c => c.name.toLowerCase().includes(q))
      : this._allCollections;

    this.sortedCollections = filtered;

    const map = new Map<string, Collection[]>();
    for (const col of filtered) {
      const letter = col.name.charAt(0).toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(col);
    }
    this.groupedCollections = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b, 'fr'))
      .map(([letter, items]) => ({ letter, items }));
  }
}
