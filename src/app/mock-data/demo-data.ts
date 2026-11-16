import { Product, Promotion, Quality, StoreState, Supplier, Team } from '../models/store-models';

const makeProductArt = (label: string, bg1: string, bg2: string): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#g)"/>
      <rect x="140" y="130" width="520" height="520" rx="34" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.28)"/>
      <circle cx="400" cy="310" r="120" fill="rgba(255,255,255,0.18)"/>
      <path d="M280 500c35-75 110-120 160-120s118 41 164 120" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="22" stroke-linecap="round"/>
      <text x="400" y="640" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="white" letter-spacing="2">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const teams: Team[] = [
  { id: 'tigres', name: 'Tigres UANL', shortName: 'TIG', country: 'México', league: 'Liga MX' },
  { id: 'rayados', name: 'Rayados de Monterrey', shortName: 'MTY', country: 'México', league: 'Liga MX' },
  { id: 'america', name: 'Club América', shortName: 'AME', country: 'México', league: 'Liga MX' },
  { id: 'chivas', name: 'Chivas', shortName: 'CHI', country: 'México', league: 'Liga MX' },
  { id: 'pumas', name: 'Pumas UNAM', shortName: 'PUM', country: 'México', league: 'Liga MX' },
  { id: 'cruz-azul', name: 'Cruz Azul', shortName: 'CAZ', country: 'México', league: 'Liga MX' },
  { id: 'real-madrid', name: 'Real Madrid', shortName: 'RMA', country: 'España', league: 'LaLiga' },
  { id: 'barcelona', name: 'Barcelona', shortName: 'BAR', country: 'España', league: 'LaLiga' },
  { id: 'liverpool', name: 'Liverpool', shortName: 'LIV', country: 'Inglaterra', league: 'Premier League' },
  { id: 'mcity', name: 'Manchester City', shortName: 'MCI', country: 'Inglaterra', league: 'Premier League' },
  { id: 'mexico', name: 'Selección Mexicana', shortName: 'MEX', country: 'México', league: 'Selección' },
  { id: 'argentina', name: 'Selección Argentina', shortName: 'ARG', country: 'Argentina', league: 'Selección' }
];

const qualities: Quality[] = [
  { id: 'econ', name: 'Económica', code: 'ECO' },
  { id: 'premium', name: 'Premium', code: 'PRE' },
  { id: 'jugador', name: 'Versión Jugador', code: 'JUG' }
];

const suppliers: Supplier[] = [
  { id: 'prov-1', name: 'Sportline México', contact: 'Ana Torres', phone: '555-101-1111', email: 'ana@sportline.mx', qualityIds: ['econ', 'premium'] },
  { id: 'prov-2', name: 'Elite Wear', contact: 'Luis García', phone: '555-202-2222', email: 'ventas@elitewear.com', qualityIds: ['premium', 'jugador'] },
  { id: 'prov-3', name: 'Liga Pro Supply', contact: 'María López', phone: '555-303-3333', email: 'marial@ligaprosupply.com', qualityIds: ['econ', 'jugador'] }
];

