import jwt  from "jsonwebtoken";

const secret = 'testing';

const auth = async (req, res, next) => {  
  try {
    if (!req.headers.authorization) return res.json({status:401,errorMessage:'Please Provide a Token!'});
    const token = req.headers.authorization.split(" ")[1];
    const isCustomAuth = token.length < 500;
    if(!token) return res.json({status:401,message:'No token,Access Denied!'});
    let decodedData;  
    if (token && isCustomAuth) {      
      const decodedData = jwt.verify(token, secret);
      req.userInfo = decodedData;
      req.userId = decodedData?.id;
    } else{
      decodedData = jwt.decode(token);
      req.userId = decodedData?.sub;
    }
    next();
  } catch (error) {
    console.log(error);
    res.json({status:'401',msg:'Invalid Token!', errorr:error});
  }
};
    
    
      
  
export default auth;