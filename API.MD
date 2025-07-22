# 📋 KTP Extraction API - Dokumentasi Lengkap

## 🚀 Overview

API ini memungkinkan ekstraksi data terstruktur dari gambar Kartu Tanda Penduduk (KTP) Indonesia menggunakan teknologi OCR Gemini AI. API mengembalikan data dalam format JSON yang mudah diintegrasikan.

## 🔗 Base URL
```
https://script.google.com/macros/s/{SCRIPT_ID}/exec
```

## 🔐 Authentication
API ini tidak memerlukan authentication key, namun disarankan untuk mengimplementasikan rate limiting di level aplikasi.

## 📡 Endpoints

### 1. Health Check
Memeriksa status API dan ketersediaan layanan.

**Request:**
```http
GET /
```

**Response:**
```json
{
  "status": "success",
  "message": "API Ekstraksi Data KTP sedang berjalan. Gunakan metode POST untuk menganalisis KTP.",
  "documentation": "Kirim parameter \"action=docs\" untuk mendapatkan dokumentasi"
}
```

---

### 2. Process KTP Image
Memproses gambar KTP dan mengekstrak data secara otomatis.

**Request:**
```http
POST /
Content-Type: application/x-www-form-urlencoded

action=process-ktp
fileData={base64_encoded_image}
fileName={filename}
mimeType={mime_type}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | ✅ | Harus berisi `"process-ktp"` |
| `fileData` | string | ✅ | Gambar yang diencode base64 |
| `fileName` | string | ✅ | Nama file (contoh: `ktp.jpg`) |
| `mimeType` | string | ✅ | MIME type gambar (`image/jpeg`, `image/png`) |

**Response Success (KTP Valid):**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "original": {
      "fileUrl": "https://drive.google.com/file/d/1abc123/view",
      "fileName": "ktp.jpg",
      "mimeType": "image/jpeg"
    },
    "analysis": {
      "raw": "NIK: 1307115109000001\nNama: CANTIKA TRISNADIA\nTempat/Tanggal Lahir: PADANG PINANG, 11-09-2000\n...",
      "parsed": {
        "status": "success",
        "nik": "1307115109000001",
        "nama": "CANTIKA TRISNADIA",
        "tempat_tanggal_lahir": "PADANG PINANG, 11-09-2000",
        "jenis_kelamin": "PEREMPUAN",
        "golongan_darah": "AB",
        "alamat": "JORONG LINTANG",
        "rt_rw": "000/000",
        "kel_desa": "SUNGAI ANTUAN",
        "kecamatan": "MUNGKA",
        "agama": "ISLAM",
        "status_perkawinan": "BELUM KAWIN",
        "pekerjaan": "PELAJAR/MAHASISWA",
        "kewarganegaraan": "WNI",
        "berlaku_hingga": "SEUMUR HIDUP",
        "dikeluarkan_di": "LIMA PULUH KOTA, 09-02-2018"
      }
    }
  }
}
```

**Response Success (Bukan KTP):**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "original": {
      "fileUrl": "https://drive.google.com/file/d/1abc123/view",
      "fileName": "document.jpg",
      "mimeType": "image/jpeg"
    },
    "analysis": {
      "raw": "Dokumen ini bukan KTP",
      "parsed": {
        "status": "not_ktp",
        "message": "Dokumen yang diberikan bukan merupakan KTP"
      }
    }
  }
}
```

**Response Error:**
```json
{
  "status": "error",
  "message": "Parameter wajib tidak ada: fileData, fileName, dan mimeType harus disediakan",
  "code": 400
}
```

---

### 3. Get API Documentation
Mengambil dokumentasi API dalam format JSON.

**Request:**
```http
POST /
Content-Type: application/x-www-form-urlencoded

