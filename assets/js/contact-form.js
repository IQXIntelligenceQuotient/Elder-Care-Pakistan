const form = document.getElementById('ecpContactForm');
const status = document.getElementById('ecpContactFormStatus');
const button = form.querySelector('button[type="submit"]');
const fallback = document.getElementById('ecpContactFormFallback');
const emailDraft = document.getElementById('ecpContactEmailDraft');

emailDraft.addEventListener('click', () => {
  const fields = new FormData(form);
  const body = [
    'Name: ' + fields.get('name'),
    'Email: ' + fields.get('email'),
    'Phone: ' + fields.get('phone_number'),
    'City: ' + fields.get('city'),
    '',
    fields.get('message'),
  ].join('\r\n');
  emailDraft.href = 'mailto:eldercarepakistan@gmail.com?subject=Website%20contact%20inquiry&body='
    + encodeURIComponent(body);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (button.disabled) return;

  button.disabled = true;
  fallback.hidden = true;
  status.textContent = 'Sending your message…';
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });
    const result = await response.json();
    status.textContent = result.message;
    if (response.status === 202 && result.accepted === true) {
      form.reset();
    } else if (response.status >= 500 || response.status === 429) {
      fallback.hidden = false;
    }
  } catch {
    status.textContent = 'We could not confirm submission. You can open an email draft or use WhatsApp.';
    fallback.hidden = false;
  } finally {
    button.disabled = false;
  }
});
