import { ConfigManager } from './config.js';
import { RateLimiter } from './rate-limiter.js';
import { AntiDetection } from './anti-detection.js';

interface ProfileData {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  website: string;
  followers: number;
  following: number;
  posts: number;
  isPrivate: boolean;
  isVerified: boolean;
  profilePic: string;
  externalUrl: string;
  businessCategory?: string;
  businessEmail?: string;
}

interface PostData {
  id: string;
  shortcode: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: number;
  isVideo: boolean;
  videoViews?: number;
  mediaUrl: string;
  thumbnailUrl: string;
}

interface StoryData {
  id: string;
  timestamp: number;
  isVideo: boolean;
  mediaUrl: string;
  duration?: number;
}

export class InstagramClient {
  private config: ConfigManager;
  private rateLimiter: RateLimiter;
  private antiDetection: AntiDetection;
  private baseUrl = 'https://www.instagram.com';
  
  constructor() {
    this.config = new ConfigManager();
    this.rateLimiter = new RateLimiter({
      maxRequests: 100,
      windowMs: 60000,
      minDelay: 1000,
      maxDelay: 3000
    });
    this.antiDetection = new AntiDetection();
  }
  
  private async request(url: string, requiresAuth = false): Promise<any> {
    await this.rateLimiter.wait();
    
    const headers = this.antiDetection.getHeaders();
    const auth = this.config.getAuth();
    
    if (requiresAuth && !auth?.sessionId) {
      throw new Error('Authentication required. Run: insta-fetch auth --session-id <id>');
    }
    
    if (auth?.sessionId) {
      headers['Cookie'] = `sessionid=${auth.sessionId}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Re-authenticate with: insta-fetch auth');
      }
      if (response.status === 429) {
        throw new Error('Rate limited. Wait a few minutes and try again.');
      }
      throw new Error(`Request failed: ${response.status}`);
    }
    
    return response.json();
  }
  
  async getProfile(username: string): Promise<ProfileData> {
    // Use web profile endpoint
    const url = `${this.baseUrl}/api/v1/users/web_profile_info/?username=${username}`;
    const data = await this.request(url);
    const user = data.data?.user;
    
    if (!user) {
      throw new Error(`User not found: ${username}`);
    }
    
    return {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      bio: user.biography,
      website: user.external_url || '',
      followers: user.edge_followed_by?.count || 0,
      following: user.edge_follow?.count || 0,
      posts: user.edge_owner_to_timeline_media?.count || 0,
      isPrivate: user.is_private,
      isVerified: user.is_verified,
      profilePic: user.profile_pic_url_hd || user.profile_pic_url,
      externalUrl: user.external_url || '',
      businessCategory: user.business_category_name,
      businessEmail: user.business_email
    };
  }
  
  async getPosts(username: string, opts: { limit: number; cursor?: string; includeMedia?: boolean }): Promise<PostData[]> {
    const posts: PostData[] = [];
    let cursor = opts.cursor;
    let hasNext = true;
    
    // First get user ID
    const profile = await this.getProfile(username);
    const userId = profile.id;
    
    while (hasNext && posts.length < opts.limit) {
      const variables = {
        id: userId,
        first: Math.min(12, opts.limit - posts.length),
        after: cursor
      };
      
      const url = `${this.baseUrl}/graphql/query/?query_hash=e769aa130647d2354c40ea6a439bfc08&variables=${encodeURIComponent(JSON.stringify(variables))}`;
      const data = await this.request(url);
      
      const edges = data.data?.user?.edge_owner_to_timeline_media?.edges || [];
      
      for (const edge of edges) {
        const node = edge.node;
        posts.push({
          id: node.id,
          shortcode: node.shortcode,
          caption: node.edge_media_to_caption?.edges[0]?.node?.text || '',
          likes: node.edge_liked_by?.count || 0,
          comments: node.edge_media_to_comment?.count || 0,
          timestamp: node.taken_at_timestamp,
          isVideo: node.is_video,
          videoViews: node.video_view_count,
          mediaUrl: node.display_url,
          thumbnailUrl: node.thumbnail_src
        });
      }
      
      const pageInfo = data.data?.user?.edge_owner_to_timeline_media?.page_info;
      hasNext = pageInfo?.has_next_page || false;
      cursor = pageInfo?.end_cursor;
    }
    
    return posts;
  }
  
  async getStories(username: string): Promise<StoryData[]> {
    const profile = await this.getProfile(username);
    const userId = profile.id;
    
    const variables = { reel_ids: [userId], precomposed_overlay: false };
    const url = `${this.baseUrl}/graphql/query/?query_hash=303a4ae99711322310f25250d988f3b7&variables=${encodeURIComponent(JSON.stringify(variables))}`;
    
    const data = await this.request(url, true);
    const items = data.data?.reels_media?.[0]?.items || [];
    
    return items.map((item: any) => ({
      id: item.id,
      timestamp: item.taken_at_timestamp,
      isVideo: item.is_video,
      mediaUrl: item.is_video ? item.video_resources?.[0]?.src : item.display_url,
      duration: item.video_duration
    }));
  }
  
  async getReels(username: string, limit: number): Promise<any[]> {
    const profile = await this.getProfile(username);
    const userId = profile.id;
    
    const variables = {
      id: userId,
      first: limit
    };
    
    const url = `${this.baseUrl}/graphql/query/?query_hash=bc78b344a68ed16dd5d7f264681c4c76&variables=${encodeURIComponent(JSON.stringify(variables))}`;
    const data = await this.request(url);
    
    const edges = data.data?.user?.edge_felix_video_timeline?.edges || [];
    
    return edges.map((edge: any) => ({
      id: edge.node.id,
      shortcode: edge.node.shortcode,
      caption: edge.node.edge_media_to_caption?.edges[0]?.node?.text || '',
      views: edge.node.video_view_count,
      likes: edge.node.edge_liked_by?.count || 0,
      comments: edge.node.edge_media_to_comment?.count || 0,
      duration: edge.node.video_duration,
      timestamp: edge.node.taken_at_timestamp,
      thumbnailUrl: edge.node.thumbnail_src
    }));
  }
  
  async searchHashtag(tag: string, opts: { limit: number; section: string }): Promise<any[]> {
    const url = `${this.baseUrl}/explore/tags/${tag}/?__a=1&__d=dis`;
    const data = await this.request(url);
    
    let edges: any[] = [];
    if (opts.section === 'top') {
      edges = data.data?.top?.sections?.flatMap((s: any) => s.layout_content?.medias) || [];
    } else {
      edges = data.data?.recent?.sections?.flatMap((s: any) => s.layout_content?.medias) || [];
    }
    
    return edges.slice(0, opts.limit).map((media: any) => ({
      id: media.media?.id,
      shortcode: media.media?.code,
      likes: media.media?.like_count || 0,
      comments: media.media?.comment_count || 0,
      isVideo: media.media?.media_type === 2,
      owner: media.media?.user?.username
    }));
  }
  
  async getFollowers(username: string, limit: number): Promise<any[]> {
    const profile = await this.getProfile(username);
    const userId = profile.id;
    const followers: any[] = [];
    let cursor: string | undefined;
    
    while (followers.length < limit) {
      const variables = {
        id: userId,
        first: Math.min(50, limit - followers.length),
        after: cursor
      };
      
      const url = `${this.baseUrl}/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=${encodeURIComponent(JSON.stringify(variables))}`;
      const data = await this.request(url, true);
      
      const edges = data.data?.user?.edge_followed_by?.edges || [];
      if (edges.length === 0) break;
      
      for (const edge of edges) {
        followers.push({
          id: edge.node.id,
          username: edge.node.username,
          fullName: edge.node.full_name,
          isPrivate: edge.node.is_private,
          isVerified: edge.node.is_verified,
          profilePic: edge.node.profile_pic_url
        });
      }
      
      const pageInfo = data.data?.user?.edge_followed_by?.page_info;
      if (!pageInfo?.has_next_page) break;
      cursor = pageInfo.end_cursor;
    }
    
    return followers;
  }
}
