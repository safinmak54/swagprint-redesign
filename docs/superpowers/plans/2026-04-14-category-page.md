# Category Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean, minimal category page (`category.html`) for SwagPrint that matches the redesigned home page's visual language.

**Architecture:** Single static HTML file sharing the same Tailwind CDN config, fonts, and CSS custom classes as `code.html`. Nav and footer markup duplicated from the home page. All interactivity (filters, sort, infinite scroll) is client-side JS operating on pre-rendered DOM elements.

**Tech Stack:** HTML, Tailwind CSS (CDN), vanilla JavaScript, Material Symbols (Google Fonts)

**Spec:** `docs/superpowers/specs/2026-04-14-category-page-design.md`

**Reference:** `code.html` (home page — source for nav lines 160-274, footer lines 932-1014, Tailwind config lines 7-74, CSS lines 76-114)

---

### Task 1: Scaffold page with shared head, config, and CSS

**Files:**
- Create: `category.html`
- Reference: `code.html:1-114` (head, Tailwind config, custom CSS)

- [ ] **Step 1: Create `category.html` with doctype, head, Tailwind config, and custom CSS**

Copy the `<head>` block from `code.html` (lines 1-75) including:
- Meta tags, Google Fonts links (Plus Jakarta Sans, Inter, Material Symbols)
- Tailwind CDN script with the full theme config (colors, borderRadius, fontFamily)
- All custom `<style>` rules (shadow-ambient-*, btn-primary, fade-up, etc.)

Add a new CSS rule for the loading spinner:

```css
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { width: 24px; height: 24px; border: 2px solid #c5d0ca; border-top-color: #3D5167; border-radius: 50%; animation: spin 0.6s linear infinite; }
```

Add an empty `<body class="font-body text-on-surface bg-background">` with a placeholder comment for each section.

```html
<body class="font-body text-on-surface bg-background">
<!-- NAV -->
<!-- HERO -->
<!-- FILTER BAR -->
<!-- PRODUCT GRID -->
<!-- SCROLL SENTINEL -->
<!-- FOOTER -->
<!-- SCRIPTS -->
</body>
```

- [ ] **Step 2: Verify the page loads**

Open `category.html` in a browser. Confirm: blank page, no console errors, Tailwind loaded (inspect body — font should be Inter).

- [ ] **Step 3: Commit**

```bash
git add category.html
git commit -m "feat(category): scaffold page with shared Tailwind config and CSS"
```

---

### Task 2: Add shared navigation

**Files:**
- Modify: `category.html`
- Reference: `code.html:160-274` (full header block)

- [ ] **Step 1: Copy the full `<header>` block from `code.html` (lines 160-274)**

Paste it into `category.html` replacing the `<!-- NAV -->` comment. This includes:
- Utility bar (`bg-surface-container-low`)
- Main nav with logo, mega menu dropdowns, search icon, cart icon
- Mobile menu button

No modifications needed — it's identical to the home page nav.

- [ ] **Step 2: Verify in browser**

Open `category.html`. Confirm: fixed nav appears at top, logo visible, hover on nav items shows dropdown menus, backdrop blur works.

- [ ] **Step 3: Commit**

```bash
git add category.html
git commit -m "feat(category): add shared navigation header"
```

---

### Task 3: Build the hero banner

**Files:**
- Modify: `category.html`

- [ ] **Step 1: Add the hero section**

Replace `<!-- HERO -->` with:

```html
<section class="px-4 md:px-8 lg:px-16 mt-24 mb-8">
<div class="max-w-[1400px] mx-auto">
<div class="bg-primary-container rounded-lg py-16 px-12 lg:px-16 flex flex-col lg:flex-row items-center gap-10 overflow-hidden">
  <!-- Left: Text -->
  <div class="flex-1">
    <p class="text-[10px] text-white/70 uppercase tracking-widest font-semibold mb-4">Home / Drinkware / Can Coolers</p>
    <h1 class="font-headline text-4xl lg:text-5xl font-extrabold tracking-tighter text-white mb-4">Custom Can Coolers</h1>
    <p class="text-white/80 text-lg leading-relaxed max-w-md">Keep drinks cold. Keep your brand hot. Premium koozies and can coolers, customized with your logo.</p>
  </div>
  <!-- Right: Image (hidden on mobile per spec) -->
  <div class="hidden sm:block w-full lg:w-80 h-64 lg:h-72 rounded-xl overflow-hidden shrink-0">
    <img src="https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80&fit=crop" alt="Custom Can Coolers" class="w-full h-full object-cover">
  </div>
</div>
</div>
</section>
```

