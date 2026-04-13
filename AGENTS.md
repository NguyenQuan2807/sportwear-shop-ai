# AGENTS.md

## Project overview
This repository is a full-stack sportwear e-commerce project.

- Backend: Spring Boot, MySQL, JWT, JPA
- Frontend: React, Vite, Tailwind, Axios

## Important repository context
- Frontend folder: `frontend`
- Backend folder: `backend/sportwearshop`
- Keep the existing project structure unless there is a strong reason to refactor.
- Prefer improvements that fit the current stack and code conventions.
- Do not introduce large new dependencies unless necessary.
- Explain all important changes clearly.

## UI/UX direction
The desired UI direction is:
- modern, premium, clean, responsive
- dark aesthetic inspired by Nike homepage
- homepage should feel minimal and high-end, not crowded
- clear visual hierarchy
- strong mobile responsiveness
- keep the site looking like a real production e-commerce site

## Specific design preferences
- Header layout:
  - logo at far left
  - menu perfectly centered
  - right-side actions aligned to the far right
  - search bar shorter
  - wishlist, cart, user icons grouped tightly
  - cart badge must be red when cart has items
  - user button should open dropdown with logout; if admin, also show admin link
- Main menu:
  - Nam, Nữ, Giày, Quần Áo, Phụ kiện, Sale
  - remove “Tất cả sản phẩm”
  - hover menus should be clean and modern
- Homepage:
  - dark premium style
  - full-screen hero video area with CTA button
  - sport rail / slider with square images and labels below
  - large image blocks below
  - sections should be nearly full-width with minimal side padding
  - promotion area below header that rotates when multiple promotions exist
- Product cards:
  - image corners sharp
  - stable title height
  - aligned price and CTA layout
- Admin pages:
  - more modern search/filter UI
  - product variant/image management should feel smarter and more visual
  - image handling should support local uploads

## Working rules
- First understand the repo before editing.
- Before making UI changes, identify the exact files and data flows involved.
- Prefer incremental changes by feature area.
- After frontend changes, run the appropriate checks/build if available.
- When changing UI, preserve existing business logic unless a bug fix requires adjustment.
- When something is unclear, propose a plan first instead of guessing.

## Output rules
- Explain in Vietnamese.
- Keep file names, component names, API names, class names, and code identifiers in English.
- Before editing, summarize:
  1. current implementation
  2. problems
  3. proposed UI/UX improvements
  4. files to change
- After editing, list exactly what changed and what should be tested manually.