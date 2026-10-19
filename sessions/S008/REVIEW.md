# S008 review

Core architecture deliberately reuses MindController.ask and approve, rather than creating a second LLM-to-world execution path. EpisodeMindController enforces explicit one-time consent and caps; the existing Redis admission budget remains unchanged. No browser storage, secret logging, polling workers, or independent Vercel loop. Key risk to close before merge: strict CI and Chromium fixture results, plus cancellation races. Production live multi-decision behavior requires the owner's separate observation.
