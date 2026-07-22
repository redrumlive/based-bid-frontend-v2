---
name: openbid
description: Build, configure, validate, and operate OpenBid launches through the public TypeScript SDK. Use when Codex needs to create an OpenBid board, LBP, or Flash token; prepare EVM or Solana launch configuration; explain or apply OpenBid API-key rules; generate a signing wallet; perform supported LBP trades or fee claims; or troubleshoot OpenBid SDK workflows.
---

# OpenBid

Use the public OpenBid repository to prepare launch and post-launch workflows without guessing command names, configuration paths, or board access rules.

## Work safely

- Never print, commit, transmit, or repeat private keys.
- Treat `.env` and launch configuration as sensitive.
- Inspect the current repository before editing because commands and schemas can change.
- Keep signing local. Do not send a live transaction unless the user explicitly asks for execution.
- Explain network, asset, fee, and wallet consequences before any irreversible action.
- Prefer a dedicated funded wallet over a primary wallet.

## Choose the integration path

- Use the Board interface when the user wants a visual, no-code setup.
- Use the SDK when the user wants typed configuration or included command workflows.
- Use the API when the user is integrating requests into an existing backend.
- Use this Skill when an agent should inspect, prepare, validate, or operate the workflow for the user.

All paths create the same OpenBid launch types. Do not frame one path as more capable than another.

## Prepare a workflow

1. Inspect `README.md`, `package.json`, and the relevant file under `src/helpers/configs/`.
2. Confirm the requested launch type, network family, chain, board, token metadata, quote asset, liquidity values, and fee configuration.
3. Read [references/workflows.md](references/workflows.md) for the current command map and access rules.
4. Check for the required signing key without displaying its value.
5. Use the default `based` board when no custom board is requested. Omit both the board value and API key for that path.
6. Require `BASEDBID_API_KEY` when a custom board is configured.
7. Validate configuration types, addresses, numeric bounds, balances, and network selection before execution.
8. Run the narrowest matching command and report the result, transaction hash, network, and any follow-up action.

## Handle missing configuration

- If an EVM key is missing, offer `npm run wallet:evm` or ask the user to provide a key through their local environment.
- If a Solana key is missing, offer `npm run wallet:solana` or ask the user to provide a base58 key through their local environment.
- If a custom board key is missing, stop before the request and direct the user to create or publish a board, then add `BASEDBID_API_KEY` locally.
- If the chain or launch type is unclear, ask one concise question before preparing executable configuration.

## Verify the outcome

- Confirm the command exited successfully.
- Never infer a successful launch from a submitted request alone.
- Surface API, RPC, balance, signing, and board-key errors separately.
- Preserve the user's configuration and unrelated workspace changes.
