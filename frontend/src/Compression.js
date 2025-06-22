import React, { useState } from "react";
import axios from "axios";
import "./Compression.css";
import baseUrl from "./config.js";

function Compression() {
  const [file, setFile] = useState(null);
  const [algorithm, setAlgorithm] = useState("huffman");
  const [response, setResponse] = useState(null);

  const [decompressFile, setDecompressFile] = useState(null);
  const [decompressAlgorithm, setDecompressAlgorithm] = useState("huffman");
  const [decompressResult, setDecompressResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file to compress.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("algorithm", algorithm);

    try {
      const res = await axios.post(`${baseUrl}/compress`, formData);
      setResponse(res.data);
    } catch (err) {
      console.error("Compression failed:", err);
      alert("Compression failed: " + (err.response?.data || "Unknown error"));
    }
  };

  const handleDecompress = async (e) => {
    e.preventDefault();
    if (!decompressFile) return alert("Please select a file to decompress.");

    const formData = new FormData();
    formData.append("file", decompressFile);
    formData.append("algorithm", decompressAlgorithm);

    try {
      const res = await axios.post(`${baseUrl}/decompress`, formData);
      setDecompressResult(res.data);
    } catch (err) {
      console.error("Decompression failed:", err);
      alert("Decompression failed: " + (err.response?.data || "Unknown error"));
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">📦 File Compression Portal</h2>

      <form onSubmit={handleSubmit} className="compression-form">
        <div className="mb-3">
          <label>Select a File to Compress</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <div className="mb-3">
          <label>Compression Algorithm</label>
          <select
            className="form-select"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            <option value="huffman">Huffman Coding</option>
            <option value="rle">Run-Length Encoding (RLE)</option>
          </select>
        </div>

        <button className="btn btn-primary" type="submit">
          Compress File
        </button>
      </form>

      {response && (
        <div className="alert alert-success mt-4">
          <p>
            📊 <strong>Compression Stats:</strong>
          </p>
          <ul>
            <li>
              <strong>Original Size:</strong> {response.size} bytes
            </li>
            <li>
              <strong>Compressed Size:</strong> {response.newsize} bytes
            </li>
            <li>
              <strong>Compression Ratio:</strong> {response.ratio}
            </li>
            <li>
              <a
                href={`${baseUrl}${response.download}`}
                className="btn btn-success mt-2"
                download
              >
                Download Compressed File
              </a>
            </li>
          </ul>
        </div>
      )}

      <hr className="my-5" />

      <h2 className="mb-4">🔓 File Decompression Portal</h2>

      <form onSubmit={handleDecompress} className="compression-form">
        <div className="mb-3">
          <label>Select a File to Decompress</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setDecompressFile(e.target.files[0])}
          />
        </div>

        <div className="mb-3">
          <label>Decompression Algorithm</label>
          <select
            className="form-select"
            value={decompressAlgorithm}
            onChange={(e) => setDecompressAlgorithm(e.target.value)}
          >
            <option value="huffman">Huffman Coding</option>
            <option value="rle">Run-Length Encoding (RLE)</option>
          </select>
        </div>

        <button className="btn btn-warning" type="submit">
          Decompress File
        </button>
      </form>

      {decompressResult && (
        <div className="alert alert-info mt-4">
          <p>
            📄 <strong>Decompression Stats:</strong>
          </p>
          <ul>
            <li>
              <strong>Compressed Size:</strong> {decompressResult.originalSize}{" "}
              bytes
            </li>
            <li>
              <strong>Decompressed Size:</strong>{" "}
              {decompressResult.decompressedSize} bytes
            </li>
            <li>
              <a
                href={`${baseUrl}${decompressResult.download}`}
                className="btn btn-info mt-2"
                download
              >
                Download Decompressed File
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Compression;
