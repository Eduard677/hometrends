import Table from 'cli-table3';
import chalk from 'chalk';

export class OutputFormatter {
  private format: string;
  
  constructor(format: string) {
    this.format = format;
  }
  
  formatProfile(profile: any, full = false): string {
    if (this.format === 'json') {
      return JSON.stringify(profile, null, 2);
    }
    
    const table = new Table({
      head: [chalk.cyan('Field'), chalk.cyan('Value')]
    });
    
    table.push(
      ['Username', chalk.bold(`@${profile.username}`)],
      ['Name', profile.fullName || '-'],
      ['Bio', (profile.bio || '-').slice(0, 50) + (profile.bio?.length > 50 ? '...' : '')],
      ['Followers', this.formatNumber(profile.followers)],
      ['Following', this.formatNumber(profile.following)],
      ['Posts', this.formatNumber(profile.posts)],
      ['Private', profile.isPrivate ? chalk.yellow('Yes') : 'No'],
      ['Verified', profile.isVerified ? chalk.blue('✓') : 'No']
    );
    
    if (full) {
      table.push(
        ['ID', profile.id],
        ['Website', profile.website || '-'],
        ['Category', profile.businessCategory || '-'],
        ['Email', profile.businessEmail || '-']
      );
    }
    
    return table.toString();
  }
  
  formatData(data: any[]): string {
    switch (this.format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'jsonl':
        return data.map(d => JSON.stringify(d)).join('\n');
      case 'csv':
        return this.toCSV(data);
      case 'table':
        return this.toTable(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  }
  
  private toCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          const val = row[h];
          if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(',')
      )
    ];
    
    return rows.join('\n');
  }
  
  private toTable(data: any[]): string {
    if (data.length === 0) return 'No data';
    
    const headers = Object.keys(data[0]).slice(0, 6); // Limit columns
    const table = new Table({
      head: headers.map(h => chalk.cyan(h))
    });
    
    for (const row of data.slice(0, 20)) { // Limit rows
      table.push(headers.map(h => {
        const val = row[h];
        if (typeof val === 'string') return val.slice(0, 30);
        if (typeof val === 'number') return this.formatNumber(val);
        return String(val);
      }));
    }
    
    if (data.length > 20) {
      table.push([chalk.gray(`... and ${data.length - 20} more`)]);
    }
    
    return table.toString();
  }
  
  private formatNumber(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }
}
