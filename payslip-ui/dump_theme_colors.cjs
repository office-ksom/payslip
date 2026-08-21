const fs = require('fs');
const path = require('path');
const admZip = require('adm-zip');

const xlsxPath = 'D:\\KSOM\\Website\\Web Apps\\Payslip\\EPF_stmt.xlsx';

function main() {
  const zip = new admZip(xlsxPath);
  const themeEntry = zip.getEntry('xl/theme/theme1.xml');
  if (!themeEntry) {
    console.log('No theme1.xml found');
    return;
  }
  const themeXml = themeEntry.getData().toString('utf8');
  
  // Find all color elements in clrScheme
  const colorMatches = themeXml.match(/<a:sysClr[^>]+>/g) || [];
  const srgbMatches = themeXml.match(/<a:srgbClr val="([0-9A-F]{6})"\/>/g) || [];
  
  console.log('SysColors:');
  console.log(colorMatches);
  console.log('\nSrgbColors:');
  console.log(srgbMatches);
}

main();
