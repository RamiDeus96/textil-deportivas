import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { DemoStoreService } from '../../core/store.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Inventario</p>
        <h1>Control de existencias</h1>
      </div>
      <button class="primary-btn" (click)="applyExampleAdjustment()">Ajuste de prueba</button>
    </section>

    <div class="toolbar grid">
      <select><option>Todos</option></select>
      <select><option>Calidad</option></select>
      <select><option>Talla</option></select>
      <select><option>Proveedor</option></select>
      <button class="secondary-btn">Separar conjunto</button>
    </div>

    <div class="table-panel">
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Calidad</th>
            <th>Talla</th>
            <th>Sucursal</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of rows()">
            <td>{{ row.productName }}</td>
            <td>{{ row.quality }}</td>
            <td>{{ row.size }}</td>
            <td>{{ row.branch }}</td>
            <td>
              <span [class.low]="row.stock <= 5">{{ row.stock }}</span>
            </td>
            <td>{{ row.price | currency:'MXN':'symbol':'1.0-0' }}</td>
            <td>
              <button class="mini-btn" (click)="adjust(row.productId, row.variantId, -1, 'Ajuste manual')">-1</button>
              <button class="mini-btn green" (click)="adjust(row.productId, row.variantId, 1, 'Reposición inventario')">+1</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      :host { display:block; }
      .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; }
      .eyebrow { margin:0; text-transform:uppercase; letter-spacing:.08em; color:#64748b; font-size:.72rem; }
      h1 { margin:.2rem 0 0; font-size:2.1rem; }
      .primary-btn, .secondary-btn, .mini-btn { border:0; border-radius:10px; padding:.7rem .9rem; font-weight:600; }
      .primary-btn { background:#16a34a; color:white; }
      .secondary-btn { background:#0f172a; color:#fff; }
      .grid { display:grid; grid-template-columns:repeat(5, minmax(120px,1fr)); gap:1rem; margin:1rem 0; }
      select { border:1px solid #dfeaf5; border-radius:12px; padding:.8rem; }
      .table-panel { background:#fff; border:1px solid #e5edf6; border-radius:16px; overflow:hidden; }
      table { width:100%; border-collapse:collapse; }
      th, td { padding:1rem .9rem; border-bottom:1px solid #edf2f7; text-align:left; }
      th { background:#f8fafc; color:#334155; font-size:.75rem; text-transform:uppercase; letter-spacing:.06em; }
      .low { color:#b91c1c; font-weight:700; }
      .mini-btn { background:#f1f5f9; color:#0f172a; margin-right:.5rem; }
      .mini-btn.green { background:#eaf7ee; color:#166534; }
      @media (max-width: 700px) { .grid { grid-template-columns:1fr; } }
    `
  ]
})
export class InventarioComponent {
  private readonly store = inject(DemoStoreService);

  readonly rows = computed(() =>
    this.store.products().flatMap((product) =>
      product.variants.map((variant) => ({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        quality: this.store.getQualityName(variant.qualityId),
        size: variant.size,
        stock: variant.stock,
        branch: 'Sucursal Centro',
        price: variant.price
      }))
    ).slice(0, 12)
  );

  applyExampleAdjustment(): void {
    const first = this.store.products()[0]?.variants[0];
    if (!first) return;
    this.store.adjustInventory(this.store.products()[0].id, first.id, 4, 'Ajuste de demostración');
  }

  adjust(productId: string, variantId: string, quantity: number, reason: string): void {
    this.store.adjustInventory(productId, variantId, quantity, reason);
  }
}
