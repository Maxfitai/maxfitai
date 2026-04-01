import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { email } = await request.json();

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    try {
        if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_SHEET_ID) {
            throw new Error('Missing required environment variables');
        }

        // Create credentials object
        const credentials = {
            type: "service_account",
            project_id: "menu-ai-4f1a4",
            private_key_id: "19ec73389e3e3be6860cfceb5f0684620a040306",
            private_key: process.env.GOOGLE_PRIVATE_KEY,
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            client_id: "118035044990191402468",
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/newsletter-mehditech%40menu-ai-4f1a4.iam.gserviceaccount.com",
            universe_domain: "googleapis.com"
        };

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const range = 'Maxfit!A:B'; // Column A for email, B for timestamp

        // Check if email already exists
        const existingData = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = existingData.data.values || [];
        const emailExists = rows.some(row => row[0]?.toLowerCase() === email.toLowerCase());

        if (emailExists) {
            return NextResponse.json(
                { error: 'You are already subscribed!' },
                { status: 409 }
            );
        }

        const values = [[email, new Date().toISOString()]];

        console.log('Appending values:', values);

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            requestBody: { values },
        });

        return NextResponse.json({ message: 'Subscribed successfully' });
    } catch (error: any) {
        console.error('Error subscribing:', error);
        console.error('Error details:', error?.message, error?.code);
        return NextResponse.json({
            error: 'Failed to subscribe',
            details: error?.message
        }, { status: 500 });
    }
}
