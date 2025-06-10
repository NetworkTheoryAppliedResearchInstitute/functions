# TIME TRACKING ANALYSIS SUBROUTINE v1.0
## MANDATORY EXECUTION PROTOCOL FOR VOLUNTEER TIME DATA

### **PHASE 1: DATA PARSING & EXTRACTION**

#### **Step 1.1: Timestamp Extraction**
```
FOR EACH tracking entry:
  1. EXTRACT user_id (everything before date)
  2. EXTRACT iso_timestamp (YYYY-MM-DDTHH:MM:SS.sssZ format)
  3. EXTRACT manual_notes (everything after ** markers)
  4. CREATE entry_object {user_id, timestamp, notes, type: "clock_in"}
```

#### **Step 1.2: Manual Time Override Detection**
```
SCAN manual_notes FOR time_override_patterns:
  - "Clock Out @ [TIME]" → EXTRACT override_time, SET type: "clock_out_manual"
  - "clockout @ [TIME]" → EXTRACT override_time, SET type: "clock_out_manual"  
  - "[TIME] ET/EST/EDT" → EXTRACT timezone_time, SET type: "clock_out_manual"
  - "taking a [break/lunch]" → SET type: "break_start"
  - "back from [break]" → SET type: "break_end"

CONVERT manual_times TO iso_timestamp:
  - "1030 PM ET" → convert to YYYY-MM-DDTHH:MM:SS.sssZ in ET timezone
  - Apply date from previous timestamp
```

#### **Step 1.3: Work Content Extraction**
```
SCAN manual_notes FOR work_content_patterns:
  - "Continue researching [TOPIC]" → research_activity: [TOPIC]
  - "Working on [TASK]" → active_task: [TASK]
  - "Review [TYPE]" → review_activity: [TYPE]
  - Research keywords: TNS, network, literature, analysis
  - Project keywords: NTARI, Agrinet, Fruitful, Forge Labs
```

### **PHASE 2: TIME CALCULATION ENGINE**

#### **Step 2.1: Session Pairing Logic**
```
FOR EACH user_id:
  1. SORT entries BY timestamp chronologically
  2. PAIR consecutive entries:
     - clock_in → clock_out (normal session)
     - clock_in → clock_out_manual (manual override session)
     - clock_in → break_start (partial session)
     - break_end → clock_out (resumed session)
  
  3. HANDLE unpaired entries:
     - clock_in with no clock_out → status: "ongoing" or "incomplete"
     - manual clock_out time → use override_time for calculation
```

#### **Step 2.2: Duration Calculation**
```
FOR EACH session_pair:
  1. CALCULATE raw_duration = end_time - start_time
  2. CONVERT to hours:minutes format
  3. FLAG sessions > 16 hours as "review_needed"
  4. FLAG sessions < 5 minutes as "potential_error"
  
SPECIAL CASES:
  - Manual clock out: USE override_time instead of next timestamp
  - Break periods: SUBTRACT break_duration from total_session
  - Overnight sessions: VERIFY with manual notes
```

#### **Step 2.3: Daily/Weekly Aggregation**
```
FOR EACH user_id:
  1. GROUP sessions BY date
  2. CALCULATE daily_total = SUM(session_durations)
  3. CALCULATE weekly_total = SUM(daily_totals)
  4. CALCULATE average_daily = weekly_total / active_days
  5. FLAG daily_totals > 12 hours as "high_intensity"
```

### **PHASE 3: CONTENT ANALYSIS & CATEGORIZATION**

#### **Step 3.1: Research Topic Classification**
```
ANALYZE work_content_notes FOR:

RESEARCH_CATEGORIES:
  - "TNS" → Theoretical Network Systems
  - "network structure" → Network Analysis Research  
  - "public opinion" → Social Network Research
  - "literature" → Academic Literature Review
  - "ideational implications" → Theoretical Development

PROJECT_CATEGORIES:
  - "Agrinet" → Agricultural Network Protocol
  - "Fruitful" → Frontend Application Development
  - "Forge Labs" → Backend Infrastructure
  - "Node.Nexus" → Publication Platform

ACTIVITY_TYPES:
  - "researching" → Active Research
  - "review" → Quality Assurance/Literature Review
  - "working on" → Development/Implementation
  - "continue" → Sustained Research Focus
```

