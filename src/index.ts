import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;
const baseUrl = '';

/* =========================
   Multer Setup (File Upload)
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './static');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

/* =========================
   ROOT ROUTE (FIXED ISSUE)
========================= */
app.get('/', (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Image API is running 🚀"
  });
});

/* =========================
   UPLOAD API
========================= */
app.post(`${baseUrl}/upload`, upload.array('images', 10), (req, res) => {
  try {
    const result: any[] = [];

    if (!req.files) {
      return res.status(400).send("No files uploaded");
    }

    for (const file of req.files as Express.Multer.File[]) {
      result.push({
        id: path.parse(file.filename).name,
        filename: file.originalname
      });
    }

    res.status(200).json(result);

  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
});

/* =========================
   GET IMAGE API
========================= */
app.get(`${baseUrl}/images`, (req, res) => {
  const id = req.query.id as string;

  if (!id) {
    return res.status(400).json({ error: "Image id is required" });
  }

  const filePath = path.resolve(`./static/${id}.png`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Image not found" });
  }

  res.sendFile(filePath);
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Image API listening on port ${PORT}`);
});
