# Ticket Limit Implementation Plan

## Status: In Progress [1/4]

### 1. ✅ Create TODO.md (Done)

### 2. 📝 Edit Check/admin.js
   - Add TOTAL_VISIBLE_ORDERS_LIMIT = 50
   - Modify getMergedOrdersForAdmin(): slice merged list to 50 newest after sort
   - Update startAutomation(): skip dummy if current visible >=50
   - Ensure real orders always prioritized/shown

### 3. 🧪 Test changes
   - Add real orders via booking.html
   - Watch automation: dummies stop at 50 total visible
   - Verify table caps at 50, real always visible

### 4. ✅ Complete
   - attempt_completion

**Next:** Edit admin.js
