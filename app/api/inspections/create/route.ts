import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId, notes } = await request.json();

    if (!propertyId) {
      return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 });
    }

    const supabase = await createClient();

    // Look up the property to get the landlord_id
    const { data: property } = await supabase
      .from('properties')
      .select('landlord_id')
      .eq('id', propertyId)
      .single();

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Create inspection request — schema has both landlord_id and tenant_id
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .insert({
        property_id: propertyId,
        landlord_id: property.landlord_id,
        tenant_id: user.id,
        status: 'pending',
        notes,
      })
      .select()
      .single();

    if (inspectionError) {
      return NextResponse.json({ error: inspectionError.message }, { status: 400 });
    }

    // Create notification for landlord
    if (property) {
      await supabase.from('notifications').insert({
        user_id: property.landlord_id,
        type: 'inspection',
        message: 'A tenant has requested to inspect your property',
      });
    }

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    console.error('Inspection creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create inspection' },
      { status: 500 }
    );
  }
}
