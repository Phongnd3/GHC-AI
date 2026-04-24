#!/usr/bin/env node

/**
 * Story Execution Time Tracking Report
 * 
 * Analyzes sprint-status.yaml to generate time tracking reports
 * Usage: node time-tracking-report.js [options]
 * 
 * Options:
 *   --format=text|json|csv  Output format (default: text)
 *   --epic=N                Filter by epic number
 *   --status=STATUS         Filter by story status
 */

const fs = require('fs');
const path = require('path');

// Simple YAML parser for our specific structure
function parseYAML(content) {
  const lines = content.split('\n');
  const result = {
    metadata: {},
    development_status: {},
    time_tracking: {}
  };
  
  let currentSection = null;
  let currentStory = null;
  
  for (const line of lines) {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || line.trim() === '') continue;
    
    // Detect sections
    if (line.match(/^[a-z_]+:/)) {
      const match = line.match(/^([a-z_]+):\s*(.*)$/);
      if (match) {
        const key = match[1];
        const value = match[2].replace(/^["']|["']$/g, '');
        
        if (['generated', 'last_updated', 'project', 'project_key', 'tracking_system', 'story_location'].includes(key)) {
          result.metadata[key] = value;
          currentSection = null;
        } else if (key === 'development_status') {
          currentSection = 'development_status';
        } else if (key === 'time_tracking') {
          currentSection = 'time_tracking';
        }
      }
    } else if (line.match(/^  [a-z0-9-]+:/)) {
      // Story-level entry
      const match = line.match(/^  ([a-z0-9-]+):\s*(.*)$/);
      if (match) {
        const key = match[1];
        const value = match[2].replace(/^["']|["']$/g, '');
        
        if (currentSection === 'development_status') {
          result.development_status[key] = value;
        } else if (currentSection === 'time_tracking') {
          currentStory = key;
          result.time_tracking[key] = {};
        }
      }
    } else if (line.match(/^    [a-z_]+:/)) {
      // Time tracking fields
      const match = line.match(/^    ([a-z_]+):\s*(.*)$/);
      if (match && currentStory && currentSection === 'time_tracking') {
        const key = match[1];
        let value = match[2].replace(/^["']|["']$/g, '');
        
        if (value === 'null') value = null;
        else if (key === 'duration_hours' && value !== null) value = parseFloat(value);
        
        result.time_tracking[currentStory][key] = value;
      }
    }
  }
  
  return result;
}

// Parse command line arguments
function parseArgs() {
  const args = {
    format: 'text',
    epic: null,
    status: null
  };
  
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--format=')) {
      args.format = arg.split('=')[1];
    } else if (arg.startsWith('--epic=')) {
      args.epic = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--status=')) {
      args.status = arg.split('=')[1];
    }
  });
  
  return args;
}

// Extract epic number from story key
function getEpicNumber(storyKey) {
  const match = storyKey.match(/^(\d+)-/);
  return match ? parseInt(match[1]) : null;
}

// Format duration for display
function formatDuration(hours) {
  if (hours === null || hours === undefined) return 'N/A';
  
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Generate text report
function generateTextReport(data, args) {
  const { metadata, development_status, time_tracking } = data;
  
  let output = [];
  output.push('=====================================');
  output.push('Story Execution Time Report');
  output.push('=====================================');
  output.push(`Generated: ${new Date().toISOString()}`);
  output.push(`Project: ${metadata.project || 'Unknown'}`);
  output.push('');
  
  // Filter stories
  const stories = Object.keys(time_tracking).filter(key => {
    // Skip epic and retrospective entries
    if (key.startsWith('epic-') || key.includes('retrospective')) return false;
    
    // Apply filters
    if (args.epic !== null && getEpicNumber(key) !== args.epic) return false;
    if (args.status !== null && development_status[key] !== args.status) return false;
    
    return true;
  });
  
  // Calculate summary statistics
  const completedStories = stories.filter(key => time_tracking[key].duration_hours !== null);
  const totalTime = completedStories.reduce((sum, key) => sum + (time_tracking[key].duration_hours || 0), 0);
  const avgTime = completedStories.length > 0 ? totalTime / completedStories.length : 0;
  
  output.push('SUMMARY');
  output.push('-------');
  output.push(`Total Stories Tracked: ${completedStories.length}`);
  output.push(`Total Development Time: ${formatDuration(totalTime)}`);
  output.push(`Average Time per Story: ${formatDuration(avgTime)}`);
  output.push('');
  
  // Epic breakdown
  const epicStats = {};
  completedStories.forEach(key => {
    const epicNum = getEpicNumber(key);
    if (!epicStats[epicNum]) {
      epicStats[epicNum] = { count: 0, time: 0 };
    }
    epicStats[epicNum].count++;
    epicStats[epicNum].time += time_tracking[key].duration_hours || 0;
  });
  
  output.push('EPIC BREAKDOWN');
  output.push('--------------');
  Object.keys(epicStats).sort((a, b) => a - b).forEach(epicNum => {
    const stats = epicStats[epicNum];
    const avgEpicTime = stats.time / stats.count;
    output.push(`Epic ${epicNum}: ${formatDuration(stats.time)} (${stats.count} stories)`);
    output.push(`  - Avg: ${formatDuration(avgEpicTime)}/story`);
  });
  output.push('');
  
  // Story details
  output.push('STORY DETAILS');
  output.push('-------------');
  
  // Sort by epic and story number
  const sortedStories = stories.sort((a, b) => {
    const aMatch = a.match(/^(\d+)-(\d+)/);
    const bMatch = b.match(/^(\d+)-(\d+)/);
    if (!aMatch || !bMatch) return 0;
    
    const aEpic = parseInt(aMatch[1]);
    const bEpic = parseInt(bMatch[1]);
    if (aEpic !== bEpic) return aEpic - bEpic;
    
    return parseInt(aMatch[2]) - parseInt(bMatch[2]);
  });
  
  sortedStories.forEach(key => {
    const tracking = time_tracking[key];
    const status = development_status[key] || 'unknown';
    const duration = formatDuration(tracking.duration_hours);
    
    const statusIcon = status === 'done' ? '✅' : 
                       status === 'review' ? '🔍' :
                       status === 'in-progress' ? '🔄' : '⏸️';
    
    output.push(`${key}: ${duration} ${statusIcon} ${status}`);
    
    if (tracking.started_at) {
      output.push(`  Started: ${tracking.started_at}`);
    }
    if (tracking.completed_at) {
      output.push(`  Completed: ${tracking.completed_at}`);
    }
  });
  
  // Stories without time data
  const storiesWithoutTime = Object.keys(development_status).filter(key => {
    if (key.startsWith('epic-') || key.includes('retrospective')) return false;
    return !time_tracking[key] || time_tracking[key].duration_hours === null;
  });
  
  if (storiesWithoutTime.length > 0) {
    output.push('');
    output.push('STORIES WITHOUT TIME DATA');
    output.push('-------------------------');
    storiesWithoutTime.forEach(key => {
      const status = development_status[key];
      output.push(`${key}: ${status}`);
    });
  }
  
  return output.join('\n');
}

// Generate JSON report
function generateJSONReport(data, args) {
  const { metadata, development_status, time_tracking } = data;
  
  const stories = Object.keys(time_tracking)
    .filter(key => !key.startsWith('epic-') && !key.includes('retrospective'))
    .filter(key => {
      if (args.epic !== null && getEpicNumber(key) !== args.epic) return false;
      if (args.status !== null && development_status[key] !== args.status) return false;
      return true;
    })
    .map(key => ({
      key,
      epic: getEpicNumber(key),
      status: development_status[key],
      ...time_tracking[key]
    }));
  
  const completedStories = stories.filter(s => s.duration_hours !== null);
  const totalTime = completedStories.reduce((sum, s) => sum + (s.duration_hours || 0), 0);
  
  return JSON.stringify({
    metadata: {
      ...metadata,
      generated: new Date().toISOString()
    },
    summary: {
      total_stories: completedStories.length,
      total_time_hours: totalTime,
      average_time_hours: completedStories.length > 0 ? totalTime / completedStories.length : 0
    },
    stories
  }, null, 2);
}

// Generate CSV report
function generateCSVReport(data, args) {
  const { development_status, time_tracking } = data;
  
  const stories = Object.keys(time_tracking)
    .filter(key => !key.startsWith('epic-') && !key.includes('retrospective'))
    .filter(key => {
      if (args.epic !== null && getEpicNumber(key) !== args.epic) return false;
      if (args.status !== null && development_status[key] !== args.status) return false;
      return true;
    });
  
  let output = ['Story Key,Epic,Status,Started At,Completed At,Duration (hours)'];
  
  stories.forEach(key => {
    const tracking = time_tracking[key];
    const status = development_status[key] || 'unknown';
    const epic = getEpicNumber(key);
    
    output.push([
      key,
      epic,
      status,
      tracking.started_at || '',
      tracking.completed_at || '',
      tracking.duration_hours !== null ? tracking.duration_hours : ''
    ].join(','));
  });
  
  return output.join('\n');
}

// Main execution
function main() {
  const args = parseArgs();
  
  // Find sprint-status.yaml
  const sprintStatusPath = path.join(process.cwd(), '_bmad-output/planning-artifacts/sprint-status.yaml');
  
  if (!fs.existsSync(sprintStatusPath)) {
    console.error('Error: sprint-status.yaml not found');
    console.error(`Expected location: ${sprintStatusPath}`);
    console.error('\nRun "bmad-sprint-planning" to generate the sprint status file.');
    process.exit(1);
  }
  
  // Read and parse file
  const content = fs.readFileSync(sprintStatusPath, 'utf8');
  const data = parseYAML(content);
  
  // Generate report based on format
  let report;
  switch (args.format) {
    case 'json':
      report = generateJSONReport(data, args);
      break;
    case 'csv':
      report = generateCSVReport(data, args);
      break;
    case 'text':
    default:
      report = generateTextReport(data, args);
      break;
  }
  
  console.log(report);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { parseYAML, generateTextReport, generateJSONReport, generateCSVReport };
