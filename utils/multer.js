import console from "console";
import multer from "multer";
import path from 'path';
let multerconfig;
//Multer Config
export default multerconfig =  multer({
    storage:multer.diskStorage({}),
    fileFilter:(req,file,cb) => {
        let ext = path.extname(file.originalname).toLowerCase();
        // console.log(ext);
        if(ext !== ".jpg" && ext!==".jpeg" && ext !==".png"){
            cb(new Error("File Type Is Not Supported"),false);
            return;
        }
        cb(null,true);
    }
});