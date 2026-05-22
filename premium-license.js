/**
 * PREMIUM LICENSE CONTROL SYSTEM
 * Master switch for enabling/disabling premium features
 * Everything flows from this single configuration
 */

// ⭐ MASTER CONTROL - Change this to TRUE when ready to launch premium
const PREMIUM_ENABLED = false;

const PremiumLicense = {
  
  /**
   * Check if premium features are enabled
   */
  isEnabled: function() {
    return PREMIUM_ENABLED;
  },

  /**
   * Premium pack definitions
   */
  packs: {
    survival: {
      id: 'survival',
      name: '🛡️ Survival Khmer Pack',
      emoji: '🛡️',
      price: '$4.99',
      description: 'Essential phrases for emergencies, medical, transport & money',
      features: [
        'Help me / Emergency phrases',
        'Hospital & medical terms',
        'Transport directions',
        'Money & pricing phrases',
        'Time-related vocabulary'
      ],
      phraseCount: 10
    },
    bar_nightlife: {
      id: 'bar_nightlife',
      name: '🍺 Bar & Nightlife Pack',
      emoji: '🍺',
      price: '$4.99',
      description: 'Fun social phrases, drinks, flirting & party vocabulary',
      features: [
        'Drink orders & cheers',
        'Flirting phrases',
        'Party & socializing',
        'Nightlife vocabulary',
        'Social engagement phrases'
      ],
      phraseCount: 10
    },
    bargaining: {
      id: 'bargaining',
      name: '💰 Bargaining Pack',
      emoji: '💰',
      price: '$4.99',
      description: 'Master negotiation & pricing phrases for markets & shopping',
      features: [
        'Price negotiation',
        'Discount requests',
        'Fair pricing phrases',
        'Market haggling',
        'Deal-making language'
      ],
      phraseCount: 10
    }
  },

  /**
   * Get pack info
   */
  getPack: function(packId) {
    return this.packs[packId] || null;
  },

  /**
   * Check if user has access to a pack
   */
  hasAccessToPack: function(packId) {
    if (!this.isEnabled()) return true; // Free access when premium disabled
    
    const licenses = this.getLicenses();
    return licenses.includes(packId);
  },

  /**
   * Get all user's purchased packs
   */
  getLicenses: function() {
    if (!this.isEnabled()) return [];
    
    const stored = localStorage.getItem('ttt_premium_licenses');
    return stored ? JSON.parse(stored) : [];
  },

  /**
   * Add license to user
   */
  addLicense: function(packId) {
    if (!this.isEnabled()) return;
    
    const licenses = this.getLicenses();
    if (!licenses.includes(packId)) {
      licenses.push(packId);
      localStorage.setItem('ttt_premium_licenses', JSON.stringify(licenses));
      
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('premiumUpdated', { 
        detail: { packId, action: 'unlocked' } 
      }));
    }
  },

  /**
   * Check if a phrase needs payment
   */
  needsPayment: function(phraseId) {
    if (!this.isEnabled()) return null;
    
    const packId = this.getPhrasePackId(phraseId);
    if (!packId) return null;
    
    if (!this.hasAccessToPack(packId)) {
      return { packId, pack: this.getPack(packId) };
    }
    return null;
  },

  /**
   * Find which pack owns a phrase
   */
  getPhrasePackId: function(phraseId) {
    if (!PREMIUM_PHRASES) return null;
    
    for (const packId in PREMIUM_PHRASES) {
      if (PREMIUM_PHRASES[packId].some(p => p.id === phraseId)) {
        return packId;
      }
    }
    return null;
  },

  /**
   * Simulate a payment (for testing)
   * Replace with actual payment processor in production
   */
  simulatePayment: function(packId) {
    console.log(`Simulating payment for: ${packId}`);
    
    // In production, this would:
    // 1. Call Stripe/PayPal API
    // 2. Process payment
    // 3. Verify response
    // 4. Send to backend
    // 5. Add license on success
    
    // For testing, just add the license
    this.addLicense(packId);
    
    const pack = this.getPack(packId);
    alert(`✅ Purchase successful!\n\n${pack.name} is now unlocked!\n\nEnjoy all ${pack.phraseCount} phrases in this pack.`);
  },

  /**
   * Restore purchases (for returning users)
   * Checks backend for previously purchased packs
   */
  restorePurchases: function() {
    if (!this.isEnabled()) return;
    
    console.log('🔄 Restoring purchases...');
    
    // In production, this would:
    // 1. Get user ID / email
    // 2. Query backend database
    // 3. Retrieve purchased packs
    // 4. Update localStorage
    // 5. Notify user
    
    alert('Your purchases have been restored.');
  },

  /**
   * Get all available packs (for display)
   */
  getAllPacks: function() {
    return Object.values(this.packs);
  },

  /**
   * Get purchase status for UI
   */
  getPurchaseStatus: function() {
    if (!this.isEnabled()) {
      return { enabled: false };
    }
    
    const licenses = this.getLicenses();
    return {
      enabled: true,
      purchased: licenses,
      total_packs: Object.keys(this.packs).length,
      spent: licenses.length * 4.99 // Rough estimate
    };
  }
};

// Export if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PremiumLicense;
}
