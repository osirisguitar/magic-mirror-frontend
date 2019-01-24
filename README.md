# magic-mirror-frontend
Magic mirror info display with face recognition. A magic mirror (in this context) is a two-way mirror with a computer screen whose text shines through the mirror and is superimposed with the mirror image.

### Try it out
Go to http://localhost:5656/train.html to train faces (change name to train on multiple people). This will be converted to a mobile web page using stills from the mobile camera (since the mirror will have no way of accepting input from the user, other than showing a face to the camera)

Use http://localhost:5656 on the mirror itself. It will recognize trained faces and show their personal info (currently hard-coded to people named Anders or Johan). If no face can be recognized a guest view is shown.
