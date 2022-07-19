import mongoose from 'mongoose'



import modelFiledDefinations from '../helper/modelFiledDefinations.js'

const Schema = mongoose.Schema;

const OTPSchema = new Schema({
    user_id: { type: Schema.ObjectId, ref: "User", required: true },
    otp: modelFiledDefinations.stringAndRequired,
    otpSecret : modelFiledDefinations.stringOnly,
}, { timestamps: true })


export default mongoose.models.OTP || mongoose.model("OTP", OTPSchema)