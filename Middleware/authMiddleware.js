const jwt = require('jsonwebtoken'); 


const auth = (req, res, next) => {
  console.log("Auth Middleware Invoked");
  const token = req.header('x-auth-token');

  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  // console.log("JWT Secret Used for Verification:", process.env.JWT_SECRET);
 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded Token:", decoded);
    req.user = decoded.id;
    console.log("Decoded User ID:", req.user);
    next();
  } catch (e) {
    
    console.error("JWT Verification failed. Error details:", e.message);
    res.status(400).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;