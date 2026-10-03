var SPREADSHEET_ID = "PASTE_YOUR_SPREADSHEET_ID_HERE";
var SYNC_TOKEN = "REPLACE_WITH_A_RANDOM_SECRET_OF_AT_LEAST_24_CHARACTERS";
var SYNC_SHEET_NAME = "Expense Tracker Sync";

function doPost(event) {
  var lock = LockService.getScriptLock();

  try {
    var request = JSON.parse(event.postData.contents || "{}");
    if (!SYNC_TOKEN || request.token !== SYNC_TOKEN) {
      throw new Error("Unauthorized request.");
    }
    if (!Array.isArray(request.transactions)) {
      throw new Error("Invalid transactions payload.");
    }

    lock.waitLock(30000);

    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheetByName(SYNC_SHEET_NAME);
    if (!sheet) sheet = spreadsheet.insertSheet(SYNC_SHEET_NAME);

    var headers = [
      "Transaction ID",
      "Date",
      "Type",
      "Description",
      "Category / Source",
      "Amount (BDT)",
      "Timestamp",
    ];
    var rows = request.transactions.map(function (transaction) {
      var type = transaction.type === "income" ? "Income" : "Expense";
      var category = type === "Income" ? transaction.source : transaction.cat;
      var timestamp = Number(transaction.ts);

      return [
        safeText_(transaction.id),
        safeText_(transaction.date),
        type,
        safeText_(transaction.desc),
        safeText_(category),
        Number(transaction.amount) || 0,
        timestamp ? new Date(timestamp) : "",
      ];
    });

    sheet.clearContents();
    sheet
      .getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight("bold");
    if (rows.length) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      sheet.getRange(2, 6, rows.length, 1).setNumberFormat("৳#,##0.00");
      sheet
        .getRange(2, 7, rows.length, 1)
        .setNumberFormat("yyyy-mm-dd hh:mm:ss");
    }
    sheet.setFrozenRows(1);

    return jsonResponse_({ ok: true, count: rows.length });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error.message || error) });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function safeText_(value) {
  var text = value == null ? "" : String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
