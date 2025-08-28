import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cartItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get cart items with product details
    const cartWithProducts = await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          category: products.category,
          subcategory: products.subcategory,
          price: products.price,
          originalPrice: products.originalPrice,
          discountPercentage: products.discountPercentage,
          homeCollectionAvailable: products.homeCollectionAvailable,
          reportDeliveryHours: products.reportDeliveryHours,
          testsIncluded: products.testsIncluded,
          isPopular: products.isPopular,
          isSafe: products.isSafe,
          imageUrl: products.imageUrl
        }
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, user.id));

    // Calculate cart summary
    const totalItems = cartWithProducts.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartWithProducts.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    return NextResponse.json({
      items: cartWithProducts,
      summary: {
        totalItems,
        totalAmount: Math.round(totalAmount * 100) / 100 // Round to 2 decimal places
      }
    });

  } catch (error) {
    console.error('GET cart error:', error);
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
    const { productId, quantity } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!productId) {
      return NextResponse.json({ 
        error: "Product ID is required",
        code: "MISSING_PRODUCT_ID" 
      }, { status: 400 });
    }

    // Validate quantity
    const qty = quantity || 1;
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
      return NextResponse.json({ 
        error: "Quantity must be a positive integer between 1 and 10",
        code: "INVALID_QUANTITY" 
      }, { status: 400 });
    }

    // Validate product exists
    const product = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(productId)))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json({ 
        error: "Product not found",
        code: "PRODUCT_NOT_FOUND" 
      }, { status: 404 });
    }

    // Check if item already exists in cart
    const existingItem = await db.select()
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, user.id),
        eq(cartItems.productId, parseInt(productId))
      ))
      .limit(1);

    let cartItem;
    const timestamp = new Date().toISOString();

    if (existingItem.length > 0) {
      // Update existing item quantity
      const newQuantity = Math.min(existingItem[0].quantity + qty, 10); // Max 10 per item
      
      cartItem = await db.update(cartItems)
        .set({
          quantity: newQuantity,
          updatedAt: timestamp
        })
        .where(and(
          eq(cartItems.id, existingItem[0].id),
          eq(cartItems.userId, user.id)
        ))
        .returning();
    } else {
      // Create new cart item
      cartItem = await db.insert(cartItems)
        .values({
          userId: user.id,
          productId: parseInt(productId),
          quantity: qty,
          createdAt: timestamp,
          updatedAt: timestamp
        })
        .returning();
    }

    // Get the cart item with product details
    const cartItemWithProduct = await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          category: products.category,
          subcategory: products.subcategory,
          price: products.price,
          originalPrice: products.originalPrice,
          discountPercentage: products.discountPercentage,
          homeCollectionAvailable: products.homeCollectionAvailable,
          reportDeliveryHours: products.reportDeliveryHours,
          testsIncluded: products.testsIncluded,
          isPopular: products.isPopular,
          isSafe: products.isSafe,
          imageUrl: products.imageUrl
        }
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.id, cartItem[0].id))
      .limit(1);

    return NextResponse.json(cartItemWithProduct[0], { status: 201 });

  } catch (error) {
    console.error('POST cart error:', error);
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

    // Get count of items before deletion
    const existingItems = await db.select()
      .from(cartItems)
      .where(eq(cartItems.userId, user.id));

    // Delete all cart items for the user
    const deletedItems = await db.delete(cartItems)
      .where(eq(cartItems.userId, user.id))
      .returning();

    return NextResponse.json({
      message: "Cart cleared successfully",
      clearedItemsCount: deletedItems.length,
      deletedItems
    });

  } catch (error) {
    console.error('DELETE cart error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}