const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const bookingModal = document.getElementById('bookingModal');
    const adminModal = document.getElementById('adminModal');
    const openBooking = document.getElementById('openBooking');
    const closeBooking = document.getElementById('closeBooking');
    const closeAdmin = document.getElementById('closeAdmin');
    const toast = document.getElementById('toast');
    const bookingForm = document.getElementById('bookingForm');
    const quickForm = document.getElementById('quickForm');
    const revealEls = document.querySelectorAll('.reveal');
    const galleryCards = document.querySelectorAll('.gallery-card');
    const galleryFilters = document.querySelectorAll('.filter-btn');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const closeLightbox = document.getElementById('closeLightbox');
    const packageButtons = document.querySelectorAll('.open-package');
    const packageCards = document.querySelectorAll('[data-package-card]');
    const quickPackage = document.getElementById('quickPackage');
    const chipToggles = document.querySelectorAll('.chip-toggle');
    const packageSelect = document.getElementById('packageSelect');
    const eventType = document.getElementById('eventType');
    const eventDate = document.getElementById('eventDate');
    const guestCount = document.getElementById('guestCount');
    const setupHours = document.getElementById('setupHours');
    const venueInput = document.getElementById('venue');
    const builderTotal = document.getElementById('builderTotal');
    const liveTotal = document.getElementById('liveTotal');
    const liveSummaryText = document.getElementById('liveSummaryText');
    const availabilityStatus = document.getElementById('availabilityStatus');
    const availabilityText = document.getElementById('availabilityText');
    const chairsNeed = document.getElementById('chairsNeed');
    const tablesNeed = document.getElementById('tablesNeed');
    const decorNeed = document.getElementById('decorNeed');
    const chairsStock = document.getElementById('chairsStock');
    const tablesStock = document.getElementById('tablesStock');
    const decorStock = document.getElementById('decorStock');
    const inventoryWarning = document.getElementById('inventoryWarning');
    const suggestionsList = document.getElementById('suggestionsList');
    const suggestionLead = document.getElementById('suggestionLead');
    const submitBookingBtn = document.getElementById('submitBookingBtn');
    const openWhatsappQuote = document.getElementById('openWhatsappQuote');
    const invoicePreview = document.getElementById('invoicePreview');
    const invoiceStatus = document.getElementById('invoiceStatus');
    const invoiceClient = document.getElementById('invoiceClient');
    const invoiceDate = document.getElementById('invoiceDate');
    const invoicePackage = document.getElementById('invoicePackage');
    const invoiceExtras = document.getElementById('invoiceExtras');
    const invoiceVenue = document.getElementById('invoiceVenue');
    const invoiceInventory = document.getElementById('invoiceInventory');
    const invoiceTotal = document.getElementById('invoiceTotal');
    const printInvoiceBtn = document.getElementById('printInvoiceBtn');
    const downloadBookingsBtn = document.getElementById('downloadBookingsBtn');
    const analyticsBookings = document.getElementById('analyticsBookings');
    const analyticsTopPackage = document.getElementById('analyticsTopPackage');
    const analyticsRevenue = document.getElementById('analyticsRevenue');
    const adminBookingsCount = document.getElementById('adminBookingsCount');
    const adminTopPackage = document.getElementById('adminTopPackage');
    const adminInventoryLeft = document.getElementById('adminInventoryLeft');
    const adminBookingsTableBody = document.getElementById('adminBookingsTableBody');
    const adminEmptyState = document.getElementById('adminEmptyState');
    const exportAdminJson = document.getElementById('exportAdminJson');
    const resetInventoryBtn = document.getElementById('resetInventoryBtn');
    const clearBookingsBtn = document.getElementById('clearBookingsBtn');

    const STORAGE_KEYS = {
      theme: 'fiesta-theme',
      bookings: 'fiesta-bookings',
      inventory: 'fiesta-inventory',
      quick: 'fiesta-quick-inquiry',
      latest: 'fiesta-booking-last'
    };

    const DEFAULT_INVENTORY = { chairs: 120, tables: 30, decorations: 24 };
    const EVENT_SUGGESTIONS = {
      Birthday: ['Add a balloon arch for a photo-ready focal point.', 'Fairy lights work well for evening birthday setups.', 'Backdrop + cake stand creates a stronger celebration area.'],
      Wedding: ['Consider a backdrop and fairy lights for a more elegant reception look.', 'Premium package pairs well with extra chairs for family seating.', 'Balloon arch can be replaced with softer decor accents if you want a classic style.'],
      Corporate: ['Marquee coverage and extra chairs help with structured guest flow.', 'Backdrop works well for brand photos and welcome signage.', 'Keep decor lighter and allocate more budget to seating and layout.'],
      'Baby Shower': ['Backdrop + cake stand is a strong baby shower combo.', 'Soft balloon styling adds color without cluttering the venue.', 'Standard package is usually enough unless your guest list is large.'],
      'Family Gathering': ['Basic or Standard package usually covers flexible seating well.', 'Add extra chairs if guest count may grow close to the event date.', 'Fairy lights give relaxed evening gatherings a warmer feel.']
    };

    function getBookings(){
      try{ return JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings)) || []; }
      catch(err){ return []; }
    }
    function setBookings(bookings){
      localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
    }
    function getInventory(){
      try{
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.inventory));
        return stored ? { ...DEFAULT_INVENTORY, ...stored } : { ...DEFAULT_INVENTORY };
      }catch(err){
        return { ...DEFAULT_INVENTORY };
      }
    }
    function setInventory(inventory){
      localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventory));
    }
    function formatMoney(value){
      return `$${Number(value || 0).toFixed(0)} AUD`;
    }
    function formatDate(value){
      if(!value) return '—';
      const dt = new Date(value + 'T00:00:00');
      if(Number.isNaN(dt.getTime())) return value;
      return dt.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
    }
    function downloadJson(filename, data){
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    function selectedPackageMeta(){
      const option = packageSelect.selectedOptions[0];
      if(!option || !option.value) return null;
      return {
        name: option.value,
        price: Number(option.dataset.price || 0),
        chairs: Number(option.dataset.chairs || 0),
        tables: Number(option.dataset.tables || 0),
        decorations: Number(option.dataset.decorations || 0)
      };
    }
    function selectedExtras(){
      return [...chipToggles].filter(btn => btn.classList.contains('active')).map(btn => ({
        name: btn.dataset.builder,
        price: Number(btn.dataset.price || 0)
      }));
    }
    function calculateNeeds(){
      const meta = selectedPackageMeta();
      const guests = Math.max(1, Number(guestCount.value || 0));
      const tablesExtra = Math.max(0, Math.ceil((guests - 24) / 8));
      const chairsExtra = guests > 24 ? Math.ceil((guests - 24) / 4) * 2 : 0;
      const extras = selectedExtras();
      const decorBonus = extras.some(item => item.name === 'Backdrop') ? 1 : 0;
      const extraChairBonus = extras.some(item => item.name === 'Extra Chairs') ? 12 : 0;
      if(!meta){
        return { meta:null, total:0, extras, builderTotal: extras.reduce((s,e)=>s+e.price,0), chairs:0, tables:0, decorations:0, ok:true };
      }
      const builderTotal = extras.reduce((s, item) => s + item.price, 0);
      const overtime = Math.max(0, Number(setupHours.value || 0) - 4) * 18;
      const chairs = meta.chairs + chairsExtra + extraChairBonus;
      const tables = meta.tables + Math.max(0, tablesExtra);
      const decorations = meta.decorations + decorBonus + (extras.some(item => item.name === 'Balloon Arch') ? 1 : 0) + (extras.some(item => item.name === 'Fairy Lights') ? 1 : 0);
      return {
        meta,
        extras,
        builderTotal,
        chairs,
        tables,
        decorations,
        total: meta.price + builderTotal + overtime,
        ok:true
      };
    }
    function evaluateAvailability(){
      const calc = calculateNeeds();
      const stock = getInventory();
      const ok = calc.chairs <= stock.chairs && calc.tables <= stock.tables && calc.decorations <= stock.decorations && !!calc.meta;
      calc.ok = ok;
      return { ...calc, stock };
    }
    function updateSuggestions(){
      const value = eventType.value;
      suggestionsList.innerHTML = '';
      const suggestions = EVENT_SUGGESTIONS[value] || [];
      suggestionLead.textContent = suggestions.length ? `Recommended extras for ${value}.` : 'Choose an event type to see recommended extras.';
      suggestions.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        suggestionsList.appendChild(li);
      });
    }
    function syncPackageCardHighlight(){
      const selected = packageSelect.value;
      packageCards.forEach(card => {
        card.classList.toggle('selected', card.dataset.packageCard === selected);
      });
    }
    function updateQuoteUI(){
      const state = evaluateAvailability();
      builderTotal.textContent = formatMoney(state.builderTotal);
      liveTotal.textContent = formatMoney(state.total);
      liveSummaryText.textContent = state.meta ? `${state.meta.name} • ${Number(guestCount.value || 0)} guests • ${state.extras.length} add-on(s)` : 'Choose a package to start your quote.';
      chairsNeed.textContent = state.chairs;
      tablesNeed.textContent = state.tables;
      decorNeed.textContent = state.decorations;
      chairsStock.textContent = `Stock: ${state.stock.chairs}`;
      tablesStock.textContent = `Stock: ${state.stock.tables}`;
      decorStock.textContent = `Stock: ${state.stock.decorations}`;
      availabilityStatus.textContent = state.meta ? (state.ok ? 'Available locally' : 'Low inventory warning') : 'Ready to quote';
      availabilityText.textContent = state.meta ? (state.ok ? 'Light inventory check passed for this browser.' : 'Inventory is low for the selected package/extras combination.') : 'Pick a date and package to check light inventory.';
      inventoryWarning.classList.toggle('visible', !!state.meta && !state.ok);
      syncPackageCardHighlight();
      return state;
    }
    function renderAnalytics(){
      const bookings = getBookings();
      const totalRevenue = bookings.reduce((sum, item) => sum + Number(item.total || 0), 0);
      const counts = bookings.reduce((acc, item) => {
        acc[item.package] = (acc[item.package] || 0) + 1;
        return acc;
      }, {});
      const topPackage = Object.entries(counts).sort((a,b) => b[1] - a[1])[0]?.[0] || '—';
      analyticsBookings.textContent = String(bookings.length);
      analyticsTopPackage.textContent = topPackage;
      analyticsRevenue.textContent = formatMoney(totalRevenue);
      adminBookingsCount.textContent = `${bookings.length} saved`;
      adminTopPackage.textContent = topPackage;
      const inv = getInventory();
      adminInventoryLeft.textContent = `Chairs ${inv.chairs} • Tables ${inv.tables} • Decor ${inv.decorations}`;
    }
    function renderAdminTable(){
      const bookings = getBookings();
      adminBookingsTableBody.innerHTML = '';
      adminEmptyState.style.display = bookings.length ? 'none' : 'block';
      bookings.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong style="color:var(--text)">${item.name}</strong><br>${item.phone}</td>
          <td>${formatDate(item.eventDate)}</td>
          <td>${item.package}</td>
          <td>${formatMoney(item.total)}</td>
          <td>${item.eventType}</td>
          <td>${item.venue}</td>
          <td><button class="icon-btn" type="button" data-delete-booking="${item.id}">Delete</button></td>
        `;
        adminBookingsTableBody.appendChild(row);
      });
    }
    function renderInvoice(booking){
      if(!booking) return;
      invoicePreview.classList.add('visible');
      invoiceClient.textContent = `${booking.name} • ${booking.phone}`;
      invoiceDate.textContent = formatDate(booking.eventDate);
      invoicePackage.textContent = booking.package;
      invoiceExtras.textContent = booking.extras.length ? booking.extras.map(item => `${item.name} (${formatMoney(item.price)})`).join(', ') : 'None';
      invoiceVenue.textContent = booking.venue;
      invoiceInventory.textContent = `${booking.inventory.chairs} chairs • ${booking.inventory.tables} tables • ${booking.inventory.decorations} decorations`;
      invoiceTotal.textContent = formatMoney(booking.total);
      invoiceStatus.textContent = booking.status || 'Draft saved locally';
    }
    function buildWhatsappLink(booking){
      const lines = [
        'Hi Fiesta Party Hire Yeppoon!',
        'I would like to book / confirm this event:',
        `Name: ${booking.name}`,
        `Phone: ${booking.phone}`,
        `Email: ${booking.email}`,
        `Date: ${formatDate(booking.eventDate)}`,
        `Event Type: ${booking.eventType}`,
        `Package: ${booking.package}`,
        `Extras: ${booking.extras.length ? booking.extras.map(item => item.name).join(', ') : 'None'}`,
        `Venue: ${booking.venue}`,
        `Total: ${formatMoney(booking.total)}`,
        `Notes: ${booking.message || 'N/A'}`
      ];
      return `https://wa.me/61427944574?text=${encodeURIComponent(lines.join('
'))}`;
    }
    function latestBookingDraft(){
      try{ return JSON.parse(localStorage.getItem(STORAGE_KEYS.latest)); }
      catch(err){ return null; }
    }
    function collectBookingFromForm(){
      const state = updateQuoteUI();
      const formData = Object.fromEntries(new FormData(bookingForm).entries());
      const today = new Date();
      today.setHours(0,0,0,0);
      const selected = formData.eventDate ? new Date(formData.eventDate + 'T00:00:00') : null;
      if(!formData.name?.trim() || !formData.phone?.trim() || !formData.email?.trim() || !formData.eventDate || !formData.eventType || !formData.package || !formData.venue?.trim()){
        showToast('Please complete all required booking fields.');
        return null;
      }
      if(!selected || Number.isNaN(selected.getTime()) || selected < today){
        showToast('Please choose a valid future event date.');
        return null;
      }
      if(!state.meta){
        showToast('Please choose a package first.');
        return null;
      }
      if(!state.ok){
        showToast('Inventory is too low for this booking.');
        return null;
      }
      return {
        id: `${Date.now()}-${Math.random().toString(16).slice(2,8)}`,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        eventDate: formData.eventDate,
        eventType: formData.eventType,
        package: formData.package,
        guestCount: Number(formData.guestCount || 0),
        setupHours: Number(formData.setupHours || 0),
        venue: formData.venue.trim(),
        message: (formData.message || '').trim(),
        extras: state.extras,
        inventory: {
          chairs: state.chairs,
          tables: state.tables,
          decorations: state.decorations
        },
        total: state.total,
        status: 'Draft saved locally',
        createdAt: new Date().toISOString()
      };
    }
    function saveBooking(booking){
      const bookings = getBookings();
      bookings.unshift(booking);
      setBookings(bookings);
      const inventory = getInventory();
      inventory.chairs -= booking.inventory.chairs;
      inventory.tables -= booking.inventory.tables;
      inventory.decorations -= booking.inventory.decorations;
      setInventory(inventory);
      localStorage.setItem(STORAGE_KEYS.latest, JSON.stringify(booking));
      renderInvoice(booking);
      renderAnalytics();
      renderAdminTable();
      updateQuoteUI();
    }
    function deleteBooking(id){
      const bookings = getBookings();
      const booking = bookings.find(item => item.id === id);
      if(!booking) return;
      const next = bookings.filter(item => item.id !== id);
      setBookings(next);
      const inventory = getInventory();
      inventory.chairs += Number(booking.inventory?.chairs || 0);
      inventory.tables += Number(booking.inventory?.tables || 0);
      inventory.decorations += Number(booking.inventory?.decorations || 0);
      setInventory(inventory);
      renderAnalytics();
      renderAdminTable();
      updateQuoteUI();
      showToast('Booking deleted.');
    }
    function showToast(message){
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(showToast._timer);
      showToast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
    }
    function openModal(){
      bookingModal.classList.add('active');
      bookingModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    }
    function closeModal(){
      bookingModal.classList.remove('active');
      bookingModal.setAttribute('aria-hidden', 'true');
      if(!adminModal.classList.contains('active')) document.body.classList.remove('modal-open');
    }
    function openAdmin(){
      adminModal.classList.add('active');
      adminModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      renderAnalytics();
      renderAdminTable();
    }
    function closeAdminPanel(){
      adminModal.classList.remove('active');
      adminModal.setAttribute('aria-hidden', 'true');
      if(!bookingModal.classList.contains('active')) document.body.classList.remove('modal-open');
    }
    function scrollFieldIntoView(target){
      if(!target) return;
      setTimeout(() => {
        try{ target.scrollIntoView({ behavior:'smooth', block:'center' }); }catch(err){}
      }, 250);
    }

    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    if(savedTheme === 'light'){
      body.setAttribute('data-theme', 'light');
      themeToggle.textContent = '☀';
    }
    themeToggle.addEventListener('click', () => {
      const isLight = body.getAttribute('data-theme') === 'light';
      if(isLight){
        body.removeAttribute('data-theme');
        localStorage.setItem(STORAGE_KEYS.theme, 'dark');
        themeToggle.textContent = '☾';
      }else{
        body.setAttribute('data-theme', 'light');
        localStorage.setItem(STORAGE_KEYS.theme, 'light');
        themeToggle.textContent = '☀';
      }
    });
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('open')));

    const sections = [...document.querySelectorAll('section[id]')];
    const navAnchors = [...navLinks.querySelectorAll('a[href^="#"]')];
    function updateActiveNav(){
      const scrollPos = window.scrollY + 140;
      let currentId = '';
      sections.forEach(section => { if(scrollPos >= section.offsetTop){ currentId = section.id; } });
      navAnchors.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + currentId));
    }
    window.addEventListener('scroll', updateActiveNav, { passive:true });
    updateActiveNav();
    document.addEventListener('click', (e) => {
      const clickedInsideNav = navLinks.contains(e.target) || menuToggle.contains(e.target);
      if(!clickedInsideNav) navLinks.classList.remove('open');
    });

    openBooking?.addEventListener('click', openModal);
    closeBooking?.addEventListener('click', closeModal);
    closeAdmin?.addEventListener('click', closeAdminPanel);
    bookingModal?.addEventListener('click', (e) => { if(e.target === bookingModal) closeModal(); });
    adminModal?.addEventListener('click', (e) => { if(e.target === adminModal) closeAdminPanel(); });

    packageButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const pkg = btn.dataset.package || '';
        const price = btn.dataset.price || '0';
        quickPackage.value = pkg;
        [...packageSelect.options].forEach(option => {
          if(option.value === pkg){ packageSelect.value = option.value; }
        });
        updateQuoteUI();
        openModal();
      });
    });

    galleryCards.forEach(card => {
      card.addEventListener('click', () => {
        lightboxImage.src = card.getAttribute('data-image');
        lightbox.classList.add('active');
      });
    });
    closeLightbox.addEventListener('click', () => {
      lightbox.classList.remove('active');
      lightboxImage.src = '';
    });
    lightbox.addEventListener('click', (e) => {
      if(e.target === lightbox){ lightbox.classList.remove('active'); lightboxImage.src = ''; }
    });
    galleryFilters.forEach(btn => {
      btn.addEventListener('click', () => {
        galleryFilters.forEach(item => item.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        galleryCards.forEach(card => {
          const visible = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('hidden', !visible);
        });
      });
    });

    chipToggles.forEach(btn => btn.addEventListener('click', () => { btn.classList.toggle('active'); updateQuoteUI(); }));
    [packageSelect, guestCount, setupHours, eventType, eventDate].forEach(el => el.addEventListener('input', () => { updateQuoteUI(); updateSuggestions(); }));
    venueInput.addEventListener('input', updateQuoteUI);

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const booking = collectBookingFromForm();
      if(!booking) return;
      submitBookingBtn.classList.add('loading-state');
      submitBookingBtn.textContent = 'Saving...';
      setTimeout(() => {
        saveBooking(booking);
        submitBookingBtn.classList.remove('loading-state');
        submitBookingBtn.textContent = 'Save Booking';
        showToast('Booking saved and invoice generated.');
      }, 550);
    });

    openWhatsappQuote.addEventListener('click', () => {
      const booking = collectBookingFromForm() || latestBookingDraft();
      if(!booking){
        showToast('Complete the booking form first.');
        return;
      }
      renderInvoice(booking);
      window.open(buildWhatsappLink(booking), '_blank', 'noopener');
    });

    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('quickName').value.trim(),
        package: document.getElementById('quickPackage').value,
        details: document.getElementById('quickDetails').value.trim(),
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.quick, JSON.stringify(data));
      if(data.package){ packageSelect.value = data.package; }
      if(data.name && !document.getElementById('name').value){ document.getElementById('name').value = data.name; }
      updateQuoteUI();
      showToast('Quick inquiry saved locally.');
      quickForm.reset();
      closeModal();
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });

    adminBookingsTableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-delete-booking]');
      if(!btn) return;
      deleteBooking(btn.dataset.deleteBooking);
    });
    exportAdminJson.addEventListener('click', () => downloadJson('fiesta-bookings.json', getBookings()));
    downloadBookingsBtn.addEventListener('click', () => downloadJson('fiesta-bookings.json', getBookings()));
    resetInventoryBtn.addEventListener('click', () => {
      setInventory({ ...DEFAULT_INVENTORY });
      renderAnalytics();
      updateQuoteUI();
      showToast('Inventory reset to default stock.');
    });
    clearBookingsBtn.addEventListener('click', () => {
      setBookings([]);
      setInventory({ ...DEFAULT_INVENTORY });
      renderAnalytics();
      renderAdminTable();
      updateQuoteUI();
      invoicePreview.classList.remove('visible');
      showToast('All locally saved bookings deleted.');
    });
    printInvoiceBtn.addEventListener('click', () => {
      if(!invoicePreview.classList.contains('visible')){
        showToast('Save a booking first to generate the invoice.');
        return;
      }
      window.print();
    });

    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape'){
        closeModal();
        closeAdminPanel();
        lightbox.classList.remove('active');
        lightboxImage.src = '';
      }
      if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a'){
        e.preventDefault();
        openAdmin();
      }
    });
    document.querySelectorAll('input, textarea, select').forEach(el => el.addEventListener('focus', () => scrollFieldIntoView(el)));

    window.addEventListener('load', () => {
      const splash = document.getElementById('appReadySplash');
      const latest = latestBookingDraft();
      if(latest){ renderInvoice(latest); }
      renderAnalytics();
      renderAdminTable();
      updateSuggestions();
      updateQuoteUI();
      setTimeout(() => {
        if(splash){
          splash.style.opacity = '0';
          splash.style.visibility = 'hidden';
          setTimeout(() => splash.remove(), 400);
        }
      }, 450);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealEls.forEach(el => observer.observe(el));
