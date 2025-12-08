document.addEventListener("DOMContentLoaded", () => {
    const svg = document.getElementById("timeline-arcs");
    const timeline = document.querySelector(".timeline");
    const line = document.querySelector(".line");

    if (!svg || !timeline || !line) return;

    const periodPoints = [...document.querySelectorAll('.main-point[data-period]')];

    function collectPairs() {
        const starts = {};
        const ends = {};

        periodPoints.forEach(point => {
            const roles = point.dataset.period.split(" ");
            roles.forEach(role => {
                const [type, num] = role.split("-");
                if (type === "start") starts[num] = point;
                else if (type === "end") ends[num] = point;
            });
        });

        return { starts, ends };
    }

    function getCenterCoords(el) {
        const rect = el.getBoundingClientRect();
        const containerRect = timeline.getBoundingClientRect();
        const lineRect = line.getBoundingClientRect();

        const lineY = (lineRect.top - containerRect.top) + lineRect.height / 2;

        return {
            x: rect.left - containerRect.left + rect.width / 2 + timeline.scrollLeft,
            y: lineY
        };
    }

    function drawAllArcs() {
        svg.innerHTML = "";
        const { starts, ends } = collectPairs();

        Object.keys(starts).forEach(num => {
            if (!ends[num]) return;

            const start = starts[num];
            const end = ends[num];

            const s = getCenterCoords(start);
            const e = getCenterCoords(end);

            const arc = document.createElementNS("http://www.w3.org/2000/svg", "path");

            const arcHeight = 150;
            const cy = Math.min(s.y, e.y) - arcHeight;

            const cx1 = s.x + (e.x - s.x) * 0;
            const cx2 = s.x + (e.x - s.x) * 1;

            const d = `M ${s.x} ${s.y}
                    C ${cx1} ${cy},
                        ${cx2} ${cy},
                        ${e.x} ${e.y}`;


            arc.setAttribute("d", d);
            arc.setAttribute("stroke", "black");
            arc.setAttribute("stroke-width", "1");
            arc.setAttribute("fill", "none");

            svg.appendChild(arc);
        });
    }

    function positionPeriodNames() {
        const { starts, ends } = collectPairs();
        const names = document.querySelectorAll(".period-name");

        names.forEach(name => {
            const num = name.dataset.name;
            if (!starts[num] || !ends[num]) return;

            const s = getCenterCoords(starts[num]);
            const e = getCenterCoords(ends[num]);

            const centerX = (s.x + e.x) / 2;
            name.style.position = "absolute";
            name.style.left = `${centerX - name.offsetWidth / 2}px`;
        });
    }

    function drawAll() {
        drawAllArcs();
        positionPeriodNames();
    }

    drawAll();

    const root = document.getElementById('timeline-root');
    const slider = document.getElementById('line-size');
    const fragments = document.querySelectorAll('.fragment');
    root.classList.remove('scale-0', 'scale-1', 'scale-2', 'scale-3');
    root.classList.add('scale-0');
    slider.value = 0;
    setTimeout(drawAll, 100);

    slider.addEventListener('input', () => {
        root.classList.remove('scale-0', 'scale-1', 'scale-2', 'scale-3');
        root.classList.add('scale-' + slider.value);

        setTimeout(drawAll, 100);

        fragments.style.width = 0;
    });

    window.addEventListener("resize", drawAll);
    timeline.addEventListener("scroll", drawAll);
    slider.addEventListener('input', drawAll);


    let isDragging = false;
    let startX;
    let scrollLeft;

    timeline.addEventListener('mousedown', (e) => {
        // запрещаем drag на заголовках, абзацах, списках и горизонтальных линиях
        const forbiddenTags = ['H2', 'P', 'UL', 'HR'];
        if (forbiddenTags.includes(e.target.tagName)) return;

        isDragging = true;
        startX = e.pageX - timeline.offsetLeft;
        scrollLeft = timeline.scrollLeft;

        timeline.style.cursor = 'grabbing';
        timeline.style.userSelect = 'none';
    });

    timeline.addEventListener('mouseleave', () => {
        isDragging = false;
        timeline.style.cursor = '';
        timeline.style.userSelect = '';
    });

    timeline.addEventListener('mouseup', () => {
        isDragging = false;
        timeline.style.cursor = '';
        timeline.style.userSelect = '';
    });

    timeline.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - timeline.offsetLeft;
        const walk = (x - startX) * 1; // скорость прокрутки
        timeline.scrollLeft = scrollLeft - walk;
    });



});

