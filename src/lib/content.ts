export type Lang = "en" | "tr";

export type Step = { title: string; body: string };
export type Group = { key: "rotables" | "engine" | "chemicals" | "expendables" | "gse"; title: string; body: string; examples: string; ata: string };
/** Part condition codes: NE new · NS new surplus · OH overhauled · SV serviceable · AR as removed. */
export type CondCode = "NE" | "NS" | "OH" | "SV" | "AR";
/** RFQ priority classes (AOG = aircraft on ground). */
export type Urgency = "AOG" | "CRITICAL" | "ROUTINE";
export type UrgencyKey = Lowercase<Urgency>;
export type Segment = { key: "commercial" | "rotary" | "business"; label: string; blurb: string; families: { maker: string; models: string[] }[] };

const en = {
  nav: {
    vision: "Vision",
    agent: "Search Agent",
    groups: "Product groups",
    aircraft: "Aircraft",
    how: "How it works",
    contact: "Contact",
    cta: "Request a quote",
    menu: "Menu",
  },
  hero: {
    kicker: "Aviation supply · automated",
    title: "The center of aviation supply.",
    em: "center",
    lead: "Center Aero is connected to more than 4,500 aviation suppliers. Our AI-powered automation returns live-checked, confirmed offers in seconds — for every part, every platform.",
    primary: "Request a quote",
    secondary: "List your inventory",
    flow: ["Quote", "Procure", "Buy", "Sell"],
    flowNote: "one automated flow",
    scroll: "Scroll",
    drawing: {
      type: "Boeing 737-800",
      view: "Top view · not to scale",
      span: "Wingspan 35.8 m",
      length: "Length 39.5 m",
      /** Order = product groups: rotables, engine, chemicals, expendables, gse. */
      callouts: ["ATA 32 · Landing gear", "ATA 71 · 72 · Powerplant", "ATA 57 · 28 · Wing box · fuel-tank sealant", "ATA 53 · Fuselage skin · fasteners", "ATA 09 · Towing"],
    },
    /** IATA codes for the 12 hero route origins, in the same order as the route starts. */
    stations: ["IST", "ESB", "FRA", "LHR", "AMS", "CDG", "DXB", "DOH", "JFK", "MIA", "SIN", "VIE"],
    stationsTitle: "IATA airport code",
  },
  console: {
    title: "Live Search Agent",
    subtitle: "Center Aero search agent",
    searching: "Searching network",
    matched: "Matched",
    offers: "offers",
    qty: "Qty",
    cond: "Cond.",
    footer: "Every request reaches the whole network at once.",
    utcLabel: "Current time, UTC (Zulu)",
    stn: "STN",
    stnTitle: "Station — IATA airport code",
    ata: "ATA",
    ataTitle: "ATA 100 chapter",
    urgency: { aog: "AOG", critical: "Critical", routine: "Routine" },
    urgencyTitle: { aog: "AOG — aircraft on ground", critical: "Critical — next available flight", routine: "Routine" },
    condTitles: { NE: "New", NS: "New surplus", OH: "Overhauled", SV: "Serviceable", AR: "As removed" },
    legend: "NE new · NS new surplus · OH overhauled · SV serviceable · AR as removed",
  },
  agent: {
    kicker: "Live Search Agent",
    title: "One request. The whole network. Seconds.",
    lead: "Send a part number once. The agent searches every listed supplier at the same moment, returns comparable offers with condition and station, and keeps the request open until it is matched.",
    points: ["Priority-aware: AOG first, then Critical, then Routine", "Condition code and station on every offer", "Matched offers land in one place — no inbox, no chasing"],
  },
  marquee: {
    label: "Platforms we supply",
    note: "ICAO type designators",
  },
  claims: [
    { caption: "Response", value: "Seconds", label: "from request to comparable offers" },
    { caption: "Coverage", value: "One center", label: "for every product group and platform" },
    { caption: "Availability", value: "Always on", label: "automation that runs while your fleet flies" },
  ],
  how: {
    kicker: "How it works",
    title: "From request to delivery, without the inbox.",
    lead: "Quoting, procurement, buying and selling run on one automated flow — an approach this industry has never seen.",
    steps: [
      {
        title: "Suppliers list live stock",
        body: "Inventory from suppliers worldwide is listed on Center Aero with condition, quantity and availability — kept current automatically.",
      },
      {
        title: "Buyers send one request",
        body: "Part number, quantity, condition, urgency. One request reaches the entire network at the same moment.",
      },
      {
        title: "Automation matches in seconds",
        body: "The matching engine pairs each request with the right stock and returns comparable offers in seconds — no calls, no chasing.",
      },
      {
        title: "Order, track, repeat",
        body: "Confirm on the platform and follow every step from quote to delivery. Then do it again, faster.",
      },
    ] as Step[],
    visuals: {
      stockTitle: "Supplier inventory",
      stockColumns: ["P/N", "Platform", "STN", "ATA", "Cond.", "Qty"],
      requestTitle: "New request",
      rfqTitle: "RFQ · new request",
      matchTitle: "Matching",
      trackTitle: "Order tracking",
      trackSteps: ["Quote accepted", "Order confirmed", "Shipped", "Delivered"],
      requestFields: ["Part number", "Quantity", "Condition", "Urgency", "ATA chapter"],
      requestValues: ["2612-0043-01", "2", "NE / OH", "AOG", "32 · Landing gear"],
      request: "Request",
      supplier: "Supplier",
      send: "Send",
      networkNote: "1 request · whole network",
      condLegend: "NE new · NS new surplus · OH overhauled · SV serviceable",
      drawingNote: "Boeing 737-800 · main landing gear · ATA 32",
      awb: "AWB issued",
    },
  },
  groups: {
    kicker: "Product groups",
    ataLabel: "ATA 100",
    title: "Every part group. One center.",
    lead: "From serialized rotables to consumable hardware and the equipment on the ramp — the full spectrum of aviation supply, listed and matched in one place.",
    items: [
      {
        key: "rotables",
        title: "Rotables",
        body: "Serialized, repairable components that cycle between aircraft and shop: avionics, hydraulics, pneumatics, landing gear and flight-control units.",
        examples: "LRUs · actuators · valves · wheels & brakes",
        ata: "ATA 27 · 29 · 32 · 34",
      },
      {
        key: "engine",
        title: "Engine",
        body: "Engine parts and modules for turbofan, turboprop and turboshaft powerplants — from life-limited parts to accessories and QEC.",
        examples: "LLPs · blades & vanes · fuel nozzles · accessories",
        ata: "ATA 71 – 80",
      },
      {
        key: "chemicals",
        title: "Chemicals",
        body: "Sealants, adhesives, lubricants, hydraulic fluids and coatings, with the shelf-life sensitivity chemicals demand.",
        examples: "sealants · adhesives · lubricants · fluids",
        ata: "ATA 12 · 20",
      },
      {
        key: "expendables",
        title: "Expendables",
        body: "Consumable hardware in the quantities operations really use: fasteners, seals, filters, bearings and standard parts.",
        examples: "fasteners · seals · filters · bearings",
        ata: "AN · MS · NAS",
      },
      {
        key: "gse",
        title: "Ground equipment",
        body: "Equipment for the ramp and the hangar — tow bars, ground power, jacks, stands and tooling that keep turnarounds moving.",
        examples: "tow bars · GPUs · jacks · stands · tooling",
        ata: "ATA 09 · 10 · 12",
      },
    ] as Group[],
    ataTitles: {
      rotables: "ATA 100 chapters — flight controls, hydraulic power, landing gear, navigation",
      engine: "ATA 100 chapters — powerplant, engine, fuel & control, ignition, oil, starting",
      chemicals: "ATA 100 chapters — servicing, standard practices",
      expendables: "Standard-part prefixes — AN, MS, NAS hardware",
      gse: "ATA 100 chapters — towing and taxiing, parking and mooring, servicing",
    },
    plate: {
      title: "Boeing 737-800 · where each group lives on the aircraft",
      note: "Top view · not to scale · ATA 100 chapter references",
    },
    /** CFM LEAP-1B (737 MAX) fan has 18 blades — matches the 18-blade fan drawing. */
    fanCaption: "18-blade fan · LEAP-1B",
    gearCaption: "Main landing gear · ATA 32",
    /** Item legends for the IPC-style card figures (balloon number + part). */
    sealLegend: "1 fillet seal · 2 fay seal · 3 cap seal",
    fastenerLegend: "1 NAS bolt · 2 AN960 washer · 3 MS21042 nut",
    towLegend: "1 tow head · 2 shear pin · 3 wheel set",
    segmentsTitle: "Three segments, one center",
    segments: ["Commercial", "Helicopter", "Business jet"],
    rotableLoop: ["On wing", "Removed", "Overhaul", "Serviceable"],
  },
  aircraft: {
    kicker: "Aircraft platforms",
    title: "Built around the fleets you operate.",
    lead: "Commercial airliners, helicopters and business jets — the platforms our network stocks for, from the most common families to the newest types.",
    more: "Operating a different type? Send the part number — the network answers in seconds.",
    lineup: {
      title: "Drawn to one scale",
      note: "Silhouettes share one scale within each segment · wingspan or rotor diameter · published manufacturer figures, rounded",
      scale: "10 m",
      span: "Wingspan",
      rotor: "Rotor diameter",
    },
    typesLabel: "types",
    segments: [
      {
        key: "commercial",
        label: "Commercial",
        blurb: "Boeing and Airbus families, from narrowbody workhorses to long-haul widebodies.",
        families: [
          { maker: "Boeing", models: ["737 Classic", "737 NG", "737 MAX", "747", "757", "767", "777", "787"] },
          { maker: "Airbus", models: ["A220", "A300 / A310", "A318 / A319", "A320 / A321", "A320neo family", "A330", "A340", "A350", "A380"] },
        ],
      },
      {
        key: "rotary",
        label: "Helicopters",
        blurb: "Leonardo and Airbus Helicopters (formerly Eurocopter) models for offshore, EMS, utility and VIP missions.",
        families: [
          { maker: "Leonardo", models: ["AW109", "AW119", "AW139", "AW169", "AW189"] },
          { maker: "Airbus Helicopters · Eurocopter", models: ["H125 / AS350", "H130 / EC130", "H135 / EC135", "H145 / EC145", "H155 / EC155", "H160", "H175", "H215 / H225"] },
        ],
      },
      {
        key: "business",
        label: "Business jets",
        blurb: "Embraer, Bombardier and Dassault Falcon families across light, super-midsize and large-cabin classes.",
        families: [
          { maker: "Embraer", models: ["Phenom 100", "Phenom 300", "Praetor 500", "Praetor 600", "Legacy 450 / 500", "Legacy 600 / 650", "Lineage 1000"] },
          { maker: "Bombardier", models: ["Learjet 40 / 45", "Learjet 70 / 75", "Challenger 300 / 350", "Challenger 604 / 605 / 650", "Global 5000 / 6000", "Global 5500 / 6500", "Global 7500"] },
          { maker: "Dassault Falcon", models: ["Falcon 900", "Falcon 2000", "Falcon 7X", "Falcon 8X", "Falcon 6X"] },
        ],
      },
    ] as Segment[],
  },
  vision: {
    kicker: "Our vision",
    title: "Aviation never had a center. Now it does.",
    body:
      "Our name is our vision: to be the center of aviation — the one place where every part, every platform and every operator connect. Quoting, procurement, buying and selling run on automation this industry has never seen.",
    closing: "This is only the beginning of a new era in aviation supply.",
    tagline: "Aviation, centered.",
    stand: "Stand centerline — every route ends here.",
  },
  audiences: {
    kicker: "Who it is for",
    title: "One platform, both sides of the deal.",
    buyers: {
      title: "For operators & MROs",
      body: "Airlines, helicopter operators, business-jet fleets and maintenance organisations that need the right part now.",
      points: ["One request reaches every supplier at once", "Comparable offers back in seconds", "Order and track on the platform, end to end", "All product groups and platforms in one place"],
      cta: "Request a quote",
      strip: "AOG · Critical · Routine",
    },
    suppliers: {
      title: "For suppliers & stockists",
      body: "Distributors, stock holders and OEM channels who want their inventory in front of the right buyer — automatically.",
      points: ["List stock once, keep it live", "Matched to real demand, not cold inquiries", "Quotes and orders handled in one flow", "Reach civil, rotary and business aviation buyers"],
      cta: "List your inventory",
      strip: "NE · NS · OH · SV · AR",
    },
  },
  contact: {
    kicker: "Contact",
    title: "Talk to the center.",
    lead: "Send a part number, a fleet or a stock list. We reply with the next step.",
    formTitle: "Request · RFQ",
    pn: "P/N",
    fields: { name: "Name", company: "Company", email: "Work email", need: "Part number or need", message: "Message", priority: "Priority", cond: "Acceptable condition" },
    condOptions: ["NE", "NS", "OH", "SV", "AR"] as CondCode[],
    stationLabel: "Nearest airport",
    /** Geographic fact only (airport of the HQ city). Rendered behind a SHOW_STATION flag — confirm wording with the client before launch. */
    station: "ESB · Ankara Esenboğa",
    placeholders: { name: "Your name", company: "Company", email: "name@company.com", need: "e.g. 2612-0043-01 · Qty 2 · NE/OH", message: "Tell us about your fleet, your stock, or the part you need." },
    submit: "Send request",
    sending: "Sending…",
    sent: "Thank you — your request has been received. We will get back to you shortly.",
    company: "Center Havacılık A.Ş.",
    address: ["Üniversiteler Mah. 1597. Cad. 3/87", "Ankara, Türkiye"],
    addressLabel: "Headquarters",
    hoursLabel: "Platform",
    hours: "Automated matching runs around the clock.",
  },
  footer: {
    tagline: "The center of aviation supply.",
    columns: {
      platform: "Platform",
      groups: "Product groups",
      company: "Company",
    },
    companyLinks: ["Vision", "Contact"],
    rights: "All rights reserved.",
    language: "Language",
    legend: "Condition codes — NE new · NS new surplus · OH overhauled · SV serviceable · AR as removed",
    meta: "Ankara · UTC+3",
  },
};

