// "rgb(255, 255, 255)" → [255, 255, 255]
export default rgb => /[0-9,\s]+/g.exec(rgb)[0].split(',').map(v => +v)
