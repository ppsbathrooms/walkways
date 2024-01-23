$(document).ready(() => {
    const canvas = $('#map-canvas')[0];
    const ctx = canvas.getContext('2d');

    const svgFile = '/maps/franklin.svg';
    const img = new Image();
    img.src = svgFile;

    let scale = 1;
    let redrawScheduled = false;
    let translation = { x: 0, y: 0 };

    let userCoords =  null;

    const navZoomMin = 0.3;
    const navZoomMax = 2.0;

    const debug = {
        mouseCoords: false,
        mouseLocation: false,
        drawRefPoints: false,
        refPointRadius: 2
    }

    const referencePoints = {
        franklin : [
            { x: 1646, y: 1230, lat: 45.502753693086014, lng: -122.60773267642072 },
            { x: 1709.5, y: 1608, lat: 45.501580327311395, lng: -122.60747230138658  },
            { x: 1710, y: 1230, lat: 45.50275598013354, lng: -122.60744278116181 },
            { x: 685, y: 327, lat: 45.50565802270125, lng: -122.61210386372252 },
            { x: 3201, y: 2483, lat: 45.49878086221833, lng: -122.60075043228514 },
            { x: 2066, y: 793, lat: 45.50416316877892, lng: -122.60585572095987 },
            { x: 2563, y: 489, lat: 45.50510957953357, lng: -122.60360829125972 },
            { x: 701, y: 1758, lat: 45.501085257407006, lng: -122.61204860136078 },
            { x: 1700.32, y: 767.15, lat: 45.504230361926844, lng: -122.60753101363174},
            { x: 1977.24, y: 793.84, lat: 45.50412907956996, lng: -122.60626596589613},
            { x: 2937.03, y: 1051.21, lat: 45.503338740168346, lng: -122.60191204876772},
        ]
    }


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

        if(debug.drawRefPoints)  {
            drawReferencePoints();
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform to stop weird edge trails
        redrawScheduled = false;
    }

    function drawReferencePoints() {

        for (const referencePoint of referencePoints.franklin) {
            ctx.fillStyle = 'red'; 
            ctx.beginPath();
            ctx.arc(referencePoint.x, referencePoint.y, debug.refPointRadius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    function calculateTransformParameters(referencePoints) {
        if (referencePoints.length < 3) {
            console.error('Insufficient reference points for transformation calculation');
            return null;
        }

        const numPoints = referencePoints.length;
        let sumDx = 0;
        let sumDy = 0;
        let sumDLat = 0;
        let sumDLng = 0;

        for (let i = 1; i < numPoints; i++) {
            const referencePoint1 = referencePoints[i - 1];
            const referencePoint2 = referencePoints[i];

            sumDx += referencePoint2.x - referencePoint1.x;
            sumDy += referencePoint2.y - referencePoint1.y;
            sumDLat += referencePoint2.lat - referencePoint1.lat;
            sumDLng += referencePoint2.lng - referencePoint1.lng;
        }

        const xScaleFactor = sumDx / sumDLng;
        const yScaleFactor = sumDy / sumDLat;

        const translation = {
            x: referencePoints[0].x - referencePoints[0].lng * xScaleFactor,
            y: referencePoints[0].y - referencePoints[0].lat * yScaleFactor
        };

        return { xScaleFactor, yScaleFactor, translation };
    }


    function convertCanvasToCoordinates(mouseX, mouseY, transformParams) {
        const { xScaleFactor, yScaleFactor, translation } = transformParams;
        const lng = (mouseX - translation.x) / xScaleFactor;
        const lat = (mouseY - translation.y) / yScaleFactor;
        return { lat, lng };
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

        canvas.addEventListener('mousemove', handleMouseMove);

        function handleMouseMove(event) {
            // debug shit
            const rect = canvas.getBoundingClientRect();
            if (debug.mouseCoords) {
                const mouseX = (event.clientX - rect.left - translation.x) / scale;
                const mouseY = (event.clientY - rect.top - translation.y) / scale;

                console.log(`${mouseX.toFixed(2)}, ${mouseY.toFixed(2)}`);
            }

            if(debug.mouseLocation) {
                const mouseX = (event.clientX - rect.left) / scale - translation.x / scale;
                const mouseY = (event.clientY - rect.top) / scale - translation.y / scale;

                const transformParams = calculateTransformParameters(referencePoints.franklin);
                const { lat, lng } = convertCanvasToCoordinates(mouseX, mouseY, transformParams);

                console.log(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }

        }


        function startDrag(e) {
            $('#map-canvas').css('cursor', 'move')
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
            $('#map-canvas').css('cursor', 'auto')
            isDragging = false;
        }

        // zoomin
        function zoom(e) {
            const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
            // calc new scale
            const newScale = Math.max(navZoomMin, Math.min(navZoomMax, scale * scaleFactor));
            // const newScale = scale * scaleFactor
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

        $('#nav-location').on('click', e => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (geolocationPosition) => {
                        userCoords = {
                            lat: geolocationPosition.coords.latitude,
                            lng: geolocationPosition.coords.longitude,
                        };
                        alert(`You are at ${userCoords.lat}, ${userCoords.lng}`);
                        // update the map with the user's location
                        drawMap();
                    },
                    (error) => {
                        console.error(`Geolocation error: ${error.message}`);
                    }
                );
            }
        });

        drawMap(); // initial drawing
    };

    $('.debug-menu input[type="checkbox"]').change(function () {
        const checkboxId = $(this).parent().index(); 
        switch (checkboxId) {
            case 2:
                debug.drawRefPoints = $(this).prop('checked');
                drawMap();
                break;
            case 3:
                debug.mouseCoords = $(this).prop('checked');
                break;
            case 4:
                debug.mouseLocation = $(this).prop('checked');
                break;
        }
    });

    $('.debug-menu input[type="range"]').on('input', function () {
        var val = $(this).val()
        debug.refPointRadius = val;
        debug.drawRefPoints = true;
        $('#ref-points-toggle').prop("checked", true);
        $('#ref-point-size-display').html(Number(val).toFixed(1));
        drawMap();
    });

});


$(document).keydown(function(e) {
    if (e.key === '`' || e.key === '`') {
        $('.debug-menu').fadeToggle(200);
        $('#content-fade')    
    }
});