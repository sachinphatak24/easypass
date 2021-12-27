import jwt  from "jsonwebtoken";

const secret = 'testing';


const auth = async(req,res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const ifCustomAuth = token.length < 500;

        let decodedData;

        if(token && ifCustomAuth) {
            decodedData = jwt.verify(token, 'testing');
            req.userId = decodedData?.id; 
        } else{
            decodedData = jwt.decode(token);
            req.userId = decodedData?.sub;
        }

        next();
    } catch (error) {
        console.log(error);
    }
}

export default auth;