# Price-bulletin files (official only)

Put **real, official bulletin CSVs** here and load them with
`scripts/load-prices.js` (see DEPLOY-RUNBOOK §6.1 and the loader header).

Rules (platform trust rule — never broken):
1. Figures come only from official bulletins (e.g. BAMB depot bulletins)
   with the source, date and a link to the original publication.
2. Never invent, estimate or "remember" a price. If the bulletin is not
   published, the board simply shows fewer references — honesty over
   fullness, always.
3. Filename convention: `bamb-YYYY-MM-DD.csv` (issuer-date), so the file
   history is auditable.
4. The template file in this folder is a format example only — its rows
   are commented out (`#`) and will never load.

Required header (any order, exact names):
`item,unit,price,area,date,source,url`

Example row:
`white maize 50kg bag,per bag,"P190–P210",Gaborone depot,2026-09-02,BAMB (official depot bulletin),https://…`

After loading: verify on the price board page and in `/trust` (references
counter moves), then record the load in the governance log with the file
name and date.
