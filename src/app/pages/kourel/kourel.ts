import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PdfViewComponent } from '../pdf-view/pdf-view';
import { ImageViewerComponent } from '../image-viewer/image-viewer';

export interface KourelPdf {
  filename: string;
  label: string;
  type: 'pdf' | 'images';
  path?: string;
  pages?: string[];
}
export interface KourelCollection { name: string; pdfs: KourelPdf[]; }

function imgPages(folder: string, prefix: string, count: number): string[] {
  const enc = encodeURIComponent(folder);
  return Array.from({ length: count }, (_, i) =>
    `/kourel-files/${enc}/${prefix}_page_${String(i + 1).padStart(4, '0')}.png`
  );
}

function pdf(folder: string, filename: string, label: string): KourelPdf {
  return {
    filename,
    label,
    type: 'pdf',
    path: `/kourel-files/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`,
  };
}

const KOUREL_DATA: KourelCollection[] = [
  {
    name: 'Kourel 1 Diawaroulah Paris',
    pdfs: [
      { filename: 'Muqadammatul Amdah 1', label: 'Muqadammatul Amdah 1', type: 'images', pages: imgPages('Kourel 1 Diawaroulah Paris', '_Muqadammatul_Amdah_1', 39) },
      { filename: 'Muqadammatul Amdah 2', label: 'Muqadammatul Amdah 2', type: 'images', pages: imgPages('Kourel 1 Diawaroulah Paris', '_Muqadammatul_Amdah_2', 50) },
      { filename: 'Yassaralii',           label: 'Yassaralii',           type: 'images', pages: imgPages('Kourel 1 Diawaroulah Paris', '_Yassaralii', 3) },
    ],
  },
  {
    name: 'Kourel 2 Diawaroulah Paris',
    pdfs: [
      { filename: 'Jazbul Xulub 4', label: 'Jazbul Xulub 4', type: 'images', pages: imgPages('Kourel 2 Diawaroulah Paris', '_Jazbul_Xulub_4', 42) },
      { filename: 'Jazbul Xulub 6', label: 'Jazbul Xulub 6', type: 'images', pages: imgPages('Kourel 2 Diawaroulah Paris', '_Jazbul_Xulub_6', 38) },
    ],
  },
  {
    name: 'Kourel 3 Diawartoulah Paris',
    pdfs: [
      { filename: '_Madahtu-nabiyal.pdf',   label: 'Madahtu Nabiyal',   type: 'pdf', path: 'kourel3/_Madahtu-nabiyal.pdf' },
      { filename: '_Salahi bi fadlilla.pdf', label: 'Salahi Bi Fadlilla', type: 'pdf', path: 'kourel3/_Salahi bi fadlilla.pdf' },
      { filename: '_Tawbatun_nasuuh.pdf',    label: 'Tawbatun Nasuuh',   type: 'pdf', path: 'kourel3/_Tawbatun_nasuuh.pdf' },
    ],
  },
  {
    name: 'Kourel 4 Diawartoulah Paris',
    pdfs: [
      { filename: '_Bismillahi lezi.pdf',       label: 'Bismillahi Lezi',       type: 'pdf', path: 'kourel4/_Bismillahi lezi.pdf' },
      { filename: '_Lam-yabdou-ar.pdf',         label: 'Lam Yabdou',            type: 'pdf', path: 'kourel4/_Lam-yabdou-ar.pdf' },
      { filename: '_Madahtu-nabiyal.pdf',       label: 'Madahtu Nabiyal',       type: 'pdf', path: 'kourel4/_Madahtu-nabiyal.pdf' },
      { filename: '_Madhu Nabiyil Muntaqa.pdf', label: 'Madhu Nabiyil Muntaqa', type: 'pdf', path: 'kourel4/_Madhu Nabiyil Muntaqa.pdf' },
      { filename: '_Rafahnaa-ar.pdf',           label: 'Rafahnaa',              type: 'pdf', path: 'kourel4/_Rafahnaa-ar.pdf' },
      { filename: '_Salaatu-Rahiimin-ar.pdf',   label: 'Salaatu Rahiimin',      type: 'pdf', path: 'kourel4/_Salaatu-Rahiimin-ar.pdf' },
      { filename: '_Yaqiini.pdf',               label: 'Yaqiini',               type: 'pdf', path: 'kourel4/_Yaqiini.pdf' },
    ],
  },
  {
    name: 'Kourel Al Hijaratou',
    pdfs: [
      pdf('Kourel Al Hijaratou', '_Khaatimul_munadiati.pdf',              'Khaatimul Munadiati'),
      pdf('Kourel Al Hijaratou', '_Minal Lahi AL_HAQQU_MIN_RABBIKUM.pdf', 'Minal Lahi Al Haqqu Min Rabbikum'),
      pdf('Kourel Al Hijaratou', '_Wadjahtou Koulliya zaa.pdf',           'Wadjahtou Koulliya Zaa'),
    ],
  },
  {
    name: 'Kourel Aulnay',
    pdfs: [
      pdf('Kourel Aulnay', '_Alal_montakha.pdf',                 'Alal Montakha'),
      pdf('Kourel Aulnay', '_Allahou Khlilli Man Zannani.pdf',   'Allahou Khlilli Man Zannani'),
      pdf('Kourel Aulnay', '_Astahfirul_laha_bihii.pdf',         'Astahfirul Laha Bihii'),
      pdf('Kourel Aulnay', '_Bouchraa_lana.pdf',                 'Bouchraa Lana'),
      pdf('Kourel Aulnay', '_MadalXabiru-LissanuChukri.pdf',     'Madal Xabiru Lissanu Chukri'),
    ],
  },
  {
    name: 'Kourel Boustane',
    pdfs: [
      pdf('Kourel Boustane', '_Bouchraa_lana.pdf', 'Bouchraa Lana'),
      pdf('Kourel Boustane', '_Midaadii.pdf',       'Midaadii'),
    ],
  },
  {
    name: 'Kourel Creil',
    pdfs: [
      pdf('Kourel Creil', '_Ahonzu_Bilahi_Min_Mayli.pdf', 'Ahonzu Bilahi Min Mayli'),
      pdf('Kourel Creil', '_Ilayka Yaa RABBAL waraa.pdf', 'Ilayka Yaa Rabbal Waraa'),
      pdf('Kourel Creil', '_Khalo liyarkane.pdf',         'Khalo Liyarkane'),
      pdf('Kourel Creil', '_Lirabbin Ghaforin.pdf',       'Lirabbin Ghaforin'),
    ],
  },
  {
    name: 'Kourel Darou Salam',
    pdfs: [
      pdf('Kourel Darou Salam', '_Ahbabtou Fataha Fuzty.pdf',                   'Ahbabtou Fataha Fuzty'),
      pdf('Kourel Darou Salam', '_Alaa_Inani_Ousni_Alaa_Inani_Arju.pdf',        'Alaa Inani Ousni Alaa Inani Arju'),
      pdf('Kourel Darou Salam', '_Bismillahi lezi.pdf',                          'Bismillahi Lezi'),
    ],
  },
  {
    name: 'Kourel Federal Ouest',
    pdfs: [
      pdf('Kourel Federal ouest', '_Madaliyal Houda.pdf',        'Madaliyal Houda'),
      pdf('Kourel Federal ouest', '_Matlabush_Shifa-i.pdf',      'Matlabush Shifa-i'),
      pdf('Kourel Federal ouest', '_Salatun wa taslimun.pdf',    'Salatun Wa Taslimun'),
      pdf('Kourel Federal ouest', '_Wadjahtu lilahi ham.pdf',    'Wadjahtu Lilahi Ham'),
    ],
  },
  {
    name: 'Kourel HT',
    pdfs: [
      pdf('Kourel HT', '_Alamane.pdf',                              'Alamane'),
      pdf('Kourel HT', '_Houda Ila.pdf',                            'Houda Ila'),
      pdf('Kourel HT', '_MadalXabiru-LissanuChukri.pdf',            'Madal Xabiru Lissanu Chukri'),
      pdf('Kourel HT', '_Rabiya-ahmadou.pdf',                       'Rabiya Ahmadou'),
      pdf('Kourel HT', '_Wajahtu abkara amdahi liman fudala.pdf',   'Wajahtu Abkara Amdahi Liman Fudala'),
    ],
  },
  {
    name: 'Kourel HTDKH',
    pdfs: [
      pdf('Kourel HTDKH', '_Asma-ul_lahi_husnaa.pdf',                              'Asma-ul Lahi Husnaa'),
      pdf('Kourel HTDKH', '_Bouchraa_lana.pdf',                                    'Bouchraa Lana'),
      pdf('Kourel HTDKH', '_Muqadammatul_Amdah - zilali-yakhini-malaktou.pdf',     'Muqadammatul Amdah - Zilali Yakhini Malaktou'),
    ],
  },
  {
    name: 'Kourel Lille',
    pdfs: [
      pdf('Kourel Lille', '_Bouchraa_lana.pdf',    'Bouchraa Lana'),
      pdf('Kourel Lille', '_Fariha.pdf',            'Fariha'),
      pdf('Kourel Lille', '_Lirabbin Ghaforin.pdf', 'Lirabbin Ghaforin'),
      pdf('Kourel Lille', '_Waxaanii.pdf',          'Waxaanii'),
    ],
  },
  {
    name: 'Kourel Lyon',
    pdfs: [
      pdf('Kourel Lyon', '_Ileyka Yaa.pdf',              'Ileyka Yaa'),
      pdf('Kourel Lyon', '_Lam-yabdou-ar.pdf',           'Lam Yabdou'),
      pdf('Kourel Lyon', '_Wakaana_haqan_haleyna.pdf',   'Wakaana Haqan Haleyna'),
      pdf('Kourel Lyon', '_Wakaana_haqan_haleyna1.pdf',  'Wakaana Haqan Haleyna 2'),
    ],
  },
  {
    name: 'Kourel Taverny',
    pdfs: [
      pdf('Kourel Taverny', '_Bouchraa_lana.pdf',   'Bouchraa Lana'),
      pdf('Kourel Taverny', '_ILAA NABIYYIN.pdf',   'Ilaa Nabiyyin'),
      pdf('Kourel Taverny', '_Walajtu wulojan.pdf', 'Walajtu Wulojan'),
    ],
  },
  {
    name: 'Kourel Varese',
    pdfs: [
      pdf('Kourel Varese', '_Assiiru.pdf',                   'Assiiru'),
      pdf('Kourel Varese', '_Bouchraa_lana.pdf',             'Bouchraa Lana'),
      pdf('Kourel Varese', '_Wawasaynaal-insaana-ar.pdf',    'Wawasaynaal Insaana'),
    ],
  },
];

@Component({
  selector: 'app-kourel',
  standalone: true,
  imports: [CommonModule, RouterLink, PdfViewComponent, ImageViewerComponent],
  templateUrl: './kourel.html',
  styleUrl: './kourel.scss',
})
export class KourelComponent {
  readonly kourelCollections = signal(KOUREL_DATA);
  activeKourel               = signal<KourelCollection | null>(null);
  selectedPdf                = signal<KourelPdf | null>(null);

  openKourel(col: KourelCollection): void {
    this.activeKourel.set(col);
    this.selectedPdf.set(null);
  }

  openPdf(pdf: KourelPdf): void { this.selectedPdf.set(pdf); }
  backToList(): void             { this.selectedPdf.set(null); }
  backToKourels(): void          { this.activeKourel.set(null); this.selectedPdf.set(null); }
}
