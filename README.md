# 💰 Harcama Takip Uygulaması

Kişisel gelir/gider takibi için Next.js full-stack uygulama.

**Özellikler:**
- ✅ Gelir ve gider kaydı (40+ kategori)
- ✅ Aylık istatistikler ve grafikler
- ✅ Lokasyon bilgisi (opsiyonel)
- ✅ Basit auth sistemi
- ✅ Mobil uyumlu tasarım
- ✅ Docker desteği
- ✅ ENV'den kullanıcı yapılandırması

---

## 🚀 Hızlı Başlangıç (Local)

### Adım 1: Bağımlılıkları Yükle
```bash
npm install
```

### Adım 2: Environment Ayarla

`.env.example` dosyasını `.env` olarak kopyala ve düzenle:

```bash
cp .env.example .env
```

```env
# Database
DATABASE_URL="postgresql://postgres:SIFREN@localhost:5432/expense_track?schema=public"

# JWT Secret (rastgele uzun string)
JWT_SECRET="cok-gizli-rastgele-bir-anahtar-123"

# Admin Kullanıcı (seed'de oluşturulacak)
ADMIN_USERNAME="senin_kullanici_adin"
ADMIN_PASSWORD="senin_sifren"
ADMIN_EMAIL="senin@email.com"
ADMIN_FIRSTNAME="Adın"
ADMIN_LASTNAME="Soyadın"
```

### Adım 3: Veritabanını Hazırla

```bash
# Prisma client oluştur
npx prisma generate


# Kategorileri ve admin kullanıcıyı ekle
npx prisma db seed
```
npx prisma db push

### Adım 4: Çalıştır

```bash
npm run dev
```

Tarayıcıda aç: **http://localhost:3000**

---

## 🐳 Docker ile Çalıştırma

### Yöntem 1: Tek Container (Harici PostgreSQL varsa) ⭐

Sunucuda zaten PostgreSQL varsa, sadece app container'ı yeterli:

```bash
# 1. Build
docker build -t expense .

# 2a. .env dosyası ile çalıştır (ÖNERİLEN)
docker run -d \
  --name expense \
  --restart unless-stopped \
  -p 4554:3000 \
  --env-file .env \
  expense

# 2b. Veya tek tek env vererek çalıştır
docker run -d \
  --name expense \
  --restart unless-stopped \
  -p 4554:3000 \
  -e DATABASE_URL="postgresql://postgres:DB_SIFREN@DB_HOST:5432/expense_track" \
  -e JWT_SECRET="openssl-rand-base64-32-ile-uret" \
  -e ADMIN_USERNAME="admin" \
  -e ADMIN_PASSWORD="guclu-sifre" \
  -e ADMIN_EMAIL="admin@example.com" \
  -e ADMIN_FIRSTNAME="Ad" \
  -e ADMIN_LASTNAME="Soyad" \
  expense

# 3. Aç: http://localhost:4554
# Başlangıçta: migrations varsa `prisma migrate deploy`, yoksa `prisma db push` çalışır.
# Seed gerekiyorsa (admin/kategoriler için) container içine girip manuel çalıştır:
# docker exec -it expense npx prisma db seed
```

**NOT:** Container başlarken otomatik olarak:
- `prisma db push` (tablolar oluşur)
- `prisma db seed` (kategoriler + admin user)

**`.env` dosyası örneği (sunucuya kopyala):**
```env
DATABASE_URL=postgresql://postgres:SIFREN@172.17.0.1:5432/expense_track
JWT_SECRET=openssl-ile-uretilen-uzun-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=guclu-sifre
ADMIN_EMAIL=admin@example.com
ADMIN_FIRSTNAME=Ad
ADMIN_LASTNAME=Soyad
```

**DATABASE_URL için DB_HOST:**
- Aynı sunucudaysa: `host.docker.internal` (Mac/Win) veya `172.17.0.1` (Linux)
- Farklı sunucudaysa: DB sunucusunun IP'si

**Public image olarak çalıştırma:** Image'ı (örn. `kullanici/expense:latest`) çekip sadece ortam değişkenlerini vererek çalıştırabilirsin:
```bash
docker run -d \
  --name expense \
  -p 4554:3000 \
  -e DATABASE_URL="postgresql://postgres:SIFREN@DB_HOST:5432/expense_track" \
  -e JWT_SECRET="openssl-rand-base64-32-ile-uret" \
  -e ADMIN_USERNAME="admin" \
  -e ADMIN_PASSWORD="guclu-sifre" \
  -e ADMIN_EMAIL="admin@example.com" \
  -e ADMIN_FIRSTNAME="Ad" \
  -e ADMIN_LASTNAME="Soyad" \
  kullanici/expense:latest
```
Başlangıçta migrate varsa `migrate deploy`, yoksa `db push` çalışır; seed lazımsa manuel çalıştır (`docker exec -it expense npx prisma db seed`).

