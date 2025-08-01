import jwt from 'jsonwebtoken'

// Admin or Doctor authentication middleware
const authAdminOrDoctor = async (req, res, next) => {
    console.log('=== authAdminOrDoctor middleware called ===');
    console.log('Headers:', req.headers);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    
    // Check for admin token first (Authorization: Bearer <token>)
    const authHeader = req.headers['authorization'];
    let adminToken = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        adminToken = authHeader.substring(7);
    }
    
    // Check for doctor token (dtoken header)
    const doctorToken = req.headers['dtoken'];
    
    console.log('Admin token found:', adminToken ? 'yes' : 'no');
    console.log('Doctor token found:', doctorToken ? 'yes' : 'no');
    console.log('Admin token value:', adminToken ? adminToken.substring(0, 20) + '...' : 'null');
    console.log('Doctor token value:', doctorToken ? doctorToken.substring(0, 20) + '...' : 'null');
    
    if (!adminToken && !doctorToken) {
        console.log('No tokens found in headers');
        return res.status(401).json({ success: false, message: 'Not Authorized Login Again' })
    }
    
    try {
        let token_decode;
        let userType;
        let tokenToVerify = null;
        
        if (adminToken) {
            // Try to verify as admin token
            console.log('Attempting to verify admin token...');
            tokenToVerify = adminToken;
            userType = 'admin';
        } else if (doctorToken) {
            // Try to verify as doctor token
            console.log('Attempting to verify doctor token...');
            tokenToVerify = doctorToken;
            userType = 'doctor';
        }
        
        if (!tokenToVerify) {
            console.log('No valid token to verify');
            return res.status(401).json({ success: false, message: 'Invalid token format' });
        }
        
        // Verify the token
        token_decode = jwt.verify(tokenToVerify, process.env.JWT_SECRET);
        console.log('Token verified successfully');
        console.log('Decoded token:', token_decode);
        
        if (!token_decode || !token_decode.id) {
            console.log('Token decoded but no id found:', token_decode);
            return res.status(401).json({ success: false, message: 'Invalid token structure' })
        }
        
        req.user = { id: token_decode.id, type: userType }
        console.log('Set req.user:', req.user);
        next()
    } catch (error) {
        console.log('JWT verification error:', error.message);
        console.log('JWT verification error details:', error);
        
        // Provide more specific error messages
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token format' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired' });
        } else if (error.name === 'NotBeforeError') {
            return res.status(401).json({ success: false, message: 'Token not active yet' });
        } else {
            return res.status(401).json({ success: false, message: 'Token verification failed' });
        }
    }
}

export default authAdminOrDoctor; 