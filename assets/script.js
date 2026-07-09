// picker script
import { genderList } from './gender-list.js?v=20260706';

const SHEETDB_ENDPOINT = 'https://sheetdb.io/api/v1/6quqccp54d2ev';
const PLACEHOLDER_ENDPOINT = 'https://sheetdb.io/api/v1/YOUR_SHEETDB_ENDPOINT';

function pickRandomUnique(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Pick 7 distinct entries: 1 for the headline, 6 for the list
const picks = pickRandomUnique(genderList, 7);

document.getElementById('first-line').textContent = picks[0];

const listEl = document.getElementById('examples-list');
listEl.innerHTML = ''; // clear the hardcoded placeholders
picks.slice(1, 7).forEach(text => {
  const li = document.createElement('li');
  li.textContent = text;
  listEl.appendChild(li);
});

const form = document.getElementById('response-form');
const responseInput = document.getElementById('response');
const statusEl = document.getElementById('form-status');

if (form && responseInput && statusEl) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const response = responseInput.value.trim();
    if (!response) {
      statusEl.textContent = 'Please write a response before submitting.';
      return;
    }

    if (!SHEETDB_ENDPOINT || SHEETDB_ENDPOINT === PLACEHOLDER_ENDPOINT || SHEETDB_ENDPOINT.includes('YOUR_')) {
      statusEl.textContent = 'Please add a valid SheetDB endpoint URL before submitting.';
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    const timestamp = new Date().toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    try {
      const payloads = [
        { data: { response, timestamp } },
        { data: [{ response, timestamp }] },
        { response, timestamp }
      ];

      let lastError = 'Unknown error';

      for (const payload of payloads) {
        const res = await fetch(SHEETDB_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          responseInput.value = '';
          statusEl.textContent = 'thanks — your response was submitted.';
          return;
        }

        const errorText = await res.text().catch(() => '');
        lastError = errorText || `request failed with status ${res.status}`;
      }

      throw new Error(lastError);
    } catch (error) {
      console.error('Unable to submit response:', error);
      statusEl.textContent = 'submission failed. please try again later.';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}
