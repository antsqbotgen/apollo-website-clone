import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, orders, products, orderItems } from '@/db/schema';
import { eq, and, or, desc, asc, like, gte, lte } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_APPOINTMENT_TYPES = ['home_collection', 'lab_visit'];
const VALID_STATUSES = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const AVAILABLE_TIME_SLOTS = ['06:00-09:00', '09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00'];
const BUSINESS_HOURS_SLOTS = ['09:00-12:00', '12:00-15:00', '15:00-18:00'];

function validateTimeSlot(timeSlot: string, appointmentType: string): boolean {
  if (appointmentType === 'lab_visit') {
    return BUSINESS_HOURS_SLOTS.includes(timeSlot);
  }
  return AVAILABLE_TIME_SLOTS.includes(timeSlot);
}

function validateFutureDate(dateString: string): boolean {
  const appointmentDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return appointmentDate > today;
}

function validateStatusTransition(currentStatus: string, newStatus: string): boolean {
  const transitions: { [key: string]: string[] } = {
    'scheduled': ['confirmed', 'cancelled'],
    'confirmed': ['in_progress', 'cancelled'],
    'in_progress': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': []
  };
  return transitions[currentStatus]?.includes(newStatus) ?? false;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single appointment with full details
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const appointment = await db.select({
        id: appointments.id,
        userId: appointments.userId,
        orderId: appointments.orderId,
        appointmentType: appointments.appointmentType,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        labLocation: appointments.labLocation,
        technicianAssigned: appointments.technicianAssigned,
        status: appointments.status,
        customerNotes: appointments.customerNotes,
        technicianNotes: appointments.technicianNotes,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        order: {
          id: orders.id,
          orderNumber: orders.orderNumber,
          totalAmount: orders.totalAmount,
          status: orders.status,
          customerName: orders.customerName,
          customerPhone: orders.customerPhone,
          customerAddress: orders.customerAddress,
          customerCity: orders.customerCity,
          customerPincode: orders.customerPincode
        }
      })
      .from(appointments)
      .leftJoin(orders, eq(appointments.orderId, orders.id))
      .where(and(eq(appointments.id, parseInt(id)), eq(appointments.userId, user.id)))
      .limit(1);

      if (appointment.length === 0) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      // Get order items and products if order exists
      let orderItems = null;
      if (appointment[0].orderId) {
        orderItems = await db.select({
          id: orderItems.id,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice,
          product: {
            id: products.id,
            name: products.name,
            description: products.description,
            category: products.category,
            subcategory: products.subcategory
          }
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, appointment[0].orderId));
      }

      return NextResponse.json({
        ...appointment[0],
        orderItems
      });
    }

    // List appointments with filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const sort = searchParams.get('sort') || 'appointmentDate';
    const order = searchParams.get('order') || 'desc';

    let whereConditions = [eq(appointments.userId, user.id)];

    if (search) {
      whereConditions.push(
        or(
          like(appointments.technicianAssigned, `%${search}%`),
          like(appointments.labLocation, `%${search}%`),
          like(appointments.customerNotes, `%${search}%`)
        )
      );
    }

    if (type && VALID_APPOINTMENT_TYPES.includes(type)) {
      whereConditions.push(eq(appointments.appointmentType, type));
    }

    if (status && VALID_STATUSES.includes(status)) {
      whereConditions.push(eq(appointments.status, status));
    }

    if (startDate) {
      whereConditions.push(gte(appointments.appointmentDate, startDate));
    }

    if (endDate) {
      whereConditions.push(lte(appointments.appointmentDate, endDate));
    }

    const sortColumn = sort === 'appointmentDate' ? appointments.appointmentDate : appointments.createdAt;
    const sortOrder = order === 'asc' ? asc : desc;

    const results = await db.select({
      id: appointments.id,
      userId: appointments.userId,
      orderId: appointments.orderId,
      appointmentType: appointments.appointmentType,
      appointmentDate: appointments.appointmentDate,
      appointmentTime: appointments.appointmentTime,
      labLocation: appointments.labLocation,
      technicianAssigned: appointments.technicianAssigned,
      status: appointments.status,
      customerNotes: appointments.customerNotes,
      technicianNotes: appointments.technicianNotes,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      order: {
        id: orders.id,
        orderNumber: orders.orderNumber,
        totalAmount: orders.totalAmount,
        status: orders.status,
        customerName: orders.customerName,
        customerPhone: orders.customerPhone
      }
    })
    .from(appointments)
    .leftJoin(orders, eq(appointments.orderId, orders.id))
    .where(and(...whereConditions))
    .orderBy(sortOrder(sortColumn))
    .limit(limit)
    .offset(offset);

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
      orderId,
      appointmentType,
      appointmentDate,
      appointmentTime,
      labLocation,
      customerNotes,
      status
    } = requestBody;

    // Validate required fields
    if (!appointmentType) {
      return NextResponse.json({ 
        error: "Appointment type is required",
        code: "MISSING_APPOINTMENT_TYPE" 
      }, { status: 400 });
    }

    if (!VALID_APPOINTMENT_TYPES.includes(appointmentType)) {
      return NextResponse.json({ 
        error: "Invalid appointment type. Must be 'home_collection' or 'lab_visit'",
        code: "INVALID_APPOINTMENT_TYPE" 
      }, { status: 400 });
    }

    if (!appointmentDate) {
      return NextResponse.json({ 
        error: "Appointment date is required",
        code: "MISSING_APPOINTMENT_DATE" 
      }, { status: 400 });
    }

    if (!validateFutureDate(appointmentDate)) {
      return NextResponse.json({ 
        error: "Appointment date must be in the future",
        code: "INVALID_APPOINTMENT_DATE" 
      }, { status: 400 });
    }

    if (!appointmentTime) {
      return NextResponse.json({ 
        error: "Appointment time is required",
        code: "MISSING_APPOINTMENT_TIME" 
      }, { status: 400 });
    }

    if (!validateTimeSlot(appointmentTime, appointmentType)) {
      const availableSlots = appointmentType === 'lab_visit' ? BUSINESS_HOURS_SLOTS : AVAILABLE_TIME_SLOTS;
      return NextResponse.json({ 
        error: `Invalid time slot for ${appointmentType}. Available slots: ${availableSlots.join(', ')}`,
        code: "INVALID_TIME_SLOT" 
      }, { status: 400 });
    }

    if (appointmentType === 'lab_visit' && !labLocation) {
      return NextResponse.json({ 
        error: "Lab location is required for lab visit appointments",
        code: "MISSING_LAB_LOCATION" 
      }, { status: 400 });
    }

    // Validate order exists if provided
    if (orderId) {
      const orderExists = await db.select({ id: orders.id })
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)))
        .limit(1);

      if (orderExists.length === 0) {
        return NextResponse.json({ 
          error: "Order not found or does not belong to user",
          code: "INVALID_ORDER_ID" 
        }, { status: 400 });
      }
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ 
        error: "Invalid status",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Check for time slot conflicts
    const conflictingAppointment = await db.select({ id: appointments.id })
      .from(appointments)
      .where(and(
        eq(appointments.userId, user.id),
        eq(appointments.appointmentDate, appointmentDate),
        eq(appointments.appointmentTime, appointmentTime),
        or(
          eq(appointments.status, 'scheduled'),
          eq(appointments.status, 'confirmed'),
          eq(appointments.status, 'in_progress')
        )
      ))
      .limit(1);

    if (conflictingAppointment.length > 0) {
      return NextResponse.json({ 
        error: "You already have an appointment scheduled at this time",
        code: "TIME_SLOT_CONFLICT" 
      }, { status: 409 });
    }

    const newAppointment = await db.insert(appointments)
      .values({
        userId: user.id,
        orderId: orderId || null,
        appointmentType: appointmentType.trim(),
        appointmentDate: appointmentDate.trim(),
        appointmentTime: appointmentTime.trim(),
        labLocation: labLocation?.trim() || null,
        status: status || 'scheduled',
        customerNotes: customerNotes?.trim() || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newAppointment[0], { status: 201 });

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

    // Check if appointment exists and belongs to user
    const existingAppointment = await db.select()
      .from(appointments)
      .where(and(eq(appointments.id, parseInt(id)), eq(appointments.userId, user.id)))
      .limit(1);

    if (existingAppointment.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const {
      appointmentType,
      appointmentDate,
      appointmentTime,
      labLocation,
      technicianAssigned,
      status,
      customerNotes,
      technicianNotes
    } = requestBody;

    const updates: any = { updatedAt: new Date().toISOString() };

    // Validate appointment type if provided
    if (appointmentType !== undefined) {
      if (!VALID_APPOINTMENT_TYPES.includes(appointmentType)) {
        return NextResponse.json({ 
          error: "Invalid appointment type",
          code: "INVALID_APPOINTMENT_TYPE" 
        }, { status: 400 });
      }
      updates.appointmentType = appointmentType.trim();
    }

    // Validate appointment date if provided
    if (appointmentDate !== undefined) {
      if (!validateFutureDate(appointmentDate)) {
        return NextResponse.json({ 
          error: "Appointment date must be in the future",
          code: "INVALID_APPOINTMENT_DATE" 
        }, { status: 400 });
      }
      updates.appointmentDate = appointmentDate.trim();
    }

    // Validate appointment time if provided
    if (appointmentTime !== undefined) {
      const typeToCheck = appointmentType || existingAppointment[0].appointmentType;
      if (!validateTimeSlot(appointmentTime, typeToCheck)) {
        const availableSlots = typeToCheck === 'lab_visit' ? BUSINESS_HOURS_SLOTS : AVAILABLE_TIME_SLOTS;
        return NextResponse.json({ 
          error: `Invalid time slot for ${typeToCheck}. Available slots: ${availableSlots.join(', ')}`,
          code: "INVALID_TIME_SLOT" 
        }, { status: 400 });
      }
      updates.appointmentTime = appointmentTime.trim();
    }

    // Validate status transition if provided
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ 
          error: "Invalid status",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }

      if (!validateStatusTransition(existingAppointment[0].status, status)) {
        return NextResponse.json({ 
          error: `Invalid status transition from '${existingAppointment[0].status}' to '${status}'`,
          code: "INVALID_STATUS_TRANSITION" 
        }, { status: 400 });
      }
      updates.status = status;
    }

    // Update other fields
    if (labLocation !== undefined) {
      updates.labLocation = labLocation?.trim() || null;
    }
    if (technicianAssigned !== undefined) {
      updates.technicianAssigned = technicianAssigned?.trim() || null;
    }
    if (customerNotes !== undefined) {
      updates.customerNotes = customerNotes?.trim() || null;
    }
    if (technicianNotes !== undefined) {
      updates.technicianNotes = technicianNotes?.trim() || null;
    }

    const updatedAppointment = await db.update(appointments)
      .set(updates)
      .where(and(eq(appointments.id, parseInt(id)), eq(appointments.userId, user.id)))
      .returning();

    if (updatedAppointment.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(updatedAppointment[0]);

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

    // Check if appointment exists and belongs to user
    const existingAppointment = await db.select()
      .from(appointments)
      .where(and(eq(appointments.id, parseInt(id)), eq(appointments.userId, user.id)))
      .limit(1);

    if (existingAppointment.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Cancel appointment instead of deleting
    const cancelledAppointment = await db.update(appointments)
      .set({
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      })
      .where(and(eq(appointments.id, parseInt(id)), eq(appointments.userId, user.id)))
      .returning();

    if (cancelledAppointment.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Appointment cancelled successfully',
      appointment: cancelledAppointment[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}