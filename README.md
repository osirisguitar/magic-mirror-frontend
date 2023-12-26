# magic-mirror-frontend
Magic mirror info display with face recognition. A magic mirror (in this context) is a two-way mirror with a computer screen whose text shines through the mirror and is superimposed with the mirror image.

This repo is named frontend but is actually full stack.

### Try it out
Go to http://localhost:5656/phone to train faces. Requires Google account login.

Use http://localhost:5656 on the mirror itself. It will recognize trained faces and show their personal info (currently hard-coded to people named Anders or Johan). If no face can be recognized a guest view is shown.


### Kubernetes secret

