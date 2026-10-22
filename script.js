"use strict";

/* ==========================================================
   Heitzinger KFZ-Werkstatt – Skripte
   1. Mobiles Menü
   2. Heutigen Wochentag hervorheben + "Jetzt geöffnet"-Anzeige
   3. Kontaktformular prüfen (öffnet das E-Mail-Programm)
   4. Jahreszahl im Footer
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initOpeningHours();
    initContactForm();
    document.getElementById("year").textContent = new Date().getFullYear();
});

/* ---------- 1. Mobiles Menü ---------- */
function initNav() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("mainNav");

    const setOpen = (open) => {
        nav.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.querySelector(".sr-only").textContent = open ? "Menü schließen" : "Menü öffnen";
    };

    toggle.addEventListener("click", () => {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Menü schließen, wenn ein Link angeklickt wird
    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setOpen(false));
    });

    // Menü mit Escape schließen
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setOpen(false);
    });
}

/* ---------- 2. Öffnungszeiten ---------- */
function initOpeningHours() {
    // Öffnungszeiten in Minuten ab Mitternacht. 0 = Sonntag ... 6 = Samstag
    // Hier anpassen, wenn sich die Zeiten ändern (auch in der HTML-Tabelle!).
    const hours = {
        0: null,
        1: [7 * 60 + 30, 17 * 60],
        2: [7 * 60 + 30, 17 * 60],
        3: [7 * 60 + 30, 17 * 60],
        4: [7 * 60 + 30, 17 * 60],
        5: [7 * 60 + 30, 14 * 60],
        6: null
    };

    const now = new Date();
    const day = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();

    const row = document.querySelector(`#hoursTable tr[data-day="${day}"]`);
    if (row) row.classList.add("today");

    const status = document.getElementById("openStatus");
    const today = hours[day];

    if (today && minutes >= today[0] && minutes < today[1]) {
        status.textContent = `Jetzt geöffnet bis ${formatTime(today[1])} Uhr`;
        status.classList.add("is-open");
    } else {
        status.textContent = "Derzeit geschlossen";
        status.classList.add("is-closed");
    }
}

function formatTime(totalMinutes) {
    const h = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const m = String(totalMinutes % 60).padStart(2, "0");
    return `${h}:${m}`;
}

/* ---------- 3. Kontaktformular ---------- */
function initContactForm() {
    const form = document.getElementById("contactForm");
    const success = document.getElementById("formSuccess");

    const rules = {
        name: {
            test: (v) => v.trim().length >= 2,
            message: "Bitte geben Sie Ihren Namen ein."
        },
        phone: {
            test: (v) => {
                const value = v.trim();
                const isMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
                const isPhone = /^[+()\d\s\/-]{6,}$/.test(value);
                return isMail || isPhone;
            },
            message: "Bitte geben Sie eine Telefonnummer oder E-Mail-Adresse ein, unter der wir Sie erreichen."
        },
        message: {
            test: (v) => v.trim().length >= 10,
            message: "Bitte beschreiben Sie kurz, was an Ihrem Auto zu tun ist (mindestens 10 Zeichen)."
        }
    };

    const validateField = (id) => {
        const input = document.getElementById(id);
        const error = document.getElementById(`${id}Error`);
        const valid = rules[id].test(input.value);

        input.closest(".field").classList.toggle("invalid", !valid);
        input.setAttribute("aria-invalid", String(!valid));
        error.textContent = valid ? "" : rules[id].message;
        return valid;
    };

    // Beim Verlassen eines Feldes sofort prüfen
    Object.keys(rules).forEach((id) => {
        document.getElementById(id).addEventListener("blur", () => validateField(id));
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        success.textContent = "";

        const results = Object.keys(rules).map(validateField);
        if (results.includes(false)) {
            const firstInvalid = form.querySelector(".invalid input, .invalid textarea");
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        const data = new FormData(form);
        const body = [
            `Name: ${data.get("name")}`,
            `Kontakt: ${data.get("phone")}`,
            `Fahrzeug: ${data.get("car") || "nicht angegeben"}`,
            "",
            data.get("message")
        ].join("\n");

        // Öffnet das E-Mail-Programm des Besuchers. E-Mail-Adresse anpassen!
        const mailto = `mailto:office@heitzinger.example` +
            `?subject=${encodeURIComponent("Terminanfrage über die Webseite")}` +
            `&body=${encodeURIComponent(body)}`;

        window.location.href = mailto;

        success.textContent = "Danke! Ihr E-Mail-Programm öffnet sich mit Ihrer Anfrage. Bitte senden Sie sie dort ab.";
        form.reset();
    });
}