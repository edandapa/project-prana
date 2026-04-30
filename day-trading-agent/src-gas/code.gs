const SHEET_ID = '1w5P2V5rTwMCxOTHSRQFI_Hquj_CbjJAd6L9nnuE2G4E';
const LOG_SHEET = 'Signals';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(LOG_SHEET);
  
  // Append signal with current timestamp
  sheet.appendRow([
    new Date(), 
    data.signal,  // e.g., "Indication"
    data.type,    // e.g., "Bullish CHoCH"
    data.price, 
    data.time, 
    data.status   // e.g., "Wait for retracement"
  ]);
  
  return ContentService.createTextOutput("Signal Logged");
}

function doGet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(LOG_SHEET);
  
  // If the sheet doesn't exist, create it to prevent null errors
  if (!sheet) {
    sheet = ss.insertSheet(LOG_SHEET);
    sheet.appendRow(["Timestamp", "Signal", "Type", "Price", "Time", "Status"]); // Header row
  }
  
  const lastRow = sheet.getLastRow();
  
  // Return a clear message if no signals have been logged yet
  if (lastRow < 2) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "empty", "message": "Signal Hub active, waiting for alerts." }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const vals = sheet.getRange(lastRow, 1, 1, 6).getValues()[0];
  const response = {
    "timestamp": vals[0],
    "signal": vals[1],
    "type": vals[2],
    "price": vals[3],
    "status": vals[5]
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}