// const express = require("express");
import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import path from "path";

// const multer = require("multer");
// const fs = require("fs");
// const cors = require("cors");
// const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

const upload = multer({ dest: "uploads/" });

class HuffmanNode {
  constructor(byte, freq, left = null, right = null) {
    this.byte = byte;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

// === Huffman Helpers ===
function buildHuffmanTree(buffer) {
  const freq = new Map();
  for (const byte of buffer) {
    freq.set(byte, (freq.get(byte) || 0) + 1);
  }
  const nodes = Array.from(freq, ([byte, f]) => new HuffmanNode(byte, f));
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift(),
      right = nodes.shift();
    nodes.push(new HuffmanNode(null, left.freq + right.freq, left, right));
  }
  return nodes[0];
}

function generateHuffmanCodes(node, prefix = "", map = {}) {
  if (!node.left && !node.right) map[node.byte] = prefix;
  else {
    generateHuffmanCodes(node.left, prefix + "0", map);
    generateHuffmanCodes(node.right, prefix + "1", map);
  }
  return map;
}

function serializeTreeBuffer(node, buffer = []) {
  if (!node.left && !node.right) {
    buffer.push(1, node.byte);
  } else {
    buffer.push(0);
    serializeTreeBuffer(node.left, buffer);
    serializeTreeBuffer(node.right, buffer);
  }
  return Buffer.from(buffer);
}

function deserializeTreeBuffer(buffer) {
  let index = 0;
  function build() {
    if (index >= buffer.length) throw new Error("Malformed Huffman tree.");
    const flag = buffer[index++];
    if (flag === 1) {
      const byte = buffer[index++];
      return new HuffmanNode(byte, 0);
    }
    const left = build(),
      right = build();
    return new HuffmanNode(null, 0, left, right);
  }
  return build();
}

function huffmanCompress(buffer) {
  const root = buildHuffmanTree(buffer);
  const codeMap = generateHuffmanCodes(root);
  let bits = [...buffer].map((byte) => codeMap[byte]).join("");
  const pad = (8 - (bits.length % 8)) % 8;
  bits += "0".repeat(pad);

  const compressed = Buffer.alloc(bits.length / 8);
  for (let i = 0; i < bits.length; i += 8)
    compressed[i / 8] = parseInt(bits.slice(i, i + 8), 2);

  const head = Buffer.from("HUF");
  const treeBuffer = serializeTreeBuffer(root);
  const treeSize = Buffer.alloc(4);
  treeSize.writeUInt32BE(treeBuffer.length, 0);
  const padBuffer = Buffer.from([pad]);

  return Buffer.concat([head, treeSize, treeBuffer, padBuffer, compressed]);
}

function huffmanDecompress(buffer) {
  if (buffer.slice(0, 3).toString() !== "HUF")
    throw new Error("Invalid Huffman file");

  const treeSize = buffer.readUInt32BE(3);
  const treeBuffer = buffer.slice(7, 7 + treeSize);
  const pad = buffer[7 + treeSize];
  const compressed = buffer.slice(7 + treeSize + 1);

  const root = deserializeTreeBuffer(treeBuffer);
  let bits = [...compressed]
    .map((b) => b.toString(2).padStart(8, "0"))
    .join("");
  bits = bits.slice(0, bits.length - pad);

  const output = [],
    rootRef = root;
  let node = root;
  for (const bit of bits) {
    node = bit === "0" ? node.left : node.right;
    if (!node.left && !node.right) {
      output.push(node.byte);
      node = rootRef;
    }
  }
  return Buffer.from(output);
}

// === RLE ===
function rle(buffer) {
  const compressed = [];
  for (let i = 0; i < buffer.length; ) {
    let count = 1;
    while (
      i + count < buffer.length &&
      buffer[i] === buffer[i + count] &&
      count < 255
    )
      count++;
    compressed.push(count, buffer[i]);
    i += count;
  }
  return Buffer.concat([Buffer.from("RLE"), Buffer.from(compressed)]);
}

function rleDecompress(buffer) {
  if (buffer.slice(0, 3).toString() !== "RLE")
    throw new Error("Invalid RLE file");

  const decompressed = [];
  for (let i = 3; i < buffer.length; i += 2) {
    const count = buffer[i],
      value = buffer[i + 1];
    decompressed.push(...Array(count).fill(value));
  }
  return Buffer.from(decompressed);
}

// === Compress Route ===
app.post("/compress", upload.single("file"), (req, res) => {
  const algorithm = req.body.algorithm;
  const buffer = fs.readFileSync(req.file.path);
  if (buffer.length === 0)
    return res.status(400).send("Uploaded file is empty");

  const originalExt = path.extname(req.file.originalname);
  const baseName = path.basename(req.file.originalname, originalExt);

  let output, compressedExt;
  if (algorithm === "huffman") {
    output = huffmanCompress(buffer);
    compressedExt = ".huf";
  } else if (algorithm === "rle") {
    output = rle(buffer);
    compressedExt = ".rle";
  } else {
    return res.status(400).send("Unsupported algorithm");
  }

  if (!fs.existsSync("compressed")) fs.mkdirSync("compressed");

  const filename = `${baseName}${originalExt}${compressedExt}`;
  const outPath = `compressed/${filename}`;
  fs.writeFileSync(outPath, output);

  res.send({
    size: buffer.length,
    newsize: output.length,
    ratio: (buffer.length / output.length).toFixed(2),
    download: `/download/${filename}`,
  });
});

// === Decompress Route ===
app.post("/decompress", upload.single("file"), (req, res) => {
  try {
    const algorithm = req.body.algorithm;
    const buffer = fs.readFileSync(req.file.path);
    if (buffer.length === 0)
      return res.status(400).send("Uploaded file is empty");

    let output;
    if (algorithm === "huffman") {
      output = huffmanDecompress(buffer);
    } else if (algorithm === "rle") {
      output = rleDecompress(buffer);
    } else {
      return res.status(400).send("Unsupported algorithm");
    }

    if (!fs.existsSync("decompressed")) fs.mkdirSync("decompressed");

    // Extract original filename from input file
    const compressedName = req.file.originalname;
    const parts = compressedName.split(".");
    if (parts.length < 3)
      return res
        .status(400)
        .send("Compressed file must include original extension");

    const originalExt = `.${parts[parts.length - 2]}`;
    const baseName = parts.slice(0, parts.length - 2).join(".");
    const filename = `${baseName}${originalExt}`;
    const outPath = `decompressed/${filename}`;
    fs.writeFileSync(outPath, output);

    res.send({
      originalSize: buffer.length,
      decompressedSize: output.length,
      download: `/download/${filename}`,
    });
  } catch (err) {
    console.error("Decompression error:", err.message);
    res.status(400).send(err.message);
  }
});

// === Download Route ===
app.get("/download/:filename", (req, res) => {
  const file = req.params.filename;
  const paths = [`compressed/${file}`, `decompressed/${file}`];
  for (const p of paths) {
    if (fs.existsSync(p)) return res.download(p);
  }
  res.status(404).send("File not found");
});

// === Start Server ===
app.listen(port, () => {
  console.log(`🚀 Server running at port ${port}`);
});
