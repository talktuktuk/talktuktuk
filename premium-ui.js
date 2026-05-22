/**
 * PREMIUM UI SYSTEM
 * Manages premium pack display, purchase buttons, and access overlays
 * Controlled by PREMIUM_ENABLED flag in premium-license.js
 */

const PremiumUI = {
  /**
   * Render premium pack card
   */
  renderPackCard: function(packId) {
    if (!PremiumLicense.isEnabled()) return '';
    
    const pack = PremiumLicense.getPack(packId);
    const hasAccess = PremiumLicense.hasAccessToPack(packId);
    
    return `
      <div style="background:white;border-radius:14px;padding:18px;box-shadow:0 3px 16px rgba(0,0,0,0.12);display:flex;align-items:center;gap:14px;margin-bottom:10px;position:relative;">
        <div style="font-size:32px;flex-shrink:0;">${pack.emoji}</div>
        <div style="flex:1;">
          <div style="font-family:Fredoka One,cursive;font-size:17px;color:#1a1a2e;margin-bottom:4px;">${pack.name}</div>
          <div style="font-size:12px;color:#777;margin-bottom:8px;">${pack.description}</div>
          ${hasAccess ? 
            `<div style="font-size:12px;color:#4CAF50;font-weight:700;">✅ You have access</div>` :
            `<div style="font-size:12px;color:#FF9800;font-weight:700;">🔒 ${pack.price}</div>`
          }
        </div>
        ${!hasAccess ? 
          `<button onclick="PremiumUI.showPaymentPrompt('${packId}')" style="background:linear-gradient(135deg,#FFD700,#FFA500);color:white;border:none;border-radius:20px;padding:8px 16px;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0;">Get Pack</button>` :
          `<div style="background:#4CAF50;color:white;border-radius:20px;padding:8px 16px;font-size:11px;font-weight:700;">Unlocked</div>`
        }
      </div>
    `;
  },

  /**
   * Show lock overlay for premium phrase
   */
  showPremiumOverlay: function(phraseData, packInfo) {
    const overlay = document.createElement('div');
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
      z-index: 999;
      padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 30px;
      max-width: 400px;
      text-align: center;
    `;
    
    const pack = PremiumLicense.getPack(packInfo.packId);
    
    content.innerHTML = `
      <div style="font-size:56px;margin-bottom:16px;">${pack.emoji}</div>
      <div style="font-family:Fredoka One,cursive;font-size:24px;color:#1a1a2e;margin-bottom:12px;">
        ${pack.name}
      </div>
      <div style="font-size:14px;color:#555;margin-bottom:20px;line-height:1.6;">
        This phrase is part of our <strong>${pack.name}</strong>. Unlock it to access all ${pack.name} content.
      </div>
      <div style="background:#FFF8DC;padding:16px;border-radius:12px;margin-bottom:20px;text-align:left;">
        <div style="font-weight:bold;font-size:13px;margin-bottom:10px;">📦 Package includes:</div>
        <ul style="margin:0;padding-left:20px;font-size:12px;color:#555;line-height:1.8;">
          ${pack.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      <div style="display:flex;gap:10px;">
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="flex:1;background:#eee;color:#1a1a2e;border:none;border-radius:30px;padding:14px;font-family:Fredoka One,cursive;font-size:16px;cursor:pointer;">Later</button>
        <button onclick="PremiumUI.showPaymentPrompt('${packInfo.packId}')" style="flex:1;background:linear-gradient(135deg,#FFD700,#FFA500);color:white;border:none;border-radius:30px;padding:14px;font-family:Fredoka One,cursive;font-size:16px;font-weight:700;cursor:pointer;">Unlock ${pack.price}</button>
      </div>
    `;
    
    overlay.appendChild(content);
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };
    document.body.appendChild(overlay);
  },

  /**
   * Show payment/purchase prompt
   */
  showPaymentPrompt: function(packId) {
    alert(`🎉 Ready to unlock ${PremiumLicense.getPack(packId).name}!\n\nIn production, this would show payment options:\n• Stripe payment\n• PayPal\n• Apple Pay / Google Play\n\nFor now, click "OK" to simulate purchase.`);
    
    // Simulate payment
    PremiumLicense.simulatePayment(packId);
  },

  /**
   * Render all premium packs section
   */
  renderPremiumSection: function() {
    if (!PremiumLicense.isEnabled()) return '';
    
    return `
      <div style="margin:14px 12px 0;background:white;border-radius:16px;padding:20px;box-shadow:0 4px 24px rgba(0,0,0,0.35);">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:48px;margin-bottom:10px;">⭐</div>
          <div style="font-family:Fredoka One,cursive;font-size:28px;color:#1565C0;margin-bottom:8px;">Premium Packs</div>
          <div style="font-size:14px;color:#555;line-height:1.6;">Unlock exclusive phrases to speak like a local!</div>
        </div>
        
        <div id="premium-packs-list" style="margin-bottom:20px;">
          ${this.renderPackCard('survival')}
          ${this.renderPackCard('bar_nightlife')}
          ${this.renderPackCard('bargaining')}
        </div>
        
        <div style="background:#E3F2FD;padding:14px;border-radius:12px;font-size:12px;color:#1565C0;text-align:center;font-weight:700;">
          ℹ️ One-time purchase. Lifetime access. No subscriptions.
        </div>
      </div>
    `;
  },

  /**
   * Check phrase access and show lock if needed
   */
  checkPhraseAccess: function(phraseId) {
    const payment = PremiumLicense.needsPayment(phraseId);
    if (payment) {
      const phraseData = { id: phraseId }; // Would have full data in real app
      this.showPremiumOverlay(phraseData, payment);
      return false; // Don't allow access
    }
    return true; // Allow access
  },

  /**
   * Handle phrase unlock event
   */
  onPremiumUpdated: function(event) {
    console.log('🎉 Premium updated!', event.detail);
    // Reload phrase lists or update UI
    location.reload();
  }
};

// Listen for premium updates
if (typeof window !== 'undefined') {
  window.addEventListener('premiumUpdated', (e) => PremiumUI.onPremiumUpdated(e));
}

// Export if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PremiumUI;
}
