document.addEventListener('DOMContentLoaded', function() {

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
  document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .then(emails => {
        console.log(emails);

        // Loop through emails array recieved from API
        for (const email of emails) {

          // Create Div element
          const div = document.createElement('div');
          div.className = 'email-box';
          div.style.padding = '10px';
          div.style.margin = '5px';
          div.style.borderRadius = '15px';

          // Set Div background color depending on read/unread
          if (email['read'] === true) {
            div.style.backgroundColor = 'lightgray';
          } else {
            div.style.backgroundColor = 'white';
          };

          // Modify div contents, and apply event listener to the divs
          div.innerHTML = `<h4>${email.subject}</h4>From: ${email.sender}<br>${email.timestamp}`;
          div.addEventListener('click', () => load_email(email['id']));
          // Add to emails-view containers
          document.querySelector('#emails-view').append(div);

        }
      })
      .catch(error => {
        console.log("Error", error);
      });


}

function load_email(id) {
  // Get particular email
  fetch(`/emails/${id}`)
      .then(response => response.json())
      .then(email => {
        console.log(email);

        // Obtain information from API and put them into #email-view
        const message = document.querySelector('#email-view');
        message.style.padding = '10px';
        message.style.margin = '10px';
        message.style.borderRadius = '15px'
        message.innerHTML = `<b>From</b>: ${email.sender}<br>
                         <b>To</b>: ${email.recipients}<br>
                         <b>Subject</b>: ${email.subject}<br><i>${email.timestamp}</i><hr>
                         ${email.body}`;
      })
      .catch(error => {
        console.log('Error', error);
      });

  // changes email's .read attribute to true
  fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
  });


  // View email's div
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';


}

function send_email(event) {
  // Prevent page from reloading after submitting
  event.preventDefault();
  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');

  // Fetch via POST method
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients.value,
      subject: subject.value,
      body: body.value

    })
  })
      .then(response => response.json())
      .then(result => {
        console.log(result);
        load_mailbox('sent');
      })
      .catch(error => {
        console.log('Error', error);
      });
}