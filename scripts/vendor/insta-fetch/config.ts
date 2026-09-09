import Conf from 'conf';

interface AuthConfig {
  sessionId?: string;
  csrfToken?: string;
  userId?: string;
}

interface AppConfig {
  auth?: AuthConfig;
  proxy?: string;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

export class ConfigManager {
  private conf: Conf<AppConfig>;
  
  constructor() {
    this.conf = new Conf({
      projectName: 'insta-fetch',
      encryptionKey: process.env.INSTA_FETCH_KEY || 'default-key-change-me'
    });
  }
  
  getAuth(): AuthConfig | undefined {
    return this.conf.get('auth');
  }
  
  setAuth(auth: AuthConfig): void {
    this.conf.set('auth', auth);
  }
  
  clearAuth(): void {
    this.conf.delete('auth');
  }
  
  getProxy(): string | undefined {
    return this.conf.get('proxy');
  }
  
  setProxy(proxy: string): void {
    this.conf.set('proxy', proxy);
  }
  
  getRateLimit() {
    return this.conf.get('rateLimit') || {
      maxRequests: 100,
      windowMs: 60000
    };
  }
  
  setRateLimit(config: { maxRequests: number; windowMs: number }): void {
    this.conf.set('rateLimit', config);
  }
}