- [ ] **Step 2: Verify in browser**

Confirm: dark banner with rounded corners, breadcrumb + title + tagline on left, image on right. On mobile, stacks vertically. Text is white, not mint green.

- [ ] **Step 3: Commit**

```bash
git add category.html
git commit -m "feat(category): add hero banner with split layout"
```

---

### Task 4: Build the sticky filter bar

**Files:**
- Modify: `category.html`

- [ ] **Step 1: Add the filter bar section**

Replace `<!-- FILTER BAR -->` with:

```html
<div id="filter-bar" class="sticky top-[60px] z-40 bg-white/80 backdrop-blur-md border-b border-outline-variant/30 py-4 px-4 md:px-8 lg:px-16 transition-shadow">
<div class="max-w-[1400px] mx-auto">
  <!-- Main filter row -->
  <div class="flex items-center gap-3 overflow-x-auto scrollbar-hide">
    <button class="filter-chip active shrink-0 rounded-full px-4 py-2 text-sm font-semibold bg-primary text-white transition-all" data-filter="all">All</button>
    <button class="filter-chip shrink-0 rounded-full px-4 py-2 text-sm font-semibold bg-white border border-outline-variant text-on-surface-variant hover:border-primary transition-all" data-filter="collapsible">Collapsible</button>
    <button class="filter-chip shrink-0 rounded-full px-4 py-2 text-sm font-semibold bg-white border border-outline-variant text-on-surface-variant hover:border-primary transition-all" data-filter="neoprene">Neoprene</button>
    <button class="filter-chip shrink-0 rounded-full px-4 py-2 text-sm font-semibold bg-white border border-outline-variant text-on-surface-variant hover:border-primary transition-all" data-filter="foam">Foam</button>
    <button class="filter-chip shrink-0 rounded-full px-4 py-2 text-sm font-semibold bg-white border border-outline-variant text-on-surface-variant hover:border-primary transition-all" data-filter="slim">Slim Can</button>
    <!-- More Filters -->
    <div class="relative shrink-0">
      <button id="more-filters-btn" class="rounded-full px-4 py-2 text-sm font-semibold bg-white border border-outline-variant text-on-surface-variant hover:border-primary transition-all flex items-center gap-1.5">
        <span class="material-symbols-outlined text-base">tune</span>
        More Filters
      </button>
      <!-- Desktop dropdown panel (hidden by default) -->
      <div id="more-filters-panel" class="hidden absolute top-full left-0 mt-2 bg-white rounded-lg shadow-ambient-lg p-6 w-72 z-50 sm:block">
        <h4 class="font-bold text-sm mb-3">Brand</h4>
        <div class="flex flex-wrap gap-2 mb-4">
          <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> Koozie</label>
          <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> BritePix</label>
        </div>
        <h4 class="font-bold text-sm mb-3">Price Range</h4>
        <div class="flex items-center gap-2 mb-4">
          <input type="number" placeholder="Min" class="w-20 rounded border-outline-variant text-sm px-2 py-1">
          <span class="text-secondary">—</span>
          <input type="number" placeholder="Max" class="w-20 rounded border-outline-variant text-sm px-2 py-1">
        </div>
        <h4 class="font-bold text-sm mb-3">Colors</h4>
        <div class="flex flex-wrap gap-2 mb-4">
          <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> 1-10</label>
          <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> 11-50</label>
          <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> 50+</label>
          <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> Full Color</label>
        </div>
        <h4 class="font-bold text-sm mb-3">Material</h4>
        <div class="flex flex-wrap gap-2 mb-4">
          <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> Neoprene</label>
          <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> Foam</label>
          <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> Polyester</label>
        </div>
        <button class="btn-primary bg-primary text-white rounded-full px-4 py-2 text-sm font-bold w-full">Apply Filters</button>
      </div>
      <!-- Mobile slide-up panel (hidden by default) -->
      <div id="mobile-filters-panel" class="hidden fixed inset-0 z-50 sm:hidden">
        <div class="absolute inset-0 bg-black/40" onclick="closeMobileFilters()"></div>
        <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg p-6 max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-headline text-lg font-bold">Filters</h3>
            <button onclick="closeMobileFilters()" class="text-secondary hover:text-on-surface"><span class="material-symbols-outlined">close</span></button>
          </div>
          <h4 class="font-bold text-sm mb-3">Brand</h4>
          <div class="flex flex-wrap gap-2 mb-4">
            <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> Koozie</label>
            <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> BritePix</label>
          </div>
          <h4 class="font-bold text-sm mb-3">Price Range</h4>
          <div class="flex items-center gap-2 mb-4">
            <input type="number" placeholder="Min" class="w-20 rounded border-outline-variant text-sm px-2 py-1">
            <span class="text-secondary">—</span>
            <input type="number" placeholder="Max" class="w-20 rounded border-outline-variant text-sm px-2 py-1">
          </div>
          <h4 class="font-bold text-sm mb-3">Colors</h4>
          <div class="flex flex-wrap gap-2 mb-4">
            <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> 1-10</label>
            <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> 11-50</label>
            <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> 50+</label>
            <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> Full Color</label>
          </div>
          <h4 class="font-bold text-sm mb-3">Material</h4>
          <div class="flex flex-wrap gap-2 mb-4">
            <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> Neoprene</label>
            <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> Foam</label>
            <label class="flex items-center gap-1.5 text-sm"><input type="checkbox" class="rounded border-outline-variant"> Polyester</label>
          </div>
          <button class="btn-primary bg-primary text-white rounded-full px-4 py-2 text-sm font-bold w-full" onclick="closeMobileFilters()">Apply Filters</button>
        </div>
      </div>
    </div>
    <!-- Spacer + Right side -->
    <div class="ml-auto flex items-center gap-4 shrink-0">
      <span id="product-count" class="text-secondary text-sm">48 products</span>
      <select id="sort-select" class="text-sm font-semibold bg-transparent border-0 focus:ring-0 cursor-pointer text-on-surface-variant pr-6">
        <option>Best Sellers</option>
        <option>Price: Low-High</option>
        <option>Price: High-Low</option>
        <option>Newest</option>
        <option>Best Reviewed</option>
      </select>
    </div>
  </div>
  <!-- Active filter chips row (hidden when empty) -->
  <div id="active-filters" class="hidden flex items-center gap-2 mt-3 flex-wrap">
    <!-- Populated by JS -->
  </div>
</div>
</div>
```

