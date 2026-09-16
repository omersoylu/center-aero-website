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

## Yayına almadan önce

1. **İletişim formu** (`src/components/contact.tsx`): şu an yalnızca istemci tarafında onay gösterir. Bir e-posta servisi veya API ucuna bağlanmalı (ör. Resend, Formspree, kendi API route'unuz).
2. `src/app/layout.tsx` içindeki `metadata` alanına alan adı (`metadataBase`) ve Open Graph görseli ekleyin.
3. Sosyal medya ve e-posta bağlantıları eklenecekse `footer.tsx` ve `contact.tsx` içinde yer ayrıldı.
4. Vercel'e bağlanıp `main` dalını dağıtmak yeterlidir; ek yapılandırma gerekmez.