action=docs
```

**Response:**
```json
{
  "api_name": "API Ekstraksi Data KTP",
  "version": "1.0.0",
  "description": "API untuk menganalisis dan mengekstrak data dari Kartu Tanda Penduduk (KTP) Indonesia menggunakan Gemini AI",
  "base_url": "https://script.google.com/macros/s/{SCRIPT_ID}/exec",
  "endpoints": [...],
  "examples": {...}
}
```

## 🔍 Data Fields

API mengekstrak 15 field data dari KTP:

| Field | Key | Description | Example |
|-------|-----|-------------|---------|
| NIK | `nik` | Nomor Induk Kependudukan | `"1307115109000001"` |
| Nama | `nama` | Nama lengkap | `"CANTIKA TRISNADIA"` |
| Tempat/Tanggal Lahir | `tempat_tanggal_lahir` | Tempat dan tanggal lahir | `"PADANG PINANG, 11-09-2000"` |
| Jenis Kelamin | `jenis_kelamin` | Gender | `"PEREMPUAN"` |
| Golongan Darah | `golongan_darah` | Blood type | `"AB"` |
| Alamat | `alamat` | Alamat lengkap | `"JORONG LINTANG"` |
| RT/RW | `rt_rw` | RT/RW | `"000/000"` |
| Kel/Desa | `kel_desa` | Kelurahan/Desa | `"SUNGAI ANTUAN"` |
| Kecamatan | `kecamatan` | Kecamatan | `"MUNGKA"` |
| Agama | `agama` | Agama | `"ISLAM"` |
| Status Perkawinan | `status_perkawinan` | Marital status | `"BELUM KAWIN"` |
| Pekerjaan | `pekerjaan` | Occupation | `"PELAJAR/MAHASISWA"` |
| Kewarganegaraan | `kewarganegaraan` | Citizenship | `"WNI"` |
| Berlaku Hingga | `berlaku_hingga` | Valid until | `"SEUMUR HIDUP"` |
| Dikeluarkan di | `dikeluarkan_di` | Issued at | `"LIMA PULUH KOTA, 09-02-2018"` |

## 🚨 Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | `success` | Request berhasil |
| 400 | `error` | Bad request - parameter tidak valid |
| 500 | `error` | Server error - kesalahan internal |

## 🔧 Format Input

### Supported Image Formats
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- Maximum file size: 10MB (sesuai limit Google Apps Script)

### Base64 Encoding
Gambar harus diencode dalam format base64. Contoh encoding:

**JavaScript:**
```javascript
const fileInput = document.getElementById('file');
const file = fileInput.files[0];
const reader = new FileReader();

reader.onload = function(e) {
  const base64Data = e.target.result.split(',')[1]; // Remove data:image/jpeg;base64,
};
reader.readAsDataURL(file);
```

**Python:**
```python
import base64

with open('ktp.jpg', 'rb') as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
```

## 📊 Rate Limiting

API menggunakan infrastruktur Google Apps Script dengan batasan:
- **Execution time**: 6 menit per request
- **URL Fetch calls**: 20,000 per hari
- **Triggers total runtime**: 6 jam per hari

## 🔧 Integration Examples

### cURL
```bash
curl -X POST "YOUR_SCRIPT_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=process-ktp&fileData=$(base64 -i ktp.jpg)&fileName=ktp.jpg&mimeType=image/jpeg"
```

### JavaScript (Fetch API)
```javascript
const processKTP = async (imageFile) => {
  const formData = new FormData();
  
  // Convert to base64
  const base64 = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result.split(',')[1]);
    reader.readAsDataURL(imageFile);
  });
  
  const response = await fetch('YOUR_SCRIPT_URL', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      action: 'process-ktp',
      fileData: base64,
      fileName: imageFile.name,
      mimeType: imageFile.type
    })
  });
  
  return await response.json();
};
```

### PHP
```php
<?php
$imageData = base64_encode(file_get_contents('ktp.jpg'));

$postData = http_build_query([
    'action' => 'process-ktp',
    'fileData' => $imageData,
    'fileName' => 'ktp.jpg',
    'mimeType' => 'image/jpeg'
]);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/x-www-form-urlencoded',
        'content' => $postData
    ]
]);

$response = file_get_contents('YOUR_SCRIPT_URL', false, $context);
$result = json_decode($response, true);
?>
```

## 🛠️ Troubleshooting

### Common Issues

**1. Error 400 - Missing Parameters**
```json
{
  "status": "error",
  "message": "Parameter wajib tidak ada: fileData, fileName, dan mimeType harus disediakan",
  "code": 400
}
```
**Solution**: Pastikan semua parameter required tersedia.

**2. Error 500 - API Gemini Error**
```json
{
  "status": "error",
  "message": "API error: 403 - Quota exceeded",
  "code": 500
}
```
**Solution**: Periksa quota Gemini AI API key Anda.

**3. File Too Large**
```json
{
  "status": "error",
  "message": "File size exceeds limit",
  "code": 400
}
```
**Solution**: Kompres gambar atau gunakan resolusi lebih rendah.

### Best Practices

1. **Image Quality**: Gunakan gambar dengan resolusi minimal 800x600px
2. **File Format**: JPEG memberikan hasil terbaik
3. **Lighting**: Pastikan KTP terlihat jelas tanpa bayangan
4. **Angle**: Foto KTP harus lurus, hindari sudut miring

## 📞 Support

Untuk bantuan teknis:
- 📧 Email: support@example.com
- 🐛 Issues: GitHub Issues
- 📖 Documentation: API Wiki
