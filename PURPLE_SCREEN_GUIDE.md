# 🚨 Purple Screen Fix Guide

## Problem: Empty Purple Screen 

The purple screen happens when a complex React-based version gets selected that has dependency issues on Vercel.

## ⚡ Quick Fix

Run this command to instantly fix the purple screen:

```bash
./fix-purple-screen.sh
```

This will:
1. Backup the broken version
2. Restore the working professional version  
3. Rebuild the project
4. Verify it's working

## 🛡️ Prevention

**Always use the deploy selector** to safely choose versions:

```bash
./deploy-selector.sh
```

**Recommended versions for Vercel:**
1. **Professional** - Full-featured DEX (✅ Works great)
2. **Stable** - Mobile-optimized (✅ Works great)  
3. **Wallet** - Basic wallet integration (✅ Works great)
4. **Simple** - Demo version (✅ Works great)

**Avoid:**
- Manually editing `frontend/index.html`
- Using React-based versions without proper build setup

## 🔧 Manual Fix

If the script doesn't work, manually restore:

```bash
# Restore working version
cp frontend/index-professional.html frontend/index.html

# Rebuild
./build.sh

# Test
open build/index.html
```

## ✅ How to Verify It's Fixed

The DEX should:
- ✅ Show the loading screen briefly
- ✅ Load the full NocturneSwap interface
- ✅ Display wallet connection buttons
- ✅ Work on mobile

**If you still see purple/blank screen, run `./fix-purple-screen.sh` again!**
