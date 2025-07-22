// Config
const GEMINI_API_KEY = '<APIKEY-GEMINI>';
const GEMINI_MODEL = 'gemini-2.0-flash';
const SPREADSHEET_ID = '<SPREDSHEET-ID>';
const LOG_SHEET_NAME = 'log';
const METADATA_SHEET_NAME = 'metadata';
const TRANSACTIONS_SHEET_NAME = 'data_ktp';
const FOLDER_ID = '<FOLDER-ID>';

// Prompt template untuk parsing Kartu Tanda Penduduk
const PROMPT_TEMPLATE = `<prompt bisa dicheckout di https://lynk.id/classyid>`;

/**
 * Handle GET requests - Return API status
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'API Ekstraksi Data KTP sedang berjalan. Gunakan metode POST untuk menganalisis KTP.',
    documentation: 'Kirim parameter "action=docs" untuk mendapatkan dokumentasi'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  return ContentService.createTextOutput('');
}

/**
 * Handle POST requests - Process image and return JSON response
 */
function doPost(e) {
  try {
    // Get parameters from form data or JSON
    let data;
    
    if (e.postData && e.postData.contents) {
      try {
        // Try parsing as JSON first
        data = JSON.parse(e.postData.contents);
      } catch (error) {
        // If not JSON, fall back to form parameters
        data = e.parameter;
      }
    } else {
      // Use form parameters directly
      data = e.parameter;
    }
    
    // Check if action is provided
    if (!data.action) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Parameter wajib tidak ada: action',
        code: 400
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle different API actions
    let result;
    
    switch(data.action) {
      case 'process-ktp':
        result = processKTPAPI(data);
        break;
      case 'docs':
        result = getApiDocumentation();
        break;
      default:
        result = {
          status: 'error',
          message: `Action tidak dikenal: ${data.action}`,
          code: 400
        };
    }
    
    // Return result
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    logAction('API Error', `Error di endpoint API: ${error.toString()}`, 'ERROR');
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString(),
      code: 500
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * API endpoint to process KTP
 */
function processKTPAPI(data) {
  try {
    // Validate required parameters
    if (!data.fileData || !data.fileName || !data.mimeType) {
      return {
        status: 'error',
        message: 'Parameter wajib tidak ada: fileData, fileName, dan mimeType harus disediakan',
        code: 400
      };
    }
    
    // Log the request 
    logAction('Request', 'Permintaan pemrosesan KTP diterima', 'INFO');
    
    // Process the KTP image
    const result = processImage(data.fileData, data.fileName, data.mimeType);
    
    // If successful, structure the response
    if (result.success) {
      // Check if the image was not a KTP
      if (result.description === "Dokumen ini bukan KTP") {
        return {
          status: 'success',
          code: 200,
          data: {
            original: {
              fileUrl: result.fileUrl,
              fileName: data.fileName,
              mimeType: data.mimeType
            },
            analysis: {
              raw: result.description,
              parsed: {
                status: 'not_ktp',
                message: 'Dokumen yang diberikan bukan merupakan KTP'
              }
            }
          }
        };
      } else {
        // Parse KTP data into structured format
        const ktpData = parseKTPData(result.description);
        
        return {
          status: 'success',
          code: 200,
          data: {
            original: {
              fileUrl: result.fileUrl,
              fileName: data.fileName,
              mimeType: data.mimeType
            },
            analysis: {
              raw: result.description,
              parsed: {
                status: 'success',
                nik: ktpData.nik,
                nama: ktpData.nama,
                tempat_tanggal_lahir: ktpData.tempat_tanggal_lahir,
                jenis_kelamin: ktpData.jenis_kelamin,
                golongan_darah: ktpData.golongan_darah,
                alamat: ktpData.alamat,
                rt_rw: ktpData.rt_rw,
                kel_desa: ktpData.kel_desa,
                kecamatan: ktpData.kecamatan,
                agama: ktpData.agama,
                status_perkawinan: ktpData.status_perkawinan,
                pekerjaan: ktpData.pekerjaan,
                kewarganegaraan: ktpData.kewarganegaraan,
                berlaku_hingga: ktpData.berlaku_hingga,
                dikeluarkan_di: ktpData.dikeluarkan_di
              }
            }
          }
        };
      }
    } else {
      return {
        status: 'error',
        message: result.error,
        code: 500
      };
    }
  } catch (error) {
    logAction('API Error', `Error in processKTPAPI: ${error.toString()}`, 'ERROR');
    return {
      status: 'error',
      message: error.toString(),
      code: 500
    };
  }
}

/**
 * Return API documentation in JSON format
 */
function getApiDocumentation() {
  const docs = {
    api_name: "API Ekstraksi Data KTP",
    version: "1.0.0",
    description: "API untuk menganalisis dan mengekstrak data dari Kartu Tanda Penduduk (KTP) Indonesia menggunakan Gemini AI",
    base_url: ScriptApp.getService().getUrl(),
    endpoints: [
      {
        path: "/",
        method: "GET",
        description: "Pemeriksaan status API",
        parameters: {}
      },
      {
        path: "/",
        method: "POST",
        description: "Proses gambar KTP dan ekstrak datanya",
        parameters: {
          action: {
            type: "string",
            required: true,
            description: "Aksi API yang akan dilakukan",
            value: "process-ktp"
          }
        },
        body: {
          type: "application/x-www-form-urlencoded atau application/json",
          required: true,
          schema: {
            fileData: {
              type: "string (base64)",
              required: true,
              description: "Data gambar KTP yang di-encode dalam format base64"
            },
            fileName: {
              type: "string",
              required: true,
              description: "Nama file"
            },
            mimeType: {
              type: "string",
              required: true,
              description: "MIME type dari gambar (e.g., image/jpeg, image/png)"
            }
          }
        },
        responses: {
          "200": {
            description: "Operasi berhasil",
            schema: {
              status: "success",
              code: 200,
              data: {
                original: {
                  fileUrl: "URL ke file yang disimpan di Google Drive",
                  fileName: "Nama file yang diunggah",
                  mimeType: "MIME type dari file"
                },
                analysis: {
                  raw: "Deskripsi mentah dari Gemini AI",
                  parsed: {
                    status: "success atau not_ktp",
                    nik: "Nomor Induk Kependudukan",
                    nama: "Nama lengkap",
                    tempat_tanggal_lahir: "Tempat dan tanggal lahir",
                    jenis_kelamin: "Jenis kelamin",
                    golongan_darah: "Golongan darah",
                    alamat: "Alamat lengkap",
                    rt_rw: "RT/RW",
                    kel_desa: "Kel/Desa",
                    kecamatan: "Kecamatan",
                    agama: "Agama",
                    status_perkawinan: "Status perkawinan",
                    pekerjaan: "Pekerjaan",
                    kewarganegaraan: "Kewarganegaraan",
                    berlaku_hingga: "Berlaku hingga",
                    dikeluarkan_di: "Tempat dan tanggal dikeluarkan"
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request",
            schema: {
              status: "error",
              message: "Detail error",
              code: 400
            }
          },
          "500": {
            description: "Server error",
            schema: {
              status: "error",
              message: "Detail error",
              code: 500
            }
          }
        }
      },
      {
        path: "/",
        method: "POST",
        description: "Dapatkan dokumentasi API",
        parameters: {
          action: {
            type: "string",
            required: true,
            description: "Aksi API yang akan dilakukan",
            value: "docs"
          }
        },
        responses: {
          "200": {
            description: "Dokumentasi API",
            schema: "Objek dokumentasi ini"
          }
        }
      }
    ],
    examples: {
      "process-ktp": {
        request: {
          method: "POST",
          url: ScriptApp.getService().getUrl(),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: "action=process-ktp&fileData=base64_encoded_ktp_image&fileName=ktp.jpg&mimeType=image/jpeg"
        },
        response: {
          status: "success",
          code: 200,
          data: {
            original: {
              fileUrl: "https://drive.google.com/file/d/xxx/view",
              fileName: "ktp.jpg",
              mimeType: "image/jpeg"
            },
            analysis: {
              raw: "NIK: 1307115109000001\nNama: CANTIKA TRISNADIA\nTempat/Tanggal Lahir: PADANG PINANG, 11-09-2000\nJenis Kelamin: PEREMPUAN\nGolongan Darah: AB\nAlamat: JORONG LINTANG\nRT/RW: 000/000\nKel/Desa: SUNGAI ANTUAN\nKecamatan: MUNGKA\nAgama: ISLAM\nStatus Perkawinan: BELUM KAWIN\nPekerjaan: PELAJAR/MAHASISWA\nKewarganegaraan: WNI\nBerlaku Hingga: SEUMUR HIDUP\nDikeluarkan di: LIMA PULUH KOTA, 09-02-2018",
              parsed: {
                status: "success",
                nik: "1307115109000001",
                nama: "CANTIKA TRISNADIA",
                tempat_tanggal_lahir: "PADANG PINANG, 11-09-2000",
                jenis_kelamin: "PEREMPUAN",
                golongan_darah: "AB",
                alamat: "JORONG LINTANG",
                rt_rw: "000/000",
                kel_desa: "SUNGAI ANTUAN",
                kecamatan: "MUNGKA",
                agama: "ISLAM",
                status_perkawinan: "BELUM KAWIN",
                pekerjaan: "PELAJAR/MAHASISWA",
                kewarganegaraan: "WNI",
                berlaku_hingga: "SEUMUR HIDUP",
                dikeluarkan_di: "LIMA PULUH KOTA, 09-02-2018"
              }
            }
          }
        }
      }
    }
  };

  return docs;
}

/**
 * Clean up the API response
 */
function cleanupResponse(response) {
  // Minimal cleanup to ensure response is nicely formatted
  return response.trim();
}

/**
 * Parse KTP data from the Gemini API response
 */
function parseKTPData(description) {
  // Initialize object to store parsed data
  const ktpData = {
    nik: '',
    nama: '',
    tempat_tanggal_lahir: '',
    jenis_kelamin: '',
    golongan_darah: '',
    alamat: '',
    rt_rw: '',
    kel_desa: '',
    kecamatan: '',
    agama: '',
    status_perkawinan: '',
    pekerjaan: '',
    kewarganegaraan: '',
    berlaku_hingga: '',
    dikeluarkan_di: ''
  };

  // Extract NIK
  const nikMatch = description.match(/NIK: (.+?)$/m);
  if (nikMatch) {
    ktpData.nik = nikMatch[1].trim();
  }

  // Extract Nama
  const namaMatch = description.match(/Nama: (.+?)$/m);
  if (namaMatch) {
    ktpData.nama = namaMatch[1].trim();
  }

  // Extract Tempat/Tanggal Lahir
  const ttlMatch = description.match(/Tempat\/Tanggal Lahir: (.+?)$/m);
  if (ttlMatch) {
    ktpData.tempat_tanggal_lahir = ttlMatch[1].trim();
  }

  // Extract Jenis Kelamin
  const jenisKelaminMatch = description.match(/Jenis Kelamin: (.+?)$/m);
  if (jenisKelaminMatch) {
    ktpData.jenis_kelamin = jenisKelaminMatch[1].trim();
  }

  // Extract Golongan Darah
  const golDarahMatch = description.match(/Golongan Darah: (.+?)$/m);
  if (golDarahMatch) {
    ktpData.golongan_darah = golDarahMatch[1].trim();
  }

  // Extract Alamat
  const alamatMatch = description.match(/Alamat: (.+?)$/m);
  if (alamatMatch) {
    ktpData.alamat = alamatMatch[1].trim();
  }

  // Extract RT/RW
  const rtRwMatch = description.match(/RT\/RW: (.+?)$/m);
  if (rtRwMatch) {
    ktpData.rt_rw = rtRwMatch[1].trim();
  }

  // Extract Kel/Desa
  const kelDesaMatch = description.match(/Kel\/Desa: (.+?)$/m);
  if (kelDesaMatch) {
    ktpData.kel_desa = kelDesaMatch[1].trim();
  }

  // Extract Kecamatan
  const kecamatanMatch = description.match(/Kecamatan: (.+?)$/m);
  if (kecamatanMatch) {
    ktpData.kecamatan = kecamatanMatch[1].trim();
  }

  // Extract Agama
  const agamaMatch = description.match(/Agama: (.+?)$/m);
  if (agamaMatch) {
    ktpData.agama = agamaMatch[1].trim();
  }

  // Extract Status Perkawinan
  const statusMatch = description.match(/Status Perkawinan: (.+?)$/m);
  if (statusMatch) {
    ktpData.status_perkawinan = statusMatch[1].trim();
  }

  // Extract Pekerjaan
  const pekerjaanMatch = description.match(/Pekerjaan: (.+?)$/m);
  if (pekerjaanMatch) {
    ktpData.pekerjaan = pekerjaanMatch[1].trim();
  }

  // Extract Kewarganegaraan
  const kewarganegaraanMatch = description.match(/Kewarganegaraan: (.+?)$/m);
  if (kewarganegaraanMatch) {
    ktpData.kewarganegaraan = kewarganegaraanMatch[1].trim();
  }

  // Extract Berlaku Hingga
  const berlakuMatch = description.match(/Berlaku Hingga: (.+?)$/m);
  if (berlakuMatch) {
    ktpData.berlaku_hingga = berlakuMatch[1].trim();
  }

  // Extract Dikeluarkan di
  const dikeluarkanMatch = description.match(/Dikeluarkan di: (.+?)$/m);
  if (dikeluarkanMatch) {
    ktpData.dikeluarkan_di = dikeluarkanMatch[1].trim();
  }

  return ktpData;
}

/**
 * Save KTP data to sheet
 */
function saveKTPDataToSheet(ktpData, fileName) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const dataSheet = spreadsheet.getSheetByName(KTP_DATA_SHEET_NAME) || spreadsheet.insertSheet(KTP_DATA_SHEET_NAME);
    
    // Create headers if the sheet is empty
    if (dataSheet.getLastRow() === 0) {
      dataSheet.appendRow([
        'Timestamp', 
        'File Name',
        'NIK',
        'Nama',
        'Tempat/Tanggal Lahir',
        'Jenis Kelamin',
        'Golongan Darah',
        'Alamat',
        'RT/RW',
        'Kel/Desa',
        'Kecamatan',
        'Agama',
        'Status Perkawinan',
        'Pekerjaan',
        'Kewarganegaraan',
        'Berlaku Hingga',
        'Dikeluarkan di'
      ]);
    }
    
    // Append KTP data
    dataSheet.appendRow([
      new Date().toISOString(),
      fileName,
      ktpData.nik,
      ktpData.nama,
      ktpData.tempat_tanggal_lahir,
      ktpData.jenis_kelamin,
      ktpData.golongan_darah,
      ktpData.alamat,
      ktpData.rt_rw,
      ktpData.kel_desa,
      ktpData.kecamatan,
      ktpData.agama,
      ktpData.status_perkawinan,
      ktpData.pekerjaan,
      ktpData.kewarganegaraan,
      ktpData.berlaku_hingga,
      ktpData.dikeluarkan_di
    ]);
    
    return true;
  } catch (error) {
    logAction('Data Error', `Error saving KTP data: ${error.toString()}`, 'ERROR');
    return false;
  }
}

/**
 * Process the uploaded image and get description from Gemini AI
 */
function processImage(fileData, fileName, mimeType) {
  try {
    // Log the request
    logAction('Request', 'Image processing request received', 'INFO');
    
    // Save image to Drive
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const blob = Utilities.newBlob(Utilities.base64Decode(fileData), mimeType, fileName);
    const file = folder.createFile(blob);
    const fileId = file.getId();
    const fileUrl = file.getUrl();
    
    logAction('File Upload', `File saved to Drive: ${fileName}, ID: ${fileId}`, 'INFO');
    
    // Create request to Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            { text: PROMPT_TEMPLATE },
            { 
              inline_data: { 
                mime_type: mimeType, 
                data: fileData
              } 
            }
          ]
        }
      ]
    };
    
    // Call Gemini API
    const rawResponse = callGeminiAPI(requestBody);
    
    // Clean up the response
    const cleanedResponse = cleanupResponse(rawResponse);
    
    // Check if the document is not a KTP
    if (cleanedResponse === "Dokumen ini bukan KTP") {
      logAction('Info', 'Document is not a KTP', 'INFO');
      
      // Save metadata to spreadsheet
      const metadata = {
        timestamp: new Date().toISOString(),
        fileName: fileName,
        fileId: fileId,
        fileUrl: fileUrl,
        description: cleanedResponse,
        isKTP: false
      };
      
      saveMetadata(metadata);
      
      return {
        success: true,
        description: cleanedResponse,
        fileUrl: fileUrl,
        dataSaved: false
      };
    }
    
    // Parse KTP data
    const ktpData = parseKTPData(cleanedResponse);
    
    // Save KTP data to sheet
    const dataSaved = saveKTPDataToSheet(ktpData, fileName);
    
    // Save metadata to spreadsheet
    const metadata = {
      timestamp: new Date().toISOString(),
      fileName: fileName,
      fileId: fileId,
      fileUrl: fileUrl,
      description: rawResponse,
      isKTP: true
    };
    
    saveMetadata(metadata);
    
    logAction('Success', 'Image processed successfully', 'SUCCESS');
    
    return {
      success: true,
      description: cleanedResponse,
      fileUrl: fileUrl,
      dataSaved: dataSaved
    };
  } catch (error) {
    logAction('Error', `Error processing image: ${error.toString()}`, 'ERROR');
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Call Gemini API
 */
function callGeminiAPI(requestBody) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  };
  
  logAction('API Call', 'Calling Gemini API', 'INFO');
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      const errorText = response.getContentText();
      logAction('API Error', `Error from Gemini API: ${errorText}`, 'ERROR');
      throw new Error(`API error: ${responseCode} - ${errorText}`);
    }
    
    const responseJson = JSON.parse(response.getContentText());
    
    if (!responseJson.candidates || responseJson.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }
    
    // Extract text from response
    const text = responseJson.candidates[0].content.parts[0].text;
    return text;
  } catch (error) {
    logAction('API Error', `Error calling Gemini API: ${error.toString()}`, 'ERROR');
    throw error;
  }
}

