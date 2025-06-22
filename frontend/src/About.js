import React from "react";
import { Link } from "react-router-dom";

function AboutPage() {
  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">
         About This Compression Portal
      </h2>

      <p className="lead text-center">
        This portal allows you to compress and decompress files using efficient algorithms like <strong>Huffman Coding</strong> and <strong>Run-Length Encoding (RLE)</strong>. These methods help reduce file sizes for faster storage and transfer.
      </p>

      <div className="row mt-5">
        <div className="col-md-6 mb-4">
          <div className="card shadow border-0 h-100">
            <div className="card-body">
              <h4 className="card-title">📦 Huffman Coding</h4>
              <p className="card-text">
                Huffman Coding is a variable-length, prefix-free encoding technique that assigns shorter binary codes to more frequent bytes. It is optimal for compressing general-purpose data and is used in formats like ZIP and JPEG.
              </p>
            </div>
          </div>
        </div>

        {/* RLE Card */}
        <div className="col-md-6 mb-4">
          <div className="card shadow border-0 h-100">
            <div className="card-body">
              <h4 className="card-title">📉 Run-Length Encoding (RLE)</h4>
              <p className="card-text">
                RLE compresses data by storing sequences of repeated values as a single value and count. It is simple and effective for repetitive data like icons, QR codes, or simple images.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow mt-4">
        <div className="card-body">
          <h4 className="card-title">🛠️ Tech Stack</h4>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">Frontend: <strong>React.js + Bootstrap 5</strong></li>
            <li className="list-group-item">Backend: <strong>Node.js + Express</strong></li>
            <li className="list-group-item">Compression Logic: <strong>Custom JavaScript Algorithms</strong></li>
          </ul>
        </div>
      </div>

      <div className="text-center mt-4">
        <Link to="/" className="btn btn-outline-primary">
          ⬅️ Back to Home
        </Link>
      </div>
    </div>
  );
}

export default AboutPage;
