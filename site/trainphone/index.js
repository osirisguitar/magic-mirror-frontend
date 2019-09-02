'use strict';

let params = new URLSearchParams(location.search)
const givenName = params.get('givenname')
const familyName = params.get('familyname')
const userId = params.get('id')

document.getElementById('givenName').innerHTML = givenName
document.getElementById('familyName').innerHTML = familyName

document.getElementById('snap').addEventListener('click', () => {
  document.getElementById('cam').click();
});

const getOrientation = async (img) => {
  return new Promise((resolve, reject) => {
    let exif = EXIF.getData(img, function () {
      let orientation = EXIF.getAllTags(this).Orientation
      console.log(EXIF.getAllTags(this))

      document.getElementById('exif').innerText = 'Orientation: ' + orientation

      return resolve(orientation)
    })

    if (!exif) {
      return reject()
    }
  })
}

document.getElementById('cam').addEventListener('change', async e => {
  let image = e.target.files[0];
  let img = new Image()

  img.onload = async function () {
    let orientation = await getOrientation(img)

    URL.revokeObjectURL(this.src)
    let webcam = document.getElementById('webcamImage');
    let resizedWidth = this.width > this.height ? 400 : (this.width / this.height) * 400;
    let resizedHeight = this.width > this.height ? (this.height / this.width) * 400 : 400;
    let context = webcam.getContext('2d');

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, webcam.width, webcam.height)
    context.beginPath()
    context.translate(webcam.width / 2, webcam.height / 2)

    // iOS and Android both upload portrait photos rotated 90 degrees - but to different directions
    if (orientation === 6) {
      context.rotate(Math.PI / 2)
    } else if (orientation === 8) {
      context.rotate(-Math.PI / 2)
    }
    context.drawImage(this, -webcam.width / 2, -webcam.height / 2, resizedWidth, resizedHeight)
    context.translate(-webcam.width / 2, -webcam.height / 2)
    if (orientation === 6) {
      context.rotate(-Math.PI / 2)
    } else if (orientation === 8) {
      context.rotate(Math.PI / 2)
    }
    let imageData = webcam.toDataURL();

    let fetchOptions = {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, cors, *same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: userId, imagedata: imageData })
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
