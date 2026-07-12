# Installation and distribution

## Direct use

```bash
cd supermarketer-skill
node bin/supermarketer.mjs doctor
node bin/supermarketer.mjs help
```

## Local command link

```bash
npm link
supermarketer version
```

No third-party runtime package is required. `npm install --ignore-scripts` only prepares the local command metadata and lockfile; direct `node bin/supermarketer.mjs` use works without it.

## Agent skill directories

Keep one canonical checkout and create links where supported:

```bash
mkdir -p ~/.agents/skills ~/.codex/skills ~/.claude/skills
ln -sfn /absolute/path/supermarketer-skill ~/.agents/skills/supermarketer
ln -sfn /absolute/path/supermarketer-skill ~/.codex/skills/supermarketer
ln -sfn /absolute/path/supermarketer-skill ~/.claude/skills/supermarketer
```

On systems where links are unavailable, copy the whole directory. Verify it afterwards:

```bash
supermarketer install-audit /absolute/path/supermarketer-skill \
  ~/.agents/skills/supermarketer \
  ~/.codex/skills/supermarketer \
  ~/.claude/skills/supermarketer
```

## Distribution verification

```bash
bash tests/run-all.sh
node bin/supermarketer.mjs check-skill .
```

A release archive should include the complete repository, pass the commands above after extraction, pass `npm pack --dry-run --ignore-scripts`, and be accompanied by a SHA-256 checksum. A checksum detects corruption but does not authenticate the publisher; add a detached digital signature when provenance matters.
