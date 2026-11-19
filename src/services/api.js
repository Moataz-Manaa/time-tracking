export async function api(path, body, method = 'POST') {
  const options = { credentials: 'same-origin' };
  if (body !== undefined) {
    options.method = method;
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  let response;
  try { response = await fetch('/api/' + path, options); }
  catch { throw new Error('Could not reach the server. Please try again.'); }
  const text = await response.text();
  let result;
  try { result = JSON.parse(text); }
  catch { throw Object.assign(new Error('The server is temporarily unavailable. Please try again. If you were creating an account, try signing in first.'), { status: response.status }); }
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('auth/')) window.dispatchEvent(new Event('session-expired'));
    throw Object.assign(new Error(result.error || 'Request failed.'), { status: response.status });
  }
  return result;
}
