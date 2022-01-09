import  mongoose from 'mongoose';

const adminSchema = mongoose.Schema({
    name: {type: String, required: true},
    collegeName: {type: String, required: true},
    email:{type: String, required:true},
    password:{type:String,required:true},
    type:{type:String, default:'college admin'},
    id:{type:String},
    date:{type:Date, default:Date.now}
})

export default mongoose.model("admin", adminSchema);
