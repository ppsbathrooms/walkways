const map = document.getElementById('map');
const mapContent = document.getElementById('map-content');
const testBuilding = document.getElementById('test-building');

const zeroPos = {
    franklin: { x: -89, y: 187, scale: 0.5 }
}
const labels = [
    {
        map: 'franklin',
        name: 'franklin',
        position: { x: -20, y: 0, scale: 1 }
    },
    {
        map: 'franklin',
        name: 'atkinson',
        position: { x: -610, y: 982, scale: 1.2 }
    },
    {
        map: 'franklin',
        name: 'gym',
        position: { x: -287, y: 666, scale: 1.3 }
    }
]

let currentTransform = zeroPos.franklin;

const navZoomScale = 0.2;
const navZoomMin = 0.3;
const navZoomMax = 5;

document.addEventListener('DOMContentLoaded', function() {
    let isDragging = false;
    let offset = { x: 0, y: 0 };

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
    
        newScale = Math.max(navZoomMin, Math.min(navZoomMax, newScale));
    
        currentTransform.x -= (mouseX - currentTransform.x) * (newScale - currentTransform.scale) / currentTransform.scale;
        currentTransform.y -= (mouseY - currentTransform.y) * (newScale - currentTransform.scale) / currentTransform.scale;
    
        currentTransform = { x: currentTransform.x, y: currentTransform.y, scale: newScale };
    
        updateTransform();
    }
});

function updateTransform() {
    map.style.transform = `translate(${currentTransform.x}px, ${currentTransform.y}px) scale(${currentTransform.scale})`;
    updateBuildings();
}

function updateBuildings() {
    if(testBuilding) {
        const area = calcScreenPercentage(testBuilding);
        if (area > 0.01)
            testBuilding.style.backgroundColor = '#ff0000';
        else 
            testBuilding.style.backgroundColor = '#000000';
    }
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


$('#nav-home').on('click', e => {
    currentTransform = zeroPos.franklin;
    updateTransform();
})

$('#nav-plus').on('click', e => {
    currentTransform.scale = Math.max(navZoomMin, Math.min(navZoomMax, currentTransform.scale + navZoomScale));
    updateTransform();
})

$('#nav-minus').on('click', e => {
    currentTransform.scale = Math.max(navZoomMin, Math.min(navZoomMax, currentTransform.scale - navZoomScale));
    updateTransform();
})

labels.forEach((label) => {
    $(`#${label.map}-${label.name}-label`).on('click', e => {
        currentTransform = label.position;
        updateTransform();
    })
})
