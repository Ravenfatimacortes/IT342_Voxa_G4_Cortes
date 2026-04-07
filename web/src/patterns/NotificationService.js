/**
 * Observer Pattern Implementation for Notification Service
 * Behavioral Design Pattern
 */

// Observer Interface
class NotificationObserver {
  update(message, type, data) {
    // To be implemented by concrete observers
    throw new Error('update method must be implemented');
  }
}

// Subject (Observable) Class
class NotificationSubject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  unsubscribe(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(message, type = 'info', data = {}) {
    this.observers.forEach(observer => {
      try {
        observer.update(message, type, data);
      } catch (error) {
        console.error('Error notifying observer:', error);
      }
    });
  }
}

// Concrete Observers
class ToastNotificationObserver extends NotificationObserver {
  constructor(toast) {
    super();
    this.toast = toast;
  }

  update(message, type, data) {
    switch (type) {
      case 'success':
        this.toast.success(message);
        break;
      case 'error':
        this.toast.error(message);
        break;
      case 'info':
        this.toast(message);
        break;
      default:
        this.toast(message);
    }
  }
}

class ConsoleNotificationObserver extends NotificationObserver {
  update(message, type, data) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`, data);
  }
}

class EmailNotificationObserver extends NotificationObserver {
  constructor(emailService) {
    super();
    this.emailService = emailService;
  }

  update(message, type, data) {
    // Only send important notifications via email
    if (['success', 'error'].includes(type)) {
      this.emailService.send({
        to: data.recipient,
        subject: `Voxa ${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
        body: message
      });
    }
  }
}

// Notification Service (Singleton Pattern)
class NotificationService extends NotificationSubject {
  constructor() {
    super();
    if (NotificationService.instance) {
      return NotificationService.instance;
    }
    this.initialized = false;
    NotificationService.instance = this;
  }

  static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  initialize(toast, emailService = null) {
    if (this.initialized) return;

    // Add default observers
    this.subscribe(new ToastNotificationObserver(toast));
    this.subscribe(new ConsoleNotificationObserver());

    if (emailService) {
      this.subscribe(new EmailNotificationObserver(emailService));
    }

    this.initialized = true;
  }

  // Convenience methods
  success(message, data = {}) {
    this.notify(message, 'success', data);
  }

  error(message, data = {}) {
    this.notify(message, 'error', data);
  }

  info(message, data = {}) {
    this.notify(message, 'info', data);
  }

  warning(message, data = {}) {
    this.notify(message, 'warning', data);
  }
}

export {
  NotificationObserver,
  NotificationSubject,
  ToastNotificationObserver,
  ConsoleNotificationObserver,
  EmailNotificationObserver,
  NotificationService
};
