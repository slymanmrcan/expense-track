# 💰 Harcama Takip Uygulaması

Kişisel gelir/gider takibi için Next.js full-stack uygulama.

**Özellikler:**

- ✅ Gelir ve gider kaydı (40+ kategori)
- ✅ Aylık istatistikler ve grafikler
- ✅ Lokasyon bilgisi (opsiyonel)
- ✅ **Güvenli Davet Kodlu Kayıt Sistemi**
- ✅ Mobil uyumlu tasarım (PWA)
- ✅ Docker Compose desteği

---

## 🚀 Hızlı Başlangıç (Docker Compose) - ÖNERİLEN

### Adım 1: Projeyi İndir

```bash
git clone https://github.com/slymanmrcan/expense-track.git
cd expenseTrack
```

### Adım 2: Environment Ayarlarını Yap

`.env` dosyası oluşturun:

```bash
cat > .env << 'EOF'
# PostgreSQL Şifresi
POSTGRES_PASSWORD=BURAYA_GUCLU_BIR_SIFRE_YAZ

# JWT Secret (openssl rand -base64 32 ile üret)
JWT_SECRET=BURAYA_RASTGELE_UZUN_STRING

# Davet Kodu (Kayıt olurken girilecek gizli kod)
REGISTRATION_CODE=BURAYA_GIZLI_DAVET_KODU

# App İsmi (Opsiyonel)
NEXT_PUBLIC_APP_NAME="Harcama Takip"
EOF
```

**Önemli Notlar:**

- `POSTGRES_PASSWORD`: Veritabanı şifresi, güçlü bir şifre belirleyin
- `JWT_SECRET`: `openssl rand -base64 32` komutu ile üretebilirsiniz
- `REGISTRATION_CODE`: Sadece bu kodu bilenler kayıt olabilir (örnek: `MySecret2024`)

### Adım 3: Çalıştır

```bash
docker compose up -d
```

Bu komut:

1. PostgreSQL veritabanını başlatır
2. Uygulamayı build eder ve başlatır
3. Otomatik olarak veritabanı tablolarını oluşturur
4. Varsayılan kategorileri ekler (Market, Maaş, vb.)

### Adım 4: İlk Kullanıcıyı Oluştur

Tarayıcıda açın: **http://localhost:3000**

1. "Kayıt Ol" butonuna tıklayın
2. Bilgilerinizi girin
3. **Doğrulama Kodu** alanına `.env` dosyasında belirlediğiniz `REGISTRATION_CODE` değerini girin
4. Kayıt olun ve giriş yapın

---

## 🛠️ Yönetim Komutları

### Uygulamayı Durdurma

```bash
docker compose down
```

### Verileri Sıfırlama (Her şeyi siler!)

```bash
docker compose down -v
```

### Logları İzleme

```bash
docker compose logs -f app
```

### Container İçine Girme

```bash
docker compose exec app sh
```

---

## 📱 Mobil Erişim (PWA)

Bu uygulama Progressive Web App (PWA) uyumludur. Telefondan tarayıcı ile girdiğinizde "Ana Ekrana Ekle" diyerek bir uygulama gibi kullanabilirsiniz.

**Aynı ağdaki cihazlardan erişim:**

```bash
# Bilgisayarınızın IP adresini bulun
ifconfig | grep "inet " | grep -v 127.0.0.1

# Telefondan şu şekilde erişin:
# http://192.168.1.XX:3000
```

---

## 💻 Geliştirici Modu (Local Kurulum)

### Gereksinimler

- Node.js 18+
- PostgreSQL

### Kurulum

```bash
npm install
```

### .env Ayarla

```env
DATABASE_URL="postgresql://postgres:sifre@localhost:5432/expense_track?schema=public"
JWT_SECRET="gizli-anahtar"
REGISTRATION_CODE="davet-kodu"
NEXT_PUBLIC_APP_NAME="Harcama Takip"
```

### Veritabanını Hazırla

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### Çalıştır

```bash
npm run dev
```

---

## 🔒 Güvenlik Özellikleri

- ✅ Rate Limiting (Dakikada 60 istek limiti)
- ✅ Content Security Policy (CSP) Headers
- ✅ HttpOnly Cookies
- ✅ Davet Kodu ile Kayıt Koruması
- ✅ Dashboard için Middleware Koruması
- ✅ Fake PHP Header (Security through obscurity)

---

## 📁 Proje Yapısı

```
expenseTrack/
├── app/                  # Next.js App Router sayfaları
├── components/           # React bileşenleri
├── lib/                  # Yardımcı fonksiyonlar
├── prisma/
│   ├── schema.prisma     # Veritabanı şeması
│   └── seed.ts           # Başlangıç kategorileri
├── types/                # TypeScript tip tanımları
├── middleware.ts         # Rate limit & güvenlik
├── docker-compose.yml    # Docker yapılandırması
└── Dockerfile            # App container tanımı
```

---

## 📄 Lisans

MIT
