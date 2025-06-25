# ENHANCED NTARI Volunteer Time Analysis Module - Complete Prompt

## Objective
Analyze NTARI volunteer time data with configurable quality filtering to provide accurate volunteer engagement assessment while identifying data quality issues and documentation gaps.

## Enhanced Features
- **Configurable Quality Standards**: Multiple filtering levels from conservative to strict professional standards
- **Quality Impact Analysis**: Compare results across different filtering thresholds
- **Documentation Gap Detection**: Identify systematic time tracking culture issues
- **Progressive Implementation**: Support organizational development toward professional standards

## Quick Start Process
1. **Prepare Data**: Ensure volunteer time data is in tab-separated format
2. **Configure Quality Standard**: Select appropriate filtering level
3. **Single Analysis Call**: Process all data with quality filtering applied
4. **Generate Comprehensive Reports**: Summary + quality analysis + implementation recommendations

## Step 1: Data Input
Data will be provided directly in tab-separated format. Expected format:
```
firstName	lastName	userId	[other fields]	timeIn	timeOut	notes
```

**Data Requirements:**
- Tab-separated values (TSV format)
- TimeIn/TimeOut fields in parseable date format
- Notes field optional but recommended for sessions over quality threshold
- System entries and invalid rows will be automatically filtered

## Step 2: Quality Standard Selection

**Prompt user to select quality standard:**

```
"Please select quality filtering standard:
1. NONE (No filtering) - Show all sessions including obvious errors
2. CONSERVATIVE (8+ hours) - Filter obvious data quality issues [RECOMMENDED]
3. MODERATE (4+ hours) - Encourage extended session documentation  
4. PROFESSIONAL (2+ hours) - Developing professional standards
5. STRICT (1+ hours) - Full professional time tracking requirements

Enter your selection (1-5):"
```

**Configure based on user selection:**
- **Selection 1**: `const ACTIVE_STANDARD = 999.0;`
- **Selection 2**: `const ACTIVE_STANDARD = 8.0;` 
- **Selection 3**: `const ACTIVE_STANDARD = 4.0;`
- **Selection 4**: `const ACTIVE_STANDARD = 2.0;`
- **Selection 5**: `const ACTIVE_STANDARD = 1.0;`

## Step 3: Enhanced Analysis Implementation

Use analysis tool with provided volunteer time data and this comprehensive processing logic:

