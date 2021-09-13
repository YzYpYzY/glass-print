const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const path = require("path");

function readAttendees(filePath) {
  const json = require(filePath);
  return json.attendees ? json.attendees : [];
}

function readTemplate(templatePath) {
  try {
    const data = fs.readFileSync(templatePath, "utf8");
    return data;
  } catch (err) {
    throw "Can't read template svg.";
  }
}

function readPrintOutput(templatePath) {
  try {
    const data = fs.readFileSync(templatePath, "utf8");
    return data;
  } catch (err) {
    throw "Can't read template html.";
  }
}

async function generatePDF(htmlPath, pdfPath) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("file://" + htmlPath, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({ format: "A4" });
  await browser.close();
  fs.writeFileSync(pdfPath, pdf);
}

function init(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.removeSync(folderPath);
  }
  fs.mkdirSync(folderPath);
}

function generateOutput(templatePrint, templateImage, attendees, outputPath) {
  let images = "";
  for (let attendee of attendees) {
    const image = templateImage.replace("##Name##", attendee);
    images += image;
  }
  const toPrint = templatePrint.replace("##ToPrint##", images);
  fs.writeFileSync(outputPath, toPrint);
}

function copyAssets(outFolder) {
  fs.copyFile("logo.svg", path.join(outFolder, "logo.svg"), (err) => {
    if (err) throw err;
  });
}

function main() {
  const outFolderPath = "./out";
  const outHtmlPath = path.join(__dirname, outFolderPath, "out.html");
  console.log(outHtmlPath);
  console.log("init");
  init(outFolderPath);

  console.log("read inputs");
  const attendees = readAttendees("./attendes.json");
  const templateImage = readTemplate("./print.svg");
  const templatePrint = readPrintOutput("./print.html");

  console.log("generate html");
  const toPrint = generateOutput(
    templatePrint,
    templateImage,
    attendees,
    outHtmlPath
  );
  copyAssets(path.join(__dirname, outFolderPath));
  console.log("print to pdf");
  generatePDF(outHtmlPath, path.join(__dirname, outFolderPath, "toPrint.pdf"));
}

main();
