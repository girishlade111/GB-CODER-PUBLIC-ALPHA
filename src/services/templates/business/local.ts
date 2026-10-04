/**
 * business-local — "Local Cafe & Bakery"
 * Warm espresso-and-cream neighbourhood cafe: parallax hero with a CSS-drawn
 * cup and rising steam, hours/location cards, filterable menu, gradient-art
 * bakery grid, story split, review carousel, gallery, validated booking form.
 */
export default {
  html: `
<a class="skip-link" href="#menu">Skip to the menu</a>
<div class="crumb" role="presentation"><span class="crumb__fill" id="crumbFill"></span></div>

<header class="hdr" id="hdr">
  <div class="shell hdr__in">
    <a class="brand" href="#top">
      <span class="brand__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M4 20h16"/><path d="M6 20a6 6 0 0 1 12 0"/><path d="M12 4v3M9 9h6"/></svg></span>
      <span class="brand__name">Kestrel<em>&amp; Crumb</em></span>
    </a>
    <nav class="nav" id="primaryNav" aria-label="Primary">
      <ul class="nav__list">
        <li><a class="nav__link" href="#visit">Visit</a></li>
        <li><a class="nav__link" href="#menu">Menu</a></li>
        <li><a class="nav__link" href="#bakes">Bakes</a></li>
        <li><a class="nav__link" href="#story">Our story</a></li>
        <li><a class="nav__link" href="#reviews">Reviews</a></li>
        <li><a class="nav__link" href="#book">Book a table</a></li>
      </ul>
    </nav>
    <div class="hdr__actions">
      <a class="btn btn--solid btn--sm hdr__cta" href="#book">Reserve a table</a>
      <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="primaryNav" aria-label="Open menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon burger__open" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon burger__close" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
  </div>
</header>

<main id="top">
  <section class="hero" aria-labelledby="heroTitle">
    <div class="hero__layers" aria-hidden="true">
      <span class="layer layer--sky" data-depth="0.08"></span>
      <span class="layer layer--sun" data-depth="0.16"></span>
      <span class="layer layer--hill layer--far" data-depth="0.28"></span>
      <span class="layer layer--hill layer--near" data-depth="0.44"></span>
      <span class="layer layer--grain"></span>
    </div>

    <div class="shell hero__in">
      <div class="hero__copy">
        <p class="eyebrow"><span class="eyebrow__dot" aria-hidden="true"></span>Baking since 2014 &middot; Barnsley</p>
        <h1 class="hero__title" id="heroTitle">A small cafe with a very large oven.</h1>
        <p class="hero__lede">We mill our own coffee on Tuesdays, bake the first loaves at five in the morning, and take the whole thing seriously without taking ourselves too seriously. Sit down, or order for collection before seven.</p>
        <div class="hero__actions">
          <a class="btn btn--solid" href="#menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M4 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"/><path d="M10 21h.01M17 21h.01"/></svg>
            Order for collection
          </a>
          <a class="btn btn--cream" href="#visit">Find us &amp; opening hours</a>
        </div>
        <ul class="hero__marks">
          <li><strong>4.9</strong><span>from 612 reviews</span></li>
          <li><strong>5am</strong><span>first bake daily</span></li>
          <li><strong>6</strong><span>seats, no bookings needed</span></li>
        </ul>
      </div>

      <div class="hero__art" aria-hidden="true">
        <span class="plate"></span>
        <span class="cup">
          <span class="cup__steam"><i></i><i></i><i></i></span>
          <span class="cup__body"><span class="cup__crema"></span></span>
          <span class="cup__handle"></span>
          <span class="cup__saucer"></span>
        </span>
        <span class="bean bean--1"></span>
        <span class="bean bean--2"></span>
        <span class="bean bean--3"></span>
      </div>
    </div>
  </section>

  <section class="section visit" id="visit" aria-labelledby="visitTitle">
    <div class="shell">
      <header class="head">
        <div>
          <p class="eyebrow"><span class="eyebrow__dot" aria-hidden="true"></span>Visit us</p>
          <h2 class="head__title" id="visitTitle">Corner of Peel Street and Foundry Lane</h2>
        </div>
        <p class="head__note">Thirty-one seats inside, nine on the pavement, and a bakery hatch that opens at 7:30 every morning except Sunday.</p>
      </header>

      <div class="cards">
        <article class="card" data-reveal>
          <span class="card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>
          <h3 class="card__title">Opening hours</h3>
          <table class="hours">
            <caption class="sr-only">Weekly opening hours</caption>
            <tbody>
              <tr><th scope="row">Mon to Thu</th><td>7:00 &ndash; 16:00</td></tr>
              <tr><th scope="row">Friday</th><td>7:00 &ndash; 18:30</td></tr>
              <tr><th scope="row">Saturday</th><td>8:00 &ndash; 18:30</td></tr>
              <tr><th scope="row">Sunday</th><td>9:00 &ndash; 15:00</td></tr>
            </tbody>
          </table>
          <p class="card__note">Last kitchen orders twenty minutes before close.</p>
        </article>

        <article class="card" data-reveal style="--delay:.07s">
          <span class="card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg></span>
          <h3 class="card__title">Where to find us</h3>
          <p class="card__addr">14 Peel Street<br />Barnsley, South Yorkshire<br />S70 1RZ</p>
          <p class="card__note">Step-free entrance on Foundry Lane. Accessible toilet on the ground floor.</p>
          <button class="btn btn--outline btn--block" type="button" id="dirBtn" aria-expanded="false" aria-controls="dirPanel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            Get directions
          </button>
          <div class="dir" id="dirPanel" hidden>
            <p class="dir__row"><strong>By train</strong> Barnsley station is six minutes on foot. Leave via the Forge Mills exit, cross at the lights, and follow the queue of steam.</p>
            <p class="dir__row"><strong>By bus</strong> 201 and 209 both stop on Foundry Lane, outside the bakery hatch.</p>
            <p class="dir__row"><strong>By car</strong> Foundry Lane has twenty minutes of free parking. Peel Street is permit-only before 10am.</p>
          </div>
        </article>

        <article class="card" data-reveal style="--delay:.14s">
          <span class="card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="m12 3 1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"/></svg></span>
          <h3 class="card__title">Order ahead</h3>
          <p class="card__note">Collection from 7:30. Pre-order by 18:00 the night before for large orders, and we will have them boxed and labelled when you arrive.</p>
          <a class="btn btn--solid btn--block" href="#book">Book for a group</a>
        </article>
      </div>
    </div>
  </section>

  <section class="section section--cream" id="menu" aria-labelledby="menuTitle">
    <div class="shell">
      <header class="head">
        <div>
          <p class="eyebrow"><span class="eyebrow__dot" aria-hidden="true"></span>The menu</p>
          <h2 class="head__title" id="menuTitle">Nineteen things we make every day</h2>
        </div>
        <p class="head__note">Prices include VAT. We do not offer a three-course menu because we are a cafe, not a restaurant, and we would rather not pretend otherwise.</p>
      </header>

      <div class="tabs" role="tablist" aria-label="Menu categories" id="menuTabs">
        <button class="tab is-on" type="button" role="tab" id="tab-espresso" aria-selected="true" aria-controls="pane-menu" data-cat="espresso" tabindex="0">Espresso bar</button>
        <button class="tab" type="button" role="tab" id="tab-brew" aria-selected="false" aria-controls="pane-menu" data-cat="brew" tabindex="-1">Brew bar</button>
        <button class="tab" type="button" role="tab" id="tab-kitchen" aria-selected="false" aria-controls="pane-menu" data-cat="kitchen" tabindex="-1">Kitchen</button>
        <button class="tab" type="button" role="tab" id="tab-cold" aria-selected="false" aria-controls="pane-menu" data-cat="cold" tabindex="-1">Cold &amp; soft</button>
      </div>

      <div class="menu" id="pane-menu" role="tabpanel" aria-labelledby="tab-espresso" tabindex="0">
        <ul class="dishes" id="dishList">
          <li class="dish" data-cat="espresso">
            <div class="dish__main"><h3 class="dish__name">Flat white</h3><p class="dish__desc">Double ristretto, whole milk steamed to sixty-two degrees.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">3.40</span>
          </li>
          <li class="dish" data-cat="espresso">
            <div class="dish__main"><h3 class="dish__name">Cortado</h3><p class="dish__desc">Equal parts espresso and warm milk, in a four-ounce glass.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">2.90</span>
          </li>
          <li class="dish" data-cat="espresso">
            <div class="dish__main"><h3 class="dish__name">Long black</h3><p class="dish__desc">Hot water first, then two shots. The order that proves you know what you want.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">2.60</span>
          </li>
          <li class="dish" data-cat="espresso">
            <div class="dish__main"><h3 class="dish__name">Cardamom bun latte</h3><p class="dish__desc">Our own cardamom syrup, espresso and steamed milk. Glug optional.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">4.20</span>
          </li>
          <li class="dish" data-cat="espresso">
            <div class="dish__main"><h3 class="dish__name">Single-origin espresso</h3><p class="dish__desc">Whatever the Tuesday roast happens to be, ground to order.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">2.30</span>
          </li>

          <li class="dish" data-cat="brew">
            <div class="dish__main"><h3 class="dish__name">Batch filter</h3><p class="dish__desc">Ground coarse, brewed in four minutes, served in a carafe for two.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">3.20</span>
          </li>
          <li class="dish" data-cat="brew">
            <div class="dish__main"><h3 class="dish__name">Filter flight</h3><p class="dish__desc">Three origins across three pour-overs, with a card explaining each.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">6.50</span>
          </li>
          <li class="dish" data-cat="brew">
            <div class="dish__main"><h3 class="dish__name">Nitro cold brew</h3><p class="dish__desc">Steeped twenty hours, then nitrogen charged. No sugar, no syrup.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">4.00</span>
          </li>
          <li class="dish" data-cat="brew">
            <div class="dish__main"><h3 class="dish__name">Loose leaf chai</h3><p class="dish__desc">Assam, Assam, and a small amount of green cardamom. Simmered, not boiled.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">3.60</span>
          </li>
          <li class="dish" data-cat="brew">
            <div class="dish__main"><h3 class="dish__name">Rooibos and rose</h3><p class="dish__desc">Caffeine free, which does not make it less interesting.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">3.20</span>
          </li>

          <li class="dish" data-cat="kitchen">
            <div class="dish__main"><h3 class="dish__name">Sourdough toast</h3><p class="dish__desc">Two-day levain, cultured butter, flaked salt. Add a poached egg for two pounds.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">7.50</span>
          </li>
          <li class="dish" data-cat="kitchen">
            <div class="dish__main"><h3 class="dish__name">Leek and gruyère tart</h3><p class="dish__desc">Sweet leeks, three-year gruyère, thyme from the window box.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">8.50</span>
          </li>
          <li class="dish" data-cat="kitchen">
            <div class="dish__main"><h3 class="dish__name">Harissa baked eggs</h3><p class="dish__desc">Two eggs in a tomato and harissa stew, flatbread, yoghurt, mint.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">9.50</span>
          </li>
          <li class="dish" data-cat="kitchen">
            <div class="dish__main"><h3 class="dish__name">Smoked trout</h3><p class="dish__desc">Cured in-house, crème fraîche, dill, rye crackers.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">11.00</span>
          </li>
          <li class="dish" data-cat="kitchen">
            <div class="dish__main"><h3 class="dish__name">Buttermilk pancakes</h3><p class="dish__desc">Poached rhubarb, crème fraîche, a little maple on the side.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">8.00</span>
          </li>

          <li class="dish" data-cat="cold">
            <div class="dish__main"><h3 class="dish__name">Elderflower soda</h3><p class="dish__desc">Pressed that week, lemon, a pinch of sea salt.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">3.80</span>
          </li>
          <li class="dish" data-cat="cold">
            <div class="dish__main"><h3 class="dish__name">Espresso tonic</h3><p class="dish__desc">Fever-Tree, double espresso, poured over ice with an orange coin.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">4.40</span>
          </li>
          <li class="dish" data-cat="cold">
            <div class="dish__main"><h3 class="dish__name">Yuzu kombucha</h3><p class="dish__desc">Second ferment, brewed in the basement, faintly fizzy.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">4.20</span>
          </li>
          <li class="dish" data-cat="cold">
            <div class="dish__main"><h3 class="dish__name">Plum and bay cordial</h3><p class="dish__desc">Damson, bay leaf, and just enough sugar to make it drinkable.</p></div>
            <span class="dish__dots" aria-hidden="true"></span>
            <span class="dish__price">3.60</span>
          </li>
        </ul>
        <p class="menu__status" id="menuStatus" role="status" aria-live="polite"></p>
      </div>
    </div>
  </section>

  <section class="section bakes" id="bakes" aria-labelledby="bakesTitle">
    <div class="shell">
      <header class="head">
        <div>
          <p class="eyebrow"><span class="eyebrow__dot" aria-hidden="true"></span>The bakery</p>
          <h2 class="head__title" id="bakesTitle">Out of the oven, five to nine</h2>
        </div>
        <p class="head__note">Everything below is baked in the back room of the cafe. When a tray is gone, that is the whole list.</p>
      </header>
      <ul class="bakes__grid">
        <li class="bake" data-reveal>
          <span class="bake__art bake__art--1" role="img" aria-label="Illustration of a scored country sourdough loaf"></span>
          <div class="bake__body">
            <h3 class="bake__name">Country sourdough</h3>
            <p class="bake__desc">Twenty percent wholemeal, fifty-four hour cold ferment, blistered open crumb.</p>
            <p class="bake__price">4.80</p>
          </div>
        </li>
        <li class="bake" data-reveal style="--delay:.06s">
          <span class="bake__art bake__art--2" role="img" aria-label="Illustration of a cardamom knot pastry"></span>
          <div class="bake__body">
            <h3 class="bake__name">Cardamom knot</h3>
            <p class="bake__desc">Hand-knotted, pearl sugar, ground from whole green pods on Saturday morning.</p>
            <p class="bake__price">2.40</p>
          </div>
        </li>
        <li class="bake" data-reveal style="--delay:.12s">
          <span class="bake__art bake__art--3" role="img" aria-label="Illustration of a caramelised morning bun"></span>
          <div class="bake__body">
            <h3 class="bake__name">Morning bun, brown butter</h3>
            <p class="bake__desc">Laminated dough rolled in brown butter and demerara, baked until it crackles.</p>
            <p class="bake__price">2.80</p>
          </div>
        </li>
        <li class="bake" data-reveal style="--delay:.18s">
          <span class="bake__art bake__art--4" role="img" aria-label="Illustration of a dimpled focaccia slab"></span>
          <div class="bake__body">
            <h3 class="bake__name">Olive and rosemary focaccia</h3>
            <p class="bake__desc">Dimpled by hand, olive oil from our neighbour's grove, sea salt on top.</p>
            <p class="bake__price">5.20</p>
          </div>
        </li>
        <li class="bake" data-reveal style="--delay:.24s">
          <span class="bake__art bake__art--5" role="img" aria-label="Illustration of a dark seeded rye loaf"></span>
          <div class="bake__body">
            <h3 class="bake__name">Seeded rye</h3>
            <p class="bake__desc">Sunflower, pumpkin, linseed and caraway. Keeps for eight days, allegedly.</p>
            <p class="bake__price">5.60</p>
          </div>
        </li>
        <li class="bake" data-reveal style="--delay:.3s">
          <span class="bake__art bake__art--6" role="img" aria-label="Illustration of a tin of shortbread with lemon and thyme"></span>
          <div class="bake__body">
            <h3 class="bake__name">Lemon and thyme tin</h3>
            <p class="bake__desc">A proper shortbread, saved with lemon zest and a whisper of thyme.</p>
            <p class="bake__price">6.00</p>
          </div>
        </li>
      </ul>
    </div>
  </section>

  <section class="section section--cream" id="story" aria-labelledby="storyTitle">
    <div class="shell story">
      <div class="story__art" data-reveal>
        <span class="story__frame story__frame--back" aria-hidden="true"></span>
        <span class="story__frame story__frame--mid" aria-hidden="true"></span>
        <span class="story__frame story__frame--front">
          <span class="story__caption">The back room, 5:40am</span>
        </span>
        <span class="story__badge" aria-hidden="true"><strong>2014</strong><span>open</span></span>
      </div>
      <div class="story__copy">
        <p class="eyebrow"><span class="eyebrow__dot" aria-hidden="true"></span>Our story</p>
        <h2 class="head__title" id="storyTitle">It started with one oven and a bad lease</h2>
        <p class="story__p">Nell Ashby took the lease on 14 Peel Street in February 2014 with one secondhand deck oven, a starter she brought from her grandmother's kitchen, and savings she had been quietly adding to for four years. She baked nine loaves on the first Saturday and sold all nine before ten.</p>
        <p class="story__p">Twelve years later there are three ovens, a two-mill coffee programme, a Saturday queue that regularly reaches the corner, and a team of nineteen who have all worked here for at least two years. That last number is the one we are proudest of.</p>
        <ol class="milestones">
          <li data-reveal><span class="milestones__year">2014</span><span class="milestones__what">Nine loaves on the first Saturday, and a queue that started forming by eight.</span></li>
          <li data-reveal style="--delay:.06s"><span class="milestones__year">2018</span><span class="milestones__what">Second oven installed. We stopped selling out of sourdough by ten and started apologising for it.</span></li>
          <li data-reveal style="--delay:.12s"><span class="milestones__year">2021</span><span class="milestones__what">Started milling our own coffee on Tuesdays. Failed at roasting, gave up, never mentions it since.</span></li>
          <li data-reveal style="--delay:.18s"><span class="milestones__year">2024</span><span class="milestones__what">Foundry Lane bakery hatch opened, which is where the early collection crowd now lives.</span></li>
        </ol>
        <a class="btn btn--solid" href="#book">Come and say hello</a>
      </div>
    </div>
  </section>

  <section class="section" id="reviews" aria-labelledby="reviewsTitle">
    <div class="shell">
      <header class="head">
        <div>
          <p class="eyebrow"><span class="eyebrow__dot" aria-hidden="true"></span>Reviews</p>
          <h2 class="head__title" id="reviewsTitle">What people say to us</h2>
        </div>
        <p class="head__note">Pulled from 612 public reviews. Four of them, unedited, with the star ratings they left.</p>
      </header>

      <div class="rev" id="rev" role="group" aria-roledescription="carousel" aria-label="Customer reviews" tabindex="0">
        <div class="rev__viewport">
          <ul class="rev__track" id="revTrack">
            <li class="revslide" role="group" aria-roledescription="slide" aria-label="1 of 4">
              <figure class="revcard">
                <div class="stars" aria-label="Rated 5 out of 5">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                </div>
                <blockquote>I have been coming here four times a week for two years and I have never once been made to feel like a tourist. Nell knows my order and has started remembering my dog.</blockquote>
                <figcaption><strong>Marguerite Ashworth</strong><span>Regular since 2022 &middot; six-minute walk away</span></figcaption>
              </figure>
            </li>
            <li class="revslide" role="group" aria-roledescription="slide" aria-label="2 of 4">
              <figure class="revcard">
                <div class="stars" aria-label="Rated 5 out of 5">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                </div>
                <blockquote>Best cardamom bun in South Yorkshire and I will die on that hill. Get there before nine or you are having the ones from the afternoon tray, and you do not want those.</blockquote>
                <figcaption><strong>Declan Muir</strong><span>Weekend regular &middot; brings his own bag</span></figcaption>
              </figure>
            </li>
            <li class="revslide" role="group" aria-roledescription="slide" aria-label="3 of 4">
              <figure class="revcard">
                <div class="stars" aria-label="Rated 5 out of 5">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                </div>
                <blockquote>Booked eight of us for a birthday breakfast. They moved us to the long table without being asked, and there was a cake box at the end. Genuinely lovely people.</blockquote>
                <figcaption><strong>Sofia Kerrigan</strong><span>Booked us for May, booked us again for June</span></figcaption>
              </figure>
            </li>
            <li class="revslide" role="group" aria-roledescription="slide" aria-label="4 of 4">
              <figure class="revcard">
                <div class="stars" aria-label="Rated 4 out of 5">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                </div>
                <blockquote>Only warning: the queue at half past eight. Worth it. I took the bus from London once just for the rye and would do it again next month.</blockquote>
                <figcaption><strong>Tomas Wright</strong><span>Came from London &middot; one-off</span></figcaption>
              </figure>
            </li>
          </ul>
        </div>
        <div class="rev__controls">
          <button class="rnav" id="revPrev" type="button" aria-label="Previous review">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
          </button>
          <ul class="rev__dots" id="revDots"></ul>
          <button class="rnav" id="revNext" type="button" aria-label="Next review">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </button>
          <button class="rnav rnav--auto" id="revAuto" type="button" aria-pressed="true" aria-label="Pause automatic advance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon ic--pause" aria-hidden="true" focusable="false"><path d="M9 5v14M15 5v14"/></svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon ic--play" aria-hidden="true" focusable="false"><path d="m8 5 11 7-11 7V5Z"/></svg>
          </button>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--cream" aria-labelledby="galleryTitle">
    <div class="shell">
      <header class="head">
        <div>
          <p class="eyebrow"><span class="eyebrow__dot" aria-hidden="true"></span>From the counter</p>
          <h2 class="head__title" id="galleryTitle">This week in the room</h2>
        </div>
        <p class="head__note">Photographed on a phone by Bea, who works Fridays and has strong opinions about pastry lighting.</p>
      </header>
      <ul class="gallery">
        <li class="shot shot--1" data-reveal><span class="shot__art" role="img" aria-label="Overhead shot of a flat white on a walnut counter"></span><span class="shot__tag">Flat white, 8:02am</span></li>
        <li class="shot shot--2" data-reveal style="--delay:.05s"><span class="shot__art" role="img" aria-label="Tray of cardamom knots cooling on a rack"></span><span class="shot__tag">Saturday knots</span></li>
        <li class="shot shot--3" data-reveal style="--delay:.1s"><span class="shot__art" role="img" aria-label="Warm focaccia with rosemary on a wooden board"></span><span class="shot__tag">Focaccia, olive oil</span></li>
        <li class="shot shot--4" data-reveal style="--delay:.15s"><span class="shot__art" role="img" aria-label="Customer reading at the window seat"></span><span class="shot__tag">Window seat, Tuesday</span></li>
        <li class="shot shot--5" data-reveal style="--delay:.2s"><span class="shot__art" role="img" aria-label="Sourdough loaves cooling on a cooling rack"></span><span class="shot__tag">First bake, 5:40am</span></li>
        <li class="shot shot--6" data-reveal style="--delay:.25s"><span class="shot__art" role="img" aria-label="Two plates of the brunch dish"></span><span class="shot__tag">Harissa eggs</span></li>
        <li class="shot shot--7" data-reveal style="--delay:.3s"><span class="shot__art" role="img" aria-label="Pavement seating in the sun"></span><span class="shot__tag">The nine outdoor seats</span></li>
        <li class="shot shot--8" data-reveal style="--delay:.35s"><span class="shot__art" role="img" aria-label="Dusting icing sugar over a shortbread tin"></span><span class="shot__tag">Bea, on a Saturday</span></li>
      </ul>
    </div>
  </section>

  <section class="section book" id="book" aria-labelledby="bookTitle">
    <div class="shell book__in">
      <div class="book__pitch">
        <p class="eyebrow eyebrow--light"><span class="eyebrow__dot" aria-hidden="true"></span>Groups and long tables</p>
        <h2 class="book__title" id="bookTitle">Book the long table</h2>
        <p class="book__copy">We hold the six-seat table at the back for groups of six or more, and we will happily cook a set menu that changes with whatever the market gave us that week. There is no charge to book and no deposit.</p>
        <ul class="book__pts">
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg> Groups of six to fourteen people</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg> Tuesday to Saturday, from 9am</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg> We reply by phone within one working day</li>
        </ul>
        <p class="book__contact">Prefer to just ring? <a href="#book">01226 440 118</a> &middot; ask for Bea.</p>
      </div>

      <form class="book__form" id="bookForm" novalidate>
        <div class="field-row">
          <div class="field">
            <label class="field__label" for="bName">Name <span class="req">*</span></label>
            <input class="input" id="bName" name="name" type="text" autocomplete="name" placeholder="Rosa Hemingway" aria-describedby="bNameMsg" />
            <p class="field__msg" id="bNameMsg" role="alert"></p>
          </div>
          <div class="field">
            <label class="field__label" for="bPhone">Phone <span class="req">*</span></label>
            <input class="input" id="bPhone" name="phone" type="tel" autocomplete="tel" placeholder="07700 900412" aria-describedby="bPhoneMsg" />
            <p class="field__msg" id="bPhoneMsg" role="alert"></p>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="bEmail">Email <span class="req">*</span></label>
          <input class="input" id="bEmail" name="email" type="email" autocomplete="email" placeholder="rosa@example.com" aria-describedby="bEmailMsg" />
          <p class="field__msg" id="bEmailMsg" role="alert"></p>
        </div>
        <div class="field-row">
          <div class="field">
            <label class="field__label" for="bDate">Date <span class="req">*</span></label>
            <input class="input" id="bDate" name="date" type="date" aria-describedby="bDateMsg" />
            <p class="field__msg" id="bDateMsg" role="alert"></p>
          </div>
          <div class="field">
            <label class="field__label" for="bTime">Preferred time <span class="req">*</span></label>
            <select class="input input--select" id="bTime" name="time" aria-describedby="bTimeMsg">
              <option value="">Choose a slot</option>
              <option value="09:00">09:00 &ndash; morning</option>
              <option value="10:30">10:30 &ndash; late morning</option>
              <option value="12:00">12:00 &ndash; midday</option>
              <option value="14:00">14:00 &ndash; afternoon</option>
              <option value="16:30">16:30 &ndash; late afternoon</option>
            </select>
            <p class="field__msg" id="bTimeMsg" role="alert"></p>
          </div>
          <div class="field">
            <label class="field__label" for="bSize">People <span class="req">*</span></label>
            <select class="input input--select" id="bSize" name="size" aria-describedby="bSizeMsg">
              <option value="">How many?</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="10">10</option>
              <option value="12">12</option>
              <option value="14">14</option>
            </select>
            <p class="field__msg" id="bSizeMsg" role="alert"></p>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="bNotes">Anything we should know?</label>
          <textarea class="input input--area" id="bNotes" name="notes" rows="4" placeholder="Two coeliacs, one birthday cake to collect at four, and a toddler who will eat anything you put in front of her." aria-describedby="bNotesCount"></textarea>
          <p class="field__foot"><span class="field__msg"></span><span class="field__count" id="bNotesCount">0 / 400</span></p>
        </div>
        <label class="check">
          <input type="checkbox" id="bTerms" />
          <span class="check__box" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg></span>
          <span class="check__text">I understand bookings are confirmed by phone, not by email.</span>
        </label>
        <p class="field__msg" id="bTermsMsg" role="alert"></p>
        <button class="btn btn--cream btn--block" type="submit">Request the long table</button>
        <p class="form-status" id="bookStatus" role="status" aria-live="polite"></p>
        <div class="sent" id="bookSent" hidden>
          <span class="sent__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="m8.3 12.3 2.5 2.5 4.9-5.2"/></svg></span>
          <div>
            <p class="sent__t">Request received</p>
            <p class="sent__m" id="bookSentMsg">Bea will ring you within one working day.</p>
          </div>
        </div>
      </form>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="shell">
    <div class="foot__top">
      <div class="foot__col foot__col--hours">
        <h2 class="foot__title">Opening hours</h2>
        <table class="hours hours--foot">
          <caption class="sr-only">Opening hours in full</caption>
          <tbody>
            <tr><th scope="row">Monday</th><td>7:00 &ndash; 16:00</td></tr>
            <tr><th scope="row">Tuesday</th><td>7:00 &ndash; 16:00</td></tr>
            <tr><th scope="row">Wednesday</th><td>7:00 &ndash; 16:00</td></tr>
            <tr><th scope="row">Thursday</th><td>7:00 &ndash; 16:00</td></tr>
            <tr><th scope="row">Friday</th><td>7:00 &ndash; 18:30</td></tr>
            <tr><th scope="row">Saturday</th><td>8:00 &ndash; 18:30</td></tr>
            <tr><th scope="row">Sunday</th><td>9:00 &ndash; 15:00</td></tr>
          </tbody>
        </table>
        <p class="foot__note">Closed Christmas Day and Boxing Day. Open New Year's Day from nine.</p>
      </div>

      <div class="foot__col foot__col--map">
        <h2 class="foot__title">Find us</h2>
        <div class="map" role="img" aria-label="Map placeholder showing the cafe on Peel Street at Foundry Lane, Barnsley">
          <span class="map__road map__road--1" aria-hidden="true"></span>
          <span class="map__road map__road--2" aria-hidden="true"></span>
          <span class="map__river" aria-hidden="true"></span>
          <span class="map__pin" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>
          </span>
          <p class="map__label">14 Peel Street, Barnsley S70 1RZ</p>
        </div>
      </div>

      <nav class="foot__col" aria-label="Menu">
        <h2 class="foot__title">Menu</h2>
        <ul>
          <li><a href="#menu">Espresso bar</a></li>
          <li><a href="#menu">Brew bar</a></li>
          <li><a href="#menu">Kitchen</a></li>
          <li><a href="#menu">Cold &amp; soft</a></li>
          <li><a href="#bakes">The bakery</a></li>
        </ul>
      </nav>

      <nav class="foot__col" aria-label="Visit">
        <h2 class="foot__title">Visit</h2>
        <ul>
          <li><a href="#visit">Opening hours</a></li>
          <li><a href="#visit">Directions</a></li>
          <li><a href="#visit">Accessibility</a></li>
          <li><a href="#book">Book the long table</a></li>
          <li><a href="#visit">Collection</a></li>
        </ul>
      </nav>

      <nav class="foot__col" aria-label="The cafe">
        <h2 class="foot__title">The cafe</h2>
        <ul>
          <li><a href="#story">Our story</a></li>
          <li><a href="#story">Sourcing</a></li>
          <li><a href="#reviews">Reviews</a></li>
          <li><a href="#book">Work with us</a></li>
          <li><a href="#book">Wholesale</a></li>
        </ul>
      </nav>

      <div class="foot__col foot__col--wide">
        <h2 class="foot__title">The Tuesday note</h2>
        <p class="foot__note">One email a week: what came out of the oven, what we are cupping, and which Tuesday is quiet.</p>
        <form class="nl" id="nlForm" novalidate>
          <label class="sr-only" for="nlEmail">Email address</label>
          <input class="nl__input" id="nlEmail" name="email" type="email" placeholder="you@example.com" autocomplete="email" aria-describedby="nlMsg" />
          <button class="btn btn--cream btn--sm" type="submit">Subscribe</button>
          <p class="field__msg" id="nlMsg" role="status" aria-live="polite"></p>
        </form>
        <ul class="socials" aria-label="Social links">
          <li><a href="#top" aria-label="Kestrel and Crumb on Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r=".9" fill="currentColor" stroke="none"/></svg></a></li>
          <li><a href="#top" aria-label="Kestrel and Crumb on X"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M4 4l16 16M20 4 4 20"/></svg></a></li>
          <li><a href="#top" aria-label="Kestrel and Crumb on Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M14 8h3V5h-3a4 4 0 0 0-4 4v2H8v3h2v7h3v-7h2.5l.5-3h-3V9a1 1 0 0 1 1-1Z"/></svg></a></li>
        </ul>
      </div>
    </div>
    <div class="foot__legal">
      <p>&copy; 2026 Kestrel &amp; Crumb Ltd. Registered in England, number 0961 4472.</p>
      <p>Barnsley &middot; vat number 214 778 003</p>
    </div>
  </div>
</footer>
`,
  css: `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Karla:wght@400;500;600;700&display=swap');

:root {
  --cream: #fbf6ee;
  --cream-2: #f4ebdc;
  --paper: #ffffff;
  --ink: #2b1a10;
  --ink-2: #4a3225;
  --muted: #7c6553;
  --espresso: #33201a;
  --coffee: #55372a;
  --caramel: #b3703a;
  --caramel-hi: #d99551;
  --crust: #8a4f22;
  --line: #e8dbc9;
  --line-2: #d7c3a9;
  --on-dark: #f7efe2;
  --radius-sm: 8px;
  --radius: 12px;
  --radius-lg: 20px;
  --shadow-sm: 0 1px 2px rgba(43,26,16,.07), 0 1px 1px rgba(43,26,16,.04);
  --shadow: 0 12px 28px -16px rgba(43,26,16,.35), 0 2px 6px rgba(43,26,16,.06);
  --shadow-lg: 0 34px 64px -32px rgba(43,26,16,.45), 0 10px 22px rgba(43,26,16,.09);
  --font-display: 'Playfair Display', 'Iowan Old Style', Georgia, serif;
  --font-body: 'Karla', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --ease: cubic-bezier(.22, .68, 0, 1);
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-padding-top: 86px; }
body {
  margin: 0; padding: 0;
  background: var(--cream); color: var(--ink);
  font-family: var(--font-body); font-size: 16px; line-height: 1.65;
  -webkit-font-smoothing: antialiased; overflow-x: hidden;
}
h1, h2, h3 { font-family: var(--font-display); margin: 0; line-height: 1.14; letter-spacing: -.015em; font-weight: 700; }
p { margin: 0; }
ul, ol, dl, dd { margin: 0; padding: 0; list-style: none; }
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; }
table { border-collapse: collapse; width: 100%; }
textarea { font: inherit; resize: vertical; }
:focus-visible { outline: 2px solid var(--caramel); outline-offset: 3px; border-radius: 5px; }
.shell { width: 100%; max-width: 1240px; margin-inline: auto; padding-inline: clamp(1rem, 4vw, 2.5rem); }
.icon { width: 1.12em; height: 1.12em; flex: none; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

.skip-link {
  position: fixed; top: 8px; left: 8px; z-index: 300; transform: translateY(-180%);
  background: var(--espresso); color: var(--on-dark); padding: .6rem 1rem; font-weight: 700;
  border-radius: var(--radius-sm); transition: transform .2s var(--ease);
}
.skip-link:focus { transform: translateY(0); }
.crumb { position: fixed; inset: 0 0 auto 0; height: 3px; z-index: 95; background: var(--line); pointer-events: none; }
.crumb__fill { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, var(--crust), var(--caramel-hi)); transition: width .1s linear; }

/* ------------------------------------------------------------------ header */
.hdr {
  position: sticky; top: 0; z-index: 80;
  background: rgba(251,246,238,.86); backdrop-filter: blur(14px) saturate(1.2);
  border-bottom: 1px solid transparent;
  transition: border-color .25s var(--ease), box-shadow .25s var(--ease), background .25s var(--ease);
}
.hdr.is-stuck { border-bottom-color: var(--line); box-shadow: 0 12px 30px -24px rgba(43,26,16,.6); background: rgba(251,246,238,.95); }
.hdr__in { display: flex; align-items: center; gap: clamp(.75rem, 2vw, 1.6rem); min-height: 72px; }
.brand { display: inline-flex; align-items: center; gap: .55rem; flex: none; }
.brand__mark { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: var(--espresso); color: var(--caramel-hi); }
.brand__mark .icon { width: 20px; height: 20px; }
.brand__name { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.brand__name em { font-style: italic; color: var(--caramel); }
.nav { margin-left: auto; }
.nav__list { display: flex; align-items: center; gap: clamp(.5rem, 1.6vw, 1.3rem); }
.nav__link { position: relative; display: inline-block; padding: .35rem 0; font-size: .86rem; font-weight: 600; color: var(--ink-2); transition: color .2s var(--ease); }
.nav__link::after { content: ''; position: absolute; left: 0; bottom: 0; height: 2px; width: 100%; background: var(--caramel); transform: scaleX(0); transform-origin: left; transition: transform .28s var(--ease); }
.nav__link:hover, .nav__link:focus-visible { color: var(--caramel); }
.nav__link:hover::after, .nav__link:focus-visible::after { transform: scaleX(1); }
.hdr__actions { display: flex; align-items: center; gap: .5rem; }

.btn {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  padding: .8rem 1.35rem; font-size: .88rem; font-weight: 700;
  border: 1px solid transparent; border-radius: 999px; cursor: pointer; white-space: nowrap;
  transition: transform .16s var(--ease), background .2s var(--ease), color .2s var(--ease), border-color .2s var(--ease), box-shadow .2s var(--ease);
}
.btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 26%, rgba(255,255,255,.26) 48%, transparent 72%); transform: translateX(-130%); transition: transform .6s var(--ease); }
.btn:hover::after { transform: translateX(130%); }
.btn:hover { transform: translateY(-2px); }
.btn:active { transform: translateY(0); }
.btn--sm { padding: .55rem 1rem; font-size: .8rem; }
.btn--block { width: 100%; }
.btn--solid { background: var(--espresso); color: var(--on-dark); box-shadow: var(--shadow-sm); }
.btn--solid:hover { background: var(--crust); box-shadow: var(--shadow); }
.btn--cream { background: var(--caramel-hi); color: var(--espresso); }
.btn--cream:hover { background: var(--on-dark); color: var(--espresso); }
.btn--outline { background: transparent; border-color: var(--line-2); color: var(--ink); }
.btn--outline:hover { border-color: var(--caramel); color: var(--caramel); background: var(--cream-2); }
.btn--outline::after { display: none; }

.burger { display: none; place-items: center; width: 40px; height: 40px; background: var(--paper); border: 1px solid var(--line-2); border-radius: 10px; cursor: pointer; }
.burger .icon { width: 19px; height: 19px; grid-area: 1 / 1; }
.burger__close { opacity: 0; transform: scale(.7); transition: opacity .18s var(--ease), transform .18s var(--ease); }
.burger[aria-expanded='true'] .burger__open { opacity: 0; transform: scale(.7); }
.burger[aria-expanded='true'] .burger__close { opacity: 1; transform: scale(1); }

/* -------------------------------------------------------------------- hero */
.hero { position: relative; overflow: hidden; padding-block: clamp(2.75rem, 7vw, 5rem) clamp(3rem, 7vw, 5.5rem); background: linear-gradient(180deg, #fdf8ef, var(--cream-2)); }
.hero__layers { position: absolute; inset: 0; pointer-events: none; }
.layer { position: absolute; inset: -12% -4% auto -4%; will-change: transform; }
.layer--sky { background: radial-gradient(70% 60% at 72% 18%, rgba(217,149,81,.4), transparent 62%); inset: -10% 0 0 0; }
.layer--sun { width: 320px; height: 320px; inset: 6% 12% auto auto; border-radius: 50%; background: radial-gradient(circle, rgba(255,214,160,.75), rgba(255,214,160,0) 68%); filter: blur(2px); }
.layer--hill { border-radius: 50% 50% 0 0 / 100% 100% 0 0; }
.layer--far { inset: auto -14% -6% -6%; height: 42%; background: linear-gradient(180deg, #e6d3ba, #d9c0a1); }
.layer--near { inset: auto -20% -10% 12%; height: 30%; background: linear-gradient(180deg, #d3b58f, #c49e74); }
.layer--grain { inset: 0; background-image: radial-gradient(rgba(43,26,16,.07) 1px, transparent 1px); background-size: 5px 5px; opacity: .5; }
.hero__in { position: relative; z-index: 1; display: grid; gap: clamp(1.5rem, 4vw, 3rem); grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); align-items: center; }
.eyebrow { display: inline-flex; align-items: center; gap: .55rem; font-size: .73rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--crust); }
.eyebrow__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--caramel); animation: dot-breathe 2.8s var(--ease) infinite; }
.eyebrow--light { color: var(--caramel-hi); }
.hero__title { font-size: clamp(2.1rem, 5.6vw, 3.7rem); margin-block: .9rem .9rem; max-width: 16ch; }
.hero__lede { font-size: clamp(.98rem, 1.25vw, 1.08rem); color: var(--ink-2); max-width: 52ch; }
.hero__actions { display: flex; flex-wrap: wrap; gap: .7rem; margin-top: 1.6rem; }
.hero__marks { display: flex; flex-wrap: wrap; gap: 1rem 2rem; margin-top: 2rem; padding-top: 1.4rem; border-top: 1px solid var(--line-2); }
.hero__marks li { display: grid; }
.hero__marks strong { font-family: var(--font-display); font-size: 1.4rem; color: var(--crust); line-height: 1.15; }
.hero__marks span { font-size: .76rem; letter-spacing: .05em; text-transform: uppercase; color: var(--muted); }

/* hero cup art */
.hero__art { position: relative; justify-self: center; width: min(100%, 340px); aspect-ratio: 1 / 1; display: grid; place-items: center; }
.plate { position: absolute; width: 78%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 42% 34%, #fdf7ee, #e6d3ba 62%, #cfb38e); box-shadow: 0 26px 50px -26px rgba(43,26,16,.6); }
.cup { position: relative; width: 52%; aspect-ratio: 1 / .86; display: grid; place-items: center; }
.cup__steam { position: absolute; top: -46%; left: 50%; transform: translateX(-50%); width: 60%; height: 52%; }
.cup__steam i {
  position: absolute; bottom: 0; left: 50%; width: 6px; height: 100%;
  border-radius: 999px; background: linear-gradient(180deg, rgba(43,26,16,0), rgba(43,26,16,.28));
  filter: blur(4px); transform-origin: bottom center;
  animation: steam-rise 3.4s var(--ease) infinite;
}
.cup__steam i:nth-child(2) { animation-duration: 4.1s; animation-delay: -1.1s; height: 78%; }
.cup__steam i:nth-child(3) { animation-duration: 3.7s; animation-delay: -2.2s; height: 60%; }
.cup__body {
  position: relative; width: 100%; height: 100%;
  border-radius: 10px 10px 46% 46% / 8px 8px 42% 42%;
  background: linear-gradient(115deg, #fdf8ef 0%, #f1e3cd 46%, #dcc6a4 100%);
  box-shadow: inset -8px -6px 16px rgba(43,26,16,.14), 0 14px 26px -14px rgba(43,26,16,.6);
  overflow: hidden;
}
.cup__crema { position: absolute; inset: 0 0 auto 0; height: 26%; border-radius: 0 0 50% 50% / 0 0 100% 100%; background: linear-gradient(180deg, #6b4327, #432a1c); box-shadow: inset 0 3px 6px rgba(0,0,0,.35); }
.cup__handle { position: absolute; right: -14%; top: 32%; width: 30%; aspect-ratio: 1; border: 7px solid #e6d3ba; border-left-color: transparent; border-radius: 50%; transform: rotate(-14deg); }
.cup__saucer { position: absolute; bottom: -13%; left: 50%; transform: translateX(-50%); width: 118%; height: 15%; border-radius: 50%; background: linear-gradient(180deg, #f6ebda, #d3ba95); box-shadow: 0 10px 20px -12px rgba(43,26,16,.7); }
.bean { position: absolute; width: 22px; height: 30px; border-radius: 50% / 42%; background: linear-gradient(140deg, var(--crust), #4b2a17); box-shadow: inset -3px -3px 6px rgba(0,0,0,.4), 0 6px 12px -6px rgba(43,26,16,.8); }
.bean::after { content: ''; position: absolute; inset: 50% 12% auto 12%; height: 2px; border-radius: 2px; background: rgba(255,235,205,.55); transform: translateY(-50%) rotate(-16deg); }
.bean--1 { left: 8%; bottom: 14%; transform: rotate(-24deg); }
.bean--2 { right: 10%; bottom: 22%; transform: rotate(16deg) scale(.85); }
.bean--3 { left: 16%; bottom: 30%; transform: rotate(48deg) scale(.7); }

/* ---------------------------------------------------------------- sections */
.section { padding-block: clamp(2.75rem, 6vw, 4.5rem); }
.section--cream { background: var(--cream-2); border-block: 1px solid var(--line); }
.head { display: flex; flex-wrap: wrap; gap: 1rem 2.5rem; align-items: flex-end; justify-content: space-between; margin-bottom: 2rem; }
.head__title { font-size: clamp(1.6rem, 3.6vw, 2.5rem); margin-top: .7rem; max-width: 22ch; }
.head__note { font-size: .89rem; color: var(--muted); max-width: 46ch; }

/* visit cards */
.cards { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 265px), 1fr)); }
.card {
  display: grid; gap: .55rem; align-content: start;
  padding: 1.5rem; background: var(--paper);
  border: 1px solid var(--line); border-radius: var(--radius-lg);
  transition: transform .3s var(--ease), border-color .3s var(--ease), box-shadow .3s var(--ease);
}
.card:hover { transform: translateY(-5px); border-color: var(--caramel); box-shadow: var(--shadow); }
.card__icon { display: grid; place-items: center; width: 42px; height: 42px; margin-bottom: .3rem; border-radius: 12px; background: var(--cream-2); color: var(--crust); }
.card__icon .icon { width: 21px; height: 21px; }
.card__title { font-size: 1.1rem; }
.card__addr { font-size: .92rem; color: var(--ink-2); font-style: normal; }
.card__note { font-size: .83rem; color: var(--muted); }
.hours th { text-align: left; font-weight: 500; color: var(--ink-2); padding: .28rem 0; font-size: .87rem; }
.hours td { text-align: right; font-variant-numeric: tabular-nums; color: var(--ink); font-size: .87rem; padding: .28rem 0; }
.hours tbody tr + tr th, .hours tbody tr + tr td { border-top: 1px dotted var(--line-2); }
.dir { display: grid; gap: .55rem; padding-top: .85rem; border-top: 1px solid var(--line); }
.dir[hidden] { display: none; }
.dir__row { font-size: .83rem; color: var(--muted); }
.dir__row strong { display: block; color: var(--ink); font-size: .84rem; }

/* menu */
.tabs { display: flex; flex-wrap: wrap; gap: .4rem; padding: 5px; margin-bottom: 1.5rem; background: var(--paper); border: 1px solid var(--line); border-radius: 999px; width: fit-content; max-width: 100%; }
.tab { padding: .5rem 1.05rem; font-size: .84rem; font-weight: 700; background: transparent; border: 0; border-radius: 999px; cursor: pointer; color: var(--muted); transition: color .2s var(--ease), background .2s var(--ease); }
.tab:hover { color: var(--crust); }
.tab.is-on { background: var(--espresso); color: var(--on-dark); }
.menu { display: grid; gap: 1.25rem; }
.menu:focus-visible { outline: 2px solid var(--caramel); outline-offset: 4px; border-radius: var(--radius); }
.dishes { display: grid; gap: .1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); column-gap: 2.5rem; }
.dish {
  display: grid; grid-template-columns: auto 1fr auto; align-items: baseline; gap: .6rem;
  padding: .85rem 0; border-bottom: 1px dotted var(--line-2);
  animation: dish-in .5s var(--ease) both;
}
.dish__main { display: grid; gap: .1rem; min-width: 0; }
.dish__name { font-family: var(--font-body); font-size: .96rem; font-weight: 700; letter-spacing: -.005em; }
.dish__desc { font-size: .81rem; color: var(--muted); }
.dish__dots { border-bottom: 1px dotted var(--line-2); transform: translateY(-4px); }
.dish__price { font-family: var(--font-body); font-weight: 700; font-size: .96rem; color: var(--crust); font-variant-numeric: tabular-nums; white-space: nowrap; }
.dish__price::before { content: '\u00a3'; margin-right: .1em; }
.dish:hover .dish__name { color: var(--caramel); }
.menu__status { font-size: .8rem; color: var(--muted); }

/* bakes */
.bakes__grid { display: grid; gap: 1.1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 265px), 1fr)); }
.bake { display: grid; grid-template-rows: auto 1fr; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--paper); overflow: hidden; transition: transform .3s var(--ease), border-color .3s var(--ease), box-shadow .3s var(--ease); }
.bake:hover { transform: translateY(-5px); border-color: var(--caramel); box-shadow: var(--shadow); }
.bake__art { display: block; aspect-ratio: 5 / 4; background-color: var(--cream-2); }
.bake__art::after { content: ''; display: block; height: 100%; background: repeating-linear-gradient(48deg, rgba(255,255,255,.14) 0 2px, transparent 2px 10px); mix-blend-mode: soft-light; }
.bake__art--1 { background-image: radial-gradient(70% 70% at 32% 26%, #d9a45f, transparent 58%), linear-gradient(155deg, #a5622c, #5b3016); }
.bake__art--2 { background-image: radial-gradient(60% 60% at 70% 30%, #f3d9ae, transparent 60%), linear-gradient(200deg, #c98a4a, #6b3a1b); }
.bake__art--3 { background-image: conic-gradient(from 140deg at 46% 42%, #e8b878, #a25c26, #7a4218, #e8b878); }
.bake__art--4 { background-image: repeating-linear-gradient(24deg, #d9a55c 0 14px, #c08243 14px 28px, #e3bb7c 28px 42px); }
.bake__art--5 { background-image: radial-gradient(80% 70% at 40% 30%, #8a5a34, transparent 62%), linear-gradient(140deg, #4d2d19, #7a4a24); }
.bake__art--6 { background-image: linear-gradient(150deg, #f2dcb6 0%, #dfb87c 40%, #b3703a 100%); }
.bake__body { display: grid; gap: .4rem; align-content: start; padding: 1.1rem 1.2rem 1.25rem; }
.bake__name { font-size: 1.05rem; }
.bake__desc { font-size: .83rem; color: var(--muted); }
.bake__price { font-weight: 700; color: var(--crust); font-variant-numeric: tabular-nums; }
.bake__price::before { content: '\u00a3'; margin-right: .1em; }

/* story */
.story { display: grid; gap: clamp(1.75rem, 4vw, 3.5rem); grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); align-items: center; }
.story__art { position: relative; min-height: clamp(300px, 46vw, 440px); }
.story__frame { position: absolute; display: block; border-radius: var(--radius-lg); }
.story__frame--back { inset: 6% 22% 20% 0; background: linear-gradient(150deg, #c9a578, #8a5a34); transform: rotate(-7deg); }
.story__frame--mid { inset: 12% 10% 12% 12%; background: linear-gradient(200deg, #e2c49a, #a5713f); transform: rotate(5deg); }
.story__frame--front {
  inset: 16% 6% 10% 22%; overflow: hidden;
  background: radial-gradient(80% 70% at 28% 22%, #f0d4a8, transparent 60%), linear-gradient(160deg, #7a4a24, #3b2214);
  box-shadow: var(--shadow-lg);
}
.story__frame--front::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(38% 30% at 50% 34%, rgba(255,236,204,.85), transparent 70%);
}
.story__caption { position: absolute; left: 1rem; bottom: 1rem; font-size: .74rem; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,244,228,.82); }
.story__badge {
  position: absolute; right: 0; bottom: 4%; z-index: 2;
  display: grid; place-items: center; width: 78px; height: 78px; border-radius: 50%;
  background: var(--caramel-hi); color: var(--espresso); box-shadow: var(--shadow);
}
.story__badge strong { font-family: var(--font-display); font-size: 1.15rem; line-height: 1; }
.story__badge span { font-size: .68rem; letter-spacing: .1em; text-transform: uppercase; }
.story__copy { display: grid; gap: .9rem; justify-items: start; }
.story__p { font-size: .95rem; color: var(--ink-2); max-width: 58ch; }
.milestones { display: grid; gap: .8rem; margin-block: .4rem .6rem; }
.milestones li { display: grid; grid-template-columns: 62px 1fr; gap: .85rem; align-items: start; }
.milestones__year { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--crust); }
.milestones__what { font-size: .85rem; color: var(--muted); padding-bottom: .8rem; border-bottom: 1px dotted var(--line-2); }

/* reviews */
.rev { border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--paper); overflow: hidden; box-shadow: var(--shadow-sm); }
.rev:focus-visible { outline: 2px solid var(--caramel); outline-offset: 3px; }
.rev__viewport { overflow: hidden; }
.rev__track { display: flex; transition: transform .55s var(--ease); }
.revslide { flex: 0 0 100%; min-width: 0; }
.revcard { margin: 0; padding: clamp(1.5rem, 4vw, 2.75rem); display: grid; gap: .9rem; justify-items: start; }
.stars { display: flex; gap: .16rem; color: var(--caramel); }
.stars .icon { width: 17px; height: 17px; }
.revcard blockquote { margin: 0; font-family: var(--font-display); font-size: clamp(1.12rem, 2.3vw, 1.6rem); line-height: 1.36; color: var(--ink); max-width: 48ch; }
.revcard figcaption { display: grid; gap: .1rem; }
.revcard figcaption strong { font-size: .88rem; }
.revcard figcaption span { font-size: .78rem; color: var(--muted); }
.rev__controls { display: flex; align-items: center; gap: .75rem; padding: .9rem clamp(1.5rem, 4vw, 2.75rem); border-top: 1px solid var(--line); background: var(--cream); }
.rnav { display: grid; place-items: center; width: 38px; height: 38px; flex: none; background: var(--paper); border: 1px solid var(--line-2); border-radius: 50%; cursor: pointer; color: var(--ink-2); transition: color .2s var(--ease), border-color .2s var(--ease), transform .18s var(--ease); }
.rnav:hover { color: var(--crust); border-color: var(--caramel); transform: translateY(-2px); }
.rnav--auto { margin-left: auto; }
.rnav--auto .ic--play { display: none; }
.rnav--auto[aria-pressed='false'] .ic--pause { display: none; }
.rnav--auto[aria-pressed='false'] .ic--play { display: block; }
.rev__dots { display: flex; gap: .4rem; }
.rdot { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 999px; background: var(--line-2); cursor: pointer; transition: width .3s var(--ease), background .3s var(--ease); }
.rdot.is-on { width: 26px; background: var(--crust); }

/* gallery */
.gallery { display: grid; gap: .75rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 165px), 1fr)); }
.shot { position: relative; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--line); background: var(--paper); }
.shot__art { display: block; aspect-ratio: 1; background-color: var(--cream-2); transition: transform .5s var(--ease); }
.shot:hover .shot__art { transform: scale(1.07); }
.shot__art::after { content: ''; display: block; height: 100%; background: radial-gradient(70% 70% at 30% 25%, rgba(255,255,255,.28), transparent 62%); }
.shot--1 .shot__art { background-image: radial-gradient(46% 46% at 50% 52%, #4d2e1c, transparent 62%), radial-gradient(80% 80% at 50% 50%, #f3e4cc, #d9c2a0 72%); }
.shot--2 .shot__art { background-image: repeating-linear-gradient(62deg, #d9a45f 0 10px, #b3703a 10px 20px, #e5c391 20px 30px); }
.shot--3 .shot__art { background-image: radial-gradient(70% 60% at 34% 34%, #e7c68f, transparent 60%), linear-gradient(200deg, #b3703a, #6b3a1b); }
.shot--4 .shot__art { background-image: linear-gradient(150deg, #dfe7e4 0%, #b7c6c4 48%, #8b9c9a 100%); }
.shot--5 .shot__art { background-image: radial-gradient(60% 60% at 30% 26%, #c08a4e, transparent 60%), linear-gradient(150deg, #6b3a1b, #3b2214); }
.shot--6 .shot__art { background-image: radial-gradient(50% 50% at 42% 44%, #e8b352, transparent 62%), linear-gradient(160deg, #f0dcb8, #c98a4a); }
.shot--7 .shot__art { background-image: linear-gradient(180deg, #bcd7dd 0%, #d9e6e2 46%, #9fb08a 100%); }
.shot--8 .shot__art { background-image: repeating-linear-gradient(38deg, #f2e2c4 0 14px, #e0c496 14px 28px); }
.shot__tag {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 1;
  padding: 1.4rem .8rem .7rem;
  background: linear-gradient(180deg, transparent, rgba(43,26,16,.82));
  color: var(--on-dark); font-size: .74rem; letter-spacing: .03em;
  opacity: 0; transform: translateY(6px); transition: opacity .28s var(--ease), transform .28s var(--ease);
}
.shot:hover .shot__tag, .shot:focus-within .shot__tag { opacity: 1; transform: none; }

/* booking */
.book { background: var(--espresso); color: var(--on-dark); position: relative; overflow: hidden; }
.book::before { content: ''; position: absolute; inset: 0; background: radial-gradient(60% 110% at 12% 8%, rgba(179,112,58,.34), transparent 60%); }
.book__in { position: relative; z-index: 1; display: grid; gap: clamp(1.5rem, 4vw, 3rem); grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); align-items: start; }
.book__title { font-size: clamp(1.6rem, 3.6vw, 2.4rem); margin-block: .7rem .8rem; max-width: 18ch; }
.book__copy { font-size: .95rem; color: color-mix(in srgb, var(--on-dark) 80%, transparent); max-width: 46ch; }
.book__pts { display: grid; gap: .6rem; margin-top: 1.5rem; }
.book__pts li { display: flex; align-items: flex-start; gap: .55rem; font-size: .86rem; color: color-mix(in srgb, var(--on-dark) 88%, transparent); }
.book__pts .icon { width: 16px; height: 16px; margin-top: 2px; color: var(--caramel-hi); }
.book__contact { margin-top: 1.5rem; font-size: .86rem; color: color-mix(in srgb, var(--on-dark) 76%, transparent); }
.book__contact a { color: var(--caramel-hi); font-weight: 700; }
.book__contact a:hover { text-decoration: underline; }
.book__form { display: grid; gap: .9rem; padding: clamp(1.2rem, 3vw, 1.75rem); background: color-mix(in srgb, var(--on-dark) 8%, transparent); border: 1px solid rgba(247,239,226,.2); border-radius: var(--radius-lg); }
.field { display: grid; gap: .32rem; }
.field-row { display: grid; gap: .9rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 155px), 1fr)); }
.field__label { font-size: .77rem; font-weight: 700; color: color-mix(in srgb, var(--on-dark) 88%, transparent); }
.req { color: var(--caramel-hi); }
.input { width: 100%; padding: .72rem .85rem; font: inherit; font-size: .92rem; color: var(--ink); background: var(--cream); border: 1px solid transparent; border-radius: 10px; transition: border-color .18s var(--ease), box-shadow .18s var(--ease); }
.input::placeholder { color: color-mix(in srgb, var(--muted) 78%, transparent); }
.input:focus { outline: none; border-color: var(--caramel-hi); box-shadow: 0 0 0 3px rgba(217,149,81,.28); }
.input--area { min-height: 112px; line-height: 1.55; }
.input--select { appearance: none; background-image: linear-gradient(45deg, transparent 50%, var(--muted) 50%), linear-gradient(135deg, var(--muted) 50%, transparent 50%); background-position: calc(100% - 18px) 50%, calc(100% - 13px) 50%; background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; padding-right: 2.4rem; }
.field.is-bad .input { border-color: #e8836f; background: rgba(232,131,111,.12); }
.field__msg { font-size: .75rem; min-height: 1em; color: #f0a58f; font-weight: 600; }
.field__foot { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.field__count { font-size: .72rem; color: color-mix(in srgb, var(--on-dark) 60%, transparent); font-variant-numeric: tabular-nums; white-space: nowrap; }
.check { display: flex; align-items: flex-start; gap: .6rem; cursor: pointer; font-size: .83rem; color: color-mix(in srgb, var(--on-dark) 86%, transparent); }
.check input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.check__box { display: grid; place-items: center; flex: none; width: 20px; height: 20px; margin-top: 1px; border: 1px solid rgba(247,239,226,.4); border-radius: 6px; background: transparent; transition: background .18s var(--ease), border-color .18s var(--ease); }
.check__box .icon { width: 13px; height: 13px; color: var(--espresso); opacity: 0; transform: scale(.6); transition: opacity .18s var(--ease), transform .18s var(--ease); }
.check input:checked + .check__box { background: var(--caramel-hi); border-color: var(--caramel-hi); }
.check input:checked + .check__box .icon { opacity: 1; transform: scale(1); }
.check input:focus-visible + .check__box { outline: 2px solid var(--caramel-hi); outline-offset: 2px; }
.form-status { font-size: .82rem; min-height: 1.15em; font-weight: 600; color: color-mix(in srgb, var(--on-dark) 68%, transparent); }
.form-status.is-bad { color: #f0a58f; }
.sent { display: flex; gap: .8rem; align-items: flex-start; padding: .9rem 1rem; border: 1px solid var(--caramel-hi); border-radius: var(--radius); background: rgba(217,149,81,.16); animation: rise-in .5s var(--ease) both; }
.sent[hidden] { display: none; }
.sent__ic { display: grid; place-items: center; flex: none; width: 32px; height: 32px; border-radius: 50%; background: var(--caramel-hi); color: var(--espresso); }
.sent__ic .icon { width: 18px; height: 18px; }
.sent__t { font-size: .9rem; font-weight: 700; }
.sent__m { font-size: .82rem; color: color-mix(in srgb, var(--on-dark) 84%, transparent); }

/* ------------------------------------------------------------------ footer */
.foot { background: var(--espresso); color: color-mix(in srgb, var(--on-dark) 76%, transparent); padding-top: clamp(2.5rem, 5vw, 3.5rem); border-top: 1px solid rgba(247,239,226,.14); }
.foot__top { display: grid; gap: 2rem; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.25fr) repeat(3, minmax(0, .85fr)) minmax(0, 1.3fr); }
.foot__title { font-family: var(--font-body); font-size: .71rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--caramel-hi); margin-bottom: .8rem; }
.hours--foot th { text-align: left; font-weight: 400; color: color-mix(in srgb, var(--on-dark) 74%, transparent); font-size: .84rem; padding: .22rem 0; }
.hours--foot td { text-align: right; color: var(--on-dark); font-size: .84rem; font-variant-numeric: tabular-nums; padding: .22rem 0; }
.hours--foot tbody tr + tr th, .hours--foot tbody tr + tr td { border-top: 1px solid rgba(247,239,226,.12); }
.foot__note { font-size: .8rem; margin-top: .7rem; }
.map { position: relative; aspect-ratio: 4 / 3; border-radius: var(--radius); overflow: hidden; background: linear-gradient(160deg, #4a3328, #33221a); border: 1px solid rgba(247,239,226,.16); }
.map::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(247,239,226,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(247,239,226,.09) 1px, transparent 1px); background-size: 26px 26px; }
.map__road { position: absolute; background: rgba(247,239,226,.2); }
.map__road--1 { left: -10%; right: -10%; top: 54%; height: 11px; transform: rotate(-6deg); }
.map__road--2 { top: -10%; bottom: -10%; left: 34%; width: 9px; transform: rotate(4deg); }
.map__river { position: absolute; left: -14%; right: -14%; bottom: 16%; height: 16px; background: rgba(96,153,167,.5); border-radius: 50%; transform: rotate(3deg); }
.map__pin { position: absolute; left: 50%; top: 46%; transform: translate(-50%,-50%); display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; background: var(--caramel-hi); color: var(--espresso); transform: translate(-50%,-100%) rotate(-45deg); }
.map__pin .icon { width: 18px; height: 18px; transform: rotate(45deg); }
.map__label { position: absolute; left: .7rem; bottom: .6rem; font-size: .72rem; color: color-mix(in srgb, var(--on-dark) 84%, transparent); }
.foot__col li + li { margin-top: .42rem; }
.foot__col a { font-size: .85rem; transition: color .18s var(--ease), padding-left .18s var(--ease); }
.foot__col a:hover { color: var(--on-dark); padding-left: 4px; }
.nl { display: flex; flex-wrap: wrap; gap: .45rem; margin-top: .7rem; }
.nl__input { flex: 1 1 9rem; min-width: 0; padding: .6rem .8rem; font: inherit; font-size: .86rem; color: var(--ink); background: color-mix(in srgb, var(--on-dark) 10%, transparent); border: 1px solid rgba(247,239,226,.28); border-radius: 999px; }
.nl__input::placeholder { color: color-mix(in srgb, var(--on-dark) 52%, transparent); }
.nl__input:focus { outline: none; border-color: var(--caramel-hi); box-shadow: 0 0 0 3px rgba(217,149,81,.24); }
.nl .field__msg { flex: 1 0 100%; color: #f0a58f; }
.nl .field__msg.is-ok { color: #a8dcc0; }
.socials { display: flex; gap: .5rem; margin-top: 1.1rem; }
.socials a { display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid rgba(247,239,226,.24); border-radius: 10px; color: color-mix(in srgb, var(--on-dark) 80%, transparent); transition: color .2s var(--ease), background .2s var(--ease), transform .2s var(--ease); }
.socials a:hover { color: var(--espresso); background: var(--caramel-hi); transform: translateY(-3px); }
.foot__legal { display: flex; flex-wrap: wrap; gap: .4rem 1.5rem; justify-content: space-between; margin-top: 2.5rem; padding-block: 1.1rem; border-top: 1px solid rgba(247,239,226,.14); font-size: .76rem; }

/* ------------------------------------------------------------------ reveal */
[data-reveal] { opacity: 0; transform: translateY(22px); }
[data-reveal].is-visible { opacity: 1; transform: none; transition: opacity .7s var(--ease), transform .7s var(--ease); transition-delay: var(--delay, 0s); }

/* --------------------------------------------------------------- keyframes */
@keyframes rise-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
@keyframes dot-breathe { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.35); opacity: .6; } }
@keyframes steam-rise {
  0% { transform: translateX(-50%) scaleY(.35) scaleX(.7); opacity: 0; }
  25% { opacity: .85; }
  100% { transform: translateX(-50%) translateY(-18px) scaleY(1.25) scaleX(1.5); opacity: 0; }
}
@keyframes dish-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes sheen-slide { from { background-position: -180% 0; } to { background-position: 260% 0; } }

/* -------------------------------------------------------------- responsive */
@media (max-width: 1120px) {
  .foot__top { grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); }
  .foot__col--wide { grid-column: 1 / -1; }
}
@media (max-width: 960px) {
  .burger { display: grid; }
  .hdr__cta { display: none; }
  .hero__in { grid-template-columns: minmax(0, 1fr); }
  .hero__art { order: -1; width: min(72%, 260px); }
  .story { grid-template-columns: minmax(0, 1fr); }
  .book__in { grid-template-columns: minmax(0, 1fr); }
  .nav {
    position: absolute; top: calc(100% + 1px); left: 0; right: 0;
    background: var(--cream); border-bottom: 1px solid var(--line); box-shadow: var(--shadow);
    padding: .75rem clamp(1rem, 4vw, 2.5rem) 1.15rem;
    opacity: 0; visibility: hidden; transform: translateY(-8px);
    transition: opacity .22s var(--ease), transform .22s var(--ease), visibility .22s;
  }
  .nav.is-open { opacity: 1; visibility: visible; transform: none; }
  .nav__list { flex-direction: column; align-items: stretch; gap: 0; }
  .nav__link { display: block; padding: .65rem 0; border-bottom: 1px solid var(--line); font-size: 1rem; }
}
@media (max-width: 560px) {
  body { font-size: 15px; }
  .tabs { width: 100%; justify-content: flex-start; overflow-x: auto; }
  .foot__legal { flex-direction: column; }
}

/* ------------------------------------------------------- reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
  .cup__steam { opacity: .35; }
  .cup__steam i { animation: none; opacity: .5; }
  .layer { transform: none !important; }
}
`,
  javascript: `
'use strict';

var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i;

function $(id) { return document.getElementById(id); }
function qsa(sel) { return document.querySelectorAll(sel); }

/* ------------------------------------------------------------------ reveal */
function initReveal() {
  var items = qsa('[data-reveal]');
  if (!items.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    for (var i = 0; i < items.length; i++) items[i].classList.add('is-visible');
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    for (var j = 0; j < entries.length; j++) {
      if (entries[j].isIntersecting) {
        entries[j].target.classList.add('is-visible');
        io.unobserve(entries[j].target);
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  for (var k = 0; k < items.length; k++) io.observe(items[k]);
}

/* ------------------------------------------------- sticky header + progress */
function initScroll() {
  var hdr = $('hdr');
  var fill = $('crumbFill');
  var ticking = false;

  function frame() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (hdr) hdr.classList.toggle('is-stuck', y > 8);
    if (fill) {
      var doc = document.documentElement;
      var max = (doc.scrollHeight - window.innerHeight) || 1;
      fill.style.width = Math.min(100, Math.max(0, (y / max) * 100)).toFixed(2) + '%';
    }
    applyParallax(y);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(frame); }
  }, { passive: true });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 960) { clearParallax(); }
  }, { passive: true });
  frame();
}

/* ---------------------------------------------------------------- parallax */
var layers = [];
function collectLayers() {
  var nodes = qsa('.layer[data-depth]');
  layers = [];
  for (var i = 0; i < nodes.length; i++) {
    layers.push({ node: nodes[i], depth: parseFloat(nodes[i].getAttribute('data-depth')) || 0 });
  }
}

function applyParallax(y) {
  if (reduce || window.innerWidth <= 960 || !layers.length) return;
  for (var i = 0; i < layers.length; i++) {
    var l = layers[i];
    l.node.style.transform = 'translate3d(0,' + (y * l.depth).toFixed(1) + 'px,0)';
  }
}

function clearParallax() {
  for (var i = 0; i < layers.length; i++) layers[i].node.style.transform = '';
}

/* ------------------------------------------------------------------ mobile */
function initNav() {
  var burger = $('burger');
  var nav = $('primaryNav');
  if (!burger || !nav) return;
  function close() {
    burger.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }
  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', open ? 'false' : 'true');
    nav.classList.toggle('is-open', !open);
  });
  var links = nav.querySelectorAll('a');
  for (var i = 0; i < links.length; i++) links[i].addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { close(); burger.focus(); }
  });
}

/* --------------------------------------------------------------- directions */
function initDirections() {
  var btn = $('dirBtn');
  var panel = $('dirPanel');
  if (!btn || !panel) return;
  btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    panel.hidden = open;
    if (!open) panel.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  });
}

/* ---------------------------------------------------------------- menu tabs */
function initMenu() {
  var tabs = qsa('#menuTabs .tab');
  var pane = $('pane-menu');
  var list = $('dishList');
  var status = $('menuStatus');
  if (!tabs.length || !list) return;
  var dishes = list.querySelectorAll('.dish');
  var active = 'espresso';

  function apply() {
    var shown = 0;
    for (var i = 0; i < dishes.length; i++) {
      var visible = (dishes[i].getAttribute('data-cat') || '') === active;
      dishes[i].style.display = visible ? '' : 'none';
      if (visible) {
        shown++;
        restart(dishes[i]);
      }
    }
    if (status) {
      var label = active.charAt(0).toUpperCase() + active.slice(1);
      status.textContent = shown + (shown === 1 ? ' dish on ' : ' dishes on ') + label + '.';
    }
  }

  function restart(node) {
    node.style.animation = 'none';
    void node.offsetWidth;
    node.style.animation = '';
  }

  function select(name, focus) {
    active = name;
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute('data-cat') === name;
      tabs[i].classList.toggle('is-on', on);
      tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
      tabs[i].setAttribute('tabindex', on ? '0' : '-1');
      if (on && focus) tabs[i].focus();
    }
    if (pane) pane.setAttribute('aria-labelledby', 'tab-' + name);
    apply();
  }

  for (var t = 0; t < tabs.length; t++) {
    tabs[t].addEventListener('click', function () {
      select(this.getAttribute('data-cat'), false);
    });
  }

  var host = $('menuTabs');
  if (host) {
    host.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var order = ['espresso', 'brew', 'kitchen', 'cold'];
      var at = order.indexOf(active);
      var nextIndex = e.key === 'ArrowRight' ? (at + 1) % order.length : (at - 1 + order.length) % order.length;
      select(order[nextIndex], true);
    });
  }

  select('espresso', false);
}

/* ---------------------------------------------------------------- reviews */
function initReviews() {
  var box = $('rev');
  var track = $('revTrack');
  var prev = $('revPrev');
  var next = $('revNext');
  var dotsHost = $('revDots');
  var autoBtn = $('revAuto');
  if (!box || !track) return;
  var slides = track.querySelectorAll('.revslide');
  if (!slides.length) return;

  var index = 0;
  var auto = true;
  var timer = null;
  var DELAY = 7000;
  var dots = [];

  function goTo(target) {
    index = (target + slides.length) % slides.length;
    track.style.transform = 'translateX(' + (index * -100) + '%)';
    for (var i = 0; i < dots.length; i++) {
      var on = i === index;
      dots[i].classList.toggle('is-on', on);
      if (on) dots[i].setAttribute('aria-current', 'true');
      else dots[i].removeAttribute('aria-current');
    }
    for (var s = 0; s < slides.length; s++) {
      slides[s].setAttribute('aria-hidden', s === index ? 'false' : 'true');
    }
  }

  if (dotsHost) {
    for (var d = 0; d < slides.length; d++) {
      (function (order) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rdot';
        btn.setAttribute('aria-label', 'Review ' + (order + 1) + ' of ' + slides.length);
        btn.addEventListener('click', function () { goTo(order); restart(); });
        li.appendChild(btn);
        dotsHost.appendChild(li);
        dots.push(btn);
      }(d));
    }
  }

  function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
  function start() {
    stop();
    if (!auto || reduce) return;
    timer = window.setInterval(function () { goTo(index + 1); }, DELAY);
  }
  function restart() { stop(); start(); }

  if (prev) prev.addEventListener('click', function () { goTo(index - 1); restart(); });
  if (next) next.addEventListener('click', function () { goTo(index + 1); restart(); });
  if (autoBtn) {
    autoBtn.addEventListener('click', function () {
      auto = this.getAttribute('aria-pressed') !== 'true';
      this.setAttribute('aria-pressed', auto ? 'true' : 'false');
      this.setAttribute('aria-label', auto ? 'Pause automatic advance' : 'Resume automatic advance');
      restart();
    });
  }
  box.addEventListener('mouseenter', stop);
  box.addEventListener('mouseleave', start);
  box.addEventListener('focusin', stop);
  box.addEventListener('focusout', start);
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); restart(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); restart(); }
  });

  goTo(0);
  start();
}

/* ------------------------------------------------------------ booking form */
function setBad(input, msgNode, message) {
  var field = input ? input.closest('.field') : null;
  if (field) field.classList.toggle('is-bad', !!message);
  if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (msgNode) msgNode.textContent = message || '';
}

function initBooking() {
  var form = $('bookForm');
  if (!form) return;
  var name = $('bName');
  var phone = $('bPhone');
  var email = $('bEmail');
  var date = $('bDate');
  var time = $('bTime');
  var size = $('bSize');
  var notes = $('bNotes');
  var count = $('bNotesCount');
  var terms = $('bTerms');
  var status = $('bookStatus');
  var sent = $('bookSent');

  if (date) {
    var today = new Date();
    var iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    date.setAttribute('min', iso);
  }

  if (notes && count) {
    notes.addEventListener('input', function () {
      if (notes.value.length > 400) notes.value = notes.value.slice(0, 400);
      count.textContent = notes.value.length + ' / 400';
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = false;
    var nm = name ? name.value.trim() : '';
    var ph = phone ? phone.value.trim() : '';
    var em = email ? email.value.trim() : '';
    var dt = date ? date.value : '';
    var tm = time ? time.value : '';
    var sz = size ? size.value : '';
    var termsMsg = $('bTermsMsg');

    if (!nm) { setBad(name, $('bNameMsg'), 'We need a name for the table.'); bad = true; }
    else if (nm.length < 2) { setBad(name, $('bNameMsg'), 'That name looks too short.'); bad = true; }
    else { setBad(name, $('bNameMsg'), ''); }

    var digits = ph.replace(/[^0-9]/g, '');
    if (!ph) { setBad(phone, $('bPhoneMsg'), 'A phone number lets us confirm quickly.'); bad = true; }
    else if (digits.length < 9) { setBad(phone, $('bPhoneMsg'), 'That number looks short.'); bad = true; }
    else { setBad(phone, $('bPhoneMsg'), ''); }

    if (!em) { setBad(email, $('bEmailMsg'), 'An email address is required.'); bad = true; }
    else if (!EMAIL_RE.test(em)) { setBad(email, $('bEmailMsg'), 'Use the format name@example.com'); bad = true; }
    else { setBad(email, $('bEmailMsg'), ''); }

    if (!dt) { setBad(date, $('bDateMsg'), 'Pick a date.'); bad = true; }
    else {
      var picked = new Date(dt + 'T12:00:00');
      var floor = new Date();
      floor.setHours(0, 0, 0, 0);
      if (picked.getTime() < floor.getTime()) { setBad(date, $('bDateMsg'), 'Choose a date from today onwards.'); bad = true; }
      else if (picked.getDay() === 1) { setBad(date, $('bDateMsg'), 'We are closed on Mondays.'); bad = true; }
      else { setBad(date, $('bDateMsg'), ''); }
    }

    if (!tm) { setBad(time, $('bTimeMsg'), 'Pick a rough slot.'); bad = true; }
    else { setBad(time, $('bTimeMsg'), ''); }

    if (!sz) { setBad(size, $('bSizeMsg'), 'How many of you?'); bad = true; }
    else { setBad(size, $('bSizeMsg'), ''); }

    if (termsMsg) termsMsg.textContent = terms && terms.checked ? '' : 'Please confirm bookings are by phone.';
    if (!terms || !terms.checked) bad = true;

    if (bad) {
      if (status) { status.className = 'form-status is-bad'; status.textContent = 'A few things still need attention.'; }
      if (sent) sent.hidden = true;
      return;
    }

    if (status) { status.className = 'form-status'; status.textContent = 'Sending your request...'; }
    var sentMsg = $('bookSentMsg');
    if (sentMsg) {
      sentMsg.textContent = 'Thanks ' + nm.split(' ')[0] + '. Bea will ring ' + ph + ' within one working day to confirm the long table for ' + sz + '.';
    }
    window.setTimeout(function () {
      if (status) status.textContent = '';
      if (sent) sent.hidden = false;
      form.reset();
      if (count) count.textContent = '0 / 400';
    }, reduce ? 0 : 450);
  });

  var live = [name, phone, email];
  for (var i = 0; i < live.length; i++) {
    live[i].addEventListener('blur', function () {
      if (!this.value.trim()) return;
      setBad(this, this.parentNode.querySelector('.field__msg'), '');
    });
  }
  if (terms) {
    terms.addEventListener('change', function () {
      var m = $('bTermsMsg');
      if (m) m.textContent = terms.checked ? '' : 'Please confirm bookings are by phone.';
    });
  }
}

/* -------------------------------------------------------------- newsletter */
function initNewsletter() {
  var form = $('nlForm');
  if (!form) return;
  var input = $('nlEmail');
  var msg = $('nlMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input ? input.value.trim() : '';
    if (!v) {
      if (input) input.classList.add('is-bad');
      if (msg) { msg.textContent = 'An email address is required.'; msg.classList.remove('is-ok'); }
      return;
    }
    if (!EMAIL_RE.test(v)) {
      if (input) input.classList.add('is-bad');
      if (msg) { msg.textContent = 'Use the format name@example.com'; msg.classList.remove('is-ok'); }
      return;
    }
    if (input) input.classList.remove('is-bad');
    if (msg) { msg.textContent = 'Done. The next Tuesday note is on its way.'; msg.classList.add('is-ok'); }
    form.reset();
  });
}

collectLayers();
function initAnchors() {
  if (reduce) return;
  var links = document.querySelectorAll('a[href^="#"]');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function (e) {
      var href = this.getAttribute('href') || '';
      if (href.length < 2) return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', href);
      }
    });
  }
}

initAnchors();
initReveal();
initScroll();
initNav();
initDirections();
initMenu();
initReviews();
initBooking();
initNewsletter();
`,
};