```javascript
// ENHANCED NTARI VOLUNTEER TIME ANALYSIS MODULE (v2.0)
// Configurable Quality Filtering System

const QUALITY_STANDARDS = {
  NONE: 999.0,          // No filtering (baseline)
  CONSERVATIVE: 8.0,    // Target obvious data quality issues - RECOMMENDED START
  MODERATE: 4.0,        // Encourage documentation for extended work
  PROFESSIONAL: 2.0,    // Developing professional standards  
  STRICT: 1.0           // Full professional time tracking
};

// SELECT ACTIVE STANDARD - Set based on user selection from Step 2
let ACTIVE_STANDARD = 8.0; // Will be updated based on user selection

const NAME_MAP = {
  'j graves': 'J Graves', 'J Graves': 'J Graves', 's yi': 'S Yi', 'S Yi': 'S Yi',
  'h lin': 'H Lin', 'H Lin': 'H Lin', 'k karwal': 'K Karwal', 'K Karwal': 'K Karwal',
  'd burnett': 'D Burnett', 'D Burnett': 'D Burnett', 'D BURNETT': 'D Burnett',
  'h adya': 'H Adya', 'H Adya': 'H Adya'
};

function calculateHours(timeIn, timeOut) {
  try {
    const start = new Date(timeIn);
    const end = new Date(timeOut);
    const diff = end - start;
    return diff > 0 ? diff / (1000 * 60 * 60) : 0;
  } catch {
    return 0;
  }
}

function isValidSession(duration, notes) {
  // Apply selected quality standard
  if (duration > ACTIVE_STANDARD && (!notes || notes.trim() === '')) {
    return false;
  }
  return true;
}

function getFilterReason(duration, notes, standard) {
  if (duration > standard && (!notes || notes.trim() === '')) {
    return `Session over ${standard}h without notes (${duration.toFixed(2)}h)`;
  }
  return null;
}

// MAIN PROCESSING FUNCTION
function processVolunteerData(inputData) {
  // Process provided data directly
  const data = inputData;
  
  const lines = data.split('\n').filter(line => line.trim());
  const entries = [];
  
  // Parse entries with validation
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length >= 3) {
      const firstName = (parts[0] || '').trim();
      const lastName = (parts[1] || '').trim();
      
      // Skip system entries early
      if (firstName.includes('b087fc75') || firstName.length > 50) continue;
      
      const timeIn = parts.length > 3 ? (parts[3] || '').trim() : '';
      const timeOut = parts.length > 4 ? (parts[4] || '').trim() : '';
      
      entries.push({
        firstName, lastName, userId: (parts[2] || '').trim(),
        timeIn, timeOut, notes: parts.length > 5 ? (parts[5] || '').trim() : ''
      });
    }
  }
  
  // Find date range from data
  const dates = [];
  entries.forEach(entry => {
    [entry.timeIn, entry.timeOut].forEach(time => {
      if (time) {
        const date = new Date(time);
        if (!isNaN(date.getTime())) dates.push(date);
      }
    });
  });
  
  const mostRecent = new Date(Math.max(...dates));
  const sevenDaysAgo = new Date(mostRecent.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Group by user ID to handle name variations
  const userGroups = {};
  entries.forEach(entry => {
    if (!userGroups[entry.userId]) {
      userGroups[entry.userId] = { entries: [], names: new Set() };
    }
    userGroups[entry.userId].entries.push(entry);
    
    let name = '';
    if (entry.firstName && entry.lastName) {
      name = `${entry.firstName} ${entry.lastName}`;
    } else if (entry.firstName) {
      name = entry.firstName;
    } else if (entry.lastName) {
      name = entry.lastName;
    }
    if (name) userGroups[entry.userId].names.add(name);
  });
  
  // Process each user with quality filtering
  const results = {};
  const activeVolunteers = [];
  const discardedSessions = [];
  
  Object.entries(userGroups).forEach(([userId, userGroup]) => {
    // Determine canonical name
    const nameOptions = Array.from(userGroup.names);
    let canonicalName = nameOptions[0];
    
    for (const name of nameOptions) {
      const lowerName = name.toLowerCase();
      if (NAME_MAP[lowerName]) {
        canonicalName = NAME_MAP[lowerName];
        break;
      }
    }
    
    if (!canonicalName || canonicalName.length < 2) return;
    
    const sessions = [];
    const filtered = [];
    let totalHours = 0;
    let hoursLast7Days = 0;
    
    // Sort entries by time
    const sortedEntries = userGroup.entries.sort((a, b) => {
      const timeA = new Date(a.timeIn || a.timeOut || '1970-01-01');
      const timeB = new Date(b.timeIn || b.timeOut || '1970-01-01');
      return timeA - timeB;
    });
    
    let pendingIn = null;
    
    sortedEntries.forEach(entry => {
      const hasIn = entry.timeIn && entry.timeIn !== '';
      const hasOut = entry.timeOut && entry.timeOut !== '';
      
      if (hasIn && !hasOut) {
        pendingIn = entry;
      } else if (!hasIn && hasOut && pendingIn) {
        const duration = calculateHours(pendingIn.timeIn, entry.timeOut);
        const notes = pendingIn.notes || entry.notes || '';
        
        if (duration > 0) {
          const sessionDate = new Date(pendingIn.timeIn);
          const inLast7 = sessionDate >= sevenDaysAgo;
          
          const sessionData = {
            date: sessionDate.toISOString().split('T')[0],
            startTime: pendingIn.timeIn,
            endTime: entry.timeOut,
            duration, 
            notes,
            inLast7Days: inLast7
          };
          
          // Apply quality filtering
          if (isValidSession(duration, notes)) {
            sessions.push(sessionData);
            totalHours += duration;
            if (inLast7) hoursLast7Days += duration;
          } else {
            const reason = getFilterReason(duration, notes, ACTIVE_STANDARD);
            filtered.push({ ...sessionData, reason });
            discardedSessions.push({
              volunteer: canonicalName,
              ...sessionData,
              reason
            });
          }
        }
        pendingIn = null;
      } else if (hasIn && hasOut) {
        const duration = calculateHours(entry.timeIn, entry.timeOut);
        const notes = entry.notes || '';
        
        if (duration > 0) {
          const sessionDate = new Date(entry.timeIn);
          const inLast7 = sessionDate >= sevenDaysAgo;
          
          const sessionData = {
            date: sessionDate.toISOString().split('T')[0],
            startTime: entry.timeIn,
            endTime: entry.timeOut,
            duration,
            notes,
            inLast7Days: inLast7
          };
          
          // Apply quality filtering
          if (isValidSession(duration, notes)) {
            sessions.push(sessionData);
            totalHours += duration;
            if (inLast7) hoursLast7Days += duration;
          } else {
            const reason = getFilterReason(duration, notes, ACTIVE_STANDARD);
            filtered.push({ ...sessionData, reason });
            discardedSessions.push({
              volunteer: canonicalName,
              ...sessionData,
              reason
            });
          }
        }
      }
    });
    
    results[canonicalName] = {
      userId, sessions, totalHours, hoursLast7Days,
      sessionCount: sessions.length, 
      filteredSessions: filtered,
      timeCorrections: []
    };
    
    if (hoursLast7Days > 0) {
      activeVolunteers.push({ name: canonicalName, hours: hoursLast7Days });
    }
  });
  
  // Create ranking
  const ranking = activeVolunteers
    .sort((a, b) => b.hours - a.hours)
    .map((v, i) => ({ rank: i + 1, name: v.name, hours: v.hours }));
  
  const analysis = {
    results, ranking,
    period: `${sevenDaysAgo.toISOString().split('T')[0]} to ${mostRecent.toISOString().split('T')[0]}`,
    totalVolunteers: Object.keys(results).length,
    activeVolunteers: ranking.length,
    qualityStandard: ACTIVE_STANDARD,
    dataQuality: {
      totalEntries: entries.length,
      validSessions: Object.values(results).reduce((sum, v) => sum + v.sessionCount, 0),
      filteredSessions: discardedSessions.length,
      filterRule: `Sessions over ${ACTIVE_STANDARD} hour${ACTIVE_STANDARD === 1 ? '' : 's'} without explanatory notes are discarded`
    },
    discardedSessions
  };
  
  return analysis;
}

// Run enhanced analysis with provided data
// Replace the placeholder below with actual volunteer time data in TSV format
const inputData = `firstName	lastName	userId	field3	timeIn	timeOut	notes
[PASTE VOLUNTEER TIME DATA HERE - TAB SEPARATED VALUES]`;

const analysis = processVolunteerData(inputData);

// Generate comprehensive reporting
const totalValidHours = analysis.ranking.reduce((sum, v) => sum + v.hours, 0);
const totalFilteredHours = analysis.discardedSessions.reduce((sum, s) => sum + s.duration, 0);
const originalHours = totalValidHours + totalFilteredHours;

console.log("=== ENHANCED VOLUNTEER TIME ANALYSIS ===");
console.log(`Quality Standard: ${analysis.qualityStandard} hour threshold`);
console.log(`Analysis Period: ${analysis.period}`);
console.log("");

console.log("QUALITY CONTROL RESULTS:");
console.log(`- Original Hours: ${originalHours.toFixed(2)}h`);
console.log(`- Valid Hours: ${totalValidHours.toFixed(2)}h`);
console.log(`- Filtered Hours: ${totalFilteredHours.toFixed(2)}h`);
console.log(`- Reduction: ${((totalFilteredHours/originalHours)*100).toFixed(1)}%`);
console.log(`- Active Volunteers: ${analysis.activeVolunteers}`);
console.log(`- Valid Sessions: ${analysis.dataQuality.validSessions}`);
console.log(`- Filtered Sessions: ${analysis.dataQuality.filteredSessions}`);
console.log("");

if (analysis.discardedSessions.length > 0) {
  console.log("FILTERED SESSIONS:");
  analysis.discardedSessions.forEach(session => {
    console.log(`- ${session.volunteer}: ${session.date} (${session.duration.toFixed(2)}h) - ${session.reason}`);
  });
  console.log("");
}

if (analysis.ranking.length > 0) {
  console.log("VOLUNTEER RANKINGS:");
  analysis.ranking.forEach(v => {
    console.log(`${v.rank}. ${v.name}: ${v.hours.toFixed(2)} hours`);
  });
} else {
  console.log("NO VOLUNTEERS MEET CURRENT QUALITY STANDARDS");
  console.log("Recommendation: Lower quality threshold or implement documentation training");
}
```

