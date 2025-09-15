import { createDB } from '@/lib/db/src';
import { orderItems, orders } from '../db/schema';

export async function seedMockOrders() {
  const db = await createDB();

  // Sample order data
  const mockOrders = [
    {
      id: crypto.randomUUID(),
      userId: "bb512f19-498f-454a-83b6-a91d5b25d0ab", // Replace with your actual user ID
      creatorId: "af63d6a1-8d6e-4851-a237-bd23e50cb533", // Replace with your actual creator ID
      status: 'pending' as const,
      totalAmount: '156.99',
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '+1 555-123-4567',
      },
      trackingNumber: null,
      completedAt: null,
      createdAt: new Date('2025-10-05'),
      updatedAt: new Date('2025-10-05'),
    },
    {
      id: crypto.randomUUID(),
      userId: "bb512f19-498f-454a-83b6-a91d5b25d0ab",
      creatorId: "af63d6a1-8d6e-4851-a237-bd23e50cb533",
      status: 'processing' as const,
      totalAmount: '89.50',
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      trackingNumber: null,
      completedAt: null,
      createdAt: new Date('2025-10-03'),
      updatedAt: new Date('2025-10-04'),
    },
    {
      id: crypto.randomUUID(),
      userId: "bb512f19-498f-454a-83b6-a91d5b25d0ab",
      creatorId: "af63d6a1-8d6e-4851-a237-bd23e50cb533",
      status: 'shipped' as const,
      totalAmount: '245.00',
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      trackingNumber: 'USPS-1234567890',
      completedAt: null,
      createdAt: new Date('2025-09-28'),
      updatedAt: new Date('2025-10-01'),
    },
    {
      id: crypto.randomUUID(),
      userId: "bb512f19-498f-454a-83b6-a91d5b25d0ab",
      creatorId: "af63d6a1-8d6e-4851-a237-bd23e50cb533",
      status: 'delivered' as const,
      totalAmount: '129.99',
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      trackingNumber: 'FEDEX-9876543210',
      completedAt: new Date('2025-09-25'),
      createdAt: new Date('2025-09-15'),
      updatedAt: new Date('2025-09-25'),
    },
    {
      id: crypto.randomUUID(),
      userId: "bb512f19-498f-454a-83b6-a91d5b25d0ab",
      creatorId: 'af63d6a1-8d6e-4851-a237-bd23e50cb533',
      status: 'cancelled' as const,
      totalAmount: '75.00',
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      trackingNumber: null,
      completedAt: null,
      createdAt: new Date('2025-09-20'),
      updatedAt: new Date('2025-09-21'),
    },
  ];

  // Insert orders
  const insertedOrders = await db.insert(orders).values(mockOrders).returning();

  console.log(`✅ Inserted ${insertedOrders.length} mock orders`);

  // Create order items for each order
  const mockOrderItems = [
    // Order 1 items
    {
      id: crypto.randomUUID(),
      orderId: insertedOrders[0].id,
      productId: 'a1b2c3d4-1111-4f00-b222-000000000001', // Replace with actual product IDs
      variantId: null,
      quantity: 2,
      price: '49.99',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      orderId: insertedOrders[0].id,
      productId: 'a1b2c3d4-1111-4f00-b222-000000000005',
      variantId: null,
      quantity: 1,
      price: '57.01',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Order 2 items
    {
      id: crypto.randomUUID(),
      orderId: insertedOrders[1].id,
      productId: 'a1b2c3d4-1111-4f00-b222-000000000008',
      variantId: null,
      quantity: 1,
      price: '89.50',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Order 3 items
    {
      id: crypto.randomUUID(),
      orderId: insertedOrders[2].id,
      productId: 'a1b2c3d4-1111-4f00-b222-000000000014',
      variantId: null,
      quantity: 3,
      price: '81.67',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Order 4 items
    {
      id: crypto.randomUUID(),
      orderId: insertedOrders[3].id,
      productId: 'a1b2c3d4-1111-4f00-b222-000000000011',
      variantId: null,
      quantity: 2,
      price: '64.99',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Order 5 items
    {
      id: crypto.randomUUID(),
      orderId: insertedOrders[4].id,
      productId: 'a1b2c3d4-1111-4f00-b222-000000000019',
      variantId: null,
      quantity: 1,
      price: '75.00',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.insert(orderItems).values(mockOrderItems);

  console.log(`✅ Inserted ${mockOrderItems.length} order items`);
  console.log('✅ Mock orders created successfully!');
}

// Run the seed function
seedMockOrders()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error seeding orders:', error);
    process.exit(1);
  });
