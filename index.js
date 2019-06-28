'use strict';
// Require nodemailer as we'll use this package to send our email
// Remember to add the nodemailer package as a dependency in your package.json script.
const nodemailer = require('nodemailer');
// Configure nodemailder initialization
// We'll use gmail's smtp as our email protocol provider using secure port 465
// Authentication is done with OAuth2. Check the ReadME file to set up to gmail account
// Our account and sensitive datails will be saved as environment variables and
// will be retrieved using process.env
const mailTransport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.GMAIL_ADDRESS,
    serviceClient: process.env.CLIENT_ID,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, "\n")
  }
});
// Define our mail function called pubsubTriggeredMailer.
// This will be an async function that takes three arguments. 
// The arguments are coming directly from our pubsub trigger.
exports.pubsubTriggeredMailer = async (pubSubEvent, context, callback) => {
    // pubSubEvent.data contains our pubsub topic message in base64
    // We use Buffer.from to decode the message to human readable string
    // We also set a default message incase our pubsub event contains no message
    const emailBody = pubSubEvent.data
        ? Buffer.from(pubSubEvent.data, 'base64').toString()
        : process.env.MAIL_BODY;
    const mailOptions = {
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_TO,
        cc: process.env.MAIL_CC,
        subject: process.env.MAIL_SUBJECT,
        text: emailBody
    };
    // Call mailTransport's sendMail to send our email and catch any error
    try {
        await mailTransport.sendMail(mailOptions);
        console.log('Email sent');
    } catch(error) {
        console.error('There was an error while sending the email:', error);
    }
    // You can view the function logs on your gcloud console to see the result of
    // your function
    // Call the callback() method from our last pubsub argument to indicate the
    // end of our script otherwise, our script might keep running and will eventually
    // timeout
    callback();
};