# KTP Extraction API 🇮🇩

> Indonesian ID Card (KTP) Data Extraction API using Google Apps Script and Gemini AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://script.google.com)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-8E75B2?logo=google&logoColor=white)](https://ai.google.dev)

Automatically extract and structure personal data from Indonesian ID Card (Kartu Tanda Penduduk/KTP) images using advanced OCR technology powered by Google's Gemini AI.

## ✨ Features

- 🔍 **Smart KTP Detection** - Automatically identifies valid KTP documents
- 📊 **Structured Data Extraction** - Extracts 15+ data fields from KTP
- 🚀 **RESTful API** - Easy integration via HTTP requests
- 📁 **File Management** - Automatic file storage in Google Drive
- 📋 **Data Logging** - Complete audit trail in Google Sheets
- 🔒 **Input Validation** - Robust error handling and validation
- 📖 **Auto Documentation** - Built-in API documentation endpoint

## 📋 Extracted Data Fields

The API extracts the following information from KTP images:

| Field | Description |
|-------|-------------|
| NIK | Nomor Induk Kependudukan (National ID Number) |
| Nama | Full Name |
| Tempat/Tanggal Lahir | Place/Date of Birth |
| Jenis Kelamin | Gender |
| Golongan Darah | Blood Type |
| Alamat | Address |
| RT/RW | RT/RW Numbers |
| Kel/Desa | Village/District |
| Kecamatan | Sub-district |
| Agama | Religion |
| Status Perkawinan | Marital Status |
| Pekerjaan | Occupation |
| Kewarganegaraan | Citizenship |
| Berlaku Hingga | Valid Until |
| Dikeluarkan di | Issued At |

## 🚀 Quick Start

### Prerequisites

- Google Account
- Gemini AI API Key ([Get one here](https://ai.google.dev))
- Google Drive folder for file storage
- Google Sheets for data logging

### Installation

1. **Clone this repository**
   ```bash
   git clone https://github.com/classyid/ktp-extraction-api.git
   ```

2. **Open Google Apps Script**
   - Go to [script.google.com](https://script.google.com)
   - Create a new project
   - Copy the code from `Code.gs`

3. **Configure Settings**
   Update these variables in the script:
   ```javascript
   const GEMINI_API_KEY = 'your-gemini-api-key';
   const SPREADSHEET_ID = 'your-google-sheets-id';
   const FOLDER_ID = 'your-google-drive-folder-id';
   ```

4. **Deploy as Web App**
   - Click "Deploy" > "New deployment"
   - Choose "Web app" as type
   - Set execute as "Me"
   - Set access to "Anyone"
   - Click "Deploy"

## 📡 API Usage

### Base URL
```
https://script.google.com/macros/s/{SCRIPT_ID}/exec
```

### Endpoints

#### 1. Process KTP Image
Extract data from KTP image.

**Request:**
```http
POST /
Content-Type: application/x-www-form-urlencoded

action=process-ktp&fileData={base64_image}&fileName=ktp.jpg&mimeType=image/jpeg
```

**Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "original": {
      "fileUrl": "https://drive.google.com/file/d/xxx/view",
      "fileName": "ktp.jpg",
      "mimeType": "image/jpeg"
    },
    "analysis": {
      "raw": "NIK: 1307115109000001\nNama: CANTIKA TRISNADIA...",
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

#### 2. Get API Documentation
Retrieve complete API documentation.

**Request:**
```http
POST /
Content-Type: application/x-www-form-urlencoded

action=docs
```

#### 3. Health Check
Check API status.

**Request:**
```http
GET /
```

### JavaScript Example

```javascript
// Convert image to base64
const fileInput = document.getElementById('ktpImage');
const file = fileInput.files[0];
const reader = new FileReader();

reader.onload = async function(e) {
  const base64Data = e.target.result.split(',')[1];
  
  const response = await fetch('YOUR_SCRIPT_URL', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      action: 'process-ktp',
      fileData: base64Data,
      fileName: file.name,
      mimeType: file.type
    })
  });
  
  const result = await response.json();
  console.log(result);
};

reader.readAsDataURL(file);
```

### Python Example

```python
import requests
import base64

# Read and encode image
with open('ktp.jpg', 'rb') as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

# API call
url = 'YOUR_SCRIPT_URL'
data = {
    'action': 'process-ktp',
    'fileData': encoded_string,
    'fileName': 'ktp.jpg',
    'mimeType': 'image/jpeg'
}

response = requests.post(url, data=data)
result = response.json()
print(result)
```

## 🔧 Configuration

### Google Sheets Setup
The script automatically creates these sheets:
- `log` - API request logs
- `metadata` - File metadata
- `data_ktp` - Extracted KTP data

### Google Drive Setup
Create a folder in Google Drive and get its ID from the URL:
```
https://drive.google.com/drive/folders/{FOLDER_ID}
```

### Gemini AI Setup
1. Visit [Google AI Studio](https://ai.google.dev)
2. Create a new API key
3. Replace `GEMINI_API_KEY` in the script

## 🛠️ Error Handling

The API returns structured error responses:

```json
{
  "status": "error",
  "message": "Parameter wajib tidak ada: fileData, fileName, dan mimeType harus disediakan",
  "code": 400
}
```

Common error codes:
- `400` - Bad request (missing parameters)
- `500` - Server error (processing failed)

## 🔒 Security & Privacy

- **Data Processing**: Images are processed using Google's Gemini AI
- **File Storage**: Files are stored in your private Google Drive
- **Data Logging**: All data remains in your Google Sheets
- **API Access**: Deploy with appropriate access controls

## 📊 Monitoring

The API provides comprehensive logging:
- Request timestamps
- Processing status
- Error tracking
- File metadata
- Extracted data archive

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev) for OCR capabilities
- [Google Apps Script](https://script.google.com) for serverless hosting
- Indonesian government for standardized KTP format

## 📞 Support

- 📧 Email: kontak@classy.id

---

**Disclaimer**: This tool is designed for legitimate administrative purposes. Always ensure compliance with local privacy laws and regulations when processing personal identification documents.
