import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { DemoStoreService } from '../../core/store.service';
import { CartLine, Product } from '../../models/store-models';

interface ProductSelectionState {
  qualityId: string;
  size: string;
  supplierId: string;
  presentation: string;
  quantity: number;
  unitPrice: number;
  discountValue: number;
  discountType: 'pesos' | 'porcentaje';
  variantId: string;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Punto de venta</p>
        <h1>Ventas rápidas</h1>
      </div>
      <button class="primary-btn" (click)="openCheckout()">Cobrar</button>
    </section>

    <div class="pos-shell">
      <section class="pos-left">
        <div class="search-panel">
          <label class="search-label">Buscar producto</label>
          <input
            class="search-input"
            type="text"
            [value]="search()"
            (input)="search.set($any($event.target).value)"
            placeholder="Escanear código de barras o buscar producto por nombre, SKU o equipo"
          />
        </div>

        <div class="tag-row">
          <button
            *ngFor="let category of categories"
            class="tag-btn"
            [class.active]="selectedCategory() === category"
            (click)="selectedCategory.set(category)"
          >
            {{ category }}
          </button>
        </div>

        <div class="table-wrap">
          <table class="results-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Equipo</th>
                <th>Tipo</th>
                <th>Existencia</th>
                <th>Precio</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of filteredProducts()">
                <td>{{ row.sku }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.team }}</td>
                <td>{{ row.category }}</td>
                <td>{{ row.stock }}</td>
                <td>{{ row.price | currency:'MXN':'symbol':'1.0-0' }}</td>
                <td>
                  <button class="select-btn" (click)="openSelector(row.product)">Seleccionar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="pos-right">
        <div class="cart-header">
          <h3>Carrito</h3>
          <span>{{ cart().length }} artículos</span>
        </div>

        <div class="cart-list">
          <div class="cart-item" *ngFor="let item of cart(); let i = index">
            <div class="cart-item-main">
              <strong>{{ item.productName }}</strong>
              <small>{{ item.teamName ?? '' }} · {{ item.qualityName }} · {{ item.size }} · {{ item.supplierName ?? 'Proveedor' }}</small>
              <small>{{ item.presentation }}</small>
            </div>
            <div class="cart-actions">
              <div class="qty-box">
                <button (click)="changeQuantity(i, -1)">-</button>
                <span>{{ item.quantity }}</span>
                <button (click)="changeQuantity(i, 1)">+</button>
              </div>
              <input type="number" [value]="item.unitPrice" (input)="updateItemPrice(i, $any($event.target).value)" />
              <button class="delete-btn" (click)="removeItem(i)">Eliminar</button>
            </div>
            <div class="item-total">{{ (item.quantity * item.unitPrice) | currency:'MXN':'symbol':'1.0-0' }}</div>
          </div>
        </div>

        <div class="totals-box">
          <div><span>Subtotal</span><strong>{{ subtotal() | currency:'MXN':'symbol':'1.0-0' }}</strong></div>
          <div><span>Descuentos</span><strong>{{ discounts() | currency:'MXN':'symbol':'1.0-0' }}</strong></div>
          <div class="total-row"><span>Total</span><strong>{{ total() | currency:'MXN':'symbol':'1.0-0' }}</strong></div>
        </div>

        <div class="checkout-box">
          <label>
            Cliente
            <input type="text" [value]="clientName()" (input)="clientName.set($any($event.target).value)" />
          </label>
          <label>
            Método de pago
            <select [value]="paymentMethod()" (change)="paymentMethod.set($any($event.target).value)">
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </label>
          <div *ngIf="paymentMethod() === 'Efectivo'" class="cash-row">
            <label>
              Efectivo recibido
              <input type="number" [value]="cashReceived()" (input)="cashReceived.set(+($any($event.target).value || 0))" />
            </label>
            <div class="change-box">
              <span>Cambio</span>
              <strong>{{ cashChange() | currency:'MXN':'symbol':'1.0-0' }}</strong>
            </div>
          </div>
          <button class="primary-btn full" (click)="openCheckout()">Cobrar</button>
        </div>
      </aside>
    </div>

    <div class="modal-backdrop" *ngIf="selectionProduct()">
      <div class="selection-modal">
        <div class="modal-header">
          <div>
            <h3>{{ selectionProduct()?.name }}</h3>
            <small>{{ selectionProduct()?.teamId }} · {{ selectionProduct()?.season }} · {{ selectionProduct()?.category }}</small>
          </div>
          <button class="close-btn" (click)="selectionProduct.set(null)">Cerrar</button>
        </div>

        <div class="modal-grid">
          <div class="selector-block">
            <div class="quality-block">
              <span class="label">Calidad</span>
              <div class="quality-row">
                <button
                  *ngFor="let quality of qualityOptions()"
                  class="quality-btn"
                  [class.active]="selection().qualityId === quality.id"
                  (click)="selectQuality(quality.id)"
                >
                  {{ quality.name }}
                </button>
              </div>
            </div>

            <div class="field-row">
              <label>
                Talla
                <select [value]="selection().size" (change)="selectSize($any($event.target).value)">
                  <option *ngFor="let size of availableSizes()" [value]="size">{{ size }}</option>
                </select>
              </label>
              <label>
                Proveedor
                <select [value]="selection().supplierId" (change)="selectSupplier($any($event.target).value)">
                  <option *ngFor="let supplier of supplierOptions()" [value]="supplier.id">{{ supplier.name }}</option>
                </select>
              </label>
            </div>

            <div class="field-row">
              <label>
                Presentación
                <select [value]="selection().presentation" (change)="setPresentation($any($event.target).value)">
                  <option value="individual">Solo camiseta</option>
                  <option value="kit">Camiseta + short</option>
                  <option value="bundle">Camiseta + medias</option>
                  <option value="full">Conjunto completo</option>
                </select>
              </label>
              <label>
                Cantidad disponible
                <input type="text" [value]="selectedVariantStock()" readonly />
              </label>
            </div>

            <div class="meta-box">
              <div><span>Precio</span><strong>{{ selectedVariantPrice() | currency:'MXN':'symbol':'1.0-0' }}</strong></div>
              <div><span>Existencia real</span><strong>{{ selectedVariantStock() }}</strong></div>
            </div>
          </div>

          <div class="selector-block">
            <label>
              Cantidad
              <input type="number" min="1" [value]="selection().quantity" (input)="updateQuantity($any($event.target).value)" />
            </label>
            <label>
              Precio de venta
              <input type="number" min="0" [value]="selection().unitPrice" (input)="updateUnitPrice($any($event.target).value)" />
            </label>
            <div class="field-row split">
              <label>
                Descuento
                <input type="number" min="0" [value]="selection().discountValue" (input)="updateDiscount($any($event.target).value)" />
              </label>
              <label>
                Tipo
                <select [value]="selection().discountType" (change)="setDiscountType($any($event.target).value)">
                  <option value="pesos">Pesos</option>
                  <option value="porcentaje">Porcentaje</option>
                </select>
              </label>
            </div>
            <div class="total-preview">
              <span>Total estimado</span>
              <strong>{{ estimatedLineTotal() | currency:'MXN':'symbol':'1.0-0' }}</strong>
            </div>
            <button class="primary-btn full" (click)="addSelectionToCart()">Agregar a la venta</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="checkoutOpen()">
      <div class="checkout-modal">
        <div class="modal-header">
          <h3>Confirmar cobro</h3>
          <button class="close-btn" (click)="checkoutOpen.set(false)">Cerrar</button>
        </div>

        <div class="checkout-grid">
          <label>
            Cliente
            <input type="text" [value]="clientName()" (input)="clientName.set($any($event.target).value)" />
          </label>
          <label>
            Método de pago
            <select [value]="paymentMethod()" (change)="paymentMethod.set($any($event.target).value)">
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </label>
          <label *ngIf="paymentMethod() === 'Efectivo'">
            Efectivo recibido
            <input type="number" [value]="cashReceived()" (input)="cashReceived.set(+($any($event.target).value || 0))" />
          </label>
          <div class="change-box">
            <span>Cambio</span>
            <strong>{{ cashChange() | currency:'MXN':'symbol':'1.0-0' }}</strong>
          </div>
        </div>

        <div class="checkout-total">
          <span>Total a cobrar</span>
          <strong>{{ total() | currency:'MXN':'symbol':'1.0-0' }}</strong>
        </div>

        <button class="primary-btn full" (click)="finalizeSale()">Confirmar venta</button>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="lastTicket()">
      <div class="ticket-modal">
        <div class="ticket-shell">
          <div class="ticket-header">
            <h3>Textil Deportivas</h3>
            <p>{{ lastTicket()?.sale?.branchName }}</p>
            <small>Folio {{ lastTicket()?.sale?.folio }}</small>
          </div>

          <div class="ticket-body">
            <div class="ticket-row"><span>Cliente</span><strong>{{ lastTicket()?.sale?.clientName }}</strong></div>
            <div class="ticket-row"><span>Fecha</span><strong>{{ lastTicket()?.sale?.date | date:'dd/MM/yyyy HH:mm' }}</strong></div>
            <div class="ticket-row"><span>Pago</span><strong>{{ lastTicket()?.sale?.paymentMethod }}</strong></div>

            <div *ngFor="let item of lastTicket()?.sale?.items" class="item-row">
              <div>
                <strong>{{ item.productName }}</strong>
                <small>{{ item.qualityName }} · {{ item.size }}</small>
              </div>
              <div class="item-amount">
                <span>{{ item.quantity }} × {{ item.unitPrice | currency:'MXN':'symbol':'1.0-0' }}</span>
                <strong>{{ item.total | currency:'MXN':'symbol':'1.0-0' }}</strong>
              </div>
            </div>

            <div class="ticket-row"><span>Subtotal</span><strong>{{ lastTicket()?.sale?.subtotal | currency:'MXN':'symbol':'1.0-0' }}</strong></div>
            <div class="ticket-row"><span>Descuentos</span><strong>{{ lastTicket()?.sale?.discounts | currency:'MXN':'symbol':'1.0-0' }}</strong></div>
            <div class="ticket-row total"><span>Total</span><strong>{{ lastTicket()?.sale?.total | currency:'MXN':'symbol':'1.0-0' }}</strong></div>
          </div>
        </div>

        <div class="ticket-actions">
          <button class="secondary-btn" (click)="printTicket()">Imprimir</button>
          <button class="secondary-btn" (click)="savePdf()">Guardar PDF</button>
          <button class="secondary-btn" (click)="closeTicket()">Cerrar</button>
          <button class="primary-btn" (click)="newSale()">Nueva venta</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display:block; }
      .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
      .eyebrow { margin:0; text-transform:uppercase; letter-spacing:.08em; color:#64748b; font-size:.72rem; }
      h1 { margin:0.25rem 0 0; font-size:2rem; }
      .primary-btn, .secondary-btn, .select-btn, .close-btn, .quality-btn, .tag-btn, .delete-btn { border:0; border-radius:10px; font-weight:700; }
      .primary-btn { background:#1d4ed8; color:#fff; padding:.8rem 1rem; }
      .secondary-btn { background:#e2e8f0; color:#0f172a; padding:.7rem .9rem; }
      .full { width:100%; }
      .pos-shell { display:grid; grid-template-columns:1.6fr .9fr; gap:1rem; min-height:72vh; }
      .pos-left, .pos-right, .selection-modal, .checkout-modal, .ticket-modal { background:#fff; border:1px solid #e5edf6; border-radius:16px; }
      .pos-left { padding:1rem; display:flex; flex-direction:column; gap:1rem; }
      .search-panel { display:flex; flex-direction:column; gap:.5rem; }
      .search-label { font-size:.8rem; font-weight:700; color:#475569; }
      .search-input, input, select { width:100%; padding:.8rem .9rem; border:1px solid #dfeaf5; border-radius:10px; font-size:.96rem; }
      .tag-row { display:flex; flex-wrap:wrap; gap:.5rem; }
      .tag-btn { background:#f8fafc; color:#334155; border:1px solid #dfeaf5; padding:.55rem .8rem; }
      .tag-btn.active { background:#0f172a; color:#fff; }
      .table-wrap { overflow:auto; border:1px solid #edf2f7; border-radius:12px; }
      .results-table { width:100%; border-collapse:collapse; min-width:780px; }
      .results-table th, .results-table td { padding:.7rem .65rem; border-bottom:1px solid #edf2f7; text-align:left; font-size:.82rem; }
      .results-table th { background:#f8fafc; color:#475569; font-weight:700; }
      .select-btn { background:#dbeafe; color:#1d4ed8; padding:.55rem .7rem; }
      .pos-right { padding:1rem; display:flex; flex-direction:column; }
      .cart-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
      .cart-header h3 { margin:0; }
      .cart-list { display:flex; flex-direction:column; gap:.75rem; overflow:auto; max-height:42vh; }
      .cart-item { display:flex; flex-direction:column; gap:.6rem; padding:.75rem; border:1px solid #edf2f7; border-radius:12px; }
      .cart-item-main { display:flex; flex-direction:column; gap:.15rem; }
      .cart-item-main small { color:#64748b; }
      .cart-actions { display:grid; grid-template-columns:auto 1fr auto; gap:.5rem; align-items:center; }
      .qty-box { display:flex; align-items:center; gap:.4rem; }
      .qty-box button { width:28px; height:28px; border:1px solid #dfeaf5; background:#f8fafc; border-radius:7px; }
      .delete-btn { background:#fee2e2; color:#b91c1c; padding:.5rem .6rem; }
      .item-total { font-weight:700; text-align:right; }
      .totals-box { border-top:1px solid #edf2f7; margin-top:1rem; padding-top:1rem; }
      .totals-box > div, .total-row { display:flex; justify-content:space-between; margin-bottom:.5rem; }
      .total-row { font-size:1.05rem; font-weight:800; }
      .checkout-box { display:flex; flex-direction:column; gap:.75rem; margin-top:1rem; }
      .cash-row { display:flex; flex-direction:column; gap:.5rem; }
      .change-box { display:flex; justify-content:space-between; border-top:1px solid #edf2f7; padding-top:.6rem; }
      .modal-backdrop { position:fixed; inset:0; background:rgba(15,23,42,.45); display:grid; place-items:center; z-index:50; padding:1.2rem; }
      .selection-modal, .checkout-modal { width:min(820px,100%); padding:1rem; }
      .modal-header { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
      .modal-header h3 { margin:0; }
      .modal-header small { color:#64748b; }
      .modal-grid { display:grid; grid-template-columns:1.2fr .9fr; gap:1rem; margin-top:1rem; }
      .selector-block { display:flex; flex-direction:column; gap:1rem; }
      .quality-block { display:flex; flex-direction:column; gap:.6rem; }
      .label { font-weight:700; color:#475569; }
      .quality-row { display:flex; flex-wrap:wrap; gap:.5rem; }
      .quality-btn { background:#f8fafc; border:1px solid #dfeaf5; padding:.65rem .8rem; }
      .quality-btn.active { background:#10254a; color:#fff; }
      .field-row { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
      .split { grid-template-columns:1fr 1fr; }
      .meta-box, .total-preview { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:.8rem; display:flex; justify-content:space-between; }
      .ticket-modal { width:min(420px,100%); padding:1rem; }
      .ticket-shell { border:1px solid #dfeaf5; border-radius:14px; padding:1rem; background:#fff; }
      .ticket-header { text-align:center; margin-bottom:1rem; }
      .ticket-header h3 { margin:0; }
      .ticket-header p, .ticket-header small { color:#64748b; }
      .ticket-body { border-top:1px dashed #cbd5e1; border-bottom:1px dashed #cbd5e1; padding:.8rem 0; display:flex; flex-direction:column; gap:.5rem; }
      .ticket-row { display:flex; justify-content:space-between; }
      .ticket-row.total { font-size:1.05rem; font-weight:800; }
      .item-row { display:flex; justify-content:space-between; gap:1rem; padding:.4rem 0; border-bottom:1px solid #edf2f7; }
      .item-row small { display:block; color:#64748b; }
      .item-amount { text-align:right; }
      .ticket-actions { display:flex; gap:.6rem; justify-content:flex-end; margin-top:1rem; flex-wrap:wrap; }
      .close-btn { background:#ef4444; color:#fff; padding:.7rem .8rem; }
      @media (max-width: 980px) { .pos-shell, .modal-grid { grid-template-columns:1fr; } }
      @media print {
        body { background:#fff !important; }
        .modal-backdrop { display:none !important; }
        .ticket-modal { box-shadow:none !important; border:none !important; }
      }
    `
  ]
})
export class PosComponent {
  private readonly store = inject(DemoStoreService);

  readonly search = signal('');
  readonly selectedCategory = signal('Todos');
  readonly selectionProduct = signal<Product | null>(null);
  readonly selection = signal<ProductSelectionState>({
    qualityId: '',
    size: '',
    supplierId: '',
    presentation: 'individual',
    quantity: 1,
    unitPrice: 0,
    discountValue: 0,
    discountType: 'pesos',
    variantId: ''
  });
  readonly clientName = signal('Público general');
  readonly paymentMethod = signal<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Efectivo');
  readonly cashReceived = signal(0);
  readonly cart = signal<CartLine[]>([]);
  readonly lastTicket = signal<{ sale: any } | null>(null);
  readonly checkoutOpen = signal(false);

  readonly categories = ['Todos', 'Camisetas', 'Uniformes completos', 'Shorts', 'Medias', 'Balones', 'Espinilleras', 'Accesorios'];

  readonly filteredProducts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.store.products()
      .filter((product) => {
        const matchesCategory = category === 'Todos' || product.category === category;
        const teamName = this.store.teams().find((team) => team.id === product.teamId)?.name ?? '';
        const haystack = `${product.name} ${product.sku} ${product.barcode} ${teamName} ${product.category}`.toLowerCase();
        const matchesSearch = !term || haystack.includes(term);
        return matchesCategory && matchesSearch;
      })
      .map((product) => {
        const price = product.variants.length ? Math.min(...product.variants.map((variant) => variant.price)) : 0;
        const stock = product.variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0);
        return {
          product,
          sku: product.sku,
          name: product.name,
          team: this.teamName(product.teamId),
          category: product.category,
          stock,
          price
        };
      });
  });

  readonly subtotal = computed(() => this.cart().reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  readonly discounts = computed(() => this.cart().reduce((sum, item) => sum + item.discount * item.quantity, 0));
  readonly total = computed(() => Math.max(0, this.subtotal() - this.discounts()));
  readonly cashChange = computed(() => Math.max(0, this.cashReceived() - this.total()));

  readonly qualityOptions = computed(() => {
    const product = this.selectionProduct();
    if (!product) {
      return [];
    }

    const qualityIds = Array.from(new Set(product.variants.map((variant) => variant.qualityId)));
    return this.store.qualities().filter((quality) => qualityIds.includes(quality.id));
  });

  readonly availableSizes = computed(() => {
    const product = this.selectionProduct();
    if (!product) {
      return [];
    }

    const qualityId = this.selection().qualityId || this.qualityOptions()[0]?.id;
    const sizes = product.variants
      .filter((variant) => variant.qualityId === qualityId)
      .map((variant) => variant.size);

    return Array.from(new Set(sizes));
  });

  readonly supplierOptions = computed(() => {
    const product = this.selectionProduct();
    if (!product) {
      return [];
    }

    const qualityId = this.selection().qualityId || this.qualityOptions()[0]?.id;
    const size = this.selection().size || this.availableSizes()[0] || '';
    const suppliers = product.variants
      .filter((variant) => variant.qualityId === qualityId && variant.size === size)
      .map((variant) => this.store.suppliers().find((supplier) => supplier.id === variant.supplierId))
      .filter((supplier): supplier is NonNullable<typeof supplier> => Boolean(supplier));

    return Array.from(new Map(suppliers.map((supplier) => [supplier.id, supplier])).values());
  });

  readonly selectedVariant = computed(() => {
    const product = this.selectionProduct();
    if (!product) {
      return null;
    }

    const selection = this.selection();
    return product.variants.find((variant) =>
      variant.qualityId === selection.qualityId &&
      variant.size === selection.size &&
      variant.supplierId === selection.supplierId
    ) ?? product.variants.find((variant) => variant.qualityId === selection.qualityId && variant.size === selection.size) ?? product.variants[0] ?? null;
  });

  readonly selectedVariantStock = computed(() => Number(this.selectedVariant()?.stock ?? 0));
  readonly selectedVariantPrice = computed(() => Number(this.selectedVariant()?.price ?? 0));

  readonly estimatedLineTotal = computed(() => {
    const selection = this.selection();
    const discount = selection.discountType === 'porcentaje'
      ? selection.unitPrice * selection.quantity * (selection.discountValue / 100)
      : selection.discountValue * selection.quantity;
    return Math.max(0, selection.unitPrice * selection.quantity - discount);
  });

  openSelector(product: Product): void {
    const qualityId = this.store.qualities().find((quality) => product.variants.some((variant) => variant.qualityId === quality.id))?.id ?? product.variants[0]?.qualityId ?? '';
    const size = product.variants.find((variant) => variant.qualityId === qualityId)?.size ?? product.variants[0]?.size ?? '';
    const supplierId = product.variants.find((variant) => variant.qualityId === qualityId && variant.size === size)?.supplierId ?? product.variants[0]?.supplierId ?? '';
    const variant = product.variants.find((entry) => entry.qualityId === qualityId && entry.size === size && entry.supplierId === supplierId) ?? product.variants[0];

    this.selectionProduct.set(product);
    this.selection.set({
      qualityId,
      size: size || 'M',
      supplierId: supplierId || variant?.supplierId || '',
      presentation: 'individual',
      quantity: 1,
      unitPrice: Number(variant?.price ?? 0),
      discountValue: 0,
      discountType: 'pesos',
      variantId: variant?.id ?? ''
    });
  }

  openCheckout(): void {
    if (!this.cart().length) {
      window.alert('Agrega productos al carrito antes de cobrar.');
      return;
    }
    this.checkoutOpen.set(true);
  }

  selectQuality(qualityId: string): void {
    const product = this.selectionProduct();
    if (!product) {
      return;
    }

    const nextVariant = product.variants.find((variant) => variant.qualityId === qualityId) ?? product.variants[0];
    const nextSelection = {
      ...this.selection(),
      qualityId,
      size: nextVariant?.size ?? '',
      supplierId: nextVariant?.supplierId ?? '',
      unitPrice: Number(nextVariant?.price ?? 0),
      variantId: nextVariant?.id ?? ''
    };

    this.selection.set(nextSelection);
  }

  selectSize(size: string): void {
    const product = this.selectionProduct();
    if (!product) {
      return;
    }

    const qualityId = this.selection().qualityId || this.qualityOptions()[0]?.id;
    const nextVariant = product.variants.find((variant) => variant.qualityId === qualityId && variant.size === size) ?? product.variants[0];
    this.selection.set({
      ...this.selection(),
      size,
      supplierId: nextVariant?.supplierId ?? '',
      unitPrice: Number(nextVariant?.price ?? 0),
      variantId: nextVariant?.id ?? ''
    });
  }

  selectSupplier(supplierId: string): void {
    const product = this.selectionProduct();
    if (!product) {
      return;
    }

    const qualityId = this.selection().qualityId || this.qualityOptions()[0]?.id;
    const size = this.selection().size || this.availableSizes()[0] || '';
    const nextVariant = product.variants.find((variant) => variant.qualityId === qualityId && variant.size === size && variant.supplierId === supplierId) ?? product.variants[0];
    this.selection.set({
      ...this.selection(),
      supplierId,
      unitPrice: Number(nextVariant?.price ?? 0),
      variantId: nextVariant?.id ?? ''
    });
  }

  updateQuantity(value: string): void {
    const quantity = Math.max(1, Number(value) || 1);
    this.selection.set({ ...this.selection(), quantity: Math.min(quantity, Number(this.selectedVariantStock() || 1)) });
  }

  updateUnitPrice(value: string): void {
    this.selection.set({ ...this.selection(), unitPrice: Math.max(0, Number(value) || 0) });
  }

  updateDiscount(value: string): void {
    this.selection.set({ ...this.selection(), discountValue: Math.max(0, Number(value) || 0) });
  }

  setPresentation(value: string): void {
    this.selection.set({ ...this.selection(), presentation: value });
  }

  setDiscountType(value: 'pesos' | 'porcentaje'): void {
    this.selection.set({ ...this.selection(), discountType: value });
  }

  addSelectionToCart(): void {
    const product = this.selectionProduct();
    const selection = this.selection();
    const variant = this.selectedVariant();
    if (!product || !variant) {
      return;
    }

    if (selection.quantity > variant.stock) {
      window.alert('No se puede vender más unidades de las disponibles.');
      return;
    }

    const discountAmount = selection.discountType === 'porcentaje'
      ? selection.unitPrice * selection.quantity * (selection.discountValue / 100)
      : selection.discountValue * selection.quantity;

    const existingIndex = this.cart().findIndex((item) =>
      item.productId === product.id &&
      item.variantId === variant.id &&
      item.qualityName === this.store.getQualityName(variant.qualityId) &&
      item.size === variant.size &&
      item.presentation === selection.presentation
    );

    const supplierName = this.store.suppliers().find((supplier) => supplier.id === variant.supplierId)?.name ?? 'Proveedor';
    const baseLine: CartLine = {
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      qualityName: this.store.getQualityName(variant.qualityId),
      size: variant.size,
      supplierName,
      quantity: selection.quantity,
      unitPrice: selection.unitPrice,
      originalUnitPrice: variant.price,
      discount: discountAmount,
      discountPercentage: selection.discountType === 'porcentaje' ? selection.discountValue : 0,
      presentation: selection.presentation,
      imageUrl: product.imageUrl,
      teamName: this.store.teams().find((team) => team.id === product.teamId)?.name ?? product.teamId
    } as CartLine;

    if (existingIndex >= 0) {
      const next = [...this.cart()];
      const existing = next[existingIndex];
      next[existingIndex] = { ...existing, quantity: existing.quantity + selection.quantity, unitPrice: selection.unitPrice, discount: discountAmount, discountPercentage: selection.discountType === 'porcentaje' ? selection.discountValue : 0 };
      this.cart.set(next);
    } else {
      this.cart.set([...this.cart(), baseLine]);
    }

    this.selectionProduct.set(null);
  }

  updateItemPrice(index: number, value: string): void {
    const price = Number(value) || 0;
    this.cart.set(this.cart().map((item, itemIndex) => itemIndex === index ? { ...item, unitPrice: Math.max(0, price) } : item));
  }

  changeQuantity(index: number, delta: number): void {
    const next = this.cart().map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item);
    this.cart.set(next.filter((item) => item.quantity > 0));
  }

  removeItem(index: number): void {
    this.cart.set(this.cart().filter((_, itemIndex) => itemIndex !== index));
  }

  finalizeSale(): void {
    const items = this.cart();
    if (!items.length) {
      return;
    }

    try {
      const sale = this.store.recordSale(items, this.clientName() || 'Público general', this.paymentMethod(), 'Cajero POS');
      this.lastTicket.set({ sale });
      this.checkoutOpen.set(false);
      this.cart.set([]);
      this.cashReceived.set(0);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo completar la venta.');
    }
  }

  printTicket(): void {
    window.print();
  }

  savePdf(): void {
    window.print();
  }

  closeTicket(): void {
    this.lastTicket.set(null);
    this.cashReceived.set(0);
  }

  newSale(): void {
    this.closeTicket();
    this.cart.set([]);
    this.clientName.set('Público general');
    this.paymentMethod.set('Efectivo');
    this.cashReceived.set(0);
  }

  private teamName(teamId: string): string {
    return this.store.teams().find((team) => team.id === teamId)?.name ?? teamId;
  }
}
