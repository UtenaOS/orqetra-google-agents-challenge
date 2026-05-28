# Safety Boundary

Orqetra separates reusable skill contracts from private runtime values.

## Shared skill contract

May include:

- workflow family
- primitive chain
- required input schema
- optional input schema
- verification contract
- runtime requirements
- safety policy

Must not include:

- specific URL values
- file paths
- file names
- save folders
- user-entered text values
- clipboard contents
- raw DOM
- raw observation logs
- private user context

## Runtime input binding

Runtime input binding carries per-run values. These values are redacted in diagnostics and are not included in the reusable shared skill.

## Approval

Preview does not execute the workflow and does not create an artifact. Artifact generation happens only after explicit approval.

## Blocked primitives

The Challenge demo does not include:

- submit
- send
- purchase
- payment
- delete
