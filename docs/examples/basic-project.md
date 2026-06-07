# Basic Project Example

This example shows a minimal local Avipack workflow without adding application code.

```bash
mkdir -p /tmp/avipack-basic-project
cd /tmp/avipack-basic-project
node /path/to/avipack/packages/cli/dist/index.js init --name BasicProject
node /path/to/avipack/packages/cli/dist/index.js doctor
node /path/to/avipack/packages/cli/dist/index.js brain check --report
node /path/to/avipack/packages/cli/dist/index.js bot list
node /path/to/avipack/packages/cli/dist/index.js change new --title "Add first tracked change"
node /path/to/avipack/packages/cli/dist/index.js adr new --title "Record initial architecture direction"
```

The project brain is stored in `.avipack/`. Bot commands remain manual and owner-controlled.
