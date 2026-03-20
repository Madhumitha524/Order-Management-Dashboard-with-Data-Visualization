export const COUNTRIES = ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong'];

export const PRODUCTS = [
  'Fiber Internet 300 Mbps',
  '5G Unlimited Mobile Plan',
  'Fiber Internet 1 Gbps',
  'Business Internet 500 Mbps',
  'VoIP Corporate Package',
];

export const ORDER_STATUSES = ['Pending', 'In progress', 'Completed'];

export const CREATED_BY_OPTIONS = [
  'Mr. Michael Harris',
  'Mr. Ryan Cooper',
  'Ms. Olivia Carter',
  'Mr. Lucas Martin',
];

export const WIDGET_TYPES = [
  { id: 'kpi', label: 'KPI Card', icon: '📊', defaultWidth: 2, defaultHeight: 2 },
  { id: 'bar-chart', label: 'Bar Chart', icon: '📈', defaultWidth: 5, defaultHeight: 5 },
  { id: 'line-chart', label: 'Line Chart', icon: '📉', defaultWidth: 5, defaultHeight: 5 },
  { id: 'area-chart', label: 'Area Chart', icon: '🏔️', defaultWidth: 5, defaultHeight: 5 },
  { id: 'scatter-plot', label: 'Scatter Plot', icon: '⚡', defaultWidth: 5, defaultHeight: 5 },
  { id: 'pie-chart', label: 'Pie Chart', icon: '🥧', defaultWidth: 4, defaultHeight: 4 },
  { id: 'table', label: 'Table', icon: '📋', defaultWidth: 4, defaultHeight: 4 },
  { id: 'date-filter', label: 'Date Filter', icon: '📅', defaultWidth: 4, defaultHeight: 2 },
];

export const KPI_METRICS = [
  'Customer ID', 'Customer name', 'Email id', 'Address',
  'Order date', 'Product', 'Created by', 'Status',
  'Total amount', 'Unit price', 'Quantity',
];

export const NUMERIC_METRICS = ['Total amount', 'Unit price', 'Quantity'];

export const CHART_AXES = [
  'Product', 'Quantity', 'Unit price', 'Total amount',
  'Status', 'Created by', 'Duration',
];

export const PIE_DATA_OPTIONS = [
  'Product', 'Quantity', 'Unit price', 'Total amount', 'Status', 'Created by',
];

export const TABLE_COLUMNS = [
  'Customer ID', 'Customer name', 'Email id', 'Phone number', 'Address',
  'Order ID', 'Order date', 'Product', 'Quantity', 'Unit price',
  'Total amount', 'Status', 'Created by',
];

export const AGGREGATIONS = ['Sum', 'Average', 'Count'];
export const DATA_FORMATS = ['Number', 'Currency'];
export const SORT_OPTIONS = ['Ascending', 'Descending', 'Order date'];
export const PAGE_SIZE_OPTIONS = [5, 10, 15];