- [ ] **Step 2: Add CSS for hiding scrollbar on filter chips (horizontal scroll on mobile)**

In the `<style>` block, add:

```css
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
```

- [ ] **Step 3: Verify in browser**

Confirm: filter bar appears below hero, chips are clickable, "More Filters" button is visible. Scroll down — bar sticks below the nav. On narrow viewport, chips scroll horizontally.

- [ ] **Step 4: Commit**

```bash
git add category.html
git commit -m "feat(category): add sticky filter bar with chip toggles and dropdown"
```

---

### Task 5: Build the product grid with cards

**Files:**
- Modify: `category.html`

- [ ] **Step 1: Add the product grid container and first batch of 12 cards**

Replace `<!-- PRODUCT GRID -->` with a grid container holding 24 product cards in 2 batches. Each card follows this structure (vary the product names, prices, ratings, and badges across cards):

```html
<section class="px-4 md:px-8 lg:px-16 py-8">
<div id="product-grid" class="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

<!-- Batch 1 (visible) -->
<div class="product-batch" data-batch="1">
<!-- Repeat this card structure 12 times with varied data -->
<a href="#" class="group block" data-category="collapsible">
  <div class="aspect-[4/5] bg-[#f5f5f7] rounded-lg overflow-hidden mb-6 relative">
    <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80&fit=crop" alt="Premium Collapsible Koozie" class="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500">
    <div class="absolute top-4 left-4">
      <span class="bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Best Seller</span>
    </div>
    <div class="absolute bottom-4 inset-x-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <span class="bg-primary text-white rounded-full py-2 px-6 text-sm font-bold">Customize Now</span>
    </div>
  </div>
  <h4 class="font-bold text-on-surface mb-1 truncate">Premium Collapsible Koozie</h4>
  <div class="flex items-center gap-1 mb-1">
    <div class="flex text-[#FFB300]">
      <span class="material-symbols-outlined fill-1 text-sm">star</span>
      <span class="material-symbols-outlined fill-1 text-sm">star</span>
      <span class="material-symbols-outlined fill-1 text-sm">star</span>
      <span class="material-symbols-outlined fill-1 text-sm">star</span>
      <span class="material-symbols-outlined fill-1 text-sm">star</span>
    </div>
    <span class="text-[11px] text-secondary">(127)</span>
  </div>
  <p class="text-[11px] text-secondary mb-2 uppercase font-semibold">Min 25 · 104 Colors</p>
  <p class="text-primary font-bold">From $1.29 <span class="text-secondary text-xs font-normal">/ea</span></p>
</a>
</div>
<!-- END card -->
</div>

<!-- Batch 2 (hidden, revealed by infinite scroll) -->
<div class="product-batch hidden" data-batch="2">
<!-- 12 more cards with same structure, different product data -->
</div>

</div>
</section>
```

