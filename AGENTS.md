# Project Agent Instructions

## Cross-surface feature parity

- CLI, Node/npm SDK, and Python SDK are one product surface and must stay feature-equivalent.
- When adding, changing, or removing user-visible image-generation options, update all applicable surfaces in the same change:
  - CLI behavior and help text
  - Node/npm SDK implementation and TypeScript declarations
  - Python SDK client/provider/request-builder APIs
  - README examples for CLI, Node, and Python
  - Tests for each affected surface
- Do not merge a feature that exists in only one SDK surface unless the limitation is explicit, intentional, documented, and covered by tests.
- Provider-specific limitations must fail fast or warn clearly; never silently drop a requested option such as output size.
