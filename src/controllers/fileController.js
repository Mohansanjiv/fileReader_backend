const XLSX = require("xlsx");

exports.uploadFile = async (req, res) => {
  try {
    const filePath = req.file.path;

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet);

    const urls = [];

    data.forEach((row) => {
      Object.values(row).forEach((value) => {
        if (
          typeof value === "string" &&
          (value.startsWith("http://") || value.startsWith("https://"))
        ) {
          urls.push(value);
        }
      });
    });

    res.status(200).json({
      success: true,
      urls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
