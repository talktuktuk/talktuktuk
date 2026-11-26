/**
 * TALK TUK TUK PREMIUM UI
 * Single $4.99 Premium unlock
 * Access is verified through Supabase
 */

const PremiumUI = {

  /**
   * Show Premium unlock screen
   */
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
      <h2 style="font-family:Fredoka One,cursive;color:#1565C0;margin:8px 0;">Go Premium</h2>
      <div style="font-size:16px;font-weight:bold;">200 additional video phrases</div>
      <div style="background:#FFF8DC;border-radius:12px;padding:12px;margin:12px 0;text-align:left;line-height:1.8;font-size:14px;">
        ✓ Listen, learn and speak<br>
        ✓ Fun interactive quizzes<br>
        ✓ Download and learn offline<br>
        ✓ Free future phrase updates<br>
        ✓ Lifetime access<br>
        ✓ No subscriptions or advertisements
      </div>
      <div style="font-size:32px;font-weight:bold;color:#1565C0;">$4.99</div>
      <div style="font-size:13px;margin-bottom:15px;">One-time payment · USD</div>
      <div style="border:1px solid #ddd;border-radius:12px;padding:12px;text-align:left;font-size:13px;">
        <strong>Stay connected with Talk Tuk Tuk</strong>
        <p style="margin:6px 0 10px;">Be the first to hear about new phrases, app updates and exciting new features.</p>
        <input id="ttt-purchase-email" type="email" autocomplete="email" aria-label="Email address (optional)" placeholder="Enter your email address (optional)" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid #ccc;border-radius:8px;font-size:16px;">
        <label style="display:flex;align-items:flex-start;gap:8px;margin-top:10px;"><input id="ttt-marketing-consent" type="checkbox" style="width:18px;height:18px;flex-shrink:0;">I'd like to receive email updates.</label>
        <div style="font-size:12px;color:#666;margin-top:6px;">No spam. Unsubscribe at any time.</div>
      </div>
      <button type="button" id="ttt-buy-premium" style="width:100%;background:#FFD600;color:#1a1a2e;border:0;border-radius:30px;padding:14px;font-family:Fredoka One,cursive;font-size:18px;cursor:pointer;margin-top:14px;">Unlock Premium – $4.99</button>
      <div id="ttt-purchase-message" role="status" style="font-size:13px;color:#555;margin-top:8px;">Payments coming soon</div>
      <button type="button" onclick="PremiumUI.showAccessCodeBox()" style="background:none;border:0;color:#1565C0;padding:10px;cursor:pointer;font-size:13px;">I have an access code</button>
      <button type="button" onclick="this.parentElement.parentElement.remove()" style="width:100%;background:#eee;color:#333;border:0;border-radius:30px;padding:12px;cursor:pointer;">Later</button>
    `;
    content.querySelector('#ttt-buy-premium').onclick = function() {
      content.querySelector('#ttt-purchase-message').textContent = 'Payments are not yet available. No payment has been taken.';
    };
    overlay.appendChild(content);
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  },


  /**
   * Show access code entry
   */
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

      <div style="
        font-family:Fredoka One,cursive;
        font-size:24px;
        color:#1565C0;
        margin-bottom:10px;
      ">
        Enter Your Access Code
      </div>

      <div style="
        font-size:14px;
        color:#666;
        margin-bottom:18px;
      ">
        Enter the Premium access code you received after payment.
      </div>

      <input
        id="ttt-premium-code"
        type="text"
        placeholder="Enter access code"
        autocomplete="off"
        style="
          width:100%;
          box-sizing:border-box;
          padding:14px;
          border:2px solid #ddd;
          border-radius:12px;
          font-size:16px;
          text-align:center;
          margin-bottom:12px;
        "
      >

      <div
        id="ttt-premium-message"
        style="
          min-height:22px;
          font-size:13px;
          margin-bottom:12px;
        "
      ></div>

      <button
        id="ttt-premium-verify"
        onclick="PremiumUI.verifyAccessCode()"
        style="
          width:100%;
          background:linear-gradient(135deg,#FFD700,#FFA500);
          color:white;
          border:none;
          border-radius:30px;
          padding:14px;
          font-family:Fredoka One,cursive;
          font-size:17px;
          font-weight:700;
          cursor:pointer;
          margin-bottom:10px;
        "
      >
        🔓 Unlock Premium
      </button>

      <button
        onclick="this.parentElement.parentElement.remove()"
        style="
          width:100%;
          background:#eee;
          color:#333;
          border:none;
          border-radius:30px;
          padding:12px;
          font-size:14px;
          cursor:pointer;
        "
      >
        Cancel
      </button>
    `;

    overlay.appendChild(content);

    document.body.appendChild(overlay);

    setTimeout(function() {
      document.getElementById('ttt-premium-code').focus();
    }, 100);
  },


  /**
   * Verify the customer's access code
   */
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


  /**
   * Check whether Premium is required
   */
  checkPhraseAccess: function(phraseId) {

    const payment = PremiumLicense.needsPayment(phraseId);

    if (payment) {

      this.showPaymentPrompt();

      return false;
    }

    return true;
  },


  /**
   * Render Premium section
   */
  renderPremiumSection: function() {

    if (!PremiumLicense.isEnabled()) {
      return '';
    }

    if (PremiumLicense.isUnlocked()) {

      return `
        <div style="
          margin:14px 12px 0;
          background:white;
          border-radius:16px;
          padding:20px;
          box-shadow:0 4px 24px rgba(0,0,0,0.35);
          text-align:center;
        ">
          <div style="font-size:42px;">⭐</div>

          <div style="
            font-family:Fredoka One,cursive;
            font-size:24px;
            color:#2e7d32;
            margin:8px 0;
          ">
            Premium Unlocked
          </div>

          <div style="
            font-size:13px;
            color:#555;
          ">
            You have access to all Premium phrases.
          </div>
        </div>
      `;

    }

    return `
      <div style="
        margin:14px 12px 0;
        background:white;
        border-radius:16px;
        padding:20px;
        box-shadow:0 4px 24px rgba(0,0,0,0.35);
        text-align:center;
      ">

        <div style="font-size:48px;margin-bottom:10px;">
          ⭐
        </div>

        <div style="
          font-family:Fredoka One,cursive;
          font-size:27px;
          color:#1565C0;
          margin-bottom:8px;
        ">
          Talk Tuk Tuk Premium
        </div>

        <div style="
          font-size:14px;
          color:#555;
          line-height:1.6;
          margin-bottom:15px;
        ">
          Unlock 200 additional video phrases.
        </div>

        <div style="
          font-size:18px;
          font-weight:700;
          color:#1565C0;
          margin-bottom:15px;
        ">
          One-time payment: $4.99
        </div>

        <button
          onclick="PremiumUI.showPaymentPrompt()"
          style="
            width:100%;
            background:linear-gradient(135deg,#FFD700,#FFA500);
            color:white;
            border:none;
            border-radius:30px;
            padding:14px;
            font-family:Fredoka One,cursive;
            font-size:17px;
            font-weight:700;
            cursor:pointer;
          "
        >
          ⭐ Unlock Premium
        </button>

        <div style="
          margin-top:12px;
          font-size:11px;
          color:#777;
        ">
          Lifetime access • No subscription • No ads
        </div>

      </div>
    `;
  },


  /**
   * Premium updated
   */
  onPremiumUpdated: function(event) {

    console.log('🎉 Premium updated!', event.detail);

    location.reload();
  }
};


// Listen for Premium unlock
if (typeof window !== 'undefined') {

  window.addEventListener(
    'premiumUpdated',
    function(e) {
      PremiumUI.onPremiumUpdated(e);
    }
  );

}


// Export if using modules
if (typeof module !== 'undefined' && module.exports) {

  module.exports = PremiumUI;

}