Create 12 varied product cards for batch 1 and 12 for batch 2. Vary:
- Product names: "Premium Collapsible Koozie", "Neoprene Can Cooler", "Full Color Foam Koozie", "Slim Can Cooler", "BritePix Can Cooler", "Basic Foam Koozie", "Zippered Bottle Cooler", "Waterproof Can Cooler", "Eco Recycled Koozie", "Glitter Can Cooler", "Camo Print Cooler", "Metallic Koozie"
- Categories: `collapsible`, `neoprene`, `foam`, `slim` (use `data-category` attribute)
- Prices: range from $0.89 to $4.99
- Min quantities: 25, 50, 100
- Color counts: 8, 12, 24, 48, 104, "Full Color"
- Star ratings: 3-5 stars (vary filled vs unfilled stars)
- Review counts: range from 12 to 200+
- Badges: only on ~3 cards ("Best Seller", "Trending", "New")
- Images: use different Unsplash URLs for each card

- [ ] **Step 2: Verify in browser**

Confirm: 3-column grid on desktop, 2 on tablet, 1 on mobile. Cards show image with hover zoom + "Customize Now" fade-in, product name, stars, meta line, price. Only batch 1 is visible (12 cards). Batch 2 is hidden.

- [ ] **Step 3: Commit**

```bash
git add category.html
git commit -m "feat(category): add product grid with 24 cards in 2 batches"
```

---

### Task 6: Add infinite scroll, filter, and sort JavaScript

**Files:**
- Modify: `category.html`

- [ ] **Step 1: Add the scroll sentinel and loading indicator**

Replace `<!-- SCROLL SENTINEL -->` with:

```html
<!-- Loading indicator -->
<div id="load-indicator" class="hidden flex flex-col items-center gap-3 py-8">
  <div class="spinner"></div>
  <p class="text-secondary text-sm">Loading more products...</p>
</div>
<!-- End message -->
<p id="end-message" class="hidden text-secondary text-sm text-center py-8">You've seen all <span id="total-count">48</span> products</p>
<!-- Empty state -->
<div id="empty-state" class="hidden text-center py-20">
  <span class="material-symbols-outlined text-6xl text-outline mb-4">search_off</span>
  <h3 class="font-headline text-xl font-bold mb-2">No products match your filters</h3>
  <p class="text-secondary text-sm mb-6">Try adjusting your filters or browse all products</p>
  <button id="clear-filters-btn" class="btn-primary bg-primary text-white rounded-full py-3 px-8 text-sm font-bold">Clear All Filters</button>
</div>
<!-- Intersection Observer sentinel -->
<div id="scroll-sentinel" class="h-1"></div>
```

