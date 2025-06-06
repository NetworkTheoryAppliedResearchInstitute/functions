/**
 * Streamlined Time Record Extraction Subroutine
 * Quick extraction and analysis of tabular time tracking data
 */

function extractTimeRecords(rawData) {
  const results = {
    people: {},
    totalHours: 0,
    issues: [],
    summary: []
  };

  // Parse and clean data
  const lines = rawData.trim().split('\n').slice(1); // Skip header
  const entries = [];

  // Extract valid entries
  lines.forEach((line, index) => {
    const values = line.split('\t');
    if (values.length >= 4) {
      const entry = {
        rowNum: index + 2,
        firstInitial: (values[0] || '').trim(),
        lastName: (values[1] || '').trim(),
        timeIn: (values[3] || '').trim(),
        timeOut: (values[4] || '').trim(),
        notes: (values[5] || '').trim()
      };

      // Normalize person name
      const name = normalizeName(entry.firstInitial, entry.lastName);
      if (name && (entry.timeIn || entry.timeOut)) {
        entry.personName = name;
        entry.timeInDate = parseDate(entry.timeIn);
        entry.timeOutDate = parseDate(entry.timeOut);
        entries.push(entry);
      }
    }
  });

  // Group by person and calculate shifts
  const personGroups = {};
  entries.forEach(entry => {
    if (!personGroups[entry.personName]) {
      personGroups[entry.personName] = [];
    }
    
    // Add clock events
    if (entry.timeInDate) {
      personGroups[entry.personName].push({
        timestamp: entry.timeInDate,
        type: 'in',
        notes: entry.notes,
        row: entry.rowNum
      });
    }
    if (entry.timeOutDate) {
      personGroups[entry.personName].push({
        timestamp: entry.timeOutDate,
        type: 'out',
        notes: entry.notes,
        row: entry.rowNum
      });
    }
  });

  // Calculate shifts for each person
  Object.keys(personGroups).forEach(person => {
    const events = personGroups[person].sort((a, b) => a.timestamp - b.timestamp);
    const shifts = [];
    let clockInEvent = null;
    let totalHours = 0;

    events.forEach(event => {
      if (event.type === 'in') {
        if (clockInEvent) {
          // Incomplete shift - missing clock-out
          results.issues.push(`${person}: Missing clock-out for ${formatDate(clockInEvent.timestamp)} (row ${clockInEvent.row})`);
        }
        clockInEvent = event;
      } else if (event.type === 'out') {
        if (clockInEvent) {
          // Complete shift
          const hours = (event.timestamp - clockInEvent.timestamp) / (1000 * 60 * 60);
          shifts.push({
            start: clockInEvent.timestamp,
            end: event.timestamp,
            hours: hours,
            notes: clockInEvent.notes || event.notes
          });
          
          if (hours > 24) {
            results.issues.push(`${person}: Suspicious ${hours.toFixed(1)}h shift on ${formatDate(clockInEvent.timestamp)}`);
          } else {
            totalHours += hours;
          }
          clockInEvent = null;
        } else {
          // Orphaned clock-out
          results.issues.push(`${person}: Clock-out without clock-in at ${formatDate(event.timestamp)} (row ${event.row})`);
        }
      }
    });

    // Final incomplete shift
    if (clockInEvent) {
      results.issues.push(`${person}: Missing clock-out for ${formatDate(clockInEvent.timestamp)} (row ${clockInEvent.row})`);
    }

    // Store results
    results.people[person] = {
      totalHours: totalHours,
      completeShifts: shifts.filter(s => s.hours <= 24).length,
      shifts: shifts,
      firstDate: events.length > 0 ? events[0].timestamp : null,
      lastDate: events.length > 0 ? events[events.length - 1].timestamp : null
    };
    
    results.totalHours += totalHours;
  });

  // Generate summary
  results.summary = Object.keys(results.people)
    .map(person => ({
      name: person,
      hours: results.people[person].totalHours,
      shifts: results.people[person].completeShifts
    }))
    .sort((a, b) => b.hours - a.hours);

  return results;
}

// Helper functions
function normalizeName(first, last) {
  const f = (first || '').trim().toUpperCase();
  const l = (last || '').trim();
  
  if (!f && !l) return null;
  
  // Special cases
  if (f === 'J' && (l.toLowerCase() === 'graves' || !l)) return 'J Graves';
  if (l.toLowerCase() === 'muchiri') return 'M Muchiri';
  if (l.toLowerCase() === 'carrión') return 'A Carrión';
  
  return f && l ? `${f} ${l}` : (l || f);
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function formatDate(date) {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Quick summary function
function getQuickSummary(rawData) {
  const results = extractTimeRecords(rawData);
  
  console.log("TIME TRACKING QUICK SUMMARY");
  console.log("=".repeat(40));
  console.log(`Total People: ${Object.keys(results.people).length}`);
  console.log(`Total Hours: ${results.totalHours.toFixed(2)}`);
  console.log(`Data Issues: ${results.issues.length}`);
  
  console.log("\nTOP CONTRIBUTORS:");
  results.summary.slice(0, 5).forEach((person, i) => {
    console.log(`${i + 1}. ${person.name}: ${person.hours.toFixed(2)}h (${person.shifts} shifts)`);
  });
  
  if (results.issues.length > 0) {
    console.log("\nDATA QUALITY ISSUES:");
    results.issues.slice(0, 5).forEach(issue => console.log(`⚠️ ${issue}`));
    if (results.issues.length > 5) {
      console.log(`... and ${results.issues.length - 5} more issues`);
    }
  }
  
  return results;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { extractTimeRecords, getQuickSummary };
}

// For direct use:
// const results = extractTimeRecords(rawTimeData);
// const summary = getQuickSummary(rawTimeData);
