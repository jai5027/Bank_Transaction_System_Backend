require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"BT" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = 'Welcome to BT!';
  const text = `Hello ${name},\n\nThank you for registering with BT. We're excited to have you on board!`;
  const html = `<p>Hello ${name},</p><p>Thank you for registering with BT. We're excited to have you on board!</p>`;

  await sendEmail(userEmail, subject, text, html);
}  

async function sendTransactionEmail(userEmail, name, amount, toAccount) {

  const subject = "Transaction Successful";

  const text = `Hello ${name},

Your transaction was successful.

Amount Sent: ₹${amount}
To Account: ${toAccount}

Thank you for using BT.`;

  const html = `
    <p>Hello ${name},</p>

    <p>Your transaction was <b>successful</b>.</p>

    <p>
      <b>Amount Sent:</b> ₹${amount} <br/>
      <b>To Account:</b> ${toAccount}
    </p>

    <p>Thank you for using BT.</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailedEmail(userEmail, name, amount, toAccount) {

  const subject = "Transaction Failed";
  const text = `Hello ${name},

Your transaction has failed.

Amount: ₹${amount}
To Account: ${toAccount}

Please try again later.`;

  const html = `
    <p>Hello ${name},</p>

    <p>Your transaction has <b>failed</b>.</p>

    <p>
      <b>Amount:</b> ₹${amount} <br/>
      <b>To Account:</b> ${toAccount}
    </p>

    <p>Please try again later.</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendRegistrationEmail, sendTransactionEmail, sendTransactionFailedEmail }