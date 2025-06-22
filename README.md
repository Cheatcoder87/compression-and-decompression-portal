# File Compression & Decompression Web App

This is a full-stack application that allows users to compress and decompress files using either **Huffman Coding** or **Run-Length Encoding (RLE)**.

Built with:
React (Frontend)
Express.js (Backend)
Deployed on Render

## Features

- Upload files to compress using Huffman or RLE
- See original size, compressed size, and compression ratio
- Download compressed and decompressed files
- Upload previously compressed files and restore them
- Simple UI with file validation and error handling

## How to Use

1. Open the [Web App](https://compression-and-decompression-portal-8u2j.onrender.com/)
2. Use the **📦 Compression Portal**:
   - Upload a file
   - Select algorithm (`Huffman` or `RLE`)
   - Click `Compress File`
   - Download result
3. Use the **🔓 Decompression Portal**:
   - Upload a compressed file
   - Select the matching algorithm
   - Click `Decompress File`
   - Download the original file

---

## Run Locally

You can run both frontend and backend locally for development or testing.

---

#### 📦 Install

```bash
git clone https://github.com/your-username/compression-backend.git
cd compression-backend
npm install
node app.js

git clone https://github.com/your-username/compression-frontend.git
cd compression-frontend
npm install
npm start
