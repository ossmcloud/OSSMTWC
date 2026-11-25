// Nexus user help - builds the side navigation on every page
// @@NOTE: opened from the File Cabinet / disk the links are relative files; served by oTWC_help_sl.js, window.NX_HELP is set:
//         { base: <suitelet url>, page: <current page>, staff: <true if employee> } and links go through the Suitelet (?page=...)
(function () {
    var NAV = [
        { group: 'Start here' },
        { href: 'index.html', text: 'Welcome to Nexus' },
        { href: 'getting-started.html', text: 'Getting started' },
        { group: 'Sites & equipment' },
        { href: 'site-locator.html', text: 'Site Locator & Site page' },
        { href: 'equipment.html', text: 'Site Equipment' },
        { group: 'Requests' },
        { href: 'space-request.html', text: 'Space Requests (SRF)' },
        { href: 'sds.html', text: 'Site Data Sheets (SDS)' },
        { href: 'site-access.html', text: 'Site Access (SAF)' },
        { href: 'trouble-tickets.html', text: 'Trouble Tickets' },
        { group: 'Companies & people' },
        { href: 'company-profile.html', text: 'Company Profile & Accreditation' },
        // @@IMPORTANT: 'staff' pages are only served to employees by oTWC_help_sl.js (STAFF_PAGES), keep the two lists in step
        { group: 'Towercom staff', staff: true },
        { href: 'srf-workflow.html', text: 'SRF Workflow', staff: true },
        { href: 'staff-netsuite.html', text: 'NetSuite back-office forms', staff: true },
        { group: 'Reference' },
        { href: 'files.html', text: 'Files & attachments' },
        { href: 'statuses.html', text: 'Status reference' },
        { href: 'troubleshooting.html', text: 'Messages & troubleshooting' },
        { href: 'glossary.html', text: 'Glossary' }
    ];
    var served = window.NX_HELP || null;
    var current = served ? served.page : ((location.pathname.split('/').pop() || 'index.html').toLowerCase());
    var showStaff = served ? served.staff === true : true;
    var link = function (href) {
        return served ? served.base + '&page=' + href : href;
    };
    var html = '<div class="brand">Nexus</div><div class="brand-sub">User Help &middot; Towercom portal</div>';
    NAV.forEach(function (n) {
        if (n.staff && !showStaff) { return; }
        if (n.group) { html += '<div class="group">' + n.group + '</div>'; return; }
        html += '<a href="' + link(n.href).replace(/&/g, '&amp;') + '"' + (n.href.toLowerCase() === current ? ' class="active"' : '') + '>' + n.text + '</a>';
    });
    var nav = document.querySelector('nav.side');
    if (nav) { nav.innerHTML = html; }
})();
