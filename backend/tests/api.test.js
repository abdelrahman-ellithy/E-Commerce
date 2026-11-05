import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-luma-secret-0123456789abcdef0123456789abcdef';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/luma-test-placeholder';

let app;
let mongoServer;
let User;
let Product;
let Order;
let adminToken;
let customerToken;

const ADMIN = {
  name: 'Test Admin',
  email: 'admin@test.dev',
  password: 'Admin123!',
};

const CUSTOMER = {
  name: 'Test Customer',
  email: 'customer@test.dev',
  password: 'Customer123!',
};

const SHIPPING_ADDRESS = {
  fullName: 'Test Customer',
  phone: '+1 555 010 2030',
  address: '1200 Market Street',
  city: 'San Francisco',
  postalCode: '94103',
  country: 'United States',
};

const productPayload = (overrides = {}) => ({
  name: 'Test Wireless Headphones',
  description:
    'Comfortable over-ear headphones with adaptive noise cancellation and a long battery life.',
  brand: 'Testwave',
  category: 'Audio',
  price: 49.5,
  stock: 10,
  image: '',
  ...overrides,
});

async function login(email, password) {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200);

  return response.body.token;
}

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri('luma_test');

  const { connectDB } = await import('../src/config/db.js');
  await connectDB(process.env.MONGO_URI);

  const appModule = await import('../src/app.js');
  app = appModule.default;

  User = (await import('../src/models/User.js')).default;
  Product = (await import('../src/models/Product.js')).default;
  Order = (await import('../src/models/Order.js')).default;

  await Promise.all([User.init(), Product.init(), Order.init()]);
});

after(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Promise.all([Order.deleteMany({}), Product.deleteMany({}), User.deleteMany({})]);

  await User.create({ ...ADMIN, role: 'admin' });
  await User.create({ ...CUSTOMER, role: 'user' });

  [adminToken, customerToken] = await Promise.all([
    login(ADMIN.email, ADMIN.password),
    login(CUSTOMER.email, CUSTOMER.password),
  ]);
});