- [ ] **Step 2: Add the JavaScript block before `</body>`**

Replace `<!-- SCRIPTS -->` with a `<script>` tag containing:

**Filter chip toggling:**
```javascript
const filterChips = document.querySelectorAll('.filter-chip');
const productCards = document.querySelectorAll('[data-category]');
const productCount = document.getElementById('product-count');
const activeFiltersRow = document.getElementById('active-filters');
const emptyState = document.getElementById('empty-state');
const clearFiltersBtn = document.getElementById('clear-filters-btn');
let currentFilter = 'all';

filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    filterChips.forEach(c => {
      c.classList.remove('active', 'bg-primary', 'text-white');
      c.classList.add('bg-white', 'border', 'border-outline-variant', 'text-on-surface-variant');
    });
    chip.classList.add('active', 'bg-primary', 'text-white');
    chip.classList.remove('bg-white', 'border', 'border-outline-variant', 'text-on-surface-variant');
    currentFilter = chip.dataset.filter;
    applyFilters();
  });
});

function applyFilters() {
  let visibleCount = 0;
  productCards.forEach(card => {
    const match = currentFilter === 'all' || card.dataset.category === currentFilter;
    card.style.display = match ? '' : 'none';
    if (match) visibleCount++;
  });
  productCount.textContent = visibleCount + ' products';
  emptyState.classList.toggle('hidden', visibleCount > 0);
  document.getElementById('product-grid').classList.toggle('hidden', visibleCount === 0);

  // Active filter chips
  if (currentFilter !== 'all') {
    activeFiltersRow.classList.remove('hidden');
    activeFiltersRow.innerHTML = `<span class="bg-surface-container rounded-full text-sm px-3 py-1 flex items-center gap-1">${currentFilter}<button onclick="resetFilter()" class="ml-1 text-secondary hover:text-on-surface">&times;</button></span>`;
  } else {
    activeFiltersRow.classList.add('hidden');
    activeFiltersRow.innerHTML = '';
  }
}

function resetFilter() {
  filterChips[0].click();
}
if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', resetFilter);
```

**More Filters panel toggle (desktop dropdown + mobile slide-up):**
```javascript
const moreFiltersBtn = document.getElementById('more-filters-btn');
const moreFiltersPanel = document.getElementById('more-filters-panel');
const mobileFiltersPanel = document.getElementById('mobile-filters-panel');

moreFiltersBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  // On mobile (< 640px), show slide-up panel; on desktop, show dropdown
  if (window.innerWidth < 640) {
    mobileFiltersPanel.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } else {
    moreFiltersPanel.classList.toggle('hidden');
  }
});
document.addEventListener('click', () => moreFiltersPanel.classList.add('hidden'));
moreFiltersPanel.addEventListener('click', (e) => e.stopPropagation());

function closeMobileFilters() {
  mobileFiltersPanel.classList.add('hidden');
  document.body.style.overflow = '';
}
```

**Sort dropdown (re-orders DOM with fade transition):**
```javascript
const sortSelect = document.getElementById('sort-select');
sortSelect.addEventListener('change', () => {
  const grid = document.getElementById('product-grid');
  const cards = [...grid.querySelectorAll('[data-category]')];
  // Fade out
  grid.style.opacity = '0';
  grid.style.transition = 'opacity 0.2s ease';
  setTimeout(() => {
    cards.sort((a, b) => {
      const priceA = parseFloat(a.querySelector('.text-primary').textContent.replace(/[^0-9.]/g, ''));
      const priceB = parseFloat(b.querySelector('.text-primary').textContent.replace(/[^0-9.]/g, ''));
      if (sortSelect.value === 'Price: Low-High') return priceA - priceB;
      if (sortSelect.value === 'Price: High-Low') return priceB - priceA;
      return 0;
    });
    cards.forEach(card => grid.appendChild(card));
    // Fade back in
    grid.style.opacity = '1';
  }, 200);
});
```

