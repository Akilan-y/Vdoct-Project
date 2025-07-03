import jwt from 'jsonwebtoken'

// user authentication middleware
const authUser = async (req, res, next) => {
    console.log('authUser middleware called');
    const { token } = req.headers
    if (!token) {
        console.log('authUser error: No token provided');
        return res.status(401).json({ success: false, message: 'Not Authorized Login Again' })
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        req.user = { id: token_decode.id }
        next()
    } catch (error) {
        console.log('authUser error:', error.message);
        res.status(401).json({ success: false, message: 'Not Authorized Login Again' })
    }
}

export default authUser;