## Step 4: Automatic Report Generation

The analysis will automatically create comprehensive artifacts:

1. **Quality-Filtered Summary Report**: Overview with filtering impact analysis and volunteer rankings
2. **Individual Volunteer Reports**: Detailed activity reports for each volunteer showing valid sessions and any filtered sessions
3. **Quality Assessment Report**: Analysis of documentation patterns and filtering effects
4. **Administrative Action Items**: Sessions requiring follow-up (unclosed sessions, etc.)

## Key Enhancements

### Quality Control Features:
- **Configurable Standards**: Easy adjustment of filtering thresholds
- **Impact Measurement**: Track quality improvement over time
- **Documentation Analysis**: Identify systematic culture gaps
- **Progressive Implementation**: Support organizational development

### Enhanced Reporting:
- **Before/After Comparison**: Show filtering impact
- **Quality Metrics**: Documentation rates and compliance percentages  
- **Administrative Alerts**: Sessions requiring follow-up
- **Volunteer Analysis**: Individual performance with quality context

### Data Quality Analysis:
- **Culture Assessment**: Reveal documentation practices
- **Training Identification**: Target volunteers needing support
- **Quality Tracking**: Monitor documentation improvement over time
- **Professional Assessment**: Evaluate organizational time tracking maturity

## Usage Examples

