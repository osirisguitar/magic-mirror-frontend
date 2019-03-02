'use strict';

document.getElementById('snap').addEventListener('click', () => {
  document.getElementById('cam').click();
});

document.getElementById('cam').addEventListener('change', e => {
  let image = e.target.files[0];
  let img = new Image()

  img.onload = function () {
    URL.revokeObjectURL(this.src)
    let webcam = document.getElementById('webcamImage');
    let resizedWidth = this.width > this.height ? 400 : (this.width / this.height) * 400;
    let resizedHeight = this.width > this.height ? (this.height / this.width) * 400 : 400;
    let context = webcam.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, webcam.width, webcam.height)
    context.beginPath()
    context.translate(webcam.width / 2, webcam.height / 2)

    context.rotate(Math.PI / 2);
    context.drawImage(this, -webcam.width / 2, -webcam.height/2, resizedWidth, resizedHeight);
    context.translate(-webcam.width / 2, -webcam.height / 2);
    context.rotate(-Math.PI / 2);
    let imageData = webcam.toDataURL();

    let fetchOptions = {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, cors, *same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: document.getElementById('personName').value, imagedata: imageData })
    };

    return fetch('train', fetchOptions)
      .then(response => {
        return response.json();
      })
      .then(json => {
        return '/images/' + json.filename;
      });
  }

  img.src = URL.createObjectURL(image);
});