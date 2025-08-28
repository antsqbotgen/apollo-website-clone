import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, cartItems, products } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single order with order_items details
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const order = await db.select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        totalAmount: orders.totalAmount,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        collectionType: orders.collectionType,
        collectionDate: orders.collectionDate,
        collectionTimeSlot: orders.collectionTimeSlot,
        customerName: orders.customerName,
        customerPhone: orders.customerPhone,
        customerAddress: orders.customerAddress,
        customerCity: orders.customerCity,
        customerPincode: orders.customerPincode,
        notes: orders.notes,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(and(eq(orders.id, parseInt(id)), eq(orders.userId, user.id)))
      .limit(1);

      if (order.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Get order items with product details
      const items = await db.select({
        id: orderItems.id,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        totalPrice: orderItems.totalPrice,
        productName: products.name,
        productDescription: products.description,
        productCategory: products.category,
        productImageUrl: products.imageUrl,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, parseInt(id)));

      return NextResponse.json({
        ...order[0],
        items
      });
    }

    // List orders with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(orders).where(eq(orders.userId, user.id));

    // Apply filters
    const conditions = [eq(orders.userId, user.id)];
    
    if (search) {
      conditions.push(or(
        like(orders.orderNumber, `%${search}%`),
        like(orders.customerName, `%${search}%`),
        like(orders.customerPhone, `%${search}%`)
      ));
    }

    if (status) {
      conditions.push(eq(orders.status, status));
    }

    if (paymentStatus) {
      conditions.push(eq(orders.paymentStatus, paymentStatus));
    }

    query = query.where(and(...conditions));

    // Apply sorting
    const sortColumn = sort === 'totalAmount' ? orders.totalAmount :
                      sort === 'status' ? orders.status :
                      sort === 'paymentStatus' ? orders.paymentStatus :
                      orders.createdAt;

    query = order === 'asc' ? query.orderBy(asc(sortColumn)) : query.orderBy(desc(sortColumn));

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    
    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const {
      collectionType,
      collectionDate,
      collectionTimeSlot,
      customerName,
      customerPhone,
      customerAddress,
      customerCity,
      customerPincode,
      paymentMethod,
      notes
    } = requestBody;

    // Validation
    if (!customerName || customerName.trim().length < 2) {
      return NextResponse.json({ 
        error: "Customer name is required and must be at least 2 characters",
        code: "INVALID_CUSTOMER_NAME" 
      }, { status: 400 });
    }

    if (!customerPhone || !/^[+]?[\d\s\-\(\)]{10,15}$/.test(customerPhone)) {
      return NextResponse.json({ 
        error: "Valid customer phone number is required",
        code: "INVALID_PHONE" 
      }, { status: 400 });
    }

    if (!collectionType || !['home_collection', 'lab_visit'].includes(collectionType)) {
      return NextResponse.json({ 
        error: "Collection type must be 'home_collection' or 'lab_visit'",
        code: "INVALID_COLLECTION_TYPE" 
      }, { status: 400 });
    }

    if (collectionType === 'home_collection' && !collectionDate) {
      return NextResponse.json({ 
        error: "Collection date is required for home collection",
        code: "MISSING_COLLECTION_DATE" 
      }, { status: 400 });
    }

    if (collectionDate) {
      const selectedDate = new Date(collectionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        return NextResponse.json({ 
          error: "Collection date must be in the future",
          code: "INVALID_COLLECTION_DATE" 
        }, { status: 400 });
      }
    }

    // Get cart items for the user
    const userCartItems = await db.select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      price: products.price,
      name: products.name
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, user.id));

    if (userCartItems.length === 0) {
      return NextResponse.json({ 
        error: "Cart is empty. Cannot create order.",
        code: "EMPTY_CART" 
      }, { status: 400 });
    }

    // Calculate total amount
    const totalAmount = userCartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Generate unique order number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Get the count of orders created today
    const todayOrdersCount = await db.select()
      .from(orders)
      .where(like(orders.orderNumber, `ORD-${dateStr}-%`));
    
    const orderSequence = (todayOrdersCount.length + 1).toString().padStart(4, '0');
    const orderNumber = `ORD-${dateStr}-${orderSequence}`;

    const timestamp = new Date().toISOString();

    // Create the order
    const newOrder = await db.insert(orders)
      .values({
        userId: user.id,
        orderNumber,
        totalAmount,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: paymentMethod || null,
        collectionType,
        collectionDate: collectionDate || null,
        collectionTimeSlot: collectionTimeSlot || null,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress?.trim() || null,
        customerCity: customerCity?.trim() || null,
        customerPincode: customerPincode?.trim() || null,
        notes: notes?.trim() || null,
        createdAt: timestamp,
        updatedAt: timestamp
      })
      .returning();

    const orderId = newOrder[0].id;

    // Create order items from cart items
    const orderItemsData = userCartItems.map(item => ({
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      createdAt: timestamp
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Clear the user's cart
    await db.delete(cartItems).where(eq(cartItems.userId, user.id));

    return NextResponse.json(newOrder[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    
    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if order exists and belongs to user
    const existingOrder = await db.select()
      .from(orders)
      .where(and(eq(orders.id, parseInt(id)), eq(orders.userId, user.id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const {
      status,
      paymentStatus,
      paymentMethod,
      collectionDate,
      collectionTimeSlot,
      customerName,
      customerPhone,
      customerAddress,
      customerCity,
      customerPincode,
      notes
    } = requestBody;

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'sample_collected', 'processing', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: "Invalid status value",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = status;
    }

    // Validate payment status if provided
    if (paymentStatus) {
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json({ 
          error: "Invalid payment status value",
          code: "INVALID_PAYMENT_STATUS" 
        }, { status: 400 });
      }
      updates.paymentStatus = paymentStatus;
    }

    // Add other fields if provided
    if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;
    if (collectionDate !== undefined) updates.collectionDate = collectionDate;
    if (collectionTimeSlot !== undefined) updates.collectionTimeSlot = collectionTimeSlot;
    if (customerName !== undefined) {
      if (customerName.trim().length < 2) {
        return NextResponse.json({ 
          error: "Customer name must be at least 2 characters",
          code: "INVALID_CUSTOMER_NAME" 
        }, { status: 400 });
      }
      updates.customerName = customerName.trim();
    }
    if (customerPhone !== undefined) {
      if (!/^[+]?[\d\s\-\(\)]{10,15}$/.test(customerPhone)) {
        return NextResponse.json({ 
          error: "Valid customer phone number is required",
          code: "INVALID_PHONE" 
        }, { status: 400 });
      }
      updates.customerPhone = customerPhone.trim();
    }
    if (customerAddress !== undefined) updates.customerAddress = customerAddress?.trim() || null;
    if (customerCity !== undefined) updates.customerCity = customerCity?.trim() || null;
    if (customerPincode !== undefined) updates.customerPincode = customerPincode?.trim() || null;
    if (notes !== undefined) updates.notes = notes?.trim() || null;

    const updated = await db.update(orders)
      .set(updates)
      .where(and(eq(orders.id, parseInt(id)), eq(orders.userId, user.id)))
      .returning();

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if order exists and belongs to user
    const existingOrder = await db.select()
      .from(orders)
      .where(and(eq(orders.id, parseInt(id)), eq(orders.userId, user.id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Delete order items first (foreign key constraint)
    await db.delete(orderItems).where(eq(orderItems.orderId, parseInt(id)));

    // Delete the order
    const deleted = await db.delete(orders)
      .where(and(eq(orders.id, parseInt(id)), eq(orders.userId, user.id)))
      .returning();

    return NextResponse.json({
      message: 'Order deleted successfully',
      order: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}