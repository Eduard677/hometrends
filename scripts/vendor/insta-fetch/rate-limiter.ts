interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  minDelay: number;
  maxDelay: number;
}

export class RateLimiter {
  private requests: number[] = [];
  private config: RateLimitConfig;
  
  constructor(config: RateLimitConfig) {
    this.config = config;
  }
  
  async wait(): Promise<void> {
    // Clean old requests
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.config.windowMs);
    
    // Check if at limit
    if (this.requests.length >= this.config.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.config.windowMs - (now - oldestRequest);
      await this.sleep(waitTime);
      return this.wait();
    }
    
    // Add random delay for anti-detection
    const delay = this.config.minDelay + 
      Math.random() * (this.config.maxDelay - this.config.minDelay);
    await this.sleep(delay);
    
    // Record request
    this.requests.push(Date.now());
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  getStatus(): { remaining: number; resetIn: number } {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.config.windowMs);
    
    return {
      remaining: this.config.maxRequests - this.requests.length,
      resetIn: this.requests.length > 0 
        ? this.config.windowMs - (now - this.requests[0])
        : 0
    };
  }
}