export type Dictionary = typeof en;

const tr: Dictionary = {
  nav: {
    vision: "Vizyon",
    agent: "Arama Ajanı",
    groups: "Ürün grupları",
    aircraft: "Uçak platformları",
    how: "Nasıl çalışır",
    contact: "İletişim",
    cta: "Teklif al",
    menu: "Menü",
  },
  hero: {
    kicker: "Havacılık tedariki · otomasyonlu",
    title: "Havacılık tedarikinin merkezi.",
    em: "merkezi",
    lead: "Center Aero, 4.500'den fazla havacılık tedarikçisiyle bağlantılıdır. Yapay zekâ destekli otomasyonumuz, her parça ve her platform için canlı doğrulanmış, onaylı teklifleri saniyeler içinde iletir.",
    primary: "Teklif al",
    secondary: "Stoğunu listele",
    flow: ["Teklif", "Tedarik", "Alım", "Satım"],
    flowNote: "tek bir otomatik akış",
    scroll: "Kaydır",
    drawing: {
      type: "Boeing 737-800",
      view: "Üstten görünüş · ölçeksiz",
      span: "Kanat açıklığı 35,8 m",
      length: "Uzunluk 39,5 m",
      callouts: ["ATA 32 · İniş takımı", "ATA 71 · 72 · Motor grubu", "ATA 57 · 28 · Kanat kutusu · yakıt tankı sızdırmazlığı", "ATA 53 · Gövde kaplaması · bağlantı elemanları", "ATA 09 · Çekme"],
    },
    stations: ["IST", "ESB", "FRA", "LHR", "AMS", "CDG", "DXB", "DOH", "JFK", "MIA", "SIN", "VIE"],
    stationsTitle: "IATA havalimanı kodu",
  },
  console: {
    title: "Live Search Agent",
    subtitle: "Center Aero arama ajanı",
    searching: "Ağ taranıyor",
    matched: "Eşleşti",
    offers: "teklif",
    qty: "Adet",
    cond: "Durum",
    footer: "Her talep tüm ağa aynı anda ulaşır.",
    utcLabel: "Şu anki saat, UTC (Zulu)",
    stn: "İST",
    stnTitle: "İstasyon — IATA havalimanı kodu",
    ata: "ATA",
    ataTitle: "ATA 100 bölümü",
    urgency: { aog: "AOG", critical: "Kritik", routine: "Rutin" },
    urgencyTitle: { aog: "AOG — uçak yerde", critical: "Kritik — ilk uygun uçuş", routine: "Rutin" },
    condTitles: { NE: "Yeni", NS: "Yeni fazla stok", OH: "Revizyonlu", SV: "Kullanıma hazır", AR: "Söküldüğü gibi" },
    legend: "NE yeni · NS yeni fazla stok · OH revizyonlu · SV kullanıma hazır · AR söküldüğü gibi",
  },
  agent: {
    kicker: "Live Search Agent",
    title: "Tek talep. Tüm ağ. Saniyeler.",
    lead: "Parça numarasını bir kez gönderin. Ajan, listelenmiş tüm tedarikçileri aynı anda tarar; durum ve istasyon bilgisiyle karşılaştırılabilir teklifleri döndürür ve talep eşleşene kadar açık tutar.",
    points: ["Öncelik farkındalığı: önce AOG, sonra Critical, sonra Routine", "Her teklifte durum kodu ve istasyon", "Eşleşen teklifler tek yerde toplanır; e-posta trafiği yok"],
  },
  marquee: {
    label: "Tedarik sağladığımız platformlar",
    note: "ICAO tip kodları",
  },
  claims: [
    { caption: "Yanıt", value: "Saniyeler", label: "talepten karşılaştırılabilir tekliflere" },
    { caption: "Kapsam", value: "Tek merkez", label: "her ürün grubu ve her platform için" },
    { caption: "Erişilebilirlik", value: "Kesintisiz", label: "filonuz uçarken çalışan otomasyon" },
  ],
  how: {
    kicker: "Nasıl çalışır",
    title: "Talepten teslimata, e-posta trafiği olmadan.",
    lead: "Teklif, tedarik, alım ve satım tek bir otomatik akışta yürür; sektörün daha önce görmediği bir yaklaşım.",
    steps: [
      {
        title: "Tedarikçiler canlı stoklarını listeler",
        body: "Dünyanın dört bir yanındaki tedarikçilerin envanteri; durum, adet ve bulunabilirlik bilgisiyle Center Aero'da listelenir ve otomatik olarak güncel kalır.",
      },
      {
        title: "Alıcılar tek bir talep gönderir",
        body: "Parça numarası, adet, durum, aciliyet. Tek bir talep, tüm ağa aynı anda ulaşır.",
      },
      {
        title: "Otomasyon saniyeler içinde eşleştirir",
        body: "Eşleştirme motoru her talebi doğru stokla buluşturur ve karşılaştırılabilir teklifleri saniyeler içinde döndürür; telefon yok, takip yok.",
      },
      {
        title: "Sipariş ver, takip et, tekrarla",
        body: "Platform üzerinden onaylayın; tekliften teslimata her adımı izleyin. Sonra bir daha, daha hızlı.",
      },
    ],
    visuals: {
      stockTitle: "Tedarikçi envanteri",
      stockColumns: ["P/N", "Platform", "İST", "ATA", "Durum", "Adet"],
      requestTitle: "Yeni talep",
      rfqTitle: "RFQ · yeni talep",
      matchTitle: "Eşleştirme",
      trackTitle: "Sipariş takibi",
      trackSteps: ["Teklif kabul edildi", "Sipariş onaylandı", "Kargoda", "Teslim edildi"],
      requestFields: ["Parça numarası", "Adet", "Durum", "Aciliyet", "ATA bölümü"],
      requestValues: ["2612-0043-01", "2", "NE / OH", "AOG", "32 · İniş takımı"],
      request: "Talep",
      supplier: "Tedarikçi",
      send: "Gönder",
      networkNote: "1 talep · tüm ağ",
      condLegend: "NE yeni · NS yeni fazla stok · OH revizyonlu · SV kullanıma hazır",
      drawingNote: "Boeing 737-800 · ana iniş takımı · ATA 32",
      awb: "AWB kesildi",
    },
  },
  groups: {
    kicker: "Ürün grupları",
    ataLabel: "ATA 100",
    title: "Her parça grubu. Tek merkez.",
    lead: "Seri numaralı rotable'lardan sarf donanımına ve apron ekipmanına kadar havacılık tedarikinin tüm yelpazesi; tek bir yerde listelenir ve eşleştirilir.",
    items: [
      {
        key: "rotables",
        title: "Rotable",
        body: "Uçak ile atölye arasında döngü halinde çalışan, seri numaralı ve onarılabilir bileşenler: aviyonik, hidrolik, pnömatik, iniş takımı ve uçuş kontrol üniteleri.",
        examples: "LRU · aktüatör · valf · tekerlek ve fren",
        ata: "ATA 27 · 29 · 32 · 34",
      },
      {
        key: "engine",
        title: "Motor",
        body: "Turbofan, turboprop ve turboşaft motorlar için parça ve modüller; ömür sınırlı parçalardan aksesuar ve QEC'e kadar.",
        examples: "LLP · kanatçık ve stator · yakıt nozulu · aksesuar",
        ata: "ATA 71 – 80",
      },
      {
        key: "chemicals",
        title: "Kimyasallar",
        body: "Sızdırmazlık malzemeleri, yapıştırıcılar, yağlayıcılar, hidrolik sıvılar ve kaplamalar; kimyasalların gerektirdiği raf ömrü hassasiyetiyle.",
        examples: "sızdırmazlık · yapıştırıcı · yağlayıcı · sıvılar",
        ata: "ATA 12 · 20",
      },
      {
        key: "expendables",
        title: "Sarf malzemeleri",
        body: "Operasyonun gerçekten kullandığı adetlerde sarf donanımı: bağlantı elemanları, contalar, filtreler, rulmanlar ve standart parçalar.",
        examples: "bağlantı elemanı · conta · filtre · rulman",
        ata: "AN · MS · NAS",
      },
      {
        key: "gse",
        title: "Yer ekipmanları",
        body: "Apron ve hangar için ekipman: çekme çubukları, yer güç üniteleri, krikolar, platformlar ve takımlar; turnaround'ları akışta tutar.",
        examples: "çekme çubuğu · GPU · kriko · platform · takım",
        ata: "ATA 09 · 10 · 12",
      },
    ],
    ataTitles: {
      rotables: "ATA 100 bölümleri — uçuş kontrolleri, hidrolik güç, iniş takımı, seyrüsefer",
      engine: "ATA 100 bölümleri — motor grubu, motor, yakıt ve kontrol, ateşleme, yağ, çalıştırma",
      chemicals: "ATA 100 bölümleri — servis, standart uygulamalar",
      expendables: "Standart parça ön ekleri — AN, MS, NAS donanım",
      gse: "ATA 100 bölümleri — çekme ve taksi, park ve bağlama, servis",
    },
    plate: {
      title: "Boeing 737-800 · her grubun uçaktaki yeri",
      note: "Üstten görünüş · ölçeksiz · ATA 100 bölüm referansları",
    },
    fanCaption: "18 kanatçıklı fan · LEAP-1B",
    gearCaption: "Ana iniş takımı · ATA 32",
    sealLegend: "1 kenar fitili · 2 ara yüzey sızdırmazlığı · 3 kapak sızdırmazlığı",
    fastenerLegend: "1 NAS cıvata · 2 AN960 pul · 3 MS21042 somun",
    towLegend: "1 çekme başlığı · 2 kesme pimi · 3 tekerlek takımı",
    segmentsTitle: "Üç segment, tek merkez",
    segments: ["Sivil", "Helikopter", "Business jet"],
    rotableLoop: ["Uçakta", "Söküldü", "Revizyon", "Kullanıma hazır"],
  },
  aircraft: {
    kicker: "Uçak platformları",
    title: "İşlettiğiniz filolar etrafında kurgulandı.",
    lead: "Sivil yolcu uçakları, helikopterler ve business jetler; ağımızın stok tuttuğu platformlar, en yaygın ailelerden en yeni tiplere kadar.",
    more: "Farklı bir tip mi işletiyorsunuz? Parça numarasını gönderin; ağ saniyeler içinde yanıt verir.",
    lineup: {
      title: "Tek ölçekte çizim",
      note: "Siluetler her segment içinde tek ölçeği paylaşır · kanat açıklığı ya da rotor çapı · yayımlanmış üretici değerleri, yuvarlatılmış",
      scale: "10 m",
      span: "Kanat açıklığı",
      rotor: "Rotor çapı",
    },
    typesLabel: "tip",
    segments: [
      {
        key: "commercial",
        label: "Sivil",
        blurb: "Boeing ve Airbus aileleri; dar gövdeli iş atlarından uzun menzilli geniş gövdelilere.",
        families: [
          { maker: "Boeing", models: ["737 Classic", "737 NG", "737 MAX", "747", "757", "767", "777", "787"] },
          { maker: "Airbus", models: ["A220", "A300 / A310", "A318 / A319", "A320 / A321", "A320neo ailesi", "A330", "A340", "A350", "A380"] },
        ],
      },
      {
        key: "rotary",
        label: "Helikopter",
        blurb: "Offshore, ambulans, genel maksat ve VIP görevleri için Leonardo ve Airbus Helicopters (eski adıyla Eurocopter) modelleri.",
        families: [
          { maker: "Leonardo", models: ["AW109", "AW119", "AW139", "AW169", "AW189"] },
          { maker: "Airbus Helicopters · Eurocopter", models: ["H125 / AS350", "H130 / EC130", "H135 / EC135", "H145 / EC145", "H155 / EC155", "H160", "H175", "H215 / H225"] },
        ],
      },
      {
        key: "business",
        label: "Business jet",
        blurb: "Hafif, süper orta ve geniş kabin sınıflarında Embraer, Bombardier ve Dassault Falcon aileleri.",
        families: [
          { maker: "Embraer", models: ["Phenom 100", "Phenom 300", "Praetor 500", "Praetor 600", "Legacy 450 / 500", "Legacy 600 / 650", "Lineage 1000"] },
          { maker: "Bombardier", models: ["Learjet 40 / 45", "Learjet 70 / 75", "Challenger 300 / 350", "Challenger 604 / 605 / 650", "Global 5000 / 6000", "Global 5500 / 6500", "Global 7500"] },
          { maker: "Dassault Falcon", models: ["Falcon 900", "Falcon 2000", "Falcon 7X", "Falcon 8X", "Falcon 6X"] },
        ],
      },
    ],
  },
  vision: {
    kicker: "Vizyonumuz",
    title: "Havacılığın hiç bir merkezi olmadı. Artık var.",
    body:
      "Adımız vizyonumuzdur: havacılığın merkezi olmak; her parçanın, her platformun ve her operatörün buluştuğu tek yer. Teklif, tedarik, alım ve satım süreçleri bu sektörün daha önce görmediği bir otomasyonla yürür.",
    closing: "Bu, havacılık tedarikinde yeni bir çağın yalnızca başlangıcı.",
    tagline: "Havacılık, merkezde.",
    stand: "Park hattı — her rota burada biter.",
  },
  audiences: {
    kicker: "Kimin için",
    title: "Tek platform, masanın iki tarafı.",
    buyers: {
      title: "Operatörler ve MRO'lar için",
      body: "Doğru parçaya hemen ihtiyaç duyan havayolları, helikopter operatörleri, business jet filoları ve bakım kuruluşları.",
      points: ["Tek talep, aynı anda tüm tedarikçilere ulaşır", "Karşılaştırılabilir teklifler saniyeler içinde döner", "Sipariş ve takip uçtan uca platformda", "Tüm ürün grupları ve platformlar tek yerde"],
      cta: "Teklif al",
      strip: "AOG · Kritik · Rutin",
    },
    suppliers: {
      title: "Tedarikçiler ve stokçular için",
      body: "Envanterini doğru alıcının önüne otomatik olarak çıkarmak isteyen distribütörler, stok sahipleri ve OEM kanalları.",
      points: ["Stoğu bir kez listele, canlı kalsın", "Soğuk sorgular değil, gerçek talep ile eşleş", "Teklif ve siparişler tek akışta yönetilsin", "Sivil, helikopter ve business jet alıcılarına ulaş"],
      cta: "Stoğunu listele",
      strip: "NE · NS · OH · SV · AR",
    },
  },
  contact: {
    kicker: "İletişim",
    title: "Merkezle konuşun.",
    lead: "Bir parça numarası, bir filo ya da bir stok listesi gönderin. Bir sonraki adımla dönelim.",
    formTitle: "Talep · RFQ",
    pn: "P/N",
    fields: { name: "Ad Soyad", company: "Şirket", email: "İş e-postası", need: "Parça numarası veya ihtiyaç", message: "Mesaj", priority: "Öncelik", cond: "Kabul edilen durum" },
    condOptions: ["NE", "NS", "OH", "SV", "AR"],
    stationLabel: "En yakın havalimanı",
    station: "ESB · Ankara Esenboğa",
    placeholders: { name: "Adınız", company: "Şirket", email: "ad@sirket.com", need: "örn. 2612-0043-01 · 2 adet · NE/OH", message: "Filonuzu, stoğunuzu ya da ihtiyaç duyduğunuz parçayı anlatın." },
    submit: "Talep gönder",
    sending: "Gönderiliyor…",
    sent: "Teşekkürler; talebiniz alındı. Kısa süre içinde size dönüş yapacağız.",
    company: "Center Havacılık A.Ş.",
    address: ["Üniversiteler Mah. 1597. Cad. 3/87", "Ankara, Türkiye"],
    addressLabel: "Merkez",
    hoursLabel: "Platform",
    hours: "Otomatik eşleştirme günün her saati çalışır.",
  },
  footer: {
    tagline: "Havacılık tedarikinin merkezi.",
    columns: {
      platform: "Platform",
      groups: "Ürün grupları",
      company: "Şirket",
    },
    companyLinks: ["Vizyon", "İletişim"],
    rights: "Tüm hakları saklıdır.",
    language: "Dil",
    legend: "Durum kodları — NE yeni · NS yeni fazla stok · OH revizyonlu · SV kullanıma hazır · AR söküldüğü gibi",
    meta: "Ankara · UTC+3",
  },
};

