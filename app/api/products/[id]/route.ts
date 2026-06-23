import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // Önce slug ile ara, bulamazsa id ile ara
        let [rows] = await pool.query('SELECT * FROM products WHERE slug = ?', [id]);
        let products = rows as any[];
        
        // Slug ile bulunamadıysa id ile dene
        if (products.length === 0) {
            [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
            products = rows as any[];
        }
        
        if (products.length === 0) {
            return NextResponse.json({ success: false, error: 'Ürün bulunamadı' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: products[0] });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await pool.query('DELETE FROM products WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        // is_flash_sale güncelleme
        if (typeof body.is_flash_sale !== 'undefined') {
            await pool.query(
                'UPDATE products SET is_flash_sale = ? WHERE id = ?',
                [body.is_flash_sale ? 1 : 0, id]
            );
        }
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}