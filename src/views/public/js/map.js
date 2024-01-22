$(document).ready(() => {
    const canvas = $('#map-canvas')[0];
    const ctx = canvas.getContext('2d');

    const svgFile = '/maps/franklin.svg';
    const img = new Image();
    img.src = svgFile;

    let scale = 1;
    let redrawScheduled = false;
    let translation = { x: 0, y: 0 };

    const navZoomMin = 0.45;
    const navZoomMax = 2.0;

    // update canvas size to window size
    function updateCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // recalc translation to keep map centered
        translation = {
            x: canvas.width / 2 - (scale * img.width) / 2,
            y: canvas.height / 2 - (scale * img.height) / 2
        };
        scheduleRedraw();
    }

    // schedule redraw for smoother rendering
    function scheduleRedraw() {
        if (!redrawScheduled) {
            redrawScheduled = true;
            requestAnimationFrame(drawMap);
        }
    }

    window.addEventListener('resize', updateCanvasSize);

    // draw map on the canvas
    function drawMap() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(scale, 0, 0, scale, translation.x, translation.y);
        ctx.drawImage(img, 0, 0, img.width, img.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform to stop weird edge trails
        redrawScheduled = false;
    }

    img.onload = () => {
        updateCanvasSize(); // set initial canvas size

        let isDragging = false;
        let startCoords = { x: 0, y: 0 };

        // panning and zoomin
        canvas.addEventListener('mousedown', startDrag);
        canvas.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        canvas.addEventListener('wheel', zoom);

        function startDrag(e) {
            isDragging = true;
            startCoords = { x: e.clientX, y: e.clientY };
            scheduleRedraw();
        }

        function drag(e) {
            if (!isDragging) return;
            const dx = e.clientX - startCoords.x;
            const dy = e.clientY - startCoords.y;
            translation.x += dx;
            translation.y += dy;
            startCoords = { x: e.clientX, y: e.clientY };
            scheduleRedraw();
        }

        function endDrag() {
            isDragging = false;
        }

        // zoomin
        function zoom(e) {
            const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
            // calc new scale
            const newScale = Math.max(navZoomMin, Math.min(navZoomMax, scale * scaleFactor));

            if (newScale === navZoomMin || newScale === navZoomMax) {
                return; // do nothing at scale limits
            }

            const cursor = getCursorPosition(e);
            // calc the adjustment to keep the cursor fixed
            const adjustX = cursor.x - translation.x;
            const adjustY = cursor.y - translation.y;

            // update translation and scale
            translation.x = cursor.x - adjustX * newScale / scale;
            translation.y = cursor.y - adjustY * newScale / scale;
            scale = newScale;

            scheduleRedraw();
        }

        // get cursor position relative to canvas
        function getCursorPosition(e) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            return { x, y };
        }

        $('#nav-home').on('click', e => {
            translation = { x: 0, y: 0 };
            scale = 1;
            updateCanvasSize();
            scheduleRedraw();
        });

        $('#nav-plus').on('click', e => {
            const scaleFactor = 1.1;
            const cursor = { x: canvas.width / 2, y: canvas.height / 2 };
            const newScale = Math.max(navZoomMin, Math.min(navZoomMax, scale * scaleFactor));

            translation.x = cursor.x - (cursor.x - translation.x) * newScale / scale;
            translation.y = cursor.y - (cursor.y - translation.y) * newScale / scale;
            scale = newScale;

            scheduleRedraw();
        });

        $('#nav-minus').on('click', e => {
            const scaleFactor = 0.9;
            const cursor = { x: canvas.width / 2, y: canvas.height / 2 };
            const newScale = Math.max(navZoomMin, Math.min(navZoomMax, scale * scaleFactor));

            translation.x = cursor.x - (cursor.x - translation.x) * newScale / scale;
            translation.y = cursor.y - (cursor.y - translation.y) * newScale / scale;
            scale = newScale;

            scheduleRedraw();
        });

        drawMap(); // initial drawing
    };
});