const productBase: Omit<Product, 'variants'>[] = [
  {
    id: 'prod-tigres-home',
    sku: 'TD-001',
    barcode: '750000000001',
    name: 'Camiseta Tigres UANL Local 2025',
    description: 'Camiseta local oficial de Tigres UANL con tecnología transpirable.',
    teamId: 'tigres',
    league: 'Liga MX',
    season: '2025',
    category: 'Camisetas',
    imageUrl: makeProductArt('TIG', '#0f172a', '#1d4ed8'),
    active: true
  },
  {
    id: 'prod-rayados-away',
    sku: 'TD-002',
    barcode: '750000000002',
    name: 'Camiseta Rayados Visitante 2025',
    description: 'Uniforme visitante de Rayados con acabado premium.',
    teamId: 'rayados',
    league: 'Liga MX',
    season: '2025',
    category: 'Camisetas',
    imageUrl: makeProductArt('MTY', '#1e293b', '#0ea5e9'),
    active: true
  },
  {
    id: 'prod-america-third',
    sku: 'TD-003',
    barcode: '750000000003',
    name: 'Camiseta América Tercera 2025',
    description: 'Tercera equipación del Club América con detalle premium.',
    teamId: 'america',
    league: 'Liga MX',
    season: '2025',
    category: 'Camisetas',
    imageUrl: makeProductArt('AME', '#d97706', '#7c2d12'),
    active: true
  },
  {
    id: 'prod-real-home',
    sku: 'TD-004',
    barcode: '750000000004',
    name: 'Camiseta Real Madrid Local 2025',
    description: 'Jersey oficial de Real Madrid para temporada 2025.',
    teamId: 'real-madrid',
    league: 'LaLiga',
    season: '2025',
    category: 'Camisetas',
    imageUrl: makeProductArt('RMA', '#d1d5db', '#1f2937'),
    active: true
  },
  {
    id: 'prod-barca-home',
    sku: 'TD-005',
    barcode: '750000000005',
    name: 'Camiseta Barcelona Local 2025',
    description: 'Uniforme local de Barcelona listo para la temporada.',
    teamId: 'barcelona',
    league: 'LaLiga',
    season: '2025',
    category: 'Camisetas',
    imageUrl: makeProductArt('BAR', '#00b7eb', '#004d99'),
    active: true
  },
  {
    id: 'prod-mex-home',
    sku: 'TD-006',
    barcode: '750000000006',
    name: 'Selección Mexicana Local 2025',
    description: 'Camiseta de la Selección Mexicana en edición premium.',
    teamId: 'mexico',
    league: 'Selección',
    season: '2025',
    category: 'Camisetas',
    imageUrl: makeProductArt('MEX', '#0f766e', '#14532d'),
    active: true
  },
  {
    id: 'prod-kit-tigres',
    sku: 'TD-007',
    barcode: '750000000007',
    name: 'Set Tigres + Short',
    description: 'Kit completo de Tigres con camiseta y short.',
    teamId: 'tigres',
    league: 'Liga MX',
    season: '2025',
    category: 'Uniformes completos',
    imageUrl: makeProductArt('KIT', '#0f172a', '#22c55e'),
    active: true
  },
  {
    id: 'prod-ball-pro',
    sku: 'TD-008',
    barcode: '750000000008',
    name: 'Balón de Fútbol Pro',
    description: 'Balón oficial de entrenamiento en tejido resistente.',
    teamId: 'mcity',
    league: 'Premier League',
    season: '2025',
    category: 'Balones',
    imageUrl: makeProductArt('BAL', '#1d4ed8', '#2563eb'),
    active: true
  },
  {
    id: 'prod-shorts-rayados',
    sku: 'TD-009',
    barcode: '750000000009',
    name: 'Short Rayados',
    description: 'Short oficial de Rayados con cintura ajustable.',
    teamId: 'rayados',
    league: 'Liga MX',
    season: '2025',
    category: 'Shorts',
    imageUrl: makeProductArt('SHORT', '#1f2937', '#38bdf8'),
    active: true
  },
  {
    id: 'prod-socks-mexico',
    sku: 'TD-010',
    barcode: '750000000010',
    name: 'Medias Selección Mexicana',
    description: 'Medias deportivas de compresión para entrenamiento.',
    teamId: 'mexico',
    league: 'Selección',
    season: '2025',
    category: 'Medias',
    imageUrl: makeProductArt('MED', '#0f766e', '#14b8a6'),
    active: true
  }
];

const buildVariants = (product: Omit<Product, 'variants'>): Product['variants'] => [
  { id: `${product.id}-eco-S`, qualityId: 'econ', size: 'S', presentation: 'individual', supplierId: 'prov-1', cost: 320, price: 499, stock: 12 },
  { id: `${product.id}-eco-M`, qualityId: 'econ', size: 'M', presentation: 'individual', supplierId: 'prov-1', cost: 320, price: 499, stock: 14 },
  { id: `${product.id}-eco-L`, qualityId: 'econ', size: 'L', presentation: 'individual', supplierId: 'prov-1', cost: 320, price: 499, stock: 9 },
  { id: `${product.id}-pre-M`, qualityId: 'premium', size: 'M', presentation: 'individual', supplierId: 'prov-2', cost: 430, price: 749, stock: 6 },
  { id: `${product.id}-pre-L`, qualityId: 'premium', size: 'L', presentation: 'individual', supplierId: 'prov-2', cost: 430, price: 749, stock: 7 },
  { id: `${product.id}-jug-L`, qualityId: 'jugador', size: 'L', presentation: 'individual', supplierId: 'prov-3', cost: 560, price: 989, stock: 4 },
  { id: `${product.id}-kit-M`, qualityId: 'premium', size: 'M', presentation: 'kit', supplierId: 'prov-2', cost: 820, price: 1399, stock: 3 }
];

