# Development Workflow

## IMPORTANT: Production Deployment Process

**DO NOT push to production (git push) without explicit user approval.**

### Workflow Steps:

1. **Make changes locally**
   - Edit files as requested
   - Test changes locally at http://localhost:3001

2. **Commit changes locally ONLY**
   - Use `git add` and `git commit` to save changes
   - **DO NOT run `git push`**

3. **Wait for user approval**
   - User will test changes locally
   - User will review and approve
   - User will explicitly say "push to prod" or "deploy to production"

4. **Push to production ONLY when user says so**
   - Only run `git push` after explicit user approval
   - This triggers automatic Vercel deployment

### Example Commands:

**Local commit (ALWAYS OK):**
```bash
git add .
git commit -m "Description of changes"
```

**Push to production (ONLY with user approval):**
```bash
git push  # Only run this when user explicitly approves
```

## Why This Matters

- Production deployments trigger Vercel builds and affect live users
- Local testing catches bugs before they reach production
- User needs time to review and test changes
- Some changes may need additional work before deployment

## Remember

**When in doubt, commit locally and wait for user approval before pushing.**
