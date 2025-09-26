import multer from 'multer'

// Hey, when someone uploads a file, save it to my disk (server storage), 
// and here’s how.
const storage = multer.diskStorage({
    // destination → where to store the file.
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },

//filename → what name to give the file. file → info about the uploaded file (mimetype, originalname, size, etc.).
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage})