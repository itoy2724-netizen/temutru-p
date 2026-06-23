import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
    // API route'larını ve statik dosyaları atla
    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/api/') ||
        request.nextUrl.pathname.includes('.') // statik dosyalar (.js, .css, .png vs.)
    ) {
        return NextResponse.next();
    }

    // IP adresini al
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               'unknown';

    try {
        // Ban kontrolü için internal API çağrısı yap
        const baseUrl = request.nextUrl.origin;
        const response = await fetch(`${baseUrl}/api/ban-check?ip=${encodeURIComponent(ip)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            
            if (data.banned) {
                // 403 Forbidden sayfası döndür
                return new NextResponse(
                    `<!DOCTYPE html>
                    <html lang="tr">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Erişim Engellendi</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                                min-height: 100vh;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                            }
                            .container {
                                text-align: center;
                                padding: 40px;
                            }
                            .error-code {
                                font-size: 120px;
                                font-weight: bold;
                                color: #e74c3c;
                                text-shadow: 0 0 20px rgba(231, 76, 60, 0.5);
                            }
                            .error-title {
                                font-size: 28px;
                                margin: 20px 0;
                                color: #ecf0f1;
                            }
                            .error-message {
                                font-size: 16px;
                                color: #bdc3c7;
                                max-width: 400px;
                                margin: 0 auto;
                            }
                            .icon {
                                font-size: 60px;
                                margin-bottom: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="icon">🚫</div>
                            <div class="error-code">403</div>
                            <h1 class="error-title">Erişim Engellendi</h1>
                            <p class="error-message">
                                Bu sayfaya erişim izniniz bulunmamaktadır. 
                                Eğer bunun bir hata olduğunu düşünüyorsanız lütfen destek ile iletişime geçin.
                            </p>
                        </div>
                    </body>
                    </html>`,
                    {
                        status: 403,
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8',
                        },
                    }
                );
            }
        }
    } catch (error) {
        // Hata durumunda devam et (ban kontrolü yapılamazsa engelleme)
        console.error('Ban kontrolü hatası:', error);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes (handled separately)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