export const dictionary: Record<Lang, Dictionary> = { en, tr };

/** Language-neutral platform strip (two rows). */
export const PLATFORM_ROWS: string[][] = [
  ["Boeing 737", "Boeing 747", "Boeing 757", "Boeing 767", "Boeing 777", "Boeing 787", "Airbus A220", "Airbus A320 family", "Airbus A330", "Airbus A340", "Airbus A350", "Airbus A380"],
  ["Leonardo AW139", "Leonardo AW169", "Leonardo AW189", "Airbus H125", "Airbus H135", "Airbus H145", "Airbus H160", "Airbus H175", "Embraer Phenom 300", "Embraer Praetor 600", "Bombardier Challenger 350", "Bombardier Global 7500", "Dassault Falcon 7X", "Dassault Falcon 8X", "Dassault Falcon 6X"],
];

type ConsoleRequest = {
  pn: string;
  platform: string;
  /** IATA station of the requesting party. */
  stn: string;
  /** ATA 100 chapter, or "—" for off-aircraft ground equipment. */
  ata: string;
  qty: number;
  cond: CondCode;
  urgency: Urgency;
  offers: number;
  time: string;
};

/**
 * Illustrative requests for the hero console — part numbers, stations, quantities,
 * ATA chapters and urgencies are examples, not real inventory or real traffic.
 */
