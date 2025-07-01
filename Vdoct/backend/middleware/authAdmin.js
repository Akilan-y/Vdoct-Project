import jwt from "jsonwebtoken"

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers
        console.log('AuthAdmin middleware - received token:', !!atoken);
        
        if (!atoken) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
        
        // Verify the JWT token
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)
        console.log('Token decoded:', token_decode);
        
        // Check if the decoded token matches admin credentials
        const expectedToken = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
        console.log('Expected token:', expectedToken);
        console.log('Token match:', token_decode === expectedToken);
        
        if (token_decode !== expectedToken) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
        
        // Set admin user info
        req.user = { 
            id: 'admin', 
            email: process.env.ADMIN_EMAIL,
            role: 'admin'
        }
        
        console.log('Admin user set:', req.user);
        
        next()
    } catch (error) {
        console.log('AuthAdmin middleware error:', error)
        res.json({ success: false, message: error.message })
    }
}

export default authAdmin;