const products: Product[] = productBase.map((product) => ({
  ...product,
  variants: buildVariants(product)
}));

const promotions: Promotion[] = [
  {
    id: 'promo-2x1',
    name: '2x1 en accesorios',
    description: 'Compra dos accesorios y lleva el segundo con descuento del 100%.',
    kind: '2x1',
    active: true,
    applicableTeams: ['all'],
    applicableCategories: ['Accesorios'],
    priority: 10,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    usageLimit: 20
  },
  {
    id: 'promo-3x2',
    name: '3x2 en camisetas',
    description: 'En compras de tres camisetas, el cliente lleva una gratis.',
    kind: '3x2',
    active: true,
    applicableTeams: ['tigres', 'rayados', 'america', 'pumas', 'mexico'],
    applicableCategories: ['Camisetas'],
    priority: 8,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    usageLimit: 50
  },
  {
    id: 'promo-pesos',
    name: 'Descuento especial por temporada',
    description: 'Descuento fijo de $150 en compras mayores a $1,500.',
    kind: 'fijo',
    active: true,
    applicableTeams: ['real-madrid', 'barcelona', 'liverpool', 'mcity'],
    applicableCategories: ['Camisetas', 'Uniformes completos'],
    priority: 5,
    startDate: '2025-04-01',
    endDate: '2025-12-31',
    usageLimit: 30
  }
];

export const initialState: StoreState = {
  teams,
  qualities,
  suppliers,
  products,
  sales: [
    {
      id: 'sale-1',
      folio: 'TD-1001',
      date: '2025-10-08T10:30:00',
      branchId: 'sucursal-1',
      branchName: 'Sucursal Centro',
      clientName: 'Jorge Sánchez',
      cashier: 'María',
      paymentMethod: 'Efectivo',
      subtotal: 1898,
      discounts: 200,
      total: 1698,
      items: [
        {
          productId: 'prod-tigres-home',
          variantId: 'prod-tigres-home-pre-M',
          productName: 'Camiseta Tigres UANL Local 2025',
          qualityName: 'Premium',
          size: 'M',
          quantity: 2,
          unitPrice: 749,
          discount: 100,
          total: 1398
        }
      ]
    },
    {
      id: 'sale-2',
      folio: 'TD-1002',
      date: '2025-10-10T18:15:00',
      branchId: 'sucursal-1',
      branchName: 'Sucursal Centro',
      clientName: 'Luis Ortega',
      cashier: 'Ana',
      paymentMethod: 'Tarjeta',
      subtotal: 1498,
      discounts: 0,
      total: 1498,
      items: [
        {
          productId: 'prod-kit-tigres',
          variantId: 'prod-kit-tigres-kit-M',
          productName: 'Set Tigres + Short',
          qualityName: 'Premium',
          size: 'M',
          quantity: 1,
          unitPrice: 1399,
          discount: 0,
          total: 1399
        }
      ]
    }
  ],
  promotions,
  inventoryMovements: [
    {
      id: 'mov-1',
      productId: 'prod-tigres-home',
      productName: 'Camiseta Tigres UANL Local 2025',
      variantId: 'prod-tigres-home-pre-M',
      reason: 'Compra inicial',
      type: 'entrada',
      quantity: 14,
      date: '2025-10-05T09:00:00',
      branchId: 'sucursal-1',
      branchName: 'Sucursal Centro',
      unitCost: 430
    },
    {
      id: 'mov-2',
      productId: 'prod-kit-tigres',
      productName: 'Set Tigres + Short',
      variantId: 'prod-kit-tigres-kit-M',
      reason: 'Venta directa',
      type: 'venta',
      quantity: 1,
      date: '2025-10-10T18:15:00',
      branchId: 'sucursal-1',
      branchName: 'Sucursal Centro',
      unitCost: 820
    }
  ]
};
