const http = require("https")

const sendEmail = (email, firstname, lastname, country) => {
  const options = {
    "method": "POST",
    "hostname": "api.sendgrid.com",
    "port": null,
    "path": "/v3/mail/send",
    "headers": {
      "authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
      "content-type": "application/json"
    }
  }

  const req = http.request(options, function (res) {
    const chunks = []

    res.on("data", function (chunk) {
      chunks.push(chunk)
    })

    res.on("end", function () {
      if (res.status === 202) {
        console.log("Email sent.")
      }

    })
  })

  req.write(JSON.stringify({
    personalizations: [
      {
        to: [
          {
            email: email,
            name: `${firstname} ${lastname}`
          }
        ],
        dynamic_template_data: {
          name: firstname,
          country: country
        },
        subject: "Welcome to iCrowdTask!"
      }
    ],
    from: {
      email: 'team@icrowdtask.works',
      name: 'iCrowdTask Team'
    },
    reply_to: {
      email: 'team@icrowdtask.works',
      name: 'iCrowdTask Team'
    },
    template_id: 'd-135d94ab55f5421f94b8acad91f63115'
  }))
  req.end()
}

module.exports = sendEmail
