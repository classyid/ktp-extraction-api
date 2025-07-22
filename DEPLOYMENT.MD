# 🚀 Panduan Deployment KTP Extraction API

## 📋 Prerequisites

Sebelum memulai deployment, pastikan Anda memiliki:

- ✅ **Google Account** yang aktif
- ✅ **Gemini AI API Key** ([Dapatkan disini](https://ai.google.dev))
- ✅ **Access ke Google Apps Script** ([script.google.com](https://script.google.com))
- ✅ **Google Drive** untuk penyimpanan file
- ✅ **Google Sheets** untuk logging data

## 🔧 Step 1: Persiapan API Key Gemini AI

### 1.1 Mendapatkan API Key
1. Buka [Google AI Studio](https://ai.google.dev)
2. Login dengan Google Account Anda
3. Klik **"Get API Key"**
4. Klik **"Create API Key"**
5. Pilih project atau buat project baru
6. Copy API Key yang dihasilkan
7. **Simpan dengan aman** - API key ini yang akan digunakan

### 1.2 Konfigurasi Quota
1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Pilih project yang sama dengan API key
3. Navigasi ke **APIs & Services > Quotas**
4. Cari **"Generative Language API"**
5. Atur quota sesuai kebutuhan (default: 15 requests per minute)

## 📁 Step 2: Setup Google Drive

### 2.1 Membuat Folder Penyimpanan
1. Buka [Google Drive](https://drive.google.com)
2. Klik **"New"** > **"Folder"**
3. Beri nama folder: `"KTP-Images"` atau sesuai keinginan
4. Klik kanan pada folder > **"Share"**
5. Set permissions: **"Anyone with the link"** (untuk akses API)
6. Copy **Folder ID** dari URL:
   ```
   https://drive.google.com/drive/folders/xx
   ```
   Folder ID = `xx`

## 📊 Step 3: Setup Google Sheets

### 3.1 Membuat Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.google.com)
2. Klik **"Blank"** untuk spreadsheet kosong
3. Rename menjadi: **"KTP Extraction Data"**
4. Copy **Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/xx/edit
   ```
   Spreadsheet ID = `xx`

### 3.2 Set Permissions
1. Klik **"Share"** di kanan atas
2. Set ke **"Anyone with the link"** dengan permission **"Editor"**
3. Klik **"Done"**

## 💻 Step 4: Deploy Google Apps Script

### 4.1 Membuat Project Apps Script
1. Buka [Google Apps Script](https://script.google.com)
2. Klik **"New project"**
3. Rename project menjadi: **"KTP Extraction API"**
4. Hapus kode default yang ada

### 4.2 Memasukkan Kode
1. Copy seluruh kode dari file `Code.gs` 
2. Paste di Apps Script editor
3. Update konfigurasi di bagian atas:

```javascript
// Config - UPDATE THESE VALUES
const GEMINI_API_KEY = 'xx'; // Your Gemini API Key
const GEMINI_MODEL = 'gemini-2.0-flash';
const SPREADSHEET_ID = 'xx'; // Your Sheets ID
const FOLDER_ID = 'xx'; // Your Drive Folder ID
```

### 4.3 Enable Required APIs
1. Di Apps Script, klik **"Libraries"** di sidebar kiri
2. Tidak ada library eksternal yang perlu ditambahkan untuk script ini
3. API yang digunakan (Drive, Sheets, UrlFetch) sudah built-in

### 4.4 Test Script
1. Pilih function `doGet` dari dropdown
2. Klik **"Run"** untuk test
3. Authorize permissions jika diminta:
   - **Google Drive** access (untuk upload files)
   - **Google Sheets** access (untuk logging)
   - **External requests** (untuk Gemini API)

## 🌐 Step 5: Deploy sebagai Web App

### 5.1 Deploy Configuration
1. Klik **"Deploy"** > **"New deployment"**
2. Klik ⚙️ **gear icon** untuk settings
3. Pilih type: **"Web app"**
4. Konfigurasi:
   - **Description**: `"KTP Extraction API v1.0"`
   - **Execute as**: `"Me (your-email@gmail.com)"`
   - **Who has access**: `"Anyone"` ⚠️ *untuk public API*

### 5.2 Deploy Process
1. Klik **"Deploy"**
2. **Authorize permissions** saat diminta
3. Copy **Web App URL** yang dihasilkan:
   ```
   https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```

### 5.3 Test Deployment
1. Buka URL di browser untuk test `GET` request
2. Anda harus melihat response JSON:
   ```json
   {
     "status": "success",
     "message": "API Ekstraksi Data KTP sedang berjalan..."
   }
   ```

## ✅ Step 6: Verifikasi Installation

### 6.1 Test dengan Documentation Endpoint
```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=docs"
```

### 6.2 Test dengan Sample KTP
1. Siapkan gambar KTP sample
2. Convert ke base64:
   ```bash
   base64 sample-ktp.jpg
   ```
3. Test API call:
   ```bash
   curl -X POST "YOUR_WEB_APP_URL" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "action=process-ktp&fileData=BASE64_DATA&fileName=test.jpg&mimeType=image/jpeg"
   ```

### 6.3 Periksa Google Sheets
1. Buka Google Sheets yang sudah dibuat
2. Seharusnya muncul sheets baru:
   - `log` - untuk logging API calls
   - `metadata` - untuk file metadata  
   - `data_ktp` - untuk data KTP yang berhasil diekstrak

## 🔧 Step 7: Konfigurasi Lanjutan

### 7.1 Update Script (Jika Diperlukan)
Untuk update kode di masa depan:
1. Edit kode di Apps Script editor
2. Save dengan `Ctrl+S`
3. Deploy ulang:
   - Klik **"Deploy"** > **"Manage deployments"**
   - Klik ✏️ **edit** pada deployment aktif
   - Ubah **"Version"** ke **"New version"**
   - Klik **"Deploy"**

### 7.2 Monitoring & Maintenance
1. **Execution Transcript**: 
   - Buka Apps Script > **"Executions"**
   - Monitor request logs dan errors
   
2. **Google Sheets Monitoring**:
   - Periksa sheet `log` untuk tracking requests
   - Monitor sheet `data_ktp` untuk hasil ekstraksi

3. **Google Drive Storage**:
   - Periksa folder untuk memastikan file tersimpan
   - Setup auto-cleanup jika diperlukan

### 7.3 Security Hardening
1. **Restrict API Access** (Opsional):
   ```javascript
   // Tambahkan di awal function doPost()
   const allowedOrigins = ['https://yourdomain.com'];
   const origin = e.parameter.origin;
   if (!allowedOrigins.includes(origin)) {
     return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
   }
   ```

2. **Rate Limiting** (Opsional):
   ```javascript
   // Implementasi simple rate limiting
   const userRequests = PropertiesService.getScriptProperties();
   const userIP = Session.getActiveUser().getEmail();
   // Logic untuk rate limiting...
   ```

## 🚨 Troubleshooting Deployment

### Issue 1: Authorization Error
**Error**: `"You do not have permission to call..."`
**Solution**:
1. Kembali ke Apps Script
2. Run function `doGet` secara manual
3. Authorize semua permissions yang diminta
4. Deploy ulang

### Issue 2: Gemini API Error
**Error**: `"API error: 403 - API key not valid"`
**Solution**:
1. Verifikasi API key di [Google AI Studio](https://ai.google.dev)
2. Pastikan API key belum expired
3. Periksa quota di Google Cloud Console

### Issue 3: Drive/Sheets Access Error  
**Error**: `"Exception: You do not have permission to access..."`
**Solution**:
1. Pastikan Spreadsheet dan Drive folder permissions set ke "Anyone with the link"
2. Periksa ID Spreadsheet dan Folder ID sudah benar
3. Test akses manual ke kedua resources

### Issue 4: Deployment URL Tidak Berfungsi
**Error**: `"Sorry, unable to open the file at this time"`
**Solution**:
1. Periksa deployment status di "Manage deployments"
2. Pastikan "Who has access" set ke "Anyone"
3. Coba deploy dengan version baru

## 📊 Step 8: Production Setup

### 8.1 Environment Variables
Untuk production, pisahkan konfigurasi:

1. Buka Apps Script > **"Project Settings"**
2. Scroll ke **"Script Properties"**
3. Tambahkan properties:
   ```
   GEMINI_API_KEY = your-api-key
   SPREADSHEET_ID = your-sheet-id
   FOLDER_ID = your-folder-id
   ```

4. Update kode untuk menggunakan Properties:
   ```javascript
   const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
   const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
   const FOLDER_ID = PropertiesService.getScriptProperties().getProperty('FOLDER_ID');
   ```

### 8.2 Error Logging Enhancement
Tambahkan logging ke Google Cloud Logging:
```javascript
function logError(error, context) {
  console.error(`[${context}] ${error.toString()}`);
  // Log akan muncul di Apps Script > Executions
}
```

### 8.3 Performance Optimization
1. **Caching**: Implement caching untuk request yang sama
2. **Batch Processing**: Untuk multiple files
3. **Compression**: Compress response jika diperlukan

## 🔄 Step 9: Maintenance & Updates

### 9.1 Regular Maintenance
- **Mingguan**: Periksa execution logs untuk errors
- **Bulanan**: Review storage usage di Drive
- **Quarterly**: Update API dependencies jika ada

### 9.2 Backup Strategy
1. **Code Backup**: 
   - Export Apps Script code ke GitHub
   - Versioning dengan Git
   
2. **Data Backup**:
   - Export Google Sheets data secara berkala
   - Backup Google Drive folder

### 9.3 Monitoring Setup
1. **Google Cloud Monitoring** (Opsional):
   - Setup alerts untuk API failures
   - Monitor quota usage
   
2. **Custom Health Check**:
   ```javascript
   function healthCheck() {
     // Test Gemini API
     // Test Sheets access  
     // Test Drive access
     // Return status
   }
   ```

## 📞 Support & Resources

### Documentation Links
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Gemini AI Documentation](https://ai.google.dev/docs)
- [Google Drive API](https://developers.google.com/drive)
- [Google Sheets API](https://developers.google.com/sheets)

### Community Support
- [Apps Script Community](https://stackoverflow.com/questions/tagged/google-apps-script)
- [Google AI Developer Community](https://developers.googleblog.com/search/label/AI)

---

## ✅ Deployment Checklist

Sebelum go-live, pastikan:

- [ ] Gemini AI API key valid dan tested
- [ ] Google Drive folder accessible dan permissions correct
- [ ] Google Sheets created dan accessible
- [ ] Apps Script deployed dengan permissions correct
- [ ] Web App URL tested dengan GET request
- [ ] Documentation endpoint tested (`action=docs`)
- [ ] Sample KTP processing tested
- [ ] Error handling tested dengan invalid inputs
- [ ] Logging berfungsi di Google Sheets
- [ ] File upload berfungsi ke Google Drive

**Selamat! API KTP Extraction Anda sudah siap untuk production! 🎉**
