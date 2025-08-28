import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  // Add missing fields to match schema
  role: text('role').notNull().default('patient'),
  phoneNumber: text('phone_number'),
  employeeId: text('employee_id'),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'test', 'package', 'lifestyle', 'organ_test'
  subcategory: text('subcategory'), // 'diabetes', 'heart', 'liver', etc.
  price: real('price').notNull(),
  originalPrice: real('original_price'),
  discountPercentage: integer('discount_percentage').default(0),
  homeCollectionAvailable: integer('home_collection_available', { mode: 'boolean' }).default(true),
  reportDeliveryHours: integer('report_delivery_hours').default(24),
  testsIncluded: integer('tests_included').default(1),
  isPopular: integer('is_popular', { mode: 'boolean' }).default(false),
  isSafe: integer('is_safe', { mode: 'boolean' }).default(true),
  imageUrl: text('image_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  orderNumber: text('order_number').notNull().unique(),
  totalAmount: real('total_amount').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'confirmed', 'sample_collected', 'processing', 'completed', 'cancelled'
  paymentStatus: text('payment_status').notNull().default('pending'), // 'pending', 'paid', 'failed', 'refunded'
  paymentMethod: text('payment_method'),
  collectionType: text('collection_type'), // 'home_collection', 'lab_visit'
  collectionDate: text('collection_date'), // ISO date format
  collectionTimeSlot: text('collection_time_slot'),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerAddress: text('customer_address'),
  customerCity: text('customer_city'),
  customerPincode: text('customer_pincode'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  totalPrice: real('total_price').notNull(),
  createdAt: text('created_at').notNull(),
});

export const appointments = sqliteTable('appointments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  orderId: integer('order_id').references(() => orders.id),
  appointmentType: text('appointment_type').notNull(), // 'home_collection', 'lab_visit'
  appointmentDate: text('appointment_date').notNull(), // ISO date format
  appointmentTime: text('appointment_time').notNull(),
  labLocation: text('lab_location'),
  technicianAssigned: text('technician_assigned'),
  status: text('status').notNull().default('scheduled'), // 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'
  customerNotes: text('customer_notes'),
  technicianNotes: text('technician_notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});