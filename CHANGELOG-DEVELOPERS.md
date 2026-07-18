# Developer Changelog

Technical implementation notes and migration details for the BB Creation Panel.

## 1.0.0 - 2026-07-18

### Platform Baseline

- Established a production Next.js 16.2.10 application on React 19.2.7 and TypeScript 6.0.3.
- Pinned npm dependencies and transitive package resolution through `package-lock.json` and the PostCSS override.
- Set Node.js 24.18.0 and npm 11.17.0 as the documented release toolchain.
- Added ESLint 9, Tailwind CSS 4, PostCSS, PM2 configuration, and reproducible production scripts.

### Application Architecture

- Implemented the launch workflow in `app/page.tsx` with reusable accordion, slider, modal, preview, status, and sidebar components.
- Isolated fee routing and protection behavior in `app/FeeBuilderPanel.tsx`.
- Added wallet/network connection presentation through `WalletConnectionShell` and `WalletNetworkModal`.
- Added provider-aware wallet funding state in `useWalletFundingStatus.ts` and deterministic funding requirements in `walletFunding.ts`.

### Fee And Reward State

- Added typed fee-route models, preset construction, route ordering, validation, total-fee classification, and issue navigation.
- Added Rewards Basket assets for tokens, tokenized stocks, and ETFs with local optimized icon assets.
- Added deterministic 100% allocation normalization, minimum allocation handling, pinned custom weights, and reconciliation when selections change.
- Added rotating and all-at-once distribution models, selected-only filtering, category filters, quick picks, and stable responsive toolbar sizing.
- Added distribution-trigger presets and advanced-protection state reporting to the parent launch summary.

### DEX, LBP, And Initial Buy

- Added market-cap input formatting and bounds, preset interpolation, DEX-liquidity steps, price calculation, and graduation proceeds.
- Added initial-buy supply calculations, estimated market-cap propagation, distribution parsing, and responsive full-page mobile dialogs.
- Added LBP duration presets, custom duration controls, whitelist parsing, and protection limits capped at one month.

### Validation And Safety

- Added URL validators for websites, X/Twitter, Telegram, and Discord.
- Added wallet balance requirements for plan cost, creation gas, and initial-buy funding.
- Restricted Base CDP sponsorship to token creation while retaining user-funded initial-buy checks.
- Added clear route-level errors, actionable issue navigation, warning-only fee guidance, and required-field progress reporting.

### Responsive And Interaction Work

- Added cancellable smooth-centering and expansion behavior for dynamic sections and presets.
- Added portal-based mobile helper text with viewport-aware placement.
- Added compact mobile fee-route layouts, full-width accordions, sticky launch controls, and animated applied-settings sheets.
- Added keyboard-visible focus treatments, semantic labels, pressed states, and stable control geometry.

### Release Validation

- Verified with `npm run lint`.
- Verified with `npm run build` using the production Next.js compiler.
- Generated output, dependencies, local logs, environment files, release archives, and reference deck material remain excluded from source control.