**Günlük komutlar:**
```bash
docker start expense      # Başlat
docker stop expense       # Durdur
docker restart expense    # Restart
docker logs -f expense    # Logları izle
docker rm -f expense      # Sil
```

---

### Yöntem 2: Docker Compose (PostgreSQL dahil)

```bash
# 1. Proje klasörüne git
cd /path/to/expenseTrack

# 2. .env dosyası oluştur (KENDİ ŞİFRELERİNİ YAZ!)
cat > .env << 'EOF'
POSTGRES_PASSWORD=GucluPostgresSifresi123
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=GucluAdminSifresi456
ADMIN_EMAIL=ben@email.com
ADMIN_FIRSTNAME=Adim
ADMIN_LASTNAME=Soyadim
EOF

# 3. JWT_SECRET'ı düzelt (yukarıdaki komut çalışmaz, manuel üret)
# Bu komutu çalıştır ve çıktıyı .env'deki JWT_SECRET'a yapıştır:
openssl rand -base64 32

# 4. Build ve başlat
docker compose up -d --build

# 5. Database'i hazırla (SADECE İLK KURULUMDA)
docker compose exec app npx prisma db push
docker compose exec app npx prisma db seed

# 6. Aç: http://localhost:3000
```

### 📌 Farklı Port Kullanmak (örn: 4554)

`docker-compose.yml` dosyasında portu değiştir:

```yaml
ports:
  - "4554:3000"  # dış_port:iç_port
```

Veya override ile:

```bash
# docker-compose.override.yml oluştur
cat > docker-compose.override.yml << 'EOF'
services:
  app:
    ports:
      - "4554:3000"
EOF

# Başlat
docker compose up -d --build
```

Sonra aç: **http://localhost:4554**

### 🔄 Günlük Kullanım

```bash
# Başlat
docker compose up -d

# Durdur
docker compose down

# Logları izle
docker compose logs -f app

# Restart
docker compose restart app

# Tamamen sil (VERİLER DAHİL!)
docker compose down -v
```

---

### Yöntem 2: Sadece App Container (Harici PostgreSQL varsa)

Eğer image'ı Docker Hub'a push ettiysen:

```bash
# docker-compose.yml dosyası:
services:
  app:
    image: kullaniciadin/expense-track:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/expense_track
      - JWT_SECRET=${JWT_SECRET}
      - ADMIN_USERNAME=${ADMIN_USERNAME}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - ADMIN_FIRSTNAME=${ADMIN_FIRSTNAME}
      - ADMIN_LASTNAME=${ADMIN_LASTNAME}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=expense_track
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
# .env dosyasını oluştur ve çalıştır
docker compose up -d
```

---

## 📦 Docker Image Oluşturma ve Paylaşma

### Image Build Et

```bash
# Build
docker build -t expense-track:latest .

# Tag (Docker Hub için)
docker tag expense-track:latest kullaniciadin/expense-track:latest

# Push
docker login
docker push kullaniciadin/expense-track:latest
```

### Başkasına Verme

Birine bu uygulamayı vermek için:

1. **docker-compose.yml** ve **.env.example** dosyalarını paylaş
2. Karşı taraf sadece şunu yapar:

```bash
# .env dosyası oluştur
cp .env.example .env
nano .env  # Kendi bilgilerini gir

# Çalıştır
docker compose up -d
docker compose exec app npx prisma db push
docker compose exec app npx prisma db seed
```

**Güvenlik Notu:** `.env` dosyasını ASLA paylaşma! Sadece `.env.example` paylaşılır.

---

