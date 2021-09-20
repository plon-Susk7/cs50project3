document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_email;


  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#emails-load').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';


}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-load').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (mailbox == 'sent') {

    fetch('/emails/sent')
      .then(response => response.json())
      .then((emails) => {

        for (let email of emails) {
          const Div = document.createElement('div');

          Div.innerHTML += "Recepient : " + email.recipients + " " + "Subject: " + email.subject + "</br>";
          Div.style.backgroundColor = "lightgrey"
          Div.innerHTML += "Time: " + email.timestamp + "</br>";
          Div.style.border = "2px solid black";
          Div.style.margin = "2px"
          document.querySelector('#emails-view').appendChild(Div);
          document.querySelector('#emails-load').innerHTML = " ";
          Div.addEventListener('click', () => load_smail(email));

        }

      })

  } else if (mailbox == 'inbox') {
    fetch('/emails/inbox')
      .then(response => response.json())
      .then((emails) => {

        for (let email of emails) {
          const Div = document.createElement('div');
          if (email.read == true) {
            Div.style.backgroundColor = "lightgrey";
          } else {
            Div.style.backgroundColor = "white";
          }
          Div.innerHTML += "Sender: " + email.sender + " " + "Subject: " + email.subject + "</br>";

          Div.innerHTML += "Time: " + email.timestamp + "</br>";
          Div.style.border = "2px solid black";
          Div.style.margin = "2px"
          document.querySelector('#emails-view').appendChild(Div);
          document.querySelector('#emails-load').innerHTML = " ";
          Div.addEventListener('click', () => load_mail(email));

        }

      })

  } else if (mailbox == 'archive') {
    fetch('/emails/archive')
      .then(response => response.json())
      .then((emails) => {

        for (let email of emails) {
          const Div = document.createElement('div');
          Div.style.backgroundColor = "lightgrey"
          Div.innerHTML += "Sender: " + email.sender + " " + "Subject: " + email.subject + "</br>";

          Div.innerHTML += "Time: " + email.timestamp + "</br>";
          Div.style.border = "2px solid black";
          Div.style.margin = "2px"
          document.querySelector('#emails-view').appendChild(Div);
          document.querySelector('#emails-load').innerHTML = " ";
          Div.addEventListener('click', () => load_mail(email));

        }

      })

  }
}


function send_email() {
  fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then((result) => {
      console.log(result);
      load_mailbox('sent');
    });
  return false;
};

function load_mail(email) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-load').style.display = 'block';

  fetch(`emails/${email.id}`)
    .then(response => response.json())
    .then(email => {
      const Div = document.createElement('div');


      Div.innerHTML = "Sender: " + email.sender + "</br>";
      Div.innerHTML += "To: " + email.recipients + "</br>";
      Div.innerHTML += "Subject: " + email.subject + "</br>";
      Div.innerHTML += "Time: " + email.timestamp + "</br>";

      Div.innerHTML += "<hr>";
      Div.innerHTML += email.body + "</br>";
      Div.innerHTML += "<hr>";

      document.querySelector('#emails-load').appendChild(Div)

      //reply button
      if (email.archived != true) {
        const replyBtn = document.createElement('button');
        replyBtn.setAttribute('class', 'btn btn-sm btn-outline-primary');
        replyBtn.style.marginTop = "20px"
        replyBtn.textContent = "Reply";
        document.querySelector('#emails-load').appendChild(replyBtn);

        replyBtn.addEventListener('click', function () {
          compose_email();
          document.querySelector('#compose-recipients').value = email.sender;
          document.querySelector('#compose-subject').value = `Reply to mail sent at ${email.timestamp}`;
          document.querySelector('#compose-body').value = '';

        })

        const archBtn = document.createElement('button')
        archBtn.setAttribute('class', 'btn btn-sm btn-outline-primary');
        archBtn.style.marginTop = "20px";
        archBtn.style.marginLeft = "5px";
        archBtn.textContent = "Archieve";
        document.querySelector('#emails-load').appendChild(archBtn);

        archBtn.addEventListener('click', function () {
          fetch(`emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: true
              })
            })
            .then(response => response.json());

          load_mailbox('archive');

        })
      } else {
        const unarchBtn = document.createElement('button')
        unarchBtn.setAttribute('class', 'btn btn-sm btn-outline-primary');
        unarchBtn.style.marginTop = "20px"
        unarchBtn.textContent = "Unarchive";
        document.querySelector('#emails-load').appendChild(unarchBtn);

        unarchBtn.addEventListener('click', function () {
          fetch(`emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: false
              })
            })
            .then(response => response.json());

          load_mailbox('inbox');

        })
      }
    })
  // marking email as read
  fetch(`emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function load_smail(email) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-load').style.display = 'block';

  fetch(`emails/${email.id}`)
    .then(response => response.json())
    .then(email => {
      const Div = document.createElement('div');


      Div.innerHTML = "Sender: " + email.sender + "</br>";
      Div.innerHTML += "To: " + email.recipients + "</br>";
      Div.innerHTML += "Subject: " + email.subject + "</br>";
      Div.innerHTML += "Time: " + email.timestamp + "</br>";

      Div.innerHTML += "<hr>";
      Div.innerHTML += email.body + "</br>";
      Div.innerHTML += "<hr>";

      document.querySelector('#emails-load').appendChild(Div)

    })
}