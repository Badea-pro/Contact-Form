const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const sgMail = require("@sendgrid/mail");

const url = `Add your mongoDB URL`;

let PORT = process.env.PORT || 5700;

let apiKey = 'Add your API_Key on Sendgrid'
let myEmail = 'Add your Email'
let senderEmail = 'Add your Sender email'

const NewDate = new Date()

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const formSchema = new mongoose.Schema(
  {
    data: Object,
    date: { type: Date, default: Date.now },
  },
  {
    collection: `SubmittedForm`,
  }
);

const Form = mongoose.model("Form", formSchema);

const formData = (bodyData) => {
  Form({ data: bodyData }).save((err) => {
    if (err) {
      throw err;
    } else {
      sgMail.setApiKey(
        apiKey
      );
      const msg = [
        { 
          to: myEmail,
          from: senderEmail,
          subject: "There is a submitted form.",
          html: `
          <h1>The Email is : ${ bodyData.email }</h1>
          <h1>The name is : ${ bodyData.name }</h1>
          <h2>The Questions : ${ bodyData.comment }</h2>
          `,
        },
        { 
          to: `${ bodyData.email }`,
          from: senderEmail,
          subject: "Badea submitted form.",
          html: `
          <h1>Thank you for submiting the form</h1>
          <h1>Your Name is : ${ bodyData.name }</h1>
          <h1>Your Number is : ${ bodyData.number }</h1>
          <h2>Your Comment : ${ bodyData.comment }</h2>
          `,
      }
      ];
      sgMail
        .send(msg)
        .then((response) => {
          console.log(response[0].statusCode);
          console.log('E-mail successfully sent.');
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });
};

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/submit", urlencodedParser, (req, res) => {
  formData(req.body);
  res.render("success", { name: req.body.name });
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
