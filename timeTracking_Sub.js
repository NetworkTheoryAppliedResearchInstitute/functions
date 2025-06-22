# NTARI TIME TRACKING DATA PROCESSOR
**Enhanced Time Subroutine Implementation with Notes Analysis**

## PROCESSING INSTRUCTIONS

When given NTARI volunteer time tracking data, follow this systematic approach:

### 1. DATA PARSING
**Format A - Raw Timestamps**: `**username[timestamp][username][timestamp]...**`
**Format B - Structured Table**: With headers: First Initial, Last Name, User ID, Time In, Time Out, Notes

- **Extract**: User identification, timestamps, and notes content
- **Identify**: Event types based on patterns, context, and notes analysis

### 2. NOTES ANALYSIS FRAMEWORK
**Primary Functions of Notes Column:**
1. **Time Corrections**: Explicit clock out/in times that override timestamps
2. **System Indicators**: Auto timeout notifications, system-generated markers
3. **User Accomplishments**: Work completed during session
4. **Context Information**: Session purpose, activities, challenges

**Notes Pattern Recognition:**
```
TIME_CORRECTION_PATTERNS = [
    /Clock Out @ (\d{1,2}:\d{2} (?:AM|PM) \w+)/i,
    /clocked out at (\d{1,2}:\d{2})/i,
    /end session (\d{1,2}:\d{2})/i,
    /actual end time: (\d{1,2}:\d{2})/i
]

SYSTEM_INDICATORS = [
    "**Auto Timeout**",
    "System Generated",
    "Automatic Clockout",
    "Session Expired"
]

ACCOMPLISHMENT_KEYWORDS = [
    "completed", "finished", "accomplished", "delivered",
    "researched", "analyzed", "developed", "created",
    "reviewed", "updated", "implemented", "tested"
]
```

### 3. EVENT CLASSIFICATION
Apply priority hierarchy with notes integration:
- **Explicit Clock Out in Notes** (Priority: 100): Time corrections in notes field
- **Explicit Clock In in Notes** (Priority: 95): Start time corrections in notes
- **Break Markers in Notes** (Priority: 90): Break/pause indicators
- **System Auto-Timeout** (Priority: 60): "**Auto Timeout**" in notes
- **System Markers** (Priority: 50): Other system-generated events
- **Standard Timestamps** (Priority: 10): Time In/Time Out columns without corrections

### 3. SESSION GROUPING
- **Group consecutive timestamps** into work sessions
- **Session breaks**: Gaps > 30 minutes suggest session boundaries
- **Same-day sessions**: Multiple sessions per day are possible
- **Generate session IDs**: Format as `session_YYYYMMDD_HHMMSS`

### 4. DURATION CALCULATION
For each session:
- **Start**: First timestamp in session group
- **End**: Last timestamp in session group (or explicit clock out)
- **Duration**: Calculate total time between start/end
- **Subtract breaks**: Account for gaps > 30 minutes within sessions

### 5. VALIDATION FRAMEWORK
Apply these thresholds and flag accordingly:

**Duration Flags:**
- `EXTREME_SHORT`: < 5 minutes
- `SUSPICIOUS_SHORT`: < 30 minutes
- `NORMAL`: 30 minutes - 8 hours
- `CONCERNING_LONG`: 8-20 hours
- `EXTREME_LONG`: > 20 hours

**Weekly Validation:**
- `WEEKLY_CONCERN`: > 40 hours/week
- `WEEKLY_EXTREME`: > 60 hours/week

### 6. OUTPUT FORMAT

Provide a comprehensive analysis including:

#### A. SESSION BREAKDOWN
For each session:
```
Session ID: session_20250201_120127
User: Mary Anne Muchiri
Time In: 2025-02-01T12:01:27.301Z (12:01 PM ET)
Time Out: 2025-02-01T13:01:27.301Z (1:01 PM ET)
Duration: 1h 0m 0s
Notes: "**Auto Timeout**"
Event Type: System Auto-Timeout
Priority: System (60)
Flags: [AUTO_TIMEOUT, NORMAL_DURATION]
Time Correction: None detected
Accomplishments: None listed
```

#### B. NOTES ANALYSIS SUMMARY
```
Time Corrections Found: X
Auto Timeouts: X
Accomplishments Logged: X
System Indicators: X
Manual Session Notes: X
```