/**
 * Log actions to spreadsheet
 */
function logAction(action, message, level) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const logSheet = spreadsheet.getSheetByName(LOG_SHEET_NAME) || spreadsheet.insertSheet(LOG_SHEET_NAME);
    
    // Create headers if the sheet is empty
    if (logSheet.getLastRow() === 0) {
      logSheet.appendRow(['Timestamp', 'Action', 'Message', 'Level']);
    }
    
    logSheet.appendRow([new Date().toISOString(), action, message, level]);
  } catch (error) {
    console.error(`Error logging to spreadsheet: ${error.toString()}`);
  }
}

/**
 * Save metadata to spreadsheet
 */
function saveMetadata(metadata) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const metadataSheet = spreadsheet.getSheetByName(METADATA_SHEET_NAME) || spreadsheet.insertSheet(METADATA_SHEET_NAME);
    
    // Create headers if the sheet is empty
    if (metadataSheet.getLastRow() === 0) {
      metadataSheet.appendRow(['Timestamp', 'FileName', 'FileID', 'FileURL', 'Description', 'IsKTP']);
    }
    
    metadataSheet.appendRow([
      metadata.timestamp,
      metadata.fileName,
      metadata.fileId,
      metadata.fileUrl,
      metadata.description,
      metadata.isKTP ? 'Yes' : 'No'
    ]);
  } catch (error) {
    logAction('Metadata Error', `Error saving metadata: ${error.toString()}`, 'ERROR');
    throw error;
  }
}
