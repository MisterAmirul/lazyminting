//Main entry point for the backend server.
//Sets up Express, handles CORS, file uploads, and defines the /mint API endpoint for NFT minting.
//mint.mjs as logic, server.mjs as api endpoint where it use mint.mjs to perform

import express from "express";
import multer from "multer";
import cors from "cors";
import { mintNFT } from "./services/mint.mjs";
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

function maskKey(k) {
  if (!k) return "MISSING";
  if (k.length <= 12) return "***";
  return k.slice(0, 4) + "..." + k.slice(-4);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) console.error("‼ SUPABASE_URL missing");
if (!supabaseServiceKey) console.error("‼ Supabase key missing (need SERVICE ROLE for writes with RLS)");
console.log("Supabase init url:", supabaseUrl || "NONE");
console.log("Supabase key (masked):", maskKey(supabaseServiceKey || ""));

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    const { data, error } = await supabase
      .from('minted_nfts')
      .insert([
        {
          name: name,
          description: description,
          supplies: parseInt(supplies),
          attributes: attributes ? JSON.parse(attributes) : [],
          image_ipfs: result.imageIpfs,
          metadata_ipfs: result.metadataIpfs,
          transaction_hash: result.transactionHash,
        }
      ])
      .select();

      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({
          success: true,
          db: false,
          dbError: error.message,
          ...result
        });
      }

      if(error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({
          success: true,
          db: false,
          dbError: error.message,
          ...result
        });
      }

      console.log("supabase insert data:", data);


      res.json({
      success: true,
      db: true,
      ...result
    });

  } catch (err) {
    console.error("❌ Minting error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3001, () => console.log("✅ Backend running at http://localhost:3001"));
