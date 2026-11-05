import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { calculateOrderTotals } from '../utils/pricing.js';
import {
  sampleOrderBlueprints,
  seedProducts,
  seedReviews,
} from '../data/seedData.js';

const destroy = process.argv.includes('--destroy');

async function upsertSeedUser({ name, email, password, role }) {
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({ name, email, password, role });
  } else {
    user.name = name;
    user.role = role;
    user.password = password;
  }

  await user.save();
  return user;
}

async function seed() {
  await connectDB();

  try {
    if (destroy) {
      await Promise.all([
        Order.deleteMany({}),
        Product.deleteMany({}),
        User.deleteMany({}),
      ]);
      console.log('All users, products, and orders have been removed.');
      return;
    }

    const admin = await upsertSeedUser({
      name: env.seed.adminName,
      email: env.seed.adminEmail,
      password: env.seed.adminPassword,
      role: 'admin',
    });

    const customer = await upsertSeedUser({
      name: env.seed.userName,
      email: env.seed.userEmail,
      password: env.seed.userPassword,
      role: 'user',
    });

    let createdProducts = [];
    const existingProductCount = await Product.countDocuments();

    if (existingProductCount === 0) {
      for (const product of seedProducts) {
        const created = await Product.create({
          ...product,
          createdBy: admin._id,
        });
        createdProducts.push(created);
      }

      console.log(`Created ${createdProducts.length} products.`);

      const productByName = new Map(
        createdProducts.map((product) => [product.name, product])
      );

      for (const review of seedReviews) {
        const product = productByName.get(review.productName);
        if (!product) continue;

        product.reviews.push({
          user: customer._id,
          name: customer.name,
          rating: review.rating,
          comment: review.comment,
        });
        product.numReviews = product.reviews.length;
        product.rating =
          Math.round(
            (product.reviews.reduce((total, item) => total + item.rating, 0) /
              product.reviews.length) *
              10
          ) / 10;

        await product.save();
      }

      if (seedReviews.length > 0) {
        console.log(`Added ${seedReviews.length} sample reviews.`);
      }

      const existingOrderCount = await Order.countDocuments();

      if (existingOrderCount === 0) {
        let createdOrders = 0;

        for (const blueprint of sampleOrderBlueprints) {
          const orderItems = [];
          const productsToUpdate = [];

          for (const entry of blueprint.items) {
            const product = productByName.get(entry.productName);
            if (!product) continue;

            orderItems.push({
              product: product._id,
              name: product.name,
              image: product.image,
              price: product.price,
              quantity: entry.quantity,
            });

            product.stock = Math.max(0, product.stock - entry.quantity);
            productsToUpdate.push(product);
          }

          if (orderItems.length === 0) continue;

          const totals = calculateOrderTotals(orderItems);
          const createdAt = new Date(
            Date.now() - blueprint.daysAgo * 24 * 60 * 60 * 1000
          );

          const statuses = {
            processing: ['pending', 'processing'],
            shipped: ['pending', 'processing', 'shipped'],
            delivered: ['pending', 'processing', 'shipped', 'delivered'],
          }[blueprint.status] || ['pending'];

          const statusHistory = statuses.map((status, index) => ({
            status,
            note: index === 0 ? 'Order placed' : `Status changed to ${status}`,
            at: new Date(createdAt.getTime() + index * 6 * 60 * 60 * 1000),
          }));

          const deliveredAt =
            blueprint.status === 'delivered'
              ? new Date(createdAt.getTime() + 48 * 60 * 60 * 1000)
              : null;

          const order = new Order({
            user: customer._id,
            items: orderItems,
            shippingAddress: {
              fullName: customer.name,
              phone: '+1 555 010 2030',
              address: '1200 Market Street, Suite 400',
              city: 'San Francisco',
              postalCode: '94103',
              country: 'United States',
            },
            paymentMethod: 'cod',
            ...totals,
            status: blueprint.status,
            statusHistory,
            isPaid: blueprint.isPaid,
            paidAt: blueprint.isPaid ? createdAt : null,
            isDelivered: blueprint.status === 'delivered',
            deliveredAt,
            createdAt,
            updatedAt: createdAt,
          });

          await order.save();
          createdOrders += 1;

          for (const product of productsToUpdate) {
            await product.save();
          }
        }

        if (createdOrders > 0) {
          console.log(`Created ${createdOrders} sample orders for the demo customer.`);
        }
      }
    } else {
      console.log(
        `Found ${existingProductCount} existing products — skipped product seeding. ` +
          'Run "npm run seed:destroy" for a clean reset.'
      );
    }

    console.log('\nSeed complete.');
    console.log('---------------------------------------------');
    console.log(`Admin:    ${env.seed.adminEmail} / ${env.seed.adminPassword}`);
    console.log(`Customer: ${env.seed.userEmail} / ${env.seed.userPassword}`);
    console.log(`Database: ${mongoose.connection.name}`);
    console.log('---------------------------------------------');
  } finally {
    await disconnectDB();
  }
}

seed().catch(async (error) => {
  console.error(`Seeding failed: ${error.message}`);
  try {
    await disconnectDB();
  } catch {
    // Ignore disconnect errors during a failed seed.
  }
  process.exitCode = 1;
});
