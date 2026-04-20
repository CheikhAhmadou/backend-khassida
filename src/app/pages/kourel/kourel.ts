import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface KourelPdf {
  filename: string;
  label: string;
  path: string;
}

const KOUREL4_PDFS: KourelPdf[] = [
  { filename: '_Bismillahi lezi.pdf',         label: 'Bismillahi Lezi',        path: 'kourel4/_Bismillahi lezi.pdf' },
  { filename: '_Lam-yabdou-ar.pdf',           label: 'Lam Yabdou',             path: 'kourel4/_Lam-yabdou-ar.pdf' },
  { filename: '_Madahtu-nabiyal.pdf',         label: 'Madahtu Nabiyal',        path: 'kourel4/_Madahtu-nabiyal.pdf' },
  { filename: '_Madhu Nabiyil Muntaqa.pdf',   label: 'Madhu Nabiyil Muntaqa',  path: 'kourel4/_Madhu Nabiyil Muntaqa.pdf' },
  { filename: '_Rafahnaa-ar.pdf',             label: 'Rafahnaa',               path: 'kourel4/_Rafahnaa-ar.pdf' },
  { filename: '_Salaatu-Rahiimin-ar.pdf',     label: 'Salaatu Rahiimin',       path: 'kourel4/_Salaatu-Rahiimin-ar.pdf' },
  { filename: '_Yaqiini.pdf',                 label: 'Yaqiini',                path: 'kourel4/_Yaqiini.pdf' },
];

@Component({
  selector: 'app-kourel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './kourel.html',
  styleUrl: './kourel.scss',
})
export class KourelComponent {
  readonly kourelName = 'Kourel 4 Diawartoulah Paris';
  readonly pdfs = signal(KOUREL4_PDFS);

  private router = inject(Router);

  openPdf(pdf: KourelPdf): void {
    this.router.navigate(['/page'], {
      queryParams: {
        pdf:  pdf.path,
        name: pdf.label,
        back: '/kourel',
      }
    });
  }
}
