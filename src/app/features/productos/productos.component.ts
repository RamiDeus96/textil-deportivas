import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DemoStoreService } from '../../core/store.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Catálogo</p>
        <h1>Productos</h1>
      </div>
      <button class="primary-btn" (click)="openForm()">Nuevo producto</button>
    </section>

    <div class="toolbar">
      <div class="chip-row">
        <span class="chip active">Todos</span>
        <span class="chip">Camisetas</span>
        <span class="chip">Uniformes</span>
        <span class="chip">Accesorios</span>
      </div>
      <input type="text" class="search-input" placeholder="Buscar por nombre, equipo o SKU" />
    </div>

    <div class="product-grid">
      <article class="product-card" *ngFor="let product of products()">
        <img [src]="safeImage(product.imageUrl)" [alt]="product.name" />
        <div class="card-body">
          <div class="meta-row">
            <span class="tag">{{ product.category }}</span>
            <span class="status" [class.inactive]="!product.active">{{ product.active ? 'Activo' : 'Inactivo' }}</span>
          </div>
          <h3>{{ product.name }}</h3>
          <p>{{ product.description }}</p>
          <div class="details">
            <span>SKU: {{ product.sku }}</span>
            <span>{{ product.season }}</span>
          </div>
          <div class="footer-row">
            <strong>{{ product.variants.length }} variantes</strong>
            <button (click)="editProduct(product)">Ver detalle</button>
          </div>
        </div>
      </article>
    </div>

    <div class="modal-backdrop" *ngIf="showForm()">
      <div class="product-form">
        <div class="modal-header">
          <h3>Nuevo producto</h3>
          <button class="close-btn" (click)="showForm.set(false)">Cerrar</button>
        </div>

        <div class="form-grid">
          <div class="field-group">
            <label>Nombre<input type="text" [(ngModel)]="draft.name" /></label>
            <label>Descripción<textarea [(ngModel)]="draft.description"></textarea></label>
            <div class="inline-two">
              <label>SKU<input type="text" [(ngModel)]="draft.sku" /></label>
              <label>Código de barras<input type="text" [(ngModel)]="draft.barcode" /></label>
            </div>
            <div class="inline-two">
              <label>Equipo<select [(ngModel)]="draft.teamId">
                <option *ngFor="let team of store.teams()" [value]="team.id">{{ team.name }}</option>
              </select></label>
              <label>Liga<input type="text" [(ngModel)]="draft.league" /></label>
            </div>
            <div class="inline-two">
              <label>Temporada<input type="text" [(ngModel)]="draft.season" /></label>
              <label>Categoría<select [(ngModel)]="draft.category">
                <option value="Camisetas">Camisetas</option>
                <option value="Uniformes completos">Uniformes completos</option>
                <option value="Shorts">Shorts</option>
                <option value="Medias">Medias</option>
                <option value="Balones">Balones</option>
                <option value="Espinilleras">Espinilleras</option>
                <option value="Accesorios">Accesorios</option>
              </select></label>
            </div>
          </div>

          <div class="field-group">
            <label>Imagen del producto
              <input type="file" accept="image/*" (change)="onImageSelected($event)" />
            </label>
            <img class="preview-image" [src]="safeImage(draft.imageUrl)" />

            <h4>Variante</h4>
            <div class="inline-two">
              <label>Calidad<select [(ngModel)]="draft.qualityId">
                <option *ngFor="let quality of store.qualities()" [value]="quality.id">{{ quality.name }}</option>
              </select></label>
              <label>Talla<input type="text" [(ngModel)]="draft.size" /></label>
            </div>
            <div class="inline-two">
              <label>Proveedor<select [(ngModel)]="draft.supplierId">
                <option *ngFor="let supplier of store.suppliers()" [value]="supplier.id">{{ supplier.name }}</option>
              </select></label>
              <label>Presentación<select [(ngModel)]="draft.presentation">
                <option value="individual">Individual</option>
                <option value="kit">Kit</option>
                <option value="bundle">Bundle</option>
              </select></label>
            </div>
            <div class="inline-two">
              <label>Costo<input type="number" [(ngModel)]="draft.cost" /></label>
              <label>Precio venta<input type="number" [(ngModel)]="draft.price" /></label>
            </div>
            <div class="inline-two">
              <label>Stock inicial<input type="number" [(ngModel)]="draft.stock" /></label>
              <label>Stock mínimo<input type="number" [(ngModel)]="draft.minStock" /></label>
            </div>
          </div>
        </div>

        <div class="button-row">
          <button class="secondary-btn" (click)="showForm.set(false)">Cancelar</button>
          <button class="primary-btn" (click)="saveProduct()">Guardar</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display:block; }
      .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; }
      .eyebrow { margin:0; text-transform:uppercase; letter-spacing:.08em; color:#64748b; font-size:.72rem; }
      h1 { margin:.2rem 0 0; font-size:2.1rem; }
      .primary-btn, .secondary-btn { border:0; border-radius:12px; padding:.8rem 1rem; font-weight:600; }
      .primary-btn { background:#16a34a; color:white; }
      .secondary-btn { background:#e2e8f0; color:#0f172a; }
      .toolbar { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1rem; }
      .chip-row { display:flex; flex-wrap:wrap; gap:.5rem; }
      .chip { background:#e7edf8; color:#234; padding:.55rem .85rem; border-radius:999px; font-size:.8rem; }
      .chip.active { background:#0f172a; color:white; }
      .search-input { min-width:260px; max-width:420px; width:100%; padding:.8rem .9rem; border-radius:12px; border:1px solid #dfeaf5; }
      .product-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem; }
      .product-card { background:#fff; border:1px solid #e5edf6; border-radius:18px; overflow:hidden; }
      .product-card img { width:100%; height:200px; object-fit:cover; display:block; }
      .card-body { padding:1rem; }
      .meta-row, .details, .footer-row { display:flex; justify-content:space-between; align-items:center; gap:.5rem; }
      .tag { background:#e0f2fe; color:#075985; border-radius:999px; padding:.3rem .55rem; font-size:.72rem; }
      .status { background:#eaf7ee; color:#166534; padding:.25rem .5rem; border-radius:999px; font-size:.72rem; }
      .status.inactive { background:#fef2f2; color:#b91c1c; }
      h3 { margin:.9rem 0 .55rem; font-size:1.15rem; }
      p { margin:0; color:#64748b; line-height:1.5; min-height:2.8em; }
      .details { margin-top:1rem; color:#475569; font-size:.77rem; }
      .footer-row { margin-top:1rem; }
      button { border:1px solid #dfeaf5; background:#f8fafc; border-radius:10px; padding:.55rem .8rem; }
      .modal-backdrop { position:fixed; inset:0; background:rgba(15,23,42,.45); display:grid; place-items:center; padding:1rem; z-index:50; }
      .product-form { background:#fff; border-radius:18px; width:min(880px,100%); padding:1rem; }
      .modal-header { display:flex; justify-content:space-between; align-items:center; }
      .close-btn { border:0; background:#ef4444; color:white; padding:.6rem .8rem; border-radius:10px; }
      .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1rem; }
      .field-group { display:flex; flex-direction:column; gap:.8rem; }
      .inline-two { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
      label { display:flex; flex-direction:column; gap:.4rem; color:#475569; font-weight:600; }
      input, select, textarea { width:100%; border:1px solid #dfeaf5; border-radius:10px; padding:.7rem .8rem; }
      textarea { min-height:100px; resize:vertical; }
      .preview-image { width:100%; height:180px; object-fit:cover; border-radius:12px; border:1px solid #e5edf6; }
      .button-row { margin-top:1rem; display:flex; justify-content:flex-end; gap:.75rem; }
      @media (max-width: 700px) { .toolbar, .form-grid, .inline-two { grid-template-columns:1fr; display:grid; } }
    `
  ]
})
export class ProductosComponent {
  readonly store = inject(DemoStoreService);

  readonly products = computed(() => this.store.products().slice(0, 15));
  readonly showForm = signal(false);
  draft = {
    name: '',
    description: '',
    sku: '',
    barcode: '',
    teamId: 'tigres',
    league: 'Liga MX',
    season: '2025',
    category: 'Camisetas',
    imageUrl: '',
    qualityId: 'premium',
    size: 'M',
    supplierId: 'prov-1',
    presentation: 'individual',
    cost: 450,
    price: 749,
    stock: 12,
    minStock: 4
  };

  safeImage(url: string | undefined): string {
    if (!url || url.trim() === '') {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="#e2e8f0"/><text x="400" y="430" text-anchor="middle" font-family="Arial" font-size="72" font-weight="700" fill="#475569">PRODUCTO</text></svg>')}`;
    }
    return url;
  }

  openForm(): void {
    this.showForm.set(true);
  }

  editProduct(product: any): void {
    alert(`Detalle del producto: ${product.name}`);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.draft = { ...this.draft, imageUrl: String(reader.result ?? '') };
    };
    reader.readAsDataURL(file);
  }

  saveProduct(): void {
    const draft = this.draft;
    const product = this.store.createProduct({
      id: `prod-${Date.now()}`,
      name: draft.name || 'Nuevo producto',
      description: draft.description || 'Producto nuevo agregado al catálogo.',
      sku: draft.sku || `SKU-${Date.now()}`,
      barcode: draft.barcode || `750${Date.now().toString().slice(-7)}`,
      teamId: draft.teamId,
      league: draft.league,
      season: draft.season,
      category: draft.category as any,
      imageUrl: draft.imageUrl || this.safeImage(undefined),
      active: true,
      variants: [{
        id: `variant-${Date.now()}`,
        qualityId: draft.qualityId,
        size: draft.size,
        presentation: draft.presentation as any,
        supplierId: draft.supplierId,
        cost: Number(draft.cost) || 0,
        price: Number(draft.price) || 0,
        stock: Number(draft.stock) || 0
      }]
    });

    this.store.addMovement({
      productId: product.id,
      productName: product.name,
      variantId: product.variants[0]?.id ?? '',
      reason: 'Alta de producto',
      type: 'entrada',
      quantity: Number(draft.stock) || 0,
      date: new Date().toISOString(),
      branchId: 'sucursal-1',
      branchName: 'Sucursal Centro',
      unitCost: Number(draft.cost) || 0
    });

    this.showForm.set(false);
    this.draft = {
      name: '',
      description: '',
      sku: '',
      barcode: '',
      teamId: 'tigres',
      league: 'Liga MX',
      season: '2025',
      category: 'Camisetas',
      imageUrl: '',
      qualityId: 'premium',
      size: 'M',
      supplierId: 'prov-1',
      presentation: 'individual',
      cost: 450,
      price: 749,
      stock: 12,
      minStock: 4
    };
  }
}