export const CONSOLE_REQUESTS = [
  { pn: "2612-0043-01", platform: "Boeing 737-800", stn: "IST", ata: "32", qty: 2, cond: "OH", urgency: "AOG", offers: 5, time: "1.6s" },
  { pn: "A329-1062-01", platform: "Airbus A320neo", stn: "FRA", ata: "29", qty: 1, cond: "NE", urgency: "ROUTINE", offers: 3, time: "2.1s" },
  { pn: "5320-V0035-1", platform: "Leonardo AW139", stn: "ESB", ata: "62", qty: 4, cond: "NS", urgency: "CRITICAL", offers: 4, time: "1.9s" },
  { pn: "F7X-2210-05", platform: "Dassault Falcon 7X", stn: "DXB", ata: "27", qty: 1, cond: "SV", urgency: "ROUTINE", offers: 2, time: "2.4s" },
  { pn: "MS21042L3", platform: "Expendable · multi-platform", stn: "AMS", ata: "20", qty: 500, cond: "NE", urgency: "ROUTINE", offers: 6, time: "1.2s" },
  { pn: "GPU-28V-400", platform: "Ground equipment", stn: "LHR", ata: "—", qty: 1, cond: "NE", urgency: "ROUTINE", offers: 3, time: "2.0s" },
  { pn: "EC145-8100-3", platform: "Airbus H145", stn: "VIE", ata: "32", qty: 2, cond: "OH", urgency: "ROUTINE", offers: 4, time: "1.8s" },
  { pn: "PH300-3300-01", platform: "Embraer Phenom 300", stn: "JFK", ata: "34", qty: 1, cond: "NE", urgency: "ROUTINE", offers: 3, time: "2.2s" },
  { pn: "CH350-0871-02", platform: "Bombardier Challenger 350", stn: "DOH", ata: "27", qty: 2, cond: "SV", urgency: "CRITICAL", offers: 3, time: "1.7s" },
  { pn: "787-4410-11", platform: "Boeing 787-9", stn: "SIN", ata: "72", qty: 1, cond: "NE", urgency: "AOG", offers: 4, time: "1.5s" },
] as const satisfies readonly ConsoleRequest[];
