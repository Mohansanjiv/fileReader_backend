const fs = require("fs");
const xlsx = require("xlsx");
const csv = require("csv-parser");

const extractUrl = (value) => {
  if (!value || typeof value !== "string") return null;

  let trimmedValue = value.trim();

  if (!trimmedValue) return null;

  trimmedValue = trimmedValue.replace(/^"+|"+$/g, "");
  trimmedValue = trimmedValue.replace(/^'+|'+$/g, "");

  if (
    trimmedValue.startsWith("http://") ||
    trimmedValue.startsWith("https://")
  ) {
    return trimmedValue;
  }

  if (
    trimmedValue.startsWith("www.") ||
    trimmedValue.includes(".com") ||
    trimmedValue.includes(".in") ||
    trimmedValue.includes(".org") ||
    trimmedValue.includes(".net") ||
    trimmedValue.includes(".io")
  ) {
    return `https://${trimmedValue.replace(/^https?:\/\//, "")}`;
  }

  return null;
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();

    let urls = [];

    if (fileExtension === "xlsx" || fileExtension === "xls") {
      const workbook = xlsx.readFile(filePath);

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const data = xlsx.utils.sheet_to_json(worksheet, {
        header: 1,
      });

      data.forEach((row) => {
        row.forEach((cell) => {
          const cellValue = String(cell);

          const splitValues = cellValue.split(",");

          splitValues.forEach((item) => {
            const url = extractUrl(item.trim());

            if (url) {
              urls.push(url);
            }
          });
        });
      });

      urls = [...new Set(urls)];

      fs.unlinkSync(filePath);

      return res.status(200).json({
        success: true,
        urls,
      });
    }

    if (fileExtension === "csv") {
      fs.createReadStream(filePath)
        .pipe(csv({ headers: false }))
        .on("data", (row) => {
          Object.values(row).forEach((value) => {
            const splitValues = String(value).split(",");

            splitValues.forEach((item) => {
              const url = extractUrl(item.trim());

              if (url) {
                urls.push(url);
              }
            });
          });
        })
        .on("end", () => {
          urls = [...new Set(urls)];

          fs.unlinkSync(filePath);

          return res.status(200).json({
            success: true,
            urls,
          });
        });
    } else {
      fs.unlinkSync(filePath);

      return res.status(400).json({
        success: false,
        message: "Only Excel and CSV files are allowed",
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  uploadFile,
};
