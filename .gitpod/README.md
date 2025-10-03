# AuraOS Gitpod Automations

This directory contains Gitpod automation configurations for building and deploying AuraOS.

## Available Automations

### Tasks

#### `build-ui`
Builds the AuraOS UI for production.

```bash
gitpod automations task start build-ui
```

#### `deploy-firebase`
Builds and deploys the AuraOS UI to Firebase Hosting.

**Prerequisites:**
1. Generate a Firebase CI token on your local machine:
   ```bash
   firebase login:ci
   ```

2. Add the token to Gitpod environment variables:
   - Go to: https://gitpod.io/user/variables
   - Add variable:
     - **Name**: `FIREBASE_TOKEN`
     - **Value**: (paste the token from step 1)
     - **Scope**: `Moeabdelaziz007/AuraOS-Monorepo`

3. Restart your Gitpod workspace to load the new environment variable

**Usage:**
```bash
gitpod automations task start deploy-firebase
```

**Deployment URL:**
- Production: https://selfos-62f70.web.app
- Alternative: https://selfos-62f70.firebaseapp.com

### Services

#### `ui-dev`
Runs the Vite development server for the AuraOS UI.

```bash
gitpod automations service start ui-dev
```

The dev server will be available on port 3000.

## Managing Automations

### List all tasks
```bash
gitpod automations task list
```

### List all services
```bash
gitpod automations service list
```

### View task execution logs
```bash
gitpod automations task logs <execution-id>
```

### View service logs
```bash
gitpod automations service logs ui-dev
```

### Update automations
After modifying `automations.yaml`:
```bash
gitpod automations update .gitpod/automations.yaml
```

### Validate automations
```bash
gitpod automations validate .gitpod/automations.yaml
```

## Troubleshooting

### Firebase deployment fails with authentication error
- Ensure `FIREBASE_TOKEN` is set in Gitpod environment variables
- Restart your workspace after adding the token
- Verify the token is valid by running: `firebase projects:list --token "$FIREBASE_TOKEN"`

### Build fails
- Check that all dependencies are installed: `pnpm install`
- Verify the UI package builds locally: `cd packages/ui && npx vite build`

### Service won't start
- Check if the port is already in use
- View service logs: `gitpod automations service logs <service-name>`
