import jwt from 'jsonwebtoken'
const genrateToken = (data) => {
    if(data.password){
        delete data['password']
        
    }
    if(data.rooms){
        delete data['rooms']
    }
    const accessToken = jwt.sign(
        {
            data: data
        },
        process.env.JSON_WEB_TOKEN_SECRET_KEY,
        { expiresIn: '2h' }
    );
    const refreshToken = jwt.sign(
        {
            data: data
        },
        process.env.JSON_REFRESH_TOKEN_SECRET_KEY,
        { expiresIn: '5y' }
    );

    return {
        refreshToken: refreshToken,
        accessToken: accessToken
    }
}
export default genrateToken

export const generateOTPVerifiedToken = data => {
    return jwt.sign(
      {
        data: data
      },
      process.env.JSON_OTP_REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: 300 }
    )
  }
  

