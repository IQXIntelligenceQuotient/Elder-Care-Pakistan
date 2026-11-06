const form = document.getElementById('ecpContactForm');
const status = document.getElementById('ecpContactFormStatus');
const button = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (button.disabled) return;

  button.disabled = true;
  status.textContent = 'Sending your message…';
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });
    const result = await response.json();
    status.textContent = result.message;
    if (response.ok) form.reset();
  } catch {
    status.textContent = 'We could not confirm submission. Please contact us by email or WhatsApp.';
  } finally {
    button.disabled = false;
  }
});
