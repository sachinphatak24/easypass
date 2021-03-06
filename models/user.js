import  mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    name: {type: String, required: true},
    email:{type: String, required:true},
    password:{type:String,required:true},
    type:{type:String, default:'Student'},
    id:{type:String},
    date:{type:String, default:Date().toString()}
})

export default mongoose.model("User", userSchema);
