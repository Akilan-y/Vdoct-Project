import jwt from 'jsonwebtoken'

// doctor authentication middleware
const authDoctor = async (req, res, next) => {
    console.log('=== authDoctor middleware called ===');
    console.log('Headers:', req.headers);
    
    const dToken = req.headers['dtoken'];
    console.log('Received dToken:', dToken ? dToken.substring(0, 20) + '...' : 'null');
    
    if (!dToken) {
        console.log('No dToken found in headers');
        return res.json({ success: false, message: 'Not Authorized Login Again' })
    }
    
    try {
        const token_decode = jwt.verify(dToken, process.env.JWT_SECRET)
        console.log('Decoded token:', token_decode);
        
        if (!token_decode || !token_decode.id) {
            console.log('Token decoded but no id found:', token_decode);
            return res.json({ success: false, message: 'Invalid token structure' })
        }
        
        req.user = { id: token_decode.id }
        console.log('Set req.user:', req.user);
        next()
    } catch (error) {
        console.log('JWT verification error:', error)
        res.json({ success: false, message: error.message })
    }
}

export default authDoctor;