# Center Aero — Web Sitesi

Center Aero için tek sayfalık tanıtım sitesi. Next.js 16 (App Router), Tailwind CSS v4, `motion` (Framer Motion'ın devamı) ve `lucide-react` ile kuruldu. Bazı bileşen kalıpları 21st.dev'den uyarlandı (dosya başlarındaki notlara bakın).

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # üretim derlemesi (statik)
npm run start      # üretim sunucusu
```

## Yapı

- `src/app/layout.tsx` — fontlar (Manrope, JetBrains Mono), meta veriler, dil sağlayıcısı
- `src/app/page.tsx` — bölümlerin sırası
- `src/lib/content.ts` — **tüm metinler** (EN / TR). Kopyayı değiştirmek için yalnızca bu dosyayı düzenleyin.
- `src/lib/i18n.tsx` — dil bağlamı; seçim `localStorage`'da saklanır (`center-aero-lang`)
- `src/components/` — bölümler: `hero`, `matching-console`, `platform-marquee`, `claims`, `how-it-works`, `product-groups`, `aircraft-platforms`, `vision`, `audiences`, `contact`, `footer`, `nav`
- `src/components/logo.tsx` — logo ve işaret, vektör yol olarak gömülü (font gerekmez)
- `src/app/globals.css` — marka renkleri (grafit `#1F2A37`, zümrüt `#10B981`), yardımcı sınıflar, animasyon keyframe'leri
- `public/` — logo SVG'leri ve favicon

## Yayın

- Kaynak kod: https://github.com/omersoylu/center-aero-website (dal: `main`)
- Barındırma: **Natro** (Sınırsız Pro Hosting, Plesk; alan adı `centeraero.com` ek alan adı olarak `trionaero.com` paketinde). SSL: Sectigo, `centeraero.com` + `www` için geçerli.
- DNS: Natro paneli → Hosting Yönetimi → Web Sitesi → DNS Yönetimi. `centeraero.com` A → 89.19.30.91, `www` CNAME → centeraero.com. MX/SPF/DKIM kayıtları e‑posta (kurumsaleposta.com) için, dokunmayın.

### Yeniden yayınlama (tek komut)

1. İlk kurulum: `.env.deploy.example` dosyasını `.env.deploy` adıyla kopyalayın ve Natro FTP bilgilerini girin (Natro paneli → Hosting Yönetimi → Web Sitesi (centeraero.com) → FTP Bilgisi). Bu dosya git'e girmez.
2. Yayınlamak için:

```bash
npm run deploy
```

Betik sırasıyla derler, `out/` klasörünü FTPS ile `/centeraero.com` dizinine yükler (eski `_next` klasörünü temizleyerek) ve canlı sayfadaki derleme damgasını yerel derlemeyle karşılaştırır.

Seçenekler: `npm run deploy -- --dry-run` (yüklemeden listele), `npm run deploy -- --skip-build` (mevcut `out/` klasörünü yükle). Sunucu FTPS kabul etmezse `.env.deploy` içinde `FTP_SECURE=false`.
