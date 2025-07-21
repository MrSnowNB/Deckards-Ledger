[⬅️ Return to the Hiro Protocol](../000-hiro_protocol.md)
---

# Troubleshooting Guide

## Common Issues

### Module Resolution Errors
**Problem:** `Failed to resolve module specifier "@/services/types"`
**Solution:** 
- Check import paths use correct relative references (./,  ../, or /)
- Verify TypeScript path mapping in tsconfig.json
- Ensure target files exist in expected locations

### Session State Persistence
**Problem:** Session data not persisting between browser refreshes
**Solution:**
- Verify localStorage is enabled in browser
- Check for storage quota limits
- Validate JSON serialization/deserialization

### Component Integration Issues
**Problem:** Components not rendering or updating properly
**Solution:**
- Verify React hooks are used correctly
- Check for state mutation issues
- Ensure proper event handler binding

### Performance Degradation
**Problem:** Application becomes slow with extended use
**Solution:**
- Review context window management settings
- Check for memory leaks in session tracking
- Optimize auto-save frequency if needed

## Debug Commands
```bash
# Clear session state
localStorage.removeItem('masterDocument')

# Check current session
console.log(JSON.parse(localStorage.getItem('masterDocument')))

# Force context trim
masterDoc.trimContext()

# Export session data
masterDoc.exportSession()
```

## Emergency Recovery
1. **Session Corruption:** Clear localStorage and restart
2. **Context Overflow:** Manually trigger context trimming
3. **State Inconsistency:** Force checkpoint restoration
4. **Performance Issues:** Reduce auto-save frequency temporarily

---
[⬅️ Return to the Hiro Protocol](../000-hiro_protocol.md)
Check this protocol on Hiro after finishing.