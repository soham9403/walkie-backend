import nodemailer from 'nodemailer'
const email = 'crmadmin@wehear.in'
const pass = 'WeHear@crmadmin'
export const mailConfig = nodemailer.createTransport({  
  name:'crm.wehear.in',
  port: 465, // true for 465, false for other ports
  host: 'sh103.webhostingservices.com', //'sh103.webhostingservices.com',//'sh103.webhostingservices.com', //'mail.wehear.in',//"smtp.gmail.com",
  auth: {
    user: email,
    pass: pass
  },
  
  // mailer:'sh103.webhostingservices.com',
  secure: true
})

export const sendMail = async (
  to,
  subject,
  text = '',
  html = '<div></div>',
  attachments = null
) => {
  return await mailConfig
    .sendMail({
      from: process.env.EMAIL_HOST_USERNAME,
      to,
      subject,
      text,
      html,
      attachments
    })
    .then(res => {      
      console.log('s')
      return res
    })
    .catch((e) => {
      
      console.log(e);
    })
}