describe('LUMA API', () => {
  it('reports a healthy API', async () => {
    const response = await request(app).get('/api/v1/health').expect(200);

    assert.equal(response.body.success, true);
    assert.equal(response.body.message, 'LUMA API is running.');
  });

  it('registers users with validation and hashes passwords', async () => {
    const invalid = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'A', email: 'not-an-email', password: 'short' })
      .expect(422);

    assert.equal(invalid.body.success, false);
    assert.ok(Array.isArray(invalid.body.errors));
    assert.ok(invalid.body.errors.some((error) => error.field === 'email'));

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'New Shopper',
        email: 'shopper@test.dev',
        password: 'Shopper123!',
      })
      .expect(201);

    assert.equal(response.body.success, true);
    assert.ok(response.body.token);
    assert.equal(response.body.user.email, 'shopper@test.dev');
    assert.equal(response.body.user.role, 'user');
    assert.equal(response.body.user.password, undefined);

    const stored = await User.findOne({ email: 'shopper@test.dev' }).select('+password');
    assert.notEqual(stored.password, 'Shopper123!');
    assert.equal(await stored.comparePassword('Shopper123!'), true);

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Duplicate Shopper',
        email: 'shopper@test.dev',
        password: 'Shopper123!',
      })
      .expect(409);
  });

  it('rejects an incorrect password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: CUSTOMER.email, password: 'WrongPassword1' })
      .expect(401);

    assert.equal(response.body.message, 'Email or password is incorrect.');
  });

  it('lets a customer update their profile and clear their phone number', async () => {
    const response = await request(app)
      .put('/api/v1/auth/me')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Updated Customer', phone: '' })
      .expect(200);

    assert.equal(response.body.user.name, 'Updated Customer');
    assert.equal(response.body.user.phone, '');
  });

  it('enforces authentication and admin access', async () => {
    await request(app).get('/api/v1/orders/mine').expect(401);

    await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);

    const response = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.equal(response.body.data.totals.users, 2);
    assert.equal(response.body.data.totals.products, 0);
    assert.equal(response.body.data.totals.orders, 0);
  });

  it('supports admin product CRUD while hiding inactive products from the store', async () => {
    await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(productPayload())
      .expect(403);

    const created = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(productPayload())
      .expect(201);

    const product = created.body.data;
    assert.equal(product.name, productPayload().name);
    assert.ok(product.slug);
    assert.equal(product.isActive, true);

    const list = await request(app).get('/api/v1/products').expect(200);
    assert.equal(list.body.data.length, 1);
    assert.equal(list.body.pagination.total, 1);

    const categories = await request(app).get('/api/v1/products/categories').expect(200);
    assert.equal(categories.body.data[0].name, 'Audio');
    assert.equal(categories.body.data[0].count, 1);

    const updated = await request(app)
      .put(`/api/v1/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 39.99, stock: 4 })
      .expect(200);

    assert.equal(updated.body.data.price, 39.99);
    assert.equal(updated.body.data.stock, 4);

    await request(app)
      .put(`/api/v1/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false })
      .expect(200);

    await request(app).get(`/api/v1/products/${product._id}`).expect(404);

    const adminList = await request(app)
      .get('/api/v1/products/admin/all?active=false')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.equal(adminList.body.data.length, 1);
    assert.equal(adminList.body.data[0].isActive, false);

    const adminProduct = await request(app)
      .get(`/api/v1/products/admin/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.equal(adminProduct.body.data.isActive, false);

    const removed = await request(app)
      .delete(`/api/v1/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.match(removed.body.message, /was deleted/);

    await request(app)
      .get(`/api/v1/products/admin/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('recalculates order totals, reserves stock, and enforces the fulfilment flow', async () => {
    const product = await Product.create(productPayload({ price: 50, stock: 3 }));

    const created = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ product: product._id.toString(), quantity: 2 }],
        shippingAddress: SHIPPING_ADDRESS,
        paymentMethod: 'cod',
      })
      .expect(201);

    const order = created.body.data;
    assert.equal(order.itemsPrice, 100);
    assert.equal(order.shippingPrice, 0);
    assert.equal(order.taxPrice, 8);
    assert.equal(order.totalPrice, 108);
    assert.equal(order.status, 'pending');
    assert.equal(order.items[0].name, product.name);
    assert.equal(order.items[0].price, 50);

    const afterOrder = await Product.findById(product._id);
    assert.equal(afterOrder.stock, 1);

    const mine = await request(app)
      .get('/api/v1/orders/mine')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    assert.equal(mine.body.data.length, 1);
    assert.equal(mine.body.pagination.total, 1);

    const otherCustomer = await User.create({
      name: 'Other Customer',
      email: 'other@test.dev',
      password: 'Other123!',
      role: 'user',
    });
    const otherToken = await login(otherCustomer.email, 'Other123!');

    await request(app)
      .get(`/api/v1/orders/${order._id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);

    await request(app)
      .patch(`/api/v1/admin/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'shipped' })
      .expect(400);

    await request(app)
      .patch(`/api/v1/admin/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'processing', note: 'Packing now' })
      .expect(200);

    await request(app)
      .patch(`/api/v1/admin/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'shipped' })
      .expect(200);

    const delivered = await request(app)
      .patch(`/api/v1/admin/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'delivered' })
      .expect(200);

    assert.equal(delivered.body.data.status, 'delivered');
    assert.equal(delivered.body.data.isDelivered, true);
    assert.ok(delivered.body.data.deliveredAt);
    assert.equal(delivered.body.data.user.name, CUSTOMER.name);
    assert.equal(delivered.body.data.user.email, CUSTOMER.email);

    await request(app)
      .patch(`/api/v1/admin/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'processing' })
      .expect(400);

    const paid = await request(app)
      .patch(`/api/v1/admin/orders/${order._id}/pay`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.equal(paid.body.data.isPaid, true);
    assert.ok(paid.body.data.paidAt);

    const stats = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.equal(stats.body.data.totals.orders, 1);
    assert.equal(stats.body.data.totals.revenue, 108);
    assert.equal(stats.body.data.statusBreakdown.delivered, 1);
    assert.equal(stats.body.data.lowStock[0]._id.toString(), product._id.toString());
    assert.equal(stats.body.data.recentOrders[0]._id, order._id);
  });

  it('cancels an order and restores the reserved stock', async () => {
    const product = await Product.create(productPayload({ price: 25, stock: 5 }));

    const created = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ product: product._id.toString(), quantity: 2 }],
        shippingAddress: SHIPPING_ADDRESS,
      })
      .expect(201);

    const orderId = created.body.data._id;
    assert.equal((await Product.findById(product._id)).stock, 3);

    const cancelled = await request(app)
      .patch(`/api/v1/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    assert.equal(cancelled.body.data.status, 'cancelled');
    assert.ok(cancelled.body.data.cancelledAt);
    assert.equal((await Product.findById(product._id)).stock, 5);

    await request(app)
      .patch(`/api/v1/admin/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);

    await request(app)
      .patch(`/api/v1/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(400);
  });

  it('rejects orders that exceed available stock without changing inventory', async () => {
    const product = await Product.create(productPayload({ price: 25, stock: 1 }));

    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ product: product._id.toString(), quantity: 2 }],
        shippingAddress: SHIPPING_ADDRESS,
      })
      .expect(409);

    assert.match(response.body.message, /Only 1 unit/);
    assert.equal((await Product.findById(product._id)).stock, 1);
    assert.equal(await Order.countDocuments(), 0);
  });

  it('validates order payloads and identifiers', async () => {
    await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [], shippingAddress: {} })
      .expect(422);

    await request(app)
      .get('/api/v1/products/not-a-valid-id')
      .expect(422);

    await request(app)
      .get('/api/v1/products/507f1f77bcf86cd799439011')
      .expect(404);
  });
});
