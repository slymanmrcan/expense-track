# 💰 Harcama Takip Uygulaması

Kişisel gelir/gider takibi için Next.js full-stack uygulama.

**Özellikler:**

- ✅ Gelir ve gider kaydı (40+ kategori)
- ✅ Aylık istatistikler ve grafikler
- ✅ Lokasyon bilgisi (opsiyonel)
- ✅ Basit auth sistemi
- ✅ Mobil uyumlu tasarım
- ✅ Docker Compose desteği
- ✅ ENV'den kullanıcı yapılandırması

---

## 🚀 Hızlı Başlangıç (Docker Compose) - ÖNERİLEN

Bu yöntem, hem uygulamayı hem de PostgreSQL veritabanını tek komutla kurar ve çalıştırır.

### Adım 1: Projeyi İndir

```bash
git clone https://github.com/kullaniciadi/expenseTrack.git
cd expenseTrack
```

### Adım 2: Environment Ayarlarını Yap

`.env` dosyası oluşturun ve aşağıdaki içeriği (kendinize göre düzenleyerek) yapıştırın:

```bash
# Şifreler için güçlü değerler kullanın!
cat > .env << 'EOF'
# PostgreSQL
POSTGRES_PASSWORD=GucluDbSifresi123

# App
JWT_SECRET=RastgeleUzunBirStringUretipBurayaYazin
NEXT_PUBLIC_APP_NAME="Harcama Takip"

# Admin Kullanıcı (İlk kurulumda oluşturulur)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=GucluAdminSifresi123
ADMIN_EMAIL=admin@example.com
ADMIN_FIRSTNAME=Admin
ADMIN_LASTNAME=User
EOF
```

> **Önemli:** `JWT_SECRET` için rastgele bir değer kullanın (`openssl rand -base64 32`).

### Adım 3: Çalıştır

```bash
docker compose up -d
```

Bu komut:

1. PostgreSQL veritabanını başlatır.
2. Uygulamayı build eder ve başlatır.
3. Otomatik olarak veritabanı tablolarını oluşturur (`db push`).
4. Varsayılan kategorileri ve admin kullanıcısını ekler (`seed`).

### Adım 4: Uygulamaya Eriş

Tarayıcıda açın: **http://localhost:3000**

Giriş bilgileri (`.env` dosyasında belirledikleriniz):

- **Kullanıcı Adı:** `admin`
- **Şifre:** `GucluAdminSifresi123`

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

### Manuel Seed Çalıştırma (Gerekirse)

Eğer kategoriler gelmediyse:

```bash
docker compose exec app npx prisma db seed
```

---

## 📱 Mobil Erişim (Local Network)

Aynı ağdaki telefonunuzdan erişmek için bilgisayarınızın local IP adresini kullanın.

1. **IP Adresini Bul:**

   ```bash
   # Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   # Veya ayarlar -> Ağ kısmından bakabilirsiniz.
   ```

2. **Telefondan Aç:**
   `http://192.168.1.XX:3000` (XX yerine kendi IP sonunuz gelecek)

---

## 💻 Geliştirici Modu (Local Kurulum)

Docker kullanmadan, doğrudan geliştirmek isterseniz:

### Gereksinimler

- Node.js 18+
- PostgreSQL (veya Docker ile sadece db çalıştırabilirsiniz)

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. .env Ayarla

```env
DATABASE_URL="postgresql://postgres:sifre@localhost:5432/expense_track?schema=public"
JWT_SECRET="gizli-anahtar"
# ... diğer ayarlar
```

### 3. Veritabanını Hazırla

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

---

## 📁 Proje Yapısı

```
expenseTrack/
├── app/                  # Next.js App Router sayfaları
├── components/           # React bileşenleri
├── lib/                  # Yardımcı fonksiyonlar ve config
├── prisma/
│   ├── schema.prisma     # Veritabanı şeması
│   └── seed.ts           # Başlangıç verileri
├── public/               # Statik dosyalar
├── docker-compose.yml    # Docker yapılandırması
└── Dockerfile            # App container tanımı
```

## 📄 Lisans

MIT
