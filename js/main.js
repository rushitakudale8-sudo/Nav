(function () {
  const header = document.querySelector(".site-header");
  const menuBtn = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const searchBtn = document.querySelector(".search-toggle");
  const searchPanel = document.querySelector(".search-panel");
  const searchInput = document.querySelector("#site-search");
  const searchResults = document.querySelector("#search-results");
  const year = document.querySelector("[data-year]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) year.textContent = new Date().getFullYear();

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", function () {
      const open = mobileNav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
  }

  if (searchBtn && searchPanel) {
    searchBtn.addEventListener("click", function () {
      const open = searchPanel.classList.toggle("open");
      searchBtn.setAttribute("aria-expanded", String(open));
      if (open && searchInput) searchInput.focus();
    });
  }

  document.addEventListener("click", function (event) {
    if (searchPanel && searchBtn && !searchPanel.contains(event.target) && !searchBtn.contains(event.target)) {
      searchPanel.classList.remove("open");
      searchBtn.setAttribute("aria-expanded", "false");
    }
  });

  function renderSearch(query) {
    if (!searchResults || !window.NSB_DATA) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      searchResults.innerHTML = "";
      return;
    }
    const items = window.NSB_DATA.products
      .filter(function (item) {
        return (item.name + " " + item.summary).toLowerCase().indexOf(q) !== -1;
      })
      .slice(0, 8);
    searchResults.innerHTML = items.length
      ? items.map(function (item) {
          return '<li><a href="product.html?id=' + item.id + '">' + item.name + "</a></li>";
        }).join("")
      : "<li>No matching products</li>";
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      renderSearch(searchInput.value);
    });
  }

  if (!reduceMotion) {
    const cards = document.querySelectorAll(".card, .trust-item, .info-card, .form-card, .about-panel, .hero-card");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      cards.forEach(function (card) { io.observe(card); });
    } else {
      cards.forEach(function (card) { card.classList.add("reveal"); });
    }
  }

  const form = document.querySelector("#enquiry-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const status = document.querySelector("#form-status");
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const email = String(data.get("email") || "").trim();
      const required = String(data.get("required") || "").trim();
      const message = String(data.get("message") || "").trim();

      if (!name || !phone || !email || !required || !message) {
        if (status) {
          status.textContent = "Please complete all fields.";
          status.className = "form-status err";
        }
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (status) {
          status.textContent = "Please enter a valid email address.";
          status.className = "form-status err";
        }
        return;
      }

      const body = [
        "Name: " + name,
        "Phone: " + phone,
        "Email: " + email,
        "Product / Service Required: " + required,
        "",
        message
      ].join("\n");

      window.location.href = "mailto:service.navsanjivan10@gmail.com?subject=" +
        encodeURIComponent("Website enquiry from " + name) +
        "&body=" + encodeURIComponent(body);

      if (status) {
        status.textContent = "Your email app should open with the enquiry. If it does not, write to service.navsanjivan10@gmail.com.";
        status.className = "form-status ok";
      }
      form.reset();
    });
  }

  const grid = document.querySelector("[data-product-grid]");
  if (grid && window.NSB_DATA) {
    const type = grid.getAttribute("data-product-grid");
    const groupFilter = new URLSearchParams(window.location.search).get("group");
    const source = type === "groups" ? window.NSB_DATA.groups : window.NSB_DATA.products;
    const items = groupFilter
      ? source.filter(function (item) { return item.group === groupFilter || item.id === groupFilter; })
      : source;

    grid.innerHTML = items.map(function (item) {
      const href = type === "groups" ? "products.html?group=" + item.id : "product.html?id=" + item.id;
      return (
        '<a class="card" href="' + href + '">' +
          '<img src="' + item.image + '" alt="' + item.name + '" width="400" height="320" loading="lazy">' +
          '<div class="card-body"><h3>' + item.name + "</h3><p>" + (item.desc || item.summary) + "</p></div>" +
        "</a>"
      );
    }).join("");
  }

  const detail = document.querySelector("[data-product-detail]");
  if (detail && window.NSB_DATA) {
    const id = new URLSearchParams(window.location.search).get("id");
    const product = window.NSB_DATA.products.find(function (item) { return item.id === id; }) || window.NSB_DATA.products[0];
    const group = window.NSB_DATA.groups.find(function (item) { return item.id === product.group; });
    document.title = product.name + " | Navsanjivani Surgical & Nursing Beuro";
    detail.innerHTML =
      '<div class="hero-card"><img src="' + product.image + '" alt="' + product.name + '" width="640" height="480"></div>' +
      "<div>" +
        '<p class="section-kicker">' + (group ? group.name : "Our Products") + "</p>" +
        "<h1 class=\"reveal float-title\">" + product.name + "</h1>" +
        "<p>" + product.summary + "</p>" +
        '<p class="disclaimer">Product information only — not medical advice. Selection should be based on a clinician’s guidance where required.</p>' +
        '<div class="hero-actions">' +
          '<a class="btn btn-primary" href="contact.html?product=' + encodeURIComponent(product.name) + '">Send Enquiry</a>' +
          '<a class="btn btn-secondary" href="products.html">Back to products</a>' +
        "</div>" +
      "</div>";
  }

  const requiredField = document.querySelector("#required");
  const prefill = new URLSearchParams(window.location.search).get("product");
  if (requiredField && prefill) requiredField.value = prefill;

  if (header) {
    window.addEventListener("scroll", function () {
      header.style.boxShadow = window.scrollY > 8 ? "0 8px 24px rgba(23,74,99,.08)" : "none";
    });
  }
})();
