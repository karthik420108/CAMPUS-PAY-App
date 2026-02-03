// Reusable WebAuthn helper module
// Provides registration and authentication flows using only WebAuthn APIs
import API_CONFIG from "../config/api";

const apiBase = API_CONFIG.BASE_URL; // use configured backend base URL

function isWebAuthnSupported() {
  return !!(window.PublicKeyCredential && navigator.credentials);
}

function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const charCode of bytes) str += String.fromCharCode(charCode);
  const b64 = btoa(str);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBuffer(base64url) {
  const b64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const binary = atob(b64 + pad);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buffer;
}

async function registerCredential(userId, userRole = 'student') {
  if (!isWebAuthnSupported()) throw new Error('WebAuthn not supported');
  console.log('[WebAuthn] Registering credential for userId:', userId, 'userRole:', userRole);

  const url = API_CONFIG.getUrl('/webauthn/register/options');
  console.log('[WebAuthn] POST', url, 'with userId:', userId, 'userRole:', userRole);
  const optsRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userRole }),
  });
  const text = await optsRes.text();
  console.log('[WebAuthn] Register options response:', optsRes.status, text.substring(0, 200));
  if (!optsRes.ok) throw new Error(`Register options request failed: ${optsRes.status} ${text}`);
  if (!text) throw new Error('Empty response from register options');
  const { options } = JSON.parse(text);

  // Convert challenge and user.id
  options.challenge = base64UrlToBuffer(options.challenge);
  options.user.id = base64UrlToBuffer(options.user.id);

  if (options.excludeCredentials) {
    options.excludeCredentials = options.excludeCredentials.map((c) => ({
      ...c,
      id: base64UrlToBuffer(c.id),
    }));
  }

  // Force platform authenticator
  options.authenticatorSelection = options.authenticatorSelection || {};
  options.authenticatorSelection.authenticatorAttachment = 'platform';

  const credential = await navigator.credentials.create({ publicKey: options });

  const att = {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    response: {
      clientDataJSON: bufferToBase64Url(credential.response.clientDataJSON),
      attestationObject: bufferToBase64Url(credential.response.attestationObject),
    },
    type: credential.type,
  };
  console.log('[WebAuthn] Attested credential created for userId:', userId);

  const verifyRes = await fetch(API_CONFIG.getUrl('/webauthn/register/verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userRole, attestation: att }),
  });
  const verifyText = await verifyRes.text();
  console.log('[WebAuthn] Register verify response:', verifyRes.status, verifyText.substring(0, 300));
  if (!verifyRes.ok) throw new Error(`Register verify failed: ${verifyRes.status} ${verifyText}`);
  if (!verifyText) throw new Error('Empty response from register verify');
  return JSON.parse(verifyText);
}

async function authenticateWithEmail(email) {
  if (!isWebAuthnSupported()) throw new Error('WebAuthn not supported');

  const url = API_CONFIG.getUrl('/webauthn/auth/options');
  console.log('[WebAuthn] Auth options request to:', url);
  
  const optsRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const text = await optsRes.text();
  console.log('[WebAuthn] Auth options response status:', optsRes.status, 'text:', text.substring(0, 100));
  
  if (!optsRes.ok && optsRes.status !== 404) throw new Error(`Auth options request failed: ${optsRes.status} ${text}`);
  if (!text) throw new Error('Empty response from auth options');
  
  const data = JSON.parse(text);
  console.log('[WebAuthn] Auth options data:', JSON.stringify(data, null, 2).substring(0, 200));
  
  if (!data.options || !data.hasCredentials) {
    throw new Error(`No biometric credentials registered for ${email}. Please register biometrics after password login.`);
  }
  const options = data.options;

  options.challenge = base64UrlToBuffer(options.challenge);
  if (options.allowCredentials) {
    options.allowCredentials = options.allowCredentials.map((c) => ({
      ...c,
      id: base64UrlToBuffer(c.id),
    }));
  }

  const assertion = await navigator.credentials.get({ publicKey: options });

  const auth = {
    id: assertion.id,
    rawId: bufferToBase64Url(assertion.rawId),
    response: {
      clientDataJSON: bufferToBase64Url(assertion.response.clientDataJSON),
      authenticatorData: bufferToBase64Url(assertion.response.authenticatorData),
      signature: bufferToBase64Url(assertion.response.signature),
      userHandle: assertion.response.userHandle ? bufferToBase64Url(assertion.response.userHandle) : null,
    },
    type: assertion.type,
  };

  const verifyRes = await fetch(API_CONFIG.getUrl('/webauthn/auth/verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, assertion: auth }),
  });

  const verifyText = await verifyRes.text();
  if (!verifyRes.ok) throw new Error(`Auth verify failed: ${verifyRes.status} ${verifyText}`);
  if (!verifyText) throw new Error('Empty response from auth verify');
  return JSON.parse(verifyText);
}

export { isWebAuthnSupported, registerCredential, authenticateWithEmail };
