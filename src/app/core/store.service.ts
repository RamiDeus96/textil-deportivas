import { computed, Injectable, signal } from '@angular/core';

import { initialState } from '../mock-data/demo-data';
import { CartLine, InventoryMovement, Product, ProductVariant, Sale, StoreState } from '../models/store-models';

@Injectable({ providedIn: 'root' })
export class DemoStoreService {
  private readonly STORAGE_KEY = 'textil-deportivas-demo-v1';

  readonly state = signal<StoreState>(this.loadState());

  readonly products = computed(() => this.state().products);
  readonly sales = computed(() => this.state().sales);
  readonly promotions = computed(() => this.state().promotions);
  readonly qualities = computed(() => this.state().qualities);
  readonly suppliers = computed(() => this.state().suppliers);
  readonly teams = computed(() => this.state().teams);
  readonly inventoryMovements = computed(() => this.state().inventoryMovements);

  readonly dashboardSummary = computed(() => {
    const sales = this.state().sales;
    const today = new Date();
    const todaysSales = sales.filter((sale) => new Date(sale.date).toDateString() === today.toDateString());
    const monthSales = sales.filter((sale) => new Date(sale.date).getMonth() === today.getMonth() && new Date(sale.date).getFullYear() === today.getFullYear());
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const monthTotal = monthSales.reduce((sum, sale) => sum + sale.total, 0);
    const ticketAverage = sales.length ? totalSales / sales.length : 0;
    const totalUnits = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const inventoryLow = this.state().products.flatMap((product) => product.variants).filter((variant) => variant.stock <= 5).length;

    return {
      ventasDia: todaysSales.reduce((sum, sale) => sum + sale.total, 0),
      ventasMes: monthTotal,
      operaciones: sales.length,
      ticketPromedio: ticketAverage,
      utilidadBruta: sales.reduce((sum, sale) => sum + sale.total * 0.31, 0),
      inventarioBajo: inventoryLow,
      unidadesVendidas: totalUnits,
      productosActivos: this.state().products.filter((product) => product.active).length,
      ventasPorMes: this.getMonthlySalesChart()
    };
  });

  private normalizeState(raw: unknown): StoreState {
    const base = structuredClone(initialState);
    if (!raw || typeof raw !== 'object') {
      return base;
    }

    const candidate = raw as Partial<StoreState> & { products?: Array<{ variants?: ProductVariant[] }> };
    const products = Array.isArray(candidate.products)
      ? candidate.products.map((product) => ({
          ...base.products.find((baseProduct) => baseProduct.id === product.id) ?? product,
          ...product,
          variants: Array.isArray(product.variants)
            ? product.variants.map((variant) => ({
                ...variant,
                stock: Number.isFinite(Number(variant.stock)) ? Number(variant.stock) : 0
              }))
            : []
        }))
      : base.products;

    if (!products.length) {
      return base;
    }

    return {
      ...base,
      ...candidate,
      products,
      sales: Array.isArray(candidate.sales) ? candidate.sales : base.sales,
      promotions: Array.isArray(candidate.promotions) ? candidate.promotions : base.promotions,
      inventoryMovements: Array.isArray(candidate.inventoryMovements) ? candidate.inventoryMovements : base.inventoryMovements
    };
  }

  private loadState(): StoreState {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      return structuredClone(initialState);
    }

