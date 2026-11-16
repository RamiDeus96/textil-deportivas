import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DemoStoreService } from '../../core/store.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Resumen operativo</p>
        <h1>Dashboard</h1>
      </div>
      <button class="primary-btn">Exportar</button>
    </section>

    <div class="stats-grid">
      <article class="stat-card accent">
        <span>Ventas del día</span>
        <strong>{{ summary.ventasDia | currency:'MXN':'symbol':'1.0-0' }}</strong>
        <small>{{ summary.operaciones }} operaciones</small>
      </article>
      <article class="stat-card">
        <span>Ventas del mes</span>
        <strong>{{ summary.ventasMes | currency:'MXN':'symbol':'1.0-0' }}</strong>
        <small>Actualizado</small>
      </article>
      <article class="stat-card">
        <span>Operaciones</span>
        <strong>{{ summary.operaciones }}</strong>
        <small>{{ summary.unidadesVendidas }} unidades</small>
      </article>
      <article class="stat-card">
        <span>Ticket promedio</span>
        <strong>{{ summary.ticketPromedio | currency:'MXN':'symbol':'1.0-0' }}</strong>
        <small>Promedio por venta</small>
      </article>
    </div>

    <div class="content-grid">
      <div class="panel span-2">
        <div class="panel-header">
          <h3>Ventas por mes</h3>
          <span class="chip green">Datos reales</span>
        </div>
        <div class="bars">
          <div class="bar-group" *ngFor="let point of monthlyChart">
            <div class="bar" [style.height.%]="point.value"></div>
            <small>{{ point.label }}</small>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>Productos con bajo inventario</h3>
        </div>
        <ul class="list compact">
          <li *ngFor="let item of lowInventoryProducts">
            <span>{{ item.productName }}</span>
            <strong>{{ item.stock }}</strong>
          </li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>Uniformes más vendidos</h3>
        </div>
        <ul class="list">
          <li *ngFor="let item of topProducts">
            <span>{{ item.name }}</span>
            <strong>{{ item.qty }} uds.</strong>
          </li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>Equipos más vendidos</h3>
        </div>
        <ul class="list">
          <li *ngFor="let item of topTeams">
            <span>{{ item.name }}</span>
            <strong>{{ item.value }}</strong>
          </li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>Métodos de pago</h3>
        </div>
        <ul class="list">
          <li *ngFor="let item of paymentBreakdown">
            <span>{{ item.method }}</span>
            <strong>{{ item.value }}</strong>
          </li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>Promociones más usadas</h3>
        </div>
        <ul class="list">
          <li *ngFor="let item of promotionsUsed">
            <span>{{ item.name }}</span>
            <strong>{{ item.uses }}</strong>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display:block; }
      .page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem; }
      .eyebrow { margin:0; text-transform:uppercase; letter-spacing:.08em; color:#64748b; font-size:.72rem; }
      h1 { margin:0.25rem 0 0; font-size:2.1rem; }
      .primary-btn { border:0; border-radius:12px; background:#16a34a; color:white; padding:.8rem 1.1rem; font-weight:600; }
      .stats-grid { display:grid; grid-template-columns:repeat(4, minmax(180px,1fr)); gap:1rem; margin-bottom:1.25rem; }
      .stat-card { background:#fff; border:1px solid #e5edf6; border-radius:16px; padding:1rem 1.1rem; box-shadow:0 12px 28px rgba(15,23,42,.04); }
      .stat-card.accent { background:linear-gradient(135deg, #1d4ed8, #1e3a8a); color:#fff; }
      .stat-card span, .stat-card small { display:block; color:inherit; opacity:.86; }
      .stat-card strong { display:block; margin:.5rem 0; font-size:1.8rem; }
      .content-grid { display:grid; grid-template-columns:repeat(3, minmax(220px,1fr)); gap:1rem; }
      .panel { background:#fff; border:1px solid #e5edf6; border-radius:16px; padding:1rem; }
      .panel.span-2 { grid-column:span 2; }
      .panel-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
      .chip { display:inline-flex; padding:.25rem .55rem; border-radius:999px; font-size:.7rem; }
      .chip.green { background:#eaf7ee; color:#166534; }
      .bars { display:flex; align-items:flex-end; gap:.75rem; height:190px; }
      .bar-group { display:flex; flex-direction:column; align-items:center; gap:.5rem; flex:1; }
      .bar { width:100%; max-width:46px; background:linear-gradient(180deg,#3b82f6,#1d4ed8); border-radius:12px 12px 0 0; min-height:20px; }
      .list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:.65rem; }
      .list li { display:flex; align-items:center; justify-content:space-between; padding:.5rem 0; border-bottom:1px solid #edf2f7; }
      .list li:last-child { border-bottom:none; }
      .list.compact li { padding:.3rem 0; }
      @media (max-width: 980px) { .stats-grid, .content-grid { grid-template-columns:1fr 1fr; } .panel.span-2 { grid-column:span 2; } }
      @media (max-width: 700px) { .stats-grid, .content-grid { grid-template-columns:1fr; } .panel.span-2 { grid-column:auto; } }
    `
  ]
})
export class DashboardComponent {
  private readonly store = inject(DemoStoreService);

  readonly summary = this.store.dashboardSummary();

  readonly lowInventoryProducts = this.store.products().flatMap((product) =>
    product.variants.map((variant) => ({
      productName: `${product.name} / ${this.store.getQualityName(variant.qualityId)}`,
      stock: variant.stock
    }))
  ).filter((item) => item.stock <= 5).slice(0, 5);

  readonly topProducts = Array.from(
    this.store.sales()
      .flatMap((sale) => sale.items)
      .reduce((map, item) => {
        const key = item.productName;
        map.set(key, (map.get(key) ?? 0) + item.quantity);
        return map;
      }, new Map<string, number>())
      .entries()
  ).map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  readonly topTeams = this.store.getTopSellingTeams();

  readonly paymentBreakdown = Object.entries(this.store.sales().reduce((map, sale) => {
    map[sale.paymentMethod] = (map[sale.paymentMethod] ?? 0) + sale.total;
    return map;
  }, {} as Record<string, number>)).map(([method, value]) => ({ method, value }));

  readonly promotionsUsed = this.store.promotions().map((promo) => ({
    name: promo.name,
    uses: this.store.sales().filter((sale) => sale.items.some((item) => item.productName.toLowerCase().includes(promo.name.toLowerCase().split(' ')[0]))).length || 0
  })).slice(0, 5);

  readonly monthlyChart = this.store.dashboardSummary().ventasPorMes ?? [
    { label: 'Ene', value: 0 },
    { label: 'Feb', value: 0 },
    { label: 'Mar', value: 0 },
    { label: 'Abr', value: 0 },
    { label: 'May', value: 0 },
    { label: 'Jun', value: 0 },
    { label: 'Jul', value: 0 },
    { label: 'Ago', value: 0 },
    { label: 'Sep', value: 0 },
    { label: 'Oct', value: 0 }
  ];
}
