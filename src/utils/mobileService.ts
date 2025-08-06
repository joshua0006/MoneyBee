import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';

class MobileService {
  private static instance: MobileService;
  private isCapacitorAvailable = false;

  constructor() {
    this.initializeCapacitor();
  }

  static getInstance(): MobileService {
    if (!MobileService.instance) {
      MobileService.instance = new MobileService();
    }
    return MobileService.instance;
  }

  private async initializeCapacitor() {
    try {
      // Check if we're running in a Capacitor environment
      this.isCapacitorAvailable = (window as any).Capacitor?.isNativePlatform() || false;
      
      if (this.isCapacitorAvailable) {
        await this.setupNativeFeatures();
      }
    } catch (error) {
      console.log('Capacitor not available, running in web mode');
      this.isCapacitorAvailable = false;
    }
  }

  private async setupNativeFeatures() {
    try {
      // Configure status bar
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#f8f9fa' });
      
      // Hide splash screen
      await SplashScreen.hide();
      
      // Setup keyboard listeners
      Keyboard.addListener('keyboardWillShow', () => {
        document.body.classList.add('keyboard-is-open');
      });
      
      Keyboard.addListener('keyboardWillHide', () => {
        document.body.classList.remove('keyboard-is-open');
      });
      
    } catch (error) {
      console.error('Error setting up native features:', error);
    }
  }

  // Haptic Feedback
  async lightHaptic() {
    if (!this.isCapacitorAvailable) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptic feedback not available');
    }
  }

  async mediumHaptic() {
    if (!this.isCapacitorAvailable) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.log('Haptic feedback not available');
    }
  }

  async heavyHaptic() {
    if (!this.isCapacitorAvailable) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.log('Haptic feedback not available');
    }
  }

  async successHaptic() {
    if (!this.isCapacitorAvailable) return;
    
    try {
      await Haptics.notification({ type: 'SUCCESS' as any });
    } catch (error) {
      console.log('Haptic feedback not available');
    }
  }

  async errorHaptic() {
    if (!this.isCapacitorAvailable) return;
    
    try {
      await Haptics.notification({ type: 'ERROR' as any });
    } catch (error) {
      console.log('Haptic feedback not available');
    }
  }

  // Keyboard Management
  async hideKeyboard() {
    if (!this.isCapacitorAvailable) return;
    
    try {
      await Keyboard.hide();
    } catch (error) {
      console.log('Keyboard control not available');
    }
  }

  // Status Bar Management
  async setStatusBarColor(color: string, isDark = false) {
    if (!this.isCapacitorAvailable) return;
    
    try {
      await StatusBar.setBackgroundColor({ color });
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    } catch (error) {
      console.log('Status bar control not available');
    }
  }

  // Utility Methods
  get isMobile(): boolean {
    return this.isCapacitorAvailable || this.isMobileWeb();
  }

  private isMobileWeb(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  get platform(): 'ios' | 'android' | 'web' {
    if (!this.isCapacitorAvailable) return 'web';
    
    const capacitor = (window as any).Capacitor;
    return capacitor?.getPlatform() || 'web';
  }

  // Screen Orientation
  async lockPortrait() {
    if ('screen' in window && 'orientation' in window.screen) {
      try {
        await (window.screen.orientation as any).lock('portrait');
      } catch (error) {
        console.log('Screen orientation lock not supported');
      }
    }
  }

  // Vibration (web fallback)
  vibrate(pattern: number | number[] = 100) {
    if (this.isCapacitorAvailable) {
      this.lightHaptic();
    } else if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
}

export const mobileService = MobileService.getInstance();