### Conservative Filtering (Recommended Start):
```javascript
const ACTIVE_STANDARD = QUALITY_STANDARDS.CONSERVATIVE; // 8 hours
// Eliminates obvious forgotten check-outs while preserving legitimate work
```

### Professional Standards:
```javascript
const ACTIVE_STANDARD = QUALITY_STANDARDS.PROFESSIONAL; // 2 hours  
// Developing mature documentation culture
```

### Diagnostic Assessment:
```javascript
const ACTIVE_STANDARD = QUALITY_STANDARDS.STRICT; // 1 hour
// Reveals complete documentation gap for training planning
```

## Expected Outcomes

### With Conservative Filtering (8h):
- Eliminates obvious data quality issues
- Maintains realistic volunteer engagement metrics
- Identifies clear administrative follow-up needs
- Provides accurate baseline for analysis

### With Professional Standards (1-2h):
- Reveals documentation culture gaps
- Identifies specific training needs
- Shows accountability and professional practice levels
- Provides detailed quality assessment

### Analysis Benefits:
- **Accurate Metrics**: Reliable volunteer hour assessment
- **Quality Insights**: Understanding of documentation practices  
- **Administrative Clarity**: Clear identification of data issues
- **Professional Assessment**: Evaluation of time tracking standards

## Quality Standard Selection Guide

| Standard | Threshold | Best For | Expected Impact |
|----------|-----------|----------|-----------------|
| None | No filtering | Baseline comparison | Shows raw data issues |
| Conservative | 8+ hours | Initial implementation | Eliminates obvious errors |
| Moderate | 4+ hours | Developing culture | Encourages documentation |
| Professional | 2+ hours | Mature organizations | Professional standards |
| Strict | 1+ hours | Assessment/Training | Reveals documentation gaps |

**Note**: Different quality standards reveal different aspects of volunteer time tracking - from basic data quality issues to comprehensive documentation culture assessment.
