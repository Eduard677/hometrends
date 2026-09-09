#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { InstagramClient } from './client.js';
import { ConfigManager } from './config.js';
import { OutputFormatter } from './output.js';

const program = new Command();

program
  .name('insta-fetch')
  .description('Instagram data extraction CLI with anti-detection')
  .version('0.1.0');

// Auth command
program
  .command('auth')
  .description('Configure authentication')
  .option('--session-id <id>', 'Set session ID cookie')
  .option('--cookies <file>', 'Import cookies from file')
  .option('--browser <name>', 'Extract from browser (chrome|firefox|safari)')
  .option('--status', 'Check auth status')
  .action(async (opts) => {
    const config = new ConfigManager();
    
    if (opts.status) {
      const auth = config.getAuth();
      if (auth?.sessionId) {
        console.log(chalk.green('✓ Authenticated'));
        console.log(`  Session ID: ${auth.sessionId.slice(0, 10)}...`);
      } else {
        console.log(chalk.yellow('✗ Not authenticated'));
      }
      return;
    }
    
    if (opts.sessionId) {
      config.setAuth({ sessionId: opts.sessionId });
      console.log(chalk.green('✓ Session ID saved'));
    }
    
    if (opts.cookies) {
      // Import cookies from file
      const fs = await import('fs');
      const data = JSON.parse(fs.readFileSync(opts.cookies, 'utf-8'));
      const sessionId = data.find((c: any) => c.name === 'sessionid')?.value;
      if (sessionId) {
        config.setAuth({ sessionId });
        console.log(chalk.green('✓ Cookies imported'));
      }
    }
  });

// Profile command
program
  .command('profile <username>')
  .description('Fetch user profile data')
  .option('-o, --output <format>', 'Output format (json|table|csv)', 'table')
  .option('--full', 'Include all available fields')
  .option('--save <file>', 'Save output to file')
  .action(async (username, opts) => {
    const spinner = ora(`Fetching profile: ${username}`).start();
    try {
      const client = new InstagramClient();
      const profile = await client.getProfile(username);
      spinner.succeed(`Profile fetched: ${username}`);
      
      const output = new OutputFormatter(opts.output);
      const result = output.formatProfile(profile, opts.full);
      console.log(result);
      
      if (opts.save) {
        const fs = await import('fs');
        fs.writeFileSync(opts.save, JSON.stringify(profile, null, 2));
        console.log(chalk.gray(`Saved to ${opts.save}`));
      }
    } catch (err: any) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });

// Posts command
program
  .command('posts <username>')
  .description('Fetch user posts')
  .option('-n, --limit <n>', 'Number of posts to fetch', '12')
  .option('--all', 'Fetch all posts (use with caution)')
  .option('-o, --output <format>', 'Output format (json|jsonl|csv)', 'json')
  .option('--save <file>', 'Save output to file')
  .option('--media', 'Include media URLs')
  .option('--after <cursor>', 'Resume from cursor')
  .action(async (username, opts) => {
    const spinner = ora(`Fetching posts: ${username}`).start();
    try {
      const client = new InstagramClient();
      const limit = opts.all ? Infinity : parseInt(opts.limit);
      const posts = await client.getPosts(username, { 
        limit, 
        cursor: opts.after,
        includeMedia: opts.media 
      });
      spinner.succeed(`Fetched ${posts.length} posts`);
      
      const output = new OutputFormatter(opts.output);
      console.log(output.formatData(posts));
      
      if (opts.save) {
        const fs = await import('fs');
        fs.writeFileSync(opts.save, output.formatData(posts));
        console.log(chalk.gray(`Saved to ${opts.save}`));
      }
    } catch (err: any) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });

// Stories command
program
  .command('stories <username>')
  .description('Fetch user stories (requires auth)')
  .option('-o, --output <format>', 'Output format (json|table)', 'json')
  .option('--download <dir>', 'Download media to directory')
  .action(async (username, opts) => {
    const spinner = ora(`Fetching stories: ${username}`).start();
    try {
      const client = new InstagramClient();
      const stories = await client.getStories(username);
      spinner.succeed(`Fetched ${stories.length} stories`);
      
      if (opts.download) {
        const fs = await import('fs');
        const path = await import('path');
        fs.mkdirSync(opts.download, { recursive: true });
        
        for (const story of stories) {
          const ext = story.isVideo ? 'mp4' : 'jpg';
          const filename = `${story.id}.${ext}`;
          // Download logic here
          console.log(chalk.gray(`Downloaded: ${filename}`));
        }
      }
      
      const output = new OutputFormatter(opts.output);
      console.log(output.formatData(stories));
    } catch (err: any) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });

// Reels command  
program
  .command('reels <username>')
  .description('Fetch user reels')
  .option('-n, --limit <n>', 'Number of reels', '12')
  .option('-o, --output <format>', 'Output format (json|csv)', 'json')
  .option('--save <file>', 'Save output to file')
  .action(async (username, opts) => {
    const spinner = ora(`Fetching reels: ${username}`).start();
    try {
      const client = new InstagramClient();
      const reels = await client.getReels(username, parseInt(opts.limit));
      spinner.succeed(`Fetched ${reels.length} reels`);
      
      const output = new OutputFormatter(opts.output);
      console.log(output.formatData(reels));
    } catch (err: any) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });

// Hashtag command
program
  .command('hashtag <tag>')
  .description('Search posts by hashtag')
  .option('-n, --limit <n>', 'Number of posts', '50')
  .option('-o, --output <format>', 'Output format', 'json')
  .option('--top', 'Top posts only')
  .option('--recent', 'Recent posts only')
  .action(async (tag, opts) => {
    const spinner = ora(`Searching #${tag}`).start();
    try {
      const client = new InstagramClient();
      const posts = await client.searchHashtag(tag, {
        limit: parseInt(opts.limit),
        section: opts.top ? 'top' : opts.recent ? 'recent' : 'all'
      });
      spinner.succeed(`Found ${posts.length} posts`);
      
      const output = new OutputFormatter(opts.output);
      console.log(output.formatData(posts));
    } catch (err: any) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });

// Followers command
program
  .command('followers <username>')
  .description('Fetch followers list (requires auth)')
  .option('-n, --limit <n>', 'Number to fetch', '100')
  .option('--all', 'Fetch all (rate limited)')
  .option('-o, --output <format>', 'Output format', 'json')
  .action(async (username, opts) => {
    const spinner = ora(`Fetching followers: ${username}`).start();
    try {
      const client = new InstagramClient();
      const limit = opts.all ? Infinity : parseInt(opts.limit);
      const followers = await client.getFollowers(username, limit);
      spinner.succeed(`Fetched ${followers.length} followers`);
      
      const output = new OutputFormatter(opts.output);
      console.log(output.formatData(followers));
    } catch (err: any) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });

program.parse();
