/**
 * TALK TUK TUK PREMIUM UI
 * Individual and Duo packages
 * Access is verified through Supabase
 */

const PremiumUI = {

  showManageDevices: function(initialCode = '') {
    const existing = document.getElementById('ttt-premium-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'ttt-premium-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:9999;padding:12px;box-sizing:border-box;';

    const content = document.createElement('div');
    content.style.cssText = 'background:white;color:#333;border-radius:20px;padding:20px;max-width:400px;width:100%;max-height:100%;overflow-y:auto;text-align:center;box-sizing:border-box;';

    content.innerHTML = `
      <img src="NEW_TTT_LOGO.png" alt="Talk Tuk Tuk" style="width:85px;height:85px;object-fit:contain;">

      <h2 style="color:#1565C0;">Manage My Devices</h2>

      <p>Use your recovery code to manage your registered devices.</p>

      <input type="password" autocomplete="off" aria-label="Recovery code" placeholder="Enter recovery code" style="width:100%;box-sizing:border-box;padding:12px;font-size:16px;border:1px solid #ccc;border-radius:8px;">

      <button type="button" data-action="list" style="width:100%;padding:12px;margin:10px 0;background:#FFD600;color:#222;border:0;border-radius:20px;">Show My Devices</button>

      <div role="status" style="font-size:14px;margin:8px 0;"></div>

      <div data-devices></div>

      <button type="button" data-action="restore" hidden style="width:100%;padding:12px;margin:10px 0;background:#174B32;color:white;border:0;border-radius:20px;">Activate This Device</button>

      <button type="button" data-action="close" style="width:100%;padding:12px;margin-top:10px;background:#eee;color:#333;border:0;border-radius:20px;">Back to Talk Tuk Tuk</button>`;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    const input = content.querySelector('input');
    const status = content.querySelector('[role="status"]');
    const list = content.querySelector('[data-devices]');
    const show = content.querySelector('[data-action="list"]');
    const restore = content.querySelector('[data-action="restore"]');
    const close = content.querySelector('[data-action="close"]');

    input.value = initialCode || PremiumLicense.getRecoveryCode() || '';

    let busy = false;
    let verifiedCode = '';
    let currentRemoved = false;

    function setBusy(value) {
      busy = value;
      input.disabled = value;
      show.disabled = value;
      restore.disabled = value;
      list.querySelectorAll('button').forEach(b => b.disabled = value);
    }

    function finish() {
      if (busy) return;
      overlay.remove();
      if (currentRemoved) location.reload();
    }

    close.onclick = finish;

    input.oninput = function() {
      verifiedCode = '';
      list.replaceChildren();
      restore.hidden = true;
      status.textContent = '';
    };

    async function loadDevices(code) {

      list.replaceChildren();
      restore.hidden = true;
      verifiedCode = '';
      status.textContent = 'Checking devices...';

      const result = await PremiumLicense.listDevices(code);

      if (!result.success) {
        status.textContent = result.message;
        return;
      }

      const maximumDevices = Number(result.maximum_devices);

      if (maximumDevices !== 1 && maximumDevices !== 2) {
        status.textContent = 'Unable to confirm your device allowance. Please try again.';
        return;
      }

      verifiedCode = code;

      const devices = Array.isArray(result.devices) ? result.devices : [];
      const currentId = PremiumLicense.getDeviceId().toLowerCase();

      const packageName = maximumDevices === 2
        ? 'Premium Duo'
        : 'Premium Individual';

      status.textContent = packageName + ' — ' +
        devices.length + ' of ' + maximumDevices +
        ' devices registered';

      devices.forEach(device => {

        const row = document.createElement('div');
        row.style.cssText = 'border:1px solid #ddd;border-radius:12px;padding:12px;margin:8px 0;text-align:left;';

        const name = document.createElement('strong');
        name.textContent = device.device_name || 'Unknown device';

        const detail = document.createElement('p');
        const current = device.device_id === currentId;
        detail.textContent = current ? 'This device' : 'Registered device';

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = 'Remove device';
        remove.style.cssText = 'padding:8px;color:#b71c1c;background:#fff;border:1px solid #b71c1c;border-radius:8px;';

        remove.onclick = async function() {

          if (busy || !confirm('Remove ' + name.textContent + '? You can activate a replacement for free.')) return;

          setBusy(true);

          try {

            const removed = await PremiumLicense.removeDevice(code, device.device_id);

            if (!removed.success) {
              status.textContent = removed.message;
              return;
            }

            if (current && !PremiumLicense.isUnlocked()) {
              currentRemoved = true;
            }

            await loadDevices(code);

          } finally {
            setBusy(false);
          }
        };

        row.append(name, detail, remove);
        list.appendChild(row);
      });

      restore.hidden =
        devices.length >= maximumDevices &&
        !devices.some(d => d.device_id === currentId);
    }

    show.onclick = async function() {

      if (busy) return;

      setBusy(true);

      try {
        await loadDevices(PremiumLicense.normalizeRecoveryCode(input.value));
      } finally {
        setBusy(false);
      }
    };

    restore.onclick = async function() {

      if (busy || !verifiedCode) return;

      setBusy(true);

      try {

        const result = await PremiumLicense.restoreWithRecoveryCode(verifiedCode);

        if (result.success) {
          location.reload();
          return;
        }

        status.textContent = result.message;

      } finally {
        setBusy(false);
      }
    };
  },

  // PAYMENT SUCCESS SCREEN
  // Real payment verification must happen on the server.

  showPaymentSuccess: function(recoveryCode, onStart, preview = false) {

    const code = PremiumLicense.normalizeRecoveryCode(recoveryCode);

    if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{12}$/.test(code)) {
      throw new Error('Invalid recovery code');
    }

    if (!preview && typeof onStart !== 'function') {
      throw new Error('Payment completion handler required');
    }

    const existing = document.getElementById('ttt-premium-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'ttt-premium-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:9999;padding:12px;box-sizing:border-box;';

    const content = document.createElement('div');
    content.style.cssText = 'background:white;color:#333;border-radius:20px;padding:20px;max-width:400px;width:100%;max-height:100%;overflow-y:auto;text-align:center;box-sizing:border-box;';

    content.innerHTML = `
      <img src="NEW_TTT_LOGO.png" alt="Talk Tuk Tuk" style="width:85px;height:85px;object-fit:contain;">

      <p data-preview hidden style="color:#a35b00;font-weight:bold;">TEST PREVIEW — No payment taken</p>

      <h2 style="color:#174B32;">✓ Payment Successful!</h2>

      <strong>Welcome to Talk Tuk Tuk Premium</strong>

      <p>Lifetime access to all 250 phrases, interactive quizzes and offline learning.</p>

      <strong>Your Personal Recovery Code</strong>

      <input data-code readonly aria-label="Your recovery code" style="width:100%;box-sizing:border-box;text-align:center;font-size:24px;font-weight:bold;padding:12px;margin:10px 0;border:1px solid #ccc;border-radius:10px;">

      <button type="button" data-copy style="width:100%;padding:12px;background:#FFD600;color:#333;border:0;border-radius:20px;margin-bottom:8px;">Copy Recovery Code</button>

      <button type="button" data-save style="width:100%;padding:12px;background:#eee;color:#333;border:0;border-radius:20px;">Save Recovery Code</button>

      <p style="font-size:14px;">Keep this code private and safe. You will need it to restore Premium or activate devices within your purchased package. You can replace an old device for free.</p>

      <label style="display:flex;align-items:center;gap:8px;text-align:left;">
        <input type="checkbox" data-confirm>
        I have saved my recovery code
      </label>

      <div role="status" style="font-size:13px;margin:8px 0;"></div>

      <button type="button" data-start disabled style="width:100%;padding:14px;background:#174B32;color:white;border:0;border-radius:20px;opacity:.5;">Start Learning</button>`;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    const field = content.querySelector('[data-code]');
    const status = content.querySelector('[role="status"]');
    const confirmSaved = content.querySelector('[data-confirm]');
    const start = content.querySelector('[data-start]');

    field.value = code;

    content.querySelector('[data-preview]').hidden = !preview;

    content.querySelector('[data-copy]').onclick = async function() {

      try {
        await navigator.clipboard.writeText(code);
        status.textContent = 'Recovery code copied.';
      } catch {
        field.focus();
        field.select();
        status.textContent = 'Select and copy the recovery code manually.';
      }
    };

    content.querySelector('[data-save]').onclick = function() {

      const blob = new Blob([
        (preview ? 'TEST PREVIEW — Not a valid purchase\n' : '') +
        'Talk Tuk Tuk Premium\nRecovery code: ' +
        code +
        '\nKeep this code private and safe.\n'
      ], {type:'text/plain'});

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'Talk-Tuk-Tuk-Recovery-Code.txt';

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 30000);

      status.textContent = 'Check your downloads for the recovery code file.';
    };

    confirmSaved.onchange = function() {
      start.disabled = !confirmSaved.checked;
      start.style.opacity = confirmSaved.checked ? '1' : '.5';
    };

    start.onclick = async function() {

      if (!confirmSaved.checked || start.disabled) return;

      if (preview) {
        overlay.remove();
        return;
      }

      start.disabled = true;
      confirmSaved.disabled = true;

      try {

        await onStart();
        overlay.remove();

      } catch {

        status.textContent = 'Unable to finish activation. Please try again.';
        confirmSaved.disabled = false;
        start.disabled = false;
      }
    };
  },

  // PREMIUM PACKAGE SELECTION

  showPaymentPrompt: function() {

    const existing = document.getElementById('ttt-premium-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'ttt-premium-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:9999;padding:12px;box-sizing:border-box;';

    const content = document.createElement('div');
    content.style.cssText = 'background:white;color:#333;border-radius:20px;padding:20px;max-width:400px;width:100%;max-height:100%;overflow-y:auto;text-align:center;box-sizing:border-box;';

    content.innerHTML = `
      <img src="NEW_TTT_LOGO.png" alt="Talk Tuk Tuk" style="width:85px;height:85px;object-fit:contain;border-radius:50%;">

      <h2 style="font-family:Fredoka One,cursive;color:#1565C0;margin:8px 0;">Unlock Premium</h2>

      <div style="font-size:16px;font-weight:bold;">200 additional video phrases</div>

      <p style="font-size:13px;">Choose your Premium package</p>

      <label data-plan-card="individual" style="display:block;border:2px solid #174B32;background:#f0f8f2;border-radius:14px;padding:14px;margin:10px 0;text-align:left;cursor:pointer;">

        <input type="radio" name="ttt-plan" value="individual" checked>

        <strong style="color:#174B32;">Premium Individual</strong>

        <span style="float:right;font-size:22px;font-weight:bold;color:#1565C0;">$4.99</span>

        <div style="font-size:14px;margin:8px 0 0 24px;">
          1 device<br>
          All 250 phrases<br>
          Lifetime access
        </div>

      </label>

      <label data-plan-card="duo" style="display:block;border:2px solid #ddd;background:white;border-radius:14px;padding:14px;margin:10px 0;text-align:left;cursor:pointer;">

        <input type="radio" name="ttt-plan" value="duo">

        <strong style="color:#174B32;">Premium Duo</strong>

        <span style="float:right;font-size:22px;font-weight:bold;color:#1565C0;">$7.99</span>

        <div style="font-size:14px;margin:8px 0 0 24px;">
          2 devices<br>
          All 250 phrases<br>
          Lifetime access<br>
          <strong style="color:#174B32;">Save $1.99</strong><br>
          Perfect for couples and travel partners
        </div>

      </label>

      <div style="font-size:13px;line-height:1.7;margin:12px 0;">
        ✓ Interactive quizzes<br>
        ✓ Offline learning<br>
        ✓ Free device replacement<br>
        ✓ No subscriptions or advertisements
      </div>

      <div style="font-size:12px;margin-bottom:15px;">USD · One-time payment · Lifetime access</div>

      <div style="border:1px solid #ddd;border-radius:12px;padding:12px;text-align:left;font-size:13px;">

        <strong>Stay connected with Talk Tuk Tuk</strong>

        <p style="margin:6px 0 10px;">Be the first to hear about new phrases, app updates and exciting new features.</p>

        <input id="ttt-purchase-email" type="email" autocomplete="email" aria-label="Email address (optional)" placeholder="Enter your email address (optional)" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid #ccc;border-radius:8px;font-size:16px;">

        <label style="display:flex;align-items:flex-start;gap:8px;margin-top:10px;">
          <input id="ttt-marketing-consent" type="checkbox" style="width:18px;height:18px;flex-shrink:0;">
          I'd like to receive email updates.
        </label>

        <div style="font-size:12px;color:#666;margin-top:6px;">No spam. Unsubscribe at any time.</div>

      </div>

      <button type="button" id="ttt-buy-premium" style="width:100%;background:#FFD600;color:#1a1a2e;border:0;border-radius:30px;padding:14px;font-family:Fredoka One,cursive;font-size:18px;cursor:pointer;margin-top:14px;">Proceed to Payment – $4.99</button>

      <div id="ttt-purchase-message" role="status" style="font-size:13px;color:#555;margin-top:8px;">Payments coming soon</div>

      <div style="text-align:center;font-size:11px;line-height:1.8;margin:12px 0;">

        <a href="privacy.html" target="_blank" rel="noopener" style="color:#1565C0;">Privacy Policy</a>

        <span style="color:#999;"> | </span>

        <a href="terms.html" target="_blank" rel="noopener" style="color:#1565C0;">Terms &amp; Conditions</a>

        <span style="color:#999;"> | </span>

        <a href="refund.html" target="_blank" rel="noopener" style="color:#1565C0;">Refund Policy</a>

      </div>
<button type="button" onclick="PremiumUI.showManageDevices()" style="width:100%;background:none;border:0;color:#1565C0;padding:10px;cursor:pointer;">Restore Premium / Manage My Devices</button>
<button type="button" onclick="PremiumUI.showAccessCodeBox()" style="width:100%;background:none;border:0;color:#1565C0;padding:10px;cursor:pointer;">Beta Tester Access</button>
      <button type="button" onclick="this.parentElement.parentElement.remove()" style="width:100%;background:#eee;color:#333;border:0;border-radius:30px;padding:12px;cursor:pointer;">Cancel</button>
    `;

    let selectedPlan = 'individual';

    const buyButton = content.querySelector('#ttt-buy-premium');
    const message = content.querySelector('#ttt-purchase-message');

    content.querySelectorAll('input[name="ttt-plan"]').forEach(input => {

      input.onchange = function() {

        selectedPlan = this.value;

        const plan = PremiumLicense.plans[selectedPlan];

        buyButton.textContent = 'Proceed to Payment – ' + plan.price;

        content.querySelectorAll('[data-plan-card]').forEach(card => {

          const selected = card.dataset.planCard === selectedPlan;

          card.style.borderColor = selected ? '#174B32' : '#ddd';
          card.style.background = selected ? '#f0f8f2' : 'white';

        });

        message.textContent = 'Payments coming soon';
      };
    });

    buyButton.onclick = function() {

      // Payments remain disabled until ABA PayWay is connected.

      message.textContent = 'Payments are not yet available. No payment has been taken.';
    };

    overlay.appendChild(content);

    overlay.onclick = function(e) {
      if (e.target === overlay) overlay.remove();
    };

    document.body.appendChild(overlay);
  },

  // TESTER ACCESS CODE

  showAccessCodeBox: function() {

    const existing = document.querySelector('#ttt-premium-overlay');

    if (existing) {
      existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'ttt-premium-overlay';

    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
    `;

    const content = document.createElement('div');

    content.style.cssText = `
      background:white;
      border-radius:20px;
      padding:28px;
      max-width:400px;
      width:100%;
      text-align:center;
      box-sizing:border-box;
    `;

    content.innerHTML = `
      <div style="font-size:48px;margin-bottom:10px;">🔑</div>

      <div style="font-family:Fredoka One,cursive;font-size:24px;color:#1565C0;margin-bottom:10px;">
        Enter Your Access Code
      </div>

      <div style="font-size:14px;color:#666;margin-bottom:18px;">
        Enter your tester access code. For a paid Premium purchase, use your recovery code.
      </div>

      <input
        id="ttt-premium-code"
        type="text"
        placeholder="Enter access code"
        autocomplete="off"
        style="width:100%;box-sizing:border-box;padding:14px;border:2px solid #ddd;border-radius:12px;font-size:16px;text-align:center;margin-bottom:12px;"
      >

      <div id="ttt-premium-message" style="min-height:22px;font-size:13px;margin-bottom:12px;"></div>

      <button
        id="ttt-premium-verify"
        onclick="PremiumUI.verifyAccessCode()"
        style="width:100%;background:linear-gradient(135deg,#FFD700,#FFA500);color:white;border:none;border-radius:30px;padding:14px;font-family:Fredoka One,cursive;font-size:17px;font-weight:700;cursor:pointer;margin-bottom:10px;"
      >
        🔓 Unlock Premium
      </button>

      <button
        onclick="this.parentElement.parentElement.remove()"
        style="width:100%;background:#eee;color:#333;border:none;border-radius:30px;padding:12px;font-size:14px;cursor:pointer;"
      >
        Cancel
      </button>
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    setTimeout(function() {

      const input = document.getElementById('ttt-premium-code');

      if (input) input.focus();

    }, 100);
  },

  // VERIFY TESTER ACCESS CODE

  verifyAccessCode: async function() {

    const input = document.getElementById('ttt-premium-code');
    const message = document.getElementById('ttt-premium-message');
    const button = document.getElementById('ttt-premium-verify');

    if (!input || !message || !button) {
      return;
    }

    const code = input.value.trim();

    if (!code) {

      message.textContent = 'Please enter your access code.';
      message.style.color = '#d32f2f';

      return;
    }

    button.disabled = true;
    button.textContent = 'Checking...';
    message.textContent = '';

    const result = await PremiumLicense.verifyCode(code);

    if (result.success) {

      message.textContent = '✅ Premium unlocked successfully!';
      message.style.color = '#2e7d32';

      setTimeout(function() {
        location.reload();
      }, 1200);

    } else {

      message.textContent = '❌ ' + result.message;
      message.style.color = '#d32f2f';

      button.disabled = false;
      button.textContent = '🔓 Unlock Premium';
    }
  },

  // CHECK PREMIUM ACCESS

  checkPhraseAccess: function(phraseId) {

    const payment = PremiumLicense.needsPayment(phraseId);

    if (payment) {

      this.showPaymentPrompt();

      return false;
    }

    return true;
  },

  // RENDER PREMIUM SECTION

  renderPremiumSection: function() {

    if (!PremiumLicense.isEnabled()) {
      return '';
    }

    if (PremiumLicense.isUnlocked()) {

      return `
        <div style="margin:14px 12px 0;background:white;border-radius:16px;padding:20px;box-shadow:0 4px 24px rgba(0,0,0,0.35);text-align:center;">

          <div style="font-size:42px;">⭐</div>

          <div style="font-family:Fredoka One,cursive;font-size:24px;color:#2e7d32;margin:8px 0;">
            Premium Unlocked
          </div>

          <div style="font-size:13px;color:#555;">
            You have access to all Premium phrases.
          </div>

        </div>
      `;
    }

    return `
      <div style="margin:14px 12px 0;background:white;border-radius:16px;padding:20px;box-shadow:0 4px 24px rgba(0,0,0,0.35);text-align:center;">

        <div style="font-size:48px;margin-bottom:10px;">⭐</div>

        <div style="font-family:Fredoka One,cursive;font-size:27px;color:#1565C0;margin-bottom:8px;">
          Talk Tuk Tuk Premium
        </div>

        <div style="font-size:14px;color:#555;line-height:1.6;margin-bottom:15px;">
          Unlock 200 additional video phrases.
        </div>

        <div style="font-size:18px;font-weight:700;color:#1565C0;margin-bottom:15px;">
          Individual $4.99 · Duo $7.99
        </div>

        <button
          onclick="PremiumUI.showPaymentPrompt()"
          style="width:100%;background:linear-gradient(135deg,#FFD700,#FFA500);color:white;border:none;border-radius:30px;padding:14px;font-family:Fredoka One,cursive;font-size:17px;font-weight:700;cursor:pointer;"
        >
          ⭐ Choose Your Premium Package
        </button>

        <div style="margin-top:12px;font-size:11px;color:#777;">
          Lifetime access • No subscription • No ads
        </div>

      </div>
    `;
  },

  // PREMIUM UPDATED

  onPremiumUpdated: function(event) {

    location.reload();
  }
};

// LISTEN FOR PREMIUM UNLOCK

if (typeof window !== 'undefined') {

  window.addEventListener(
    'premiumUpdated',
    function(e) {
      PremiumUI.onPremiumUpdated(e);
    }
  );

}

// EXPORT IF USING MODULES

if (typeof module !== 'undefined' && module.exports) {

  module.exports = PremiumUI;

}
