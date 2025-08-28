import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_CATEGORIES = ['test', 'package', 'lifestyle', 'organ_test'];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Single product fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const product = await db.select()
        .from(products)
        .where(eq(products.id, parseInt(id)))
        .limit(1);

      if (product.length === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json(product[0]);
    }

    // List products with filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const isPopular = searchParams.get('is_popular');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(products);
    const conditions = [];

    // Apply filters
    if (category) {
      conditions.push(eq(products.category, category));
    }
    
    if (subcategory) {
      conditions.push(eq(products.subcategory, subcategory));
    }
    
    if (isPopular === 'true') {
      conditions.push(eq(products.isPopular, true));
    }
    
    if (search) {
      conditions.push(or(
        like(products.name, `%${search}%`),
        like(products.description, `%${search}%`)
      ));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = sort === 'price' ? products.price : 
                     sort === 'name' ? products.name : 
                     products.createdAt;
    
    query = order === 'asc' ? 
      query.orderBy(asc(sortField)) : 
      query.orderBy(desc(sortField));

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
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const requestBody = await request.json();
    
    // Security check: reject if user ID provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const {
      name,
      description,
      category,
      subcategory,
      price,
      originalPrice,
      discountPercentage,
      homeCollectionAvailable,
      reportDeliveryHours,
      testsIncluded,
      isPopular,
      isSafe,
      imageUrl
    } = requestBody;

    // Validation
    if (!name || name.trim().length < 3) {
      return NextResponse.json({ 
        error: "Name is required and must be at least 3 characters",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ 
        error: "Category is required and must be one of: " + VALID_CATEGORIES.join(', '),
        code: "INVALID_CATEGORY" 
      }, { status: 400 });
    }

    if (!price || price <= 0) {
      return NextResponse.json({ 
        error: "Price is required and must be a positive number",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    if (!originalPrice || originalPrice <= 0) {
      return NextResponse.json({ 
        error: "Original price is required and must be a positive number",
        code: "INVALID_ORIGINAL_PRICE" 
      }, { status: 400 });
    }

    if (discountPercentage !== undefined && (discountPercentage < 0 || discountPercentage > 100)) {
      return NextResponse.json({ 
        error: "Discount percentage must be between 0 and 100",
        code: "INVALID_DISCOUNT_PERCENTAGE" 
      }, { status: 400 });
    }

    if (reportDeliveryHours !== undefined && reportDeliveryHours <= 0) {
      return NextResponse.json({ 
        error: "Report delivery hours must be a positive integer",
        code: "INVALID_REPORT_DELIVERY_HOURS" 
      }, { status: 400 });
    }

    if (testsIncluded !== undefined && testsIncluded <= 0) {
      return NextResponse.json({ 
        error: "Tests included must be a positive integer",
        code: "INVALID_TESTS_INCLUDED" 
      }, { status: 400 });
    }

    // Calculate discount percentage if not provided
    const finalDiscountPercentage = discountPercentage !== undefined 
      ? discountPercentage 
      : Math.round(((originalPrice - price) / originalPrice) * 100);

    const timestamp = new Date().toISOString();

    const newProduct = await db.insert(products)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        category,
        subcategory: subcategory?.trim() || null,
        price,
        originalPrice,
        discountPercentage: finalDiscountPercentage,
        homeCollectionAvailable: homeCollectionAvailable ?? true,
        reportDeliveryHours: reportDeliveryHours ?? 24,
        testsIncluded: testsIncluded ?? 1,
        isPopular: isPopular ?? false,
        isSafe: isSafe ?? true,
        imageUrl: imageUrl?.trim() || null,
        createdAt: timestamp,
        updatedAt: timestamp
      })
      .returning();

    return NextResponse.json(newProduct[0], { status: 201 });

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
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    
    // Security check: reject if user ID provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const {
      name,
      description,
      category,
      subcategory,
      price,
      originalPrice,
      discountPercentage,
      homeCollectionAvailable,
      reportDeliveryHours,
      testsIncluded,
      isPopular,
      isSafe,
      imageUrl
    } = requestBody;

    // Validation for provided fields
    if (name !== undefined && (!name || name.trim().length < 3)) {
      return NextResponse.json({ 
        error: "Name must be at least 3 characters",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ 
        error: "Category must be one of: " + VALID_CATEGORIES.join(', '),
        code: "INVALID_CATEGORY" 
      }, { status: 400 });
    }

    if (price !== undefined && price <= 0) {
      return NextResponse.json({ 
        error: "Price must be a positive number",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    if (originalPrice !== undefined && originalPrice <= 0) {
      return NextResponse.json({ 
        error: "Original price must be a positive number",
        code: "INVALID_ORIGINAL_PRICE" 
      }, { status: 400 });
    }

    if (discountPercentage !== undefined && (discountPercentage < 0 || discountPercentage > 100)) {
      return NextResponse.json({ 
        error: "Discount percentage must be between 0 and 100",
        code: "INVALID_DISCOUNT_PERCENTAGE" 
      }, { status: 400 });
    }

    if (reportDeliveryHours !== undefined && reportDeliveryHours <= 0) {
      return NextResponse.json({ 
        error: "Report delivery hours must be a positive integer",
        code: "INVALID_REPORT_DELIVERY_HOURS" 
      }, { status: 400 });
    }

    if (testsIncluded !== undefined && testsIncluded <= 0) {
      return NextResponse.json({ 
        error: "Tests included must be a positive integer",
        code: "INVALID_TESTS_INCLUDED" 
      }, { status: 400 });
    }

    // Prepare update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (category !== undefined) updates.category = category;
    if (subcategory !== undefined) updates.subcategory = subcategory?.trim() || null;
    if (price !== undefined) updates.price = price;
    if (originalPrice !== undefined) updates.originalPrice = originalPrice;
    if (discountPercentage !== undefined) updates.discountPercentage = discountPercentage;
    if (homeCollectionAvailable !== undefined) updates.homeCollectionAvailable = homeCollectionAvailable;
    if (reportDeliveryHours !== undefined) updates.reportDeliveryHours = reportDeliveryHours;
    if (testsIncluded !== undefined) updates.testsIncluded = testsIncluded;
    if (isPopular !== undefined) updates.isPopular = isPopular;
    if (isSafe !== undefined) updates.isSafe = isSafe;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl?.trim() || null;

    // Recalculate discount percentage if price or originalPrice changed
    if (price !== undefined || originalPrice !== undefined) {
      const currentPrice = price ?? existingProduct[0].price;
      const currentOriginalPrice = originalPrice ?? existingProduct[0].originalPrice;
      if (discountPercentage === undefined) {
        updates.discountPercentage = Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100);
      }
    }

    const updatedProduct = await db.update(products)
      .set(updates)
      .where(eq(products.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedProduct[0]);

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
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const deletedProduct = await db.delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Product deleted successfully',
      product: deletedProduct[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}