# Code Review 3D

This repository is a checkout of [Pascal](https://github.com/pascalorg/editor)
(remote `upstream`) with one addition: **Code Review 3D**, a 3D plan-review
tool, in [`apps/review`](apps/review).

- What it is and how to run it: [apps/review/README.md](apps/review/README.md)
- The phased rollout, with pseudocode for each phase: [apps/review/ROADMAP.md](apps/review/ROADMAP.md)
- Floor plans and documents for the sample buildings: [apps/review/public/reference/README.md](apps/review/public/reference/README.md)

Everything outside `apps/review` is Pascal, unchanged. To take in Pascal's
updates:

```bash
git fetch upstream
git merge upstream/main
```
