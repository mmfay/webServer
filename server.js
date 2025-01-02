/*
    Title: server.js
    Description: handles domain routing to different ports, each port is a different website. Also, uses https. 
*/
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware'); // Correct import
const fs = require('fs');
const https = require('https');
const http = require('http');

const app = express();

// Define the ports for routing
const port_SE = 3000;   // This is the port for www.softwarerror.com
const port_TC = 3001;   // This is the port for timecodes.softwarerror.com
const port_NG = 3002;   // This is the port for nutrigym.softwarerror.com

// Load SSL certificate files (replace with your actual paths)
const privateKey = fs.readFileSync('C:/Sites/Certs/_.softwarerror.com-key.pem', 'utf8');
const certificate = fs.readFileSync('C:/Sites/Certs/_.softwarerror.com-crt.pem', 'utf8');
const ca = fs.readFileSync('C:/Sites/Certs/_.softwarerror.com-chain.pem', 'utf8'); // or fullchain.pem

const credentials = { key: privateKey, cert: certificate, ca: ca };

// Middleware to handle routing based on the domain (Host header)
app.use((req, res, next) => {
  const host = req.headers.host;

  // Check if the request is from www.softwarerror.com
  if (host === 'www.softwarerror.com') {
    console.log('Routing to port ' + port_SE);
    // Proxy the request to port_SE (3000)
    return createProxyMiddleware({ target: `http://localhost:${port_SE}`, changeOrigin: true })(req, res, next);
  }
  // Check if the request is from timecodes.softwarerror.com
  else if (host === 'timecodes.softwarerror.com') {
    console.log('Routing to port ' + port_TC);
    // Proxy the request to port_TC (3001)
    return createProxyMiddleware({ target: `http://localhost:${port_TC}`, changeOrigin: true })(req, res, next);
  }
  // Check if the request is from nutrigym.softwarerror.com
  else if (host === 'nutrigym.softwarerror.com') {
    console.log('Routing to port ' + port_NG);
    // Proxy the request to port_NG (3002)
    return createProxyMiddleware({ target: `http://localhost:${port_NG}`, changeOrigin: true })(req, res, next);
  } else {
    // If no matching subdomain or domain is found, return an error
    res.status(404).send('Domain not recognized');
  }
});

// Create the HTTPS server using the credentials
https.createServer(credentials, app).listen(443, () => {
  console.log('HTTPS server is running on port 443');
});

// HTTP server to redirect traffic to HTTPS (for HTTP-to-HTTPS redirection)
http.createServer((req, res) => {
  res.writeHead(301, { 'Location': 'https://' + req.headers['host'] + req.url });
  res.end();
}).listen(80, () => {
  console.log('HTTP server running on port 80, redirecting to HTTPS');
});
