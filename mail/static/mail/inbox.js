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

function compose_email(nothing = '', subj = '', recipient='', body='') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipient;
  document.querySelector('#compose-subject').value = subj;

  document.querySelector('#compose-body').value = body;
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
          div.style.border = 'solid black 1px';

          // Set Div background color depending on read/unread
          if (email['read'] === true) {
            div.style.backgroundColor = 'lightgray';
          } else {
            div.style.backgroundColor = 'white';
          }

          // Modify div contents, and apply event listener to the divs
          div.innerHTML = `<b>${email.subject}</b> ${email.sender}<br>${email.timestamp}`;
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

        // Reply Button
        let reply = document.createElement('button');
        reply.innerHTML = 'Reply';

        // Checks if subject already contains 'Re:'
        if (email['subject'].includes('Re:') === true) {
            reply.addEventListener('click', () => compose_email('', `${email['subject']}`, `${email.sender}`, `${email.body}`));
        } else {
            reply.addEventListener('click', () => compose_email('', `Re: ${email['subject']}`, `${email.sender}`, `On ${email.timestamp}, ${email.sender} wrote: ${email.body}`));
        }

        // Archive/ Unarchive button
        let button = document.createElement('button');
        if (email['archived'] === false) {
            button.innerHTML = 'Archive Email';
            button.addEventListener('click', () => archive(`${email.id}`, true));

        } else {
            button.innerHTML = 'Unarchive Email';
            button.addEventListener('click', () => archive(`${email.id}`, false));
        }


        // Obtain information from API and put them into #email-view
        const message = document.querySelector('#email-view');
        message.style.padding = '10px';
        message.style.margin = '10px';
        message.style.borderRadius = '15px'
        message.innerHTML = `<b>From</b>: ${email.sender}<br>
                         <b>To</b>: ${email.recipients}<br>
                         <b>Subject</b>: ${email.subject}<br><i>${email.timestamp}</i><hr>
                         ${email.body}<br>`;
        message.append(reply);
        message.append(button);
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

// Archive/Unarchive emails depending on current status
function archive(id, archived) {

    fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: archived
        })
    })
        .then(response => load_mailbox('inbox'));
}