**Simulated infinite scroll:**
```javascript
const batches = document.querySelectorAll('.product-batch');
let currentBatch = 0;
const loadIndicator = document.getElementById('load-indicator');
const endMessage = document.getElementById('end-message');
const sentinel = document.getElementById('scroll-sentinel');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentBatch++;
      if (currentBatch < batches.length) {
        loadIndicator.classList.remove('hidden');
        setTimeout(() => {
          batches[currentBatch].classList.remove('hidden');
          batches[currentBatch].querySelectorAll('a').forEach((card, i) => {
            card.classList.add('fade-up');
            card.style.transitionDelay = (i * 0.05) + 's';
            requestAnimationFrame(() => card.classList.add('visible'));
          });
          loadIndicator.classList.add('hidden');
          if (currentBatch >= batches.length - 1) {
            endMessage.classList.remove('hidden');
            observer.disconnect();
          }
        }, 600);
      }
    }
  });
}, { rootMargin: '200px' });

observer.observe(sentinel);
```

**Fade-up animation trigger for initial cards (same as home page):**
```javascript
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));
```

- [ ] **Step 3: Verify all interactions in browser**

Test checklist:
1. Click filter chips — grid filters, product count updates, active chip row appears
2. Click "x" on active filter — resets to "All"
3. Click "More Filters" — dropdown panel opens/closes
4. Change sort dropdown — cards re-order by price
5. Scroll to bottom — spinner appears briefly, batch 2 fades in
6. After all batches loaded — "You've seen all 48 products" appears
7. Select a filter that matches no cards — empty state shows with "Clear All Filters" button

- [ ] **Step 4: Commit**

```bash
git add category.html
git commit -m "feat(category): add filter, sort, and infinite scroll JS"
```

---

### Task 7: Add shared footer

**Files:**
- Modify: `category.html`
- Reference: `code.html:932-1014` (full footer block)

- [ ] **Step 1: Copy the full `<footer>` block from `code.html` (lines 932-1014)**

Paste it at the end of the body, before the `<script>` block. This includes:
- Brand column (logo, description, social links)
- Link columns (Shop, Company, Support)
- Bottom bar (copyright, payment icons, legal links)

No modifications needed.

- [ ] **Step 2: Verify in browser**

Confirm: footer appears at bottom, matches home page footer exactly. Links and social icons render correctly.

- [ ] **Step 3: Commit**

```bash
git add category.html
git commit -m "feat(category): add shared footer"
```

---

### Task 8: Responsive polish and final QA

**Files:**
- Modify: `category.html`

- [ ] **Step 1: Test and fix responsive behavior**

Verify at each breakpoint:
- **Desktop (lg+, 1024px+)**: 3-column grid, split hero (text left, image right), full filter bar
- **Tablet (sm-lg, 640-1023px)**: 2-column grid, hero stacks (image below text), filter chips scroll horizontally
- **Mobile (< 640px)**: 1-column grid, compact hero (image hidden on very small screens via `hidden lg:block` or similar), filter chips horizontal scroll

Fix any layout issues (overflow, text wrapping, spacing).

- [ ] **Step 2: Add fade-up classes to hero and initial grid cards**

Add `fade-up` class to:
- The hero banner `<div>` inside the section
- Each product card `<a>` in batch 1

This enables the scroll-triggered entrance animation from the home page CSS.

- [ ] **Step 3: Final visual QA**

Walk through the full page:
1. Nav loads and is fixed
2. Hero banner is visually clean with dark bg, white text, rounded corners
3. Filter bar sticks on scroll (not overlapping nav)
4. Product cards look identical in style to home page "Most Popular" cards
5. Hover effects work (image zoom, "Customize Now" overlay)
6. Star ratings render in gold
7. Infinite scroll loads batch 2 smoothly
8. Footer matches home page
9. No console errors

- [ ] **Step 4: Commit**

```bash
git add category.html
git commit -m "feat(category): responsive polish and fade-up animations"
```