## 📋 Tüm Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Development server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npx prisma generate` | Prisma client oluştur |
| `npx prisma db push` | Database şemasını uygula |
| `npx prisma db seed` | Admin user + kategorileri ekle |
| `npx prisma studio` | Database GUI (http://localhost:5555) |

### Docker Komutları

| Komut | Açıklama |
|-------|----------|
| `docker compose up -d` | Servisleri başlat |
| `docker compose down` | Servisleri durdur |
| `docker compose down -v` | Servisleri + verileri sil |
| `docker compose logs -f app` | Logları izle |
| `docker compose exec app sh` | Container'a bağlan |

---

## 🔐 Güvenlik

### Production için yapılması gerekenler:

1. **JWT_SECRET** (ZORUNLU): Rastgele, uzun (32+ karakter) bir string kullan
   ```bash
   # macOS/Linux - Terminal'de çalıştır ve çıktıyı .env'e kopyala:
   openssl rand -base64 32
   
   # veya
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. **POSTGRES_PASSWORD** (ZORUNLU): Güçlü şifre kullan
   ```bash
   # Rastgele şifre üret:
   openssl rand -base64 16
   ```

3. **ADMIN_PASSWORD** (ZORUNLU): Tahmin edilemez şifre

4. **HTTPS**: Production'da mutlaka SSL kullan (nginx/traefik ile)

5. **.env dosyasını commit etme!** `.gitignore`'da olmalı

### Örnek .env dosyası:
```env
POSTGRES_PASSWORD=RastgelePostgresŞifresi123
JWT_SECRET=openssl-ile-uretilen-uzun-random-string
ADMIN_PASSWORD=GüçlüAdminŞifresi456
ADMIN_USERNAME=kullaniciadim
ADMIN_EMAIL=ben@email.com
ADMIN_FIRSTNAME=Adım
ADMIN_LASTNAME=Soyadım
```

### Güvenlik Özellikleri:
- ✅ Şifre hash (bcrypt, 10 round)
- ✅ JWT token (30 gün expire)
- ✅ HttpOnly cookie (XSS koruması)
- ✅ Rate limiting (Login: 5/dk, Register: 3/dk)
- ✅ Matematik captcha (bot koruması)
- ✅ Kayıt doğrulama kodu (314159265)
- ✅ Database portu kapalı (sadece app erişebilir)

---

## 📁 Proje Yapısı

```
expenseTrack/
├── app/
│   ├── api/
│   │   ├── auth/         # Login, register, logout
│   │   ├── expenses/     # CRUD
│   │   ├── categories/   # Liste
│   │   └── stats/        # İstatistikler
│   ├── dashboard/        # Ana sayfa
│   └── page.tsx          # Login
├── components/
│   ├── ExpenseForm.tsx
│   ├── ExpenseList.tsx
│   └── StatsCharts.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── .env.example          # ← Paylaşılabilir
├── .env                  # ← PAYLAŞILMAZ!
├── docker-compose.yml
└── Dockerfile
```

---

## 🏷️ Kategoriler

### Giderler (32 adet)
🛒 Market | 🍞 Ekmek | 🚬 Sigara | 🍿 Abur Cubur | 🍔 Yemek | 🍽️ Restoran | ☕ Kahve | 🚌 Ulaşım | ⛽ Benzin | 🔧 Araba Tamir | 🚗 Araba Bakım | 📄 Fatura | 💡 Elektrik | 💧 Su | 🔥 Doğalgaz | 📶 Internet | 📱 Telefon | 🏠 Kira | 🛋️ Ev Eşyası | 🔨 Tadilat | 🛠️ Tamirat | 👕 Giyim | 💊 Sağlık | 📚 Eğitim | 🎬 Eğlence | 🏋️ Spor | 🎁 Hediye | ❤️ Bağış | 💳 Borç Ödeme | 🛡️ Sigorta | 📋 Vergi | 📦 Diğer

### Gelirler (11 adet)
💰 Maaş | 💼 Ek İş | 💻 Freelance | 🏘️ Kira Gelir | 📈 Yatırım | 🏦 Faiz | 🎉 İkramiye | 🎀 Hediye | 🤝 Borç Tahsil | 🏷️ Satış | ✨ Diğer

---

## 🛠️ Sorun Giderme

### Database bağlantı hatası
```bash
# PostgreSQL çalışıyor mu?
docker compose ps

# Logları kontrol et
docker compose logs db
```

### Seed çalışmıyor
```bash
# Manuel çalıştır
docker compose exec app npx tsx prisma/seed.ts
```

### Port kullanımda
```bash
# 3000 portu dolu ise
docker compose down
lsof -i :3000
kill -9 <PID>
docker compose up -d
```

---

## 📱 Mobil Erişim

Aynı ağdaki telefondan erişmek için:

```bash
# Mac IP adresini bul
ifconfig | grep "inet " | grep -v 127.0.0.1

# Telefonda aç: http://192.168.x.x:3000
```

---

## 📄 Lisans

MIT
