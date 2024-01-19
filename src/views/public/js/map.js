document.addEventListener('DOMContentLoaded', function() {
    const map = document.getElementById('map');
    const mapContent = document.getElementById('map-content');
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
    
        const containerRect = map.getBoundingClientRect();
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
    }
});