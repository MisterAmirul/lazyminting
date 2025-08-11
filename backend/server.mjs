import express from "express";
import multer from "multer";
import cors from "cors";
import { mintNFT } from "./services/mint.mjs";

const app = express();
const upload = multer({ dest: "uploads/" });

// Enable CORS for frontend requests
app.use(cors());

// POST route to handle NFT minting
app.post("/mint", upload.single("image"), async (req, res) => {
  try {
    const { name, description, supplies, attributes } = req.body;
    const imagePath = req.file.path; // path to uploaded image

    // Call mintNFT function from mint.mjs
    const result = await mintNFT({
      name,
      description,
      supplies: parseInt(supplies),
      attributes: attributes ? JSON.parse(attributes) : [],
      imagePath,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    console.error("❌ Minting error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3001, () => console.log("✅ Backend running at http://localhost:3001"));