#### C. ACCOMPLISHMENTS TRACKING
Extract and categorize user accomplishments:
```
User: Mary Anne Muchiri
Session Date: 2025-02-01
Accomplishments: [None listed - Auto Timeout session]
Work Categories: Administrative, Research, Development, etc.
```

#### D. VALIDATION REPORT
```
User: Mary Anne Muchiri
Total Sessions: X
Total Hours: XX.X
Auto Timeouts: X
Manual Sessions: X
Notes Completion Rate: XX%
Health Status: GOOD/WARNING/CRITICAL
```

#### E. WEEKLY SUMMARY TABLE
```
| User         | Sessions | Total Hours | Auto Timeouts | Accomplishments | Flags |
|--------------|----------|-------------|---------------|-----------------|-------|
| M. Muchiri   | X        | XX.X       | X             | X               | [...] |
| A. Carrión   | X        | XX.X       | X             | X               | [...] |
```

### 7. ANALYSIS CONSIDERATIONS
- **Time Zone**: Assume Eastern Time unless specified
- **Notes Priority**: Notes field time corrections override timestamp data
- **Auto Timeout Detection**: Flag "**Auto Timeout**" entries for review
- **Accomplishment Extraction**: Parse notes for work completed
- **Session Quality**: Rate sessions based on notes completeness
- **Break Detection**: Gaps > 30 minutes = potential breaks
- **Session Boundaries**: Gaps > 4 hours = new session
- **Data Completeness**: Track missing Time Out entries

### 8. NOTES FIELD QUALITY METRICS
- **Time Correction Rate**: % of sessions with explicit time corrections
- **Accomplishment Documentation**: % of sessions with work logged
- **Auto Timeout Frequency**: System intervention rate
- **Notes Completion**: % of sessions with any notes content
- **Productivity Indicators**: Accomplishment keywords per session

### 9. INDIVIDUAL USER REPORT ARTIFACTS
**Generate separate artifacts for each user's weekly time report**

**Artifact Naming Convention:** `user_time_report_[lastname]_[week_ending_date]`
**Example:** `user_time_report_muchiri_20250221`

**Individual Report Structure:**
```markdown
# WEEKLY TIME REPORT
**User:** [Full Name]
**Week Ending:** [Date]
**Report Generated:** [Timestamp]

## EXECUTIVE SUMMARY
- **Total Hours:** XX.X
- **Sessions Completed:** X
- **Average Session Length:** X.X hours
- **Productivity Score:** X/10
- **Data Quality Score:** X/10

## SESSION DETAILS
[Detailed breakdown of each session]

## ACCOMPLISHMENTS SUMMARY
[Extracted accomplishments by date]

## TIME CORRECTIONS & NOTES
[Any time corrections or significant notes]

## RECOMMENDATIONS
[Personalized recommendations for improvement]
```

### 10. MULTI-ARTIFACT GENERATION FUNCTION
When processing time data, create:
1. **Master Summary Artifact** - Overall analysis across all users
2. **Individual User Artifacts** - One per user with personalized details
3. **Data Quality Artifact** - System health and improvement recommendations

**Implementation Instructions:**
After completing main analysis, generate individual artifacts using:
- User-specific session data
- Personalized accomplishments tracking  
- Individual productivity metrics
- Targeted recommendations for each user

### 8. RECOMMENDATIONS
Based on validation results, provide:
- **Data Quality Issues**: Missing clock outs, extreme sessions
- **Pattern Analysis**: Unusual work patterns or scheduling
- **System Improvements**: Suggestions for better time tracking

## SAMPLE PROCESSING REQUEST

"Please process this NTARI volunteer time tracking data using the Enhanced Time Subroutine specifications with notes analysis:

**[INSERT_STRUCTURED_TIME_DATA_HERE]**

Focus on:
1. Session duration calculations with notes-based time corrections
2. Auto timeout detection and frequency analysis  
3. Accomplishment extraction from notes field
4. Time correction pattern recognition
5. Data quality assessment including notes completion rates

Provide:
1. **Master summary** with session breakdown, notes analysis, and weekly summary
2. **Individual user artifacts** - separate detailed reports for each user
3. **Data quality artifact** - system recommendations and improvements needed

Generate all artifacts following the framework above."
