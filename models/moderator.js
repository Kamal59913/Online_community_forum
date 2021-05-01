const mongoose = require("mongoose");
const ModSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }
})
const Mod = mongoose.model("Mod", ModSchema);
module.exports = Mod