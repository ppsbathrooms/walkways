document.addEventListener('DOMContentLoaded', function() {
    const map = document.getElementById('map');
    const mapContent = document.getElementById('map-content');
    let isDragging = false;
    let offset = { x: 0, y: 0 };
    let currentTransform = { x: 0, y: 0 };

    mapContent.addEventListener('mousedown', startDragging);
    mapContent.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);

    function startDragging(e) {
        offset = {
            x: e.clientX - currentTransform.x,
            y: e.clientY -currentTransform.y
        };
        
        isDragging = true;        
    }

    function drag(e) {
        if (isDragging) {
            const x = e.clientX - offset.x
            const y = e.clientY - offset.y
            
            currentTransform = { x, y };

            map.style.transform = `translate(${currentTransform.x}px, ${currentTransform.y}px)`;
        }
    }

    function stopDragging() {
        isDragging = false;
    }
});