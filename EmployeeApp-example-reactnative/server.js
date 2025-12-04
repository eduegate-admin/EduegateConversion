const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Serve static files
app.use(express.static('.'));

// Main route - serve our demo
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo-two-step.html'));
});

// API route to simulate employee validation
app.post('/api/validate-employee', express.json(), (req, res) => {
  const { employeeCode } = req.body;
  const validCodes = ['EMP001', 'EMP002', 'ADMIN'];
  
  if (validCodes.includes(employeeCode.toUpperCase())) {
    res.json({
      success: true,
      employee: {
        code: employeeCode.toUpperCase(),
        name: employeeCode.toUpperCase() === 'ADMIN' ? 'Admin User' : `Employee ${employeeCode.toUpperCase()}`,
        department: employeeCode.toUpperCase() === 'ADMIN' ? 'Administration' : 'Operations'
      }
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid employee code' });
  }
});

// API route to simulate password validation
app.post('/api/login', express.json(), (req, res) => {
  const { password } = req.body;
  const validPasswords = ['password123', 'admin123'];
  
  if (validPasswords.includes(password)) {
    res.json({
      success: true,
      token: 'mock-jwt-token-' + Date.now()
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid password' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Employee Management App running at http://localhost:${port}`);
  console.log(`📱 Two-Step Login Demo: http://localhost:${port}/demo-two-step.html`);
  console.log(`💻 React Native Web Simulator: http://localhost:${port}`);
});