<!-- 718c1abb-e2ee-4352-9983-ad51c0e2b667 0b79d8f4-815d-4791-808f-ba62759e4da6 -->
# Integrate Kombai DesktopOS and wire useAuth

## Scope

- Replace `packages/ui/src/pages/DesktopOS.tsx` placeholder with the Kombai version (`packages/ui/src/DesktopOS.tsx`).
- Wire `useAuth` inside the new `DesktopOS` to respect `loading` and provide a clean loading state.
- Keep routing unchanged by re-exporting the new component from the old page path, minimizing churn.

## Steps

1) Re-export new DesktopOS from the page entry

- Update `packages/ui/src/pages/DesktopOS.tsx` to simply re-export the improved component:
```1:3:packages/ui/src/pages/DesktopOS.tsx
export { DesktopOS } from '../DesktopOS';
```


This preserves `App.tsx` routing imports and swaps in the new Kombai desktop.

2) Wire useAuth in the new Kombai DesktopOS

- Edit `packages/ui/src/DesktopOS.tsx` to import the auth hook and display a loading state before rendering windows:
```1:1:packages/ui/src/DesktopOS.tsx
import { useAuth } from './contexts/AuthContext';
```


```150:176:packages/ui/src/DesktopOS.tsx

const { loading } = useAuth();

if (loading) {

return (

<div className="quantum-desktop flex items-center justify-center h-screen">

<div className="quantum-loading" aria-label="Loading desktop" />

</div>

);

}

````
- Optional: make the root container adopt Kombai background styling:
```152:154:packages/ui/src/DesktopOS.tsx
return (
  <div className="quantum-desktop">
````

3) Verify Desktop icons honor user profile

- `packages/ui/src/components/Desktop.tsx` already uses `useAuth()` and respects `userProfile.preferences.desktopLayout.pinnedApps`. No change needed.

4) Build & run

- Build: `pnpm build`
- Dev: `pnpm dev`
- Confirm the desktop renders with Kombai theme and shows a loader during auth initialization.

## Notes

- No routing change needed since `App.tsx` imports `./pages/DesktopOS`.
- Kombai CSS classes like `quantum-desktop` and `quantum-loading` are already introduced in the recent CSS edits (`packages/ui/src/index.css`, `packages/ui/src/DesktopOS.css`).

### To-dos

- [ ] Re-export new DesktopOS from pages/DesktopOS.tsx
- [ ] Wire useAuth in src/DesktopOS.tsx with Kombai loader
- [ ] Adopt Kombai quantum-desktop class on DesktopOS root
- [ ] Build, run, verify desktop shows and respects auth state