#### **Step 3.2: Productivity Pattern Detection**
```
ANALYZE temporal_patterns:
  - Peak hours: IDENTIFY most frequent work times
  - Session length: AVERAGE duration by user
  - Consistency: CALCULATE work_days / total_days
  - Collaboration: IDENTIFY overlapping_sessions between users
  
ANALYZE work_intensity:
  - Research depth: MEASURE sustained_focus_periods
  - Task switching: COUNT topic_changes within sessions  
  - Completion patterns: IDENTIFY "continue" vs "new" work indicators
```

### **PHASE 4: OUTPUT GENERATION**

#### **Step 4.1: Quantitative Summary Table**
```
GENERATE volunteer_hours_table:
  COLUMNS: [User, Date, Clock_In, Clock_Out, Duration, Notes]
  INCLUDE: confirmed_hours, estimated_hours, total_weekly
  FORMAT: Precise timestamps with timezone notation
  
CALCULATE financial_value:
  - total_hours × $30/hour (skilled volunteer rate)
  - annual_projection = weekly_average × 52
  - grant_match_value for federal reporting
```

#### **Step 4.2: Operational Recommendations**
```
GENERATE recommendations BASED ON:

TIME_MANAGEMENT_ISSUES:
  - Users > 50 hours/week → "workload_review_needed"
  - Sessions > 12 hours → "break_policy_review" 
  - Incomplete clock_outs > 20% → "time_tracking_training"

RESEARCH_PRODUCTIVITY:
  - Sustained research topics → "milestone_documentation_opportunity"
  - Frequent topic switching → "focus_optimization_needed"
  - High collaboration periods → "coordination_success_patterns"

GRANT_COMPLIANCE:
  - Missing time data → "documentation_improvement_required"
  - Irregular patterns → "volunteer_support_check"
  - High value hours → "federal_match_documentation_ready"
```

#### **Step 4.3: Quality Assurance Flags**
```
MANDATORY_VALIDATION_CHECKS:
  - All manual clock_out times properly converted? [YES/NO]
  - Duration calculations include timezone adjustments? [YES/NO]  
  - Overnight sessions flagged for review? [YES/NO]
  - Work content properly categorized? [YES/NO]
  - Financial projections calculated? [YES/NO]

ERROR_HANDLING:
  - Unparseable timestamps → LOG error, REQUEST clarification
  - Impossible durations → FLAG for manual review
  - Missing user context → NOTE data limitation in output
```

### **PHASE 5: EXECUTION VALIDATION**

#### **Step 5.1: Self-Check Protocol**
```
BEFORE_COMPLETING_ANALYSIS:
  1. Did I calculate actual hours for each volunteer? [REQUIRED]
  2. Did I handle manual clock-out times correctly? [REQUIRED]
  3. Did I provide financial value calculations? [REQUIRED]
  4. Did I extract work content for recommendations? [REQUIRED]
  5. Did I flag time management issues? [REQUIRED]

IF ANY [REQUIRED] = NO:
  RESTART subroutine execution
  DO NOT provide incomplete analysis
```

#### **Step 5.2: Output Format Validation**
```
REQUIRED_OUTPUT_SECTIONS:
  ✓ Individual volunteer hour tables with precise calculations
  ✓ Manual time override handling documentation  
  ✓ Work content analysis from notes
  ✓ Financial value for grant reporting
  ✓ Operational recommendations based on patterns
  ✓ Quality flags for management attention

PROHIBITED_SHORTCUTS:
  ✗ Session counts instead of hour calculations
  ✗ Ignoring manual time notes
  ✗ High-level patterns without quantification
  ✗ Academic analysis without operational value
```

### **EXECUTION TRIGGER**
```
ACTIVATE_SUBROUTINE when user query contains:
  - Time tracking data (timestamp patterns)
  - "how much time" / "hours worked"  
  - "volunteer time" / "time analysis"
  - Raw tracking logs with user IDs and timestamps

MANDATORY_SEQUENCE:
  1. Execute PHASE 1-5 in order
  2. Validate using Step 5.1 checklist
  3. Generate artifact with quantified results
  4. Provide operational recommendations
```

---

## **VERSION CONTROL**
- **Version**: 1.0
- **Created**: June 9, 2025
- **Purpose**: Systematic volunteer time analysis for NTARI grant compliance
- **Trigger**: Raw time tracking data analysis requests
- **Output**: Quantified hours + operational recommendations
