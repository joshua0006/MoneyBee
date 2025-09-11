import { getUpcomingRecurring, type RecurringTransaction } from './recurringUtils';
import { registerForPush } from './pushNotifications';
import { supabase } from '@/integrations/supabase/client';

export interface BillReminderSettings {
  enabled: boolean;
  daysBeforeDue: number; // How many days before due date to remind
  timeOfDay: string; // Time to send reminder (24h format like "09:00")
  reminderTypes: {
    dueToday: boolean;
    dueTomorrow: boolean;
    dueIn3Days: boolean;
    dueInWeek: boolean;
  };
}

const DEFAULT_BILL_REMINDER_SETTINGS: BillReminderSettings = {
  enabled: true,
  daysBeforeDue: 1,
  timeOfDay: "09:00",
  reminderTypes: {
    dueToday: true,
    dueTomorrow: true,
    dueIn3Days: true,
    dueInWeek: false
  }
};

// Storage key for bill reminder settings
const BILL_REMINDER_SETTINGS_KEY = 'bill_reminder_settings';

export const getBillReminderSettings = (): BillReminderSettings => {
  try {
    const stored = localStorage.getItem(BILL_REMINDER_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_BILL_REMINDER_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Error loading bill reminder settings:', error);
  }
  return DEFAULT_BILL_REMINDER_SETTINGS;
};

export const saveBillReminderSettings = (settings: BillReminderSettings): void => {
  try {
    localStorage.setItem(BILL_REMINDER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving bill reminder settings:', error);
  }
};

export const checkAndSendBillReminders = async (
  recurringTransactions: RecurringTransaction[]
): Promise<void> => {
  const settings = getBillReminderSettings();
  
  if (!settings.enabled) {
    return;
  }

  // Get upcoming transactions for the next 7 days
  const upcoming = getUpcomingRecurring(recurringTransactions, 7);
  const now = new Date();
  
  for (const { recurring, dueDate } of upcoming) {
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let shouldSendReminder = false;
    let reminderTitle = '';
    let reminderBody = '';
    
    // Determine if we should send a reminder based on settings
    if (daysUntilDue === 0 && settings.reminderTypes.dueToday) {
      shouldSendReminder = true;
      reminderTitle = '💰 Bill Due Today';
      reminderBody = `${recurring.description} ($${recurring.amount}) is due today`;
    } else if (daysUntilDue === 1 && settings.reminderTypes.dueTomorrow) {
      shouldSendReminder = true;
      reminderTitle = '⏰ Bill Due Tomorrow';
      reminderBody = `${recurring.description} ($${recurring.amount}) is due tomorrow`;
    } else if (daysUntilDue === 3 && settings.reminderTypes.dueIn3Days) {
      shouldSendReminder = true;
      reminderTitle = '📅 Bill Due in 3 Days';
      reminderBody = `${recurring.description} ($${recurring.amount}) is due in 3 days`;
    } else if (daysUntilDue === 7 && settings.reminderTypes.dueInWeek) {
      shouldSendReminder = true;
      reminderTitle = '📋 Bill Due Next Week';
      reminderBody = `${recurring.description} ($${recurring.amount}) is due in a week`;
    }
    
    if (shouldSendReminder) {
      await sendBillReminderNotification(reminderTitle, reminderBody, {
        recurringId: recurring.id,
        dueDate: dueDate.toISOString(),
        amount: recurring.amount.toString(),
        category: recurring.category
      });
    }
  }
};

export const sendBillReminderNotification = async (
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  try {
    // Try to get stored push token
    const pushToken = localStorage.getItem('pushToken');
    
    if (!pushToken) {
      // If no token, try to register for push notifications
      const result = await registerForPush();
      if (!result.granted || !result.token) {
        console.warn('Push notifications not available for bill reminders');
        return;
      }
    }
    
    const tokenToUse = pushToken || localStorage.getItem('pushToken');
    
    if (tokenToUse) {
      // Send push notification via Supabase edge function
      await supabase.functions.invoke('push-send', {
        body: {
          token: tokenToUse,
          title,
          body,
          data: data || {}
        }
      });
      
      console.log('Bill reminder notification sent:', title);
    } else {
      // Fallback to browser notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/icon-512.png',
          badge: '/icon-512.png',
          tag: 'bill-reminder',
          data
        });
      }
    }
  } catch (error) {
    console.error('Error sending bill reminder notification:', error);
  }
};

// Extend Window interface for bill reminder interval
declare global {
  interface Window {
    billReminderInterval?: NodeJS.Timeout;
  }
}

export const scheduleBillReminderCheck = (
  recurringTransactions: RecurringTransaction[]
): void => {
  // Clear any existing interval
  const existingInterval = window.billReminderInterval;
  if (existingInterval) {
    clearInterval(existingInterval);
  }
  
  // Check for bill reminders every hour
  const interval = setInterval(() => {
    checkAndSendBillReminders(recurringTransactions);
  }, 60 * 60 * 1000); // 1 hour
  
  // Store interval reference globally so it can be cleared
  window.billReminderInterval = interval;
  
  // Also run an immediate check
  checkAndSendBillReminders(recurringTransactions);
};

// Clean up interval on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const interval = window.billReminderInterval;
    if (interval) {
      clearInterval(interval);
    }
  });
}