    try {
      const parsed = JSON.parse(raw) as StoreState;
      return this.normalizeState(parsed);
    } catch {
      return structuredClone(initialState);
    }
  }

  private persist(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state()));
  }

  private getMonthlySalesChart(): { label: string; value: number }[] {
    const map = new Map<string, number>();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    for (const sale of this.state().sales) {
      const monthIndex = new Date(sale.date).getMonth();
      const label = months[monthIndex] ?? 'Otro';
      map.set(label, (map.get(label) ?? 0) + sale.total);
    }
    return months.map((label) => ({ label, value: map.get(label) ?? 0 })).slice(0, 10);
  }

  resetDemoData(): void {
    this.state.set(structuredClone(initialState));
    this.persist();
  }

  getProductById(productId: string): Product | undefined {
    return this.state().products.find((product) => product.id === productId);
  }

  getQualityName(qualityId: string): string {
    return this.state().qualities.find((quality) => quality.id === qualityId)?.name ?? 'Sin calidad';
  }

  createProduct(input: Partial<Product> & { variants?: ProductVariant[] }): Product {
    const state = this.state();
    const productId = input.id ?? `product-${Date.now()}`;
    const product: Product = {
      id: productId,
      sku: input.sku ?? `SKU-${Date.now()}`,
      barcode: input.barcode ?? `750${Math.floor(Math.random() * 9000000 + 1000000)}`,
      name: input.name ?? 'Nuevo producto',
      description: input.description ?? '',
      teamId: input.teamId ?? state.teams[0]?.id ?? 'mexico',
      league: input.league ?? 'Liga MX',
      season: input.season ?? new Date().getFullYear().toString(),
      category: input.category ?? 'Camisetas',
      imageUrl: input.imageUrl ?? '',
      active: input.active ?? true,
      variants: input.variants ?? []
    };

    state.products = [product, ...state.products];
    this.state.set({ ...state });
    this.persist();
    return product;
  }

  addMovement(movement: Omit<InventoryMovement, 'id'>): void {
    const next = this.state();
    next.inventoryMovements = [
      {
        ...movement,
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
      },
      ...next.inventoryMovements
    ];
    this.state.set({ ...next });
    this.persist();
  }

  recordSale(cart: CartLine[], clientName: string, paymentMethod: Sale['paymentMethod'], cashier = 'Cajero demo'): Sale {
    const nextState = this.state();
    const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discounts = cart.reduce((sum, item) => sum + item.discount * item.quantity, 0);
    const total = Math.max(0, subtotal - discounts);

    for (const item of cart) {
      const product = nextState.products.find((entry) => entry.id === item.productId);
      const variant = product?.variants.find((entry) => entry.id === item.variantId);
      if (!product || !variant || variant.stock < item.quantity) {
        throw new Error(`Inventario insuficiente para ${product?.name ?? item.productName}`);
      }
    }

    const sale: Sale = {
      id: `sale-${Date.now()}`,
      folio: `TD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      branchId: 'sucursal-1',
      branchName: 'Sucursal Centro',
      clientName: clientName || 'Público general',
      cashier,
      paymentMethod,
      subtotal,
      discounts,
      total,
      items: cart.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        qualityName: item.qualityName,
        size: item.size,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.quantity * item.unitPrice - item.discount * item.quantity
      }))
    };

    for (const item of cart) {
      const product = nextState.products.find((entry) => entry.id === item.productId);
      const variant = product?.variants.find((entry) => entry.id === item.variantId);
      if (!product || !variant) continue;

      variant.stock -= item.quantity;
      nextState.inventoryMovements = [{
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        productId: product.id,
        productName: product.name,
        variantId: variant.id,
        reason: 'Venta POS',
        type: 'venta',
        quantity: item.quantity,
        date: new Date().toISOString(),
        branchId: 'sucursal-1',
        branchName: 'Sucursal Centro',
        unitCost: variant.cost
      }, ...nextState.inventoryMovements];
    }

    nextState.sales = [sale, ...nextState.sales];
    this.state.set({ ...nextState });
    this.persist();
    return sale;
  }

  separateBundle(productId: string, variantId: string, quantity: number): void {
    const next = this.state();
    const product = next.products.find((entry) => entry.id === productId);
    const variant = product?.variants.find((entry) => entry.id === variantId);
    if (!product || !variant || variant.stock < quantity) {
      return;
    }

    variant.stock = Math.max(0, variant.stock - quantity);
    const pieceVariants = product.variants.filter((entry) => entry.presentation !== 'kit' && entry.presentation !== 'bundle');
    if (pieceVariants.length) {
      const piece = pieceVariants[0];
      piece.stock += quantity;
    }

    next.inventoryMovements = [{
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      reason: 'Separación de conjunto',
      type: 'separacion',
      quantity,
      date: new Date().toISOString(),
      branchId: 'sucursal-1',
      branchName: 'Sucursal Centro',
      unitCost: variant.cost
    }, ...next.inventoryMovements];

    this.state.set({ ...next });
    this.persist();
  }

  adjustInventory(productId: string, variantId: string, quantity: number, reason: string): void {
    const next = this.state();
    const product = next.products.find((entry) => entry.id === productId);
    const variant = product?.variants.find((entry) => entry.id === variantId);
    if (!product || !variant) {
      return;
    }

    variant.stock = Math.max(0, variant.stock + quantity);
    next.inventoryMovements = [{
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      reason,
      type: 'ajuste',
      quantity: Math.abs(quantity),
      date: new Date().toISOString(),
      branchId: 'sucursal-1',
      branchName: 'Sucursal Centro',
      unitCost: variant.cost
    }, ...next.inventoryMovements];

    this.state.set({ ...next });
    this.persist();
  }

  getTotalDiscounts(): number {
    return this.state().sales.reduce((sum, sale) => sum + sale.discounts, 0);
  }

  getTopSellingTeams(): Array<{ name: string; value: number }> {
    const map = new Map<string, number>();
    for (const sale of this.state().sales) {
      for (const item of sale.items) {
        const product = this.getProductById(item.productId);
        const teamName = this.state().teams.find((team) => team.id === product?.teamId)?.name ?? 'General';
        map.set(teamName, (map.get(teamName) ?? 0) + item.quantity);
      }
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }
}
