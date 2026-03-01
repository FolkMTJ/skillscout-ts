// src/app/api/registrations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RegistrationModel } from '@/lib/db/models/Registration';
import { CampModel } from '@/lib/db/models/Camp';
import { RegistrationStatus } from '@/types';
import { sendPortfolioApprovalEmail, sendPortfolioRejectionEmail } from '@/lib/email';

// PATCH /api/registrations/[id] - Update registration status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Missing registration ID' },
                { status: 400 }
            );
        }

        const registration = await RegistrationModel.findById(id);
        if (!registration) {
            return NextResponse.json(
                { error: 'Registration not found' },
                { status: 404 }
            );
        }

        const newStatus = body.status as RegistrationStatus;
        const reviewedBy = body.reviewedBy || 'system';
        const notes = body.notes || '';

        const updated = await RegistrationModel.updateStatus(id, newStatus, reviewedBy, notes);

        // Send portfolio review email if camp requires portfolio
        if (newStatus === RegistrationStatus.APPROVED || newStatus === RegistrationStatus.REJECTED) {
            try {
                const camp = await CampModel.findById(registration.campId);
                if (camp?.requiresPortfolio) {
                    const campUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/camps/${camp.slug}`;
                    if (newStatus === RegistrationStatus.APPROVED) {
                        await sendPortfolioApprovalEmail(
                            registration.userEmail,
                            registration.userName,
                            camp.name,
                            campUrl,
                            (camp.fee ?? 0) > 0,
                        );
                    } else {
                        await sendPortfolioRejectionEmail(
                            registration.userEmail,
                            registration.userName,
                            camp.name,
                            notes,
                        );
                    }
                }
            } catch (emailErr) {
                console.warn('Could not send portfolio review email:', emailErr);
            }
        }

        return NextResponse.json({
            success: true,
            registration: updated,
            message: 'Registration status updated successfully',
        });
    } catch (error) {
        console.error('Error updating registration:', error);
        return NextResponse.json(
            { error: 'Failed to update registration' },
            { status: 500 }
        );
    }
}
