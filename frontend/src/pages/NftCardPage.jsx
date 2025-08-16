import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "../styles/NftCard.css";

// Load env variables (adjust if you use a different method)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function getAttribute(attributes, traitType) {
  if (!attributes) return "";
  const found = attributes.find(attr => attr.trait_type === traitType);
  return found ? found.value : "";
}

export default function NftCardPage() {
  const query = useQuery();
  const metadataIpfs = query.get("metadataIpfs");
  const [mintResult, setMintResult] = useState(null);

  // Spin interaction hooks (must be at top level)
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const lastX = useRef(null);

  // Mouse events
  const handleMouseDown = (e) => {
    setDragging(true);
    lastX.current = e.clientX;
  };
  const handleMouseMove = (e) => {
    if (dragging) {
      const delta = e.clientX - lastX.current;
      setRotation((r) => r + delta);
      lastX.current = e.clientX;
    }
  };
  const handleMouseUp = () => {
    setDragging(false);
  };

  // Touch events
  const handleTouchStart = (e) => {
    setDragging(true);
    lastX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    if (dragging) {
      const delta = e.touches[0].clientX - lastX.current;
      setRotation((r) => r + delta);
      lastX.current = e.touches[0].clientX;
    }
  };
  const handleTouchEnd = () => {
    setDragging(false);
  };

  // Attach/remove listeners
  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging]);

  useEffect(() => {
    async function fetchMintedNft() {
      if (metadataIpfs) {
        const { data, error } = await supabase
          .from("minted_nfts")
          .select("*")
          .eq("metadata_ipfs", metadataIpfs);

        if (error || !data) {
          setMintResult({ error: error?.message || "No data found" });
        } else {
          setMintResult(data[0]);
        }
      }
    }
    fetchMintedNft();
  }, [metadataIpfs]);

  if (!mintResult) return <div>Loading...</div>;
  if (mintResult.error) return <div>Error: {mintResult.error}</div>;

  const color = getAttribute(mintResult.attributes, "Color");
  const country = getAttribute(mintResult.attributes, "Country");
  const value = getAttribute(mintResult.attributes, "Value");

  return (
    <div className="card-container">
      <div
        className="card"
        style={{
          transform: `rotateY(${rotation}deg)`,
          transition: dragging ? "none" : "transform 0.5s",
          cursor: "grab",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/*back side: nft image and name*/}
        <div className="back">
          {mintResult.image_ipfs && (
            <img
              src={`https://ipfs.io/ipfs/${mintResult.image_ipfs.replace("ipfs://", "")}`}
              alt={mintResult.name}
              style={{
                width: "90%",
                height: "70%",
                objectFit: "cover",
                borderRadius: "1em",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                marginTop: "2.5em",
                margin: "auto",
                display: "block",
              }} />
          )}
        </div>
        {/* front side: nft image and details */}
        <div className="front">
          <div className="text-center"
            style={{
              position: "absolute",
              top: "30px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "85%",
              color: "#fff",
              textAlign: "left",
              fontSize: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <div><strong>NFT:</strong> {mintResult.name}</div>
            <div><strong>Color:</strong> {color}</div>
            <div><strong>MFG Country:</strong> {country}</div>
            <div><strong>Value:</strong> {value}</div>
            <div><strong>Descr:</strong> {mintResult.description}</div>
            <div><strong>Supplies:</strong> {mintResult.supplies}</div>
          </div>
        </div>
      </div>
      {/* Buttons below the card */}
      <div className="nft-buttons">
        <button className="claim-btn" onClick={() => alert("Claimed!")}>Claim</button>
        <button className="supply-btn" disabled>Total Supply: {mintResult.supplies}</button>
      </div>
    </div>
  );
}