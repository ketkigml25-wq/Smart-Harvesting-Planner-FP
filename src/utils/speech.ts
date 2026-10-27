// Web Speech API Voice Synthesizer supporting English (en-IN) and Hindi (hi-IN)
export type SpeechLanguage = 'en' | 'hi';

export interface VoiceAvailability {
  hi: boolean;
  en: boolean;
  hindiVoiceName?: string;
  englishVoiceName?: string;
}

// Complete Devanagari to Phonetic Transliteration for Windows systems lacking Hindi TTS packs
const DEVA_CHAR_MAP: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'am', 'अः': 'ah',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'फ़': 'f', 'ड़': 'd', 'ढ़': 'dh',
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h',
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  '।': '. ', '₹': 'Rupees '
};

const DEVA_CONSONANTS = new Set([
  'क','ख','ग','घ','ङ','च','छ','ज','झ','ञ','ट','ठ','ड','ढ','ण','त','थ','द','ध','न',
  'प','फ','ब','भ','म','य','र','ल','व','श','ष','स','ह','क़','ख़','ग़','ज़','फ़','ड़','ढ़'
]);

const DEVA_MATRAS = new Set(['ा','ि','ी','ु','ू','ृ','े','ै','ो','ौ','ं','ँ','ः']);

export function devanagariToPhonetic(str: string): string {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    const next = str[i + 1];
    if (DEVA_CHAR_MAP[c]) {
      out += DEVA_CHAR_MAP[c];
      if (DEVA_CONSONANTS.has(c)) {
        if (next === '्') {
          // Virama: half letter, skip virama and don't append 'a'
          i++;
        } else if (!DEVA_MATRAS.has(next) && DEVA_CONSONANTS.has(next)) {
          out += 'a';
        } else if (!DEVA_MATRAS.has(next) && next && next !== ' ' && next !== '.' && next !== ',' && next !== '?' && next !== '!' && next !== '(' && next !== ')') {
          out += 'a';
        }
      }
    } else {
      out += c;
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;
  private currentSpokenText: string = '';
  private voices: SpeechSynthesisVoice[] = [];
  private onStateChangeListeners: ((speaking: boolean, text?: string) => void)[] = [];
  private onVoiceMissingListeners: ((lang: string, msg: string) => void)[] = [];
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
    }
  }

  private initVoices(): void {
    if (!this.synth) return;

    const populateVoices = () => {
      this.voices = this.synth?.getVoices() || [];
      if (this.voices.length > 0) {
        this.isInitialized = true;
      }
    };

    populateVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = populateVoices;
    }
  }

  public subscribeState(listener: (speaking: boolean, text?: string) => void): () => void {
    this.onStateChangeListeners.push(listener);
    listener(this.isSpeaking, this.currentSpokenText);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter(l => l !== listener);
    };
  }

  public subscribeVoiceMissing(listener: (lang: string, msg: string) => void): () => void {
    this.onVoiceMissingListeners.push(listener);
    return () => {
      this.onVoiceMissingListeners = this.onVoiceMissingListeners.filter(l => l !== listener);
    };
  }

  private notifyVoiceMissing(lang: string, msg: string) {
    this.onVoiceMissingListeners.forEach(listener => listener(lang, msg));
  }

  private notifyState(speaking: boolean, text: string = '') {
    this.isSpeaking = speaking;
    this.currentSpokenText = speaking ? text : '';
    this.onStateChangeListeners.forEach(listener => listener(speaking, this.currentSpokenText));
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.notifyState(false, '');
    }
  }

  public getVoiceAvailability(): VoiceAvailability {
    const voices = this.synth ? this.synth.getVoices() : [];

    // Detect Hindi voice
    const hiVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith('hi') || 
      v.lang.toLowerCase().replace('_', '-').includes('hi-in') ||
      v.name.toLowerCase().includes('hindi') ||
      v.name.toLowerCase().includes('swara') ||
      v.name.toLowerCase().includes('madhur') ||
      v.name.toLowerCase().includes('kalpana') ||
      v.name.toLowerCase().includes('hemant')
    );

    // Detect English (preferably en-IN, else any English)
    const enVoice = voices.find(v => 
      v.lang.toLowerCase().replace('_', '-').includes('en-in') || 
      v.name.toLowerCase().includes('ravi') ||
      v.name.toLowerCase().includes('heera') ||
      v.name.toLowerCase().includes('india') && v.lang.toLowerCase().startsWith('en')
    ) || voices.find(v => v.lang.toLowerCase().startsWith('en'));

    return {
      hi: Boolean(hiVoice),
      en: Boolean(enVoice),
      hindiVoiceName: hiVoice?.name,
      englishVoiceName: enVoice?.name
    };
  }

  public speak(text: string, lang: SpeechLanguage): void {
    if (!this.synth) {
      console.warn('Speech synthesis not supported on this browser.');
      return;
    }

    // Always stop existing speech before new utterance
    this.synth.cancel();

    if (!text || text.trim() === '') {
      this.notifyState(false, '');
      return;
    }

    const voices = this.synth.getVoices();
    const utterance = new SpeechSynthesisUtterance();

    if (lang === 'hi') {
      const hiVoice = voices.find(v => 
        v.lang.toLowerCase().startsWith('hi') || 
        v.lang.toLowerCase().replace('_', '-').includes('hi-in') ||
        v.name.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('swara') ||
        v.name.toLowerCase().includes('madhur') ||
        v.name.toLowerCase().includes('kalpana') ||
        v.name.toLowerCase().includes('hemant')
      );

      if (hiVoice) {
        // Native Hindi voice is installed on user system
        utterance.voice = hiVoice;
        utterance.lang = hiVoice.lang || 'hi-IN';
        utterance.text = text;
        utterance.rate = 0.95;
      } else {
        // Fallback for Windows without Hindi TTS:
        // Use Indian English voice with transliterated phonetic Hindi so the user hears loud, clear Hindi!
        const inVoice = voices.find(v => 
          v.lang.toLowerCase().includes('en-in') || 
          v.name.toLowerCase().includes('ravi') || 
          v.name.toLowerCase().includes('heera') ||
          v.name.toLowerCase().includes('india')
        ) || voices.find(v => v.lang.toLowerCase().startsWith('en')) || voices[0];

        if (inVoice) {
          utterance.voice = inVoice;
          utterance.lang = inVoice.lang || 'en-IN';
        }
        utterance.text = devanagariToPhonetic(text);
        utterance.rate = 0.90;
      }
    } else {
      utterance.lang = 'en-IN';
      const enVoice = voices.find(v => 
        v.lang.toLowerCase().replace('_', '-').includes('en-in') ||
        v.name.toLowerCase().includes('ravi') ||
        v.name.toLowerCase().includes('heera') ||
        v.name.toLowerCase().includes('india')
      ) || voices.find(v => v.lang.toLowerCase().startsWith('en')) || voices[0];
      if (enVoice) utterance.voice = enVoice;
      utterance.text = text;
      utterance.rate = 1.0;
    }

    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.notifyState(true, text);
    };

    utterance.onend = () => {
      this.notifyState(false, '');
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.notifyState(false, '');
    };

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.error('Failed to initiate speech:', err);
      this.notifyState(false, '');
    }
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  public getCurrentSpokenText(): string {
    return this.currentSpokenText;
  }
}

export const speechService = new SpeechService();
