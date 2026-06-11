    let hasIPv6 = false;
    let hasIPv4 = false;

    function showIPv6Warning() {
        if (hasIPv4 && !hasIPv6) {
            document.getElementById('ipv6-warning').classList.add('visible');
        }
    }

    function fetchIP(ipType) {
        const elementId = `ipv${ipType}`;
        const url = `https://ip${ipType}.xh.nu`;

        fetch(url, {
            method: 'GET',
            mode: 'cors'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const el = document.getElementById(elementId);
            el.innerHTML = data.trim();
            el.classList.add('ip-reveal');
            const btn = document.getElementById(`copy-btn-${ipType}`);
            btn.classList.add('visible');

            if (ipType === 6) {
                hasIPv6 = true;
            } else if (ipType === 4) {
                hasIPv4 = true;
            }

            // Check if we should show the warning after both fetches complete
            setTimeout(showIPv6Warning, 100);
        })
        .catch(error => {
            document.getElementById(elementId).innerHTML =
                `<div class="error">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    <div>No IPv${ipType} connection detected</div>
                </div>`;

            if (ipType === 4) {
                hasIPv4 = false;
            }

            // Check if we should show the warning after both fetches complete
            setTimeout(showIPv6Warning, 100);
        });
    }

    function copyIP(elementId) {
        const el = document.getElementById(elementId);
        const errorEl = el.querySelector('.error');
        if (errorEl) return;

        const text = el.textContent.trim();
        const ipType = elementId.replace('ipv', '');
        const btn = document.getElementById(`copy-btn-${ipType}`);

        navigator.clipboard.writeText(text).then(() => {
            btn.classList.add('copied');
            btn.querySelector('span').textContent = 'Copied!';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.querySelector('span').textContent = 'Copy';
            }, 2000);
        });
    }

    function copyTerminal() {
        const text = 'echo "IPv6: $(curl -s ip6.xh.nu)\\nIPv4: $(curl -s ip4.xh.nu)"';
        const hint = document.querySelector('.terminal-copy-label');

        navigator.clipboard.writeText(text).then(() => {
            hint.textContent = 'copied!';
            setTimeout(() => {
                hint.textContent = 'click to copy';
            }, 2000);
        });
    }

    function setCheckStatus(id, status, text) {
        const icon = document.getElementById(`${id}-icon`);
        const value = document.getElementById(`${id}-status`);

        icon.className = `check-icon ${status}`;

        const icons = {
            pass: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
            warn: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
            fail: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
            info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
        };

        icon.innerHTML = icons[status];
        value.textContent = text;
    }

    function checkHTTPS() {
        if (window.location.protocol === 'https:') {
            setCheckStatus('https', 'pass', 'Encrypted (HTTPS)');
        } else {
            setCheckStatus('https', 'fail', 'Not encrypted');
        }
    }

    function checkUserAgent() {
        const ua = navigator.userAgent;

        let browser = 'Unknown';
        let browserVersion = '';
        if (ua.includes('Firefox/')) {
            browser = 'Firefox';
            browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
        } else if (ua.includes('Edg/')) {
            browser = 'Edge';
            browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || '';
        } else if (ua.includes('Chrome/')) {
            browser = 'Chrome';
            browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
        } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
            browser = 'Safari';
            browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || '';
        } else if (ua.includes('Opera') || ua.includes('OPR/')) {
            browser = 'Opera';
            browserVersion = ua.match(/(?:Opera|OPR)\/([\d.]+)/)?.[1] || '';
        }

        let os = 'Unknown';
        if (ua.includes('Windows NT 10')) {
            os = 'Windows 10/11';
        } else if (ua.includes('Windows NT')) {
            os = 'Windows';
        } else if (ua.includes('Mac OS X')) {
            os = 'macOS';
        } else if (ua.includes('Android')) {
            os = 'Android';
        } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
            os = 'iOS';
        } else if (ua.includes('Linux')) {
            os = 'Linux';
        }

        let device = 'Desktop';
        if (/Mobi|Android.*Mobile|iPhone|iPod/.test(ua)) {
            device = 'Mobile';
        } else if (/iPad|Android(?!.*Mobile)|Tablet/.test(ua)) {
            device = 'Tablet';
        }

        document.getElementById('ua-browser').textContent = browserVersion ? `${browser} ${browserVersion.split('.')[0]}` : browser;
        document.getElementById('ua-os').textContent = os;
        document.getElementById('ua-device').textContent = device;

        const uaCard = document.querySelector('.ua-info');
        const fullUa = document.createElement('div');
        fullUa.className = 'ua-full';
        fullUa.textContent = ua;
        uaCard.appendChild(fullUa);
    }

    function checkConnectionType() {
        if (!navigator.connection) {
            setCheckStatus('connection-type', 'warn', 'Not supported');
            return;
        }

        const conn = navigator.connection;
        const type = conn.type || 'Unknown';
        const effectiveType = conn.effectiveType || '';
        const downlink = conn.downlink ? ` · ${conn.downlink} Mbps` : '';

        let status = type;
        if (effectiveType && effectiveType !== type.toLowerCase()) {
            status += ` (${effectiveType})`;
        }
        status += downlink;

        setCheckStatus('connection-type', 'info', status);
    }

    async function checkLatency() {
        const measurements = [];
        const totalRequests = 5;
        const delay = ms => new Promise(r => setTimeout(r, ms));

        for (let i = 0; i < totalRequests; i++) {
            try {
                const startTime = performance.now();
                const response = await fetch('https://ip.xh.nu', {
                    method: 'GET',
                    mode: 'cors',
                    cache: 'no-cache'
                });
                await response.text();
                measurements.push(performance.now() - startTime);
            } catch {
                // skip failed request
            }
            if (i < totalRequests - 1) await delay(250);
        }

        if (measurements.length === 0) {
            setCheckStatus('latency', 'fail', 'Measurement failed');
        } else {
            measurements.sort((a, b) => a - b);
            const median = Math.round(measurements[Math.floor(measurements.length / 2)]);
            let status = 'pass';
            if (median > 200) status = 'warn';
            if (median > 500) status = 'fail';
            setCheckStatus('latency', status, `~${median} ms`);
        }
    }

    function checkBrowserAwareness() {
        // Screen info
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const colorDepth = window.screen.colorDepth;
        document.getElementById('screen-info').textContent =
            `${screenWidth}×${screenHeight} · ${colorDepth}-bit color`;

        // Viewport info
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        document.getElementById('viewport-info').textContent =
            `${viewportWidth}×${viewportHeight}`;

        // Pixel ratio
        const pixelRatio = window.devicePixelRatio || 1;
        document.getElementById('pixel-ratio').textContent =
            `${pixelRatio}x`;

        // Timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const offset = -new Date().getTimezoneOffset() / 60;
        const offsetStr = offset >= 0 ? `+${offset}` : offset;
        document.getElementById('timezone-info').textContent =
            `${timezone} (UTC${offsetStr})`;

        // Language
        const lang = navigator.language || navigator.userLanguage || 'Unknown';
        const languages = navigator.languages ? navigator.languages.slice(0, 3).join(', ') : lang;
        document.getElementById('language-info').textContent = languages;

        // CPU cores
        const cores = navigator.hardwareConcurrency || 'Unknown';
        document.getElementById('cpu-cores').textContent =
            cores !== 'Unknown' ? `${cores} logical cores` : 'Unknown';

        // Platform
        const platform = navigator.platform || navigator.userAgentData?.platform || 'Unknown';
        document.getElementById('platform-info').textContent = platform;
    }

    function toggleAccordion(header) {
        const item = header.parentElement;
        const wasOpen = item.classList.contains('open');

        document.querySelectorAll('.accordion-item').forEach(i => {
            i.classList.remove('open');
        });

        if (!wasOpen) {
            item.classList.add('open');
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        fetchIP(6);
        fetchIP(4);
        checkHTTPS();
        checkUserAgent();
        checkConnectionType();
        checkLatency();
        checkBrowserAwareness();
    });
