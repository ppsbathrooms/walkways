document.addEventListener('DOMContentLoaded', function() {
    const map = document.getElementById('map');
    const mapContent = document.getElementById('map-content');
    const testBuilding = document.getElementById('test-building');

    let isDragging = false;
    let offset = { x: 0, y: 0 };

    let currentTransform = { x: -910, y: -940, scale: 1 };
    updateTransform();
    
    mapContent.addEventListener('mousedown', startDragging);
    mapContent.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
    mapContent.addEventListener('wheel', zoom);

    function startDragging(e) {
        if ($('#map').css('cursor') !== 'grabbing') {
            $('#map').css('cursor', 'grabbing');
        }
        offset = {
            x: e.clientX - currentTransform.x,
            y: e.clientY - currentTransform.y
        };
        
        isDragging = true;        
    }

    function drag(e) {
        if (isDragging) {
            const x = e.clientX - offset.x;
            const y = e.clientY - offset.y;
            
            currentTransform = { x, y, scale: currentTransform.scale };

            updateTransform();
        }
    }

    function stopDragging() {
        $('#map').css('cursor', 'grab');
        isDragging = false;
    }

    function zoom(e) {
        e.preventDefault();
    
        const zoomSpeed = 0.1;
    
        const mouseX = e.clientX - window.innerWidth/2;
        const mouseY = e.clientY - window.innerHeight/2;
    
        let newScale = currentTransform.scale;
    
        if (e.deltaY < 0) {
            newScale += zoomSpeed;
        } else {
            newScale -= zoomSpeed;
        }
    
        newScale = Math.max(0.3, Math.min(5, newScale));
    
        currentTransform.x -= (mouseX - currentTransform.x) * (newScale - currentTransform.scale) / currentTransform.scale;
        currentTransform.y -= (mouseY - currentTransform.y) * (newScale - currentTransform.scale) / currentTransform.scale;
    
        currentTransform = { x: currentTransform.x, y: currentTransform.y, scale: newScale };
    
        updateTransform();
    }

    function updateTransform() {
        map.style.transform = `translate(${currentTransform.x}px, ${currentTransform.y}px) scale(${currentTransform.scale})`;
        updateBuildings();
    }

    function updateBuildings() {
        const area = calcScreenPercentage(testBuilding);
        if (area > 0.01)
            testBuilding.style.backgroundColor = '#ff0000';
        else 
            testBuilding.style.backgroundColor = '#000000';
    }

    // percentage of the screen taken up by a div
    function calcScreenPercentage(divElement) {
        // screen dimensions
        let viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        let viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        // kinda scuffed but seems to work so not gonna fuck with it

        let rect = divElement.getBoundingClientRect();

        let x1 = rect.x;
        let y1 = rect.y;

        let x2 = x1 + rect.width;
        let y2 = y1 + rect.height;

        // clamp to be in screen view
        x1 = clamp(x1, 0, viewportWidth);
        y1 = clamp(y1, 0, viewportHeight);
        x2 = clamp(x2, 0, viewportWidth);
        y2 = clamp(y2, 0, viewportHeight);

        let onScreenRectWidth = x2 - x1;
        let onScreenRectHeight = y2 - y1;

        // calc percentage
        let areaPercentage = ((onScreenRectWidth * onScreenRectHeight) / (viewportWidth * viewportHeight));
        return areaPercentage;
    }

    function clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    };
});