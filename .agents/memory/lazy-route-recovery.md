---
name: Lazy route recovery
description: Recovery and state-preservation constraints for on-demand dashboard sections
---

Keep navigation and the shared application provider outside lazy route loading
and error boundaries. Handle failed section downloads locally, with bilingual
feedback, working navigation and an explicit reload action.

**Why:** React caches rejected lazy imports, and browsers may cache failed module
fetches. Resetting an error boundary alone is not reliable download recovery.
Automatic reloads can loop indefinitely on a poor connection. An explicit reload
retains saved settings, but transient in-memory state is only preserved while
navigating without a reload.

**How to apply:** When adding lazy sections, avoid eager imports of chart code
from the shell or Overview. Verify the production import graph and interrupted
chunk downloads rather than relying on development-server requests. Do not
remount routes when the language changes, since that clears local chart controls.
