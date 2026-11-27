/**
 * TALK TUK TUK PREMIUM LICENSE SYSTEM
 * Supabase-powered single Premium unlock
 * Two-device licence and device management
 */

const PremiumLicense = {

  price: '$4.99',

  storageKey: 'ttt_premium_unlocked',

  codeStorageKey: 'ttt_premium_code',

  deviceStorageKey: 'ttt_device_id',

  getDeviceId: function() {

    let deviceId = localStorage.getItem(
      this.deviceStorageKey
    );

    if (!deviceId) {

      deviceId = crypto.randomUUID();

      localStorage.setItem(
        this.deviceStorageKey,
        deviceId
      );

    }

    return deviceId;
  },

  getDeviceName: function() {

    const ua = navigator.userAgent;

    if (/iPad/i.test(ua)) return 'iPad';
    if (/iPhone/i.test(ua)) return 'iPhone';
    if (/Android/i.test(ua)) return 'Android device';
    if (/Windows/i.test(ua)) return 'Windows computer';
    if (/Macintosh/i.test(ua)) return 'Mac computer';
    if (/Linux/i.test(ua)) return 'Linux computer';

    return 'Other device';
  },

  isEnabled: function() {
    return true;
  },

  isUnlocked: function() {
    return localStorage.getItem(this.storageKey) === 'true';
  },

  getStoredCode: function() {
    return localStorage.getItem(this.codeStorageKey);
  },

  getRecoveryCode: function() {
    return localStorage.getItem('ttt_recovery_code');
  },

  normalizeRecoveryCode: function(recoveryCode) {

    return String(recoveryCode || '')
      .toUpperCase()
      .replace(/[\s-]/g, '');

  },

  verifyCode: async function(accessCode) {

    if (!accessCode) {
      return {
        success: false,
        message: 'Please enter your access code.'
      };
    }

    const code = accessCode.trim();

    try {

      const { data, error } =
        await supabaseClient.functions.invoke(
          'verify-access-code',
          {
            body: {
              access_code: code
            }
          }
        );

      if (error) {

        console.error('Supabase error:', error);

        return {
          success: false,
          message: 'Unable to check your access code. Please try again.'
        };
      }

      if (!data || !data.success || !data.premium_active) {

        return {
          success: false,
          message: 'Invalid access code.'
        };
      }

      localStorage.setItem(this.storageKey, 'true');
      localStorage.setItem(this.codeStorageKey, code);
      localStorage.removeItem('ttt_recovery_code');

      window.dispatchEvent(
        new CustomEvent('premiumUpdated', {
          detail: {
            action: 'unlocked'
          }
        })
      );

      return {
        success: true,
        message: 'Premium unlocked successfully!'
      };

    } catch (err) {

      console.error('Premium verification error:', err);

      return {
        success: false,
        message: 'Something went wrong. Please try again.'
      };
    }
  },

  restoreWithRecoveryCode: async function(recoveryCode) {

    const code = this.normalizeRecoveryCode(recoveryCode);

    if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{12}$/.test(code)) {

      return {
        success: false,
        message: 'Please enter a valid recovery code.'
      };
    }

    try {

      const { data, error } =
        await supabaseClient.functions.invoke(
          'verify-premium',
          {
            body: {
              recovery_code: code,
              device_id: this.getDeviceId(),
              device_name: this.getDeviceName()
            }
          }
        );

      let response = data;

      if (error && error.context instanceof Response) {

        try {
          response = await error.context.json();
        } catch {
          response = null;
        }
      }

      if (response && response.device_limit_reached) {

        return {
          success: false,
          device_limit_reached: true,
          message: 'Your Premium purchase allows two active devices. Remove an old device to activate this one.'
        };
      }

      if (
        error ||
        !response ||
        !response.success ||
        !response.premium_active
      ) {

        return {
          success: false,
          message: response?.message ||
            'Unable to restore Premium. Check your recovery code and internet connection.'
        };
      }

      localStorage.setItem(this.storageKey, 'true');
      localStorage.setItem('ttt_recovery_code', code);
      localStorage.removeItem(this.codeStorageKey);

      window.dispatchEvent(
        new CustomEvent('premiumUpdated', {
          detail: {
            action: 'unlocked'
          }
        })
      );

      return {
        success: true,
        message: 'Premium restored successfully!'
      };

    } catch (err) {

      return {
        success: false,
        message: 'Unable to connect. Please try again.'
      };
    }
  },

  // ===== DEVICE MANAGEMENT =====

  manageDevices: async function(
    action,
    recoveryCode,
    deviceId = null
  ) {

    const code = this.normalizeRecoveryCode(recoveryCode);

    if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{12}$/.test(code)) {

      return {
        success: false,
        message: 'Please enter a valid recovery code.'
      };
    }

    if (action !== 'list' && action !== 'remove') {

      return {
        success: false,
        message: 'Invalid device management action.'
      };
    }

    try {

      const body = {
        action: action,
        recovery_code: code
      };

      if (action === 'remove') {

        if (
          typeof deviceId !== 'string' ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(deviceId)
        ) {

          return {
            success: false,
            message: 'Invalid device identifier.'
          };
        }

        body.device_id = deviceId.toLowerCase();
      }

      const { data, error } =
        await supabaseClient.functions.invoke(
          'manage-premium-devices',
          {
            body: body
          }
        );

      let response = data;

      if (error && error.context instanceof Response) {

        try {
          response = await error.context.json();
        } catch {
          response = null;
        }
      }

      if (error || !response || !response.success) {

        return {
          success: false,
          message: response?.message ||
            'Unable to manage devices. Please try again.'
        };
      }

      return response;

    } catch (err) {

      return {
        success: false,
        message: 'Unable to connect. Please check your internet connection.'
      };
    }
  },

  listDevices: async function(recoveryCode) {

    return await this.manageDevices(
      'list',
      recoveryCode
    );
  },

  removeDevice: async function(recoveryCode, deviceId) {

    const result = await this.manageDevices(
      'remove',
      recoveryCode,
      deviceId
    );

    if (
      result.success &&
      deviceId.toLowerCase() === this.getDeviceId().toLowerCase() &&
      this.normalizeRecoveryCode(this.getRecoveryCode()) ===
        this.normalizeRecoveryCode(recoveryCode)
    ) {

      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.codeStorageKey);
      localStorage.removeItem('ttt_recovery_code');

    }

    return result;
  },

  // ===== EXISTING PREMIUM FEATURES =====

  hasAccess: function() {
    return this.isUnlocked();
  },

  hasAccessToPack: function(packId) {
    return this.isUnlocked();
  },

  needsPayment: function(phraseId) {

    if (!this.isEnabled()) {
      return null;
    }

    if (this.isUnlocked()) {
      return null;
    }

    return {
      premium: true,
      phraseId: phraseId
    };
  },

  addLicense: function() {

    localStorage.setItem(this.storageKey, 'true');

    window.dispatchEvent(
      new CustomEvent('premiumUpdated', {
        detail: {
          action: 'unlocked'
        }
      })
    );
  },

  restorePurchases: function() {

    if (this.isUnlocked()) {

      return {
        success: true,
        message: 'Premium is already unlocked on this device.'
      };
    }

    return {
      success: false,
      message: 'Please enter your Premium recovery code.'
    };
  },

  getPurchaseStatus: function() {

    return {
      enabled: true,
      unlocked: this.isUnlocked(),
      price: this.price
    };
  },

  clearAccess: function() {

    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.codeStorageKey);
    localStorage.removeItem('ttt_recovery_code');

    window.dispatchEvent(
      new CustomEvent('premiumUpdated', {
        detail: {
          action: 'locked'
        }
      })
    );
  }

};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PremiumLicense;
}
