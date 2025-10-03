# Environment Variables Setup

## Firebase Token

To enable automated deployments, you need to set the `FIREBASE_TOKEN` environment variable.

### One-time Setup

1. **Generate Firebase CI Token** (if you haven't already):
   ```bash
   firebase login:ci
   ```
   This will output a token like: `1//03pHHxaMX_2CPCgYIARAAGAMSNwF-L9Ir...`

2. **Set in Current Session**:
   ```bash
   export FIREBASE_TOKEN="your-token-here"
   ```

3. **Persist for Future Sessions** (add to ~/.bashrc):
   ```bash
   echo 'export FIREBASE_TOKEN="your-token-here"' >> ~/.bashrc
   source ~/.bashrc
   ```

### Verify Token is Set

Check if the token is configured:
```bash
echo $FIREBASE_TOKEN
```

## Usage

Once the token is set, you can use:

- **Manual Deploy**: `npm run auto-deploy`
- **Gitpod Automation**: Changes to source files will trigger auto-deploy
- **Custom Message**: `./scripts/auto-deploy.sh "feat: your commit message"`

## Security Note

⚠️ Never commit the Firebase token to the repository. It's stored in:
- Environment variables
- ~/.bashrc (local only)
- Gitpod environment variables (if configured)
