/**
 * PREMIUM PHRASES DATA
 * These phrases are locked until user purchases the appropriate pack
 */

const PREMIUM_PHRASES = {
  survival: [
    { id: 'surv-001', khmer: 'ជាបាទ/ចាស', english: 'Help me', phonetic: 'chho-ay me', video: 'PHR-SRV-001.mp4', category: 'Emergencies' },
    { id: 'surv-002', khmer: 'ប្រឹងប្រែង', english: 'Emergency', phonetic: 'preng-preng', video: 'PHR-SRV-002.mp4', category: 'Emergencies' },
    { id: 'surv-003', khmer: 'គេងដូច', english: 'Hospital', phonetic: 'geng doc', video: 'PHR-SRV-003.mp4', category: 'Medical' },
    { id: 'surv-004', khmer: 'ឈឺ', english: 'Sick', phonetic: 'chheu', video: 'PHR-SRV-004.mp4', category: 'Medical' },
    { id: 'surv-005', khmer: 'ឈឺក្បាល', english: 'Headache', phonetic: 'chheu kbal', video: 'PHR-SRV-005.mp4', category: 'Medical' },
    { id: 'surv-006', khmer: 'ឯណាដែលលោកស្រី?', english: 'Where is the bathroom?', phonetic: 'ae na del louk srey', video: 'PHR-SRV-006.mp4', category: 'Transport' },
    { id: 'surv-007', khmer: 'តើលោកគាត់ថ្លៃប៉ុន្មាន?', english: 'How much is this?', phonetic: 'tae louk gat tlay pon-man', video: 'PHR-SRV-007.mp4', category: 'Money' },
    { id: 'surv-008', khmer: 'ថ្លៃលើស', english: 'Too expensive', phonetic: 'tlay leus', video: 'PHR-SRV-008.mp4', category: 'Money' },
    { id: 'surv-009', khmer: 'សូមលុយ', english: 'Money please', phonetic: 'som looy', video: 'PHR-SRV-009.mp4', category: 'Money' },
    { id: 'surv-010', khmer: 'ម៉ាងដែលខ្ញុំ?', english: 'What time?', phonetic: 'moang del kh-nyom', video: 'PHR-SRV-010.mp4', category: 'Time' }
  ],
  bar_nightlife: [
    { id: 'bar-001', khmer: 'ស្រាបៀរមួយ', english: 'One beer', phonetic: 'sraa beer muoy', video: 'PHR-BAR-001.mp4', category: 'Drinks' },
    { id: 'bar-002', khmer: 'ស្រាពេជ្រ', english: 'Whiskey', phonetic: 'sraa petch', video: 'PHR-BAR-002.mp4', category: 'Drinks' },
    { id: 'bar-003', khmer: 'ស្រាលំដាប់', english: 'Shot', phonetic: 'sraa lom dap', video: 'PHR-BAR-003.mp4', category: 'Drinks' },
    { id: 'bar-004', khmer: 'អូ យូស្អាត!', english: 'You are beautiful!', phonetic: 'oh you swat', video: 'PHR-BAR-004.mp4', category: 'Flirting' },
    { id: 'bar-005', khmer: 'ឈប់នៅកណ្តាល', english: 'Can I buy you a drink?', phonetic: 'chhob nuh kandal', video: 'PHR-BAR-005.mp4', category: 'Flirting' },
    { id: 'bar-006', khmer: 'ចូលក្រុមបាន', english: 'Join us?', phonetic: 'chul krom ban', video: 'PHR-BAR-006.mp4', category: 'Social' },
    { id: 'bar-007', khmer: 'ឧស្សាហ៍ច្រើន', english: 'Cheers!', phonetic: 'oh-ssa-ho ch-rem', video: 'PHR-BAR-007.mp4', category: 'Social' },
    { id: 'bar-008', khmer: 'នាយិកាល្មើង', english: 'Dance with me', phonetic: 'nay-ika lemung', video: 'PHR-BAR-008.mp4', category: 'Fun' },
    { id: 'bar-009', khmer: 'តម្រងក់', english: 'Let\'s party!', phonetic: 'tom-rangk', video: 'PHR-BAR-009.mp4', category: 'Fun' },
    { id: 'bar-010', khmer: 'រាត្រីលេង', english: 'Night out', phonetic: 'ratree leng', video: 'PHR-BAR-010.mp4', category: 'Night' }
  ],
  bargaining: [
    { id: 'barg-001', khmer: 'ថ្លៃលើស', english: 'Too expensive', phonetic: 'tlay leus', video: 'PHR-BARG-001.mp4', category: 'Negotiation' },
    { id: 'barg-002', khmer: 'ថ្លៃខ្ពង់ក្បាល', english: 'Better price?', phonetic: 'tlay khpong kbal', video: 'PHR-BARG-002.mp4', category: 'Negotiation' },
    { id: 'barg-003', khmer: 'បានក្រឹត្យ', english: 'Last offer', phonetic: 'ban kroyt', video: 'PHR-BARG-003.mp4', category: 'Negotiation' },
    { id: 'barg-004', khmer: 'ត្រឹមត្រូវ', english: 'Fair price', phonetic: 'trim-truv', video: 'PHR-BARG-004.mp4', category: 'Money' },
    { id: 'barg-005', khmer: 'ក្រុម', english: 'Discount', phonetic: 'krom', video: 'PHR-BARG-005.mp4', category: 'Money' },
    { id: 'barg-006', khmer: 'ដោះលែង', english: 'Can you lower it?', phonetic: 'doh-lng', video: 'PHR-BARG-006.mp4', category: 'Negotiation' },
    { id: 'barg-007', khmer: 'ក្រើម', english: 'Half price', phonetic: 'kraem', video: 'PHR-BARG-007.mp4', category: 'Money' },
    { id: 'barg-008', khmer: 'មិនល្អទេ', english: 'Not good', phonetic: 'min luah tay', video: 'PHR-BARG-008.mp4', category: 'Negotiation' },
    { id: 'barg-009', khmer: 'សូមជម្រើស', english: 'Take it or leave it', phonetic: 'som chomruos', video: 'PHR-BARG-009.mp4', category: 'Negotiation' },
    { id: 'barg-010', khmer: 'កម្មង់ល្អ', english: 'Good deal', phonetic: 'kamong luah', video: 'PHR-BARG-010.mp4', category: 'Money' }
  ]
};

/**
 * Get premium phrases for a specific pack
 */
function getPremiumPhrases(packId) {
  return PREMIUM_PHRASES[packId] || [];
}

/**
 * Check if a phrase is premium
 */
function isPhrasePrivate(phraseId) {
  if (!isPremiumEnabled()) return false;
  
  for (const packId in PREMIUM_PHRASES) {
    if (PREMIUM_PHRASES[packId].some(p => p.id === phraseId)) {
      return !hasAccessToPack(packId);
    }
  }
  return false;
}

/**
 * Get which pack owns a phrase
 */
function getPhrasePackId(phraseId) {
  for (const packId in PREMIUM_PHRASES) {
    if (PREMIUM_PHRASES[packId].some(p => p.id === phraseId)) {
      return packId;
    }
  }
  return null;
}
