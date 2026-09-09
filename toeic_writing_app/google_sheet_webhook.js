/**
 * Google Apps Script Webhook for TOEIC Writing User Feedback
 * -----------------------------------------------------------
 * Instructions to connect to your Google Sheet:
 * 1. Open your Google Sheet (create a new one: https://sheets.new)
 * 2. In Row 1, add these headers:
 *    A1: Thời Gian | B1: Loại Góp Ý | C1: Vị Trí / Câu Hỏi | D1: Nội Dung | E1: Liên Hệ | F1: Đường Dẫn | G1: Trình Duyệt
 * 3. Click menu "Extensions" -> "Apps Script" (Tiện ích mở rộng -> Apps Script)
 * 4. Paste this entire script into Code.gs
 * 5. Click "Deploy" (Triển khai) -> "New deployment" (Triển khai mới)
 * 6. Select type: "Web app" (Ứng dụng web)
 *    - Description: TOEIC Feedback Webhook
 *    - Execute as: "Me" (Tôi)
 *    - Who has access: "Anyone" (Bất kỳ ai)
 * 7. Click "Deploy", authorize permissions, and copy the Web App URL (starts with https://script.google.com/macros/s/...)
 * 8. In your web app browser console or settings, run:
 *    ToeicFeedback.setWebhookUrl('YOUR_WEB_APP_URL');
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rawData = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var data = {};
    try {
      data = JSON.parse(rawData);
    } catch (parseErr) {
      data = (e && e.parameter) ? e.parameter : {};
    }
    
    var timestamp = data.timestamp || new Date().toLocaleString('vi-VN');
    var type = data.type || '';
    var context = data.context || '';
    var content = data.content || '';
    var contact = data.contact || '';
    var url = data.url || '';
    var userAgent = data.userAgent || '';
    
    sheet.appendRow([timestamp, type, context, content, contact, url, userAgent]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Feedback recorded successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'online', service: 'TOEIC Writing Feedback Receiver' }))
    .setMimeType(ContentService.MimeType.JSON);
}
