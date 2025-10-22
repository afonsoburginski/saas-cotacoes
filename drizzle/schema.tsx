import { pgTable, serial, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// Tabela de Usuários (compatível com Better Auth)
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  // Campos customizados do sistema
  phone: varchar('phone', { length: 256 }),
  role: varchar('role', { length: 50 }).default('usuario'), // 'admin' | 'loja' | 'usuario' | 'consumidor' | 'fornecedor'
  status: varchar('status', { length: 20 }).default('active'), // 'active' | 'suspended' | 'inactive'
  // Campos específicos para fornecedores/lojas
  businessName: text('business_name'),
  businessType: varchar('business_type', { length: 20 }), // 'comercio' | 'servico'
  plan: varchar('plan', { length: 20 }), // 'basico' | 'plus' | 'premium'
  address: text('address'),
  // Estatísticas do usuário
  totalOrders: integer('total_orders').default(0),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).default('0'),
  // Stripe Integration (vincula com stripe_customers)
  stripeCustomerId: text('stripe_customer_id').unique(), // ID do stripe_customers.id
});

// Tabela de Sessões (Better Auth)
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Tabela de Contas OAuth (Better Auth)
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Tabela de Verificação (Better Auth)
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Tabela de Lojas/Empresas
export const stores = pgTable('stores', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id).unique(), // Usuário só pode ter 1 loja
  slug: text('slug').notNull().unique(), // URL amigável (ex: silva-materiais)
  nome: text('nome').notNull(),
  email: varchar('email', { length: 256 }),
  telefone: varchar('telefone', { length: 20 }),
  cnpj: varchar('cnpj', { length: 18 }),
  endereco: text('endereco'), // Endereço completo em texto
  descricao: text('descricao'), // Sobre a loja
  logo: text('logo'), // URL do logo da loja
  horarioFuncionamento: text('horario_funcionamento'), // Ex: "Seg-Sex: 08:00-18:00"
  status: varchar('status', { length: 20 }).default('pending'), // 'approved' | 'pending' | 'rejected' | 'ativo' | 'suspenso'
  plano: varchar('plano', { length: 20 }).default('Basic'), // 'Basic' | 'Pro' | 'Premium'
  priorityScore: integer('priority_score').default(0),
  shippingPolicy: jsonb('shipping_policy'),
  address: jsonb('address'), // Lat/Lng para mapa
  features: jsonb('features'), // Features da loja: ['entrega_gratis', 'cartao_aceito', 'garantia']
  // Estatísticas da loja
  totalProducts: integer('total_products').default(0),
  totalServices: integer('total_services').default(0),
  totalSales: decimal('total_sales', { precision: 12, scale: 2 }).default('0'),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de Produtos
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  storeId: integer('store_id').references(() => stores.id).notNull(),
  nome: text('nome').notNull(),
  categoria: varchar('categoria', { length: 100 }).notNull(),
  preco: decimal('preco', { precision: 10, scale: 2 }).notNull(),
  precoPromocional: decimal('preco_promocional', { precision: 10, scale: 2 }),
  estoque: integer('estoque').default(0),
  unidadeMedida: varchar('unidade_medida', { length: 50 }),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  imagemUrl: text('imagem_url'),
  imagens: jsonb('imagens'),
  ativo: boolean('ativo').default(true),
  destacado: boolean('destacado').default(false),
  sku: varchar('sku', { length: 100 }),
  descricao: text('descricao'),
  temVariacaoPreco: boolean('tem_variacao_preco').default(false),
  peso: decimal('peso', { precision: 10, scale: 3 }),
  dimensoes: jsonb('dimensoes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de Serviços
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  storeId: integer('store_id').references(() => stores.id).notNull(),
  nome: text('nome').notNull(),
  categoria: varchar('categoria', { length: 100 }).notNull(),
  preco: decimal('preco', { precision: 10, scale: 2 }).notNull(),
  precoMinimo: decimal('preco_minimo', { precision: 10, scale: 2 }),
  precoMaximo: decimal('preco_maximo', { precision: 10, scale: 2 }),
  tipoPrecificacao: varchar('tipo_precificacao', { length: 20 }).notNull(), // 'hora' | 'dia' | 'projeto' | 'm2' | 'visita'
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  imagemUrl: text('imagem_url'),
  imagens: jsonb('imagens'),
  ativo: boolean('ativo').default(true),
  destacado: boolean('destacado').default(false),
  descricao: text('descricao'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de Reviews/Avaliações
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id),
  userName: text('user_name'), // Desnormalizado para performance
  storeId: integer('store_id').references(() => stores.id),
  productId: integer('product_id').references(() => products.id),
  serviceId: integer('service_id').references(() => services.id),
  rating: integer('rating').notNull(),
  comentario: text('comentario'),
  status: varchar('status', { length: 20 }).default('pendente'), // 'pendente' | 'aprovado' | 'oculto'
  verified: boolean('verified').default(false), // Compra verificada
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de Carrinho
export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id).notNull(),
  productId: integer('product_id').references(() => products.id),
  serviceId: integer('service_id').references(() => services.id),
  qty: integer('qty').notNull().default(1),
  tipo: varchar('tipo', { length: 20 }), // 'product' | 'service'
  // Campos desnormalizados para performance (evitar joins)
  productNome: text('product_nome'),
  storeNome: text('store_nome'),
  precoUnit: decimal('preco_unit', { precision: 10, scale: 2 }),
  imagemUrl: text('imagem_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de Listas de Compras
export const purchaseLists = pgTable('purchase_lists', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id).notNull(),
  nome: text('nome').notNull(),
  items: jsonb('items'),
  observacoes: text('observacoes'),
  totalEstimado: decimal('total_estimado', { precision: 10, scale: 2 }),
  shippingCosts: jsonb('shipping_costs'),
  totalComFrete: decimal('total_com_frete', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de Cotações/Pedidos
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id).notNull(),
  storeId: integer('store_id').references(() => stores.id),
  tipo: varchar('tipo', { length: 20 }).notNull(), // 'cotacao' | 'pedido'
  status: varchar('status', { length: 30 }).default('pendente'), // 'pendente' | 'respondida' | 'aceita' | 'rejeitada' | 'concluida'
  total: decimal('total', { precision: 12, scale: 2 }),
  observacoes: text('observacoes'),
  enderecoEntrega: text('endereco_entrega'),
  dataEntrega: timestamp('data_entrega'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de Itens de Pedidos/Cotações
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').references(() => products.id),
  serviceId: integer('service_id').references(() => services.id),
  qty: integer('qty').notNull().default(1),
  precoUnit: decimal('preco_unit', { precision: 10, scale: 2 }).notNull(),
  precoTotal: decimal('preco_total', { precision: 10, scale: 2 }),
  observacoes: text('observacoes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de Notificações
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id).notNull(),
  tipo: varchar('tipo', { length: 50 }).notNull(), // 'nova_cotacao' | 'resposta_cotacao' | 'nova_avaliacao' | 'status_pedido'
  titulo: text('titulo').notNull(),
  mensagem: text('mensagem'),
  link: text('link'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de Categorias
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 100 }).notNull().unique(),
  tipo: varchar('tipo', { length: 20 }).notNull(), // 'produto' | 'servico'
  descricao: text('descricao'),
  icone: text('icone'),
  ativo: boolean('ativo').default(true),
  ordem: integer('ordem').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de Favoritos
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id).notNull(),
  productId: integer('product_id').references(() => products.id),
  serviceId: integer('service_id').references(() => services.id),
  storeId: integer('store_id').references(() => stores.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de Analytics/Métricas (visualizações, cliques, etc)
export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id),
  storeId: integer('store_id').references(() => stores.id),
  productId: integer('product_id').references(() => products.id),
  serviceId: integer('service_id').references(() => services.id),
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'view' | 'cart_add' | 'list_add' | 'click' | 'search'
  metadata: jsonb('metadata'), // Dados adicionais do evento
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de Comparações (produtos que o usuário está comparando)
export const comparisons = pgTable('comparisons', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id).notNull(),
  productIds: jsonb('product_ids').notNull(), // Array de IDs de produtos sendo comparados
  categoria: varchar('categoria', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de Webhooks Processados (Idempotência)
export const processedWebhooks = pgTable('processed_webhooks', {
  eventId: text('event_id').primaryKey(),
  eventType: text('event_type').notNull(),
  processedAt: timestamp('processed_at').defaultNow(),
  payload: jsonb('payload'),
});
        