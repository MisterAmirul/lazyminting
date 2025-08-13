//contains lazy minting logic
//Implements the logic for minting NFTs (called by the /mint endpoint).
import {
  createThirdwebClient,
  Engine,
  getContract,
  prepareContractCall,
  sendTransaction,
} from "thirdweb";
import { defineChain } from "thirdweb/chains";
import fs from "fs";
import { ThirdwebStorage } from "@thirdweb-dev/storage";
import "dotenv/config";

/**
 * Mint NFT(s) with same metadata for all supplies
 * @param {Object} params
 * @param {string} params.name - NFT name
 * @param {string} params.description - NFT description
 * @param {number} params.supplies - Number of NFTs to mint
 * @param {Array} params.attributes - Array of attributes (optional)
 * @param {string} params.imagePath - Path to image file
 */
export async function mintNFT({ name, description, supplies, attributes = [], imagePath }) {
  if (!process.env.THIRDWEB_SECRET_KEY ||
      !process.env.CONTRACT_ADDRESS ||
      !process.env.SERVER_WALLET_ADDRESS ||
      !process.env.VAULT_ACCESS_TOKEN) {
    throw new Error("Missing required environment variables");
  }

  // 1. Setup Thirdweb client and storage
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });

  const storage = new ThirdwebStorage({
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });

  // 2. Upload image to IPFS
  const imageBuffer = fs.readFileSync(imagePath);
  const imageUri = (await storage.upload({
    data: imageBuffer,
    name: `${name}.png`,
  })).trim();
  console.log("✅ Uploaded image to IPFS:", imageUri);

  // 3. Prepare metadata (shared if supplies > 1)
  const metadata = {
    name,
    description,
    image: imageUri,
    attributes,
  };

  const metadataUri = (
    await storage.upload({
      data: JSON.stringify(metadata),
      name: "metadata.json",
    })
  ).trim();
  console.log("✅ Uploaded metadata to IPFS:", metadataUri);

  // 4. Get your deployed contract
  const contract = await getContract({
    client,
    address: process.env.CONTRACT_ADDRESS,
    chain: defineChain(421614), // Arbitrum Sepolia
  });

  // 5. Setup server wallet
  const serverWallet = Engine.serverWallet({
    client,
    address: process.env.SERVER_WALLET_ADDRESS,
    vaultAccessToken: process.env.VAULT_ACCESS_TOKEN,
  });

  // 6. Lazy mint all supplies with the same metadata URI
  const _baseURIForTokens = metadataUri.replace(/\/metadata\.json$/, "/");
  const transaction = await prepareContractCall({
    contract,
    method: "function lazyMint(uint256 _amount, string _baseURIForTokens, bytes _data) returns (uint256 batchId)",
    params: [supplies, _baseURIForTokens, "0x"],
  });

  const result = await sendTransaction({
    transaction,
    account: serverWallet,
  });

  console.log("✅ Lazy mint submitted to blockchain!");

  console.log("🔍 Raw mint result:", result);

  // Return result send to server.js then send it back to frontend
  const returnData = {
    imageIpfs: imageUri,
    metadataIpfs: metadataUri,
    imageHttp: imageUri.replace("ipfs://", "https://ipfs.io/ipfs/"),
    metadataHttp: metadataUri.replace("ipfs://", "https://ipfs.io/ipfs/"),
    transactionHash:
      result?.transactionHash ||
      result?.receipt?.transactionHash ||
      null,
  };

  console.log("📦 Mint return data:", returnData);

  return returnData;
}
