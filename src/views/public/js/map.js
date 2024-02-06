$(document).ready(() => {
    const canvas = $('#map-canvas')[0];
    const ctx = canvas.getContext('2d');

    currentSchool = 'franklin';
    currentFloor = 1;
    currentBuilding = null;

    const map = new Image();
    map.src = `/maps/${currentSchool}/${currentSchool}Map.svg`;

    let scale = 1;
    let redrawScheduled = false;
    let translation = { x: 0, y: 0 };

    let userCoords = null;

    let focusedOnBuilding = false;

    const navZoomMin = 0.3;
    const navZoomMax = 3.0;

    const debug = {
        mouseCoords: false,
        mouseLocation: false,
        drawRefPoints: false,
        userCoords: false,
        refPointRadius: 2
    }

    // number of floors per building / position of svg
    const floors = {
        franklin: {
            franklin: {
                filename: 'franklin',
                floors: 3,
                position: {
                    x: 1434.58,
                    y: 1230.18
                }
            },
            gym: {
                filename: 'gym',
                floors: 3,
                position: {
                    x: 1975,
                    y: 793
                }
            },
            track: {
                filename: null,
                floors: 1,
                position: {
                    x: null,
                    y: null,
                }
            }
        },
        cleveland: {

        }

    }

    const homePositions = {
        franklin: {
            x: -75,
            y: -120,
            scale: 0.75
        }
    }

    const labelPositions = {
        franklin: {
            franklin: {
                x: -75,
                y: 150,
                scale: 1.5
            },
            gym: {
                x: 500,
                y: -1400,
                scale: 3
            },
            track: {
                x: -100,
                y: -700,
                scale: 2
            }
        }
    }

    let cursorState = {
        dragging: false,
        hovering: false
    }

    const labels = {
        franklin: [
            { id: "label-franklin", text: "Franklin", x: 1837, y: 1446, size: 50 },
            { id: "label-track", text: "Track", x: 1830, y: 948, size: 30 },
            { id: "label-gym", text: "Gym", x: 2023, y: 895, size: 30 },
        ]
    };

    const referencePoints = {
        franklin: [
            { x: 1646.21, y: 1230.18, lat: 45.502753693086014, lng: -122.60773267642072 },
            { x: 1709.40, y: 1607.79, lat: 45.501580327311395, lng: -122.60747230138658 },
            { x: 1711.15, y: 1230.39, lat: 45.50275598013354, lng: -122.60744278116181 },
            { x: 683.39, y: 327.56, lat: 45.50565802270125, lng: -122.61210386372252 },
            { x: 3200.98, y: 2483.79, lat: 45.49878086221833, lng: -122.60075043228514 },
            { x: 2066.50, y: 793.75, lat: 45.50416316877892, lng: -122.60585572095987 },
            { x: 2563.13, y: 489.38, lat: 45.50510957953357, lng: -122.60360829125972 },
            { x: 701.04, y: 1758.26, lat: 45.501085257407006, lng: -122.61204860136078 },
            { x: 1700.19, y: 766.95, lat: 45.504230361926844, lng: -122.60753101363174 },
            { x: 1977.18, y: 793.47, lat: 45.50412907956996, lng: -122.60626596589613 },
            { x: 2936.03, y: 1050.57, lat: 45.503338740168346, lng: -122.60191204876772 },
            { x: 1932.64, y: 1390.31, lat: 45.50223980847806, lng: -122.60643339865355 },
        ]
    }


    var updateUserCoords = false;

    var locationUpdateInterval = setInterval(updateUserLocation, 10000);

    function updateUserLocation() {
        if (!updateUserCoords) {
            return;
        }
        navigator.geolocation.getCurrentPosition(
            function (position) {
                var userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                if (debug.userCoords) {
                    console.log('User location:', userLocation);
                }

                userCoords = userLocation;
                updateCoords(userLocation)
                drawMap();
            },
            function (error) {
                console.error('Error getting user location:', error.message);
            }
        );
    }

    if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' })
            .then(permissionStatus => {
                if (permissionStatus.state === 'granted') {
                    // user has already given access to their location
                    navigator.geolocation.getCurrentPosition(
                        function (position) {
                            var userLocation = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };

                            // userLocation = {
                            //     lat: 45.502204, 
                            //     lng: -122.606125
                            // } // coords to test with, ignore dis
                            updateUserCoords = true;
                            userCoords = userLocation;
                            drawMap();
                        },
                        function (error) {
                            console.error('Error getting user location:', error.message);
                        }
                    );
                } else if (permissionStatus.state === 'prompt') {
                    // console.log('location permission prompt not answered yet');
                } else {
                    // console.log('location permission denied');
                }
            })
            .catch(error => {
                console.error('Error checking location permission:', error.message);
            });
    } else {
        // geolocation permissions API is not supported by the browser
        console.error('Geolocation is not supported by this browser.');
    }

    // update canvas size to window size
    function updateCanvasSize(duration) {

        if (!duration) {
            duration = false;
        }

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let home = { x: 0, y: 0 };
        switch (currentSchool) {
            case 'franklin': {
                home.x = homePositions.franklin.x
                home.y = homePositions.franklin.y
                break
            }
        }
        // recalc translation to keep map centered
        goToPosition(home.x, home.y, scale, duration)
        scheduleRedraw();
    }

    function goToPosition(x, y, newScale, duration) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (duration) {
            // animated zoom with easing
            const initialScale = scale;
            const initialTranslationX = translation.x;
            const initialTranslationY = translation.y;
            const targetTranslationX = (canvas.width / 2) - ((newScale * map.width) / 2) - x;
            const targetTranslationY = (canvas.height / 2) - ((newScale * map.height) / 2) - y;
            let startTime;

            function easeOut(t) {
                return 1 - Math.pow(1 - t, 3); // cubic ease-out
            }

            function animateZoom(timestamp) {
                if (!startTime) startTime = timestamp;

                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOut(progress);

                scale = initialScale + (newScale - initialScale) * easedProgress;
                translation.x = initialTranslationX + (targetTranslationX - initialTranslationX) * easedProgress;
                translation.y = initialTranslationY + (targetTranslationY - initialTranslationY) * easedProgress;

                scheduleRedraw();

                // continue animation if not finished
                if (progress < 1) {
                    requestAnimationFrame(animateZoom);
                }
            }

            requestAnimationFrame(animateZoom);
        } else {
            scale = newScale;
            translation = {
                x: (canvas.width / 2) - ((scale * map.width) / 2) - x,
                y: (canvas.height / 2) - ((scale * map.height) / 2) - y
            };
            scheduleRedraw();
        }
    }

    // schedule redraw for smoother rendering
    function scheduleRedraw() {
        if (!redrawScheduled) {
            redrawScheduled = true;
            requestAnimationFrame(drawMap);
        }
    }

    window.addEventListener('resize', e => {
        updateCanvasSize(false)
    });

    // draw map on the canvas
    function drawMap() {
        // wipe canvas before rendering
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(scale, 0, 0, scale, translation.x, translation.y);
        ctx.drawImage(map, 0, 0, map.width, map.height);

        if(focusedOnBuilding) {
            var buildingX = currentBuilding.position.x;
            var buildingY = currentBuilding.position.y;

            if(currentBuilding.filename != null) {
                const floorMap = new Image();

                const url = `/maps/${currentSchool}/${currentBuilding.filename}/${currentBuilding.filename}${currentFloor}.svg`;

                floorMap.src = `/maps/${currentSchool}/${currentBuilding.filename}/${currentBuilding.filename}${currentFloor}.svg`;
                ctx.drawImage(floorMap, buildingX, buildingY);
            }
        }

        // render debug points
        if (debug.drawRefPoints) {
            drawReferencePoints();
        }

        // render labels
        renderLabels(ctx, labels);

        // render user position
        if (userCoords) {
            const transformParams = calculateTransformParameters(referencePoints.franklin);

            canvasCoords = convertCoordinatesToCanvas(userCoords.lat, userCoords.lng, transformParams)

            const outerDotSize = 15 / scale;
            ctx.fillStyle = 'rgba(66, 133, 250, 0.2)';
            ctx.beginPath();
            ctx.arc(canvasCoords.canvasX, canvasCoords.canvasY, outerDotSize, 0, 2 * Math.PI);
            ctx.fill();

            const borderDotSize = 7 / scale;
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(canvasCoords.canvasX, canvasCoords.canvasY, borderDotSize, 0, 2 * Math.PI);
            ctx.fill();

            const dotSize = 5 / scale;

            ctx.fillStyle = 'rgba(66, 133, 250, 1)';
            ctx.beginPath();
            ctx.arc(canvasCoords.canvasX, canvasCoords.canvasY, dotSize, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform to stop weird edge trails
        redrawScheduled = false;
    }

    function drawReferencePoints() {

        for (const referencePoint of referencePoints.franklin) {
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(referencePoint.x, referencePoint.y, debug.refPointRadius / scale, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    function renderLabels(ctx, labels) {
        if (!focusedOnBuilding) {
            ctx.fillStyle = "white";

            if (labels.hasOwnProperty(currentSchool)) {
                var currentLabels = labels[currentSchool];

                currentLabels.forEach(({ text, x, y, size }) => {
                    ctx.font = `${size}px monospace`;

                    const textWidth = ctx.measureText(text).width;
                    const centeredX = x - textWidth / 2;

                    ctx.fillText(text, centeredX, y);
                });
            } else {
                return null;
            }
        }
    }

    function getTextHeight(font) {
        const text = document.createElement('span');
        text.textContent = 'F';
        text.style.font = font;
        document.body.appendChild(text);
        const height = text.offsetHeight;
        document.body.removeChild(text);
        return height;
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

    function convertCoordinatesToCanvas(lat, lng, transformParams) {
        const { xScaleFactor, yScaleFactor, translation } = transformParams;
        const canvasX = (lng * xScaleFactor) + translation.x;
        const canvasY = (lat * yScaleFactor) + translation.y;
        return { canvasX, canvasY };
    }


    map.onload = () => {
        scale = homePositions.franklin.scale
        updateCanvasSize(); // set initial canvas size
        let isDragging = false;
        let startCoords = { x: 0, y: 0 };

        // pannin and zoomin
        canvas.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        canvas.addEventListener('wheel', zoom);

        canvas.addEventListener('mousemove', handleMouseMove);


        canvas.addEventListener("mousedown", function (e) {
            startDrag(e);

            labels[currentSchool].forEach(({ id, x, y, text }) => {
                const rect = canvas.getBoundingClientRect();
                const mouseX = (e.clientX - rect.left - translation.x) / scale;
                const mouseY = (e.clientY - rect.top - translation.y) / scale;

                const textWidth = ctx.measureText(text).width * 1.75;
                const textHeight = getTextHeight(ctx.font);

                const centeredX = x - textWidth / 2;

                if (mouseX > centeredX && mouseX < centeredX + textWidth && mouseY > y - textHeight && mouseY < y) {
                    labelName = id.replace(/^label-/, '');
                    currentBuilding = floors[currentSchool][labelName]
                    
                    // clamp to a floor that exists in this building
                    currentFloor = Math.min(currentFloor, currentBuilding.floors);

                    labelData = getLabelData(labelName)
                    setFocus(true);
                    goToPosition(labelData.x, labelData.y, labelData.scale, 400)
                }
            });
        });

        function getLabelData(schoolName) {
            if (labelPositions.franklin.hasOwnProperty(schoolName)) {
                var labelPosition = labelPositions.franklin[schoolName];
                return labelPosition;
            } else {
                return null;
            }
        }

        function hoveringLabel(e) {
            let somethingHovered = false
            if (labels.hasOwnProperty(currentSchool) && !focusedOnBuilding) {
                var currentLabels = labels[currentSchool];

                currentLabels.forEach(({ id, x, y, text }) => {
                    const rect = canvas.getBoundingClientRect();
                    const mouseX = (e.clientX - rect.left - translation.x) / scale;
                    const mouseY = (e.clientY - rect.top - translation.y) / scale;

                    const textWidth = ctx.measureText(text).width * 1.75;
                    const textHeight = getTextHeight(ctx.font);

                    const centeredX = x - textWidth / 2;

                    if (mouseX > centeredX && mouseX < centeredX + textWidth && mouseY > y - textHeight && mouseY < y) {
                        if (!somethingHovered) {
                            somethingHovered = true;
                        }
                    }
                });

            } else {
                return null;
            }

            cursorState.hovering = somethingHovered;
            return somethingHovered
        }

        function handleMouseMove(e) {
            if (hoveringLabel(e) && !focusedOnBuilding) {
                $('#map-canvas').css('cursor', 'pointer');
            }
            else {
                if (!cursorState.dragging) {
                    $('#map-canvas').css('cursor', 'auto');
                }
            }

            // debug shit
            const rect = canvas.getBoundingClientRect();
            if (debug.mouseCoords) {
                const mouseX = (e.clientX - rect.left - translation.x) / scale;
                const mouseY = (e.clientY - rect.top - translation.y) / scale;

                console.log(`${mouseX.toFixed(2)}, ${mouseY.toFixed(2)}`);
            }

            if (debug.mouseLocation) {
                const mouseX = (e.clientX - rect.left) / scale - translation.x / scale;
                const mouseY = (e.clientY - rect.top) / scale - translation.y / scale;

                const transformParams = calculateTransformParameters(referencePoints.franklin);
                const { lat, lng } = convertCanvasToCoordinates(mouseX, mouseY, transformParams);

                console.log(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }

        }

        function setFocus(focused) {
            if (focused != focusedOnBuilding) {
                focusedOnBuilding = focused;

                const selector = $('#floor-selector')
                selector.empty();
                for (var i = 0; i < currentBuilding.floors; i++) {
                    $('#floor-selector').append(`<div ${i == currentFloor - 1 ? 'class="selected-floor"' : ''}>${i+1}</div>`)
                }
                if(focused) {selector.fadeIn(200);}
                else {selector.fadeOut(100);}
            }
        }


        function startDrag(e) {
            cursorState.dragging = true;
            $('#map-canvas').css('cursor', 'grabbing')
            isDragging = true;
            startCoords = { x: e.clientX, y: e.clientY };
            scheduleRedraw();
        }

        function drag(e) {
            if (!isDragging) return;
            setFocus(false);
            const dx = e.clientX - startCoords.x;
            const dy = e.clientY - startCoords.y;
            translation.x += dx;
            translation.y += dy;
            startCoords = { x: e.clientX, y: e.clientY };
            scheduleRedraw();
        }

        function endDrag(e) {
            cursorState.dragging = false;
            if (cursorState.hovering && hoveringLabel(e) && !focusedOnBuilding) {
                $('#map-canvas').css('cursor', 'pointer')
            }
            else {
                $('#map-canvas').css('cursor', 'auto')
            }
            isDragging = false;
        }

        // zoomin
        function zoom(e) {
            const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
            // calc new scale
            // const newScale = Math.max(navZoomMin, Math.min(navZoomMax, scale * scaleFactor));
            const newScale = scale * scaleFactor
            // if (newScale < navZoomMin || newScale > navZoomMax) {
                // return; // do nothing at scale limits
            // }

            if (focusedOnBuilding) {
                setFocus(false)
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
            setFocus(false);
            scale = homePositions.franklin.scale
            updateCanvasSize(400);
            scheduleRedraw();
        });

        $('#nav-plus').on('click', e => {
            setFocus(false);
            const scaleFactor = 1.25;
            const cursor = { x: canvas.width / 2, y: canvas.height / 2 };
            const newScale = Math.max(navZoomMin, Math.min(navZoomMax, scale * scaleFactor));

            translation.x = cursor.x - (cursor.x - translation.x) * newScale / scale;
            translation.y = cursor.y - (cursor.y - translation.y) * newScale / scale;
            scale = newScale;

            scheduleRedraw();
        });

        $('#nav-minus').on('click', e => {
            setFocus(false);
            const scaleFactor = 0.75;
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
                        userLocation = {
                            lat: geolocationPosition.coords.latitude,
                            lng: geolocationPosition.coords.longitude,
                        };

                        // userLocation = {
                        //     lat: 45.502204, 
                        //     lng: -122.606125
                        // } // testing coords, ignore dis
                        updateUserCoords = true;
                        userCoords = userLocation;
                        updateCoords(userLocation);
                        drawMap();
                    },
                    (error) => {
                        if (error.code === error.PERMISSION_DENIED) {
                            pageError('You have disabled location services. Please enable them to use this feature.');
                        } else {
                            console.log(`Geolocation error: ${error.message}`);
                        }
                    }
                );
            } else {
                pageError('Geolocation is not supported by your browser.');
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
            case 5:
                debug.userCoords = $(this).prop('checked');
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

    $('#floor-selector').on('click', 'div', function(e) {
        $('#floor-selector div.selected-floor').removeClass('selected-floor');
        $(this).addClass('selected-floor');

        currentFloor = $(this).html() 
        console.log(currentFloor)
        drawMap();
    });

});


$(document).keydown(function (e) {
    if (e.key === '`' || e.key === '`') {
        $('.debug-menu').fadeToggle(100);
        // $('#content-fade').fadeToggle(100);
    }
});


function updateCoords(coords) {
    $('#debug-user-coords').html(`${coords.lat}, ${coords.lng}`)
}

var debugShit = `
      <h1>debug</h1>

      <h2>coords</h2>
      <div class="fv">
        <input id="ref-points-toggle" type="checkbox">
        <p>show reference points</p>
      </div>
      <div class="fv">
        <input type="checkbox">
        <p>log mouse coordinates</p>
      </div>
      <div class="fv">
        <input type="checkbox">
        <p>log mouse longitude/latitude</p>
      </div>
      <div class="fv">
        <input type="checkbox">
        <p>log user coords/latitude</p>
      </div>
      <div>
        <p>reference point size</p>
        <div class="fv">
          <input type="range" min="0.5" max="15" value="2" step="0.1">
          <p id="ref-point-size-display">2.0</p>
        </div>
      </div>
      <p id="debug-user-coords">user coords: null</p>`

$('.debug-menu').html(debugShit)

var floorSelector = `
<div>2</div>

`

$('#floor-selector').html(floorSelector);