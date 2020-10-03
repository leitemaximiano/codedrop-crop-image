const photoFile = document.getElementById('photo-file');
const photoPreview = document.getElementById('photo-preview');
const selection = document.getElementById('selection-tool');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let image;
let photoName;


document.getElementById('select-image')
    .addEventListener('click', () => {
        photoFile.click();
    });

window.addEventListener('DOMContentLoaded', () => {
    photoFile.addEventListener('change', () => {
        let file = photoFile.files.item(0);
        photoName = file.name;

        let reader = new FileReader();
        reader.readAsDataURL(file);

        reader.addEventListener('load', (event) => {
            image = new Image();
            image.src = event.target.result;
            image.addEventListener('load', onLoadImage);
        });
    });
});



let startX, startY, relativeStartX, relativeStartY;
let endX, endY, relativeEndX, relativeEndY;
let startSelect = false;
const events = {
    mouseover () {
        this.style.cursor = 'crosshair';
    },
    mousedown () {
        const { clientX, clientY, offsetX, offsetY } = event;
        // console.table({
        //     'client': [clientX, clientY],
        //     'offset': [offsetX, offsetY]
        // });
        startX = clientX;
        startY = clientY;
        relativeStartX = offsetX;
        relativeStartY = offsetY;
        startSelect = true;
    },
    mousemove () {
        endX = event.clientX;
        endY = event.clientY;

        if (startSelect) {
            selection.style.display = 'initial';
    
            selection.style.top = startY+'px';
            selection.style.left = startX+'px';
    
            selection.style.width = (endX - startX) + 'px';
            selection.style.height = (endY - startY) + 'px';
        }

    },
    mouseup () {
        startSelect = false;
        relativeEndX = event.layerX;
        relativeEndY = event.layerY;

        cropButton.style.display = 'initial';
    }
};

Object.keys(events)
    .forEach( eventName => {
        photoPreview.addEventListener(eventName, events[eventName])
    })


function onLoadImage () {
    const { height, width } = image;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0);

    photoPreview.src = canvas.toDataURL();
}

const cropButton = document.getElementById('crop-image');

cropButton.addEventListener('click', () => {
    const { width: imgW, height: imgH } = image;
    const { width: previewW, height: previewH } = photoPreview;

    const [ widthFactor, heightFactor ] = [
        +( imgW / previewW ),
        +( imgH / previewH )
    ];

    const [ selectionWidth, selectionHeight ] = [
        +selection.style.width.replace('px', ''),
        +selection.style.height.replace('px', '')
    ];

    const [ croppedWidth, croppedHeight ] = [
        +( selectionWidth * widthFactor ),
        +( selectionHeight * heightFactor )
    ];

    const [ actualX, actualY ] = [
        +( relativeStartX * widthFactor ),
        +( relativeStartY * heightFactor )
    ];

    const croppedImage = ctx.getImageData(actualX, actualY, croppedWidth, croppedHeight);
    ctx.clearRect(0, 0, ctx.width, ctx.height);

    image.width = canvas.width = croppedWidth;
    image.height = canvas.height = croppedHeight

    ctx.putImageData(croppedImage, 0, 0);

    selection.style.display = 'none';
    photoPreview.src = canvas.toDataURL(); 
    downloadButton.style.display = 'initial';
});

const downloadButton = document.getElementById('download');
downloadButton.addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = photoName + 'cropped.png';
    a.href = canvas.toDataURL();
    a.click();
});